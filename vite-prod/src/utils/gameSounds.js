// Game sound effects using Web Audio API - no external files needed
// All sounds are synthesized programmatically
// Uses shared AudioContext from hebrewAudio.js (unlocked on iOS via user gesture)

import { getAudioContext } from './hebrewAudio.js';

function playTone(frequency, duration, type = 'sine', volume = 0.3, delay = 0) {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  } catch (e) {
    // Silently fail if audio not available
  }
}

// Correct answer - bright ascending chime (C-E-G)
export function playCorrect() {
  playTone(523, 0.12, 'sine', 0.25, 0);      // C5
  playTone(659, 0.12, 'sine', 0.25, 0.08);    // E5
  playTone(784, 0.2, 'sine', 0.2, 0.16);      // G5
  haptic('correct');
}

// Wrong answer - soft low tone
export function playWrong() {
  playTone(220, 0.25, 'sine', 0.15, 0);       // A3 soft
  playTone(196, 0.3, 'sine', 0.12, 0.1);      // G3
  haptic('wrong');
}

// Button tap - short click
export function playTap() {
  playTone(800, 0.05, 'sine', 0.1, 0);
  haptic('tap');
}

// Pop sound - for bubble popping
export function playPop() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 600;
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
    gain.gain.value = 0.2;
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {}
  haptic('tap');
}

// Splash - for items landing in buckets
export function playSplash() {
  try {
    const ctx = getAudioContext();
    // White noise burst
    const bufferSize = ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) * 0.3;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    source.connect(filter);
    filter.connect(ctx.destination);
    source.start();
  } catch (e) {}
  haptic('tap');
}

// Level complete fanfare
export function playComplete() {
  // C-E-G-C ascending fanfare
  playTone(523, 0.15, 'sine', 0.2, 0);      // C5
  playTone(659, 0.15, 'sine', 0.2, 0.12);   // E5
  playTone(784, 0.15, 'sine', 0.2, 0.24);   // G5
  playTone(1047, 0.35, 'sine', 0.25, 0.36); // C6
  // Harmony
  playTone(523, 0.35, 'triangle', 0.1, 0.36);
  playTone(784, 0.35, 'triangle', 0.1, 0.36);
  haptic('complete');
}

// Star earned sound
export function playStar() {
  playTone(880, 0.1, 'sine', 0.15, 0);       // A5
  playTone(1175, 0.2, 'sine', 0.12, 0.08);   // D6
  haptic('tap');
}

// Whoosh - for items flying
export function playWhoosh() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 300;
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
    gain.gain.value = 0.08;
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch (e) {}
}

// Haptic feedback
function haptic(type) {
  if (!navigator.vibrate) return;
  switch (type) {
    case 'tap':
      navigator.vibrate(10);
      break;
    case 'correct':
      navigator.vibrate([30, 50, 30]);
      break;
    case 'wrong':
      navigator.vibrate(80);
      break;
    case 'complete':
      navigator.vibrate([50, 80, 50, 80, 50]);
      break;
    default:
      navigator.vibrate(10);
  }
}
