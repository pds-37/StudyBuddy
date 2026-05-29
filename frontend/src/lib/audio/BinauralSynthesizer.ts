export class BinauralSynthesizer {
  private audioCtx: AudioContext | null = null;
  private oscL: OscillatorNode | null = null;
  private oscR: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private active = false;

  constructor() {
    // Audio Context is initialized lazily upon user interaction
  }

  private initContext() {
    if (this.audioCtx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.audioCtx = new AudioContextClass();
  }

  public start(mode: "alpha" | "theta" | "space_drone" = "alpha") {
    if (this.active) return;
    this.initContext();
    if (!this.audioCtx) return;

    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }

    // 1. Create main Master Volume Gain
    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.setValueAtTime(0.08, this.audioCtx.currentTime); // keep it subtle and ambient
    this.gainNode.connect(this.audioCtx.destination);

    // 2. Setup carrier frequencies based on target brainwaves
    // Carrier: 150Hz.
    // - Alpha (10Hz difference): Left 150Hz, Right 160Hz -> induces deep active focus
    // - Theta (5Hz difference): Left 150Hz, Right 155Hz -> induces recovery & stress release
    let freqL = 150;
    let freqR = 160;

    if (mode === "theta") {
      freqR = 155;
    }

    // 3. Create Left Channel Oscillator
    this.oscL = this.audioCtx.createOscillator();
    this.oscL.type = "sine";
    this.oscL.frequency.setValueAtTime(freqL, this.audioCtx.currentTime);

    const pannerL = this.audioCtx.createStereoPanner ? this.audioCtx.createStereoPanner() : null;
    if (pannerL) {
      pannerL.pan.setValueAtTime(-1, this.audioCtx.currentTime);
      this.oscL.connect(pannerL);
      pannerL.connect(this.gainNode);
    } else {
      this.oscL.connect(this.gainNode);
    }

    // 4. Create Right Channel Oscillator
    this.oscR = this.audioCtx.createOscillator();
    this.oscR.type = "sine";
    this.oscR.frequency.setValueAtTime(freqR, this.audioCtx.currentTime);

    const pannerR = this.audioCtx.createStereoPanner ? this.audioCtx.createStereoPanner() : null;
    if (pannerR) {
      pannerR.pan.setValueAtTime(1, this.audioCtx.currentTime);
      this.oscR.connect(pannerR);
      pannerR.connect(this.gainNode);
    } else {
      this.oscR.connect(this.gainNode);
    }

    // 5. Generate spacecraft/pink noise hum buffer (Space Drone)
    const bufferSize = 2 * this.audioCtx.sampleRate;
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    // Simple brown/pink noise filtering to simulate deep engine hums
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Low pass filter
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      // Amplify deep hum
      output[i] *= 4.5;
    }

    this.noiseNode = this.audioCtx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    // Deep hum filter (removes high noise friction)
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(90, this.audioCtx.currentTime); // deep spacecraft bass

    this.noiseGain = this.audioCtx.createGain();
    this.noiseGain.gain.setValueAtTime(0.35, this.audioCtx.currentTime);

    this.noiseNode.connect(filter);
    filter.connect(this.noiseGain);
    this.noiseGain.connect(this.gainNode);

    // 6. Start audio generation
    this.oscL.start();
    this.oscR.start();
    this.noiseNode.start();

    this.active = true;
  }

  public stop() {
    if (!this.active) return;

    try {
      if (this.oscL) {
        this.oscL.stop();
        this.oscL.disconnect();
      }
      if (this.oscR) {
        this.oscR.stop();
        this.oscR.disconnect();
      }
      if (this.noiseNode) {
        this.noiseNode.stop();
        this.noiseNode.disconnect();
      }
      if (this.gainNode) {
        this.gainNode.disconnect();
      }
      if (this.noiseGain) {
        this.noiseGain.disconnect();
      }
    } catch (e) {
      console.warn("Failed to stop synthesizer cleanly:", e);
    }

    this.oscL = null;
    this.oscR = null;
    this.noiseNode = null;
    this.gainNode = null;
    this.noiseGain = null;
    this.active = false;
  }

  public setVolume(volume: number) {
    if (!this.gainNode || !this.audioCtx) return;
    // Map volume 0.0 - 1.0 to comfortable db gain (0.0 - 0.2)
    const clampedVolume = Math.max(0, Math.min(0.2, volume * 0.2));
    this.gainNode.gain.setValueAtTime(clampedVolume, this.audioCtx.currentTime);
  }

  public isActive(): boolean {
    return this.active;
  }
}

// Export a single global instance for instant cross-viewport state synchronization
export const binauralSynthesizer = new BinauralSynthesizer();
