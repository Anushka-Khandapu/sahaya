// Web Audio API emergency synthesizer
class SoundEngine {
  private ctx: AudioContext | null = null;
  private sirenOsc1: OscillatorNode | null = null;
  private sirenOsc2: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private sirenInterval: number | null = null;
  public isSirenPlaying: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play oscillating emergency siren
  public startSiren() {
    if (this.isSirenPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      this.isSirenPlaying = true;
      const now = this.ctx.currentTime;

      // Master gain
      this.sirenGain = this.ctx.createGain();
      this.sirenGain.gain.setValueAtTime(0.85, now);
      this.sirenGain.connect(this.ctx.destination);

      // Primary oscillator
      this.sirenOsc1 = this.ctx.createOscillator();
      this.sirenOsc1.type = 'sawtooth';
      this.sirenOsc1.frequency.setValueAtTime(700, now);
      this.sirenOsc1.connect(this.sirenGain);

      // Secondary harmonizing oscillator for piercing sound
      this.sirenOsc2 = this.ctx.createOscillator();
      this.sirenOsc2.type = 'square';
      this.sirenOsc2.frequency.setValueAtTime(900, now);
      
      const osc2Gain = this.ctx.createGain();
      osc2Gain.gain.setValueAtTime(0.4, now);
      this.sirenOsc2.connect(osc2Gain);
      osc2Gain.connect(this.sirenGain);

      this.sirenOsc1.start(now);
      this.sirenOsc2.start(now);

      // Modulation cycle (Police wail)
      let high = false;
      this.sirenInterval = window.setInterval(() => {
        if (!this.ctx || !this.sirenOsc1 || !this.sirenOsc2) return;
        const t = this.ctx.currentTime;
        if (high) {
          this.sirenOsc1.frequency.exponentialRampToValueAtTime(700, t + 0.45);
          this.sirenOsc2.frequency.exponentialRampToValueAtTime(880, t + 0.45);
        } else {
          this.sirenOsc1.frequency.exponentialRampToValueAtTime(1200, t + 0.45);
          this.sirenOsc2.frequency.exponentialRampToValueAtTime(1450, t + 0.45);
        }
        high = !high;
      }, 500);

    } catch (e) {
      console.warn('Audio playback error', e);
      this.isSirenPlaying = false;
    }
  }

  public stopSiren() {
    if (this.sirenInterval) {
      clearInterval(this.sirenInterval);
      this.sirenInterval = null;
    }

    if (this.sirenOsc1) {
      try {
        this.sirenOsc1.stop();
        this.sirenOsc1.disconnect();
      } catch {}
      this.sirenOsc1 = null;
    }

    if (this.sirenOsc2) {
      try {
        this.sirenOsc2.stop();
        this.sirenOsc2.disconnect();
      } catch {}
      this.sirenOsc2 = null;
    }

    if (this.sirenGain) {
      try {
        this.sirenGain.disconnect();
      } catch {}
      this.sirenGain = null;
    }

    this.isSirenPlaying = false;
  }

  // Ticking sound during countdown
  public playBeep(frequency = 880, duration = 0.15) {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, now);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {}
  }

  // Arrival / success chime
  public playSuccessChime() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
      notes.forEach((freq, i) => {
        setTimeout(() => {
          this.playBeep(freq, 0.25);
        }, i * 120);
      });
    } catch {}
  }
}

export const audioService = new SoundEngine();
