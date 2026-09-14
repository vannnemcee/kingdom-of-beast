import React, { useState } from 'react';
import { NPC, PlayerStats, Quest } from '../types';
import { soundManager } from '../audio/soundManager';

interface DialogModalProps {
  npc: NPC;
  availableQuest?: Quest | null;
  activeQuestForNpc?: Quest | null;
  playerStats: PlayerStats;
  onAcceptQuest: (quest: Quest) => void;
  onClaimQuestReward: (questId: string) => void;
  onOpenShop: (shopType: 'weapon' | 'armor' | 'item' | 'blacksmith') => void;
  onClose: () => void;
}

export const DialogModal: React.FC<DialogModalProps> = ({
  npc,
  availableQuest,
  activeQuestForNpc,
  onAcceptQuest,
  onClaimQuestReward,
  onOpenShop,
  onClose,
}) => {
  const [dialogueIndex, setDialogueIndex] = useState(0);

  const dialogueList =
    npc && Array.isArray(npc.dialogue) && npc.dialogue.length > 0
      ? npc.dialogue
      : ['Halo, Kesatria. Semoga langkahmu selalu diberkati dewa.'];

  const currentText = dialogueList[dialogueIndex] || dialogueList[0];
  const isLastLine = dialogueIndex >= dialogueList.length - 1;

  const handleNext = () => {
    soundManager.playBuy();
    if (!isLastLine) {
      setDialogueIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  // Determine avatar icon based on role
  const getAvatarIcon = () => {
    switch (npc.role) {
      case 'guard': return '🛡️';
      case 'quest': return '📜';
      case 'blacksmith': return '🔨';
      case 'weapon_shop': return '⚔️';
      case 'armor_shop': return '🛡️';
      case 'item_shop': return '🧪';
      default: return '👤';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pb-8 px-4 bg-slate-950/40 select-none">
      <div className="w-full max-w-2xl bg-slate-900 border-4 border-amber-600/80 rounded-lg p-5 pixel-box shadow-2xl text-slate-100 relative">
        {/* Top bar with NPC name */}
        <div className="flex items-center justify-between border-b-2 border-slate-700/80 pb-2 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-slate-800 border-2 border-amber-500/70 flex items-center justify-center text-xl shadow-inner">
              {getAvatarIcon()}
            </div>
            <div>
              <h3 className="font-pixel text-xs sm:text-sm text-amber-400 font-bold tracking-wider">
                {npc.name}
              </h3>
              <span className="font-retro text-[10px] text-slate-400 uppercase tracking-widest">
                {npc.role.replace('_', ' ')}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playBuy();
              onClose();
            }}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded border border-slate-600 text-slate-400 hover:text-slate-200 font-pixel text-[10px] cursor-pointer"
          >
            TUTUP [ESC]
          </button>
        </div>

        {/* Dialogue Body */}
        <div className="min-h-16 py-2 px-1">
          <p className="font-retro text-sm sm:text-base text-slate-200 leading-relaxed">
            "{currentText}"
          </p>

          {/* If there is an active quest ready to claim */}
          {activeQuestForNpc && activeQuestForNpc.isCompleted && !activeQuestForNpc.isClaimed && (
            <div className="mt-4 p-3 rounded bg-amber-950/70 border-2 border-amber-500/70 font-retro">
              <div className="font-pixel text-xs text-amber-300 font-bold mb-1 flex items-center gap-2">
                <span>⭐</span> QUEST SELESAI: {activeQuestForNpc.title}!
              </div>
              <p className="text-xs text-slate-300 mb-2">
                Terima kasih, Kesatria! Keberanianmu menyelamatkan kerajaan. Ini hadiah untukmu:
              </p>
              <div className="flex items-center gap-4 text-xs font-pixel text-yellow-300">
                <span>💰 +{activeQuestForNpc.rewardCoin} Coin</span>
                <span>✨ +{activeQuestForNpc.rewardExp} EXP</span>
              </div>
            </div>
          )}

          {/* If there is an available quest not yet accepted */}
          {availableQuest && isLastLine && !activeQuestForNpc && (
            <div className="mt-4 p-3.5 rounded bg-indigo-950/80 border-2 border-indigo-500/60 font-retro">
              <div className="font-pixel text-xs text-indigo-300 font-bold mb-1 flex items-center gap-2">
                <span>📜</span> MISI KERAJAAN: {availableQuest.title}
              </div>
              <p className="text-xs text-slate-300 mb-2">
                {availableQuest.description}
              </p>
              <div className="flex items-center gap-4 text-xs font-pixel text-amber-300">
                <span>🎯 Target: {availableQuest.targetCount}x {availableQuest.targetMonster?.replace('_', ' ')}</span>
                <span>💰 Hadiah: {availableQuest.rewardCoin} Coin</span>
                <span>✨ EXP: +{availableQuest.rewardExp}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Choices */}
        <div className="mt-4 pt-3 border-t border-slate-700/80 flex flex-wrap items-center justify-end gap-2.5">
          {/* Claim Quest Reward */}
          {activeQuestForNpc && activeQuestForNpc.isCompleted && !activeQuestForNpc.isClaimed && (
            <button
              onClick={() => {
                onClaimQuestReward(activeQuestForNpc.id);
                onClose();
              }}
              className="py-2 px-4 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-xs font-bold tracking-wider cursor-pointer border border-amber-300 transition-transform active:scale-95 shadow-md"
            >
              ⭐ KLAIM HADIAH MISI
            </button>
          )}

          {/* Accept Quest / Later */}
          {availableQuest && isLastLine && !activeQuestForNpc && (
            <>
              <button
                onClick={() => {
                  soundManager.playQuestAccept();
                  onAcceptQuest(availableQuest);
                  onClose();
                }}
                className="py-2 px-4 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-100 font-pixel text-xs font-bold tracking-wider cursor-pointer border border-emerald-400 transition-transform active:scale-95 shadow-md"
              >
                [TERIMA QUEST]
              </button>
              <button
                onClick={() => {
                  soundManager.playBuy();
                  onClose();
                }}
                className="py-2 px-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-pixel text-xs cursor-pointer border border-slate-600"
              >
                [NANTI]
              </button>
            </>
          )}

          {/* Open Shop or Blacksmith */}
          {npc.shopType && (
            <button
              onClick={() => {
                soundManager.playBuy();
                onOpenShop(npc.shopType!);
              }}
              className="py-2 px-4 rounded bg-indigo-600 hover:bg-indigo-500 text-slate-100 font-pixel text-xs font-bold tracking-wider cursor-pointer border border-indigo-400 transition-transform active:scale-95 shadow-md"
            >
              {npc.shopType === 'blacksmith' ? '🔨 UPGRADE PERLENGKAPAN' : '🛒 BUKA TOKO'}
            </button>
          )}

          {/* Next / Tutup */}
          {!isLastLine && (
            <button
              onClick={handleNext}
              className="py-2 px-4 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-pixel text-xs font-bold tracking-wider cursor-pointer border border-amber-400"
            >
              LANJUT ▶
            </button>
          )}

          {isLastLine && !availableQuest && (!activeQuestForNpc || !activeQuestForNpc.isCompleted) && (
            <button
              onClick={onClose}
              className="py-2 px-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-pixel text-xs cursor-pointer border border-slate-600"
            >
              TUTUP
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
