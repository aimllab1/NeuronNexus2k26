/**
 * Web Audio API Synth for Cyber HUD Sounds
 */
class AudioService {
  private ctx: AudioContext | null = null;
  private alarmInterval: any = null;
  private unlocked = false;
  private pendingAlarm = false;

  constructor() {
    // listen for a user interaction so the AudioContext can be resumed
    const unlock = () => {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {
          /* ignore */
        });
      }
      this.unlocked = true;
      document.removeEventListener('click', unlock);
      document.removeEventListener('keydown', unlock);
      document.removeEventListener('touchstart', unlock);

      // if an alarm was queued because context was locked, start it now
      if (this.pendingAlarm) {
        this.pendingAlarm = false;
        this.realStartAlarm();
      }
    };

    document.addEventListener('click', unlock);
    document.addEventListener('keydown', unlock);
    document.addEventListener('touchstart', unlock);
  }

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended' && this.unlocked) {
      this.ctx.resume().catch(() => {
        /* ignore */
      });
    }
  }

  // Quick blip for hover/click
  playBlip(freq = 800, duration = 0.1, type: OscillatorType = 'sine') {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq / 2, this.ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }

  // Cyber Click
  playClick() {
    this.playBlip(1200, 0.05, 'square');
  }

  // Cyber Hover
  playHover() {
    this.playBlip(600, 0.08, 'sine');
  }

  // Persistent Emergency Alarm
  startAlarm() {
    // if the context hasn't been unlocked yet, queue the alarm and wait for a user gesture
    if (!this.unlocked) {
      this.pendingAlarm = true;
      return;
    }
    if (this.alarmInterval) return;
    this.realStartAlarm();
  }

  private realStartAlarm() {
    if (this.alarmInterval) return;
    this.init();

    const playTone = () => {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(880, now + 0.5);
      osc.frequency.linearRampToValueAtTime(440, now + 1.0);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.1);
      gain.gain.linearRampToValueAtTime(0, now + 0.9);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.0);
    };

    playTone();
    this.alarmInterval = setInterval(playTone, 1000);
  }

  stopAlarm() {
    if (this.alarmInterval) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
  }
}

export const audioService = new AudioService();
