import React, { useState } from 'react';
import { Item, PlayerSkills, PlayerStats } from '../types';
import { soundManager } from '../audio/soundManager';
import { SKILLS_DATA } from '../engine/worldData';

interface InventoryModalProps {
  playerStats: PlayerStats;
  onEquipWeapon: (weapon: Item) => void;
  onEquipArmor: (armor: Item) => void;
  onUsePotion: () => void;
  onUpgradeSkill?: (skillId: keyof PlayerSkills) => void;
  initialTab?: 'status' | 'weapons' | 'armors' | 'items' | 'quests' | 'skills';
  onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  playerStats,
  onEquipWeapon,
  onEquipArmor,
  onUsePotion,
  onUpgradeSkill,
  initialTab = 'status',
  onClose,
}) => {
  const [tab, setTab] = useState<'status' | 'weapons' | 'armors' | 'items' | 'quests' | 'skills'>(initialTab);

  const totalDmg = playerStats.baseDamage + playerStats.equippedWeapon.value;
  const totalDef = playerStats.baseDefense + playerStats.equippedArmor.value;

  const weapons = playerStats.inventory.filter((i) => i.type === 'weapon');
  const armors = playerStats.inventory.filter((i) => i.type === 'armor');

  const skills = playerStats.skills || { whirlwind: 1, holyThrust: 0, ironShield: 0 };
  const skillPoints = playerStats.skillPoints || 0;

  const getSkillEffectPreview = (skillId: keyof PlayerSkills, level: number) => {
    if (skillId === 'whirlwind') {
      return `${140 + level * 20}% Area DMG (${Math.max(2.5, 5 - level * 0.4).toFixed(1)}s CD)`;
    }
    if (skillId === 'holyThrust') {
      return `${180 + level * 30}% Tembus Cahaya (${Math.max(3.5, 7 - level * 0.5).toFixed(1)}s CD)`;
    }
    if (skillId === 'ironShield') {
      return `Kebal ${(1.5 + level * 0.5).toFixed(1)}s & +${15 + level * 10} HP (${Math.max(6, 12 - level * 1).toFixed(1)}s CD)`;
    }
    return '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 select-none">
      <div className="w-full max-w-xl bg-slate-900 border-4 border-slate-700 rounded-lg p-5 pixel-box text-slate-100 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-700/80 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎒</span>
            <h2 className="text-sm sm:text-base font-pixel text-amber-400 font-bold tracking-wider">
              INVENTORY & STATUS KESATRIA
            </h2>
          </div>
          <button
            onClick={() => {
              soundManager.playBuy();
              onClose();
            }}
            className="w-8 h-8 rounded bg-slate-800 hover:bg-red-900 border border-slate-600 text-slate-300 font-pixel text-xs cursor-pointer flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-1.5 mb-4 border-b border-slate-800 pb-2">
          {(
            [
              { id: 'status', label: '📊 STATUS' },
              { id: 'skills', label: `✨ SKILL ${skillPoints > 0 ? `(+${skillPoints})` : ''}` },
              { id: 'weapons', label: '⚔️ SENJATA' },
              { id: 'armors', label: '🛡️ ZIRAH' },
              { id: 'items', label: '🧪 ITEM' },
              { id: 'quests', label: '📜 MISI' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => {
                soundManager.playBuy();
                setTab(t.id);
              }}
              className={`px-3 py-1.5 rounded font-pixel text-[10px] cursor-pointer transition-colors ${
                tab === t.id
                  ? 'bg-amber-500 text-slate-950 font-bold border border-amber-300'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
              } ${t.id === 'skills' && skillPoints > 0 ? 'animate-pulse text-amber-300 font-bold' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="min-h-56 max-h-[50vh] overflow-y-auto pr-1 font-retro">
          {/* TAB: STATUS */}
          {tab === 'status' && (
            <div className="space-y-3">
              {/* Top Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-retro text-xs">
                <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-pixel block mb-1">LEVEL KESATRIA</span>
                  <span className="text-base font-pixel text-yellow-400">LV {playerStats.level}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-pixel block mb-1">KESEHATAN (HP)</span>
                  <span className="text-base font-pixel text-red-400">
                    {playerStats.hp} / {playerStats.maxHp}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-pixel block mb-1">PENGALAMAN (EXP)</span>
                  <span className="text-sm font-pixel text-cyan-400">
                    {playerStats.exp} / {playerStats.maxExp}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-pixel block mb-1">TOTAL DAMAGE</span>
                  <span className="text-base font-pixel text-amber-400">⚔️ {totalDmg}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-pixel block mb-1">TOTAL DEFENSE</span>
                  <span className="text-base font-pixel text-blue-400">🛡️ {totalDef}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-pixel block mb-1">POIN SKILL</span>
                  <span className="text-base font-pixel text-amber-300">✨ {skillPoints} Poin</span>
                </div>
              </div>

              {/* Current Gear Box */}
              <div className="p-3 rounded bg-slate-950/80 border border-slate-800">
                <span className="font-pixel text-xs text-amber-400 block mb-2">PERLENGKAPAN SAAT INI</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-2xl">{playerStats.equippedWeapon.icon}</span>
                    <div>
                      <div className="font-pixel text-[11px] text-slate-200">
                        {playerStats.equippedWeapon.name}{' '}
                        {playerStats.equippedWeapon.upgradeLevel ? `+${playerStats.equippedWeapon.upgradeLevel}` : ''}
                      </div>
                      <div className="text-[10px] text-red-400">Damage +{playerStats.equippedWeapon.value}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-2xl">{playerStats.equippedArmor.icon}</span>
                    <div>
                      <div className="font-pixel text-[11px] text-slate-200">
                        {playerStats.equippedArmor.name}{' '}
                        {playerStats.equippedArmor.upgradeLevel ? `+${playerStats.equippedArmor.upgradeLevel}` : ''}
                      </div>
                      <div className="text-[10px] text-blue-400">Defense +{playerStats.equippedArmor.value}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SKILLS */}
          {tab === 'skills' && (
            <div className="space-y-3">
              {/* Skill points header bar */}
              <div className="p-3 rounded-lg bg-gradient-to-r from-amber-950/80 via-slate-950/90 to-amber-950/80 border-2 border-amber-500/60 flex items-center justify-between">
                <div>
                  <span className="font-pixel text-xs text-amber-300 block">
                    ✨ POIN SKILL TERSEDIA: <span className="text-base text-yellow-300 font-bold">{skillPoints}</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Naikkan level karakter (+1 Poin per Level) untuk memperkuat dan membuka skill!
                  </span>
                </div>
              </div>

              {/* Skills List */}
              <div className="space-y-2.5">
                {Object.values(SKILLS_DATA).map((s) => {
                  const currentLvl = skills[s.id] || 0;
                  const isMax = currentLvl >= s.maxLevel;
                  const canUpgrade = skillPoints > 0 && !isMax;

                  return (
                    <div
                      key={s.id}
                      className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl shrink-0">
                          {s.icon}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-pixel text-xs text-amber-300 font-bold">{s.name}</span>
                            <span className="font-pixel text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                              {s.hotkey}
                            </span>
                            <span className="font-pixel text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
                              LV {currentLvl} / {s.maxLevel}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300">{s.description}</p>
                          <div className="text-[11px] text-amber-400/90 font-pixel">
                            Efek: {getSkillEffectPreview(s.id, Math.max(1, currentLvl))}
                            {!isMax && (
                              <span className="text-emerald-400 ml-1">
                                → Lv {currentLvl + 1}: {getSkillEffectPreview(s.id, currentLvl + 1)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center self-end sm:self-center">
                        {isMax ? (
                          <span className="font-pixel text-[10px] text-emerald-400 px-3 py-1.5 rounded bg-emerald-950/60 border border-emerald-700">
                            MAKSIMAL
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              if (canUpgrade && onUpgradeSkill) {
                                onUpgradeSkill(s.id);
                              }
                            }}
                            disabled={!canUpgrade}
                            className={`px-3 py-1.5 rounded font-pixel text-[10px] cursor-pointer transition-all ${
                              canUpgrade
                                ? 'bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold border border-amber-300 shadow-md animate-pulse'
                                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                            }`}
                          >
                            {canUpgrade ? `+ TINGKATKAN (1 POIN)` : 'BUTUH POIN'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: WEAPONS */}
          {tab === 'weapons' && (
            <div className="space-y-2">
              {weapons.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">Belum ada senjata lain</div>
              ) : (
                weapons.map((w) => {
                  const isEquipped = playerStats.equippedWeapon.id === w.id;
                  return (
                    <div
                      key={w.id}
                      className="p-2.5 rounded bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{w.icon}</span>
                        <div>
                          <div className="font-pixel text-xs text-slate-200">
                            {w.name} {w.upgradeLevel ? `+${w.upgradeLevel}` : ''}
                          </div>
                          <div className="text-xs text-red-400">Damage: +{w.value}</div>
                        </div>
                      </div>
                      {isEquipped ? (
                        <span className="font-pixel text-[10px] text-amber-400">DIPAKAI</span>
                      ) : (
                        <button
                          onClick={() => {
                            soundManager.playBuy();
                            onEquipWeapon(w);
                          }}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-pixel text-[10px] rounded font-bold cursor-pointer"
                        >
                          PAKAI
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB: ARMORS */}
          {tab === 'armors' && (
            <div className="space-y-2">
              {armors.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">Belum ada zirah lain</div>
              ) : (
                armors.map((a) => {
                  const isEquipped = playerStats.equippedArmor.id === a.id;
                  return (
                    <div
                      key={a.id}
                      className="p-2.5 rounded bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{a.icon}</span>
                        <div>
                          <div className="font-pixel text-xs text-slate-200">
                            {a.name} {a.upgradeLevel ? `+${a.upgradeLevel}` : ''}
                          </div>
                          <div className="text-xs text-blue-400">Defense: +{a.value}</div>
                        </div>
                      </div>
                      {isEquipped ? (
                        <span className="font-pixel text-[10px] text-amber-400">DIPAKAI</span>
                      ) : (
                        <button
                          onClick={() => {
                            soundManager.playBuy();
                            onEquipArmor(a);
                          }}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-pixel text-[10px] rounded font-bold cursor-pointer"
                        >
                          PAKAI
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB: ITEMS & POTIONS */}
          {tab === 'items' && (
            <div className="space-y-2.5">
              <div className="p-3 rounded bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🧪</span>
                  <div>
                    <div className="font-pixel text-xs text-slate-200">Health Potion</div>
                    <div className="text-xs text-slate-400">Memulihkan 50 HP secara instan</div>
                    <div className="font-pixel text-[10px] text-emerald-400 mt-0.5">
                      Jumlah: {playerStats.potionCount} buah
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (playerStats.potionCount > 0 && playerStats.hp < playerStats.maxHp) {
                      onUsePotion();
                    }
                  }}
                  disabled={playerStats.potionCount === 0 || playerStats.hp >= playerStats.maxHp}
                  className={`px-3 py-1.5 rounded font-pixel text-[10px] cursor-pointer ${
                    playerStats.potionCount > 0 && playerStats.hp < playerStats.maxHp
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-100 font-bold'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  GUNAKAN
                </button>
              </div>

              {/* Quest Items / Special Key */}
              <div className="p-3 rounded bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                <span className="text-2xl">🗝️</span>
                <div>
                  <div className="font-pixel text-xs text-amber-300">Royal Knight Medallion</div>
                  <div className="text-xs text-slate-400">
                    Lencana kehormatan kesatria yang mengizinkan perjalanan melintasi gerbang kerajaan.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: QUESTS */}
          {tab === 'quests' && (
            <div className="space-y-2.5">
              {playerStats.activeQuests.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  Tidak ada misi aktif saat ini. Berbicaralah dengan Tetua di Kerajaan!
                </div>
              ) : (
                playerStats.activeQuests.map((q) => (
                  <div
                    key={q.id}
                    className="p-3 rounded bg-slate-950/70 border border-amber-600/50 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-pixel text-xs text-amber-300 font-bold">{q.title}</span>
                      <span
                        className={`text-[9px] font-pixel px-1.5 py-0.5 rounded ${
                          q.isCompleted
                            ? 'bg-emerald-600 text-slate-100'
                            : 'bg-amber-950 text-yellow-300 border border-amber-600'
                        }`}
                      >
                        {q.isCompleted ? 'SELESAI (KLAIM KE NPC)' : 'SEDANG BERJALAN'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{q.description}</p>
                    <div className="flex justify-between items-center text-[10px] font-pixel text-slate-400 pt-1 border-t border-slate-800">
                      <span>
                        Target: {q.currentCount} / {q.targetCount}
                      </span>
                      <span className="text-yellow-300">Hadiah: 🪙 {q.rewardCoin} • ✨ {q.rewardExp} EXP</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              soundManager.playBuy();
              onClose();
            }}
            className="py-2 px-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-pixel text-xs cursor-pointer border border-slate-600"
          >
            TUTUP
          </button>
        </div>
      </div>
    </div>
  );
};
