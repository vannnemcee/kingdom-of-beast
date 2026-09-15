// Procedural High-Detail Pixel Art Spriter for Knight of the Demon Kingdom
// All sprites are rendered with crisp pixel grid alignment.

import { Direction } from '../types';

export class PixelRenderer {
  // Helper to draw a pixel rectangle
  static px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
  }

  // --- PLAYER KNIGHT RENDERING ---
  static drawPlayer(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facing: Direction,
    state: 'idle' | 'walk' | 'attack' | 'hurt' | 'dead',
    animFrame: number,
    attackProgress: number = 0,
    weaponTier: number = 1
  ) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    // 1. Ground Drop Shadow (Soft oval pixel shadow)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 15, 10, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Handle dead state
    if (state === 'dead') {
      // Fallen knight with honor
      this.px(ctx, -14, 8, 28, 6, '#1e293b');
      this.px(ctx, -10, 4, 20, 6, '#475569');
      this.px(ctx, -16, 5, 8, 7, '#94a3b8'); // Helmet
      this.px(ctx, -19, 3, 5, 4, '#dc2626'); // Red plume
      this.px(ctx, -6, 2, 14, 5, '#1d4ed8'); // Blue tunic
      // Sword stuck heroically in ground
      this.px(ctx, 10, -8, 3, 18, '#cbd5e1');
      this.px(ctx, 11, -9, 1, 19, '#f8fafc');
      this.px(ctx, 7, -4, 9, 3, '#f59e0b');
      this.px(ctx, 9, 2, 5, 3, '#d97706');
      ctx.restore();
      return;
    }

    // Hurt flash
    if (state === 'hurt' && Math.floor(animFrame * 12) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // Walk bobbing and leg stride kinematics
    const isMoving = state === 'walk';
    const bob = isMoving ? Math.abs(Math.sin(animFrame * 10)) * 2 : 0;
    const stride = isMoving ? Math.sin(animFrame * 10) * 4 : 0;
    const capeWave = Math.sin(animFrame * 8) * 2.5;

    // Sword color profiles based on weapon tier
    const swordColors = [
      { blade: '#94a3b8', edge: '#cbd5e1', hilt: '#78350f', pommel: '#d97706', glow: '#cbd5e1' }, // Tier 1: Wooden/Training
      { blade: '#cbd5e1', edge: '#ffffff', hilt: '#334155', pommel: '#f59e0b', glow: '#93c5fd' }, // Tier 2: Polished Iron
      { blade: '#60a5fa', edge: '#e0f2fe', hilt: '#1e3a8a', pommel: '#fbbf24', glow: '#38bdf8' }, // Tier 3: Knight Blade
      { blade: '#fbbf24', edge: '#fef9c3', hilt: '#b45309', pommel: '#f59e0b', glow: '#fde047' }, // Tier 4: Royal / Demon Slayer
    ];
    const sc = swordColors[Math.min(weaponTier - 1, swordColors.length - 1)] || swordColors[1];

    // ==========================================
    // BACK VIEW (FACING UP)
    // ==========================================
    if (facing === 'up') {
      // 1. Cape fluttering across back (Royal Crimson with Gold Trim)
      this.px(ctx, -8, -5 + bob, 16, 17 + capeWave, '#991b1b'); // Dark red shadow
      this.px(ctx, -7, -4 + bob, 14, 15 + capeWave, '#dc2626'); // Main red cape
      this.px(ctx, -5, -3 + bob, 10, 13 + capeWave, '#ef4444'); // Highlight fold
      this.px(ctx, -7, 10 + bob + capeWave, 14, 2, '#fbbf24'); // Gold embroidered hem

      // 2. Greaves & Sabatons (Legs & Boots)
      this.px(ctx, -6, 10 + bob - stride, 5, 5, '#334155');
      this.px(ctx, -6, 13 + bob - stride, 5, 3, '#0f172a');
      this.px(ctx, 1, 10 + bob + stride, 5, 5, '#475569');
      this.px(ctx, 1, 13 + bob + stride, 5, 3, '#1e293b');

      // 3. Pauldrons (Shoulders)
      this.px(ctx, -10, -7 + bob, 4, 6, '#475569');
      this.px(ctx, -9, -6 + bob, 3, 4, '#64748b');
      this.px(ctx, 6, -7 + bob, 4, 6, '#475569');
      this.px(ctx, 6, -6 + bob, 3, 4, '#64748b');

      // 4. Back of Helmet
      this.px(ctx, -6, -17 + bob, 12, 11, '#334155'); // Shadow rim
      this.px(ctx, -5, -16 + bob, 10, 10, '#64748b'); // Steel dome
      this.px(ctx, -4, -15 + bob, 8, 8, '#94a3b8'); // Highlight
      this.px(ctx, -6, -9 + bob, 12, 3, '#475569'); // Neck plate / Gorget

      // 5. Crimson Plume
      this.px(ctx, -2, -22 + bob, 5, 6, '#ef4444');
      this.px(ctx, -1, -24 + bob, 4, 4, '#f87171');
      this.px(ctx, 1, -20 + bob, 3, 4, '#b91c1c');

      // 6. Shield / Weapon resting on back
      this.px(ctx, -9, -2 + bob, 4, 9, '#1d4ed8');
      this.px(ctx, 5, -5 + bob, 3, 14, sc.blade);
      this.px(ctx, 4, 2 + bob, 5, 2, sc.hilt);

      ctx.restore();
      return;
    }

    // ==========================================
    // SIDE VIEWS (FACING LEFT / RIGHT)
    // ==========================================
    if (facing === 'left' || facing === 'right') {
      if (facing === 'left') {
        ctx.scale(-1, 1);
      }

      // 1. Cape fluttering backward
      this.px(ctx, -9 - capeWave * 0.7, -4 + bob, 6, 14 + capeWave, '#991b1b');
      this.px(ctx, -8 - capeWave * 0.7, -3 + bob, 5, 12 + capeWave, '#dc2626');
      this.px(ctx, -8 - capeWave * 0.7, 9 + bob + capeWave, 5, 2, '#fbbf24'); // Gold trim

      // 2. Greaves & Sabatons (Stride)
      this.px(ctx, -4 + stride, 8 + bob, 4, 6, '#334155'); // Back leg
      this.px(ctx, -5 + stride, 13 + bob, 5, 3, '#0f172a');
      this.px(ctx, 1 - stride, 8 + bob, 5, 6, '#64748b'); // Front leg
      this.px(ctx, 2 - stride, 10 + bob, 3, 2, '#94a3b8'); // Knee poleyn highlight
      this.px(ctx, 1 - stride, 13 + bob, 6, 3, '#1e293b'); // Front sabaton boot

      // 3. Torso / Armor in Profile
      this.px(ctx, -5, -4 + bob, 10, 12, '#334155');
      this.px(ctx, -4, -3 + bob, 9, 10, '#64748b');
      this.px(ctx, -2, -2 + bob, 6, 8, '#94a3b8'); // Chest curve highlight
      this.px(ctx, -5, 5 + bob, 10, 2, '#b45309'); // Leather belt
      this.px(ctx, 0, 5 + bob, 3, 2, '#fbbf24'); // Gold belt buckle

      // 4. Knight Great Helmet (Side Profile)
      this.px(ctx, -5, -17 + bob, 12, 12, '#334155'); // Base shadow
      this.px(ctx, -4, -16 + bob, 11, 11, '#64748b'); // Steel body
      this.px(ctx, -2, -15 + bob, 7, 9, '#94a3b8'); // Highlight curve
      this.px(ctx, 1, -12 + bob, 7, 3, '#0f172a'); // Visor eye slit
      this.px(ctx, 3, -12 + bob, 2, 2, '#38bdf8'); // Glowing eye glint!

      // 5. Crimson Helmet Plume
      this.px(ctx, -4, -22 + bob, 5, 6, '#ef4444');
      this.px(ctx, -3, -24 + bob, 4, 4, '#f87171');
      this.px(ctx, -2, -19 + bob, 5, 3, '#b91c1c');

      // 6. Shield (Heater Shield raised in front)
      const shieldX = 2;
      this.px(ctx, shieldX, -2 + bob, 5, 11, '#1e3a8a'); // Shield base
      this.px(ctx, shieldX + 1, -1 + bob, 4, 9, '#1d4ed8'); // Royal blue field
      this.px(ctx, shieldX + 2, 1 + bob, 2, 5, '#fbbf24'); // Gold emblem
      this.px(ctx, shieldX + 1, -2 + bob, 4, 1, '#cbd5e1'); // Top silver rim
      this.px(ctx, shieldX, 8 + bob, 4, 2, '#1e293b'); // Bottom point

      // 7. Attack or Idle Sword
      if (state === 'attack') {
        const angle = -Math.PI * 0.4 + attackProgress * Math.PI * 0.95;
        ctx.save();
        ctx.translate(2, -1 + bob);
        ctx.rotate(angle);

        // Broadsword Blade with Fuller
        this.px(ctx, 1, -21, 4, 18, sc.blade);
        this.px(ctx, 2, -22, 2, 19, sc.edge);
        this.px(ctx, 2, -18, 1, 14, '#ffffff'); // Gleaming glint
        // Crossguard & Hilt
        this.px(ctx, -2, -4, 10, 3, sc.hilt);
        this.px(ctx, 2, -1, 2, 4, '#78350f');
        this.px(ctx, 1, 3, 4, 3, sc.pommel);

        ctx.restore();

        // Slash Arc Trail (Luminous crescent arc)
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = sc.glow;
        ctx.lineWidth = 4;
        ctx.arc(4, bob, 25, -0.65, 1.05);
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.arc(4, bob, 26, -0.45, 0.85);
        ctx.stroke();
        ctx.restore();
      } else {
        // Sheathed / Held Sword at side
        this.px(ctx, -6, 0 + bob, 3, 12, sc.blade);
        this.px(ctx, -5, -1 + bob, 1, 12, sc.edge);
        this.px(ctx, -8, 1 + bob, 6, 2, sc.hilt);
        this.px(ctx, -6, -2 + bob, 2, 3, '#78350f');
        this.px(ctx, -6, -3 + bob, 2, 2, sc.pommel);
      }

      ctx.restore();
      return;
    }

    // ==========================================
    // FRONT VIEW (FACING DOWN - DEFAULT)
    // ==========================================
    // 1. Cape peeking from behind both sides
    this.px(ctx, -9, -3 + bob, 4, 14 + capeWave, '#991b1b');
    this.px(ctx, -8, -2 + bob, 3, 12 + capeWave, '#dc2626');
    this.px(ctx, 6, -3 + bob, 4, 14 - capeWave, '#991b1b');
    this.px(ctx, 6, -2 + bob, 3, 12 - capeWave, '#dc2626');

    // 2. Greaves & Sabatons (Leg Armor)
    this.px(ctx, -5, 7 + bob - stride, 4, 6, '#334155');
    this.px(ctx, -4, 8 + bob - stride, 2, 3, '#94a3b8'); // Knee poleyn highlight
    this.px(ctx, -6, 12 + bob - stride, 5, 3, '#0f172a'); // Left sabaton boot
    this.px(ctx, 1, 7 + bob + stride, 4, 6, '#475569');
    this.px(ctx, 2, 8 + bob + stride, 2, 3, '#cbd5e1'); // Knee poleyn highlight
    this.px(ctx, 1, 12 + bob + stride, 5, 3, '#1e293b'); // Right sabaton boot

    // 3. Torso / Breastplate (Grand Cuirass)
    this.px(ctx, -7, -4 + bob, 14, 11, '#334155'); // Plate shadow base
    this.px(ctx, -6, -3 + bob, 12, 10, '#64748b'); // Steel plate
    this.px(ctx, -4, -2 + bob, 8, 8, '#94a3b8'); // Central chest ridge
    this.px(ctx, -1, -2 + bob, 2, 8, '#cbd5e1'); // Highlight keel
    // Royal Sapphire Crest with Gold Cross
    this.px(ctx, -3, -1 + bob, 6, 5, '#1d4ed8');
    this.px(ctx, -1, -1 + bob, 2, 5, '#fbbf24');
    this.px(ctx, -3, 1 + bob, 6, 1, '#fbbf24');
    // Leather Belt & Golden Buckle
    this.px(ctx, -6, 5 + bob, 12, 2, '#78350f');
    this.px(ctx, -2, 5 + bob, 4, 2, '#fbbf24');

    // 4. Pauldrons (Shoulder Plates with Gold Trimming)
    this.px(ctx, -10, -5 + bob, 4, 7, '#475569');
    this.px(ctx, -9, -4 + bob, 3, 5, '#94a3b8');
    this.px(ctx, -10, -6 + bob, 4, 2, '#f59e0b'); // Gold trim left
    this.px(ctx, 6, -5 + bob, 4, 7, '#475569');
    this.px(ctx, 6, -4 + bob, 3, 5, '#94a3b8');
    this.px(ctx, 6, -6 + bob, 4, 2, '#f59e0b'); // Gold trim right

    // 5. Great Helmet (Front View)
    this.px(ctx, -7, -17 + bob, 14, 12, '#334155'); // Helmet outline/shadow
    this.px(ctx, -6, -16 + bob, 12, 11, '#64748b'); // Steel body
    this.px(ctx, -4, -15 + bob, 8, 9, '#94a3b8'); // Dome highlight
    this.px(ctx, -2, -15 + bob, 4, 8, '#cbd5e1'); // Forehead reflection
    // Visor eye slit
    this.px(ctx, -5, -11 + bob, 10, 2, '#0f172a');
    this.px(ctx, -3, -11 + bob, 2, 2, '#38bdf8'); // Left glowing eye glint
    this.px(ctx, 1, -11 + bob, 2, 2, '#38bdf8'); // Right glowing eye glint

    // 6. Glorious Crimson Plume
    this.px(ctx, -2, -22 + bob, 5, 6, '#ef4444');
    this.px(ctx, -1, -24 + bob, 4, 4, '#f87171');
    this.px(ctx, 1, -20 + bob, 3, 4, '#b91c1c');

    // 7. Shield on Left Arm (Right side from viewer's perspective)
    this.px(ctx, -11, -1 + bob, 5, 11, '#1e3a8a');
    this.px(ctx, -10, 0 + bob, 3, 9, '#2563eb');
    this.px(ctx, -9, 2 + bob, 1, 5, '#fbbf24'); // Gold cross line
    this.px(ctx, -10, 3 + bob, 3, 1, '#fbbf24');
    this.px(ctx, -11, -2 + bob, 5, 1, '#cbd5e1'); // Silver top rim

    // 8. Sword on Right Arm
    if (state === 'attack') {
      const angle = -Math.PI * 0.35 + attackProgress * Math.PI * 0.95;
      ctx.save();
      ctx.translate(6, 1 + bob);
      ctx.rotate(angle);

      this.px(ctx, 0, -21, 4, 18, sc.blade);
      this.px(ctx, 1, -22, 2, 19, sc.edge);
      this.px(ctx, 1, -17, 1, 14, '#ffffff');
      this.px(ctx, -3, -4, 10, 3, sc.hilt);
      this.px(ctx, 1, -1, 2, 4, '#78350f');
      this.px(ctx, 0, 3, 4, 3, sc.pommel);

      ctx.restore();

      // Front slash arc
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = sc.glow;
      ctx.lineWidth = 4;
      ctx.arc(6, 2 + bob, 26, -0.6, 1.1);
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.arc(6, 2 + bob, 27, -0.4, 0.9);
      ctx.stroke();
      ctx.restore();
    } else {
      // Resting Sword in right hand
      this.px(ctx, 7, -2 + bob, 3, 13, sc.blade);
      this.px(ctx, 8, -3 + bob, 1, 13, sc.edge);
      this.px(ctx, 5, 2 + bob, 7, 2, sc.hilt);
      this.px(ctx, 7, 4 + bob, 2, 3, '#78350f');
      this.px(ctx, 7, 7 + bob, 2, 2, sc.pommel);
    }

    ctx.restore();
  }

  // --- NPC RENDERING ---
  static drawNPC(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    role: string,
    animFrame: number
  ) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));
    const bob = Math.sin(animFrame * 4) * 1.5;

    if (role === 'guard') {
      // Kingdom Guard in full armor with spear and royal tabard
      this.px(ctx, -5, 6 + bob, 4, 7, '#334155');
      this.px(ctx, 1, 6 + bob, 4, 7, '#334155');
      this.px(ctx, -6, -4 + bob, 12, 10, '#475569');
      this.px(ctx, -4, -3 + bob, 8, 8, '#2563eb'); // Blue tabard
      this.px(ctx, -2, -1 + bob, 4, 4, '#fbbf24'); // Royal insignia
      // Helmet with closed visor
      this.px(ctx, -6, -15 + bob, 12, 11, '#64748b');
      this.px(ctx, -4, -10 + bob, 8, 2, '#0f172a');
      this.px(ctx, -1, -19 + bob, 3, 4, '#2563eb'); // Blue plume
      // Long Guard Spear
      this.px(ctx, 8, -26 + bob, 2, 38, '#78350f'); // Wooden shaft
      this.px(ctx, 7, -30 + bob, 4, 6, '#cbd5e1'); // Spear head
      this.px(ctx, 8, -32 + bob, 2, 3, '#f8fafc'); // Sharp tip
    } else if (role === 'quest') {
      // Village Elder / Royal Quest Giver with robe and ancient scroll
      this.px(ctx, -6, 6 + bob, 12, 7, '#4338ca'); // Dark indigo robe
      this.px(ctx, -6, -4 + bob, 12, 10, '#6366f1'); // Indigo cloak
      this.px(ctx, -2, -4 + bob, 4, 10, '#fbbf24'); // Gold trim
      // Head with grey beard
      this.px(ctx, -5, -14 + bob, 10, 10, '#fde047');
      this.px(ctx, -5, -14 + bob, 10, 6, '#fed7aa'); // Face
      this.px(ctx, -3, -11 + bob, 2, 2, '#1e1b4b'); // Eye
      this.px(ctx, 1, -11 + bob, 2, 2, '#1e1b4b');
      this.px(ctx, -5, -8 + bob, 10, 6, '#e2e8f0'); // Long grey beard
      // Golden Crown circlet
      this.px(ctx, -6, -16 + bob, 12, 3, '#eab308');
      this.px(ctx, -1, -18 + bob, 2, 2, '#eab308');
      // Holding an ancient scroll
      this.px(ctx, 6, -2 + bob, 5, 8, '#fef3c7');
      this.px(ctx, 7, 0 + bob, 3, 4, '#d97706');
    } else if (role === 'blacksmith') {
      // Muscular Blacksmith with leather apron and warhammer
      this.px(ctx, -6, 6 + bob, 5, 7, '#1e293b');
      this.px(ctx, 1, 6 + bob, 5, 7, '#1e293b');
      this.px(ctx, -7, -4 + bob, 14, 10, '#ea580c'); // Red shirt
      this.px(ctx, -5, -2 + bob, 10, 9, '#78350f'); // Leather apron
      // Head with bandanna
      this.px(ctx, -5, -14 + bob, 10, 10, '#fed7aa');
      this.px(ctx, -6, -15 + bob, 12, 4, '#b91c1c'); // Red bandanna
      this.px(ctx, -3, -11 + bob, 2, 2, '#451a03');
      this.px(ctx, 1, -11 + bob, 2, 2, '#451a03');
      this.px(ctx, -4, -8 + bob, 8, 4, '#451a03'); // Brown bushy beard
      // Giant smith hammer
      this.px(ctx, 8, -14 + bob, 3, 22, '#78350f'); // Handle
      this.px(ctx, 5, -18 + bob, 9, 6, '#475569'); // Heavy iron head
      this.px(ctx, 6, -17 + bob, 7, 4, '#94a3b8');
      // Beside small anvil
      this.px(ctx, -16, 2, 8, 10, '#334155');
    } else if (role === 'weapon_shop' || role === 'armor_shop' || role === 'item_shop') {
      // Royal Merchant with fine clothing and trade backpack
      this.px(ctx, -5, 6 + bob, 4, 7, '#064e3b');
      this.px(ctx, 1, 6 + bob, 4, 7, '#064e3b');
      this.px(ctx, -6, -4 + bob, 12, 10, '#047857'); // Emerald merchant tunic
      this.px(ctx, -5, 4 + bob, 10, 2, '#d97706'); // Gold belt
      // Head with feathered merchant hat
      this.px(ctx, -5, -14 + bob, 10, 10, '#fed7aa');
      this.px(ctx, -7, -15 + bob, 14, 3, '#065f46');
      this.px(ctx, -5, -18 + bob, 10, 4, '#047857');
      this.px(ctx, 3, -21 + bob, 3, 5, '#f59e0b'); // Yellow feather
      this.px(ctx, -3, -11 + bob, 2, 2, '#064e3b');
      this.px(ctx, 1, -11 + bob, 2, 2, '#064e3b');
      // Bag of wares
      this.px(ctx, -10, -2 + bob, 5, 8, '#b45309');
    } else {
      // Cheerful Kingdom Villager
      this.px(ctx, -5, 6 + bob, 4, 7, '#374151');
      this.px(ctx, 1, 6 + bob, 4, 7, '#374151');
      this.px(ctx, -5, -4 + bob, 10, 10, '#d97706'); // Amber dress
      this.px(ctx, -4, -14 + bob, 8, 9, '#fed7aa');
      this.px(ctx, -5, -15 + bob, 10, 4, '#78350f'); // Brown hair
      this.px(ctx, -2, -11 + bob, 2, 2, '#1f2937');
      this.px(ctx, 2, -11 + bob, 2, 2, '#1f2937');
    }

    ctx.restore();
  }

  // --- MONSTER RENDERING ---
  static drawMonster(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    type: string,
    state: string,
    animFrame: number,
    hurtTimer: number,
    facing: Direction
  ) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    // Flash white when hurt
    if (hurtTimer > 0 && Math.floor(animFrame * 20) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    if (facing === 'left') {
      ctx.scale(-1, 1);
    }

    const bob = Math.sin(animFrame * 6) * 2;
    const squish = Math.sin(animFrame * 8) * 2;

    switch (type) {
      case 'slime': {
        // Classic blue bouncy slime
        this.px(ctx, -10 - squish, -3 + squish, 20 + squish * 2, 15 - squish, '#0284c7');
        this.px(ctx, -8 - squish, -5 + squish, 16 + squish * 2, 14 - squish, '#38bdf8');
        this.px(ctx, -4, -6 + squish, 8, 3, '#7dd3fc'); // Gel highlight
        // Cute menacing eyes
        this.px(ctx, -5, -1, 3, 3, '#0c4a6e');
        this.px(ctx, 2, -1, 3, 3, '#0c4a6e');
        this.px(ctx, -4, -1, 1, 1, '#ffffff');
        this.px(ctx, 3, -1, 1, 1, '#ffffff');
        break;
      }

      case 'green_slime': {
        // Spiky Green toxic slime
        this.px(ctx, -11 - squish, -4 + squish, 22 + squish * 2, 16 - squish, '#15803d');
        this.px(ctx, -9 - squish, -6 + squish, 18 + squish * 2, 14 - squish, '#22c55e');
        this.px(ctx, -5, -8 + squish, 10, 4, '#86efac');
        // Slime spikes
        this.px(ctx, -8, -9 + squish, 3, 4, '#22c55e');
        this.px(ctx, 5, -9 + squish, 3, 4, '#22c55e');
        // Eyes
        this.px(ctx, -5, -2, 3, 4, '#14532d');
        this.px(ctx, 2, -2, 3, 4, '#14532d');
        this.px(ctx, -4, -2, 1, 2, '#fef08a');
        this.px(ctx, 3, -2, 1, 2, '#fef08a');
        break;
      }

      case 'dark_slime': {
        // Deep purple shadowy slime
        this.px(ctx, -11 - squish, -4 + squish, 22 + squish * 2, 16 - squish, '#581c87');
        this.px(ctx, -9 - squish, -6 + squish, 18 + squish * 2, 14 - squish, '#7e22ce');
        this.px(ctx, -5, -8 + squish, 10, 4, '#c084fc');
        // Glowing red eyes
        this.px(ctx, -5, -2, 3, 3, '#ef4444');
        this.px(ctx, 2, -2, 3, 3, '#ef4444');
        this.px(ctx, -4, -2, 1, 1, '#fef08a');
        this.px(ctx, 3, -2, 1, 1, '#fef08a');
        break;
      }

      case 'bat': {
        // Flying purple bat with flapping wings
        const flap = Math.sin(animFrame * 16) * 6;
        // Body
        this.px(ctx, -5, -6 + bob, 10, 11, '#3b0764');
        this.px(ctx, -4, -5 + bob, 8, 8, '#581c87');
        // Red glowing eyes
        this.px(ctx, -3, -4 + bob, 2, 2, '#dc2626');
        this.px(ctx, 1, -4 + bob, 2, 2, '#dc2626');
        // Fangs
        this.px(ctx, -2, 0 + bob, 1, 2, '#ffffff');
        this.px(ctx, 1, 0 + bob, 1, 2, '#ffffff');
        // Ears
        this.px(ctx, -5, -10 + bob, 3, 4, '#581c87');
        this.px(ctx, 2, -10 + bob, 3, 4, '#581c87');
        // Wings flapping
        this.px(ctx, -16, -10 + bob - flap, 11, 8, '#6b21a8');
        this.px(ctx, 5, -10 + bob - flap, 11, 8, '#6b21a8');
        this.px(ctx, -13, -7 + bob - flap, 6, 3, '#9333ea');
        this.px(ctx, 7, -7 + bob - flap, 6, 3, '#9333ea');
        break;
      }

      case 'goblin': {
        // Green forest goblin with ragged club
        this.px(ctx, -5, 4 + bob, 4, 6, '#14532d');
        this.px(ctx, 1, 4 + bob, 4, 6, '#14532d');
        this.px(ctx, -6, -5 + bob, 12, 9, '#15803d');
        this.px(ctx, -4, 0 + bob, 8, 4, '#78350f'); // Ragged loincloth
        // Head with pointed ears
        this.px(ctx, -5, -14 + bob, 10, 9, '#22c55e');
        this.px(ctx, -9, -12 + bob, 4, 3, '#16a34a'); // Left ear
        this.px(ctx, 5, -12 + bob, 4, 3, '#16a34a'); // Right ear
        this.px(ctx, -3, -11 + bob, 2, 2, '#dc2626'); // Beady red eyes
        this.px(ctx, 1, -11 + bob, 2, 2, '#dc2626');
        this.px(ctx, -2, -7 + bob, 4, 2, '#fef08a'); // Teeth
        // Wooden spiked club
        this.px(ctx, 6, -12 + bob, 4, 16, '#78350f');
        this.px(ctx, 5, -15 + bob, 6, 7, '#b45309');
        this.px(ctx, 4, -13 + bob, 2, 2, '#cbd5e1'); // Spike
        this.px(ctx, 10, -11 + bob, 2, 2, '#cbd5e1'); // Spike
        break;
      }

      case 'goblin_warrior': {
        // Armored dark forest goblin with iron sword and wooden shield
        this.px(ctx, -5, 4 + bob, 4, 6, '#1e293b');
        this.px(ctx, 1, 4 + bob, 4, 6, '#1e293b');
        this.px(ctx, -6, -5 + bob, 12, 9, '#475569'); // Iron chestplate
        // Head with pointed ears & horned cap
        this.px(ctx, -5, -14 + bob, 10, 9, '#16a34a');
        this.px(ctx, -6, -16 + bob, 12, 4, '#334155'); // Helmet
        this.px(ctx, -3, -11 + bob, 2, 2, '#ef4444');
        this.px(ctx, 1, -11 + bob, 2, 2, '#ef4444');
        // Wooden shield
        this.px(ctx, -10, -3 + bob, 5, 9, '#92400e');
        // Iron sword
        this.px(ctx, 6, -14 + bob, 3, 16, '#cbd5e1');
        break;
      }

      case 'wolf': {
        // Ferocious Dire Wolf
        this.px(ctx, -14, -2 + bob, 22, 10, '#475569'); // Body
        this.px(ctx, -16, -6 + bob, 8, 8, '#334155'); // Tail
        // Legs
        this.px(ctx, -12, 6 + bob, 3, 6, '#334155');
        this.px(ctx, -6, 6 + bob, 3, 6, '#1e293b');
        this.px(ctx, 2, 6 + bob, 3, 6, '#334155');
        this.px(ctx, 6, 6 + bob, 3, 6, '#1e293b');
        // Head & Snout
        this.px(ctx, 8, -8 + bob, 10, 9, '#475569');
        this.px(ctx, 14, -4 + bob, 5, 5, '#64748b'); // Snout
        this.px(ctx, 16, -2 + bob, 3, 2, '#0f172a'); // Nose
        this.px(ctx, 13, -1 + bob, 3, 2, '#f8fafc'); // Fangs
        this.px(ctx, 8, -12 + bob, 3, 5, '#334155'); // Ears
        this.px(ctx, 11, -6 + bob, 2, 2, '#eab308'); // Yellow predator eye
        break;
      }

      case 'skeleton':
      case 'skeleton_archer':
      case 'skeleton_knight': {
        // Bony skeleton
        this.px(ctx, -4, 4 + bob, 3, 7, '#e2e8f0'); // Bone leg
        this.px(ctx, 1, 4 + bob, 3, 7, '#e2e8f0');
        // Ribcage
        this.px(ctx, -5, -4 + bob, 10, 8, '#cbd5e1');
        this.px(ctx, -3, -3 + bob, 6, 2, '#0f172a'); // Rib slits
        this.px(ctx, -3, 0 + bob, 6, 2, '#0f172a');
        // Skull
        this.px(ctx, -5, -14 + bob, 10, 9, '#f8fafc');
        this.px(ctx, -4, -11 + bob, 3, 3, '#0f172a'); // Hollow eye socket
        this.px(ctx, 1, -11 + bob, 3, 3, '#0f172a');
        this.px(ctx, -3, -6 + bob, 6, 2, '#475569'); // Teeth

        if (type === 'skeleton_archer') {
          // Hood and Bow
          this.px(ctx, -6, -16 + bob, 12, 4, '#3f3f46');
          // Bow
          this.px(ctx, 6, -14 + bob, 2, 18, '#854d0e');
          this.px(ctx, 7, -13 + bob, 4, 2, '#854d0e');
          this.px(ctx, 7, 3 + bob, 4, 2, '#854d0e');
          this.px(ctx, 10, -11 + bob, 1, 14, '#e2e8f0'); // Bowstring
        } else if (type === 'skeleton_knight') {
          // Horned skull helm and broadsword
          this.px(ctx, -6, -17 + bob, 12, 5, '#1e293b');
          this.px(ctx, -9, -19 + bob, 4, 3, '#d97706'); // Gold horn
          this.px(ctx, 5, -19 + bob, 4, 3, '#d97706');
          this.px(ctx, -6, -4 + bob, 12, 8, '#334155'); // Armor
          // Broadsword
          this.px(ctx, 6, -18 + bob, 4, 22, '#cbd5e1');
        } else {
          // Standard rusty sword
          this.px(ctx, 5, -12 + bob, 3, 16, '#94a3b8');
        }
        break;
      }

      case 'dark_mage': {
        // Crimson and violet cultist robes with skull staff
        this.px(ctx, -6, 4 + bob, 12, 8, '#4c0519'); // Robe skirt
        this.px(ctx, -7, -4 + bob, 14, 10, '#881337'); // Robe body
        // Deep shadow hood
        this.px(ctx, -6, -15 + bob, 12, 11, '#881337');
        this.px(ctx, -4, -13 + bob, 8, 8, '#0f172a'); // Shadow face
        this.px(ctx, -3, -10 + bob, 2, 2, '#f43f5e'); // Glowing pink eyes
        this.px(ctx, 1, -10 + bob, 2, 2, '#f43f5e');
        // Mage Staff with levitating dark orb
        this.px(ctx, 8, -16 + bob, 2, 26, '#3f3f46');
        this.px(ctx, 6, -20 + bob, 6, 5, '#e2e8f0'); // Staff skull top
        const orbGlow = Math.sin(animFrame * 10) * 2;
        this.px(ctx, 6 - orbGlow / 2, -26 + bob - orbGlow, 6 + orbGlow, 6 + orbGlow, '#a855f7'); // Magic orb
        break;
      }

      case 'demon': {
        // Red winged underworld demon
        this.px(ctx, -5, 6 + bob, 4, 8, '#7f1d1d');
        this.px(ctx, 1, 6 + bob, 4, 8, '#7f1d1d');
        this.px(ctx, -7, -4 + bob, 14, 11, '#b91c1c');
        this.px(ctx, -5, -2 + bob, 10, 8, '#dc2626');
        // Wings
        const wingFlap = Math.sin(animFrame * 10) * 3;
        this.px(ctx, -18, -14 + bob - wingFlap, 11, 14, '#450a0a');
        this.px(ctx, 7, -14 + bob - wingFlap, 11, 14, '#450a0a');
        // Demonic Head & Obsidian Horns
        this.px(ctx, -6, -15 + bob, 12, 11, '#ef4444');
        this.px(ctx, -8, -21 + bob, 4, 7, '#0f172a'); // Left horn
        this.px(ctx, 4, -21 + bob, 4, 7, '#0f172a'); // Right horn
        this.px(ctx, -4, -11 + bob, 2, 2, '#fef08a'); // Flaming eyes
        this.px(ctx, 2, -11 + bob, 2, 2, '#fef08a');
        this.px(ctx, -3, -7 + bob, 6, 3, '#450a0a'); // Fanged mouth
        // Trident
        this.px(ctx, 8, -18 + bob, 2, 28, '#0f172a');
        this.px(ctx, 6, -22 + bob, 6, 4, '#eab308');
        break;
      }

      // --- BOSSES ---

      case 'forest_guardian': {
        // (Mini Boss 1) Giant Ancient Treant / Forest Guardian
        const gScale = 1.8;
        ctx.scale(gScale, gScale);
        this.px(ctx, -10, 8 + bob, 8, 10, '#3f220d'); // Root legs
        this.px(ctx, 2, 8 + bob, 8, 10, '#3f220d');
        // Giant bark torso
        this.px(ctx, -14, -8 + bob, 28, 18, '#582f0e');
        this.px(ctx, -12, -6 + bob, 24, 14, '#7f4f24');
        this.px(ctx, -6, -4 + bob, 12, 10, '#15803d'); // Moss & foliage
        this.px(ctx, -4, -2 + bob, 8, 6, '#22c55e'); // Glowing emerald core rune
        // Head & Antler branches
        this.px(ctx, -10, -20 + bob, 20, 13, '#582f0e');
        this.px(ctx, -16, -28 + bob, 6, 12, '#3f220d'); // Branch horns
        this.px(ctx, 10, -28 + bob, 6, 12, '#3f220d');
        this.px(ctx, -7, -15 + bob, 4, 4, '#4ade80'); // Glowing green ancient eyes
        this.px(ctx, 3, -15 + bob, 4, 4, '#4ade80');
        // Wooden club arm
        this.px(ctx, 14, -10 + bob, 8, 22, '#3f220d');
        break;
      }

      case 'skeleton_king': {
        // (Boss 2) Giant Skeleton Monarch with Golden Crown & Soul Greatsword
        const skScale = 1.9;
        ctx.scale(skScale, skScale);
        // Royal purple cape
        this.px(ctx, -12, -8 + bob, 24, 22, '#581c87');
        // Bone structure
        this.px(ctx, -6, 6 + bob, 4, 10, '#e2e8f0');
        this.px(ctx, 2, 6 + bob, 4, 10, '#e2e8f0');
        this.px(ctx, -8, -6 + bob, 16, 13, '#334155'); // Dark ornate breastplate
        this.px(ctx, -6, -4 + bob, 12, 9, '#cbd5e1'); // Ribs
        // Massive crowned skull
        this.px(ctx, -7, -19 + bob, 14, 13, '#f8fafc');
        this.px(ctx, -5, -15 + bob, 3, 4, '#38bdf8'); // Soul cyan eyes
        this.px(ctx, 2, -15 + bob, 3, 4, '#38bdf8');
        // Royal Crown
        this.px(ctx, -8, -24 + bob, 16, 6, '#fbbf24');
        this.px(ctx, -6, -26 + bob, 3, 3, '#ef4444'); // Ruby gem
        this.px(ctx, 3, -26 + bob, 3, 3, '#ef4444');
        // Giant Greatsword
        this.px(ctx, 10, -26 + bob, 5, 34, '#94a3b8');
        this.px(ctx, 11, -27 + bob, 3, 34, '#f1f5f9');
        this.px(ctx, 8, -6 + bob, 9, 3, '#fbbf24');
        break;
      }

      case 'demon_general': {
        // (Boss 3) Demon General with fiery armor and battle axe
        const dgScale = 2.0;
        ctx.scale(dgScale, dgScale);
        this.px(ctx, -7, 6 + bob, 5, 10, '#450a0a');
        this.px(ctx, 2, 6 + bob, 5, 10, '#450a0a');
        this.px(ctx, -10, -8 + bob, 20, 15, '#1e293b'); // Obsidian plate
        this.px(ctx, -8, -6 + bob, 16, 11, '#dc2626'); // Molten fiery center
        // Demon Helm & curved horns
        this.px(ctx, -8, -21 + bob, 16, 13, '#0f172a');
        this.px(ctx, -12, -26 + bob, 4, 8, '#b91c1c'); // Red horns
        this.px(ctx, 8, -26 + bob, 4, 8, '#b91c1c');
        this.px(ctx, -5, -16 + bob, 3, 3, '#fbbf24'); // Burning gaze
        this.px(ctx, 2, -16 + bob, 3, 3, '#fbbf24');
        // Double-headed magma battle axe
        this.px(ctx, 12, -24 + bob, 3, 36, '#475569'); // Axe shaft
        this.px(ctx, 7, -22 + bob, 13, 10, '#ea580c'); // Magma blade
        this.px(ctx, 8, -20 + bob, 11, 6, '#fef08a');
        break;
      }

      case 'demon_king': {
        // (FINAL BOSS) Imposing Demon King
        const dkScale = 2.5;
        ctx.scale(dkScale, dkScale);

        // Huge Bat Wings
        const wingFlap = Math.sin(animFrame * 8) * 4;
        this.px(ctx, -26, -20 + bob - wingFlap, 16, 26, '#260404');
        this.px(ctx, 10, -20 + bob - wingFlap, 16, 26, '#260404');
        this.px(ctx, -24, -18 + bob - wingFlap, 12, 10, '#7f1d1d');
        this.px(ctx, 12, -18 + bob - wingFlap, 12, 10, '#7f1d1d');

        // Demonic Royal Cloak (Crimson and gold)
        this.px(ctx, -12, -8 + bob, 24, 25, '#450a0a');
        this.px(ctx, -10, 14 + bob, 20, 4, '#eab308'); // Gold cape border

        // Heavy Molten Obsidian Armor
        this.px(ctx, -7, 8 + bob, 5, 10, '#0f172a');
        this.px(ctx, 2, 8 + bob, 5, 10, '#0f172a');
        this.px(ctx, -10, -8 + bob, 20, 17, '#1e1b4b');
        this.px(ctx, -8, -6 + bob, 16, 13, '#dc2626'); // Hellfire core
        this.px(ctx, -4, -3 + bob, 8, 7, '#fbbf24'); // Flaming sigil

        // Demon King Visage & Great Flaming Horns
        this.px(ctx, -8, -22 + bob, 16, 15, '#7f1d1d');
        this.px(ctx, -14, -32 + bob, 6, 12, '#0f172a'); // Massive horns
        this.px(ctx, 8, -32 + bob, 6, 12, '#0f172a');
        this.px(ctx, -12, -30 + bob, 3, 8, '#ef4444'); // Horn flames
        this.px(ctx, 9, -30 + bob, 3, 8, '#ef4444');
        // Blazing Hell Eyes
        this.px(ctx, -5, -17 + bob, 3, 3, '#fef08a');
        this.px(ctx, 2, -17 + bob, 3, 3, '#fef08a');
        this.px(ctx, -4, -12 + bob, 8, 3, '#180202'); // Fangs

        // Demonic Greatsword with dark energy aura
        this.px(ctx, 12, -32 + bob, 5, 42, '#0f172a');
        this.px(ctx, 13, -30 + bob, 3, 38, '#ef4444');
        this.px(ctx, 10, -10 + bob, 9, 4, '#f59e0b');
        break;
      }
    }

    ctx.restore();
  }

  // --- ENVIRONMENT TILES & PROPS ---

  static drawTree(ctx: CanvasRenderingContext2D, x: number, y: number, dark: boolean = false) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));
    // Trunk
    this.px(ctx, -6, 6, 12, 18, dark ? '#292524' : '#78350f');
    this.px(ctx, -4, 8, 8, 14, dark ? '#1c1917' : '#582f0e');
    // Foliage (stacked pixel domes)
    if (dark) {
      this.px(ctx, -18, -18, 36, 26, '#1e1b4b');
      this.px(ctx, -14, -26, 28, 20, '#312e81');
      this.px(ctx, -10, -32, 20, 14, '#3730a3');
    } else {
      this.px(ctx, -20, -18, 40, 26, '#15803d');
      this.px(ctx, -16, -26, 32, 20, '#16a34a');
      this.px(ctx, -12, -34, 24, 16, '#22c55e');
      this.px(ctx, -6, -30, 8, 6, '#86efac'); // Leaf highlight
    }
    ctx.restore();
  }

  static drawDeadTree(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));
    // Gnarled dark trunk
    this.px(ctx, -5, 4, 10, 20, '#1c1917');
    this.px(ctx, -12, -10, 7, 8, '#292524');
    this.px(ctx, 5, -14, 8, 8, '#292524');
    this.px(ctx, -16, -20, 6, 6, '#1c1917');
    this.px(ctx, 9, -24, 6, 6, '#1c1917');
    ctx.restore();
  }

  static drawHouse(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    label?: string,
    icon?: string,
    accentColor: string = '#f59e0b'
  ) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    // Ground Shadow under house
    ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
    ctx.fillRect(-34, 20, 68, 8);

    // Stone Wall (Cobblestone masonry)
    this.px(ctx, -30, -12, 60, 36, '#475569');
    this.px(ctx, -28, -10, 56, 32, '#64748b');
    // Masonry details
    this.px(ctx, -26, -6, 12, 6, '#94a3b8');
    this.px(ctx, 14, -6, 12, 6, '#94a3b8');
    this.px(ctx, -8, 12, 16, 5, '#475569');
    this.px(ctx, 18, 10, 8, 8, '#94a3b8');

    // Roof (Terracotta shingles with overhang)
    this.px(ctx, -36, -26, 72, 16, '#7f1d1d');
    this.px(ctx, -34, -28, 68, 14, '#991b1b');
    this.px(ctx, -30, -34, 60, 8, '#b91c1c');
    this.px(ctx, -24, -38, 48, 6, '#dc2626');
    this.px(ctx, -16, -40, 32, 4, '#ef4444'); // Ridge cap

    // Chimney on roof
    this.px(ctx, 18, -44, 10, 16, '#475569');
    this.px(ctx, 17, -46, 12, 4, '#334155');

    // Wooden Door
    this.px(ctx, -8, 6, 16, 18, '#451a03');
    this.px(ctx, -6, 8, 12, 16, '#78350f');
    this.px(ctx, -4, 10, 8, 12, '#92400e');
    this.px(ctx, 3, 15, 2, 2, '#fbbf24'); // Golden doorknob

    // Windows with warm amber interior glow
    this.px(ctx, -24, -2, 12, 12, '#451a03');
    this.px(ctx, -23, -1, 10, 10, '#fef08a');
    this.px(ctx, -23, 3, 10, 2, '#78350f'); // Window cross
    this.px(ctx, -19, -1, 2, 10, '#78350f');

    this.px(ctx, 12, -2, 12, 12, '#451a03');
    this.px(ctx, 13, -1, 10, 10, '#fef08a');
    this.px(ctx, 13, 3, 10, 2, '#78350f');
    this.px(ctx, 17, -1, 2, 10, '#78350f');

    // --- PROMINENT SHOP SIGNBOARD ON ROOF ---
    if (label) {
      // 1. Two sturdy wooden support posts rising from the roof
      this.px(ctx, -30, -56, 5, 20, '#451a03');
      this.px(ctx, -29, -55, 3, 18, '#78350f');
      this.px(ctx, 25, -56, 5, 20, '#451a03');
      this.px(ctx, 26, -55, 3, 18, '#78350f');

      // 2. Large Signboard Panel
      const signW = 92;
      const signH = 20;
      const signX = -Math.floor(signW / 2);
      const signY = -66;

      // Dark shadow border
      this.px(ctx, signX - 2, signY - 2, signW + 4, signH + 4, '#0f172a');
      // Outer wood border
      this.px(ctx, signX - 1, signY - 1, signW + 2, signH + 2, '#78350f');
      // Inner wood plate
      this.px(ctx, signX, signY, signW, signH, '#451a03');
      // Warm wood grain
      this.px(ctx, signX + 2, signY + 2, signW - 4, signH - 4, '#291404');

      // Accent color top bar
      this.px(ctx, signX + 2, signY + 1, signW - 4, 2, accentColor);
      // Gold corner rivets
      this.px(ctx, signX, signY, 2, 2, '#fbbf24');
      this.px(ctx, signX + signW - 2, signY, 2, 2, '#fbbf24');
      this.px(ctx, signX, signY + signH - 2, 2, 2, '#fbbf24');
      this.px(ctx, signX + signW - 2, signY + signH - 2, 2, 2, '#fbbf24');

      // Hanging lanterns on left and right sides of signboard
      // Left Lantern
      this.px(ctx, signX - 5, signY + 4, 1, 4, '#0f172a'); // chain
      this.px(ctx, signX - 7, signY + 8, 5, 6, '#78350f');
      this.px(ctx, signX - 6, signY + 9, 3, 4, '#fef08a'); // glow
      // Right Lantern
      this.px(ctx, signX + signW + 4, signY + 4, 1, 4, '#0f172a');
      this.px(ctx, signX + signW + 2, signY + 8, 5, 6, '#78350f');
      this.px(ctx, signX + signW + 3, signY + 9, 3, 4, '#fef08a');

      // 3. Clear, High-Contrast Shop Text
      ctx.save();
      ctx.font = "bold 9px 'Press Start 2P', monospace";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const displayText = (icon ? `${icon} ` : '') + label;

      // Dark outline for legibility
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 3;
      ctx.strokeText(displayText, 0, signY + Math.floor(signH / 2));

      // Golden crisp text
      ctx.fillStyle = '#fef08a';
      ctx.fillText(displayText, 0, signY + Math.floor(signH / 2));
      ctx.restore();

      // 4. Shop Decorative Front Props
      if (label.includes('SENJATA')) {
        // Weapon barrel with practice swords outside
        this.px(ctx, -24, 12, 8, 11, '#78350f');
        this.px(ctx, -23, 7, 2, 10, '#cbd5e1'); // sword 1
        this.px(ctx, -20, 5, 2, 12, '#94a3b8'); // sword 2
      } else if (label.includes('ZIRAH')) {
        // Shield stand outside
        this.px(ctx, 16, 11, 2, 12, '#451a03');
        this.px(ctx, 14, 12, 6, 8, '#1d4ed8');
        this.px(ctx, 16, 14, 2, 4, '#fbbf24');
      } else if (label.includes('BESI')) {
        // Anvil outside
        this.px(ctx, -24, 16, 8, 6, '#334155');
        this.px(ctx, -26, 14, 12, 3, '#64748b');
        this.px(ctx, -20, 12, 4, 3, '#f59e0b'); // glowing hot ember
      } else if (label.includes('TABIB') || label.includes('RAMUAN')) {
        // Potion jars outside
        this.px(ctx, 16, 16, 4, 6, '#dc2626');
        this.px(ctx, 22, 16, 4, 6, '#22c55e');
      }
    }

    ctx.restore();
  }

  static drawCastleTower(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));
    // High stone wall
    this.px(ctx, -40, -40, 80, 70, '#475569');
    this.px(ctx, -36, -36, 72, 62, '#64748b');
    // Battlements / crenellations
    for (let i = -38; i < 38; i += 16) {
      this.px(ctx, i, -50, 10, 12, '#475569');
      this.px(ctx, i + 2, -48, 6, 10, '#64748b');
    }
    // Grand Gate Arch
    this.px(ctx, -16, -6, 32, 36, '#1e293b');
    this.px(ctx, -14, -4, 28, 34, '#0f172a');
    // Portcullis iron bars
    this.px(ctx, -10, 0, 20, 2, '#94a3b8');
    this.px(ctx, -10, 6, 20, 2, '#94a3b8');
    this.px(ctx, -6, -2, 2, 28, '#94a3b8');
    this.px(ctx, 4, -2, 2, 28, '#94a3b8');
    // Royal Banners (Blue & Gold)
    this.px(ctx, -30, -25, 8, 26, '#1d4ed8');
    this.px(ctx, -28, -23, 4, 18, '#fbbf24');
    this.px(ctx, 22, -25, 8, 26, '#1d4ed8');
    this.px(ctx, 24, -23, 4, 18, '#fbbf24');
    ctx.restore();
  }

  static drawFountain(ctx: CanvasRenderingContext2D, x: number, y: number, animFrame: number) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));
    // Outer stone basin
    this.px(ctx, -24, -12, 48, 24, '#334155');
    this.px(ctx, -22, -10, 44, 20, '#475569');
    this.px(ctx, -20, -8, 40, 16, '#0284c7'); // Water pool
    this.px(ctx, -18, -6, 36, 12, '#38bdf8'); // Water ripple
    // Center stone pillar
    this.px(ctx, -6, -20, 12, 16, '#64748b');
    this.px(ctx, -8, -24, 16, 5, '#475569');
    // Water jet
    const jet = Math.sin(animFrame * 12) * 3;
    this.px(ctx, -2, -32 + jet, 4, 8, '#bae6fd');
    this.px(ctx, -4, -28 + jet, 2, 4, '#e0f2fe');
    this.px(ctx, 2, -28 + jet, 2, 4, '#e0f2fe');
    ctx.restore();
  }

  static drawCastleWall(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    ctx.save();
    this.px(ctx, x, y, w, h, '#334155');
    this.px(ctx, x, y, w, 4, '#475569');
    this.px(ctx, x, y + h - 3, w, 3, '#1e293b');
    // Crenellations along top
    for (let bx = x; bx < x + w - 8; bx += 20) {
      this.px(ctx, bx, y - 8, 10, 8, '#475569');
      this.px(ctx, bx + 2, y - 6, 6, 6, '#64748b');
    }
    ctx.restore();
  }

  static drawChest(ctx: CanvasRenderingContext2D, x: number, y: number, opened: boolean) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));
    if (opened) {
      // Open chest
      this.px(ctx, -9, -2, 18, 12, '#78350f');
      this.px(ctx, -8, -1, 16, 10, '#b45309');
      this.px(ctx, -10, -10, 20, 8, '#78350f'); // Open lid tilted back
      this.px(ctx, -7, 0, 14, 4, '#fbbf24'); // Gold coins glimmering
    } else {
      // Closed chest
      this.px(ctx, -9, -7, 18, 14, '#78350f');
      this.px(ctx, -8, -6, 16, 12, '#92400e');
      // Gold trim & lock
      this.px(ctx, -9, -3, 18, 3, '#f59e0b');
      this.px(ctx, -2, -4, 4, 5, '#fbbf24');
      this.px(ctx, -1, -2, 2, 2, '#0f172a'); // Keyhole
    }
    ctx.restore();
  }

  static drawPortal(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    animFrame: number,
    label: string,
    areaWidth: number = 2000
  ) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    // 1. Ground Magical Rune Circle
    const runeGlow = 0.5 + Math.sin(animFrame * 5) * 0.25;
    ctx.save();
    ctx.fillStyle = `rgba(56, 189, 248, ${0.15 * runeGlow})`;
    ctx.beginPath();
    ctx.ellipse(0, 18, 30, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(129, 140, 248, ${0.6 * runeGlow})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // 2. Heavy Carved Stone Archway & Pillars
    // Left Pillar
    this.px(ctx, -24, 14, 12, 6, '#1e293b'); // Base foot
    this.px(ctx, -22, -26, 9, 40, '#334155'); // Pillar column
    this.px(ctx, -20, -24, 5, 36, '#475569'); // Pillar highlight
    // Right Pillar
    this.px(ctx, 12, 14, 12, 6, '#1e293b');
    this.px(ctx, 13, -26, 9, 40, '#334155');
    this.px(ctx, 15, -24, 5, 36, '#475569');
    // Carved Runic Markings on pillars (glowing cyan & gold)
    const runePulse = Math.sin(animFrame * 8);
    const runeColor = runePulse > 0 ? '#38bdf8' : '#818cf8';
    this.px(ctx, -19, -16, 3, 4, runeColor);
    this.px(ctx, -19, -4, 3, 4, runeColor);
    this.px(ctx, -19, 6, 3, 4, runeColor);
    this.px(ctx, 16, -16, 3, 4, runeColor);
    this.px(ctx, 16, -4, 3, 4, runeColor);
    this.px(ctx, 16, 6, 3, 4, runeColor);

    // Top Keystone Archway
    this.px(ctx, -26, -34, 52, 10, '#1e293b');
    this.px(ctx, -24, -32, 48, 7, '#475569');
    this.px(ctx, -22, -31, 44, 4, '#64748b');

    // Floating Magical Portal Apex Crystal
    const crystalBob = Math.sin(animFrame * 6) * 2;
    this.px(ctx, -4, -44 + crystalBob, 8, 10, '#0284c7');
    this.px(ctx, -3, -43 + crystalBob, 6, 8, '#38bdf8');
    this.px(ctx, -1, -41 + crystalBob, 2, 4, '#ffffff');

    // 3. Multilayered Swirling Magic Vortex
    const pulse = Math.sin(animFrame * 7) * 2.5;
    const colors = ['#0284c7', '#38bdf8', '#818cf8', '#a855f7', '#ec4899'];
    const activeColor = colors[Math.floor(animFrame * 3.5) % colors.length];

    // Outer cosmic aura
    ctx.save();
    const grad = ctx.createRadialGradient(0, -5, 2, 0, -5, 22 + pulse);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    grad.addColorStop(0.3, activeColor);
    grad.addColorStop(0.7, 'rgba(56, 189, 248, 0.4)');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, -4, 18 + pulse, 24 + pulse * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rotating orbiting magical sparks
    for (let i = 0; i < 4; i++) {
      const angle = animFrame * 4 + (i * Math.PI) / 2;
      const ox = Math.cos(angle) * (13 + Math.sin(animFrame * 3 + i) * 3);
      const oy = -5 + Math.sin(angle) * 16;
      ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#fef08a';
      ctx.beginPath();
      ctx.arc(ox, oy, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Inner bright core
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.ellipse(0, -4, 6, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 4. Upgraded Portal Floating UI Badge
    // Prevent text cutoff when portal is placed at left or right map edges!
    let badgeOffsetX = 0;
    if (x < 140) {
      badgeOffsetX = Math.min(100, 140 - x);
    } else if (x > areaWidth - 140) {
      badgeOffsetX = Math.max(-100, (areaWidth - 140) - x);
    }

    ctx.save();
    ctx.translate(badgeOffsetX, -52);

    // Format display label
    const cleanLabel = label.replace(/[▶◀]/g, '').trim();

    // Measure text width
    ctx.font = "bold 8px 'Press Start 2P', monospace";
    const textMetrics = ctx.measureText(cleanLabel);
    const boxW = Math.max(140, textMetrics.width + 24);
    const boxH = 26;
    const boxX = -boxW / 2;
    const boxY = -boxH / 2;

    // Badge Shadow & Slate Box
    this.px(ctx, boxX - 2, boxY - 2, boxW + 4, boxH + 4, '#020617');
    this.px(ctx, boxX - 1, boxY - 1, boxW + 2, boxH + 2, '#38bdf8'); // Glowing cyan border
    this.px(ctx, boxX, boxY, boxW, boxH, '#0f172a'); // Dark slate interior

    // Top subtle gold accent
    this.px(ctx, boxX + 2, boxY + 1, boxW - 4, 1, '#fef08a');

    // Header mini tag
    ctx.font = "7px 'Press Start 2P', monospace";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('🌀 GERBANG PORTAL', 0, boxY + 3);

    // Main label text
    ctx.font = "bold 8px 'Press Start 2P', monospace";
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = '#fef08a';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeText(cleanLabel, 0, boxY + boxH - 2);
    ctx.fillText(cleanLabel, 0, boxY + boxH - 2);

    ctx.restore();

    ctx.restore();
  }

  static drawDivineShield(ctx: CanvasRenderingContext2D, x: number, y: number, animFrame: number) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));
    const pulse = Math.sin(animFrame * 10) * 3;
    const shieldAngle = animFrame * 3;

    // Glowing protective sphere
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.globalAlpha = 0.8 + Math.sin(animFrame * 8) * 0.2;
    ctx.beginPath();
    ctx.arc(0, 0, 24 + pulse, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.fill();

    // Rotating celestial runes around barrier
    for (let i = 0; i < 3; i++) {
      const a = shieldAngle + (i * Math.PI * 2) / 3;
      const rx = Math.cos(a) * (24 + pulse);
      const ry = Math.sin(a) * (24 + pulse);
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(rx, ry, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    ctx.restore();
  }

  static drawHolyBeam(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    vx: number,
    vy: number,
    animFrame: number
  ) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));
    const angle = Math.atan2(vy, vx);
    ctx.rotate(angle);

    // Brilliant golden/white sword beam
    ctx.save();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(3, 0, 14, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Trailing light sparks
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-16 - i * 6, (Math.random() - 0.5) * 6, 4, 4);
    }
    ctx.restore();

    ctx.restore();
  }

  static drawRuinPillar(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));
    this.px(ctx, -8, -20, 16, 36, '#64748b');
    this.px(ctx, -6, -18, 12, 32, '#94a3b8');
    // Cracks & moss
    this.px(ctx, -2, -10, 4, 8, '#15803d');
    this.px(ctx, 1, 2, 4, 3, '#334155');
    this.px(ctx, -10, -24, 20, 5, '#475569'); // Pillar cap
    this.px(ctx, -10, 14, 20, 5, '#475569'); // Pillar base
    ctx.restore();
  }

  static drawTorch(ctx: CanvasRenderingContext2D, x: number, y: number, animFrame: number) {
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));
    // Sconce
    this.px(ctx, -2, 0, 4, 10, '#475569');
    // Flickering flame
    const f = Math.sin(animFrame * 14) * 1.5;
    this.px(ctx, -3, -8 + f, 6, 8, '#ea580c');
    this.px(ctx, -2, -7 + f, 4, 6, '#f97316');
    this.px(ctx, -1, -5 + f, 2, 3, '#fef08a');
    ctx.restore();
  }

  static drawLava(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, animFrame: number) {
    this.px(ctx, x, y, w, h, '#991b1b');
    // Molten lava bands
    const flow = (animFrame * 20) % 24;
    for (let ly = y; ly < y + h; ly += 8) {
      const col = (ly / 8) % 2 === 0 ? '#ea580c' : '#f97316';
      this.px(ctx, x + flow % w, ly, 16, 4, col);
      this.px(ctx, x + (flow + 30) % w, ly + 2, 8, 3, '#fef08a'); // Bubble
    }
  }

  static drawWater(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, animFrame: number) {
    this.px(ctx, x, y, w, h, '#0284c7');
    // Gentle water ripple lines
    const wave = (animFrame * 15) % 30;
    for (let wy = y; wy < y + h; wy += 10) {
      this.px(ctx, x + wave, wy, 14, 2, '#38bdf8');
      this.px(ctx, x + (wave + 20) % w, wy + 4, 10, 1.5, '#bae6fd');
    }
  }

  static drawBridge(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    // Wooden planks
    this.px(ctx, x, y, w, h, '#78350f');
    for (let py = y; py < y + h; py += 6) {
      this.px(ctx, x, py, w, 1, '#451a03'); // Plank gap
    }
    // Rails
    this.px(ctx, x, y, 4, h, '#92400e');
    this.px(ctx, x + w - 4, y, 4, h, '#92400e');
  }
}
