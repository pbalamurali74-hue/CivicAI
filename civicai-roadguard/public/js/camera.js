/**
 * CivicAI RoadGuard - Camera Stream Controller
 * Handles hardware camera negotiation for Laptop (Webcam/USB) & Mobile (Front/Rear environment),
 * live FPS calculation, stream resolution detection, snapshot capture, and fail-safe demo road synthesis.
 */

class RoadGuardCamera {
  constructor(videoElement, canvasOverlayElement) {
    this.video = videoElement;
    this.canvas = canvasOverlayElement;
    this.stream = null;
    this.active = false;
    this.facingMode = 'environment'; // 'environment' (rear) or 'user' (front)
    this.availableDevices = [];
    this.currentDeviceId = null;

    // Stream metrics
    this.resolution = { width: 0, height: 0 };
    this.fps = 0;
    this.frameCount = 0;
    this.lastFpsUpdate = performance.now();

    // Fallback road synthesis animation if camera is denied/unavailable
    this.isSynthesized = false;
    this.synthInterval = null;

    // Snapshot offscreen canvas
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCtx = this.offscreenCanvas.getContext('2d');
  }

  async enumerateVideoDevices() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        return [];
      }
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.availableDevices = devices.filter(d => d.kind === 'videoinput');
      return this.availableDevices;
    } catch (e) {
      console.warn('Could not enumerate devices:', e);
      return [];
    }
  }

  async startCamera(preferredFacing = 'environment') {
    this.stopSynthesizer();
    this.facingMode = preferredFacing;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('getUserMedia not supported in this browser context (likely unsecure HTTP origin).');
      this.startSynthesizedRoadStream('Browser requires HTTPS for camera');
      return false;
    }

    // Stop existing stream if any
    this.stopCamera();

    const constraints = {
      audio: false,
      video: {
        facingMode: { ideal: this.facingMode },
        width: { ideal: 1280, min: 640 },
        height: { ideal: 720, min: 480 },
        frameRate: { ideal: 30, max: 60 }
      }
    };

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.video.srcObject = this.stream;
      await this.video.play();
      this.active = true;
      this.isSynthesized = false;

      // Update resolution once video is ready
      this.video.onloadedmetadata = () => {
        this.resolution = {
          width: this.video.videoWidth,
          height: this.video.videoHeight
        };
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        console.log(`[Camera] Started live stream: ${this.resolution.width}x${this.resolution.height} (${this.facingMode})`);
      };

      // Query devices after permission granted
      this.enumerateVideoDevices();
      return true;
    } catch (err) {
      console.warn('Camera access could not be acquired:', err.name, err.message);
      let reason = 'Camera access blocked or device unavailable';
      if (err.name === 'NotAllowedError') reason = 'Camera permission was denied in browser';
      if (err.name === 'NotFoundError') reason = 'No camera sensor found on this machine';
      this.startSynthesizedRoadStream(reason);
      return false;
    }
  }

  async switchCamera() {
    this.facingMode = (this.facingMode === 'environment') ? 'user' : 'environment';
    return await this.startCamera(this.facingMode);
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.video) {
      this.video.srcObject = null;
    }
    this.active = false;
    this.fps = 0;
  }

  tickFps() {
    this.frameCount++;
    const now = performance.now();
    const elapsed = now - this.lastFpsUpdate;
    if (elapsed >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / elapsed);
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }
    return this.fps;
  }

  /**
   * Fallback: Synthesizes an animated live road perspective canvas stream
   * if physical camera permission is denied or running in an environment without a camera.
   */
  startSynthesizedRoadStream(reason = 'Simulated Road Stream Active') {
    this.stopCamera();
    this.isSynthesized = true;
    this.active = true;
    this.resolution = { width: 1280, height: 720 };
    this.canvas.width = 1280;
    this.canvas.height = 720;

    let roadOffset = 0;
    const synthCanvas = document.createElement('canvas');
    synthCanvas.width = 1280;
    synthCanvas.height = 720;
    const ctx = synthCanvas.getContext('2d');

    if (this.synthInterval) clearInterval(this.synthInterval);

    this.synthInterval = setInterval(() => {
      roadOffset = (roadOffset + 12) % 100;

      // Sky and horizon
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 1280, 260);

      // Asphalt roadway
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(0, 720);
      ctx.lineTo(440, 260);
      ctx.lineTo(840, 260);
      ctx.lineTo(1280, 720);
      ctx.closePath();
      ctx.fill();

      // Road shoulder & kerb
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 260, 440, 460);
      ctx.fillRect(840, 260, 440, 460);

      // Perspective dashed lane divider
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 10;
      ctx.setLineDash([40, 30]);
      ctx.lineDashOffset = -roadOffset;
      ctx.beginPath();
      ctx.moveTo(640, 260);
      ctx.lineTo(640, 720);
      ctx.stroke();

      // White lane outer borders
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 6;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(440, 260);
      ctx.lineTo(100, 720);
      ctx.moveTo(840, 260);
      ctx.lineTo(1180, 720);
      ctx.stroke();

      // Informative banner on stream
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.fillRect(20, 20, 520, 64);
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 16px "SF Pro Display", monospace';
      ctx.fillText('SIMULATED ONBOARD FLEET ROAD FEED', 36, 46);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px monospace';
      ctx.fillText(reason, 36, 68);

      // Transfer synth frame to video stream if possible, or trigger canvas overlay
      if (synthCanvas.captureStream && (!this.video.srcObject || !this.video.srcObject.active)) {
        try {
          const synthStream = synthCanvas.captureStream(30);
          this.video.srcObject = synthStream;
          this.video.play().catch(() => {});
        } catch (e) {
          // captureStream may fail in restricted contexts; canvas handles it
        }
      }
    }, 33);
  }

  stopSynthesizer() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    this.isSynthesized = false;
  }

  /**
   * Captures an instant high-res snapshot of current frame watermarked with metadata
   */
  captureEvidenceFrame(meta = {}) {
    const width = this.resolution.width || 1280;
    const height = this.resolution.height || 720;
    this.offscreenCanvas.width = width;
    this.offscreenCanvas.height = height;

    const ctx = this.offscreenCtx;
    ctx.clearRect(0, 0, width, height);

    // Draw base video frame
    try {
      if (this.video && this.video.readyState >= 2) {
        ctx.drawImage(this.video, 0, 0, width, height);
      } else {
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, width, height);
      }
    } catch (e) {
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, width, height);
    }

    // Draw active bounding boxes / HUD overlay from live canvas
    if (this.canvas) {
      ctx.drawImage(this.canvas, 0, 0, width, height);
    }

    // Embed municipal forensic watermark
    const timeStr = meta.timestamp || new Date().toISOString();
    const locStr = meta.coords ? `${meta.coords.lat}, ${meta.coords.lng}` : '13.006721, 80.202043';
    const vehicleStr = meta.vehicleId || 'MTC-BUS-104A';
    const classStr = meta.detectionClass || 'POTHOLE (HIGH SEVERITY)';

    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(16, height - 80, width - 32, 64);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(16, height - 80, width - 32, 64);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`CIVICAI ROADGUARD FORENSIC EVIDENCE | FLEET ID: ${vehicleStr}`, 32, height - 56);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '13px monospace';
    ctx.fillText(`UTC: ${timeStr}  |  GPS: ${locStr}  |  CLASS: ${classStr}`, 32, height - 32);

    return this.offscreenCanvas.toDataURL('image/jpeg', 0.85);
  }
}

window.RoadGuardCamera = RoadGuardCamera;
