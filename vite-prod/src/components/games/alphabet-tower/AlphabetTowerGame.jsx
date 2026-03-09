import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useUserProgress } from '../../../contexts/UserProgressContext.jsx';
import { stopAllAudio, playSequence } from '../../../utils/hebrewAudio.js';
import { playComplete, playStar } from '../../../utils/gameSounds.js';
import { DIFFICULTY_LEVELS, getUnlockedRewards, getNextReward, REWARD_MILESTONES } from './data/alphabet-tower-data.js';
import ModeSelector from './components/ModeSelector.jsx';
import RewardOverlay from './components/RewardOverlay.jsx';
import SpeakliAvatar from '../../../components/kids/SpeakliAvatar.jsx';
import AlphabetOrderMode from './modes/AlphabetOrderMode.jsx';
import MissingLetterMode from './modes/MissingLetterMode.jsx';
import WordBuilderCubeMode from './modes/WordBuilderCubeMode.jsx';
import FallingCubesMode from './modes/FallingCubesMode.jsx';
import AlphabetTrainMode from './modes/AlphabetTrainMode.jsx';
import AIAdaptiveMode from './modes/AIAdaptiveMode.jsx';
import { Star, RotateCcw, ArrowLeft } from 'lucide-react';

// ─── i18n ───────────────────────────────────────────────────────────────────
const WELCOME = { he: 'ברוכים הבאים למגדל האותיות!', ar: 'مرحباً في برج الحروف!', ru: 'Добро пожаловать в Башню алфавита!', en: 'Welcome to Alphabet Tower!' };
const GAME_OVER_TITLE = { he: 'כל הכבוד!', ar: 'أحسنت!', ru: 'Молодец!', en: 'Well Done!' };
const STARS_EARNED = { he: 'כוכבים שהרווחת', ar: 'النجوم المكتسبة', ru: 'Заработано звёзд', en: 'Stars earned' };
const XP_EARNED_LABEL = { he: 'נקודות ניסיון', ar: 'نقاط خبرة', ru: 'Очки опыта', en: 'XP earned' };
const PLAY_AGAIN = { he: 'שחק שוב', ar: 'العب مجدداً', ru: 'Играть снова', en: 'Play Again' };
const BACK_TEXT = { he: 'חזרה', ar: 'رجوع', ru: 'Назад', en: 'Back' };

const MODE_COMPONENTS = {
  alphabetOrder: AlphabetOrderMode,
  missingLetter: MissingLetterMode,
  wordBuilder: WordBuilderCubeMode,
  fallingCubes: FallingCubesMode,
  alphabetTrain: AlphabetTrainMode,
  aiAdaptive: AIAdaptiveMode,
};

const XP_PER_STAR = 5;

