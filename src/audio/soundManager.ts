// Retro 8-bit & 16-bit Sound Synthesizer using Web Audio API

class SoundManager {
  private ctx: AudioContext | null = null;
  private soundVolume: number = 0.7;
  private musicVolume: number = 0.5;
  private isMuted: boolean = false;
  private currentTrack: string | null = null;
  private musicTimer: number | null = null;
  private isPlayingMusic: boolean = false;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSoundVolume(volume: number) {
    this.soundVolume = Math.max(0, Math.min(1, volume));
  }

  public setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopMusic();
    } else if (this.currentTrack) {
      this.playMusic(this.currentTrack);
    }
    return this.isMuted;
  }

  // --- SOUND EFFECTS ---

  public playAttack() {
    if (this.isMuted || this.soundVolume === 0) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.12);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.frequency.exponentialRampToValueAtTime(200, t + 0.12);

    gain.gain.setValueAtTime(this.soundVolume * 0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  public playHit() {
    if (this.isMuted || this.soundVolume === 0) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.15);

    gain.gain.setValueAtTime(this.soundVolume * 0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.16);
  }

  public playCoin() {
    if (this.isMuted || this.soundVolume === 0) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, t); // B5
    osc.frequency.setValueAtTime(1318.51, t + 0.08); // E6

    gain.gain.setValueAtTime(this.soundVolume * 0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.31);
  }

  public playChest() {
    if (this.isMuted || this.soundVolume === 0) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + i * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(this.soundVolume * 0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.26);
    });
  }

  public playBuy() {
    if (this.isMuted || this.soundVolume === 0) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(587.33, t);
    osc.frequency.setValueAtTime(880, t + 0.07);

    gain.gain.setValueAtTime(this.soundVolume * 0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.23);
  }

  public playUpgrade() {
    if (this.isMuted || this.soundVolume === 0) return;
    this.initContext();
    if (!this.ctx) return;

    // Anvil hit + triumph shimmer
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.15);

    gain.gain.setValueAtTime(this.soundVolume * 0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.19);

    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((n, idx) => {
      if (!this.ctx) return;
      const tNote = this.ctx.currentTime + 0.15 + idx * 0.07;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(n, tNote);
      g.gain.setValueAtTime(this.soundVolume * 0.35, tNote);
      g.gain.exponentialRampToValueAtTime(0.001, tNote + 0.25);
      o.connect(g);
      g.connect(this.ctx.destination);
      o.start(tNote);
      o.stop(tNote + 0.26);
    });
  }

  public playHeal() {
    if (this.isMuted || this.soundVolume === 0) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [440, 523.25, 659.25, 880];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + idx * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(this.soundVolume * 0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.21);
    });
  }

  public playQuestAccept() {
    if (this.isMuted || this.soundVolume === 0) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [392.00, 523.25, 659.25];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + idx * 0.09;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(this.soundVolume * 0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.26);
    });
  }

  public playQuestClear() {
    if (this.isMuted || this.soundVolume === 0) return;
    this.initContext();
    if (!this.ctx) return;

    const melody = [523.25, 659.25, 783.99, 1046.5, 987.77, 1046.5];
    melody.forEach((freq, idx) => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + idx * 0.1;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(this.soundVolume * 0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.36);
    });
  }

  public playLevelUp() {
    if (this.isMuted || this.soundVolume === 0) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(this.soundVolume * 0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.42);
    });
  }

  public playPlayerHurt() {
    if (this.isMuted || this.soundVolume === 0) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.linearRampToValueAtTime(60, t + 0.15);
    gain.gain.setValueAtTime(this.soundVolume * 0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.16);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.17);
  }

  public playDeath() {
    if (this.isMuted || this.soundVolume === 0) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [300, 260, 220, 160, 100];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + idx * 0.14;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(this.soundVolume * 0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.31);
    });
  }

  public playDash() {
    if (this.isMuted || this.soundVolume === 0) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.1);
    gain.gain.setValueAtTime(this.soundVolume * 0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  public playMagic() {
    if (this.isMuted || this.soundVolume === 0) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(750, t);
    osc.frequency.exponentialRampToValueAtTime(240, t + 0.2);
    gain.gain.setValueAtTime(this.soundVolume * 0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.23);
  }

  // --- RETRO CHIPTUNE BACKGROUND MUSIC ---

  public playMusic(track: string) {
    if (this.currentTrack === track && this.isPlayingMusic) return;
    this.stopMusic();
    this.currentTrack = track;
    if (this.isMuted || this.musicVolume === 0) return;

    this.initContext();
    this.isPlayingMusic = true;

    // Start looped musical sequence
    this.startMusicLoop(track);
  }

  public stopMusic() {
    this.isPlayingMusic = false;
    if (this.musicTimer) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private startMusicLoop(track: string) {
    let step = 0;

    // Define chiptune melodies for different zones
    let notes: number[] = [];
    let speedMs = 240;

    if (track === 'title') {
      // Heroic Fantasy Fanfare
      notes = [
        392.00, 523.25, 659.25, 783.99,
        659.25, 783.99, 1046.50, 783.99,
        880.00, 659.25, 523.25, 659.25,
        587.33, 440.00, 392.00, 440.00
      ];
      speedMs = 280;
    } else if (track === 'kingdom') {
      // Peaceful Medieval Village Melody (Town of Knights)
      notes = [
        261.63, 329.63, 392.00, 329.63,
        440.00, 392.00, 329.63, 293.66,
        329.63, 392.00, 440.00, 523.25,
        392.00, 329.63, 261.63, 293.66
      ];
      speedMs = 320;
    } else if (track === 'green_forest') {
      // Adventure Forest Theme
      notes = [
        329.63, 392.00, 440.00, 493.88,
        523.25, 493.88, 440.00, 392.00,
        349.23, 392.00, 440.00, 523.25,
        440.00, 392.00, 329.63, 293.66
      ];
      speedMs = 260;
    } else if (track === 'dark_forest') {
      // Eerie Dark Forest
      notes = [
        220.00, 246.94, 261.63, 220.00,
        311.13, 293.66, 261.63, 246.94,
        220.00, 207.65, 220.00, 261.63,
        196.00, 185.00, 220.00, 164.81
      ];
      speedMs = 340;
    } else if (track === 'ruins') {
      // Ancient Forgotten Ruins
      notes = [
        293.66, 329.63, 349.23, 440.00,
        392.00, 349.23, 329.63, 293.66,
        261.63, 293.66, 329.63, 392.00,
        349.23, 329.63, 293.66, 220.00
      ];
      speedMs = 310;
    } else if (track === 'demon_territory') {
      // Ominous Demon Domain
      notes = [
        130.81, 146.83, 155.56, 174.61,
        155.56, 146.83, 130.81, 123.47,
        130.81, 155.56, 196.00, 174.61,
        155.56, 130.81, 116.54, 98.00
      ];
      speedMs = 280;
    } else if (track === 'boss' || track === 'demon_castle') {
      // Fast, dramatic boss battle theme
      notes = [
        220.00, 220.00, 261.63, 293.66,
        329.63, 293.66, 261.63, 220.00,
        349.23, 349.23, 392.00, 440.00,
        523.25, 440.00, 392.00, 329.63
      ];
      speedMs = 190;
    }

    const tick = () => {
      if (!this.isPlayingMusic || this.isMuted || this.musicVolume === 0) return;
      this.initContext();
      if (!this.ctx) return;

      const freq = notes[step % notes.length];
      const t = this.ctx.currentTime;

      // Melody note
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = track === 'boss' ? 'sawtooth' : (track === 'kingdom' ? 'sine' : 'triangle');
      osc.frequency.setValueAtTime(freq, t);

      const noteVol = this.musicVolume * 0.12;
      gain.gain.setValueAtTime(noteVol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + speedMs * 0.0018);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + speedMs * 0.002);

      // Add gentle bass accompaniment every 4 beats
      if (step % 4 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(freq * 0.5, t);
        bassGain.gain.setValueAtTime(this.musicVolume * 0.15, t);
        bassGain.gain.exponentialRampToValueAtTime(0.001, t + speedMs * 0.0035);

        bassOsc.connect(bassGain);
        bassGain.connect(this.ctx.destination);
        bassOsc.start(t);
        bassOsc.stop(t + speedMs * 0.004);
      }

      step++;
    };

    tick();
    this.musicTimer = window.setInterval(tick, speedMs);
  }
}

export const soundManager = new SoundManager();
