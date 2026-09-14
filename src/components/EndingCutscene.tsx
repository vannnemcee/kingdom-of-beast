import React, { useEffect, useRef } from 'react';
import { PlayerStats } from '../types';
import { soundManager } from '../audio/soundManager';

interface EndingCutsceneProps {
  playerStats: PlayerStats;
  onContinuePlaying: () => void;
  onReturnTitle: () => void;
}

export const EndingCutscene: React.FC<EndingCutsceneProps> = ({
  playerStats,
  onContinuePlaying,
  onReturnTitle,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    soundManager.playMusic('kingdom');
    soundManager.playQuestClear();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      time += 0.03;
      const w = canvas.width;
      const h = canvas.height;

      // Pure peaceful blue sky with golden sunlight
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#38bdf8'); // Radiant azure sky
      skyGrad.addColorStop(0.6, '#fef08a'); // Warm golden dawn
      skyGrad.addColorStop(1, '#86efac'); // Lush green horizon
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Sun rays
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      for (let i = 0; i < 6; i++) {
        const angle = time * 0.2 + (i * Math.PI) / 3;
        ctx.beginPath();
        ctx.moveTo(w * 0.5, h * 0.2);
        ctx.lineTo(w * 0.5 + Math.cos(angle - 0.2) * 500, h * 0.2 + Math.sin(angle - 0.2) * 500);
        ctx.lineTo(w * 0.5 + Math.cos(angle + 0.2) * 500, h * 0.2 + Math.sin(angle + 0.2) * 500);
        ctx.fill();
      }
      ctx.restore();

      // Flocks of white peace doves flying
      for (let i = 0; i < 5; i++) {
        const bx = ((time * 40 + i * 120) % (w + 100)) - 50;
        const by = 50 + Math.sin(time * 3 + i) * 15 + i * 20;
        const flap = Math.sin(time * 10 + i) > 0 ? 3 : -3;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(Math.floor(bx), Math.floor(by), 4, 3);
        ctx.fillRect(Math.floor(bx - 3), Math.floor(by - flap), 3, 2);
        ctx.fillRect(Math.floor(bx + 3), Math.floor(by - flap), 3, 2);
      }

      // Rolling peaceful green hills
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.6);
      for (let x = 0; x <= w; x += 40) {
        ctx.lineTo(x, h * 0.65 + Math.sin(x * 0.01) * 20);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.fill();

      // Forefront Cliff with the Victorious Knight
      ctx.fillStyle = '#15803d';
      ctx.fillRect(0, h * 0.78, w, h * 0.22);

      // Distant safe Kingdom castle in sunlight
      const cx = w * 0.65;
      const cy = h * 0.62;
      ctx.fillStyle = '#475569';
      ctx.fillRect(cx - 50, cy - 40, 100, 60);
      ctx.fillRect(cx - 20, cy - 70, 40, 40);
      // Spire with gold gleam
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.moveTo(cx - 25, cy - 70);
      ctx.lineTo(cx, cy - 100);
      ctx.lineTo(cx + 25, cy - 70);
      ctx.fill();

      // Victorious Knight on cliff edge
      const kx = w * 0.25;
      const ky = h * 0.76;
      // Cape flutter
      const cape = Math.sin(time * 8) * 4;
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(kx - 12, ky - 18, 10 + cape, 22);

      // Knight Armor
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(kx - 8, ky - 20, 16, 22);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(kx - 7, ky - 30, 14, 12); // Helmet
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(kx - 2, ky - 36, 4, 8); // Plume

      // Golden Sword raised high in triumph!
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(kx + 10, ky - 48, 3, 28);
      ctx.fillRect(kx + 6, ky - 24, 11, 3); // Guard
      // Blade gleam star
      if (Math.sin(time * 6) > 0.4) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(kx + 9, ky - 50, 5, 5);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-slate-950 select-none overflow-y-auto">
      {/* Dynamic Animated Canvas Background */}
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ imageRendering: 'pixelated' }}
      />

      <div className="absolute inset-0 scanlines opacity-40 pointer-events-none" />

      {/* Epilogue Modal Card */}
      <div className="relative z-10 w-full max-w-2xl bg-slate-950/85 border-4 border-amber-500 rounded-lg p-6 pixel-box text-center shadow-2xl backdrop-blur-xs">
        {/* Triumphant Banners */}
        <div className="space-y-1 mb-4">
          <div className="inline-block px-3 py-1 rounded bg-red-950/80 border border-red-600 font-pixel text-xs text-red-400 font-bold tracking-widest uppercase">
            ⚔️ DEMON KING DEFEATED ⚔️
          </div>
          <h1 
            className="text-2xl sm:text-3xl font-pixel font-bold text-yellow-300 tracking-wider mt-2"
            style={{ textShadow: '3px 3px 0 #78350f, 6px 6px 0 #000' }}
          >
            THE KINGDOM HAS BEEN SAVED
          </h1>
          <div className="font-pixel text-xs sm:text-sm text-emerald-400 font-bold tracking-widest pt-1">
            ⭐ QUEST COMPLETED ⭐
          </div>
        </div>

        {/* Narrative Epilogue */}
        <div className="my-5 p-4 rounded bg-slate-900/90 border border-slate-700/80 font-retro text-xs sm:text-sm text-slate-200 text-left space-y-2.5 leading-relaxed">
          <p>
            Dengan robohnya Raja Iblis Morgath, kabut hitam dan kekuatan terkutuk yang menyelimuti dunia perlahan sirna.
          </p>
          <p>
            Lahar panas mendingin, langit merah kelabu berganti dengan fajar mentari emas yang hangat, dan para monster liar kembali tercerai-berai jauh ke dalam kegelapan yang tak terjangkau.
          </p>
          <p className="text-amber-300 font-semibold">
            Lonceng istana berdentang di seantero negeri. Namamu akan selamanya diabadikan dalam catatan sejarah sebagai Kesatria Agung Penyelamat Kerajaan!
          </p>
        </div>

        {/* End Game Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 font-pixel text-[11px]">
          <div className="p-2 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block text-[9px]">LEVEL AKHIR</span>
            <span className="text-yellow-400 text-sm">LV {playerStats.level}</span>
          </div>
          <div className="p-2 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block text-[9px]">TOTAL KOIN</span>
            <span className="text-yellow-300 text-sm">🪙 {playerStats.coin}</span>
          </div>
          <div className="p-2 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block text-[9px]">SENJATA</span>
            <span className="text-amber-400 text-[10px] truncate block">{playerStats.equippedWeapon.name}</span>
          </div>
          <div className="p-2 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block text-[9px]">ZIRAH</span>
            <span className="text-blue-400 text-[10px] truncate block">{playerStats.equippedArmor.name}</span>
          </div>
        </div>

        {/* Ending Badge */}
        <div className="font-pixel text-xs text-amber-500 tracking-widest mb-6">
          — ENDING —
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onContinuePlaying}
            className="py-3 px-6 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-xs font-bold tracking-wider cursor-pointer border border-amber-300 transition-transform active:scale-95 shadow-lg"
          >
            🛡️ JELAJAH DUNIA BEBAS (FREE ROAM)
          </button>
          <button
            onClick={onReturnTitle}
            className="py-3 px-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-pixel text-xs cursor-pointer border border-slate-600 transition-transform active:scale-95"
          >
            🏰 MENU UTAMA
          </button>
        </div>
      </div>
    </div>
  );
};
