"use client";

export class AudioController {
  private static ctx: AudioContext | null = null;
  
  // Track active nodes to dispose of them cleanly
  private static activeSourceNodes: any[] = [];
  private static activeLFO: any = null;
  private static chordTimer: any = null;
  public static currentChannel: "lofi" | "rain" | "crackle" | "off" = "off";

  private static init() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      } catch (err) {
        console.warn("Web Audio API is not supported in this browser:", err);
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // Stop all active synthesizers
  public static stopAll() {
    if (this.chordTimer) {
      clearInterval(this.chordTimer);
      this.chordTimer = null;
    }
    
    this.activeSourceNodes.forEach((node) => {
      try {
        node.stop();
      } catch (e) {}
    });
    this.activeSourceNodes = [];

    if (this.activeLFO) {
      try {
        this.activeLFO.stop();
      } catch (e) {}
      this.activeLFO = null;
    }
  }

  // Set active ambient channel
  public static setChannel(channel: "lofi" | "rain" | "crackle" | "off") {
    this.init();
    if (!this.ctx) return;

    // 1. Clean up running synths
    this.stopAll();
    this.currentChannel = channel;

    if (channel === "off") return;

    // 2. Launch selected procedural generator
    if (channel === "lofi") {
      this.startLofiSynth();
    } else if (channel === "rain") {
      this.startRainSynth();
    } else if (channel === "crackle") {
      this.startCrackleSynth();
    }
  }

  // Cycle to next audio channel
  public static cycleChannel(): "lofi" | "rain" | "crackle" | "off" {
    const sequence: ("lofi" | "rain" | "crackle" | "off")[] = ["lofi", "rain", "crackle", "off"];
    const currentIndex = sequence.indexOf(this.currentChannel);
    const nextIndex = (currentIndex + 1) % sequence.length;
    const nextChannel = sequence[nextIndex];
    
    this.setChannel(nextChannel);
    this.playPopClick(); // Click feedback
    
    return nextChannel;
  }

  // Synthesize Rhodes-like warm lofi chords with tape pitch wobble (wow-and-flutter)
  private static startLofiSynth() {
    const ctx = this.ctx!;
    
    // Tape wobble LFO (soft vibrato)
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(4.2, ctx.currentTime); // 4.2Hz flutter
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(1.8, ctx.currentTime); // 1.8Hz pitch wobble
    lfo.connect(lfoGain);
    lfo.start();
    this.activeLFO = lfo;

    // Rhodes lowpass muffle filter
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(380, ctx.currentTime);

    // Warm master volume
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.2, ctx.currentTime);
    
    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    // "Shape of You" chord progression in C# minor (C#m - F#m - A - B)
    const chords = [
      [138.59, 164.81, 207.65, 277.18], // C#m
      [185.00, 220.00, 277.18, 369.99], // F#m
      [220.00, 277.18, 329.63, 440.00], // A
      [246.94, 311.13, 369.99, 493.88]  // B
    ];

    let chordIdx = 0;

    const playChordTrigger = () => {
      const freqArray = chords[chordIdx];
      chordIdx = (chordIdx + 1) % chords.length;

      const chordDuration = 1.8;
      const oscillators: OscillatorNode[] = [];
      const chordGain = ctx.createGain();

      chordGain.gain.setValueAtTime(0.001, ctx.currentTime);
      chordGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05); // faster, pluckier attack
      chordGain.gain.setValueAtTime(0.15, ctx.currentTime + chordDuration - 0.5);
      chordGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + chordDuration); // decay

      freqArray.forEach((freq) => {
        const osc = ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        lfoGain.connect(osc.frequency); // Apply tape pitch flutter

        osc.connect(chordGain);
        osc.start();
        osc.stop(ctx.currentTime + chordDuration);
        this.activeSourceNodes.push(osc);
      });

      chordGain.connect(filter);
    };

    // Trigger instantly, then loop with Shape of You tempo (every 2.2 seconds)
    playChordTrigger();
    this.chordTimer = setInterval(playChordTrigger, 2200);
  }

  // Synthesize rain storm ambient noise modulated by a wind LFO
  private static startRainSynth() {
    const ctx = this.ctx!;
    const bufferSize = ctx.sampleRate * 2.0;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;

    // Bandpass filter to create rain sound
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(950, ctx.currentTime);
    filter.Q.setValueAtTime(0.6, ctx.currentTime);

    // Wind modulation LFO
    const windLFO = ctx.createOscillator();
    windLFO.frequency.setValueAtTime(0.15, ctx.currentTime); // slow gusts
    const windGain = ctx.createGain();
    windGain.gain.setValueAtTime(0.04, ctx.currentTime);
    windLFO.connect(windGain);
    
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.12, ctx.currentTime);
    
    // Wind gusts modulate filter frequency
    windGain.connect(filter.frequency);
    
    noiseNode.connect(filter);
    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    noiseNode.start();
    windLFO.start();
    
    this.activeSourceNodes.push(noiseNode);
    this.activeLFO = windLFO;
  }

  // Synthesize vinyl static crackle and pops
  private static startCrackleSynth() {
    const ctx = this.ctx!;
    
    // Looping low-level pinkish noise
    const bufferSize = ctx.sampleRate * 1.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.08;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1400, ctx.currentTime);
    filter.Q.setValueAtTime(1.0, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.06, ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
    
    this.activeSourceNodes.push(noise);

    // Click generator loop
    const clickTrigger = () => {
      if (this.currentChannel !== "crackle") return;

      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();

      clickOsc.type = "sine";
      clickOsc.frequency.setValueAtTime(180, ctx.currentTime);
      clickOsc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.012);

      clickGain.gain.setValueAtTime(0.001, ctx.currentTime);
      clickGain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.002);
      clickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.015);

      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);
      clickOsc.start();
      clickOsc.stop(ctx.currentTime + 0.02);

      // Schedule next random pop
      const nextDelay = 80 + Math.random() * 900;
      setTimeout(clickTrigger, nextDelay);
    };

    // Trigger pops
    clickTrigger();
  }

  // Synthesize paper tearing/rustling sound
  public static playPaperRustle() {
    this.init();
    if (!this.ctx) return;
    const ctx = this.ctx;

    const duration = 0.45;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(2200, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + duration);
    filter.Q.setValueAtTime(1.5, ctx.currentTime);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.08);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration - 0.02);

    noiseNode.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noiseNode.start();
    noiseNode.stop(ctx.currentTime + duration);
  }

  // Synthesize pop click feedback sound
  public static playPopClick() {
    this.init();
    if (!this.ctx) return;
    const ctx = this.ctx;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.08);

    gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 0.015);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }
}
