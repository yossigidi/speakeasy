import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { ArrowLeft, Volume2, Star, Zap, Trophy, Coins } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { useSpeech } from '../../contexts/SpeechContext.jsx';
import { playSequence, preloadHebrewAudio, preloadEnglishAudio, stopAllAudio } from '../../utils/hebrewAudio.js';
import { playCorrect, playWrong, playPop, playTap, playComplete, playStar, playWhoosh } from '../../utils/gameSounds.js';
import { getWordsForLevel, SENTENCES_BY_LEVEL } from '../../data/kids-vocabulary.js';
import { shuffle } from '../../utils/shuffle.js';
import SpeakliAvatar from '../kids/SpeakliAvatar.jsx';
import { t, tReplace, lf, RTL_LANGS } from '../../utils/translations.js';

// Hebrew phrases preloaded for instant feedback
const RUN_PHRASES = [
  'יוֹפִי!', 'נָכוֹן!', 'מְצוּיָּן!', 'כׇּל הַכָּבוֹד!', 'מַדְהִים!', 'נַסּוּ שׁוּב',
  'רוּצוּ עִם סְפִּיקְלִי! הַקְשִׁיבוּ לַמִּלָּה וְלִחֲצוּ עַל הַתְּשׁוּבָה',
];

// ── World themes ──
const WORLDS = [
  {
    id: 'jungle',
    emoji: '🌴',
    nameHe: 'ג׳ונגל ספארי',
    nameEn: 'Jungle Safari',
    nameAr: 'سفاري الغابة',
    nameRu: 'Сафари в джунглях',
    skyGradient: 'linear-gradient(180deg, #22c55e 0%, #059669 50%, #047857 100%)',
    groundColor: '#92400e',
    groundEmojis: ['🌿', '🍃', '🌺', '🪨', '🍄'],
    farEmojis: ['🏔️', '🌋', '🌴', '🌴', '🏔️', '🌴'],
    midEmojis: ['🦒', '🐘', '🌳', '🦜', '🌿', '🐒', '🌳', '🦁'],
    categories: ['animals', 'nature'],
    filterWords: w => true,
  },
  {
    id: 'food',
    emoji: '🍕',
    nameHe: 'עיר האוכל',
    nameEn: 'Food City',
    nameAr: 'مدينة الطعام',
    nameRu: 'Город еды',
    skyGradient: 'linear-gradient(180deg, #f472b6 0%, #fb923c 50%, #f97316 100%)',
    groundColor: '#d97706',
    groundEmojis: ['🍕', '🍔', '🌮', '🧁', '🍩'],
    farEmojis: ['🏙️', '🏢', '🏬', '🏪', '🏙️', '🏢'],
    midEmojis: ['🍦', '🎪', '🌭', '🍿', '🎠', '🧃', '🍰', '🎡'],
    categories: ['food'],
    filterWords: w => true,
  },
  {
    id: 'school',
    emoji: '🏫',
    nameHe: 'כוכב הלימודים',
    nameEn: 'School Planet',
    nameAr: 'كوكب المدرسة',
    nameRu: 'Школьная планета',
    skyGradient: 'linear-gradient(180deg, #3b82f6 0%, #8b5cf6 50%, #7c3aed 100%)',
    groundColor: '#4338ca',
    groundEmojis: ['📖', '✏️', '🎒', '📐', '🔬'],
    farEmojis: ['🏫', '📚', '🎓', '🏛️', '🏫', '📚'],
    midEmojis: ['✏️', '📏', '🖍️', '🎨', '📝', '🔭', '🧪', '💡'],
    categories: ['school'],
    filterWords: w => true,
  },
  {
    id: 'space',
    emoji: '🚀',
    nameHe: 'חלל גרמטיקה',
    nameEn: 'Space Grammar',
    nameAr: 'قواعد الفضاء',
    nameRu: 'Космическая грамматика',
    skyGradient: 'linear-gradient(180deg, #581c87 0%, #1e1b4b 50%, #0f172a 100%)',
    groundColor: '#4c1d95',
    groundEmojis: ['🪐', '🌟', '💫', '☄️', '🛸'],
    farEmojis: ['🌕', '🪐', '✨', '🌌', '🌕', '✨'],
    midEmojis: ['🛸', '👽', '🌟', '🚀', '🛰️', '💫', '🌙', '⭐'],
    categories: ['sentences'],
    filterWords: w => true,
    sentencesOnly: true,
    minLevel: 3,
  },
];

// Difficulty config by child level
const DIFFICULTY = {
  1: { options: 3, showEmoji: true,  showHebrew: true,  rounds: 6,  ttsRate: 0.55, useSentences: false },
  2: { options: 3, showEmoji: true,  showHebrew: false, rounds: 8,  ttsRate: 0.6,  useSentences: false },
  3: { options: 4, showEmoji: false, showHebrew: false, rounds: 8,  ttsRate: 0.65, useSentences: false },
  4: { options: 4, showEmoji: false, showHebrew: false, rounds: 10, ttsRate: 0.7, useSentences: true  },
};

// ── Racing constants ──
const BOTS = [
  { id: 'fox', emoji: '🦊', nameHe: 'שועל', nameEn: 'Fox', nameAr: 'ثعلب', nameRu: 'Лиса', speedRange: [0.50, 0.90], accuracy: 0.65 },
  { id: 'panda', emoji: '🐼', nameHe: 'פנדה', nameEn: 'Panda', nameAr: 'باندا', nameRu: 'Панда', speedRange: [0.40, 0.70], accuracy: 0.80 },
];
const TOTAL_DISTANCE = 100;
const WRONG_PENALTY = 3;
const TIMER_DURATIONS = { 1: 15, 2: 12, 3: 10, 4: 8 };
const TIME_BONUS_THRESHOLD = 4; // seconds
const TIME_BONUS_POINTS = 3;
const BOSS_EMOJIS = { jungle: '🐉', food: '🤖', school: '👾', space: '👽' };
const BOT_LEVEL_MULTIPLIER = { 1: 1.0, 2: 1.05, 3: 1.12, 4: 1.2 };

// ── ConfettiBurst ──
function ConfettiBurst({ show }) {
  if (!show) return null;
  const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'];
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 30}%`,
            background: colors[i % colors.length],
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${1 + Math.random() * 1}s`,
            width: `${6 + Math.random() * 8}px`,
            height: `${6 + Math.random() * 8}px`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}

// ── SparkleEffect ──
function SparkleEffect({ show }) {
  if (!show) return null;
  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <div
            key={i}
            className="absolute text-xl"
            style={{
              left: '50%', top: '50%',
              '--sx': `${Math.cos(angle) * 40}px`,
              '--sy': `${Math.sin(angle) * 40}px`,
              animation: 'sparkleBurst 0.6s ease-out forwards',
              animationDelay: `${i * 0.03}s`,
            }}
          >✨</div>
        );
      })}
    </div>
  );
}

// ── CoinAnimation ──
function CoinAnimation({ show }) {
  if (!show) return null;
  return (
    <div
      className="absolute text-2xl z-30 pointer-events-none"
      style={{ left: '50%', bottom: '40%', animation: 'coinFly 0.8s ease-out forwards' }}
    >🪙</div>
  );
}

