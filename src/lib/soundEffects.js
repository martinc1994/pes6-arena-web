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

  // Sonido de bolilla/pelota rebotando en el bolillero
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

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  }

  // Sonido de extracción / aceleración
  playWhoosh() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.28);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(300, now);
      filter.frequency.exponentialRampToValueAtTime(1600, now + 0.15);
      filter.frequency.exponentialRampToValueAtTime(400, now + 0.28);
      filter.Q.value = 2.5;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.28);
    } catch (e) {}
  }

  // Golpe seco de botín al cuero del balón
  playKick() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Sub-bass thump
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(170, now);
      osc.frequency.exponentialRampToValueAtTime(42, now + 0.12);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);

      // Ruido de impacto del balón
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.05);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const f = this.ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 650;
      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.35, now);
      nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      noise.connect(f);
      f.connect(nGain);
      nGain.connect(this.ctx.destination);
      noise.start(now);
      noise.stop(now + 0.05);
    } catch (e) {}
  }

  // Sonido de Gol + Tribuna sintetizado (como fallback de audio)
  synthesizeGol() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Silbato corto al festejar
      const wOsc = this.ctx.createOscillator();
      const wGain = this.ctx.createGain();
      wOsc.type = 'sine';
      wOsc.frequency.setValueAtTime(2900, now + 0.1);
      wOsc.frequency.linearRampToValueAtTime(3200, now + 0.35);
      wGain.gain.setValueAtTime(0.001, now);
      wGain.gain.linearRampToValueAtTime(0.15, now + 0.12);
      wGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      wOsc.connect(wGain);
      wGain.connect(this.ctx.destination);
      wOsc.start(now + 0.1);
      wOsc.stop(now + 0.4);

      // Rugido de tribuna (filtro pasabanda sobre ruido blanco)
      const duration = 4.2;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(550, now);
      filter.frequency.linearRampToValueAtTime(950, now + 1.2);
      filter.frequency.linearRampToValueAtTime(650, now + 3.8);
      filter.Q.value = 1.6;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.6);
      gain.gain.linearRampToValueAtTime(0.32, now + 2.8);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
      noise.stop(now + duration);
    } catch (e) {}
  }

  // Reproducir FX de Gol con tribuna de fondo (archivo wav o síntesis)
  playKickGol() {
    if (!this.enabled) return;
    try {
      if (typeof window !== 'undefined') {
        if (!this.audioElement) {
          this.audioElement = new Audio('/sounds/gol.wav');
        }
        this.audioElement.currentTime = 0;
        this.audioElement.volume = 0.85;
        const playPromise = this.audioElement.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            this.synthesizeGol();
          });
        }
        return;
      }
    } catch (e) {
      this.synthesizeGol();
    }
  }

  // Revelación con FX de Gol y tribuna
  playReveal() {
    this.playKickGol();
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

        gain.gain.setValueAtTime(0.18, start);
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
