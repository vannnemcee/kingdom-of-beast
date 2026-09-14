import React, { useState } from 'react';
import { soundManager } from '../audio/soundManager';
import { Quest } from '../types';

interface PrologueModalProps {
  onClose: () => void;
  activeQuest?: Quest;
}

export const PrologueModal: React.FC<PrologueModalProps> = ({ onClose, activeQuest }) => {
  const [activeTab, setActiveTab] = useState<'quest' | 'story' | 'controls'>('quest');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-3 sm:p-4 select-none">
      <div className="w-full max-w-xl bg-slate-900 border-4 border-amber-600 rounded-xl p-4 sm:p-6 pixel-box text-slate-100 shadow-2xl relative font-retro animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        
        {/* Header Ribbon */}
        <div className="flex items-center justify-between border-b-2 border-slate-700 pb-3 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <div>
              <h2 className="font-pixel text-sm sm:text-base text-yellow-300 font-bold tracking-wide">
                PROLOG & PANDUAN MISI AWAL
              </h2>
              <p className="text-[10px] text-slate-400">
                Ikuti langkah berikut agar tidak tersesat di awal petualangan!
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playBuy();
              onClose();
            }}
            className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-pixel text-xs border border-slate-600 flex items-center justify-center cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 mb-3 font-pixel text-[10px] shrink-0">
          <button
            onClick={() => {
              soundManager.playCoin();
              setActiveTab('quest');
            }}
            className={`px-3 py-1.5 rounded cursor-pointer transition-colors flex items-center gap-1 ${
              activeTab === 'quest'
                ? 'bg-amber-600 text-slate-950 font-bold border border-amber-400 shadow'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <span>🎯</span>
            <span>PETUNJUK MISI</span>
          </button>

          <button
            onClick={() => {
              soundManager.playCoin();
              setActiveTab('story');
            }}
            className={`px-3 py-1.5 rounded cursor-pointer transition-colors flex items-center gap-1 ${
              activeTab === 'story'
                ? 'bg-amber-600 text-slate-950 font-bold border border-amber-400 shadow'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <span>👑</span>
            <span>KISAH PROLOG</span>
          </button>

          <button
            onClick={() => {
              soundManager.playCoin();
              setActiveTab('controls');
            }}
            className={`px-3 py-1.5 rounded cursor-pointer transition-colors flex items-center gap-1 ${
              activeTab === 'controls'
                ? 'bg-amber-600 text-slate-950 font-bold border border-amber-400 shadow'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <span>🎮</span>
            <span>KONTROL</span>
          </button>
        </div>

        {/* Tab Content Container (Scrollable) */}
        <div className="overflow-y-auto pr-1 space-y-3 grow text-xs leading-relaxed font-retro">

          {/* TAB 1: QUEST GUIDE (Paling Penting Agar Tidak Tersesat) */}
          {activeTab === 'quest' && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-950/40 border border-amber-600/50 rounded-lg text-amber-200 text-xs">
                <span className="font-bold text-amber-400 block font-pixel text-[11px] mb-1">
                  ⭐ RUTE LANGKAH AWAL KESATRIA:
                </span>
                Mulailah dari Ibukota Kerajaan Valoria, persiapkan perlengkapan, lalu jelajahi wilayah timur menuju sarang monster.
              </div>

              {/* Step by step cards */}
              <div className="space-y-2 font-pixel text-[10px]">
                {/* Step 1 */}
                <div className="p-2.5 bg-slate-950/70 border border-slate-700 rounded-lg flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="grow">
                    <span className="text-yellow-300 font-bold block mb-0.5">
                      Temui Tetua Almeric (Tanda !)
                    </span>
                    <p className="font-retro text-slate-300 text-xs leading-normal">
                      Berjalanlah ke arah tengah lapangan istana. Temui Tetua Almeric yang berjubah dengan tanda seru emas di atas kepalanya. Tekan <span className="text-amber-400 font-pixel font-bold">[E]</span> untuk menerima Quest Perdana: <span className="text-emerald-400 font-bold">Membasmi 5 Slime</span>.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-2.5 bg-slate-950/70 border border-slate-700 rounded-lg flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="grow">
                    <span className="text-yellow-300 font-bold block mb-0.5">
                      Kunjungi Toko-Toko di Atas Rumah
                    </span>
                    <p className="font-retro text-slate-300 text-xs leading-normal">
                      Setiap rumah di kerajaan memiliki plang bertuliskan nama toko:
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 mt-1 font-pixel text-[9px]">
                      <div className="p-1 rounded bg-slate-900 border border-slate-700 text-blue-300">
                        ⚔️ TOKO SENJATA (Bilah Roland)
                      </div>
                      <div className="p-1 rounded bg-slate-900 border border-slate-700 text-emerald-300">
                        🛡️ TOKO ZIRAH (Zirah Hilda)
                      </div>
                      <div className="p-1 rounded bg-slate-900 border border-slate-700 text-amber-300">
                        🔨 PANDAI BESI (Tempa +1 Goran)
                      </div>
                      <div className="p-1 rounded bg-slate-900 border border-slate-700 text-pink-300">
                        🧪 TOKO TABIB (Ramuan Lyra)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-2.5 bg-slate-950/70 border border-slate-700 rounded-lg flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="grow">
                    <span className="text-yellow-300 font-bold block mb-0.5">
                      Menuju Gerbang Timur ke Hutan Hijau
                    </span>
                    <p className="font-retro text-slate-300 text-xs leading-normal">
                      Berjalanlah ke arah kanan layar melewati Kapten Penjaga Gerbang. Masuki portal bercahaya bertuliskan <span className="text-cyan-300 font-pixel font-bold">MENUJU GREEN FOREST</span>. Kalahkan Slime dengan menekan <span className="text-amber-400 font-pixel font-bold">[SPASI]</span> dan hindari serangan dengan <span className="text-amber-400 font-pixel font-bold">[SHIFT]</span>.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="p-2.5 bg-slate-950/70 border border-slate-700 rounded-lg flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 mt-0.5">
                    4
                  </div>
                  <div className="grow">
                    <span className="text-yellow-300 font-bold block mb-0.5">
                      Klaim Hadiah & Tingkatkan Karakter
                    </span>
                    <p className="font-retro text-slate-300 text-xs leading-normal">
                      Setelah mengalahkan target monster, kembalilah ke Tetua di Kerajaan untuk mengklaim hadiah koin & EXP yang berlimpah, lalu lanjutkan misi ke Hutan Gelap hingga Kastil Raja Iblis!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STORY PROLOGUE */}
          {activeTab === 'story' && (
            <div className="space-y-3 font-retro text-slate-300">
              <div className="p-3 bg-slate-950/60 border border-amber-900/60 rounded-lg">
                <h4 className="font-pixel text-amber-400 text-xs mb-2">
                  ⚔️ TAHUN 842 - ERA KEGELAPAN VALORIA
                </h4>
                <p className="mb-2">
                  Selama berabad-abad, Kerajaan Valoria hidup dalam kedamaian di bawah perlindungan Menara Kristal Kuno. Namun di kejauhan benua hitam, segel yang membelenggu <span className="text-red-400 font-bold">Raja Iblis Morgath</span> telah retak!
                </p>
                <p className="mb-2">
                  Kabut kegelapan menjalar ke Hutan Hijau dan merubah satwa rimba menjadi monster ganas. Hutan Gelap telah dikuasai oleh <span className="text-yellow-400 font-bold">Forest Guardian</span>, sementara kuburan kuno dipenuhi prajurit tengkorak di bawah titah <span className="text-yellow-400 font-bold">Skeleton King</span>.
                </p>
                <p>
                  Melihat ancaman kepunahan umat manusia, Raja Valoria memanggil Kesatria Terhebat—kamu. Dengan pedang terhunus dan keberanian sejati, tugas sucimu adalah membebaskan setiap wilayah dan menghancurkan Raja Iblis di singgasana obsidian miliknya!
                </p>
              </div>

              <div className="p-2.5 bg-slate-950/40 rounded border border-slate-800 text-[11px] text-slate-400">
                💡 <span className="text-amber-300">Catatan:</span> Kamu dapat membuka petunjuk ini kapan saja selama permainan lewat tombol <span className="text-amber-300 font-pixel">⏸️ MENU</span> di pojok kanan atas layar!
              </div>
            </div>
          )}

          {/* TAB 3: CONTROLS & SHORTCUTS */}
          {activeTab === 'controls' && (
            <div className="space-y-2.5 font-retro text-xs text-slate-300">
              <p className="text-slate-400 mb-1">
                Gunakan keyboard/mouse di PC atau D-Pad virtual di layar sentuh/mobile:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-pixel text-[10px]">
                <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded flex items-center justify-between">
                  <span className="text-slate-400">Bergerak</span>
                  <span className="text-amber-300 font-bold">W, A, S, D / Panah</span>
                </div>
                <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded flex items-center justify-between">
                  <span className="text-slate-400">Tebas Pedang</span>
                  <span className="text-red-400 font-bold">SPASI / Klik</span>
                </div>
                <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded flex items-center justify-between">
                  <span className="text-slate-400">Dash / Menghindar</span>
                  <span className="text-cyan-400 font-bold">L-SHIFT</span>
                </div>
                <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded flex items-center justify-between">
                  <span className="text-slate-400">Bicara / Buka Peti</span>
                  <span className="text-yellow-400 font-bold">Tombol E</span>
                </div>
                <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded flex items-center justify-between">
                  <span className="text-slate-400">Minum Health Potion</span>
                  <span className="text-pink-400 font-bold">Tombol Q</span>
                </div>
                <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded flex items-center justify-between">
                  <span className="text-slate-400">Buka Tas / Status</span>
                  <span className="text-emerald-400 font-bold">Tombol I</span>
                </div>
                <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded flex items-center justify-between sm:col-span-2">
                  <span className="text-slate-400">Menu Jeda & Simpan</span>
                  <span className="text-amber-300 font-bold">ESC / Tombol ⏸️ MENU</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            Panduan tersimpan di Menu Pause [ESC]
          </span>
          <button
            onClick={() => {
              soundManager.playBuy();
              onClose();
            }}
            className="w-full sm:w-auto py-2.5 px-6 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-pixel text-xs font-bold border-2 border-amber-300 shadow-lg cursor-pointer transition-transform active:scale-95"
          >
            MENGERTI, MULAI PETUALANGAN! ⚔️
          </button>
        </div>
      </div>
    </div>
  );
};
