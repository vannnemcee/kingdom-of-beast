import React, { useState } from 'react';
import { Item, PlayerStats } from '../types';
import { INITIAL_ARMORS, INITIAL_POTIONS, INITIAL_WEAPONS } from '../engine/worldData';
import { soundManager } from '../audio/soundManager';

interface ShopModalProps {
  initialTab?: 'weapon' | 'armor' | 'item';
  playerStats: PlayerStats;
  onBuyWeapon: (weapon: Item) => void;
  onBuyArmor: (armor: Item) => void;
  onBuyPotion: (potion: Item) => void;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  initialTab = 'weapon',
  playerStats,
  onBuyWeapon,
  onBuyArmor,
  onBuyPotion,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'weapon' | 'armor' | 'item'>(initialTab);

  const getShopTitle = () => {
    switch (activeTab) {
      case 'weapon': return '⚔️ TOKO SENJATA KERAJAAN';
      case 'armor': return '🛡️ TOKO ZIRAH KERAJAAN';
      case 'item': return '🧪 TOKO ITEM & RAMUAN';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 select-none">
      <div className="w-full max-w-xl bg-slate-900 border-4 border-amber-600/80 rounded-lg p-5 pixel-box text-slate-100 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-700/80 pb-3 mb-4">
          <div>
            <h2 className="text-sm sm:text-base font-pixel text-amber-400 font-bold tracking-wider">
              {getShopTitle()}
            </h2>
            <p className="font-retro text-xs text-slate-400">
              Perkuat perlengkapan kesatria untuk menghadapi ancaman Raja Iblis
            </p>
          </div>

          {/* Player Coin Display */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-950/70 border border-amber-500/60 font-pixel text-xs text-yellow-300">
            <span>🪙</span>
            <span>{playerStats.coin}</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-4 border-b border-slate-800 pb-2">
          <button
            onClick={() => {
              soundManager.playBuy();
              setActiveTab('weapon');
            }}
            className={`px-3 py-1.5 rounded font-pixel text-[11px] cursor-pointer transition-colors ${
              activeTab === 'weapon'
                ? 'bg-amber-600 text-slate-950 font-bold border border-amber-400'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
            }`}
          >
            ⚔️ SENJATA
          </button>
          <button
            onClick={() => {
              soundManager.playBuy();
              setActiveTab('armor');
            }}
            className={`px-3 py-1.5 rounded font-pixel text-[11px] cursor-pointer transition-colors ${
              activeTab === 'armor'
                ? 'bg-amber-600 text-slate-950 font-bold border border-amber-400'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
            }`}
          >
            🛡️ ZIRAH
          </button>
          <button
            onClick={() => {
              soundManager.playBuy();
              setActiveTab('item');
            }}
            className={`px-3 py-1.5 rounded font-pixel text-[11px] cursor-pointer transition-colors ${
              activeTab === 'item'
                ? 'bg-amber-600 text-slate-950 font-bold border border-amber-400'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
            }`}
          >
            🧪 RAMUAN
          </button>
        </div>

        {/* Items List */}
        <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1 font-retro">
          {/* WEAPONS */}
          {activeTab === 'weapon' &&
            INITIAL_WEAPONS.map((wpn) => {
              const isEquipped = playerStats.equippedWeapon.id === wpn.id;
              const canAfford = playerStats.coin >= wpn.price;
              const dmgDiff = wpn.value - playerStats.equippedWeapon.value;

              return (
                <div
                  key={wpn.id}
                  className={`p-3 rounded border flex items-center justify-between transition-colors ${
                    isEquipped
                      ? 'bg-amber-950/40 border-amber-500/70'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 bg-slate-900 rounded border border-slate-700">
                      {wpn.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-pixel text-xs text-slate-200">{wpn.name}</span>
                        {isEquipped && (
                          <span className="text-[9px] font-pixel px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-bold">
                            DIPAKAI
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">{wpn.description}</div>
                      <div className="flex items-center gap-3 mt-1 text-[11px] font-pixel">
                        <span className="text-red-400">Damage: +{wpn.value}</span>
                        {dmgDiff > 0 && (
                          <span className="text-emerald-400 text-[10px]">
                            (+{dmgDiff} vs sekarang)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    {isEquipped ? (
                      <span className="text-xs font-pixel text-slate-400 px-3 py-1.5 block">
                        Sedang Dipakai
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          if (canAfford) {
                            soundManager.playBuy();
                            onBuyWeapon(wpn);
                          }
                        }}
                        disabled={!canAfford}
                        className={`py-2 px-3.5 rounded font-pixel text-[11px] cursor-pointer transition-transform active:scale-95 ${
                          canAfford
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold border border-amber-300'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        }`}
                      >
                        🪙 {wpn.price} Beli
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

          {/* ARMORS */}
          {activeTab === 'armor' &&
            INITIAL_ARMORS.map((arm) => {
              const isEquipped = playerStats.equippedArmor.id === arm.id;
              const canAfford = playerStats.coin >= arm.price;
              const defDiff = arm.value - playerStats.equippedArmor.value;

              return (
                <div
                  key={arm.id}
                  className={`p-3 rounded border flex items-center justify-between transition-colors ${
                    isEquipped
                      ? 'bg-amber-950/40 border-amber-500/70'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 bg-slate-900 rounded border border-slate-700">
                      {arm.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-pixel text-xs text-slate-200">{arm.name}</span>
                        {isEquipped && (
                          <span className="text-[9px] font-pixel px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-bold">
                            DIPAKAI
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">{arm.description}</div>
                      <div className="flex items-center gap-3 mt-1 text-[11px] font-pixel">
                        <span className="text-blue-400">Defense: +{arm.value}</span>
                        {defDiff > 0 && (
                          <span className="text-emerald-400 text-[10px]">
                            (+{defDiff} vs sekarang)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    {isEquipped ? (
                      <span className="text-xs font-pixel text-slate-400 px-3 py-1.5 block">
                        Sedang Dipakai
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          if (canAfford) {
                            soundManager.playBuy();
                            onBuyArmor(arm);
                          }
                        }}
                        disabled={!canAfford}
                        className={`py-2 px-3.5 rounded font-pixel text-[11px] cursor-pointer transition-transform active:scale-95 ${
                          canAfford
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold border border-amber-300'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        }`}
                      >
                        🪙 {arm.price} Beli
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

          {/* POTIONS */}
          {activeTab === 'item' &&
            INITIAL_POTIONS.map((pot) => {
              const canAfford = playerStats.coin >= pot.price;

              return (
                <div
                  key={pot.id}
                  className="p-3 rounded border bg-slate-950/60 border-slate-800 hover:border-slate-700 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 bg-slate-900 rounded border border-slate-700">
                      {pot.icon}
                    </span>
                    <div>
                      <span className="font-pixel text-xs text-slate-200 block">{pot.name}</span>
                      <div className="text-xs text-slate-400">{pot.description}</div>
                      <div className="text-[11px] font-pixel text-emerald-400 mt-1">
                        Memulihkan {pot.value === 999 ? 'Semua' : pot.value} HP
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (canAfford) {
                        soundManager.playBuy();
                        onBuyPotion(pot);
                      }
                    }}
                    disabled={!canAfford}
                    className={`py-2 px-3.5 rounded font-pixel text-[11px] cursor-pointer transition-transform active:scale-95 ${
                      canAfford
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold border border-amber-300'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    }`}
                  >
                    🪙 {pot.price} Beli
                  </button>
                </div>
              );
            })}
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
            TUTUP TOKO
          </button>
        </div>
      </div>
    </div>
  );
};