// ── StoryIntro (replaces GameInstructionOverlay) ──
function StoryIntro({ onStart, uiLang }) {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Video background */}
      <video
        autoPlay muted loop playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
        src="/videos/race/intro.mp4"
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40" style={{ zIndex: 1 }} />

      <div className="relative z-10 flex flex-col items-center">
        {/* Speakli avatar */}
        <div className="mb-4">
          <SpeakliAvatar mode="bounce" size="xl" />
        </div>

        {/* Speech bubble */}
        <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl px-6 py-5 shadow-2xl max-w-sm mb-6 border border-white/30">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white/90 dark:bg-gray-800/90 rotate-45 rounded-sm" />
          <p className="text-center text-gray-800 dark:text-white font-bold text-lg relative z-10">
            {t('storyIntroText', uiLang)}
          </p>
        </div>

        {/* Rival characters */}
        <p className="text-white/80 font-bold text-sm mb-2 drop-shadow-lg">
          {t('yourRivals', uiLang)} ⚔️
        </p>
        <div className="flex gap-6 mb-8 bg-red-900/30 backdrop-blur-md rounded-2xl px-5 py-3 border border-red-400/30">
          {BOTS.map(bot => (
            <div key={bot.id} className="flex items-center gap-2">
              <span className="text-2xl">{bot.emoji}</span>
              <span className="text-sm font-bold text-red-200 drop-shadow-lg">
                {lf(bot, 'name', uiLang)}
              </span>
            </div>
          ))}
        </div>

        {/* Start button */}
        <button
          onClick={() => { playTap(); onStart(); }}
          className="btn-3d px-10 py-4 rounded-2xl font-black text-white text-xl shadow-2xl active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg, #22c55e, #3b82f6)' }}
        >
          {t('startRace', uiLang)} 🏁
        </button>
      </div>
    </div>
  );
}

