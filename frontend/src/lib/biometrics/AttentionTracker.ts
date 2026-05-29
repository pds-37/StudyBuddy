export interface AttentionMetrics {
  focusPercentage: number;
  fatiguePercentage: number;
  isDistracted: boolean;
}

export interface AttentionTrackerOptions {
  onMetricsUpdate?: (metrics: AttentionMetrics) => void;
  onFocusLapse?: () => void;
  onFatigueDetected?: () => void;
  fps?: number;
}

export class AttentionTracker {
  private stream: MediaStream | null = null;
  private videoEl: HTMLVideoElement | null = null;
  private canvasEl: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private intervalId: any = null;
  
  private lastFrameData: ImageData | null = null;
  private focusScore = 100;
  private fatigueScore = 0;
  
  // Track gaze drift & blink history
  private blinkStreak = 0;
  private stillFrameCount = 0;
  private distractionFrameCount = 0;

  constructor(private options: AttentionTrackerOptions = {}) {}

  public async start(videoElement: HTMLVideoElement): Promise<void> {
    if (this.stream) return; // already running

    try {
      this.videoEl = videoElement;
      
      // Request light camera permission (low res to protect performance & memory)
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, frameRate: 15 },
        audio: false
      });

      this.videoEl.srcObject = this.stream;
      this.videoEl.muted = true;
      this.videoEl.playsInline = true;
      
      // Wait for metadata to load and play
      await new Promise<void>((resolve) => {
        if (!this.videoEl) return resolve();
        this.videoEl.onloadedmetadata = () => {
          this.videoEl?.play().then(() => resolve()).catch(() => resolve());
        };
      });

      // Initialize offscreen analysis canvas
      this.canvasEl = document.createElement("canvas");
      this.canvasEl.width = 80; // ultra low-res for speed and low CPU overhead
      this.canvasEl.height = 60;
      this.ctx = this.canvasEl.getContext("2d", { willReadFrequently: true });

      // Start processing loop at 5 fps (200ms intervals) to save CPU energy
      const interval = 1000 / (this.options.fps || 5);
      this.intervalId = setInterval(() => this.processFrame(), interval);

      console.log("Attention Bio-Feedback Tracker successfully activated.");
    } catch (err) {
      console.error("Failed to start webcam attention tracking:", err);
      throw err;
    }
  }

  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.videoEl) {
      this.videoEl.srcObject = null;
      this.videoEl = null;
    }

    this.lastFrameData = null;
    this.canvasEl = null;
    this.ctx = null;
    this.focusScore = 100;
    this.fatigueScore = 0;
    this.blinkStreak = 0;
    this.stillFrameCount = 0;
    this.distractionFrameCount = 0;
    console.log("Attention Bio-Feedback Tracker stopped.");
  }

  private processFrame() {
    if (!this.videoEl || !this.ctx || !this.canvasEl) return;

    try {
      // Draw low-res video frame to offscreen canvas
      this.ctx.drawImage(this.videoEl, 0, 0, this.canvasEl.width, this.canvasEl.height);
      const frameData = this.ctx.getImageData(0, 0, this.canvasEl.width, this.canvasEl.height);

      if (!this.lastFrameData) {
        this.lastFrameData = frameData;
        return;
      }

      const current = frameData.data;
      const prev = this.lastFrameData.data;
      const length = current.length;

      let movementSum = 0;
      let facePixelsCount = 0;
      
      // Gaze/Eye tracking approximation
      // Measure average brightness/contrast ratios across middle sectors
      let leftSectorBrightness = 0;
      let rightSectorBrightness = 0;
      let centerSectorBrightness = 0;

      for (let i = 0; i < length; i += 4) {
        const r = current[i];
        const g = current[i + 1];
        const b = current[i + 2];
        const brightness = (r + g + b) / 3;

        const pr = prev[i];
        const pg = prev[i + 1];
        const pb = prev[i + 2];
        const prevBrightness = (pr + pg + pb) / 3;

        // Optical flow / movement delta
        movementSum += Math.abs(brightness - prevBrightness);

        // Approximate skin-like pixels for facial bounding estimation
        // Simple human skin hue bounding algorithm in RGB
        if (r > 60 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 15) {
          facePixelsCount++;
          
          // Coordinate tracking
          const pixelIndex = i / 4;
          const px = pixelIndex % this.canvasEl.width;
          const py = Math.floor(pixelIndex / this.canvasEl.width);

          // Sector based tracking to capture gaze directions
          if (py >= 20 && py <= 40) {
            if (px >= 20 && px < 35) leftSectorBrightness += brightness;
            else if (px >= 35 && px <= 45) centerSectorBrightness += brightness;
            else if (px > 45 && px <= 60) rightSectorBrightness += brightness;
          }
        }
      }

      const totalPixels = length / 4;
      const averageMovement = movementSum / totalPixels;
      const faceCoverage = facePixelsCount / totalPixels;

      // 1. Attention Analysis (Gaze & Front-Facing Detection)
      let isDistracted = false;

      // If user faces away (coverage drops) or gaze shifts extremely to left/right sectors
      if (faceCoverage < 0.12) {
        isDistracted = true;
      } else {
        const leftRightRatio = Math.abs(leftSectorBrightness - rightSectorBrightness) / (centerSectorBrightness || 1);
        if (leftRightRatio > 1.85) {
          isDistracted = true; // extreme looking away
        }
      }

      // Smooth focus score calculation
      if (isDistracted) {
        this.distractionFrameCount++;
        this.focusScore = Math.max(20, this.focusScore - 7); // drop focus
      } else {
        this.distractionFrameCount = 0;
        this.focusScore = Math.min(100, this.focusScore + 4); // build focus
      }

      // 2. Fatigue Analysis (Blinks & Micro-Sleeps vs High Stillness)
      // Rapid pixel intensity drops in eye regions indicate blinks
      if (averageMovement > 1.2 && averageMovement < 3.8) {
        // Normal focus adjustments / blinking
        this.blinkStreak = 0;
        this.stillFrameCount = 0;
      } else if (averageMovement <= 0.3) {
        // Complete stillness (staring fatigue / fatigue lockdown)
        this.stillFrameCount++;
      } else if (averageMovement > 10.0) {
        // Extreme erratic movements / rubbing face / yawns
        this.blinkStreak++;
      }

      if (this.stillFrameCount > 25 || this.blinkStreak > 4) {
        this.fatigueScore = Math.min(100, this.fatigueScore + 5);
      } else {
        this.fatigueScore = Math.max(0, this.fatigueScore - 2);
      }

      // Save frame for next delta comparison
      this.lastFrameData = frameData;

      // Trigger callbacks
      const metrics: AttentionMetrics = {
        focusPercentage: Math.round(this.focusScore),
        fatiguePercentage: Math.round(this.fatigueScore),
        isDistracted: this.focusScore < 60
      };

      this.options.onMetricsUpdate?.(metrics);

      if (metrics.focusPercentage < 50 && this.distractionFrameCount === 4) {
        this.options.onFocusLapse?.();
      }

      if (metrics.fatiguePercentage > 75 && this.stillFrameCount % 10 === 0) {
        this.options.onFatigueDetected?.();
      }

    } catch (err) {
      console.error("Frame processing delta crash:", err);
    }
  }
}
