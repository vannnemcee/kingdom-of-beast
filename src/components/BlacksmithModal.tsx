import React from 'react';
import { PlayerStats } from '../types';
import { soundManager } from '../audio/soundManager';

interface BlacksmithModalProps {
  playerStats: PlayerStats;
  onUpgradeWeapon: () => void;
  onUpgradeArmor: () => void;
  onClose: () => void;
}

export const BlacksmithModal: React.FC<BlacksmithModalProps> = ({
  playerStats,
  onUpgradeWeapon,
  onUpgradeArmor,
  onClose,
}) => {
  const weaponLvl = playerStats.equippedWeapon.upgradeLevel || 0;
  const weaponUpgradeCost = (weaponLvl + 1) * 60;
  const canUpgradeWeapon = playerStats.coin >= weaponUpgradeCost;
  const nextWeaponDmg = playerStats.equippedWeapon.value + 3;

  const armorLvl = playerStats.equippedArmor.upgradeLevel || 0;
  const armorUpgradeCost = (armorLvl + 1) * 50;
  const canUpgradeArmor = playerStats.coin >= armorUpgradeCost;
  const nextArmorDef = playerStats.equippedArmor.value + 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 select-none">
      <div className="w-full max-w-lg bg-slate-900 border-4 border-amber-600/80 rounded-lg p-5 pixel-box text-slate-100 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-700/80 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔨</span>
            <div>
              <h2 className="text-sm sm:text-base font-pixel text-amber-400 font-bold tracking-wider">
                PANDAI BESI GORAN
              </h2>
              <p className="font-retro text-xs text-slate-400">
                Tempa dan perkuat senjata serta zirahmu dengan koin kerajaan!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-950/70 border border-amber-500/60 font-pixel text-xs text-yellow-300">
            <span>🪙</span>
            <span>{playerStats.coin}</span>
          </div>
        </div>

        {/* Upgrade Cards */}
        <div className="space-y-4 font-retro">
          {/* WEAPON UPGRADE */}
          <div className="p-4 rounded-lg bg-slate-950/70 border-2 border-slate-800 hover:border-amber-600/60 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 bg-slate-900 rounded border border-slate-700">
                  {playerStats.equippedWeapon.icon}
                </span>
                <div>
                  <div className="font-pixel text-xs sm:text-sm text-slate-200">
                    {playerStats.equippedWeapon.name}{' '}
                    <span className="text-amber-400">+{weaponLvl}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Tingkat Tempa Saat Ini: Lv.{weaponLvl}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 font-pixel text-xs">
                    <span className="text-slate-300">Damage: {playerStats.equippedWeapon.value}</span>
                    <span className="text-amber-400">➔</span>
                    <span className="text-emerald-400 font-bold">{nextWeaponDmg} (+3)</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (canUpgradeWeapon) {
                    soundManager.playUpgrade();
                    onUpgradeWeapon();
                  }
                }}
                disabled={!canUpgradeWeapon}
                className={`py-2 px-4 rounded font-pixel text-xs cursor-pointer transition-transform active:scale-95 ${
                  canUpgradeWeapon
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold border border-amber-300 shadow-md'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                🪙 {weaponUpgradeCost} Tempa
              </button>
            </div>
          </div>

          {/* ARMOR UPGRADE */}
          <div className="p-4 rounded-lg bg-slate-950/70 border-2 border-slate-800 hover:border-amber-600/60 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 bg-slate-900 rounded border border-slate-700">
                  {playerStats.equippedArmor.icon}
                </span>
                <div>
                  <div className="font-pixel text-xs sm:text-sm text-slate-200">
                    {playerStats.equippedArmor.name}{' '}
                    <span className="text-blue-400">+{armorLvl}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Tingkat Tempa Saat Ini: Lv.{armorLvl}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 font-pixel text-xs">
                    <span className="text-slate-300">Defense: {playerStats.equippedArmor.value}</span>
                    <span className="text-amber-400">➔</span>
                    <span className="text-cyan-400 font-bold">{nextArmorDef} (+2)</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (canUpgradeArmor) {
                    soundManager.playUpgrade();
                    onUpgradeArmor();
                  }
                }}
                disabled={!canUpgradeArmor}
                className={`py-2 px-4 rounded font-pixel text-xs cursor-pointer transition-transform active:scale-95 ${
                  canUpgradeArmor
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold border border-amber-300 shadow-md'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                🪙 {armorUpgradeCost} Tempa
              </button>
            </div>
          </div>
        </div>

        {/* Info Tip */}
        <div className="mt-4 p-2.5 rounded bg-slate-950/50 border border-slate-800 text-[11px] font-retro text-slate-400">
          💡 Tips: Semakin tinggi level tempa senjata dan zirahmu, semakin mudah kamu menembus wilayah monster berbahaya hingga sarang Raja Iblis!
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
            SELESAI
          </button>
        </div>
      </div>
    </div>
  );
};