// ── WorldSelector ──
function WorldSelector({ onSelect, onBack, childLevel, uiLang }) {
  const availableWorlds = WORLDS.filter(w => !w.minLevel || childLevel >= w.minLevel);

  return (
    <div className="kids-bg min-h-screen relative flex flex-col">
      {/* Back button */}
      <div className="absolute top-3 left-3 z-20">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-gray-600 bg-white/50 dark:bg-gray-800/50 rounded-full p-3 backdrop-blur-sm active:scale-90 transition-transform min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ArrowLeft size={20} className={RTL_LANGS.includes(uiLang) ? 'rotate-180' : ''} />
        </button>
      </div>
      <div className="relative z-10 flex flex-col items-center px-4 pt-6 pb-4 flex-1">
        <div className="mb-4">
          <SpeakliAvatar mode="bounce" size="lg" />
        </div>
        <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-1 text-center">
          {t('speakliRunTitle', uiLang)}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">
          {t('pickWorldAndRun', uiLang)}
        </p>

        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {availableWorlds.map(world => (
            <button
              key={world.id}
              onClick={() => { playTap(); onSelect(world); }}
              className="btn-3d rounded-2xl p-4 flex flex-col items-center gap-2 text-white font-bold shadow-xl active:scale-95 transition-transform"
              style={{ background: world.skyGradient }}
            >
              <span className="text-4xl">{world.emoji}</span>
              <span className="text-sm font-black leading-tight">
                {lf(world, 'name', uiLang)}
              </span>
            </button>
          ))}
        </div>

        {WORLDS.some(w => w.minLevel && childLevel < w.minLevel) && (
          <p className="text-xs text-gray-400 mt-4 text-center">
            {t('moreWorldsUnlock', uiLang)}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Countdown overlay ──
function Countdown({ onDone, world }) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) {
      const t = setTimeout(onDone, 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      playPop();
      setCount(c => c - 1);
    }, 800);
    return () => clearTimeout(t);
  }, [count, onDone]);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center">
      {/* Dim overlay */}
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative flex flex-col items-center gap-4">
        <div
          key={count}
          className="font-black text-white drop-shadow-lg"
          style={{
            fontSize: count === 0 ? '5rem' : '7rem',
            animation: 'countdownPop 0.6s ease-out',
            textShadow: '0 0 40px rgba(255,255,255,0.5), 0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
          {count === 0 ? 'Go! 🏁' : count}
        </div>
        {count > 0 && (
          <p className="text-white/80 text-lg font-bold animate-pulse">
            {world?.emoji} Get ready...
          </p>
        )}
      </div>
    </div>
  );
}

// ── Race Track Progress (with bots) ──
function RaceTrack({ playerPos, botPositions, world }) {
  const playerPct = Math.min(playerPos, TOTAL_DISTANCE) / TOTAL_DISTANCE;
  return (
    <div className="absolute bottom-[23%] left-0 right-0 z-[15] px-4 pointer-events-none">
      <div className="relative h-5 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
        {/* Track fill (player) */}
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${Math.max(playerPct * 100, 3)}%`,
            background: 'linear-gradient(90deg, #22c55e, #3b82f6, #8b5cf6)',
          }}
        />
        {/* Bot markers */}
        {BOTS.map((bot, i) => {
          const pct = Math.min(botPositions[i] || 0, TOTAL_DISTANCE) / TOTAL_DISTANCE;
          return (
            <div
              key={bot.id}
              className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-out"
              style={{ left: `calc(${Math.max(pct * 100, 2)}% - 8px)` }}
            >
              <span className="text-xs drop-shadow-md" style={{ opacity: 0.85 }}>{bot.emoji}</span>
            </div>
          );
        })}
        {/* Player marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-out"
          style={{ left: `calc(${Math.max(playerPct * 100, 2)}% - 10px)` }}
        >
          <span className="text-sm drop-shadow-lg">🏃</span>
        </div>
        {/* Finish flag */}
        <div className="absolute top-1/2 -translate-y-1/2 right-1">
          <span className="text-xs">🏁</span>
        </div>
      </div>
    </div>
  );
}

// ── RunHUD ──
function RunHUD({ score, coins, streak, round, totalRounds, onBack, isPowerMode, uiLang }) {
  return (
    <>
      {/* Back button — z-40 so it's always above challenge overlay */}
      <div className="absolute top-3 left-3 z-40">
        <button
          onClick={(e) => { e.stopPropagation(); onBack(); }}
          className="text-white/90 bg-black/30 rounded-full p-3 backdrop-blur-md active:scale-90 transition-transform min-w-[44px] min-h-[44px] flex items-center justify-center shadow-lg border border-white/10"
        >
          <ArrowLeft size={20} className={RTL_LANGS.includes(uiLang) ? 'rotate-180' : ''} />
        </button>
      </div>

      {/* Stats bar */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
        <div className="bg-black/30 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-1.5 border border-white/10 shadow-lg">
          <span className="text-yellow-300 text-sm">🪙</span>
          <span className="text-white font-black text-sm">{coins}</span>
        </div>
        <div className="bg-black/30 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-1.5 border border-white/10 shadow-lg">
          <Star size={14} className="text-yellow-300 fill-yellow-300" />
          <span className="text-white font-black text-sm">{score}</span>
        </div>
        {streak >= 2 && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-full px-2.5 py-1.5 flex items-center gap-1 animate-pulse shadow-lg border border-orange-300/30">
            <Zap size={12} className="text-yellow-200 fill-yellow-200" />
            <span className="text-white font-black text-xs">{streak}x</span>
          </div>
        )}
      </div>

      {/* Round counter */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30">
        <div className="bg-black/30 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/10 shadow-lg">
          <span className="text-white/90 font-bold text-sm">{round + 1}/{totalRounds}</span>
        </div>
      </div>
    </>
  );
}

// ── VisualTimer ──
function VisualTimer({ duration, active, onTimeUp, uiLang }) {
  const [remaining, setRemaining] = useState(duration);
  const startRef = useRef(null);
  const rafRef = useRef(null);
  const firedRef = useRef(false);

  useEffect(() => {
    setRemaining(duration);
    startRef.current = null;
    firedRef.current = false;
  }, [duration]);

  useEffect(() => {
    if (!active) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const tick = (now) => {
      if (!startRef.current) startRef.current = now;
      const elapsed = (now - startRef.current) / 1000;
      const rem = Math.max(duration - elapsed, 0);
      setRemaining(rem);

      if (rem <= 0 && !firedRef.current) {
        firedRef.current = true;
        onTimeUp();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [active, duration, onTimeUp]);

  const fraction = remaining / duration;
  const isUrgent = remaining <= 3 && remaining > 0;
  const circumference = 2 * Math.PI * 22;
  const dashOffset = circumference * (1 - fraction);
  const displaySeconds = Math.ceil(remaining);

  return (
    <div
      className={`absolute top-14 left-1/2 -translate-x-1/2 z-[35] ${isUrgent ? 'run-timer-urgent' : ''}`}
      style={{ width: 52, height: 52 }}
    >
      <svg width="52" height="52" viewBox="0 0 52 52">
        {/* Background circle */}
        <circle cx="26" cy="26" r="22" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
        {/* Depleting ring */}
        <circle
          cx="26" cy="26" r="22"
          fill="none"
          stroke={isUrgent ? '#ef4444' : '#22c55e'}
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform="rotate(-90 26 26)"
          style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s ease' }}
        />
        {/* Seconds text */}
        <text x="26" y="26" textAnchor="middle" dominantBaseline="central"
          fill="white" fontSize="16" fontWeight="900"
        >
          {displaySeconds}
        </text>
      </svg>
    </div>
  );
}

// ── BossOverlay ──
function BossOverlay({ world, uiLang, onDone }) {
  const bossEmoji = BOSS_EMOJIS[world.id] || '👾';

  useEffect(() => {
    const t = setTimeout(onDone, 1500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="absolute inset-0 z-[45] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative flex flex-col items-center gap-4 run-boss-border rounded-3xl px-8 py-6 bg-black/40 backdrop-blur-md">
        <div
          className="text-7xl"
          style={{ animation: 'bossAppear 0.8s ease-out forwards' }}
        >
          {bossEmoji}
        </div>
        <h2 className="text-2xl font-black text-red-400 drop-shadow-lg animate-pulse">
          {t('bossChallenge', uiLang)}
        </h2>
      </div>
    </div>
  );
}

// ── WordBox — glassmorphism cards with spring animation ──
const ACCENT_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];
function WordBox({ word, emoji, translation, showEmoji, showHebrew, onClick, state, index, disabled }) {
  const stateClass =
    state === 'correct' ? 'wordBoxCorrect' :
    state === 'wrong' ? 'wordBoxBreak' : '';

  return (
    <button
      onClick={onClick}
      disabled={disabled || !!state}
      className={`
        relative rounded-2xl font-bold shadow-xl runner-word-card
        active:scale-95 transition-transform overflow-hidden
        ${state === 'correct'
          ? 'text-white ring-4 ring-yellow-300/50'
          : state === 'wrong'
          ? 'text-white'
          : 'text-white hover:bg-white/20'}
      `}
      style={{
        animation: state
          ? `${stateClass} 0.5s ease-out forwards`
          : `wordBoxSlideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.1}s both`,
        minWidth: '140px',
        padding: showEmoji ? '12px 20px' : '14px 20px',
        background: state === 'correct'
          ? 'linear-gradient(135deg, rgba(34,197,94,0.8), rgba(16,185,129,0.9))'
          : state === 'wrong'
          ? 'linear-gradient(135deg, rgba(239,68,68,0.8), rgba(220,38,38,0.9))'
          : 'rgba(255,255,255,0.15)',
      }}
    >
      {/* Colored side accent */}
      {!state && (
        <div
          className="runner-word-card-accent"
          style={{ background: ACCENT_COLORS[index % ACCENT_COLORS.length] }}
        />
      )}
      <div className="flex flex-col items-center gap-0.5">
        {showEmoji && emoji && <span className="text-3xl leading-tight">{emoji}</span>}
        <span className={`font-black ${showEmoji ? 'text-sm' : 'text-base'} drop-shadow-sm`}>{word}</span>
        {showHebrew && translation && (
          <span className="text-xs text-white/70 font-semibold">{translation}</span>
        )}
      </div>
      {state === 'correct' && <SparkleEffect show={true} />}
    </button>
  );
}

// ── World-specific scenery configs ──
const WORLD_SCENERY = {
  jungle: {
    farShapes: [
      { w: 120, h: 70, color: '#14532d', left: 0 },
      { w: 90, h: 55, color: '#166534', left: 100 },
      { w: 140, h: 80, color: '#15803d', left: 200 },
      { w: 80, h: 50, color: '#14532d', left: 320 },
      { w: 110, h: 65, color: '#166534', left: 410 },
      { w: 130, h: 75, color: '#15803d', left: 530 },
    ],
    midShapes: [
      { w: 30, h: 60, color: '#166534', left: 20, radius: '50% 50% 0 0' },
      { w: 25, h: 50, color: '#15803d', left: 90, radius: '50% 50% 0 0' },
      { w: 35, h: 70, color: '#14532d', left: 160, radius: '50% 50% 0 0' },
      { w: 28, h: 55, color: '#166534', left: 240, radius: '50% 50% 0 0' },
      { w: 32, h: 65, color: '#15803d', left: 310, radius: '50% 50% 0 0' },
      { w: 22, h: 45, color: '#14532d', left: 380, radius: '50% 50% 0 0' },
      { w: 30, h: 58, color: '#166534', left: 440, radius: '50% 50% 0 0' },
      { w: 36, h: 72, color: '#15803d', left: 520, radius: '50% 50% 0 0' },
    ],
    collectibles: ['⭐', '💎', '🌟', '🪙'],
    celestial: '☀️',
    celestialColor: 'rgba(255,220,50,0.3)',
  },
  food: {
    farShapes: [
      { w: 50, h: 80, color: '#9d174d', left: 0, type: 'building' },
      { w: 40, h: 60, color: '#be185d', left: 60, type: 'building' },
      { w: 60, h: 100, color: '#9d174d', left: 120, type: 'building' },
      { w: 45, h: 70, color: '#be185d', left: 200, type: 'building' },
      { w: 55, h: 90, color: '#9d174d', left: 260, type: 'building' },
      { w: 50, h: 75, color: '#be185d', left: 330, type: 'building' },
      { w: 65, h: 95, color: '#9d174d', left: 400, type: 'building' },
      { w: 40, h: 65, color: '#be185d', left: 480, type: 'building' },
      { w: 55, h: 85, color: '#9d174d', left: 540, type: 'building' },
    ],
    midShapes: [
      { w: 35, h: 50, color: '#f472b6', left: 30, type: 'building' },
      { w: 45, h: 65, color: '#ec4899', left: 110, type: 'building' },
      { w: 30, h: 45, color: '#f472b6', left: 180, type: 'building' },
      { w: 50, h: 70, color: '#ec4899', left: 250, type: 'building' },
      { w: 38, h: 55, color: '#f472b6', left: 330, type: 'building' },
      { w: 42, h: 60, color: '#ec4899', left: 410, type: 'building' },
      { w: 48, h: 68, color: '#f472b6', left: 490, type: 'building' },
    ],
    collectibles: ['⭐', '🪙', '💎', '🌟'],
    celestial: '🌤️',
    celestialColor: 'rgba(255,200,50,0.25)',
  },
  school: {
    farShapes: [
      { w: 50, h: 90, color: '#312e81', left: 0, type: 'building' },
      { w: 40, h: 70, color: '#3730a3', left: 65, type: 'building' },
      { w: 60, h: 110, color: '#312e81', left: 130, type: 'building' },
      { w: 45, h: 80, color: '#4338ca', left: 210, type: 'building' },
      { w: 55, h: 95, color: '#312e81', left: 275, type: 'building' },
      { w: 48, h: 85, color: '#3730a3', left: 350, type: 'building' },
      { w: 58, h: 100, color: '#312e81', left: 420, type: 'building' },
      { w: 42, h: 72, color: '#4338ca', left: 500, type: 'building' },
    ],
    midShapes: [
      { w: 35, h: 55, color: '#6366f1', left: 25, type: 'building' },
      { w: 30, h: 45, color: '#818cf8', left: 100, type: 'building' },
      { w: 40, h: 60, color: '#6366f1', left: 170, type: 'building' },
      { w: 32, h: 50, color: '#818cf8', left: 250, type: 'building' },
      { w: 38, h: 58, color: '#6366f1', left: 320, type: 'building' },
      { w: 28, h: 42, color: '#818cf8', left: 400, type: 'building' },
      { w: 44, h: 62, color: '#6366f1', left: 470, type: 'building' },
    ],
    collectibles: ['⭐', '🪙', '💎', '🌟'],
    celestial: '🌙',
    celestialColor: 'rgba(180,160,255,0.25)',
  },
  space: {
    farShapes: [
      { w: 60, h: 40, color: '#581c87', left: 20, radius: '50%' },
      { w: 40, h: 35, color: '#7e22ce', left: 130, radius: '50%' },
      { w: 80, h: 50, color: '#581c87', left: 230, radius: '50%' },
      { w: 50, h: 38, color: '#6b21a8', left: 360, radius: '50%' },
      { w: 70, h: 45, color: '#581c87', left: 450, radius: '50%' },
      { w: 45, h: 32, color: '#7e22ce', left: 560, radius: '50%' },
    ],
    midShapes: [
      { w: 35, h: 30, color: '#a855f7', left: 40, radius: '50%' },
      { w: 25, h: 22, color: '#c084fc', left: 120, radius: '50%' },
      { w: 40, h: 35, color: '#a855f7', left: 210, radius: '50%' },
      { w: 30, h: 28, color: '#c084fc', left: 300, radius: '50%' },
      { w: 38, h: 32, color: '#a855f7', left: 380, radius: '50%' },
      { w: 28, h: 25, color: '#c084fc', left: 460, radius: '50%' },
    ],
    collectibles: ['⭐', '💫', '🌟', '✨'],
    celestial: '🌕',
    celestialColor: 'rgba(255,255,200,0.2)',
  },
};

// ── Cloud data (stable across renders) ──
const CLOUD_DATA = [
  { w: 70, h: 28, top: 6, offsetX: 0, speed: 0 },
  { w: 50, h: 20, top: 3, offsetX: 160, speed: 1.5 },
  { w: 90, h: 34, top: 10, offsetX: 320, speed: 0.8 },
  { w: 55, h: 22, top: 5, offsetX: 480, speed: 2 },
  { w: 75, h: 30, top: 8, offsetX: 640, speed: 1.2 },
  { w: 60, h: 24, top: 12, offsetX: 800, speed: 0.5 },
  { w: 45, h: 18, top: 4, offsetX: 950, speed: 1.8 },
  { w: 80, h: 32, top: 9, offsetX: 1100, speed: 0.3 },
];

// ── Collectible positions (stable) ──
const COLLECTIBLE_POSITIONS = [
  { left: 80, bottom: 5 },
  { left: 250, bottom: 8 },
  { left: 420, bottom: 3 },
  { left: 600, bottom: 7 },
];

// ── RunnerViewport — Professional animated game viewport ──
function RunnerViewport({ world, phase, isPowerMode, shakeClass, charEffect, botPositions, playerPos, children }) {
  const isChallenge = phase === 'word-challenge';
  const isCountdown = phase === 'countdown';

  const farSpeed = isPowerMode ? '8s' : isChallenge ? '30s' : '15s';
  const midSpeed = isPowerMode ? '4s' : isChallenge ? '16s' : '8s';
  const groundSpeed = isPowerMode ? '2s' : isChallenge ? '8s' : '4s';
  const roadSpeed = isPowerMode ? '1s' : isChallenge ? '4s' : '2s';
  const cloudSpeed = isPowerMode ? '20s' : isChallenge ? '60s' : '40s';

  const scenery = WORLD_SCENERY[world.id] || WORLD_SCENERY.jungle;

  // Render silhouette shapes (mountains or buildings)
  const renderShapes = (shapes) => {
    // Triple for seamless scroll
    const tripled = [...shapes, ...shapes.map((s, i) => ({ ...s, left: s.left + 660 })), ...shapes.map((s, i) => ({ ...s, left: s.left + 1320 }))];
    return tripled.map((s, i) => (
      <div
        key={i}
        className={s.type === 'building' ? 'runner-building' : 'runner-mountain'}
        style={{
          width: s.w,
          height: s.h,
          background: s.color,
          left: s.left,
          borderRadius: s.radius || (s.type === 'building' ? '4px 4px 0 0' : '40% 45% 0 0'),
        }}
      />
    ));
  };

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${isPowerMode ? 'runner-power' : ''} ${isCountdown ? 'runner-paused' : ''} ${shakeClass || ''}`}
      style={{
        background: world.skyGradient,
        minHeight: '100dvh',
        animation: `skyShift 30s ease-in-out infinite`,
      }}
    >
      {/* Video background layer */}
      <video
        autoPlay muted loop playsInline
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ zIndex: 0, opacity: 0.35 }}
        src={`/videos/race/${world.id}.mp4`}
      />

      {/* Celestial body (sun/moon) */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '5%',
          right: '8%',
          fontSize: '3rem',
          animation: 'celestialGlow 4s ease-in-out infinite',
          filter: `drop-shadow(0 0 20px ${scenery.celestialColor})`,
          zIndex: 1,
        }}
      >{scenery.celestial}</div>

      {/* CSS Clouds */}
      <div
        className="runner-layer absolute w-[300%] pointer-events-none"
        style={{ animation: `runnerScroll ${cloudSpeed} linear infinite`, top: 0, height: '20%', zIndex: 2 }}
      >
        {CLOUD_DATA.map((c, i) => (
          <div
            key={i}
            className="runner-cloud"
            style={{
              width: c.w,
              height: c.h,
              top: `${c.top}%`,
              left: c.offsetX,
              animation: `cloudDrift ${3 + c.speed}s ease-in-out infinite`,
              animationDelay: `${c.speed}s`,
              opacity: isPowerMode ? 0.15 : 0.25,
            }}
          />
        ))}
      </div>

      {/* Far BG layer — gradient silhouettes */}
      <div
        className="runner-layer absolute bottom-[28%] w-[300%]"
        style={{
          animation: `runnerScroll ${farSpeed} linear infinite`,
          opacity: 0.5,
          height: '120px',
          zIndex: 3,
        }}
      >
        {renderShapes(scenery.farShapes)}
      </div>

      {/* Mid BG layer — taller overlapping shapes */}
      <div
        className="runner-layer absolute bottom-[22%] w-[300%]"
        style={{
          animation: `runnerScroll ${midSpeed} linear infinite`,
          opacity: 0.7,
          height: '100px',
          zIndex: 4,
        }}
      >
        {renderShapes(scenery.midShapes)}
      </div>

      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-[22%]" style={{ zIndex: 5, background: `linear-gradient(180deg, ${world.groundColor}dd 0%, ${world.groundColor} 30%, ${world.groundColor}cc 100%)` }}>
        {/* Ground detail emojis */}
        <div
          className="runner-layer absolute top-1 w-[300%] flex items-center"
          style={{ animation: `runnerScroll ${groundSpeed} linear infinite` }}
        >
          {[...world.groundEmojis, ...world.groundEmojis, ...world.groundEmojis].map((e, i) => (
            <span key={i} className="inline-block" style={{ marginLeft: '55px', fontSize: '1.6rem' }}>{e}</span>
          ))}
        </div>

        {/* 3D Perspective Road */}
        <div className="absolute bottom-0 left-0 right-0 h-[55%] overflow-hidden runner-road-3d">
          <div
            className="w-full h-full runner-road-surface"
            style={{
              background: `linear-gradient(180deg, ${world.groundColor}99 0%, #374151 15%, #4B5563 45%, #374151 85%, ${world.groundColor}99 100%)`,
            }}
          >
            {/* Center dashes */}
            <div className="absolute top-[46%] w-[300%] h-[5px] flex items-center gap-0"
              style={{ animation: `runnerScroll ${roadSpeed} linear infinite` }}>
              {Array.from({ length: 40 }).map((_, i) => (
                <div key={i} className="shrink-0 runner-road-marking" style={{
                  width: `${25 + i % 3 * 3}px`, height: '5px', marginRight: '22px',
                }} />
              ))}
            </div>
            {/* Lane lines */}
            <div className="absolute top-[18%] left-0 right-0 h-[2px]" style={{ background: 'rgba(255,255,255,0.18)' }} />
            <div className="absolute bottom-[18%] left-0 right-0 h-[2px]" style={{ background: 'rgba(255,255,255,0.18)' }} />

            {/* Road collectibles */}
            <div
              className="runner-layer absolute w-[300%] h-full pointer-events-none"
              style={{ animation: `runnerScroll ${roadSpeed} linear infinite` }}
            >
              {COLLECTIBLE_POSITIONS.map((pos, i) => (
                <span
                  key={i}
                  className="runner-collectible"
                  style={{
                    left: pos.left,
                    bottom: `${pos.bottom + 20}%`,
                    animationDelay: `${i * 0.3}s`,
                  }}
                >{scenery.collectibles[i % scenery.collectibles.length]}</span>
              ))}
            </div>

            {/* Bot rivals on road */}
            {botPositions && BOTS.map((bot, i) => {
              const botPos = botPositions[i] || 0;
              const relativeOffset = botPos - (playerPos || 0);
              const screenLeft = Math.min(Math.max(15 + relativeOffset * 0.6, -5), 85);
              const laneBottom = i === 0 ? '24%' : '20%';
              const scale = 0.9 + (botPos / TOTAL_DISTANCE) * 0.2;
              return (
                <div
                  key={bot.id}
                  className="absolute pointer-events-none transition-all duration-1000 ease-out"
                  style={{
                    left: `${screenLeft}%`,
                    bottom: laneBottom,
                    fontSize: `${1.4 * scale}rem`,
                    zIndex: 8,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                  }}
                >
                  {bot.emoji}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Speed lines */}
      {(phase === 'running' || isPowerMode) && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 6 }}>
          {Array.from({ length: isPowerMode ? 12 : 7 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${20 + (i * 7) % 40}px`,
                height: '2px',
                background: isPowerMode
                  ? `rgba(255,220,100,${0.2 + (i * 3) % 20 / 100})`
                  : `rgba(255,255,255,${0.15 + (i * 5) % 20 / 100})`,
                top: `${15 + (i * 13) % 55}%`,
                animation: `speedLine ${isPowerMode ? 0.4 + (i * 0.07) % 0.3 : 0.6 + (i * 0.1) % 0.6}s linear infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Dust trail */}
      {phase === 'running' && (
        <div className="absolute pointer-events-none" style={{ left: '8%', bottom: '22%', zIndex: 9 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="absolute rounded-full" style={{
              width: `${6 + i * 3}px`, height: `${6 + i * 3}px`,
              background: `rgba(255,255,255,${0.4 - i * 0.08})`,
              bottom: `${-2 + i * 4}px`,
              left: `${-8 - i * 10}px`,
              animation: `dustPuff ${0.5 + i * 0.15}s ease-out infinite`,
              animationDelay: `${i * 0.12}s`,
            }} />
          ))}
        </div>
      )}

      {/* Running shadow */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: '15%',
          bottom: '21.5%',
          width: '50px',
          height: '10px',
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.25)',
          filter: 'blur(3px)',
          zIndex: 9,
          animation: phase === 'running' ? 'runningShadow 0.4s ease-in-out infinite' : 'none',
          transform: isChallenge ? 'scaleX(1.1)' : undefined,
          transition: 'transform 0.3s ease',
        }}
      />

      {/* Power mode speed trail */}
      {isPowerMode && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: '5%',
            bottom: '23%',
            width: '60px',
            height: '40px',
            background: 'linear-gradient(90deg, rgba(255,200,0,0) 0%, rgba(255,200,0,0.3) 100%)',
            borderRadius: '0 20px 20px 0',
            animation: 'speedTrail 0.6s ease-out infinite',
            zIndex: 9,
          }}
        />
      )}

      {/* Power mode golden overlay */}
      {isPowerMode && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(255,200,0,0.08) 0%, rgba(255,150,0,0.04) 100%)',
            animation: 'powerPulse 1.5s ease-in-out infinite',
            zIndex: 24,
          }}
        />
      )}

      {/* Speakli character */}
      <div
        className={`absolute z-10 speakli-run ${isCountdown ? 'runner-paused-char' : isChallenge ? '' : 'runner-leaning'} ${charEffect || ''}`}
        style={{ left: '15%', bottom: '22%' }}
      >
        {/* Afterimage ghosts in power mode */}
        {isPowerMode && phase === 'running' && (
          <>
            <div className="absolute inset-0" style={{ opacity: 0.15, transform: 'translateX(-20px)', filter: 'blur(2px)' }}>
              <SpeakliAvatar mode="bounce" size="lg" />
            </div>
            <div className="absolute inset-0" style={{ opacity: 0.08, transform: 'translateX(-38px)', filter: 'blur(3px)' }}>
              <SpeakliAvatar mode="bounce" size="lg" />
            </div>
          </>
        )}
        <SpeakliAvatar
          mode={isChallenge ? 'idle' : isCountdown ? 'idle' : 'bounce'}
          size="lg"
          glow={isPowerMode}
        />
      </div>

      {/* Vignette overlay */}
      <div className="runner-vignette" />

      {/* Children (HUD, overlays) */}
      {children}
    </div>
  );
}

