// Background music player singleton
// Uses two HTML5 Audio elements for smooth crossfading between tracks

const TRACKS = {
  'kids-home':    '/sounds/music/kids-home.mp3',
  'kids-games':   '/sounds/music/kids-games.mp3',
  'kids-lessons': '/sounds/music/kids-lessons.mp3',
  'kids-quest':     '/sounds/music/kids-quest.mp3',
  'kids-adventure': '/sounds/music/kids-adventure.mp3',
};

// Mobile speakers are much louder at the same volume level
const IS_MOBILE = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const NORMAL_VOL = IS_MOBILE ? 0.003 : 0.03;
const DUCKED_VOL = IS_MOBILE ? 0.0005 : 0.004;
const FADE_MS = 1200;
const DUCK_MS = 400;

class MusicPlayer {
  constructor() {
    this._a = new Audio();
    this._b = new Audio();
    this._a.loop = true;
    this._b.loop = true;
    this._active = this._a;   // currently playing element
    this._section = null;      // current section id
    this._volume = NORMAL_VOL; // target volume (before duck)
    this._ducked = false;
    this._paused = true;
    this._fadeTimers = new Map();
  }

  /** Crossfade to a new section (or stop if section is null) */
  crossfadeTo(section) {
    if (section === this._section) return;
    this._section = section;

    const src = section ? TRACKS[section] : null;
    if (!src) {
      // Fade out current
      this._fadeOut(this._active, FADE_MS);
      return;
    }

    // Swap active/inactive
    const outgoing = this._active;
    const incoming = this._active === this._a ? this._b : this._a;
    this._active = incoming;

    // Set up incoming
    incoming.src = src;
    incoming.volume = 0;
    incoming.currentTime = 0;
    incoming.play().catch(() => {});

    // Crossfade
    this._fade(incoming, 0, this._ducked ? DUCKED_VOL : this._volume, FADE_MS);
    this._fadeOut(outgoing, FADE_MS);
    this._paused = false;
  }

  play() {
    if (!this._section || !TRACKS[this._section]) return;
    this._active.src = TRACKS[this._section];
    this._active.volume = this._ducked ? DUCKED_VOL : this._volume;
    this._active.play().catch(() => {});
    this._paused = false;
  }

  pause() {
    this._a.pause();
    this._b.pause();
    this._paused = true;
  }

  resume() {
    if (this._paused && this._section) {
      this._active.play().catch(() => {});
      this._paused = false;
    }
  }

  /** Lower volume while TTS is speaking */
  duck() {
    if (this._ducked) return;
    this._ducked = true;
    this._fade(this._active, this._active.volume, DUCKED_VOL, DUCK_MS);
  }

  /** Restore volume after TTS finishes */
  unduck() {
    if (!this._ducked) return;
    this._ducked = false;
    this._fade(this._active, this._active.volume, this._volume, DUCK_MS);
  }

  // ── Private helpers ──

  _fade(el, from, to, ms) {
    if (!el) return;
    if (el.paused) { el.volume = Math.max(0, Math.min(1, to)); return; }
    // Per-element timer so concurrent fades don't cancel each other
    clearInterval(this._fadeTimers.get(el));
    const steps = 20;
    const stepMs = ms / steps;
    const delta = (to - from) / steps;
    let step = 0;
    el.volume = Math.max(0, Math.min(1, from));

    const timer = setInterval(() => {
      step++;
      const v = from + delta * step;
      el.volume = Math.max(0, Math.min(1, v));
      if (step >= steps) {
        clearInterval(timer);
        this._fadeTimers.delete(el);
        el.volume = Math.max(0, Math.min(1, to));
      }
    }, stepMs);
    this._fadeTimers.set(el, timer);
  }

  _fadeOut(el, ms) {
    if (!el || el.paused) return;
    this._fade(el, el.volume, 0, ms);
    setTimeout(() => {
      el.pause();
      el.src = '';
    }, ms + 50);
  }
}

let _instance = null;

export function getMusicPlayer() {
  if (!_instance) _instance = new MusicPlayer();
  return _instance;
}
