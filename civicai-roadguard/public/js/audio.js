/**
 * CivicAI RoadGuard - Audio Feedback System
 * Uses Web Audio API to generate synthetic radar pings and V2X warning chimes without external audio dependencies.
 */

class RoadGuardAudio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBeep(freq = 880, type = 'sine', duration = 0.12, gainValue = 0.15) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainValue, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  // Double chime for hazard detection (Pothole)
  playHazardAlert() {
    this.playBeep(750, 'triangle', 0.1, 0.2);
    setTimeout(() => {
      this.playBeep(920, 'sine', 0.15, 0.25);
    }, 120);
  }

  // Urgent rapid triple pulse for pedestrian inside danger zone
  playPedestrianWarning() {
    this.playBeep(980, 'sawtooth', 0.08, 0.22);
    setTimeout(() => {
      this.playBeep(1100, 'sawtooth', 0.08, 0.25);
    }, 100);
    setTimeout(() => {
      this.playBeep(1240, 'sawtooth', 0.12, 0.28);
    }, 200);
  }

  // V2X Broadcast confirmation ping
  playV2XBroadcast() {
    this.playBeep(1320, 'sine', 0.06, 0.12);
    setTimeout(() => {
      this.playBeep(1760, 'sine', 0.09, 0.15);
    }, 80);
  }

  // Work order ticket created sound
  playTicketDispatched() {
    this.playBeep(523.25, 'sine', 0.12, 0.18); // C5
    setTimeout(() => {
      this.playBeep(659.25, 'sine', 0.12, 0.18); // E5
    }, 120);
    setTimeout(() => {
      this.playBeep(783.99, 'sine', 0.2, 0.22); // G5
    }, 240);
  }

  toggleSound(forceState) {
    if (typeof forceState === 'boolean') {
      this.enabled = forceState;
    } else {
      this.enabled = !this.enabled;
    }
    return this.enabled;
  }
}

window.roadGuardAudio = new RoadGuardAudio();
