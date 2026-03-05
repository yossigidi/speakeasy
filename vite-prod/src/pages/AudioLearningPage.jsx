import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Play, Pause, SkipForward, SkipBack, Volume2,
  Repeat, ArrowLeft, Headphones, Settings, Zap
} from 'lucide-react';
import { useSpeech } from '../contexts/SpeechContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useUserProgress } from '../contexts/UserProgressContext.jsx';
import { t, RTL_LANGS, lf } from '../utils/translations.js';

import { loadWordData } from '../utils/lazyData.js';

// ── Gradient palette that cycles per word ──────────────────
const GRADIENTS = [
  'from-violet-600 via-purple-500 to-indigo-600',
  'from-blue-600 via-cyan-500 to-teal-500',
  'from-emerald-600 via-green-500 to-lime-500',
  'from-orange-500 via-amber-500 to-yellow-500',
  'from-rose-600 via-pink-500 to-fuchsia-500',
  'from-indigo-600 via-blue-500 to-sky-500',
  'from-teal-600 via-emerald-500 to-green-500',
  'from-fuchsia-600 via-purple-500 to-violet-500',
];

// ── Playback phases ────────────────────────────────────────
const PHASE = {
  IDLE: 'idle',
  ENGLISH_WORD: 'english_word',
  PAUSE_AFTER_WORD: 'pause_after_word',
  HEBREW_TRANSLATION: 'hebrew_translation',
  PAUSE_AFTER_TRANSLATION: 'pause_after_translation',
  EXAMPLE_SENTENCE: 'example_sentence',
  PAUSE_AFTER_EXAMPLE: 'pause_after_example',
};