// ── Target Word Display ──
function TargetWordBubble({ target, diff, uiLang, onReplay }) {
  return (
    <div className="flex flex-col items-center gap-2 mb-4">
      {/* Big emoji + replay button */}
      <div className="relative">
        <div
          className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-md border-2 border-white/30 flex items-center justify-center shadow-2xl"
          style={{ animation: 'countdownPop 0.4s ease-out' }}
        >
          <span className="text-5xl">{target.emoji || '🔊'}</span>
        </div>
        {/* Speaker badge */}
        <button
          onClick={onReplay}
          className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shadow-lg active:scale-90 transition-transform border-2 border-white/50"
          style={{ animation: 'pulse 2s ease-in-out infinite' }}
        >
          <Volume2 size={18} className="text-white" />
        </button>
      </div>

      {/* "Find this word" instruction */}
      <div className="bg-black/30 backdrop-blur-md rounded-full px-5 py-2 border border-white/15 shadow-lg">
        <p className="text-white font-bold text-sm text-center">
          {t('listenAndTapCorrect', uiLang)} 👆
        </p>
      </div>
    </div>
  );
}

// ── GameOverScreen with Podium ──
function RunGameOver({ score, coins, totalRounds, correctCount, xp, onContinue, world, uiLang, playerPos, botPositions, timeBonusTotal, bossDefeated }) {
  // Compute placement
  const racers = [
    { id: 'player', label: t('you', uiLang), emoji: '🏃', pos: playerPos },
    { id: 'fox', label: lf(BOTS[0], 'name', uiLang), emoji: '🦊', pos: botPositions[0] },
    { id: 'panda', label: lf(BOTS[1], 'name', uiLang), emoji: '🐼', pos: botPositions[1] },
  ];
  const sorted = [...racers].sort((a, b) => b.pos - a.pos);
  const playerPlacement = sorted.findIndex(r => r.id === 'player') + 1;
  const medals = ['🥇', '🥈', '🥉'];
  const playerWon = playerPlacement === 1;

  useEffect(() => {
    playComplete();
  }, []);

  return (
    <div className="kids-bg min-h-screen relative">
      {playerWon && <ConfettiBurst show={true} />}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6">
        {/* Placement badge */}
        <div
          className="text-6xl mb-2"
          style={{ animation: 'countdownPop 0.6s ease-out' }}
        >
          {medals[playerPlacement - 1]}
        </div>

        <h2 className="text-3xl font-black text-gray-800 dark:text-white mb-1">
          {playerWon ? t('youWon', uiLang) : t('almostTryAgain', uiLang)}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
          {tReplace('raceResultSummary', uiLang, { correctCount, totalRounds })}
        </p>

        {/* Podium */}
        <div className="flex items-end justify-center gap-2 mb-4">
          {/* 2nd place */}
          <div className="flex flex-col items-center">
            <span className="text-2xl mb-1">{sorted[1].emoji}</span>
            <span className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">{sorted[1].label}</span>
            <div className="w-16 rounded-t-lg flex items-end justify-center pb-1"
              style={{ height: '60px', background: 'linear-gradient(180deg, #C0C0C0, #A0A0A0)' }}>
              <span className="text-lg">🥈</span>
            </div>
          </div>
          {/* 1st place */}
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-1">{sorted[0].emoji}</span>
            <span className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">{sorted[0].label}</span>
            <div className="w-20 rounded-t-lg flex items-end justify-center pb-1"
              style={{ height: '90px', background: 'linear-gradient(180deg, #FFD700, #DAA520)' }}>
              <span className="text-xl">🥇</span>
            </div>
          </div>
          {/* 3rd place */}
          <div className="flex flex-col items-center">
            <span className="text-2xl mb-1">{sorted[2].emoji}</span>
            <span className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">{sorted[2].label}</span>
            <div className="w-16 rounded-t-lg flex items-end justify-center pb-1"
              style={{ height: '45px', background: 'linear-gradient(180deg, #CD7F32, #A0522D)' }}>
              <span className="text-lg">🥉</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-3 mb-3 flex-wrap justify-center">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl px-4 py-2.5 shadow-lg text-center">
            <div className="text-xl mb-0.5">🪙</div>
            <div className="text-lg font-bold text-yellow-600">{coins}</div>
            <div className="text-xs text-gray-500">{t('coins', uiLang)}</div>
          </div>
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl px-4 py-2.5 shadow-lg text-center">
            <Star size={20} className="text-yellow-500 mx-auto mb-0.5" />
            <div className="text-lg font-bold text-gray-800 dark:text-white">{score}</div>
            <div className="text-xs text-gray-500">{t('points', uiLang)}</div>
          </div>
          {timeBonusTotal > 0 && (
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl px-4 py-2.5 shadow-lg text-center">
              <div className="text-xl mb-0.5">⚡</div>
              <div className="text-lg font-bold text-blue-600">+{timeBonusTotal}</div>
              <div className="text-xs text-gray-500">{t('timeBonus', uiLang)}</div>
            </div>
          )}
          {bossDefeated && (
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl px-4 py-2.5 shadow-lg text-center">
              <div className="text-xl mb-0.5">👾</div>
              <div className="text-lg font-bold text-red-500">+20</div>
              <div className="text-xs text-gray-500">{t('bossDefeated', uiLang)}</div>
            </div>
          )}
        </div>

        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl px-6 py-3 mb-5 shadow-lg">
          <div className="flex items-center gap-2">
            <Zap size={20} className="text-yellow-500" />
            <span className="text-lg font-bold text-yellow-600">+{xp} XP</span>
          </div>
        </div>

        <button
          onClick={onContinue}
          className="btn-3d px-10 py-4 rounded-2xl font-black text-white text-xl shadow-2xl"
          style={{ background: world.skyGradient, boxShadow: 'none' }}
        >
          {t('continue', uiLang)} ✨
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  MAIN GAME COMPONENT
// ═══════════════════════════════════════════════════════

export function SpeakliRunGame({ onComplete, onBack, childLevel = 1 }) {
  const { uiLang } = useTheme();
  const { speak } = useSpeech();

  const [showStoryIntro, setShowStoryIntro] = useState(true);

  // Game state machine: story-intro → world-select → countdown → running → word-challenge → (boss-intro →) game-over
  const [phase, setPhase] = useState('world-select');
  const [world, setWorld] = useState(null);

  // Round state
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isPowerMode, setIsPowerMode] = useState(false);

  // Racing state
  const [playerPos, setPlayerPos] = useState(0);
  const [botPositions, setBotPositions] = useState([0, 0]);
  const [raceFinished, setRaceFinished] = useState(false);

  // Timer state
  const [timerActive, setTimerActive] = useState(false);
  const [timerKey, setTimerKey] = useState(0); // force remount on new round
  const timerStartRef = useRef(null);
  const timeBonusTotalRef = useRef(0);

  // Boss state
  const [showBossOverlay, setShowBossOverlay] = useState(false);
  const [isBossRound, setIsBossRound] = useState(false);
  const bossDefeatedRef = useRef(false);

  // Challenge state
  const [target, setTarget] = useState(null);
  const [options, setOptions] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [boxStates, setBoxStates] = useState({});
  const [showCoin, setShowCoin] = useState(false);
  const [showSparkle, setShowSparkle] = useState(false);
  const [avatarMode, setAvatarMode] = useState('idle');
  const [challengeDisabled, setChallengeDisabled] = useState(false);

  // Visual effect states
  const [shakeClass, setShakeClass] = useState('');
  const [charEffect, setCharEffect] = useState('');
  const [showGoldenFlash, setShowGoldenFlash] = useState(false);

  // Refs
  const wordPoolRef = useRef([]);
  const roundTimersRef = useRef([]);
  const diff = DIFFICULTY[childLevel] || DIFFICULTY[1];

  const distPerCorrect = useMemo(() => TOTAL_DISTANCE / diff.rounds, [diff.rounds]);

  const clearRoundTimers = () => {
    roundTimersRef.current.forEach(clearTimeout);
    roundTimersRef.current = [];
  };
  const pushTimer = (id) => { roundTimersRef.current.push(id); return id; };

  // Preload Hebrew audio (delayed to not compete with instruction speech) + cleanup
  useEffect(() => {
    const t = setTimeout(() => preloadHebrewAudio(RUN_PHRASES), 3000);
    return () => { clearTimeout(t); stopAllAudio(); clearRoundTimers(); };
  }, []);

  // Advance bots
  const advanceBots = useCallback((roundNum) => {
    setBotPositions(prev => {
      const multiplier = BOT_LEVEL_MULTIPLIER[childLevel] || 1.0;
      return prev.map((pos, i) => {
        const bot = BOTS[i];
        const [minSpd, maxSpd] = bot.speedRange;
        const randomFactor = minSpd + Math.random() * (maxSpd - minSpd);
        const advance = distPerCorrect * randomFactor * multiplier;
        return Math.min(pos + advance, TOTAL_DISTANCE);
      });
    });
  }, [distPerCorrect, childLevel]);

  // Prefetch audio for the upcoming round so TTS plays instantly with popup
  const prefetchRoundAudio = useCallback((pool, roundNum) => {
    if (roundNum >= diff.rounds) return;
    const targetIdx = roundNum % pool.length;
    const targetWord = pool[targetIdx];
    if (!targetWord) return;
    // Preload both English word and UI-language translation in parallel
    const translation = lf(targetWord, 'translation', uiLang);
    preloadEnglishAudio([targetWord.word]);
    if (translation) {
      const langMap = { he: 'he', ar: 'ar', ru: 'ru', en: 'en' };
      preloadHebrewAudio([translation], langMap[uiLang] || 'he');
    }
  }, [diff.rounds, uiLang]);

  // Build word pool when world is selected
  const buildWordPool = useCallback((selectedWorld) => {
    if (selectedWorld.sentencesOnly && diff.useSentences && SENTENCES_BY_LEVEL[childLevel]) {
      const sentences = SENTENCES_BY_LEVEL[childLevel] || SENTENCES_BY_LEVEL[3];
      return shuffle(sentences).map(s => ({
        word: s.sentence,
        emoji: s.emoji,
        translation: lf(s, 'translation', uiLang),
      }));
    }
    const allWords = getWordsForLevel(childLevel);
    return shuffle(allWords);
  }, [childLevel, diff.useSentences, uiLang]);

  // Get timer duration for current round
  const getTimerDuration = useCallback((roundNum) => {
    const baseDuration = TIMER_DURATIONS[childLevel] || TIMER_DURATIONS[1];
    const isBoss = roundNum === diff.rounds - 1;
    return isBoss ? Math.ceil(baseDuration / 2) : baseDuration;
  }, [childLevel, diff.rounds]);

  // Start a new challenge round
  const startChallenge = useCallback((pool, roundNum) => {
    if (roundNum >= diff.rounds) {
      setPhase('game-over');
      return;
    }

    const boss = roundNum === diff.rounds - 1;
    setIsBossRound(boss);

    // Boss intro overlay
    if (boss) {
      setShowBossOverlay(true);
      return; // The overlay's onDone will continue
    }

    // Proceed to challenge
    launchChallenge(pool, roundNum, boss);
  }, [diff, launchChallenge]);

  // Actually launch the word challenge (called directly or after boss overlay)
  const launchChallenge = useCallback((pool, roundNum, boss) => {
    const targetIdx = roundNum % pool.length;
    const targetWord = pool[targetIdx];

    const numOptions = boss ? diff.options + 1 : diff.options;
    const others = pool.filter((_, i) => i !== targetIdx);
    const distractors = shuffle(others).slice(0, numOptions - 1);

    const allOptions = shuffle([targetWord, ...distractors]);

    setTarget(targetWord);
    setOptions(allOptions);
    setAttempts(0);
    setBoxStates({});
    setChallengeDisabled(false);
    setShowCoin(false);
    setShowSparkle(false);
    setPhase('word-challenge');

    // Start timer
    timerStartRef.current = performance.now();
    setTimerKey(k => k + 1);
    setTimerActive(true);

    // Speak the target word
    playSequence([
      { text: targetWord.word, lang: 'en-US', rate: diff.ttsRate },
      { pause: 400 },
      { text: lf(targetWord, 'translation', uiLang), lang: uiLang, rate: 0.85 },
    ], null);
  }, [diff, uiLang]);

  // Handle boss overlay done
  const handleBossOverlayDone = useCallback(() => {
    setShowBossOverlay(false);
    launchChallenge(wordPoolRef.current, round, true);
  }, [round, launchChallenge]);

  // Handle world selection
  const handleWorldSelect = useCallback((selectedWorld) => {
    setWorld(selectedWorld);
    const pool = buildWordPool(selectedWorld);
    wordPoolRef.current = pool;
    setPhase('countdown');
  }, [buildWordPool]);

  // Handle countdown done → start running
  const handleCountdownDone = useCallback(() => {
    setPhase('running');
    prefetchRoundAudio(wordPoolRef.current, 0); // preload audio during running phase
    clearRoundTimers();
    pushTimer(setTimeout(() => {
      startChallenge(wordPoolRef.current, 0);
    }, 2500));
  }, [startChallenge, prefetchRoundAudio]);

  // Handle back button — clean up everything
  const handleBack = useCallback(() => {
    clearRoundTimers();
    stopAllAudio();
    onBack();
  }, [onBack]);

  // Handle time up
  const handleTimeUp = useCallback(() => {
    if (challengeDisabled || !target) return;
    setTimerActive(false);
    // Auto wrong answer — same effects as wrong
    playWrong();
    setStreak(0);
    setIsPowerMode(false);
    setShakeClass('runner-shake');
    setCharEffect('runner-stumble');
    setTimeout(() => { setShakeClass(''); setCharEffect(''); }, 500);

    // Penalty
    setPlayerPos(p => Math.max(p - WRONG_PENALTY, 0));
    advanceBots(round);

    setChallengeDisabled(true);
    const currentTarget = target;
    const currentOptions = options;
    const correctIdx = currentOptions.findIndex(o => o.word === currentTarget.word);
    setTimeout(() => {
      if (correctIdx >= 0) {
        setBoxStates(prev => ({ ...prev, [correctIdx]: 'correct' }));
      }
      playSequence([
        { text: currentTarget.word, lang: 'en-US', rate: diff.ttsRate },
        { pause: 400 },
        { text: lf(currentTarget, 'translation', uiLang), lang: uiLang, rate: 0.85 },
      ], speak);
    }, 500);

    const nextRound = round + 1;
    clearRoundTimers();
    prefetchRoundAudio(wordPoolRef.current, nextRound);
    pushTimer(setTimeout(() => {
      setRound(nextRound);
      setPhase('running');
      pushTimer(setTimeout(() => {
        startChallenge(wordPoolRef.current, nextRound);
      }, 2000 + Math.random() * 1000));
    }, 2000));
  }, [target, options, round, diff, speak, startChallenge, challengeDisabled, advanceBots, uiLang, prefetchRoundAudio]);

  // Handle word tap
  const handleWordTap = useCallback((tappedWord, index) => {
    if (challengeDisabled) return;
    playTap();
    setTimerActive(false);

    const isCorrect = tappedWord.word === target.word;

    if (isCorrect) {
      setChallengeDisabled(true);
      playCorrect();
      setBoxStates(prev => ({ ...prev, [index]: 'correct' }));
      setShowSparkle(true);
      setShowCoin(true);
      setAvatarMode('celebrate');
      // Golden flash + character jump
      setShowGoldenFlash(true);
      setCharEffect('runner-jump');
      setTimeout(() => { setShowGoldenFlash(false); setCharEffect(''); }, 600);

      const newStreak = streak + 1;
      setStreak(newStreak);
      setCorrectCount(c => c + 1);

      // Time bonus check
      const elapsed = timerStartRef.current ? (performance.now() - timerStartRef.current) / 1000 : 999;
      let timeBonus = 0;
      if (elapsed < TIME_BONUS_THRESHOLD) {
        timeBonus = TIME_BONUS_POINTS;
        timeBonusTotalRef.current += timeBonus;
      }

      const streakBonus = newStreak >= 3 ? 5 * newStreak : 0;
      const bossMultiplier = isBossRound ? 2 : 1;
      const roundScore = (10 + streakBonus + timeBonus) * bossMultiplier;
      setScore(s => s + roundScore);

      const coinAmount = ((newStreak >= 3 || isPowerMode) ? 2 : 1) * bossMultiplier;
      setCoins(c => c + coinAmount);

      // Player advances
      setPlayerPos(p => Math.min(p + distPerCorrect, TOTAL_DISTANCE));
      advanceBots(round);

      // Boss defeated
      if (isBossRound) {
        bossDefeatedRef.current = true;
      }

      if (newStreak >= 3 && !isPowerMode) {
        setIsPowerMode(true);
        playWhoosh();
      }

      // Praise
      const praisesByLang = {
        he: ['יוֹפִי!', 'נָכוֹן!', 'מְצוּיָּן!', 'כׇּל הַכָּבוֹד!', 'מַדְהִים!'],
        ar: ['رائع!', 'صحيح!', 'ممتاز!', 'أحسنت!', 'مذهل!'],
        ru: ['Отлично!', 'Правильно!', 'Молодец!', 'Великолепно!', 'Потрясающе!'],
        en: ['Great!', 'Correct!', 'Excellent!', 'Well done!', 'Amazing!'],
      };
      const praises = praisesByLang[uiLang] || praisesByLang.en;
      const praise = praises[Math.floor(Math.random() * praises.length)];
      setTimeout(() => {
        playSequence([{ text: praise, lang: uiLang }], null);
      }, 300);

      // Next round after delay
      const nextRound = round + 1;
      clearRoundTimers();
      prefetchRoundAudio(wordPoolRef.current, nextRound);
      pushTimer(setTimeout(() => {
        setAvatarMode('idle');
        setShowSparkle(false);
        setShowCoin(false);
        setRound(nextRound);
        setPhase('running');

        pushTimer(setTimeout(() => {
          startChallenge(wordPoolRef.current, nextRound);
        }, 2000 + Math.random() * 1000));
      }, 1500));

    } else {
      playWrong();
      setBoxStates(prev => ({ ...prev, [index]: 'wrong' }));
      setStreak(0);
      setIsPowerMode(false);
      setTimerActive(false); // Pause timer on wrong answer
      // Camera shake + character stumble
      setShakeClass('runner-shake');
      setCharEffect('runner-stumble');
      setTimeout(() => { setShakeClass(''); setCharEffect(''); }, 500);

      // Penalty
      setPlayerPos(p => Math.max(p - WRONG_PENALTY, 0));

      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= 2) {
        setChallengeDisabled(true);
        advanceBots(round);
        const correctIdx = options.findIndex(o => o.word === target.word);
        setTimeout(() => {
          setBoxStates(prev => ({ ...prev, [correctIdx]: 'correct' }));
          playSequence([
            { text: target.word, lang: 'en-US', rate: diff.ttsRate },
            { pause: 400 },
            { text: lf(target, 'translation', uiLang), lang: uiLang, rate: 0.85 },
          ], speak);
        }, 500);

        const nextRound = round + 1;
        clearRoundTimers();
        prefetchRoundAudio(wordPoolRef.current, nextRound);
        pushTimer(setTimeout(() => {
          setRound(nextRound);
          setPhase('running');
          pushTimer(setTimeout(() => {
            startChallenge(wordPoolRef.current, nextRound);
          }, 2000 + Math.random() * 1000));
        }, 2000));
      }
    }
  }, [target, streak, isPowerMode, attempts, round, options, diff, speak, startChallenge, challengeDisabled, isBossRound, distPerCorrect, advanceBots, uiLang, prefetchRoundAudio]);

  // Re-speak target word
  const handleReplay = useCallback(() => {
    if (target) {
      playSequence([
        { text: target.word, lang: 'en-US', rate: diff.ttsRate },
        { pause: 400 },
        { text: lf(target, 'translation', uiLang), lang: uiLang, rate: 0.85 },
      ], speak);
    }
  }, [target, speak, diff.ttsRate, uiLang]);

  // ── RENDER ──

  if (showStoryIntro) {
    return (
      <StoryIntro
        uiLang={uiLang}
        onStart={() => setShowStoryIntro(false)}
      />
    );
  }

  if (phase === 'world-select') {
    return <WorldSelector onSelect={handleWorldSelect} onBack={handleBack} childLevel={childLevel} uiLang={uiLang} />;
  }

  // Game over screen
  if (phase === 'game-over') {
    const bossDefeated = bossDefeatedRef.current;
    const xp = score * 5 + coins * 2 + 5 + (bossDefeated ? 20 : 0);
    return (
      <RunGameOver
        score={score}
        coins={coins}
        totalRounds={diff.rounds}
        correctCount={correctCount}
        xp={xp}
        onContinue={() => onComplete(xp)}
        world={world}
        uiLang={uiLang}
        playerPos={playerPos}
        botPositions={botPositions}
        timeBonusTotal={timeBonusTotalRef.current}
        bossDefeated={bossDefeated}
      />
    );
  }

  const timerDuration = getTimerDuration(round);

  // Main game viewport
  return (
    <div className="h-screen relative overflow-hidden" style={{ touchAction: 'manipulation' }}>
      <RunnerViewport
        world={world}
        phase={phase}
        isPowerMode={isPowerMode}
        shakeClass={shakeClass}
        charEffect={charEffect}
        botPositions={botPositions}
        playerPos={playerPos}
      >
        {/* HUD — always visible, z-40 for back button */}
        <RunHUD
          score={score}
          coins={coins}
          streak={streak}
          round={round}
          totalRounds={diff.rounds}
          onBack={handleBack}
          isPowerMode={isPowerMode}
          uiLang={uiLang}
        />

        {/* Golden flash overlay on correct */}
        {showGoldenFlash && (
          <div
            className="absolute inset-0 pointer-events-none z-30"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(255,200,0,0.3) 0%, rgba(255,200,0,0) 70%)',
              animation: 'goldenFlash 0.5s ease-out forwards',
            }}
          />
        )}

        {/* Race track progress */}
        <RaceTrack playerPos={playerPos} botPositions={botPositions} world={world} />

        {/* Visual timer during word-challenge */}
        {phase === 'word-challenge' && (
          <VisualTimer
            key={timerKey}
            duration={timerDuration}
            active={timerActive}
            onTimeUp={handleTimeUp}
            uiLang={uiLang}
          />
        )}

        {/* Boss overlay */}
        {showBossOverlay && world && (
          <BossOverlay world={world} uiLang={uiLang} onDone={handleBossOverlayDone} />
        )}

        {/* Countdown overlay */}
        {phase === 'countdown' && (
          <Countdown onDone={handleCountdownDone} world={world} />
        )}

        {/* Word challenge overlay */}
        {phase === 'word-challenge' && target && (
          <div className={`absolute inset-x-0 top-14 bottom-[28%] z-20 flex flex-col items-center justify-center px-4 ${isBossRound ? 'run-boss-border rounded-3xl mx-2' : ''}`}>
            {/* Dim backdrop */}
            <div
              className="absolute inset-0 rounded-3xl mx-2"
              style={{
                backdropFilter: 'blur(2px)',
                background: isBossRound
                  ? 'radial-gradient(ellipse at center, rgba(239,68,68,0.15) 0%, rgba(0,0,0,0.3) 100%)'
                  : 'rgba(0,0,0,0.25)',
              }}
            />

            <div className="relative flex flex-col items-center">
              {/* Target word display */}
              <TargetWordBubble
                target={target}
                diff={diff}
                uiLang={uiLang}
                onReplay={handleReplay}
              />

              {/* Word option boxes */}
              <div className="flex flex-wrap gap-3 justify-center max-w-sm">
                {options.map((opt, i) => (
                  <WordBox
                    key={`${round}-${i}`}
                    word={opt.word}
                    emoji={opt.emoji}
                    translation={lf(opt, 'translation', uiLang)}
                    showEmoji={diff.showEmoji}
                    showHebrew={diff.showHebrew}
                    onClick={() => handleWordTap(opt, i)}
                    state={boxStates[i]}
                    index={i}
                    disabled={challengeDisabled}
                  />
                ))}
              </div>

              {/* Coin fly animation */}
              {showCoin && <CoinAnimation show={true} />}
            </div>
          </div>
        )}
      </RunnerViewport>
    </div>
  );
}

export default SpeakliRunGame;
