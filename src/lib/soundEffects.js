// Web Audio API Sound Synthesizer & Audio Player para el Sorteo / Bolillero
class SorteoSoundPlayer {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.audioElement = null;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    if (!this.enabled && this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      } catch (e) {}
    }
    return this.enabled;
  }

  // Sonido suave de pelota rebotando en el bolillero
  playBallClick() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'triangle';
      const freq = 420 + Math.random() * 260;
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  }

  // Sonido suave de giro / aceleración
  playWhoosh() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.22);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(350, now);
      filter.frequency.exponentialRampToValueAtTime(1200, now + 0.12);
      filter.frequency.exponentialRampToValueAtTime(450, now + 0.22);
      filter.Q.value = 2.0;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.22);
    } catch (e) {}
  }

  // Golpe sutil al cuero del balón
  playKick() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Sub-bass thump cálido y suave
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(145, now);
      osc.frequency.exponentialRampToValueAtTime(42, now + 0.12);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  // Pitido / Chime moderno, sutil y armónico (tono cálido y agradable)
  synthesizeChime() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Melodía elegante y sutil de 3 tonos cristalinos (E5 -> A5 -> C#6)
      const notes = [
        { freq: 659.25, time: now + 0.0, gain: 0.12 },
        { freq: 880.00, time: now + 0.09, gain: 0.14 },
        { freq: 1108.73, time: now + 0.18, gain: 0.15 }
      ];

      notes.forEach((n) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.freq, n.time);

        gain.gain.setValueAtTime(0.001, n.time);
        gain.gain.linearRampToValueAtTime(n.gain, n.time + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, n.time + 0.85);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(n.time);
        osc.stop(n.time + 0.85);
      });
    } catch (e) {}
  }

  // Revelación con tono moderno sutil y agradable
  playReveal() {
    if (!this.enabled) return;
    try {
      if (typeof window !== 'undefined') {
        if (!this.audioElement) {
          this.audioElement = new Audio('/sounds/gol.wav');
        }
        this.audioElement.currentTime = 0;
        this.audioElement.volume = 0.6;
        const playPromise = this.audioElement.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            this.synthesizeChime();
          });
        }
        return;
      }
    } catch (e) {
      this.synthesizeChime();
    }
  }

  // Fanfarria final al completar el sorteo
  playFanfare() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        const start = now + idx * 0.08;
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 0.6);
      });
    } catch (e) {}
  }
}

export const soundPlayer = typeof window !== 'undefined' ? new SorteoSoundPlayer() : null;