export default function AudioLearningPage({ onBack }) {
  const { speak, speakSequence, stopSpeaking, isSpeaking } = useSpeech();
  const { uiLang } = useTheme();
  const { progress } = useUserProgress();
  const isRtl = RTL_LANGS.includes(uiLang);

  // ── Lazy-loaded word data ──────────────────────────────
  const [wordsA1, setWordsA1] = useState([]);
  const [wordsA2, setWordsA2] = useState([]);
  useEffect(() => {
    loadWordData('a1').then(setWordsA1).catch(() => {});
    loadWordData('a2').then(setWordsA2).catch(() => {});
  }, []);

  // ── State ──────────────────────────────────────────────
  const [levelFilter, setLevelFilter] = useState('all'); // 'A1' | 'A2' | 'all'
  const [mode, setMode] = useState('full'); // 'words' | 'full'
  const [speed, setSpeed] = useState(1); // 0.7 | 1 | 1.3
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState(PHASE.IDLE);
  const [showSettings, setShowSettings] = useState(false);
  const [repeatMode, setRepeatMode] = useState(false);

  // ── Refs for avoiding stale closures ───────────────────
  const isPlayingRef = useRef(false);
  const currentIndexRef = useRef(0);
  const modeRef = useRef('full');
  const speedRef = useRef(1);
  const phaseRef = useRef(PHASE.IDLE);
  const repeatModeRef = useRef(false);
  const timeoutRef = useRef(null);
  const abortRef = useRef(false);
  const uiLangRef = useRef(uiLang);

  // Sync refs
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);
  useEffect(() => { uiLangRef.current = uiLang; }, [uiLang]);

  // ── Filtered word list ─────────────────────────────────
  const words = useMemo(() => {
    if (levelFilter === 'A1') return wordsA1;
    if (levelFilter === 'A2') return wordsA2;
    return [...wordsA1, ...wordsA2];
  }, [levelFilter, wordsA1, wordsA2]);

  // Reset index when filter changes
  useEffect(() => {
    handleStop();
    setCurrentIndex(0);
    currentIndexRef.current = 0;
  }, [levelFilter]);

  const currentWord = words[currentIndex] || words[0];
  const gradientClass = GRADIENTS[currentIndex % GRADIENTS.length];

  // ── Cleanup on unmount ─────────────────────────────────
  useEffect(() => {
    return () => {
      abortRef.current = true;
      clearTimeout(timeoutRef.current);
      stopSpeaking();
    };
  }, [stopSpeaking]);

  // ── Pause helper ───────────────────────────────────────
  const pause = useCallback((ms) => {
    return new Promise((resolve) => {
      timeoutRef.current = setTimeout(resolve, ms);
    });
  }, []);

  // ── Play sequence for one word ─────────────────────────
  const playWordSequence = useCallback(async (wordObj) => {
    if (!wordObj || abortRef.current) return;
    if (!isPlayingRef.current || abortRef.current) return;

    // Build a sequence of speech items for smooth playback
    const sequence = [];
    const spd = speedRef.current;

    // English word
    sequence.push({ text: wordObj.word, lang: 'en-US', rate: 0.85 * spd });
    sequence.push({ pause: 900 / spd });

    // Native-language translation
    sequence.push({ text: lf(wordObj, 'translation', uiLangRef.current), lang: uiLangRef.current, rate: 0.95 * spd });

    // Example sentence (only in full mode)
    if (modeRef.current === 'full' && wordObj.examples && wordObj.examples.length > 0) {
      sequence.push({ pause: 1200 / spd });
      sequence.push({ text: wordObj.examples[0], lang: 'en-US', rate: 0.9 * spd });
    }

    // Play the whole sequence smoothly
    setPhase(PHASE.ENGLISH_WORD);

    // Track phases as sequence progresses
    let itemIndex = 0;
    const phases = [PHASE.ENGLISH_WORD, PHASE.PAUSE_AFTER_WORD, PHASE.HEBREW_TRANSLATION];
    if (modeRef.current === 'full' && wordObj.examples?.length > 0) {
      phases.push(PHASE.PAUSE_AFTER_TRANSLATION, PHASE.EXAMPLE_SENTENCE);
    }

    await new Promise((resolve) => {
      const origSequence = [...sequence];
      // Wrap each item to track phase
      let speechIndex = 0;
      const patchedSequence = origSequence.map((item) => {
        if (item.pause) {
          return {
            ...item,
            pause: item.pause,
          };
        }
        const phaseIdx = speechIndex;
        speechIndex++;
        return {
          ...item,
          onStart: () => {
            const phaseMap = [PHASE.ENGLISH_WORD, PHASE.HEBREW_TRANSLATION, PHASE.EXAMPLE_SENTENCE];
            setPhase(phaseMap[phaseIdx] || PHASE.ENGLISH_WORD);
          },
        };
      });

      // Use speakSequence for smooth chaining
      let seqIdx = 0;
      const playNext = () => {
        if (seqIdx >= patchedSequence.length || !isPlayingRef.current || abortRef.current) {
          resolve();
          return;
        }
        const item = patchedSequence[seqIdx];
        seqIdx++;

        if (item.pause) {
          setPhase(PHASE.PAUSE_AFTER_WORD);
          timeoutRef.current = setTimeout(playNext, item.pause);
          return;
        }

        if (item.onStart) item.onStart();
        speak(item.text, {
          lang: item.lang,
          rate: item.rate,
          _queued: true,
          onEnd: playNext,
        });
      };

      playNext();
    });

    // Pause before next word
    if (!isPlayingRef.current || abortRef.current) return;
    setPhase(PHASE.PAUSE_AFTER_EXAMPLE);
    await pause(1800 / speedRef.current);
  }, [speak, pause]);

  // ── Auto-play loop ─────────────────────────────────────
  const runPlayback = useCallback(async (startIndex) => {
    abortRef.current = false;
    let idx = startIndex;

    while (idx < words.length) {
      if (!isPlayingRef.current || abortRef.current) break;

      currentIndexRef.current = idx;
      setCurrentIndex(idx);

      await playWordSequence(words[idx]);

      if (!isPlayingRef.current || abortRef.current) break;

      idx++;

      // Handle repeat mode
      if (idx >= words.length && repeatModeRef.current) {
        idx = 0;
      }
    }

    // Reached the end
    if (idx >= words.length && !abortRef.current) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      setPhase(PHASE.IDLE);
    }
  }, [words, playWordSequence]);

  // ── Controls ───────────────────────────────────────────
  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    isPlayingRef.current = true;
    abortRef.current = false;
    runPlayback(currentIndexRef.current);
  }, [runPlayback]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    clearTimeout(timeoutRef.current);
    stopSpeaking();
    setPhase(PHASE.IDLE);
  }, [stopSpeaking]);

  const handleStop = useCallback(() => {
    abortRef.current = true;
    setIsPlaying(false);
    isPlayingRef.current = false;
    clearTimeout(timeoutRef.current);
    stopSpeaking();
    setPhase(PHASE.IDLE);
  }, [stopSpeaking]);

  const handleNext = useCallback(() => {
    clearTimeout(timeoutRef.current);
    stopSpeaking();
    const nextIdx = Math.min(currentIndexRef.current + 1, words.length - 1);
    currentIndexRef.current = nextIdx;
    setCurrentIndex(nextIdx);
    setPhase(PHASE.IDLE);
    if (isPlayingRef.current) {
      abortRef.current = true;
      setTimeout(() => {
        abortRef.current = false;
        isPlayingRef.current = true;
        runPlayback(nextIdx);
      }, 100);
    }
  }, [words.length, stopSpeaking, runPlayback]);

  const handlePrev = useCallback(() => {
    clearTimeout(timeoutRef.current);
    stopSpeaking();
    const prevIdx = Math.max(currentIndexRef.current - 1, 0);
    currentIndexRef.current = prevIdx;
    setCurrentIndex(prevIdx);
    setPhase(PHASE.IDLE);
    if (isPlayingRef.current) {
      abortRef.current = true;
      setTimeout(() => {
        abortRef.current = false;
        isPlayingRef.current = true;
        runPlayback(prevIdx);
      }, 100);
    }
  }, [stopSpeaking, runPlayback]);

  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  }, [isPlaying, handlePause, handlePlay]);

  const cycleSpeed = useCallback(() => {
    setSpeed((prev) => {
      if (prev === 0.7) return 1;
      if (prev === 1) return 1.3;
      return 0.7;
    });
  }, []);

  // ── Phase label for UI ─────────────────────────────────
  const phaseLabel = useMemo(() => {
    switch (phase) {
      case PHASE.ENGLISH_WORD:
        return t('audioPhaseWord', uiLang);
      case PHASE.HEBREW_TRANSLATION:
        return t('audioPhaseTranslation', uiLang);
      case PHASE.EXAMPLE_SENTENCE:
        return t('audioPhaseExample', uiLang);
      case PHASE.PAUSE_AFTER_WORD:
      case PHASE.PAUSE_AFTER_TRANSLATION:
      case PHASE.PAUSE_AFTER_EXAMPLE:
        return t('audioPhaseWaiting', uiLang);
      default:
        return t('audioPhaseReady', uiLang);
    }
  }, [phase, uiLang]);

  // ── Progress percentage ────────────────────────────────
  const progressPercent = words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0;

  // ── Render ─────────────────────────────────────────────
  return (
    <div className={`min-h-screen bg-gradient-to-br ${gradientClass} transition-all duration-1000 ease-in-out`}>
      {/* Overlay for depth */}
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 flex flex-col min-h-screen p-4 pb-8 max-w-lg mx-auto">

        {/* ── Top Bar ─────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6 pt-2">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 active:scale-95 transition-all"
          >
            <ArrowLeft size={20} className={isRtl ? 'rotate-180' : ''} />
          </button>

          <div className="flex items-center gap-2">
            <Headphones size={20} className="text-white/80" />
            <h1 className="text-white font-bold text-lg">
              {t('audioLearning', uiLang)}
            </h1>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 active:scale-95 transition-all"
          >
            <Settings size={20} />
          </button>
        </div>

        {/* ── Settings Panel ──────────────────────────── */}
        {showSettings && (
          <div className="glass-card p-4 mb-4 space-y-4 animate-in slide-in-from-top duration-300"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.25)' }}
          >
            {/* Level Filter */}
            <div>
              <label className="text-white/80 text-sm font-medium mb-2 block">
                {t('filterByLevel', uiLang)}
              </label>
              <div className="flex gap-2">
                {['all', 'A1', 'A2'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setLevelFilter(lvl)}
                    className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition-all ${
                      levelFilter === lvl
                        ? 'bg-white text-gray-900 shadow-lg'
                        : 'bg-white/15 text-white hover:bg-white/25'
                    }`}
                  >
                    {lvl === 'all' ? t('all', uiLang) : lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode Toggle */}
            <div>
              <label className="text-white/80 text-sm font-medium mb-2 block">
                {t('playbackMode', uiLang)}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setMode('words')}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition-all ${
                    mode === 'words'
                      ? 'bg-white text-gray-900 shadow-lg'
                      : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
                >
                  {t('wordsOnly', uiLang)}
                </button>
                <button
                  onClick={() => setMode('full')}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition-all ${
                    mode === 'full'
                      ? 'bg-white text-gray-900 shadow-lg'
                      : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
                >
                  {t('wordsSentences', uiLang)}
                </button>
              </div>
            </div>

            {/* Repeat Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm font-medium">
                {t('autoRepeat', uiLang)}
              </span>
              <button
                onClick={() => setRepeatMode(!repeatMode)}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
                  repeatMode
                    ? 'bg-white text-gray-900'
                    : 'bg-white/15 text-white hover:bg-white/25'
                }`}
              >
                <Repeat size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ── Now Playing Card ────────────────────────── */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Album art card */}
          <div
            className="w-full max-w-sm aspect-square rounded-3xl flex flex-col items-center justify-center p-8 mb-6 relative overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          >
            {/* Decorative rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className={`w-72 h-72 rounded-full border border-white/10 ${isPlaying ? 'animate-pulse' : ''}`} />
              <div className={`absolute w-56 h-56 rounded-full border border-white/5 ${isPlaying ? 'animate-pulse' : ''}`} style={{ animationDelay: '0.5s' }} />
            </div>

            {/* Phase indicator */}
            <div className={`mb-4 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase transition-all duration-300 ${
              phase !== PHASE.IDLE
                ? 'bg-white/25 text-white'
                : 'bg-white/10 text-white/60'
            }`}>
              {phaseLabel}
            </div>

            {/* Main word */}
            <div className={`text-center transition-all duration-500 ${
              phase === PHASE.ENGLISH_WORD ? 'scale-110' : 'scale-100'
            }`}>
              <h2 className="text-5xl font-black text-white mb-2 tracking-tight drop-shadow-lg">
                {currentWord?.word}
              </h2>
              {currentWord?.ipa && (
                <p className="text-white/50 text-sm font-mono mb-3">{currentWord.ipa}</p>
              )}
            </div>

            {/* Translation */}
            <div className={`transition-all duration-500 ${
              phase === PHASE.HEBREW_TRANSLATION ? 'scale-110 opacity-100' : 'scale-100 opacity-70'
            }`}>
              <p className="text-2xl font-bold text-white/90 mb-1" dir={isRtl ? 'rtl' : 'ltr'}>
                {lf(currentWord, 'translation', uiLang)}
              </p>
            </div>

            {/* Example sentence */}
            {mode === 'full' && currentWord?.examples?.[0] && (
              <div className={`mt-4 px-4 transition-all duration-500 ${
                phase === PHASE.EXAMPLE_SENTENCE ? 'opacity-100 scale-105' : 'opacity-50 scale-100'
              }`}>
                <p className="text-sm text-white/80 text-center italic leading-relaxed">
                  "{currentWord.examples[0]}"
                </p>
              </div>
            )}

            {/* Category & Level badge */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <span className="text-xs text-white/40 font-medium capitalize">
                {currentWord?.category}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/15 text-xs text-white/60 font-bold">
                {currentWord?.cefrLevel}
              </span>
            </div>
          </div>

          {/* ── Progress Bar ──────────────────────────── */}
          <div className="w-full max-w-sm mb-2">
            <div className="w-full h-1.5 rounded-full bg-white/15 overflow-hidden">
              <div
                className="h-full rounded-full bg-white/80 transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-xs text-white/50 font-medium">
              <span>{currentIndex + 1} {t('of', uiLang)} {words.length}</span>
              <span>{speed}x</span>
            </div>
          </div>
        </div>

        {/* ── Controls ────────────────────────────────── */}
        <div className="mt-4 space-y-4">
          {/* Main controls row */}
          <div className="flex items-center justify-center gap-6">
            {/* Speed button */}
            <button
              onClick={cycleSpeed}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white/15 backdrop-blur-sm text-white hover:bg-white/25 active:scale-90 transition-all"
            >
              <span className="text-xs font-bold">{speed}x</span>
            </button>

            {/* Previous */}
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="w-14 h-14 flex items-center justify-center rounded-full bg-white/15 backdrop-blur-sm text-white hover:bg-white/25 active:scale-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <SkipBack size={24} fill="white" />
            </button>

            {/* Play / Pause */}
            <button
              onClick={handleTogglePlay}
              className="w-20 h-20 flex items-center justify-center rounded-full bg-white text-gray-900 shadow-2xl hover:scale-105 active:scale-95 transition-all"
              style={{ boxShadow: '0 10px 40px rgba(255,255,255,0.3)' }}
            >
              {isPlaying ? (
                <Pause size={36} fill="currentColor" />
              ) : (
                <Play size={36} fill="currentColor" className="ml-1" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={handleNext}
              disabled={currentIndex >= words.length - 1 && !repeatMode}
              className="w-14 h-14 flex items-center justify-center rounded-full bg-white/15 backdrop-blur-sm text-white hover:bg-white/25 active:scale-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <SkipForward size={24} fill="white" />
            </button>

            {/* Repeat */}
            <button
              onClick={() => setRepeatMode(!repeatMode)}
              className={`w-12 h-12 flex items-center justify-center rounded-full backdrop-blur-sm transition-all active:scale-90 ${
                repeatMode
                  ? 'bg-white/40 text-white'
                  : 'bg-white/15 text-white/50 hover:bg-white/25 hover:text-white'
              }`}
            >
              <Repeat size={18} />
            </button>
          </div>

          {/* Bottom info row */}
          <div className="flex items-center justify-center gap-2 text-white/40 text-xs">
            <Volume2 size={14} />
            <span>
              {mode === 'full' ? t('wordsSentences', uiLang) : t('wordsOnly', uiLang)}
            </span>
            <span className="mx-1">|</span>
            <Zap size={14} />
            <span>
              {levelFilter === 'all' ? t('allLevels', uiLang) : levelFilter}
            </span>
          </div>

          {/* Drive mode hint */}
          <div className="text-center">
            <p className="text-white/30 text-xs">
              {t('driveModeHint', uiLang)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
