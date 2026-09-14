import {
  AreaId,
  Chest,
  DamageNumber,
  Direction,
  Item,
  Monster,
  NPC,
  Particle,
  PlayerStats,
  Portal,
  Projectile,
} from '../types';
import { PixelRenderer } from './pixelSprites';
import { WORLD_AREAS } from './worldData';
import { soundManager } from '../audio/soundManager';

export interface GameEngineCallbacks {
  onInteractNPC: (npc: NPC) => void;
  onAreaChange: (areaId: AreaId, areaName: string) => void;
  onPlayerDeath: () => void;
  onBossEncounter: (boss: Monster | null) => void;
  onBossDefeated: (bossType: string) => void;
  onQuestProgress: (monsterType: string) => void;
  onGainExp: (amount: number) => void;
  onGainCoin: (amount: number) => void;
  onLevelUpNotification: () => void;
}

export class GameEngine {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  private animFrameId: number | null = null;

  // World State
  public currentAreaId: AreaId = 'kingdom';
  public currentArea = WORLD_AREAS['kingdom'];
  public monsters: Monster[] = [];
  public npcs: NPC[] = [];
  public chests: Chest[] = [];
  public portals: Portal[] = [];
  public projectiles: Projectile[] = [];
  public particles: Particle[] = [];
  public damageNumbers: DamageNumber[] = [];

  // Player State
  public player = {
    x: 450,
    y: 400,
    width: 24,
    height: 28,
    speed: 3.2,
    facing: 'down' as Direction,
    state: 'idle' as 'idle' | 'walk' | 'attack' | 'hurt' | 'dead',
    attackTimer: 0,
    attackDuration: 14,
    hurtTimer: 0,
    dashTimer: 0,
    dashCooldown: 0,
    animFrame: 0,
  };

  // Virtual input & keys
  public keys: Record<string, boolean> = {};
  public virtualMovement = { dx: 0, dy: 0 };

  // Camera
  public camera = { x: 0, y: 0 };
  public screenShake = 0;

  // Callbacks
  private callbacks: GameEngineCallbacks;
  public playerStats: PlayerStats;

  // Transition
  public isTransitioning: boolean = false;
  public transitionAlpha: number = 0;

  // Pause State
  public isPaused: boolean = false;

  constructor(
    canvas: HTMLCanvasElement,
    playerStats: PlayerStats,
    callbacks: GameEngineCallbacks
  ) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Cannot get 2d context');
    this.ctx = context;
    this.playerStats = playerStats;
    this.callbacks = callbacks;

