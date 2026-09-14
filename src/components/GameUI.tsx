import React, { useState } from 'react';
import { AreaId, Monster, PlayerStats, Quest } from '../types';
import { soundManager } from '../audio/soundManager';

interface GameUIProps {
  currentAreaId: AreaId;
  currentAreaName: string;
  currentAreaSubtitle: string;
  playerStats: PlayerStats;
  activeBoss: Monster | null;
  areaBannerText: string | null;
  isDead: boolean;
  onRespawn: () => void;
  onReturnTitle: () => void;
  onOpenInventory: () => void;
  onOpenSettings?: () => void;
  onOpenPause: () => void;
  onOpenPrologue: () => void;
  onAttack: () => void;
  onDash: () => void;
  onUsePotion: () => void;
  onVirtualMove: (dx: number, dy: number) => void;
  nearbyInteractable: string | null; // e.g. "Tekan E / Klik untuk Berbicara"
  onInteract: () => void;
}

export const GameUI: React.FC<GameUIProps> = ({
  currentAreaId,
  currentAreaName,
  currentAreaSubtitle,
  playerStats,
  activeBoss,
  areaBannerText,
  isDead,
  onRespawn,
  onReturnTitle,
  onOpenInventory,
  onOpenPause,
  onOpenPrologue,
  onAttack,
  onDash,
  onUsePotion,
  onVirtualMove,
  nearbyInteractable,
  onInteract,
}) => {
  const [showAreaMap, setShowAreaMap] = useState(false);

  const hpPercent = Math.max(0, Math.min(100, (playerStats.hp / playerStats.maxHp) * 100));
  const expPercent = Math.max(0, Math.min(100, (playerStats.exp / playerStats.maxExp) * 100));

  // Find primary active quest for tracker
  const activeQuest: Quest | undefined = playerStats.activeQuests.find((q) => !q.isClaimed);

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-30 flex flex-col justify-between p-3 sm:p-4">
      {/* --- TOP BAR --- */}
      <div className="flex items-start justify-between w-full">
        {/* PLAYER STATUS (TOP-LEFT) */}
        <div className="flex flex-col gap-1.5 pointer-events-auto bg-slate-950/80 p-3 rounded-lg border-2 border-slate-700/80 pixel-box shadow-xl min-w-56 sm:min-w-64 backdrop-blur-xs">
          {/* Level & HP header */}
          <div className="flex items-center justify-between font-pixel text-[11px]">
            <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-bold">
              LV {playerStats.level}
            </span>
            <span className="text-red-400">
              HP {playerStats.hp}/{playerStats.maxHp}
            </span>
          </div>

          {/* HP Bar */}
          <div className="w-full h-4 bg-slate-900 rounded-xs border-2 border-slate-700 p-0.5 relative overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-600 via-red-500 to-rose-400 transition-all duration-200"
              style={{ width: `${hpPercent}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center font-pixel text-[8px] text-white/90 drop-shadow">
              {playerStats.hp} / {playerStats.maxHp}
            </div>
          </div>

          {/* EXP Bar */}
          <div className="flex items-center gap-1.5 font-pixel text-[9px] text-slate-400">
            <span className="text-cyan-400">EXP</span>
            <div className="w-full h-2 bg-slate-900 rounded-xs border border-slate-700 p-0.2 relative overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-600 to-sky-400 transition-all duration-200"
                style={{ width: `${expPercent}%` }}
              />
            </div>
            <span className="text-[8px] text-slate-300">
              {playerStats.exp}/{playerStats.maxExp}
            </span>
          </div>

          {/* Coin & Area indicator */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800 font-pixel text-[10px]">
            <div className="flex items-center gap-1 text-yellow-300">
              <span>🪙</span>
              <span>{playerStats.coin}</span>
            </div>
            <span className="text-amber-400 text-[9px] truncate max-w-28">
              {currentAreaId === 'kingdom' ? '🏰 KERAJAAN' : currentAreaName.split('(')[0]}
            </span>
          </div>
        </div>

        {/* BOSS HEALTH BAR (CENTER-TOP) */}
        {activeBoss && activeBoss.hp > 0 && (
          <div className="absolute left-1/2 -translate-x-1/2 top-4 pointer-events-auto w-72 sm:w-96 max-w-[90vw] bg-slate-950/90 border-2 border-red-600 rounded-lg p-3 pixel-box text-center shadow-2xl animate-pulse">
            <div className="font-pixel text-[11px] sm:text-xs text-red-400 font-bold tracking-widest uppercase mb-1">
              💀 {activeBoss.name}
            </div>
            {activeBoss.bossTitle && (
              <div className="text-[9px] font-retro text-amber-300 mb-1.5">
                {activeBoss.bossTitle}
              </div>
            )}
            <div className="w-full h-4 bg-slate-900 border-2 border-red-900 rounded-xs p-0.5 relative overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-700 via-rose-600 to-amber-500 transition-all duration-200"
                style={{
                  width: `${Math.max(0, (activeBoss.hp / activeBoss.maxHp) * 100)}%`,
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center font-pixel text-[8px] text-white font-bold drop-shadow">
                {activeBoss.hp} / {activeBoss.maxHp} HP
              </div>
            </div>
          </div>
        )}

        {/* TOP RIGHT: QUEST TRACKER & MENU BUTTONS */}
        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          {/* Quick HUD Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-lg border border-slate-700">
            <button
              onClick={() => {
                soundManager.playCoin();
                onOpenPrologue();
              }}
              className="px-2 py-1 bg-indigo-900/80 hover:bg-indigo-800 rounded font-pixel text-[10px] text-indigo-200 border border-indigo-600 cursor-pointer flex items-center gap-1"
              title="Petunjuk Misi & Prolog"
            >
              📜 <span className="hidden sm:inline">PETUNJUK</span>
            </button>
            <button
              onClick={() => {
                soundManager.playBuy();
                setShowAreaMap((prev) => !prev);
              }}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded font-pixel text-[10px] text-slate-200 border border-slate-600 cursor-pointer flex items-center gap-1"
              title="Peta Dunia"
            >
              🗺️ <span className="hidden sm:inline">PETA</span>
            </button>
            <button
              onClick={() => {
                soundManager.playBuy();
                onOpenInventory();
              }}
              className="px-2 py-1 bg-amber-600 hover:bg-amber-500 rounded font-pixel text-[10px] text-slate-950 font-bold border border-amber-400 cursor-pointer flex items-center gap-1"
              title="Inventory [I]"
            >
              🎒 <span className="hidden sm:inline">TAS</span>
            </button>
            <button
              onClick={() => {
                soundManager.playCoin();
                onOpenPause();
              }}
              className="px-2.5 py-1 bg-red-950/80 hover:bg-red-900 rounded font-pixel text-[10px] text-red-200 border border-red-700 cursor-pointer flex items-center gap-1 font-bold animate-pulse"
              title="Menu Pause [ESC / P]"
            >
              ⏸️ <span className="hidden sm:inline">MENU</span>
            </button>
          </div>

          {/* ACTIVE QUEST TRACKER */}
          {activeQuest && (
            <div className="w-56 sm:w-64 bg-slate-950/85 p-3 rounded-lg border-2 border-amber-600/60 pixel-box text-left font-retro shadow-lg backdrop-blur-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-1.5 font-pixel text-[10px]">
                <span className="text-amber-400 font-bold">📜 QUEST</span>
                <span
                  className={`text-[8px] px-1 py-0.2 rounded ${
                    activeQuest.isCompleted
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {activeQuest.isCompleted ? 'SELESAI' : 'AKTIF'}
                </span>
              </div>
              <div className="font-pixel text-[10px] text-slate-200 mb-1 truncate">
                {activeQuest.title}
              </div>
              <div className="text-[10px] text-slate-400 mb-1.5 leading-snug">
                {activeQuest.description}
              </div>
              <div className="flex items-center justify-between font-pixel text-[9px] text-slate-300">
                <span>Progress:</span>
                <span
                  className={activeQuest.isCompleted ? 'text-emerald-400 font-bold' : 'text-yellow-400'}
                >
                  {activeQuest.currentCount} / {activeQuest.targetCount}
                </span>
              </div>
              {activeQuest.isCompleted && (
                <div className="mt-1 text-[9px] font-pixel text-emerald-400 text-center animate-bounce">
                  ⭐ KEMBALI KE NPC DI KERAJAAN
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- WORLD MAP MODAL OVERLAY --- */}
      {showAreaMap && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 pointer-events-auto">
          <div className="w-full max-w-lg bg-slate-900 border-4 border-amber-600 rounded-lg p-5 pixel-box text-slate-100 shadow-2xl font-retro">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-3">
              <h3 className="font-pixel text-xs sm:text-sm text-amber-400">🗺️ PETA ALUR PERJALANAN</h3>
              <button
                onClick={() => setShowAreaMap(false)}
                className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-slate-300 font-pixel text-xs rounded border border-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-4">
              Perjalanan kesatria membentang dari wilayah kerajaan yang damai hingga ke jantung benteng Raja Iblis:
            </p>

            {/* Map progression chain */}
            <div className="space-y-2 text-xs font-pixel">
              {[
                { id: 'kingdom', label: '1. KINGDOM (Safe Zone & Ibukota)', boss: 'Pedagang & Tetua Kerajaan' },
                { id: 'green_forest', label: '2. GREEN FOREST (Hutan Hijau)', boss: 'Slime, Bat, Goblin' },
                { id: 'dark_forest', label: '3. DARK FOREST (Hutan Gelap)', boss: 'Mini Boss: Forest Guardian' },
                { id: 'ruins', label: '4. ANCIENT RUINS (Reruntuhan Kuno)', boss: 'Boss: Skeleton King' },
                { id: 'demon_territory', label: '5. DEMON TERRITORY (Wilayah Iblis)', boss: 'Boss: Demon General' },
                { id: 'demon_castle', label: '6. DEMON CASTLE (Kastil Iblis)', boss: 'FINAL BOSS: DEMON KING' },
              ].map((step) => {
                const isCurrent = currentAreaId === step.id;
                return (
                  <div
                    key={step.id}
                    className={`p-2.5 rounded border flex items-center justify-between ${
                      isCurrent
                        ? 'bg-amber-950/70 border-amber-500 text-yellow-300'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div>
                      <span className="block font-bold">{step.label}</span>
                      <span className="text-[9px] font-retro text-slate-400">Musuh: {step.boss}</span>
                    </div>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[9px] font-bold">
                        LOKASI ANDA
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowAreaMap(false)}
                className="py-1.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-pixel text-xs rounded border border-slate-600 cursor-pointer"
              >
                TUTUP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- AREA BANNER ANNOUNCEMENT --- */}
      {areaBannerText && (
        <div className="absolute left-1/2 -translate-x-1/2 top-24 pointer-events-none text-center animate-fade">
          <div className="inline-block px-6 py-2 rounded-lg bg-slate-950/90 border-2 border-amber-500/80 pixel-box shadow-2xl backdrop-blur-xs">
            <h2 className="text-sm sm:text-base font-pixel text-amber-300 font-bold tracking-widest">
              {areaBannerText}
            </h2>
            <p className="text-[10px] font-retro text-slate-300 mt-0.5">{currentAreaSubtitle}</p>
          </div>
        </div>
      )}

      {/* --- INTERACTION PROMPT POPUP ("!" or "Press E / Click to Interact") --- */}
      {nearbyInteractable && !isDead && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-24 pointer-events-auto">
          <button
            onClick={() => {
              soundManager.playBuy();
              onInteract();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-xs font-bold border-2 border-amber-200 pixel-btn cursor-pointer shadow-2xl animate-bounce"
          >
            <span className="text-base">💬</span>
            <span>{nearbyInteractable}</span>
          </button>
        </div>
      )}

      {/* --- BOTTOM ROW: TOUCH CONTROLS (VIRTUAL JOYPAD & COMBAT BUTTONS) --- */}
      <div className="flex items-end justify-between w-full pointer-events-none">
        {/* VIRTUAL D-PAD (BOTTOM-LEFT) */}
        <div className="pointer-events-auto flex flex-col items-center gap-1 bg-slate-950/60 p-2 rounded-xl border border-slate-800 backdrop-blur-xs">
          <button
            onTouchStart={() => onVirtualMove(0, -1)}
            onTouchEnd={() => onVirtualMove(0, 0)}
            onMouseDown={() => onVirtualMove(0, -1)}
            onMouseUp={() => onVirtualMove(0, 0)}
            className="w-11 h-11 bg-slate-800 hover:bg-slate-700 active:bg-amber-600 rounded-lg border border-slate-600 text-slate-200 font-pixel text-sm flex items-center justify-center cursor-pointer shadow-md select-none"
          >
            ▲
          </button>
          <div className="flex gap-2">
            <button
              onTouchStart={() => onVirtualMove(-1, 0)}
              onTouchEnd={() => onVirtualMove(0, 0)}
              onMouseDown={() => onVirtualMove(-1, 0)}
              onMouseUp={() => onVirtualMove(0, 0)}
              className="w-11 h-11 bg-slate-800 hover:bg-slate-700 active:bg-amber-600 rounded-lg border border-slate-600 text-slate-200 font-pixel text-sm flex items-center justify-center cursor-pointer shadow-md select-none"
            >
              ◀
            </button>
            <button
              onTouchStart={() => onVirtualMove(0, 1)}
              onTouchEnd={() => onVirtualMove(0, 0)}
              onMouseDown={() => onVirtualMove(0, 1)}
              onMouseUp={() => onVirtualMove(0, 0)}
              className="w-11 h-11 bg-slate-800 hover:bg-slate-700 active:bg-amber-600 rounded-lg border border-slate-600 text-slate-200 font-pixel text-sm flex items-center justify-center cursor-pointer shadow-md select-none"
            >
              ▼
            </button>
            <button
              onTouchStart={() => onVirtualMove(1, 0)}
              onTouchEnd={() => onVirtualMove(0, 0)}
              onMouseDown={() => onVirtualMove(1, 0)}
              onMouseUp={() => onVirtualMove(0, 0)}
              className="w-11 h-11 bg-slate-800 hover:bg-slate-700 active:bg-amber-600 rounded-lg border border-slate-600 text-slate-200 font-pixel text-sm flex items-center justify-center cursor-pointer shadow-md select-none"
            >
              ▶
            </button>
          </div>
        </div>

        {/* COMBAT BUTTONS (BOTTOM-RIGHT) */}
        <div className="pointer-events-auto flex items-end gap-2.5">
          {/* Health Potion Shortcut */}
          <button
            onClick={() => {
              if (playerStats.potionCount > 0 && playerStats.hp < playerStats.maxHp) {
                onUsePotion();
              }
            }}
            disabled={playerStats.potionCount === 0 || playerStats.hp >= playerStats.maxHp}
            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-pixel cursor-pointer select-none border-2 shadow-lg transition-transform active:scale-90 ${
              playerStats.potionCount > 0 && playerStats.hp < playerStats.maxHp
                ? 'bg-emerald-700 hover:bg-emerald-600 border-emerald-400 text-slate-100'
                : 'bg-slate-800/80 border-slate-700 text-slate-500 cursor-not-allowed'
            }`}
            title="Minum Potion [Q]"
          >
            <span className="text-sm">🧪</span>
            <span className="text-[9px]">x{playerStats.potionCount}</span>
          </button>

          {/* Dash / Evade Button */}
          <button
            onClick={onDash}
            className="w-13 h-13 rounded-xl bg-blue-700 hover:bg-blue-600 border-2 border-blue-400 text-slate-100 font-pixel text-xs flex flex-col items-center justify-center cursor-pointer select-none shadow-lg transition-transform active:scale-90"
            title="Dash [Shift]"
          >
            <span className="text-base">💨</span>
            <span className="text-[8px] font-bold">DASH</span>
          </button>

          {/* Main Attack Button */}
          <button
            onClick={onAttack}
            className="w-16 h-16 rounded-2xl bg-gradient-to-b from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 border-2 border-amber-300 text-slate-950 font-pixel flex flex-col items-center justify-center cursor-pointer select-none shadow-xl transition-transform active:scale-90"
            title="Serang [Spasi / Klik]"
          >
            <span className="text-xl">⚔️</span>
            <span className="text-[9px] font-bold">SERANG</span>
          </button>
        </div>
      </div>

      {/* --- YOU DIED MODAL SCREEN --- */}
      {isDead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 pointer-events-auto select-none">
          <div className="w-full max-w-md bg-slate-950 border-4 border-red-800 rounded-lg p-6 pixel-box text-center shadow-2xl">
            <div className="text-3xl sm:text-4xl font-pixel font-bold text-red-600 tracking-wider mb-2 animate-pulse">
              YOU DIED
            </div>
            <p className="font-retro text-xs sm:text-sm text-slate-400 mb-6">
              Kesatria telah tumbang dalam pertempuran melawan kegelapan.
            </p>

            <div className="space-y-3 font-pixel text-xs">
              <button
                onClick={() => {
                  soundManager.playHeal();
                  onRespawn();
                }}
                className="w-full py-3 px-6 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold border border-amber-400 cursor-pointer shadow-lg transition-transform active:scale-95"
              >
                [RESPAWN KE KERAJAAN]
              </button>

              <button
                onClick={() => {
                  soundManager.playBuy();
                  onReturnTitle();
                }}
                className="w-full py-2.5 px-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 cursor-pointer transition-transform active:scale-95"
              >
                [MAIN MENU]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
