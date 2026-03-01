import { useRef, useCallback } from 'react';

const MAX_CACHE_SIZE = 20;
const audioCache = {};
const accessOrder = [];

function evictOldest() {
  while (accessOrder.length > MAX_CACHE_SIZE) {
    const oldest = accessOrder.shift();
    if (audioCache[oldest]) {
      audioCache[oldest].src = ''; // release resource
      delete audioCache[oldest];
    }
  }
}

export default function useAudio() {
  const audioRef = useRef(null);

  const play = useCallback((src) => {
    try {
      if (!audioCache[src]) {
        audioCache[src] = new Audio(src);
        accessOrder.push(src);
        evictOldest();
      } else {
        // Move to end of access order
        const idx = accessOrder.indexOf(src);
        if (idx > -1) accessOrder.splice(idx, 1);
        accessOrder.push(src);
      }
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
