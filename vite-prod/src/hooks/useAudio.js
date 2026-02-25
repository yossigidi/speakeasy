import { useRef, useCallback } from 'react';

const audioCache = {};

export default function useAudio() {
  const audioRef = useRef(null);

  const play = useCallback((src) => {
    try {
      if (!audioCache[src]) {
        audioCache[src] = new Audio(src);
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