    this.loadArea('kingdom', 450, 480);
    this.setupInputs();
  }

  private setupInputs() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  public cleanup() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (this.isPaused) return;

    this.keys[e.key.toLowerCase()] = true;

    // Interaction with 'e'
    if (e.key.toLowerCase() === 'e') {
      this.tryInteract();
    }

    // Space to Attack
    if (e.code === 'Space') {
      e.preventDefault();
      this.playerAttack();
    }

    // Shift to Dash
    if (e.key === 'Shift') {
      this.playerDash();
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys[e.key.toLowerCase()] = false;
  };

  public loadArea(areaId: AreaId, spawnX: number, spawnY: number) {
    this.currentAreaId = areaId;
    this.currentArea = WORLD_AREAS[areaId];

    this.player.x = spawnX;
    this.player.y = spawnY;
    this.player.hurtTimer = 0;
    this.player.state = 'idle';

    // Copy static NPCs and Portals
    this.npcs = [...this.currentArea.npcs];
    this.portals = [...this.currentArea.portals];
    this.chests = this.currentArea.chests.map((c) => ({ ...c }));

    // Spawn monsters
    this.monsters = this.currentArea.monsterSpawns.map((s, idx) => ({
      id: `${s.type}_${idx}`,
      type: s.type,
      name: s.name,
      x: s.x,
      y: s.y,
      width: s.isBoss ? 48 : 28,
      height: s.isBoss ? 56 : 30,
      hp: s.hp,
      maxHp: s.hp,
      damage: s.damage,
      defense: s.defense,
      speed: s.speed,
      expReward: s.exp,
      coinReward: s.coin,
      isBoss: s.isBoss,
      bossTitle: s.bossTitle,
      attackCooldown: 30 + Math.random() * 40,
      attackRange: s.type === 'skeleton_archer' || s.type === 'dark_mage' ? 220 : (s.isBoss ? 60 : 36),
      state: 'idle',
      facing: 'down',
      animTimer: Math.random() * 10,
      hurtTimer: 0,
      specialTimer: 0,
    }));

    // Clear temp particles & projectiles
    this.projectiles = [];
    this.particles = [];
    this.damageNumbers = [];

    // Switch Audio
    soundManager.playMusic(this.currentArea.musicTrack);
    this.callbacks.onAreaChange(areaId, this.currentArea.name);

    // Fade in
    this.isTransitioning = true;
    this.transitionAlpha = 1.0;
  }

  public triggerAreaTransition(targetArea: AreaId, targetX: number, targetY: number) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    // Fade out to black then load
    const fadeOut = () => {
      this.transitionAlpha += 0.08;
      if (this.transitionAlpha >= 1) {
        this.loadArea(targetArea, targetX, targetY);
      } else {
        requestAnimationFrame(fadeOut);
      }
    };
    fadeOut();
  }

  // --- COMBAT & PLAYER ACTIONS ---

  public playerAttack() {
    if (this.player.attackTimer > 0 || this.player.state === 'dead') return;
    this.player.state = 'attack';
    this.player.attackTimer = this.player.attackDuration;
    soundManager.playAttack();

    // Determine attack hitbox center
    let hitX = this.player.x;
    let hitY = this.player.y;
    const reach = 34;

    if (this.player.facing === 'down') hitY += reach;
    else if (this.player.facing === 'up') hitY -= reach;
    else if (this.player.facing === 'left') hitX -= reach;
    else if (this.player.facing === 'right') hitX += reach;

    // Check hit on monsters
    const hitRadius = 38;
    let hasHit = false;

    this.monsters.forEach((m) => {
      if (m.hp <= 0) return;
      const dist = Math.hypot(m.x - hitX, m.y - hitY);
      if (dist < hitRadius + m.width / 2) {
        hasHit = true;
        // Calculate player damage
        const isCrit = Math.random() < 0.2; // 20% critical hit
        const baseDmg = this.playerStats.baseDamage + this.playerStats.equippedWeapon.value;
        const totalDmg = Math.max(
          5,
          Math.floor((baseDmg * (isCrit ? 1.7 : 1.0)) - m.defense * 0.5)
        );

        m.hp = Math.max(0, m.hp - totalDmg);
        m.hurtTimer = 12;
        m.state = 'hurt';

        // Knockback monster away from player
        const kx = (m.x - this.player.x) || 1;
        const ky = (m.y - this.player.y) || 1;
        const klen = Math.hypot(kx, ky);
        m.x += (kx / klen) * (m.isBoss ? 4 : 16);
        m.y += (ky / klen) * (m.isBoss ? 4 : 16);

        // Add damage number
        this.addDamageNumber(m.x, m.y - 15, totalDmg, isCrit, false);
        this.spawnHitParticles(m.x, m.y, isCrit ? '#fef08a' : '#ef4444');

        soundManager.playHit();
        this.screenShake = isCrit ? 6 : 3;

        // Check if monster died
        if (m.hp <= 0) {
          this.handleMonsterDeath(m);
        }
      }
    });

    if (hasHit) {
      this.spawnSlashParticles(hitX, hitY);
    }
  }

  public playerDash() {
    if (this.player.dashCooldown > 0 || this.player.state === 'dead') return;
    this.player.dashTimer = 10;
    this.player.dashCooldown = 35;
    this.player.hurtTimer = 14; // Invulnerable during dash
    soundManager.playDash();

    // Spawn dust particles
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: this.player.x + (Math.random() - 0.5) * 16,
        y: this.player.y + 10 + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 1.5,
        size: 3,
        color: '#cbd5e1',
        alpha: 0.8,
        life: 12,
        maxLife: 12,
      });
    }
  }

  private handleMonsterDeath(m: Monster) {
    m.state = 'dead';
    this.callbacks.onQuestProgress(m.type);
    this.callbacks.onGainExp(m.expReward);
    this.callbacks.onGainCoin(m.coinReward);

    // Death explosion particles
    for (let i = 0; i < 16; i++) {
      this.particles.push({
        x: m.x,
        y: m.y,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        size: Math.random() * 4 + 2,
        color: m.type.includes('slime') ? '#38bdf8' : (m.type.includes('demon') ? '#ef4444' : '#94a3b8'),
        alpha: 1.0,
        life: 20,
        maxLife: 20,
      });
    }

    soundManager.playCoin();

    // Check if Boss
    if (m.isBoss) {
      soundManager.playQuestClear();
      this.screenShake = 12;
      this.callbacks.onBossDefeated(m.type);
    }
  }

  public tryInteract() {
    // Check NPCs nearby
    const interactDist = 48;
    for (const npc of this.npcs) {
      const d = Math.hypot(npc.x - this.player.x, npc.y - this.player.y);
      if (d < interactDist) {
        this.callbacks.onInteractNPC(npc);
        return;
      }
    }

    // Check Chests nearby
    for (const chest of this.chests) {
      if (!chest.opened) {
        const d = Math.hypot(chest.x - this.player.x, chest.y - this.player.y);
        if (d < interactDist) {
          chest.opened = true;
          this.callbacks.onGainCoin(chest.coin);
          this.addDamageNumber(chest.x, chest.y - 15, chest.coin, false, false);
          soundManager.playChest();

          // Golden spark particles
          for (let i = 0; i < 14; i++) {
            this.particles.push({
              x: chest.x,
              y: chest.y,
              vx: (Math.random() - 0.5) * 4,
              vy: -Math.random() * 4,
              size: 3,
              color: '#fbbf24',
              alpha: 1,
              life: 25,
              maxLife: 25,
            });
          }
          return;
        }
      }
    }
  }

  public getNearbyInteractableLabel(): string | null {
    const interactDist = 48;
    for (const npc of this.npcs) {
      const d = Math.hypot(npc.x - this.player.x, npc.y - this.player.y);
      if (d < interactDist) {
        return `Bicara dengan ${npc.name} [E / Klik]`;
      }
    }
    for (const chest of this.chests) {
      if (!chest.opened) {
        const d = Math.hypot(chest.x - this.player.x, chest.y - this.player.y);
        if (d < interactDist) {
          return `Buka Peti Harta [E / Klik]`;
        }
      }
    }
    return null;
  }

  public addDamageNumber(x: number, y: number, damage: number, isCrit: boolean = false, isHeal: boolean = false) {
    this.damageNumbers.push({
      id: Math.random().toString(),
      x,
      y,
      damage,
      isCrit,
      isHeal,
      alpha: 1.0,
      vy: -1.8,
    });
  }

  private spawnHitParticles(x: number, y: number, color: string) {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        size: 2.5,
        color,
        alpha: 1,
        life: 14,
        maxLife: 14,
      });
    }
  }

  private spawnSlashParticles(x: number, y: number) {
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 12,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        size: 2,
        color: '#f8fafc',
        alpha: 0.9,
        life: 8,
        maxLife: 8,
      });
    }
  }

  // --- MAIN UPDATE & RENDER LOOP ---

  public startLoop() {
    const loop = () => {
      this.update();
      this.render();
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  private update() {
    if (this.isPaused) return;

    this.player.animFrame += 0.05;

    // Handle transition fade
    if (this.isTransitioning) {
      this.transitionAlpha -= 0.04;
      if (this.transitionAlpha <= 0) {
        this.transitionAlpha = 0;
        this.isTransitioning = false;
      }
    }

    // Shake dampening
    if (this.screenShake > 0) {
      this.screenShake *= 0.88;
      if (this.screenShake < 0.2) this.screenShake = 0;
    }

    // Timers
    if (this.player.attackTimer > 0) {
      this.player.attackTimer--;
      if (this.player.attackTimer === 0) {
        this.player.state = 'idle';
      }
    }
    if (this.player.hurtTimer > 0) this.player.hurtTimer--;
    if (this.player.dashCooldown > 0) this.player.dashCooldown--;
    if (this.player.dashTimer > 0) this.player.dashTimer--;

    // Movement if alive and not locked in attack
    if (this.player.state !== 'dead') {
      let dx = 0;
      let dy = 0;

      if (this.keys['w'] || this.keys['arrowup']) dy -= 1;
      if (this.keys['s'] || this.keys['arrowdown']) dy += 1;
      if (this.keys['a'] || this.keys['arrowleft']) dx -= 1;
      if (this.keys['d'] || this.keys['arrowright']) dx += 1;

      // Merge virtual touch movement
      if (this.virtualMovement.dx !== 0 || this.virtualMovement.dy !== 0) {
        dx = this.virtualMovement.dx;
        dy = this.virtualMovement.dy;
      }

      if (dx !== 0 || dy !== 0) {
        // Facing direction
        if (Math.abs(dx) > Math.abs(dy)) {
          this.player.facing = dx > 0 ? 'right' : 'left';
        } else {
          this.player.facing = dy > 0 ? 'down' : 'up';
        }

        const len = Math.hypot(dx, dy);
        const curSpeed = this.player.dashTimer > 0 ? this.player.speed * 2.2 : this.player.speed;
        this.player.x += (dx / len) * curSpeed;
        this.player.y += (dy / len) * curSpeed;

        if (this.player.state !== 'attack') {
          this.player.state = 'walk';
        }
      } else {
        if (this.player.state !== 'attack') {
          this.player.state = 'idle';
        }
      }

      // Constrain player inside world area
      const pad = 24;
      this.player.x = Math.max(pad, Math.min(this.currentArea.width - pad, this.player.x));
      this.player.y = Math.max(pad, Math.min(this.currentArea.height - pad, this.player.y));
    }

    // Check Portals collision
    for (const portal of this.portals) {
      if (
        Math.abs(this.player.x - portal.x) < portal.width / 2 + 10 &&
        Math.abs(this.player.y - portal.y) < portal.height / 2 + 10
      ) {
        this.triggerAreaTransition(portal.targetArea, portal.targetX, portal.targetY);
        break;
      }
    }

    // Update Monsters AI
    let nearestBoss: Monster | null = null;

    this.monsters.forEach((m) => {
      if (m.hp <= 0) return;

      m.animTimer += 0.05;
      if (m.hurtTimer > 0) m.hurtTimer--;

      const dist = Math.hypot(this.player.x - m.x, this.player.y - m.y);

      // Track active boss for UI
      if (m.isBoss && dist < 500) {
        nearestBoss = m;
      }

      // Facing
      m.facing = this.player.x > m.x ? 'right' : 'left';

      // Chase player if in detection range
      const detectRange = m.isBoss ? 450 : 220;
      if (dist < detectRange && this.player.state !== 'dead') {
        if (dist > m.attackRange) {
          m.state = 'chase';
          const vx = (this.player.x - m.x) / dist;
          const vy = (this.player.y - m.y) / dist;
          m.x += vx * m.speed;
          m.y += vy * m.speed;
        } else {
          // In attack range
          m.attackCooldown--;
          if (m.attackCooldown <= 0) {
            this.monsterAttack(m);
            m.attackCooldown = m.isBoss ? 40 : 55;
          }
        }
      } else {
        m.state = 'idle';
      }
    });

    this.callbacks.onBossEncounter(nearestBoss);

    // Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.lifetime--;

      // Check collision with player
      if (!p.fromPlayer && this.player.state !== 'dead') {
        const pd = Math.hypot(this.player.x - p.x, this.player.y - p.y);
        if (pd < p.radius + 14) {
          this.hitPlayer(p.damage);
          this.projectiles.splice(i, 1);
          continue;
        }
      }

      if (p.lifetime <= 0) {
        this.projectiles.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      pt.alpha = pt.life / pt.maxLife;
      if (pt.life <= 0) this.particles.splice(i, 1);
    }

    // Update Damage Numbers
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      const dn = this.damageNumbers[i];
      dn.y += dn.vy;
      dn.alpha -= 0.025;
      if (dn.alpha <= 0) this.damageNumbers.splice(i, 1);
    }

    // Smooth Camera Follow & Centering
    if (this.canvas.width >= this.currentArea.width) {
      // Center the map area horizontally if screen is wider than area
      this.camera.x = -(this.canvas.width - this.currentArea.width) / 2;
    } else {
      const targetCamX = this.player.x - this.canvas.width / 2;
      this.camera.x += (targetCamX - this.camera.x) * 0.1;
      this.camera.x = Math.max(0, Math.min(this.currentArea.width - this.canvas.width, this.camera.x));
    }

    if (this.canvas.height >= this.currentArea.height) {
      // Center the map area vertically if screen is taller than area
      this.camera.y = -(this.canvas.height - this.currentArea.height) / 2;
    } else {
      const targetCamY = this.player.y - this.canvas.height / 2;
      this.camera.y += (targetCamY - this.camera.y) * 0.1;
      this.camera.y = Math.max(0, Math.min(this.currentArea.height - this.canvas.height, this.camera.y));
    }
  }

  private monsterAttack(m: Monster) {
    if (this.player.state === 'dead') return;

    if (m.type === 'skeleton_archer') {
      // Fire piercing arrow
      const angle = Math.atan2(this.player.y - m.y, this.player.x - m.x);
      this.projectiles.push({
        id: Math.random().toString(),
        x: m.x,
        y: m.y,
        vx: Math.cos(angle) * 5,
        vy: Math.sin(angle) * 5,
        damage: m.damage,
        fromPlayer: false,
        type: 'arrow',
        radius: 6,
        lifetime: 60,
      });
      soundManager.playAttack();
    } else if (m.type === 'dark_mage') {
      // Dark magic projectile
      const angle = Math.atan2(this.player.y - m.y, this.player.x - m.x);
      this.projectiles.push({
        id: Math.random().toString(),
        x: m.x,
        y: m.y,
        vx: Math.cos(angle) * 3.8,
        vy: Math.sin(angle) * 3.8,
        damage: m.damage,
        fromPlayer: false,
        type: 'magic',
        radius: 8,
        lifetime: 75,
        color: '#c084fc',
      });
      soundManager.playMagic();
    } else if (m.type === 'demon_king') {
      // Demon King multi-pattern attacks!
      const pattern = Math.floor(Math.random() * 3);
      if (pattern === 0) {
        // Fireball spread (5 fireballs!)
        soundManager.playMagic();
        const baseAngle = Math.atan2(this.player.y - m.y, this.player.x - m.x);
        for (let i = -2; i <= 2; i++) {
          const a = baseAngle + i * 0.35;
          this.projectiles.push({
            id: Math.random().toString(),
            x: m.x,
            y: m.y,
            vx: Math.cos(a) * 4.2,
            vy: Math.sin(a) * 4.2,
            damage: m.damage,
            fromPlayer: false,
            type: 'fireball',
            radius: 10,
            lifetime: 80,
            color: '#ef4444',
          });
        }
      } else if (pattern === 1) {
        // Dark Shockwave Burst
        this.screenShake = 8;
        soundManager.playHit();
        const d = Math.hypot(this.player.x - m.x, this.player.y - m.y);
        if (d < 110) {
          this.hitPlayer(m.damage);
        }
      } else {
        // Melee Greatsword strike
        soundManager.playAttack();
        const d = Math.hypot(this.player.x - m.x, this.player.y - m.y);
        if (d < 70) {
          this.hitPlayer(m.damage);
        }
      }
    } else {
      // Standard melee strike
      const d = Math.hypot(this.player.x - m.x, this.player.y - m.y);
      if (d < 45) {
        soundManager.playAttack();
        this.hitPlayer(m.damage);
      }
    }
  }

  public hitPlayer(incomingDamage: number) {
    if (this.player.hurtTimer > 0 || this.player.state === 'dead') return;

    // Defense mitigates damage
    const totalDef = this.playerStats.baseDefense + this.playerStats.equippedArmor.value;
    const actualDmg = Math.max(3, Math.floor(incomingDamage - totalDef * 0.6));

    this.playerStats.hp = Math.max(0, this.playerStats.hp - actualDmg);
    this.player.hurtTimer = 22; // Invulnerability frames
    this.player.state = 'hurt';

    this.screenShake = 6;
    soundManager.playPlayerHurt();
    this.addDamageNumber(this.player.x, this.player.y - 18, actualDmg, false, false);
    this.spawnHitParticles(this.player.x, this.player.y, '#ef4444');

    if (this.playerStats.hp <= 0) {
      this.player.state = 'dead';
      soundManager.playDeath();
      this.callbacks.onPlayerDeath();
    }
  }

  private render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Clear Screen with Area ground fill
    ctx.fillStyle = this.currentArea.bgFill;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    // Camera translate with screen shake
    const shakeX = (Math.random() - 0.5) * this.screenShake;
    const shakeY = (Math.random() - 0.5) * this.screenShake;
    ctx.translate(Math.floor(-this.camera.x + shakeX), Math.floor(-this.camera.y + shakeY));

    // 1. Draw World Ground & Tiles - seamlessly fill visible camera view (guarantees NO black gaps or split)
    const viewLeft = Math.floor(this.camera.x) - 100;
    const viewTop = Math.floor(this.camera.y) - 100;
    const viewW = Math.ceil(w) + 200;
    const viewH = Math.ceil(h) + 200;
    ctx.fillStyle = this.currentArea.bgFill;
    ctx.fillRect(viewLeft, viewTop, viewW, viewH);

    // Decorative Ground Details
    this.renderEnvironmentDetails(ctx);

    // 2. Portals
    this.portals.forEach((p) => {
      PixelRenderer.drawPortal(ctx, p.x, p.y, this.player.animFrame, p.label);
    });

    // 3. Chests
    this.chests.forEach((c) => {
      PixelRenderer.drawChest(ctx, c.x, c.y, c.opened);
    });

    // 4. NPCs
    this.npcs.forEach((npc) => {
      PixelRenderer.drawNPC(ctx, npc.x, npc.y, npc.role, this.player.animFrame);

      // NPC Interaction "!" alert icon
      const d = Math.hypot(npc.x - this.player.x, npc.y - this.player.y);
      if (d < 70) {
        ctx.save();
        ctx.fillStyle = '#fef08a';
        ctx.font = "bold 12px 'Press Start 2P', monospace";
        ctx.textAlign = 'center';
        ctx.fillText('!', npc.x, npc.y - 32 + Math.sin(this.player.animFrame * 6) * 3);
        ctx.restore();
      }
    });

    // 5. Monsters
    this.monsters.forEach((m) => {
      if (m.hp <= 0) return;
      PixelRenderer.drawMonster(
        ctx,
        m.x,
        m.y,
        m.type,
        m.state,
        m.animTimer,
        m.hurtTimer,
        m.facing
      );

      // Monster Health Bar above head (if damaged or boss)
      if (m.hp < m.maxHp || m.isBoss) {
        const bw = m.isBoss ? 48 : 28;
        const bh = 4;
        const bx = m.x - bw / 2;
        const by = m.y - (m.isBoss ? 44 : 26);

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(bx, by, bw, bh);
        ctx.fillStyle = m.isBoss ? '#f59e0b' : '#22c55e';
        ctx.fillRect(bx, by, Math.max(0, (m.hp / m.maxHp) * bw), bh);
      }
    });

    // 6. Player Knight
    const weaponTier = this.playerStats.equippedWeapon.id === 'w_wood' ? 1 : (this.playerStats.equippedWeapon.id === 'w_iron' ? 2 : 3);
    PixelRenderer.drawPlayer(
      ctx,
      this.player.x,
      this.player.y,
      this.player.facing,
      this.player.state,
      this.player.animFrame,
      this.player.attackTimer > 0 ? (this.player.attackDuration - this.player.attackTimer) / this.player.attackDuration : 0,
      weaponTier
    );

    // 7. Projectiles
    this.projectiles.forEach((p) => {
      ctx.save();
      ctx.fillStyle = p.color || (p.type === 'arrow' ? '#cbd5e1' : '#f97316');
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 8. Particles
    this.particles.forEach((pt) => {
      ctx.save();
      ctx.globalAlpha = pt.alpha;
      ctx.fillStyle = pt.color;
      ctx.fillRect(Math.floor(pt.x), Math.floor(pt.y), pt.size, pt.size);
      ctx.restore();
    });

    // 9. Damage Numbers
    this.damageNumbers.forEach((dn) => {
      ctx.save();
      ctx.globalAlpha = dn.alpha;
      ctx.font = dn.isCrit ? "bold 12px 'Press Start 2P', monospace" : "10px 'Press Start 2P', monospace";
      ctx.textAlign = 'center';
      ctx.fillStyle = dn.isHeal ? '#4ade80' : (dn.isCrit ? '#fef08a' : '#ef4444');
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      const text = dn.isHeal ? `+${dn.damage}` : `-${dn.damage}${dn.isCrit ? '!' : ''}`;
      ctx.strokeText(text, dn.x, dn.y);
      ctx.fillText(text, dn.x, dn.y);
      ctx.restore();
    });

    ctx.restore();

    // 10. Area Transition Fade Overlay
    if (this.transitionAlpha > 0) {
      ctx.fillStyle = `rgba(0, 0, 0, ${this.transitionAlpha})`;
      ctx.fillRect(0, 0, w, h);
    }
  }

  private renderEnvironmentDetails(ctx: CanvasRenderingContext2D) {
    const area = this.currentAreaId;
    const f = this.player.animFrame;

    if (area === 'kingdom') {
      // Castle Walls enclosing the kingdom perimeter
      PixelRenderer.drawCastleWall(ctx, 40, 40, this.currentArea.width - 80, 20);
      PixelRenderer.drawCastleWall(ctx, 40, this.currentArea.height - 40, this.currentArea.width - 80, 20);
      // West boundary wall
      PixelRenderer.px(ctx, 40, 40, 20, this.currentArea.height - 80, '#334155');
      // East boundary wall with grand gatehouse opening for the forest portal
      PixelRenderer.px(ctx, this.currentArea.width - 60, 40, 20, 380, '#334155');
      PixelRenderer.px(ctx, this.currentArea.width - 60, 580, 20, this.currentArea.height - 620, '#334155');

      // Grand Cobblestone Main Avenue
      ctx.fillStyle = '#475569';
      ctx.fillRect(60, 450, this.currentArea.width - 120, 80);
      ctx.fillStyle = '#64748b';
      for (let cx = 80; cx < this.currentArea.width - 120; cx += 40) {
        ctx.fillRect(cx, 455, 18, 14);
        ctx.fillRect(cx + 20, 475, 16, 14);
        ctx.fillRect(cx + 8, 495, 18, 14);
      }
      // Avenue branches to Castle Keep & Market
      ctx.fillStyle = '#475569';
      ctx.fillRect(860, 160, 80, 290);
      ctx.fillRect(340, 530, 80, 220);

      // Castle Keep at top center
      PixelRenderer.drawCastleTower(ctx, 900, 130);

      // Royal Plaza Fountain
      PixelRenderer.drawFountain(ctx, 900, 500, f);

      // Houses & Shops with prominent labeled signboards
      PixelRenderer.drawHouse(ctx, 220, 220, 'TOKO SENJATA', '⚔️', '#3b82f6');
      PixelRenderer.drawHouse(ctx, 520, 220, 'TOKO ZIRAH', '🛡️', '#10b981');
      PixelRenderer.drawHouse(ctx, 220, 650, 'PANDAI BESI', '🔨', '#f59e0b');
      PixelRenderer.drawHouse(ctx, 520, 650, 'TOKO RAMUAN', '🧪', '#ec4899');

      // Crossroads Guide Post in Square (Center Plaza)
      ctx.save();
      ctx.fillStyle = '#451a03';
      ctx.fillRect(895, 375, 10, 45);
      ctx.fillStyle = '#78350f';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.fillRect(825, 380, 150, 15);
      ctx.strokeRect(825, 380, 150, 15);
      ctx.font = "bold 6px 'Press Start 2P', monospace";
      ctx.fillStyle = '#fef08a';
      ctx.textAlign = 'center';
      ctx.fillText('⬅ PASAR | GERBANG ➜', 900, 390);
      ctx.restore();

      // Royal Guard Training Barracks area (East district)
      PixelRenderer.px(ctx, 1300, 320, 16, 28, '#78350f'); // dummy 1
      PixelRenderer.px(ctx, 1296, 328, 24, 6, '#b45309');
      PixelRenderer.px(ctx, 1420, 320, 16, 28, '#78350f'); // dummy 2
      PixelRenderer.px(ctx, 1416, 328, 24, 6, '#b45309');

      // Castle Torches
      PixelRenderer.drawTorch(ctx, 820, 160, f);
      PixelRenderer.drawTorch(ctx, 980, 160, f);
      PixelRenderer.drawTorch(ctx, 840, 470, f);
      PixelRenderer.drawTorch(ctx, 960, 470, f);
      // Gate Torches
      PixelRenderer.drawTorch(ctx, 1680, 410, f);
      PixelRenderer.drawTorch(ctx, 1680, 560, f);
    } else if (area === 'green_forest') {
      // Sparkling river across middle
      PixelRenderer.drawWater(ctx, 1000, 0, 90, 1200, f);
      // Wooden bridge
      PixelRenderer.drawBridge(ctx, 990, 440, 110, 80);

      // Lush pine trees
      PixelRenderer.drawTree(ctx, 150, 180, false);
      PixelRenderer.drawTree(ctx, 220, 850, false);
      PixelRenderer.drawTree(ctx, 450, 220, false);
      PixelRenderer.drawTree(ctx, 650, 950, false);
      PixelRenderer.drawTree(ctx, 850, 180, false);
      PixelRenderer.drawTree(ctx, 1200, 250, false);
      PixelRenderer.drawTree(ctx, 1350, 920, false);
      PixelRenderer.drawTree(ctx, 1600, 220, false);
      PixelRenderer.drawTree(ctx, 1800, 850, false);
    } else if (area === 'dark_forest') {
      // Dark twisted trees
      PixelRenderer.drawTree(ctx, 150, 220, true);
      PixelRenderer.drawTree(ctx, 350, 850, true);
      PixelRenderer.drawTree(ctx, 600, 200, true);
      PixelRenderer.drawTree(ctx, 850, 800, true);
      PixelRenderer.drawTree(ctx, 1150, 240, true);
      PixelRenderer.drawTree(ctx, 1400, 850, true);
      PixelRenderer.drawTree(ctx, 1750, 260, true);

      // Dead gnarled trees
      PixelRenderer.drawDeadTree(ctx, 260, 520);
      PixelRenderer.drawDeadTree(ctx, 900, 460);
      PixelRenderer.drawDeadTree(ctx, 1550, 520);
    } else if (area === 'ruins') {
      // Ancient stone pillars & arches
      PixelRenderer.drawRuinPillar(ctx, 200, 280);
      PixelRenderer.drawRuinPillar(ctx, 200, 850);
      PixelRenderer.drawRuinPillar(ctx, 700, 220);
      PixelRenderer.drawRuinPillar(ctx, 700, 900);
      PixelRenderer.drawRuinPillar(ctx, 1200, 220);
      PixelRenderer.drawRuinPillar(ctx, 1200, 900);
      PixelRenderer.drawRuinPillar(ctx, 1700, 280);
      PixelRenderer.drawRuinPillar(ctx, 1700, 850);
    } else if (area === 'demon_territory') {
      // Molten lava rivers
      PixelRenderer.drawLava(ctx, 800, 0, 120, 1300, f);
      PixelRenderer.drawLava(ctx, 0, 950, 2200, 80, f);

      // Dead trees & demon skulls
      PixelRenderer.drawDeadTree(ctx, 250, 300);
      PixelRenderer.drawDeadTree(ctx, 450, 750);
      PixelRenderer.drawDeadTree(ctx, 1100, 300);
      PixelRenderer.drawDeadTree(ctx, 1450, 850);
      PixelRenderer.drawDeadTree(ctx, 1850, 300);
    } else if (area === 'demon_castle') {
      // Obsidian pillars and flaming braziers
      PixelRenderer.drawRuinPillar(ctx, 300, 320);
      PixelRenderer.drawRuinPillar(ctx, 300, 850);
      PixelRenderer.drawRuinPillar(ctx, 900, 320);
      PixelRenderer.drawRuinPillar(ctx, 900, 850);
      PixelRenderer.drawRuinPillar(ctx, 1500, 320);
      PixelRenderer.drawRuinPillar(ctx, 1500, 850);

      // Flaming demon torches
      PixelRenderer.drawTorch(ctx, 550, 350, f);
      PixelRenderer.drawTorch(ctx, 550, 800, f);
      PixelRenderer.drawTorch(ctx, 1200, 350, f);
      PixelRenderer.drawTorch(ctx, 1200, 800, f);
      PixelRenderer.drawTorch(ctx, 1750, 350, f);
      PixelRenderer.drawTorch(ctx, 1750, 800, f);

      // Crimson throne carpet leading to Demon King
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(150, 480, 1700, 80);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(150, 478, 1700, 3);
      ctx.fillRect(150, 559, 1700, 3);
    }
  }
}
