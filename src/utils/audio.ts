// Web Audio API tone generator for timer beeps & chimes without external assets
class SoundFX {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Soft exam timer tick alert
  playTick() {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  // 2-minute remaining warning chime (two-tone soft alert)
  playWarningChime() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.frequency.setValueAtTime(880, now + 0.2); // A5
    gain2.gain.setValueAtTime(0.12, now + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.2);
    osc2.stop(now + 0.7);
  }

  // Exam completion bell / Pomodoro bell
  playCompletionBell() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C chord chime
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + i * 0.12);
      gain.gain.setValueAtTime(0.15, now + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 1.2);
    });
  }
}

export const soundFX = new SoundFX();

// Clean text for speech synthesis
export function stripMarkdownForSpeech(md: string): string {
  if (!md) return "";
  return md
    .replace(/```[\s\S]*?```/g, "Code block omitted.")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#+\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\|[^\n]+\|/g, " ")
    .replace(/-{3,}/g, " ")
    .replace(/^\s*[-*+]\s+/gm, " Point: ")
    .replace(/^\s*\d+\.\s+/gm, " Step: ")
    .replace(/>\s+/gm, " Note: ")
    .replace(/\n+/g, ". ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// Text-to-Speech Controller with SpeechSynthesis API and Speed Controls
export class SpeechController {
  private utterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking = false;
  private isPaused = false;
  private onStateChange: ((speaking: boolean, paused: boolean) => void) | null = null;

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        // Voices loaded
      };
    }
  }

  setCallback(cb: (speaking: boolean, paused: boolean) => void) {
    this.onStateChange = cb;
  }

  speak(text: string, rate: number = 1.0, onEnd?: () => void) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      console.warn("SpeechSynthesis not supported");
      return;
    }

    this.stop();

    const clean = stripMarkdownForSpeech(text);
    if (!clean) return;

    const utt = new SpeechSynthesisUtterance(clean);
    utt.rate = Math.max(0.5, Math.min(2.0, rate));
    utt.pitch = 1.0;

    // Pick an English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) => (v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Premium") || v.name.includes("Samantha")))
    ) || voices.find((v) => v.lang.startsWith("en"));

    if (naturalVoice) {
      utt.voice = naturalVoice;
    }

    utt.onstart = () => {
      this.isSpeaking = true;
      this.isPaused = false;
      this.onStateChange?.(true, false);
    };

    utt.onend = () => {
      this.isSpeaking = false;
      this.isPaused = false;
      this.onStateChange?.(false, false);
      onEnd?.();
    };

    utt.onerror = () => {
      this.isSpeaking = false;
      this.isPaused = false;
      this.onStateChange?.(false, false);
    };

    this.utterance = utt;
    window.speechSynthesis.speak(utt);
  }

  pause() {
    if (typeof window !== "undefined" && "speechSynthesis" in window && this.isSpeaking && !this.isPaused) {
      window.speechSynthesis.pause();
      this.isPaused = true;
      this.onStateChange?.(true, true);
    }
  }

  resume() {
    if (typeof window !== "undefined" && "speechSynthesis" in window && this.isSpeaking && this.isPaused) {
      window.speechSynthesis.resume();
      this.isPaused = false;
      this.onStateChange?.(true, false);
    }
  }

  stop() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      this.isPaused = false;
      this.onStateChange?.(false, false);
    }
  }

  setRate(rate: number) {
    if (this.utterance && this.isSpeaking) {
      // Re-trigger with new rate at current position
      const fullText = this.utterance.text;
      this.speak(fullText, rate);
    }
  }
}

export const speechController = new SpeechController();
