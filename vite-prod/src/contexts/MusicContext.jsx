import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { getMusicPlayer } from '../utils/backgroundMusic.js';

export const MusicContext = createContext(null);

export function MusicProvider({ children }) {
  const [musicEnabled, setMusicEnabled] = useState(() => localStorage.getItem('se-music') !== 'off');
  const [soundsEnabled, setSoundsEnabled] = useState(() => localStorage.getItem('se-sounds') !== 'off');
  const playerRef = useRef(getMusicPlayer());
  const sectionRef = useRef(null);
  const unlockedRef = useRef(false);

  // Persist toggles
  useEffect(() => { localStorage.setItem('se-music', musicEnabled ? 'on' : 'off'); }, [musicEnabled]);
  useEffect(() => { localStorage.setItem('se-sounds', soundsEnabled ? 'on' : 'off'); }, [soundsEnabled]);

  // iOS audio unlock: wait for first user gesture before playing
  useEffect(() => {
    const unlock = () => {
      unlockedRef.current = true;
      // If music is enabled and we have a section queued, start playing
      if (musicEnabled && sectionRef.current) {
        playerRef.current.crossfadeTo(sectionRef.current);
      }
      window.removeEventListener('click', unlock, true);
      window.removeEventListener('touchstart', unlock, true);
    };
    window.addEventListener('click', unlock, true);
    window.addEventListener('touchstart', unlock, true);
    return () => {
      window.removeEventListener('click', unlock, true);
      window.removeEventListener('touchstart', unlock, true);
    };
  }, [musicEnabled]);

  // React to musicEnabled toggle
  useEffect(() => {
    if (musicEnabled) {
      if (unlockedRef.current && sectionRef.current) {
        playerRef.current.crossfadeTo(sectionRef.current);
      }
    } else {
      playerRef.current.pause();
    }
  }, [musicEnabled]);

  const setSection = useCallback((id) => {
    sectionRef.current = id;
    if (!musicEnabled) return;
    if (!unlockedRef.current) return; // wait for gesture
    playerRef.current.crossfadeTo(id);
  }, [musicEnabled]);

  const toggleMusic = useCallback(() => setMusicEnabled(v => !v), []);
  const toggleSounds = useCallback(() => setSoundsEnabled(v => !v), []);

  const duck = useCallback(() => { playerRef.current.duck(); }, []);
  const unduck = useCallback(() => { playerRef.current.unduck(); }, []);

  return (
    <MusicContext.Provider value={{ musicEnabled, soundsEnabled, toggleMusic, toggleSounds, setSection, duck, unduck }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusic must be used within MusicProvider');
  return ctx;
}
