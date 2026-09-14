import React, { useState } from 'react';
import { PlayerStats } from '../types';
import { soundManager } from '../audio/soundManager';

interface PauseModalProps {
  playerStats: PlayerStats;
  currentAreaName?: string;
  onResume: () => void;
  onOpenPrologue: () => void;
  onOpenMap?: () => void;
  onOpenSettings: () => void;
  onSave: () => void;
  onReturnTitle: () => void;
  onClose?: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  playerStats,
  currentAreaName = 'Valoria Kingdom',
  onResume,
  onOpenPrologue,
  onOpenMap,
  onOpenSettings,
  onSave,
  onReturnTitle,
  onClose,
}) => {
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSaveGame = () => {
    soundManager.playBuy();
    onSave();
    setSaveMessage('✓ Progres Permainan Berhasil Disimpan!');
    setTimeout(() => setSaveMessage(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-md bg-slate-900 border-4 border-amber-600 rounded-xl p-6 pixel-box text-slate-100 shadow-2xl relative font-retro animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Ribbon */}
        <div className="text-center border-b-2 border-slate-700 pb-3 mb-4">
          <div className="inline-block px-3 py-1 mb-1 rounded bg-amber-500/20 border border-amber-500/40 text-amber-400 font-pixel text-[10px] tracking-widest uppercase">
            ⏸️ GAME PAUSED
          </div>
          <h2 className="font-pixel text-lg sm:text-xl text-yellow-300 font-bold tracking-wide drop-shadow">
            MENU PERMAINAN
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Lokasi: <span className="text-amber-300 font-bold">{currentAreaName.split('(')[0]}</span>
          </p>
        </div>

        {/* Hero Quick Status Card */}
        <div className="bg-slate-950/80 rounded-lg p-3 border border-slate-800 mb-5 text-xs font-pixel space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-amber-400 font-bold">KESATRIA VALORIA</span>
            <span className="px-2 py-0.5 rounded bg-amber-600 text-slate-950 font-bold text-[10px]">
              LV {playerStats.level}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300 pt-1 border-t border-slate-800/80">
            <div>
              <span className="text-red-400">HP: </span>
              <span>{playerStats.hp} / {playerStats.maxHp}</span>
            </div>
            <div>
              <span className="text-yellow-400">Koin: </span>
              <span>🪙 {playerStats.coin}</span>
            </div>
            <div className="truncate col-span-2">
              <span className="text-cyan-400">Senjata: </span>
              <span>{playerStats.equippedWeapon.name}</span>
            </div>
            <div className="truncate col-span-2">
              <span className="text-emerald-400">Zirah: </span>
              <span>{playerStats.equippedArmor.name}</span>
            </div>
          </div>
        </div>

        {/* Save feedback toast */}
        {saveMessage && (
          <div className="mb-4 py-2 px-3 bg-emerald-950/90 border border-emerald-500 text-emerald-300 rounded font-pixel text-[10px] text-center animate-bounce">
            {saveMessage}
          </div>
        )}

        {/* Menu Buttons */}
        <div className="flex flex-col gap-2.5">
          {/* 1. Resume */}
          <button
            onClick={() => {
              soundManager.playBuy();
              onResume();
            }}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-pixel text-xs font-bold rounded-lg border-2 border-amber-300 shadow-md pixel-btn cursor-pointer transition-transform active:scale-98 flex items-center justify-center gap-2"
          >
            <span>▶</span>
            <span>LANJUTKAN (RESUME)</span>
          </button>

          {/* 2. Prologue & Quest Guide */}
          <button
            onClick={() => {
              soundManager.playBuy();
              onOpenPrologue();
            }}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-amber-300 font-pixel text-xs rounded-lg border border-amber-500/50 cursor-pointer transition-colors flex items-center justify-center gap-2"
          >
            <span>📜</span>
            <span>PETUNJUK MISI & PROLOG</span>
          </button>

          {/* 3. World Map */}
          <button
            onClick={() => {
              soundManager.playBuy();
              onOpenMap();
            }}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-pixel text-xs rounded-lg border border-slate-700 cursor-pointer transition-colors flex items-center justify-center gap-2"
          >
            <span>🗺️</span>
            <span>PETA ALUR DUNIA</span>
          </button>

          {/* 4. Settings */}
          <button
            onClick={() => {
              soundManager.playCoin();
              onOpenSettings();
            }}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-pixel text-xs rounded-lg border border-slate-700 cursor-pointer transition-colors flex items-center justify-center gap-2"
          >
            <span>⚙️</span>
            <span>PENGATURAN SUARA & GRAFIS</span>
          </button>

          {/* 5. Save Game */}
          <button
            onClick={handleSaveGame}
            className="w-full py-2.5 px-4 bg-emerald-900/70 hover:bg-emerald-800/80 text-emerald-200 font-pixel text-xs rounded-lg border border-emerald-600/70 cursor-pointer transition-colors flex items-center justify-center gap-2"
          >
            <span>💾</span>
            <span>SIMPAN PERMAINAN (SAVE)</span>
          </button>

          {/* 6. Return to Title */}
          <button
            onClick={() => {
              soundManager.playBuy();
              onReturnTitle();
            }}
            className="w-full py-2.5 px-4 bg-red-950/60 hover:bg-red-900/80 text-red-300 font-pixel text-xs rounded-lg border border-red-800/60 cursor-pointer transition-colors flex items-center justify-center gap-2 mt-1"
          >
            <span>🚪</span>
            <span>KEMBALI KE MENU UTAMA</span>
          </button>
        </div>

        {/* Key Shortcut Tip */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-center text-[10px] text-slate-400 font-retro">
          Tekan <span className="text-amber-300 font-pixel">[ESC]</span> atau <span className="text-amber-300 font-pixel">[P]</span> untuk kembali ke game
        </div>
      </div>
    </div>
  );
};
