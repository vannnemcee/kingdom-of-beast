import React from 'react';
import { GameSettings } from '../types';
import { soundManager } from '../audio/soundManager';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const handleSoundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    soundManager.setSoundVolume(val);
    onUpdateSettings({ soundVolume: val });
  };

  const handleMusicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    soundManager.setMusicVolume(val);
    onUpdateSettings({ musicVolume: val });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      onUpdateSettings({ fullscreen: true });
    } else {
      document.exitFullscreen().catch(() => {});
      onUpdateSettings({ fullscreen: false });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 select-none">
      <div className="w-full max-w-md bg-slate-900 border-4 border-slate-700 rounded-lg p-6 pixel-box text-slate-100 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-700 pb-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h2 className="text-base font-pixel text-amber-400 tracking-wider">SETTING</h2>
          </div>
          <button
            onClick={() => {
              soundManager.playBuy();
              onClose();
            }}
            className="w-8 h-8 rounded bg-slate-800 hover:bg-red-900 border border-slate-600 text-slate-300 font-pixel text-xs cursor-pointer flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Options */}
        <div className="space-y-4 font-retro text-sm">
          {/* Sound FX Slider */}
          <div className="bg-slate-950/60 p-3 rounded border border-slate-800">
            <div className="flex justify-between items-center mb-1.5 font-pixel text-[11px] text-slate-300">
              <span>Sound FX</span>
              <span className="text-amber-400">{Math.round(settings.soundVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.soundVolume}
              onChange={handleSoundChange}
              className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
            />
          </div>

          {/* Music Slider */}
          <div className="bg-slate-950/60 p-3 rounded border border-slate-800">
            <div className="flex justify-between items-center mb-1.5 font-pixel text-[11px] text-slate-300">
              <span>Music</span>
              <span className="text-amber-400">{Math.round(settings.musicVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.musicVolume}
              onChange={handleMusicChange}
              className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
            />
          </div>

          {/* Graphics (Low / Medium / High) */}
          <div className="bg-slate-950/60 p-3 rounded border border-slate-800 flex items-center justify-between">
            <span className="font-pixel text-[11px] text-slate-300">Graphics</span>
            <div className="flex gap-1.5">
              {(['low', 'medium', 'high'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => {
                    soundManager.playCoin();
                    onUpdateSettings({ graphics: lvl });
                  }}
                  className={`px-2.5 py-1 text-[10px] font-pixel rounded cursor-pointer uppercase transition-colors ${
                    settings.graphics === lvl
                      ? 'bg-amber-500 text-slate-950 font-bold border border-amber-300'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* CRT Scanline Toggle */}
          <div className="bg-slate-950/60 p-3 rounded border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-pixel text-[11px] text-slate-300 block">Retro Scanlines</span>
              <span className="text-[10px] text-slate-500">Efek layar TV tabung CRT retro</span>
            </div>
            <button
              onClick={() => {
                soundManager.playCoin();
                onUpdateSettings({ crtScanlines: !settings.crtScanlines });
              }}
              className={`px-3 py-1 font-pixel text-[10px] rounded cursor-pointer transition-colors ${
                settings.crtScanlines
                  ? 'bg-emerald-600 text-slate-100 border border-emerald-400'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {settings.crtScanlines ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Vibration */}
          <div className="bg-slate-950/60 p-3 rounded border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-pixel text-[11px] text-slate-300 block">Vibration (Haptic)</span>
              <span className="text-[10px] text-slate-500">Getaran pada perangkat layar sentuh</span>
            </div>
            <button
              onClick={() => {
                soundManager.playCoin();
                onUpdateSettings({ vibration: !settings.vibration });
              }}
              className={`px-3 py-1 font-pixel text-[10px] rounded cursor-pointer transition-colors ${
                settings.vibration
                  ? 'bg-emerald-600 text-slate-100 border border-emerald-400'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {settings.vibration ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <div className="bg-slate-950/60 p-3 rounded border border-slate-800 flex items-center justify-between">
            <span className="font-pixel text-[11px] text-slate-300">Fullscreen</span>
            <button
              onClick={toggleFullscreen}
              className="px-3 py-1 font-pixel text-[10px] rounded bg-indigo-600 hover:bg-indigo-500 text-slate-100 border border-indigo-400 cursor-pointer"
            >
              Toggle
            </button>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6 pt-3 border-t border-slate-800">
          <button
            onClick={() => {
              soundManager.playBuy();
              onClose();
            }}
            className="w-full py-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-pixel text-xs tracking-wider cursor-pointer border border-slate-600"
          >
            ◀ BACK
          </button>
        </div>
      </div>
    </div>
  );
};
