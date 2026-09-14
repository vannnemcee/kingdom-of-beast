import React, { useEffect, useRef, useState } from 'react';
import {
  AreaId,
  GameSettings,
  GameState,
  Item,
  Monster,
  NPC,
  PlayerStats,
  Quest,
} from './types';
import {
  INITIAL_ARMORS,
  INITIAL_PLAYER_STATS,
  INITIAL_QUESTS,
  INITIAL_WEAPONS,
  WORLD_AREAS,
} from './engine/worldData';
import { GameEngine } from './engine/gameEngine';
import { soundManager } from './audio/soundManager';
import { TitleScreen } from './components/TitleScreen';
import { GameUI } from './components/GameUI';
import { DialogModal } from './components/DialogModal';
import { ShopModal } from './components/ShopModal';
import { BlacksmithModal } from './components/BlacksmithModal';
import { InventoryModal } from './components/InventoryModal';
import { SettingsModal } from './components/SettingsModal';
import { EndingCutscene } from './components/EndingCutscene';
import { PauseModal } from './components/PauseModal';
import { PrologueModal } from './components/PrologueModal';

const SAVE_KEY = 'kotdk_savegame_v1';

export default function App() {
  // Navigation State
  const [gameState, setGameState] = useState<GameState>('title');

  // Player State
  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const completed = parsed.completedQuestIds || parsed.completedQuests || [];
        return {
          ...INITIAL_PLAYER_STATS,
          ...parsed,
          activeQuests: Array.isArray(parsed.activeQuests) ? parsed.activeQuests : INITIAL_PLAYER_STATS.activeQuests,
          completedQuestIds: completed,
          completedQuests: completed,
          inventory: Array.isArray(parsed.inventory) ? parsed.inventory : INITIAL_PLAYER_STATS.inventory,
          equippedWeapon: parsed.equippedWeapon || INITIAL_PLAYER_STATS.equippedWeapon,
          equippedArmor: parsed.equippedArmor || INITIAL_PLAYER_STATS.equippedArmor,
        };
      }
    } catch {
      // ignore
    }
    return {
      ...INITIAL_PLAYER_STATS,
      completedQuestIds: [],
      completedQuests: [],
    };
  });

  // Settings State
  const [settings, setSettings] = useState<GameSettings>({
    soundVolume: 0.8,
    musicVolume: 0.5,
    graphics: 'high',
    crtScanlines: true,
    vibration: false,
    fullscreen: false,
  });

  // Modals
  const [activeModal, setActiveModal] = useState<
    'none' | 'dialog' | 'shop' | 'blacksmith' | 'inventory' | 'settings' | 'pause' | 'prologue'
  >('none');
  const [dialogNPC, setDialogNPC] = useState<NPC | null>(null);
  const [shopType, setShopType] = useState<'weapon' | 'armor' | 'item'>('weapon');

  // In-Game UI states
  const [currentAreaId, setCurrentAreaId] = useState<AreaId>('kingdom');
  const [currentAreaName, setCurrentAreaName] = useState('Kingdom of Valoria');
  const [currentAreaSubtitle, setCurrentAreaSubtitle] = useState('Ibukota Kerajaan Manusia');
  const [activeBoss, setActiveBoss] = useState<Monster | null>(null);
  const [areaBannerText, setAreaBannerText] = useState<string | null>(null);
  const [levelUpToast, setLevelUpToast] = useState<string | null>(null);
  const [nearbyInteractable, setNearbyInteractable] = useState<string | null>(null);
  const [isDead, setIsDead] = useState(false);

  // Engine ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Check if saved game exists
  const hasSavedGame = Boolean(localStorage.getItem(SAVE_KEY));

  // Save game helper
  const saveGame = (statsToSave: PlayerStats) => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(statsToSave));
    } catch {
      // ignore
    }
  };

  // Start new game
  const handleStartGame = () => {
    const freshStats: PlayerStats = {
      ...INITIAL_PLAYER_STATS,
      activeQuests: [INITIAL_QUESTS[0]], // Start with the first quest
      completedQuestIds: [],
      completedQuests: [],
    };
    setPlayerStats(freshStats);
    saveGame(freshStats);
    setGameState('playing');
    setIsDead(false);
    // Show prologue/guide at start so the player is never lost
    setActiveModal('prologue');
  };

  // Load saved game
  const handleLoadGame = () => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const completed = parsed.completedQuestIds || parsed.completedQuests || [];
        const fullStats: PlayerStats = {
          ...INITIAL_PLAYER_STATS,
          ...parsed,
          activeQuests: Array.isArray(parsed.activeQuests) ? parsed.activeQuests : INITIAL_PLAYER_STATS.activeQuests,
          completedQuestIds: completed,
          completedQuests: completed,
          inventory: Array.isArray(parsed.inventory) ? parsed.inventory : INITIAL_PLAYER_STATS.inventory,
          equippedWeapon: parsed.equippedWeapon || INITIAL_PLAYER_STATS.equippedWeapon,
          equippedArmor: parsed.equippedArmor || INITIAL_PLAYER_STATS.equippedArmor,
        };
        setPlayerStats(fullStats);
        setGameState('playing');
        setIsDead(false);
        return;
      }
    } catch {
      // fallback
    }
    handleStartGame();
  };

  // Respawn after death
  const handleRespawn = () => {
    setPlayerStats((prev) => ({
      ...prev,
      hp: prev.maxHp,
    }));
    setIsDead(false);
    if (engineRef.current) {
      engineRef.current.playerStats.hp = playerStats.maxHp;
      engineRef.current.loadArea('kingdom', 450, 400);
    }
  };

  // Setup game engine when entering 'playing'
  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions to parent container
    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Instantiate engine
    const engine = new GameEngine(canvas, playerStats, {
      onInteractNPC: (npc) => {
        setDialogNPC(npc);
        setActiveModal('dialog');
      },
      onAreaChange: (areaId, areaName) => {
        setCurrentAreaId(areaId);
        setCurrentAreaName(areaName);
        setCurrentAreaSubtitle(WORLD_AREAS[areaId].subtitle);
        setAreaBannerText(areaName.toUpperCase());
        setTimeout(() => setAreaBannerText(null), 3000);
      },
      onPlayerDeath: () => {
        setIsDead(true);
      },
      onBossEncounter: (boss) => {
        setActiveBoss(boss);
      },
      onBossDefeated: (bossType) => {
        // If Demon King defeated -> Trigger Ending Cutscene!
        if (bossType === 'demon_king') {
          setTimeout(() => {
            setGameState('ending');
          }, 2000);
        }
      },
      onQuestProgress: (monsterType) => {
        setPlayerStats((prev) => {
          let updated = false;
          const updatedQuests = prev.activeQuests.map((q) => {
            if (!q.isCompleted && q.targetMonster === monsterType) {
              const newCount = q.currentCount + 1;
              const isCompleted = newCount >= q.targetCount;
              if (isCompleted) {
                soundManager.playQuestClear();
              }
              updated = true;
              return { ...q, currentCount: newCount, isCompleted };
            }
            return q;
          });

          if (updated) {
            const next = { ...prev, activeQuests: updatedQuests };
            saveGame(next);
            return next;
          }
          return prev;
        });
      },
      onGainExp: (amount) => {
        setPlayerStats((prev) => {
          let newExp = prev.exp + amount;
          let newLevel = prev.level;
          let newMaxExp = prev.maxExp;
          let newMaxHp = prev.maxHp;
          let newBaseDmg = prev.baseDamage;
          let newBaseDef = prev.baseDefense;
          let leveledUp = false;

          while (newExp >= newMaxExp) {
            newExp -= newMaxExp;
            newLevel++;
            newMaxExp = Math.floor(newMaxExp * 1.4);
            newMaxHp += 20;
            newBaseDmg += 3;
            newBaseDef += 2;
            leveledUp = true;
          }

          if (leveledUp) {
            soundManager.playLevelUp();
            setLevelUpToast(`LEVEL UP! LV ${newLevel} (+20 HP, +3 ATK, +2 DEF)`);
            setTimeout(() => setLevelUpToast(null), 3500);
          }

          const next = {
            ...prev,
            exp: newExp,
            level: newLevel,
            maxExp: newMaxExp,
            maxHp: newMaxHp,
            hp: leveledUp ? newMaxHp : prev.hp,
            baseDamage: newBaseDmg,
            baseDefense: newBaseDef,
          };
          saveGame(next);
          return next;
        });
      },
      onGainCoin: (amount) => {
        setPlayerStats((prev) => {
          const next = { ...prev, coin: prev.coin + amount };
          saveGame(next);
          return next;
        });
      },
      onLevelUpNotification: () => {
        // handled in onGainExp
      },
    });

    engineRef.current = engine;
    engine.startLoop();

    // Check interaction prompt every 200ms
    const promptInterval = setInterval(() => {
      if (engineRef.current) {
        setNearbyInteractable(engineRef.current.getNearbyInteractableLabel());
      }
    }, 200);

    return () => {
      clearInterval(promptInterval);
      window.removeEventListener('resize', updateSize);
      engine.cleanup();
    };
  }, [gameState]);

  // Keep engine's playerStats reference in sync
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.playerStats = playerStats;
    }
  }, [playerStats]);

  // Keep engine paused whenever a modal is open or player is dead
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.isPaused = activeModal !== 'none' || isDead;
    }
  }, [activeModal, isDead]);

  // Keyboard shortcut listener for HUD buttons & Pause Menu
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;

      // Inventory shortcut
      if (e.key.toLowerCase() === 'i') {
        setActiveModal((prev) => (prev === 'inventory' ? 'none' : 'inventory'));
      }
      // Potion shortcut
      if (e.key.toLowerCase() === 'q') {
        handleUsePotion();
      }
      // Pause Menu shortcuts (Escape or P or M)
      if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
        setActiveModal((prev) => (prev === 'none' ? 'pause' : 'none'));
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [gameState, playerStats, activeModal]);

  // Potion usage
  const handleUsePotion = () => {
    if (playerStats.potionCount <= 0 || playerStats.hp >= playerStats.maxHp) return;

    setPlayerStats((prev) => {
      const healAmount = 50;
      const newHp = Math.min(prev.maxHp, prev.hp + healAmount);
      const next = {
        ...prev,
        hp: newHp,
        potionCount: prev.potionCount - 1,
      };
      saveGame(next);
      return next;
    });

    soundManager.playHeal();
    if (engineRef.current) {
      engineRef.current.addDamageNumber(
        engineRef.current.player.x,
        engineRef.current.player.y - 20,
        50,
        false,
        true
      );
    }
  };

  // Quests logic
  const handleAcceptQuest = (quest: Quest) => {
    setPlayerStats((prev) => {
      const next = {
        ...prev,
        activeQuests: [...prev.activeQuests, quest],
      };
      saveGame(next);
      return next;
    });
  };

  const handleClaimQuestReward = (questId: string) => {
    setPlayerStats((prev) => {
      const targetQuest = prev.activeQuests.find((q) => q.id === questId);
      if (!targetQuest) return prev;

      soundManager.playQuestClear();
      const updatedActive = prev.activeQuests.filter((q) => q.id !== questId);
      const curCompleted = prev.completedQuestIds || prev.completedQuests || [];
      const updatedCompleted = curCompleted.includes(questId) ? curCompleted : [...curCompleted, questId];

      // Give reward
      let newCoin = prev.coin + targetQuest.rewardCoin;
      let newExp = prev.exp + targetQuest.rewardExp;
      let newLevel = prev.level;
      let newMaxExp = prev.maxExp;
      let newMaxHp = prev.maxHp;
      let newBaseDmg = prev.baseDamage;
      let newBaseDef = prev.baseDefense;

      while (newExp >= newMaxExp) {
        newExp -= newMaxExp;
        newLevel++;
        newMaxExp = Math.floor(newMaxExp * 1.4);
        newMaxHp += 20;
        newBaseDmg += 3;
        newBaseDef += 2;
      }

      const next: PlayerStats = {
        ...prev,
        coin: newCoin,
        exp: newExp,
        level: newLevel,
        maxExp: newMaxExp,
        maxHp: newMaxHp,
        baseDamage: newBaseDmg,
        baseDefense: newBaseDef,
        activeQuests: updatedActive,
        completedQuestIds: updatedCompleted,
        completedQuests: updatedCompleted,
      };
      saveGame(next);
      return next;
    });
  };

  // Equipment & Shop logic
  const handleBuyWeapon = (weapon: Item) => {
    setPlayerStats((prev) => {
      if (prev.coin < weapon.price) return prev;
      const newInventory = prev.inventory.some((i) => i.id === weapon.id)
        ? prev.inventory
        : [...prev.inventory, weapon];

      const next = {
        ...prev,
        coin: prev.coin - weapon.price,
        equippedWeapon: weapon,
        inventory: newInventory,
      };
      saveGame(next);
      return next;
    });
  };

  const handleBuyArmor = (armor: Item) => {
    setPlayerStats((prev) => {
      if (prev.coin < armor.price) return prev;
      const newInventory = prev.inventory.some((i) => i.id === armor.id)
        ? prev.inventory
        : [...prev.inventory, armor];

      const next = {
        ...prev,
        coin: prev.coin - armor.price,
        equippedArmor: armor,
        inventory: newInventory,
      };
      saveGame(next);
      return next;
    });
  };

  const handleBuyPotion = (potion: Item) => {
    setPlayerStats((prev) => {
      if (prev.coin < potion.price) return prev;
      const next = {
        ...prev,
        coin: prev.coin - potion.price,
        potionCount: prev.potionCount + 1,
      };
      saveGame(next);
      return next;
    });
  };

  const handleEquipWeapon = (weapon: Item) => {
    setPlayerStats((prev) => {
      const next = { ...prev, equippedWeapon: weapon };
      saveGame(next);
      return next;
    });
  };

  const handleEquipArmor = (armor: Item) => {
    setPlayerStats((prev) => {
      const next = { ...prev, equippedArmor: armor };
      saveGame(next);
      return next;
    });
  };

  // Blacksmith upgrades
  const handleUpgradeWeapon = () => {
    const curLvl = playerStats.equippedWeapon.upgradeLevel || 0;
    const cost = (curLvl + 1) * 60;
    if (playerStats.coin < cost) return;

    setPlayerStats((prev) => {
      const nextWeapon: Item = {
        ...prev.equippedWeapon,
        value: prev.equippedWeapon.value + 3,
        upgradeLevel: curLvl + 1,
      };
      const nextInventory = prev.inventory.map((i) =>
        i.id === nextWeapon.id ? nextWeapon : i
      );
      const next = {
        ...prev,
        coin: prev.coin - cost,
        equippedWeapon: nextWeapon,
        inventory: nextInventory,
      };
      saveGame(next);
      return next;
    });
  };

  const handleUpgradeArmor = () => {
    const curLvl = playerStats.equippedArmor.upgradeLevel || 0;
    const cost = (curLvl + 1) * 50;
    if (playerStats.coin < cost) return;

    setPlayerStats((prev) => {
      const nextArmor: Item = {
        ...prev.equippedArmor,
        value: prev.equippedArmor.value + 2,
        upgradeLevel: curLvl + 1,
      };
      const nextInventory = prev.inventory.map((i) =>
        i.id === nextArmor.id ? nextArmor : i
      );
      const next = {
        ...prev,
        coin: prev.coin - cost,
        equippedArmor: nextArmor,
        inventory: nextInventory,
      };
      saveGame(next);
      return next;
    });
  };

  // Determine available quest for NPC dialogue
  const getAvailableQuestForNpc = (npc: NPC | null): Quest | null => {
    if (!npc || npc.role !== 'quest') return null;
    const active = playerStats?.activeQuests || [];
    const completed = playerStats?.completedQuestIds || playerStats?.completedQuests || [];
    return (
      INITIAL_QUESTS.find(
        (q) =>
          !active.some((aq) => aq.id === q.id) &&
          !completed.includes(q.id)
      ) || null
    );
  };

  const getActiveQuestForNpc = (npc: NPC | null): Quest | null => {
    if (!npc || npc.role !== 'quest') return null;
    const active = playerStats?.activeQuests || [];
    return active.find((q) => !q.isClaimed) || null;
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-retro select-none">
      {/* CRT Scanline Effect (can be toggled in settings) */}
      {settings.crtScanlines && (
        <div className="scanlines pointer-events-none z-40 fixed inset-0 opacity-25" />
      )}

      {/* 1. TITLE SCREEN */}
      {gameState === 'title' && (
        <TitleScreen
          onStartGame={handleStartGame}
          onLoadGame={handleLoadGame}
          onOpenSettings={() => setActiveModal('settings')}
          hasSavedGame={hasSavedGame}
        />
      )}

      {/* 2. PLAYING CANVAS & GAMEPLAY */}
      {gameState === 'playing' && (
        <div className="relative w-full h-full">
          {/* Main Game World Canvas */}
          <canvas
            ref={canvasRef}
            className="w-full h-full block cursor-crosshair"
            style={{ imageRendering: 'pixelated' }}
            onClick={() => {
              if (engineRef.current) engineRef.current.playerAttack();
            }}
          />

          {/* Level Up Notification Toast */}
          {levelUpToast && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-bounce">
              <div className="px-6 py-2.5 rounded-lg bg-amber-500 text-slate-950 font-pixel text-xs font-bold border-2 border-amber-200 pixel-btn shadow-2xl">
                ⭐ {levelUpToast}
              </div>
            </div>
          )}

          {/* Game HUD (HP, EXP, Coin, Quest Tracker, Touch Controls) */}
          <GameUI
            currentAreaId={currentAreaId}
            currentAreaName={currentAreaName}
            currentAreaSubtitle={currentAreaSubtitle}
            playerStats={playerStats}
            activeBoss={activeBoss}
            areaBannerText={areaBannerText}
            isDead={isDead}
            onRespawn={handleRespawn}
            onReturnTitle={() => {
              soundManager.stopMusic();
              setGameState('title');
            }}
            onOpenInventory={() => setActiveModal('inventory')}
            onOpenSettings={() => setActiveModal('settings')}
            onOpenPause={() => setActiveModal('pause')}
            onOpenPrologue={() => setActiveModal('prologue')}
            onAttack={() => {
              if (engineRef.current) engineRef.current.playerAttack();
            }}
            onDash={() => {
              if (engineRef.current) engineRef.current.playerDash();
            }}
            onUsePotion={handleUsePotion}
            onVirtualMove={(dx, dy) => {
              if (engineRef.current) {
                engineRef.current.virtualMovement = { dx, dy };
              }
            }}
            nearbyInteractable={nearbyInteractable}
            onInteract={() => {
              if (engineRef.current) engineRef.current.tryInteract();
            }}
          />
        </div>
      )}

      {/* 3. ENDING CUTSCENE */}
      {gameState === 'ending' && (
        <EndingCutscene
          playerStats={playerStats}
          onContinuePlaying={() => {
            setGameState('playing');
            if (engineRef.current) {
              engineRef.current.loadArea('kingdom', 450, 400);
            }
          }}
          onReturnTitle={() => {
            soundManager.stopMusic();
            setGameState('title');
          }}
        />
      )}

      {/* --- MODALS --- */}

      {/* Dialog Modal */}
      {activeModal === 'dialog' && dialogNPC && (
        <DialogModal
          npc={dialogNPC}
          availableQuest={getAvailableQuestForNpc(dialogNPC)}
          activeQuestForNpc={getActiveQuestForNpc(dialogNPC)}
          playerStats={playerStats}
          onAcceptQuest={handleAcceptQuest}
          onClaimQuestReward={handleClaimQuestReward}
          onOpenShop={(type) => {
            if (type === 'blacksmith') {
              setActiveModal('blacksmith');
            } else {
              setShopType(type);
              setActiveModal('shop');
            }
          }}
          onClose={() => setActiveModal('none')}
        />
      )}

      {/* Shop Modal */}
      {activeModal === 'shop' && (
        <ShopModal
          initialTab={shopType}
          playerStats={playerStats}
          onBuyWeapon={handleBuyWeapon}
          onBuyArmor={handleBuyArmor}
          onBuyPotion={handleBuyPotion}
          onClose={() => setActiveModal('none')}
        />
      )}

      {/* Blacksmith Modal */}
      {activeModal === 'blacksmith' && (
        <BlacksmithModal
          playerStats={playerStats}
          onUpgradeWeapon={handleUpgradeWeapon}
          onUpgradeArmor={handleUpgradeArmor}
          onClose={() => setActiveModal('none')}
        />
      )}

      {/* Inventory & Status Modal */}
      {activeModal === 'inventory' && (
        <InventoryModal
          playerStats={playerStats}
          onEquipWeapon={handleEquipWeapon}
          onEquipArmor={handleEquipArmor}
          onUsePotion={handleUsePotion}
          onClose={() => setActiveModal('none')}
        />
      )}

      {/* Settings Modal */}
      {activeModal === 'settings' && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={(newSettings) =>
            setSettings((prev) => ({ ...prev, ...newSettings }))
          }
          onClose={() => setActiveModal('none')}
        />
      )}

      {/* Pause Menu Modal (Resume & Menu) */}
      {activeModal === 'pause' && (
        <PauseModal
          playerStats={playerStats}
          onClose={() => setActiveModal('none')}
          onResume={() => setActiveModal('none')}
          onOpenPrologue={() => setActiveModal('prologue')}
          onOpenSettings={() => setActiveModal('settings')}
          onSave={() => saveGame(playerStats)}
          onReturnTitle={() => {
            soundManager.stopMusic();
            setActiveModal('none');
            setGameState('title');
          }}
        />
      )}

      {/* Prologue & Quest Guide Modal */}
      {activeModal === 'prologue' && (
        <PrologueModal
          activeQuest={playerStats.activeQuests[0]}
          onClose={() => setActiveModal('none')}
        />
      )}
    </main>
  );
}
