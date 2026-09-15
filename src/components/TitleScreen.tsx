import React, { useEffect, useRef } from 'react';
import { soundManager } from '../audio/soundManager';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenSettings: () => void;
  onLoadGame?: () => void;
  hasSavedGame?: boolean;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenSettings,
  onLoadGame,
  hasSavedGame,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    soundManager.playMusic('title');
    return () => {
      // Keep music playing or switch
    };
  }, []);

  // Animated Pixel Art Title Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const clouds = [
      { x: 30, y: 40, speed: 0.2, w: 90, h: 24 },
      { x: 250, y: 70, speed: 0.15, w: 120, h: 28 },
      { x: 450, y: 30, speed: 0.25, w: 100, h: 22 },
      { x: 650, y: 60, speed: 0.18, w: 80, h: 20 },
    ];

    const birds = [
      { x: 100, y: 90, speed: 1.2, flap: 0 },
      { x: 140, y: 110, speed: 1.1, flap: 1.5 },
      { x: 120, y: 80, speed: 1.3, flap: 3 },
    ];

    const render = () => {
      time += 0.03;
      const w = canvas.width;
      const h = canvas.height;

      // Sky Gradient (Sunset Fantasy Twilight)
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#1e1b4b'); // Deep indigo
      grad.addColorStop(0.4, '#4c1d95'); // Royal purple
      grad.addColorStop(0.7, '#b45309'); // Warm dusk orange
      grad.addColorStop(1, '#1e293b'); // Dark earth
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Distant Stars / Sparkles
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 20; i++) {
        const sx = (Math.sin(i * 99 + time * 0.1) * 0.5 + 0.5) * w;
        const sy = (Math.cos(i * 33) * 0.5 + 0.5) * (h * 0.4);
        if (Math.sin(time * 3 + i) > 0.3) {
          ctx.fillRect(Math.floor(sx), Math.floor(sy), 2, 2);
        }
      }

      // Distant Parallax Mountains
      ctx.fillStyle = '#2e1065';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.65);
      for (let x = 0; x <= w; x += 40) {
        const my = h * 0.52 + Math.sin(x * 0.01) * 35 + Math.cos(x * 0.03) * 15;
        ctx.lineTo(x, my);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.fill();

      // Midground Mountains
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.7);
      for (let x = 0; x <= w; x += 30) {
        const my = h * 0.6 + Math.sin(x * 0.015 + 1) * 30 + Math.cos(x * 0.02) * 20;
        ctx.lineTo(x, my);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.fill();

      // Animated Clouds
      clouds.forEach((c) => {
        c.x += c.speed;
        if (c.x > w + 50) c.x = -150;

        ctx.fillStyle = 'rgba(253, 230, 138, 0.25)'; // Sunset warm cloud
        ctx.fillRect(Math.floor(c.x), Math.floor(c.y), c.w, c.h);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(Math.floor(c.x + 10), Math.floor(c.y + 4), c.w - 20, c.h - 8);
      });

      // Animated Pixel Birds
      birds.forEach((b) => {
        b.x += b.speed;
        if (b.x > w + 30) b.x = -40;
        const wing = Math.sin(time * 8 + b.flap) > 0 ? 2 : -2;

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(Math.floor(b.x), Math.floor(b.y), 3, 2);
        ctx.fillRect(Math.floor(b.x - 3), Math.floor(b.y - wing), 3, 2);
        ctx.fillRect(Math.floor(b.x + 3), Math.floor(b.y - wing), 3, 2);
      });

      // Grand Kingdom Castle Silhouette (Center-Right)
      const cx = w * 0.65;
      const cy = h * 0.58;

      ctx.fillStyle = '#0f172a';
      // Castle base & walls
      ctx.fillRect(cx - 100, cy, 200, 150);
      // Castle Central Keep
      ctx.fillRect(cx - 40, cy - 80, 80, 80);
      // Spire Roof
      ctx.beginPath();
      ctx.moveTo(cx - 45, cy - 80);
      ctx.lineTo(cx, cy - 130);
      ctx.lineTo(cx + 45, cy - 80);
      ctx.fill();

      // Left Tower
      ctx.fillRect(cx - 95, cy - 60, 36, 60);
      ctx.beginPath();
      ctx.moveTo(cx - 100, cy - 60);
      ctx.lineTo(cx - 77, cy - 100);
      ctx.lineTo(cx - 55, cy - 60);
      ctx.fill();

      // Right Tower
      ctx.fillRect(cx + 60, cy - 60, 36, 60);
      ctx.beginPath();
      ctx.moveTo(cx + 55, cy - 60);
      ctx.lineTo(cx + 78, cy - 100);
      ctx.lineTo(cx + 100, cy - 60);
      ctx.fill();

      // Royal Waving Flags on Spire Tops
      const flagWave = Math.sin(time * 6) * 4;
      ctx.fillStyle = '#b91c1c'; // Red royal flag
      ctx.fillRect(cx, cy - 142, 2, 14);
      ctx.beginPath();
      ctx.moveTo(cx + 2, cy - 142);
      ctx.lineTo(cx + 22 + flagWave, cy - 135);
      ctx.lineTo(cx + 2, cy - 128);
      ctx.fill();

      // Left Tower Flag
      ctx.fillRect(cx - 77, cy - 110, 2, 12);
      ctx.beginPath();
      ctx.moveTo(cx - 75, cy - 110);
      ctx.lineTo(cx - 58 + flagWave, cy - 105);
      ctx.lineTo(cx - 75, cy - 100);
      ctx.fill();

      // Flickering Torches / Windows on Castle
      const torch = Math.sin(time * 12) > 0;
      ctx.fillStyle = torch ? '#fbbf24' : '#f59e0b';
      ctx.fillRect(cx - 15, cy - 50, 10, 16);
      ctx.fillRect(cx + 5, cy - 50, 10, 16);
      ctx.fillRect(cx - 80, cy - 35, 8, 12);
      ctx.fillRect(cx + 72, cy - 35, 8, 12);

      // Castle Gate Arch with warm golden glow
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(cx - 18, cy + 50, 36, 50);

      // Foreground Pine Forest Ridge
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, h * 0.78, w, h * 0.22);

      // Pixel Pine Trees across bottom
      for (let tx = 0; tx < w; tx += 28) {
        const th = 40 + Math.sin(tx * 3) * 15;
        const ty = h * 0.82;
        ctx.fillStyle = '#020617';
        // Tree layers
        ctx.beginPath();
        ctx.moveTo(tx, ty - th);
        ctx.lineTo(tx - 16, ty);
        ctx.lineTo(tx + 16, ty);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(tx, ty - th * 0.6);
        ctx.lineTo(tx - 20, ty + 15);
        ctx.lineTo(tx + 20, ty + 15);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center select-none bg-slate-950">
      {/* Dynamic Animated Canvas Background */}
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ imageRendering: 'pixelated' }}
      />

      {/* Subtle scanline overlay */}
      <div className="absolute inset-0 scanlines opacity-50 pointer-events-none" />

      {/* Title Content Box */}
      <div className="relative z-10 flex flex-col items-center max-w-xl mx-auto px-4 text-center">
        {/* Decorative Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded bg-amber-950/80 border border-amber-600/60 text-amber-300 text-xs font-pixel tracking-wider shadow-lg">
          <span>⚔️</span>
          <span>PIXEL FANTASY ACTION RPG</span>
          <span>⚔️</span>
        </div>

        {/* Main Title with Retro Depth */}
        <h1 
          className="text-2xl sm:text-4xl md:text-5xl font-pixel font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-amber-300 to-amber-600 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] tracking-tight leading-tight mb-2"
          style={{ textShadow: '3px 3px 0px #451a03, 6px 6px 0px #000000' }}
        >
          KINGDOM OF BEAST
        </h1>

        <p className="text-slate-300 text-xs sm:text-sm font-retro mb-8 tracking-wide max-w-md bg-slate-950/60 p-2 rounded border border-slate-700/50 backdrop-blur-xs">
          Bangkitlah Kesatria Kerajaan! Jelajahi hutan, kalahkan monster, tingkatkan perlengkapanmu, dan hentikan ancaman Raja Iblis.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3.5 w-64 sm:w-72">
          {hasSavedGame && onLoadGame && (
            <button
              onClick={() => {
                soundManager.playBuy();
                onLoadGame();
              }}
              className="w-full py-3.5 px-6 rounded bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-slate-950 font-pixel text-xs sm:text-sm font-bold tracking-wider pixel-btn cursor-pointer transition-transform active:scale-95 shadow-[0_6px_0_#064e3b,0_10px_10px_rgba(0,0,0,0.5)] border border-emerald-300/40"
            >
              💾 LANJUTKAN (LOAD)
            </button>
          )}

          <button
            onClick={() => {
              soundManager.playBuy();
              onStartGame();
            }}
            className="w-full py-3.5 px-6 rounded bg-gradient-to-b from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-pixel text-xs sm:text-sm font-bold tracking-wider pixel-btn cursor-pointer transition-transform active:scale-95 shadow-[0_6px_0_#78350f,0_10px_10px_rgba(0,0,0,0.5)] border border-amber-300/40"
          >
            ▶ {hasSavedGame ? 'MULAI BARU (NEW GAME)' : '▶ MULAI PETUALANGAN'}
          </button>

          <button
            onClick={() => {
              soundManager.playCoin();
              onOpenSettings();
            }}
            className="w-full py-3 px-6 rounded bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-pixel text-xs font-bold tracking-wider pixel-btn cursor-pointer transition-transform active:scale-95 shadow-[0_4px_0_#1e293b] border border-slate-600/60"
          >
            ⚙️ SETTINGS
          </button>

          {/* Quick Guide modal trigger or text */}
          <div className="pt-2 text-slate-400 text-[10px] font-retro text-center">
            [WASD / Panah] Gerak • [Spasi / Klik] Serang • [Shift] Menghindar
          </div>
        </div>
      </div>

      {/* Version & Credits Footer */}
      <div className="absolute bottom-3 left-4 right-4 flex justify-between text-[10px] text-slate-400 font-retro z-10 pointer-events-none">
        <span className="text-amber-400 font-bold">VER 1.6.0 • SKILLS & HAZARDS UPDATE</span>
        <span>KERAJAAN MANUSIA VS RAJA IBLIS</span>
      </div>
    </div>
  );
};
