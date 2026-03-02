import { useRef, useCallback } from 'react';

const MAX_CACHE_SIZE = 20;
const audioCache = {};
const accessOrder = [];

function evictOldest() {
  while (accessOrder.length > MAX_CACHE_SIZE) {
    const oldest = accessOrder.shift();
    if (audioCache[oldest]) {
      try { audioCache[oldest].pause(); } catch (_) {}
      audioCache[oldest].src = '';
      delete audioCache[oldest];
    }
  }
}

export default function useAudio() {
  const audioRef = useRef(null);

  const play = useCallback((src) => {
    try {
      // Remove existing entry from access order (dedup)
      const existingIdx = accessOrder.indexOf(src);
      if (existingIdx > -1) accessOrder.splice(existingIdx, 1);

      if (!audioCache[src]) {
        audioCache[src] = new Audio(src);
      }
      accessOrder.push(src);
      evictOldest();
      const audio = audioCache[src];
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } catch (e) {
      // Silently fail - sounds are non-critical
    }
  }, []);

  const playCorrect = useCallback(() => play('/sounds/correct.mp3'), [play]);
  const playWrong = useCallback(() => play('/sounds/wrong.mp3'), [play]);
  const playLevelUp = useCallback(() => play('/sounds/levelup.mp3'), [play]);
  const playStreak = useCallback(() => play('/sounds/streak.mp3'), [play]);

  return { play, playCorrect, playWrong, playLevelUp, playStreak };
}