const AlphabetTowerGame = React.memo(function AlphabetTowerGame({
  onBack,
  onComplete,
  uiLang,
}) {
  const lang = uiLang || 'en';
  const isRTL = lang === 'he' || lang === 'ar';
  const { progress, updateProgress } = useUserProgress();

  // ─── derived progress ─────────────────────────────────────────────────
  const towerProgress = useMemo(() => progress?.alphabetTower || {
    totalStars: 0,
    modesCompleted: {},
    difficultyUnlocked: 1,
    letterStats: {},
    unlockedCharacters: [],
  }, [progress?.alphabetTower]);

  // ─── state machine ────────────────────────────────────────────────────
  const [screen, setScreen] = useState('select'); // 'select' | 'playing' | 'reward' | 'complete'
  const [currentMode, setCurrentMode] = useState(null);
  const [difficulty, setDifficulty] = useState(towerProgress.difficultyUnlocked || 1);
  const [sessionStars, setSessionStars] = useState(0);
  const [newReward, setNewReward] = useState(null);
  const [letterStatsLocal, setLetterStatsLocal] = useState(towerProgress.letterStats || {});

  const timersRef = useRef([]);
  const hasPlayedWelcomeRef = useRef(false);

  // ─── timer helpers ────────────────────────────────────────────────────
  const addTimer = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  // ─── cleanup on unmount ───────────────────────────────────────────────
  useEffect(() => {
    return () => {
      clearTimers();
      stopAllAudio();
    };
  }, [clearTimers]);

  // ─── welcome guidance on mount ────────────────────────────────────────
  useEffect(() => {
    if (!hasPlayedWelcomeRef.current) {
      hasPlayedWelcomeRef.current = true;
      try {
        playSequence([{ text: WELCOME[lang] || WELCOME.en, lang }]);
      } catch { /* ignore */ }
    }
  }, [lang]);

  // ─── stop audio on screen transitions ─────────────────────────────────
  useEffect(() => {
    try { stopAllAudio(); } catch { /* */ }
  }, [screen]);

  // ─── mode selection ───────────────────────────────────────────────────
  const handleSelectMode = useCallback((modeId, diff) => {
    setCurrentMode(modeId);
    setDifficulty(diff);
    setSessionStars(0);
    setScreen('playing');
  }, []);

  const handleSelectDifficulty = useCallback((diff) => {
    setDifficulty(diff);
  }, []);

  // ─── round complete (accumulate stars) ────────────────────────────────
  const handleRoundComplete = useCallback((stars) => {
    setSessionStars((prev) => prev + stars);
  }, []);

  // ─── letter result from AI adaptive mode ──────────────────────────────
  const handleLetterResult = useCallback((letter, correct) => {
    setLetterStatsLocal((prev) => {
      const existing = prev[letter] || { correct: 0, wrong: 0, total: 0 };
      return {
        ...prev,
        [letter]: {
          correct: existing.correct + (correct ? 1 : 0),
          wrong: existing.wrong + (correct ? 0 : 1),
          total: existing.total + 1,
        },
      };
    });
  }, []);

  // ─── game complete — save progress, check rewards ─────────────────────
  const handleGameComplete = useCallback(async (totalGameStars) => {
    const prevTotalStars = towerProgress.totalStars;
    const newTotalStars = prevTotalStars + totalGameStars;

    // Determine new difficulty unlocked
    let nextUnlockedLevel = towerProgress.difficultyUnlocked;
    for (const dl of DIFFICULTY_LEVELS) {
      if (newTotalStars >= dl.unlockStars) {
        nextUnlockedLevel = Math.max(nextUnlockedLevel, dl.level);
      }
    }

    // Build updated progress
    const updatedProgress = {
      alphabetTower: {
        ...towerProgress,
        totalStars: newTotalStars,
        modesCompleted: {
          ...towerProgress.modesCompleted,
          [currentMode]: (towerProgress.modesCompleted[currentMode] || 0) + 1,
        },
        difficultyUnlocked: nextUnlockedLevel,
        letterStats: letterStatsLocal,
      },
    };

    // Save to Firestore
    try {
      await updateProgress(updatedProgress);
    } catch (err) {
      console.error('AlphabetTowerGame: failed to save progress', err);
    }

    // Check for newly unlocked rewards
    const prevUnlocked = getUnlockedRewards(prevTotalStars);
    const nowUnlocked = getUnlockedRewards(newTotalStars);
    const newRewards = nowUnlocked.filter(
      (r) => !prevUnlocked.some((pr) => pr.id === r.id)
    );

    setSessionStars(totalGameStars);

    if (newRewards.length > 0) {
      // Show first new reward
      setNewReward(newRewards[0]);
      setScreen('reward');
    } else {
      setScreen('complete');
    }
  }, [towerProgress, currentMode, letterStatsLocal, updateProgress]);

  // ─── reward overlay dismissed ─────────────────────────────────────────
  const handleRewardClose = useCallback(() => {
    setNewReward(null);
    setScreen('complete');
  }, []);

  // ─── completion actions ───────────────────────────────────────────────
  const handlePlayAgain = useCallback(() => {
    setCurrentMode(null);
    setSessionStars(0);
    setNewReward(null);
    setScreen('select');
  }, []);

  const handleBack = useCallback(() => {
    try { stopAllAudio(); } catch { /* */ }
    const xp = sessionStars * XP_PER_STAR;
    if (onComplete) onComplete(xp);
    if (onBack) onBack();
  }, [sessionStars, onComplete, onBack]);

  // ─── render: mode selector ────────────────────────────────────────────
  if (screen === 'select') {
    return (
      <ModeSelector
        onSelectMode={handleSelectMode}
        onSelectDifficulty={handleSelectDifficulty}
        onBack={onBack}
        progress={progress}
        uiLang={lang}
      />
    );
  }

  // ─── render: reward overlay ───────────────────────────────────────────
  if (screen === 'reward' && newReward) {
    return (
      <RewardOverlay
        reward={newReward}
        onClose={handleRewardClose}
        uiLang={lang}
      />
    );
  }

  // ─── render: completion screen ────────────────────────────────────────
  if (screen === 'complete') {
    const xp = sessionStars * XP_PER_STAR;

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          minHeight: '100%',
          padding: '32px 16px',
          direction: isRTL ? 'rtl' : 'ltr',
          fontFamily: "'Fredoka', 'Heebo', 'Inter', sans-serif",
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        {/* Avatar */}
        <SpeakliAvatar mode="celebrate" size="lg" />

        {/* Title */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: '#1e293b',
            marginTop: 16,
            marginBottom: 24,
            animation: 'complete-pop 0.5s ease-out',
          }}
        >
          {GAME_OVER_TITLE[lang]}
        </div>

        {/* Stars display */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.9)',
            borderRadius: 24,
            padding: '20px 32px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            marginBottom: 16,
            animation: 'slide-up-complete 0.5s ease-out 0.2s both',
          }}
        >
          {/* Stars */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Star size={28} color="#f59e0b" fill="#f59e0b" />
            <span style={{ fontSize: 36, fontWeight: 800, color: '#f59e0b' }}>
              {sessionStars}
            </span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>
            {STARS_EARNED[lang]}
          </span>

          {/* Divider */}
          <div style={{ width: 60, height: 2, background: '#e2e8f0', borderRadius: 1, margin: '12px 0' }} />

          {/* XP */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: '#8b5cf6' }}>+{xp}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#8b5cf6' }}>XP</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>
            {XP_EARNED_LABEL[lang]}
          </span>
        </div>

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            gap: 14,
            marginTop: 12,
            animation: 'slide-up-complete 0.5s ease-out 0.4s both',
          }}
        >
          {/* Play Again */}
          <button
            onClick={handlePlayAgain}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 28px',
              fontSize: 17,
              fontWeight: 700,
              color: '#fff',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              border: 'none',
              borderRadius: 16,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(22,163,74,0.35)',
              fontFamily: "'Fredoka', 'Heebo', sans-serif",
              transition: 'transform 0.15s',
            }}
            onPointerDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
            onPointerUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <RotateCcw size={20} />
            {PLAY_AGAIN[lang]}
          </button>

          {/* Back */}
          <button
            onClick={handleBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 28px',
              fontSize: 17,
              fontWeight: 700,
              color: '#475569',
              background: 'rgba(255,255,255,0.9)',
              border: '2px solid #e2e8f0',
              borderRadius: 16,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              fontFamily: "'Fredoka', 'Heebo', sans-serif",
              transition: 'transform 0.15s',
            }}
            onPointerDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
            onPointerUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <ArrowLeft size={20} style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }} />
            {BACK_TEXT[lang]}
          </button>
        </div>

        <style>{`
          @keyframes complete-pop {
            0% { transform: scale(0.5); opacity: 0; }
            60% { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes slide-up-complete {
            0% { transform: translateY(24px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // ─── render: playing ──────────────────────────────────────────────────
  const ModeComponent = MODE_COMPONENTS[currentMode];

  if (!ModeComponent) {
    // Fallback — should not happen
    return (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <p>Unknown game mode: {currentMode}</p>
        <button onClick={handlePlayAgain}>Back to menu</button>
      </div>
    );
  }

  // Common props for all modes
  const modeProps = {
    difficulty,
    onRoundComplete: handleRoundComplete,
    onGameComplete: handleGameComplete,
    uiLang: lang,
  };

  // AIAdaptiveMode needs extra props
  if (currentMode === 'aiAdaptive') {
    modeProps.letterStats = letterStatsLocal;
    modeProps.onLetterResult = handleLetterResult;
  }

  return <ModeComponent {...modeProps} />;
});

export default AlphabetTowerGame;
