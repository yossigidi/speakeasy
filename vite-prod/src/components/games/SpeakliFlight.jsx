import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { ArrowLeft, Volume2, Star, Zap, Trophy, Shield, Pause } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { useSpeech } from '../../contexts/SpeechContext.jsx';
import { playSequence, preloadHebrewAudio, preloadEnglishAudio, stopAllAudio } from '../../utils/hebrewAudio.js';
import { playCorrect, playWrong, playPop, playTap, playComplete, playStar, playWhoosh } from '../../utils/gameSounds.js';
import { getWordsForLevel, SENTENCES_BY_LEVEL } from '../../data/kids-vocabulary.js';
import { shuffle } from '../../utils/shuffle.js';
import SpeakliAvatar from '../kids/SpeakliAvatar.jsx';
import { t, tReplace, lf, RTL_LANGS } from '../../utils/translations.js';

// Hebrew phrases preloaded for instant feedback
const FLIGHT_PHRASES = [
  'יוֹפִי!', 'נָכוֹן!', 'מְצוּיָּן!', 'כׇּל הַכָּבוֹד!', 'מַדְהִים!', 'נַסּוּ שׁוּב',
  'עִזְרוּ לְסְפִּיקְלִי לָטוּס בַּחָלָל! הַקְשִׁיבוּ לַמִּלָּה וְלִחֲצוּ עַל הַתְּשׁוּבָה',
];

// ── Space zones ──
const ZONES = [
  {
    id: 'asteroid-belt',
    emoji: '🪨',
    nameHe: 'חגורת אסטרואידים',
    nameEn: 'Asteroid Belt',
    nameAr: 'حزام الكويكبات',
    nameRu: 'Пояс астероидов',
    skyGradient: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
    obstacleEmojis: ['🪨', '☄️', '💎'],
    categories: [],
    filterWords: w => true,
  },
  {
    id: 'nebula',
    emoji: '🌌',
    nameHe: 'ערפילית צבעונית',
    nameEn: 'Colorful Nebula',
    nameAr: 'السديم الملوّن',
    nameRu: 'Цветная туманность',
    skyGradient: 'linear-gradient(180deg, #581c87 0%, #7e22ce 50%, #a855f7 100%)',
    obstacleEmojis: ['✨', '💫', '🌟'],
    categories: ['animals', 'nature'],
    filterWords: w => true,
  },
  {
    id: 'alien-territory',
    emoji: '👽',
    nameHe: 'שטח החייזרים',
    nameEn: 'Alien Territory',
    nameAr: 'أرض الفضائيين',
    nameRu: 'Территория пришельцев',
    skyGradient: 'linear-gradient(180deg, #064e3b 0%, #065f46 50%, #047857 100%)',
    obstacleEmojis: ['👽', '🛸', '👾'],
    categories: ['food', 'school'],
    filterWords: w => true,
  },
  {
    id: 'black-hole',
    emoji: '🕳️',
    nameHe: 'חור שחור',
    nameEn: 'Black Hole',
    nameAr: 'الثقب الأسود',
    nameRu: 'Чёрная дыра',
    skyGradient: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 50%, #0f0a1e 100%)',
    obstacleEmojis: ['🕳️', '💀', '🌀'],
    categories: ['sentences'],
    filterWords: w => true,
    sentencesOnly: true,
    minLevel: 3,
  },
];

// Difficulty config by child level (reused from SpeakliRun)
const DIFFICULTY = {
  1: { options: 3, showEmoji: true,  showHebrew: true,  rounds: 6,  ttsRate: 0.55, useSentences: false },
  2: { options: 3, showEmoji: true,  showHebrew: false, rounds: 8,  ttsRate: 0.6,  useSentences: false },
  3: { options: 4, showEmoji: false, showHebrew: false, rounds: 8,  ttsRate: 0.65, useSentences: false },
  4: { options: 4, showEmoji: false, showHebrew: false, rounds: 10, ttsRate: 0.7,  useSentences: true  },
};

// ── Flight constants ──
const MAX_SHIELDS = 3;
const TOTAL_DISTANCE = 100;
const TIMER_DURATIONS = { 1: 15, 2: 12, 3: 10, 4: 8 };
const TIME_BONUS_THRESHOLD = 4;
const TIME_BONUS_POINTS = 3;
const BOSS_EMOJIS = { 'asteroid-belt': '🤖', nebula: '🐲', 'alien-territory': '👾', 'black-hole': '💀' };

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

// ── FlightStoryIntro ──
function FlightStoryIntro({ onStart, uiLang }) {
  const spokenRef = React.useRef(false);

  useEffect(() => {
    if (spokenRef.current) return;
    spokenRef.current = true;
    const langMap = { he: 'he', ar: 'ar', ru: 'ru', en: 'en' };
    const storyText = t('flightStoryIntroText', uiLang);
    if (storyText) {
      playSequence([
        { text: storyText, lang: langMap[uiLang] || 'he' },
      ], null);
    }
  }, [uiLang]);

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Video background */}
      <video
        autoPlay muted loop playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
        src="/videos/flight/intro.mp4"
        onError={(e) => { e.target.style.display = 'none'; }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/60 via-purple-900/50 to-black/70" style={{ zIndex: 1 }} />

      {/* Star particles */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${1 + Math.random() * 3}px`,
              height: `${1 + Math.random() * 3}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `starTwinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Speakli avatar */}
        <div className="mb-4">
          <SpeakliAvatar mode="bounce" size="xl" />
        </div>

        {/* Speech bubble */}
        <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl px-6 py-5 shadow-2xl max-w-sm mb-6 border border-white/30">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white/90 dark:bg-gray-800/90 rotate-45 rounded-sm" />
          <p className="text-center text-gray-800 dark:text-white font-bold text-lg relative z-10">
            {t('flightStoryIntroText', uiLang)}
          </p>
        </div>

        {/* Obstacle preview */}
        <p className="text-white/80 font-bold text-sm mb-2 drop-shadow-lg">
          🛡️ × {MAX_SHIELDS}
        </p>
        <div className="flex gap-6 mb-8 bg-indigo-900/40 backdrop-blur-md rounded-2xl px-5 py-3 border border-indigo-400/30">
          {['🪨', '☄️', '👽', '🛸'].map((emoji, i) => (
            <span key={i} className="text-2xl" style={{ animation: `starTwinkle ${2 + i * 0.5}s ease-in-out infinite` }}>
              {emoji}
            </span>
          ))}
        </div>

        {/* Start button */}
        <button
          onClick={() => { playTap(); onStart(); }}
          className="btn-3d px-10 py-4 rounded-2xl font-black text-white text-xl shadow-2xl active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          {t('startFlight', uiLang)} 🚀
        </button>
      </div>
    </div>
  );
}

// ── ZoneSelector ──
function ZoneSelector({ onSelect, onBack, childLevel, uiLang }) {
  const isRtl = RTL_LANGS.includes(uiLang);

  return (
    <div className="kids-bg min-h-screen relative flex flex-col">
      {/* Back button */}
      <div className="absolute z-20" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 12px)', left: isRtl ? 'auto' : 12, right: isRtl ? 12 : 'auto' }}>
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center active:scale-90 transition-transform"
        >
          <ArrowLeft size={20} className={`text-gray-700 ${isRtl ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div className="relative z-10 flex flex-col items-center px-4 pb-6 flex-1 overflow-auto" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
        <div className="mb-3">
          <SpeakliAvatar mode="bounce" size="lg" />
        </div>
        <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-1 text-center">
          {t('gameSpeakliFlightTitle', uiLang)} 🚀
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 text-center">
          {t('pickZoneAndFly', uiLang)}
        </p>

        <div className="space-y-4 w-full max-w-lg">
          {ZONES.map(zone => {
            const locked = zone.minLevel && childLevel < zone.minLevel;
            return (
              <button
                key={zone.id}
                onClick={() => { if (!locked) { playTap(); onSelect(zone); } }}
                disabled={locked}
                className={`w-full rounded-3xl p-5 text-left transition-all duration-300 relative overflow-hidden ${
                  locked ? 'opacity-50 grayscale' : 'active:scale-[0.97]'
                }`}
                style={{ background: zone.skyGradient }}
              >
                {/* Decorative circles */}
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10" />

                {locked && (
                  <div className="absolute top-3 right-3 bg-black/30 rounded-full p-1.5 z-10">
                    <span className="text-white text-xs">🔒</span>
                  </div>
                )}

                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl mb-2 shadow-lg border-2 border-white/30">
                    {zone.emoji}
                  </div>
                  <h3 className="text-white font-black text-xl">
                    {lf(zone, 'name', uiLang)}
                  </h3>
                  <p className="text-white/70 text-sm font-medium mt-1">
                    {locked ? `🔒 ${t('moreZonesUnlock', uiLang)}` : `🚀 ${lf(zone, 'name', 'en')}`}
                  </p>

                  {/* Preview obstacles */}
                  {!locked && (
                    <div className="flex gap-2 mt-3">
                      {zone.obstacleEmojis.map((e, i) => (
                        <div key={i} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg border border-white/30">
                          {e}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Countdown overlay ──
function Countdown({ onDone, zone }) {
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
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative flex flex-col items-center gap-4">
        <div
          key={count}
          className="font-black text-white drop-shadow-lg"
          style={{
            fontSize: count === 0 ? '4rem' : '7rem',
            animation: 'countdownPop 0.6s ease-out',
            textShadow: '0 0 40px rgba(255,255,255,0.5), 0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
          {count === 0 ? '🚀 Liftoff!' : count}
        </div>
        {count > 0 && (
          <p className="text-white/80 text-lg font-bold animate-pulse">
            {zone?.emoji} Get ready...
          </p>
        )}
      </div>
    </div>
  );
}

// ── ShieldBar ──
function ShieldBar({ shields, maxShields }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxShields }).map((_, i) => (
        <div
          key={i}
          className="transition-all duration-300"
          style={{
            fontSize: '1.2rem',
            opacity: i < shields ? 1 : 0.25,
            transform: i < shields ? 'scale(1)' : 'scale(0.7)',
            filter: i < shields ? 'none' : 'grayscale(1)',
            animation: i === shields ? 'shieldCrack 0.5s ease-out' : 'none',
          }}
        >
          🛡️
        </div>
      ))}
    </div>
  );
}

// ── DistanceMeter ──
function DistanceMeter({ distance, total }) {
  const pct = Math.min(distance, total) / total;
  return (
    <div className="absolute bottom-3 left-0 right-0 z-[15] px-4 pointer-events-none">
      <div className="relative h-5 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
        {/* Track fill */}
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${Math.max(pct * 100, 3)}%`,
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7)',
          }}
        />
        {/* Ship marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-out"
          style={{ left: `calc(${Math.max(pct * 100, 2)}% - 10px)` }}
        >
          <span className="text-sm drop-shadow-lg">🚀</span>
        </div>
        {/* Star at end */}
        <div className="absolute top-1/2 -translate-y-1/2 right-1">
          <span className="text-xs">⭐</span>
        </div>
      </div>
    </div>
  );
}

// ── FlightHUD ──
function FlightHUD({ score, coins, streak, round, totalRounds, shields, onBack, onPause, isPowerMode, uiLang }) {
  return (
    <>
      {/* Back + Pause buttons */}
      <div className="absolute top-3 left-3 z-40 flex gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onBack(); }}
          className="text-white/90 bg-black/30 rounded-full p-3 backdrop-blur-md active:scale-90 transition-transform min-w-[44px] min-h-[44px] flex items-center justify-center shadow-lg border border-white/10"
        >
          <ArrowLeft size={20} className={RTL_LANGS.includes(uiLang) ? 'rotate-180' : ''} />
        </button>
        {onPause && (
          <button
            onClick={(e) => { e.stopPropagation(); onPause(); }}
            className="text-white/90 bg-black/30 rounded-full p-3 backdrop-blur-md active:scale-90 transition-transform min-w-[44px] min-h-[44px] flex items-center justify-center shadow-lg border border-white/10"
          >
            <Pause size={20} />
          </button>
        )}
      </div>

      {/* Stats bar */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
        {/* Shields */}
        <div className="bg-black/30 backdrop-blur-md rounded-full px-2.5 py-1.5 flex items-center gap-1 border border-white/10 shadow-lg">
          <ShieldBar shields={shields} maxShields={MAX_SHIELDS} />
        </div>
        <div className="bg-black/30 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-1.5 border border-white/10 shadow-lg">
          <span className="text-yellow-300 text-sm">🪙</span>
          <span className="text-white font-black text-sm">{coins}</span>
        </div>
        <div className="bg-black/30 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-1.5 border border-white/10 shadow-lg">
          <Star size={14} className="text-yellow-300 fill-yellow-300" />
          <span className="text-white font-black text-sm">{score}</span>
        </div>
        {streak >= 2 && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full px-2.5 py-1.5 flex items-center gap-1 animate-pulse shadow-lg border border-indigo-300/30">
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
function VisualTimer({ duration, active, onTimeUp }) {
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
        <circle cx="26" cy="26" r="22" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
        <circle
          cx="26" cy="26" r="22"
          fill="none"
          stroke={isUrgent ? '#ef4444' : '#8b5cf6'}
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform="rotate(-90 26 26)"
          style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s ease' }}
        />
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
function BossOverlay({ zone, uiLang, onDone }) {
  const bossEmoji = BOSS_EMOJIS[zone.id] || '👾';

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

// ── WordBox ──
const ACCENT_COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#06b6d4'];
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

// ── TargetWordBubble ──
function TargetWordBubble({ target, diff, uiLang, onReplay }) {
  return (
    <div className="flex flex-col items-center gap-2 mb-4">
      <div className="relative">
        <div
          className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-md border-2 border-white/30 flex items-center justify-center shadow-2xl"
          style={{ animation: 'countdownPop 0.4s ease-out' }}
        >
          <span className="text-5xl">{target.emoji || '🔊'}</span>
        </div>
        <button
          onClick={onReplay}
          className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg active:scale-90 transition-transform border-2 border-white/50"
          style={{ animation: 'pulse 2s ease-in-out infinite' }}
        >
          <Volume2 size={18} className="text-white" />
        </button>
      </div>

      <div className="bg-black/30 backdrop-blur-md rounded-full px-5 py-2 border border-white/15 shadow-lg">
        <p className="text-white font-bold text-sm text-center">
          {t('listenAndTapCorrect', uiLang)} 👆
        </p>
      </div>
    </div>
  );
}

// ── SpaceViewport ──
function SpaceViewport({ zone, phase, isPowerMode, shakeClass, charEffect, distance, children }) {
  const isChallenge = phase === 'word-challenge';
  const isCountdown = phase === 'countdown';

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${isPowerMode ? 'flight-power' : ''} ${isCountdown ? 'runner-paused' : ''} ${shakeClass || ''}`}
      style={{
        background: zone.skyGradient,
        minHeight: '100dvh',
      }}
    >
      {/* Video background */}
      <video
        autoPlay muted loop playsInline
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ zIndex: 0 }}
        src={`/videos/flight/${zone.id}.mp4`}
        onError={(e) => { e.target.style.display = 'none'; }}
      />

      {/* Star field */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 80}%`,
              animation: `starTwinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Floating obstacles */}
      {(phase === 'flying' || phase === 'word-challenge') && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 5 }}>
          {zone.obstacleEmojis.map((emoji, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                top: `${20 + i * 20}%`,
                fontSize: '2rem',
                animation: `asteroidFloat ${4 + i * 1.5}s linear infinite`,
                animationDelay: `${i * 1.2}s`,
                opacity: 0.6,
              }}
            >
              {emoji}
            </div>
          ))}
        </div>
      )}

      {/* Warp speed lines (power mode) */}
      {isPowerMode && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 6 }}>
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${30 + (i * 7) % 50}px`,
                height: '2px',
                background: `rgba(139,92,246,${0.2 + (i * 3) % 20 / 100})`,
                top: `${10 + (i * 13) % 60}%`,
                animation: `warpLine ${0.3 + (i * 0.06) % 0.3}s linear infinite`,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Speed lines (flying) */}
      {(phase === 'flying' && !isPowerMode) && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 6 }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${20 + (i * 7) % 40}px`,
                height: '2px',
                background: `rgba(255,255,255,${0.15 + (i * 5) % 20 / 100})`,
                top: `${15 + (i * 13) % 55}%`,
                animation: `speedLine ${0.6 + (i * 0.1) % 0.6}s linear infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Engine exhaust */}
      {phase === 'flying' && (
        <div className="absolute pointer-events-none" style={{ left: '8%', top: '44%', zIndex: 9 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="absolute rounded-full" style={{
              width: `${8 + i * 3}px`, height: `${8 + i * 3}px`,
              background: i < 2 ? `rgba(139,92,246,${0.5 - i * 0.1})` : `rgba(99,102,241,${0.3 - i * 0.05})`,
              left: `${-10 - i * 12}px`,
              top: `${-2 + (i % 2) * 4}px`,
              animation: `engineExhaust ${0.4 + i * 0.1}s ease-out infinite`,
              animationDelay: `${i * 0.08}s`,
            }} />
          ))}
        </div>
      )}

      {/* Power mode purple overlay */}
      {isPowerMode && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.1) 0%, rgba(99,102,241,0.05) 100%)',
            animation: 'powerPulse 1.5s ease-in-out infinite',
            zIndex: 24,
          }}
        />
      )}

      {/* Speakli character — center-left, mid-screen (floating) */}
      <div
        className={`absolute z-10 ${isCountdown ? 'runner-paused-char' : isChallenge ? '' : 'flight-leaning'} ${charEffect || ''}`}
        style={{ left: '12%', top: '38%' }}
      >
        {/* Afterimage ghosts in power mode */}
        {isPowerMode && phase === 'flying' && (
          <>
            <div className="absolute inset-0" style={{ opacity: 0.15, transform: 'translateX(-30px)', filter: 'blur(2px)' }}>
              <SpeakliAvatar mode="bounce" size="2xl" />
            </div>
            <div className="absolute inset-0" style={{ opacity: 0.08, transform: 'translateX(-55px)', filter: 'blur(3px)' }}>
              <SpeakliAvatar mode="bounce" size="2xl" />
            </div>
          </>
        )}
        <SpeakliAvatar
          mode={isChallenge ? 'idle' : isCountdown ? 'idle' : 'bounce'}
          size="2xl"
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

// ── FlightGameOver ──
function FlightGameOver({ score, coins, totalRounds, correctCount, xp, shields, onContinue, onBack, zone, uiLang, timeBonusTotal, bossDefeated }) {
  // Mission result based on shields
  const missionEmoji = shields === MAX_SHIELDS ? '🌟' : shields >= 2 ? '⭐' : shields >= 1 ? '✨' : '💫';
  const missionTitle = shields === MAX_SHIELDS
    ? t('perfectMission', uiLang)
    : shields >= 2
    ? t('greatFlight', uiLang)
    : shields >= 1
    ? t('missionComplete', uiLang)
    : t('missionFailed', uiLang);
  const showConfetti = shields === MAX_SHIELDS;

  useEffect(() => {
    playComplete();
  }, []);

  return (
    <div className="kids-bg min-h-screen relative">
      {showConfetti && <ConfettiBurst show={true} />}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6">
        {/* Mission result */}
        <div
          className="text-6xl mb-2"
          style={{ animation: 'countdownPop 0.6s ease-out' }}
        >
          {missionEmoji}
        </div>

        <h2 className="text-3xl font-black text-gray-800 dark:text-white mb-1">
          {missionTitle}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
          {tReplace('raceResultSummary', uiLang, { correctCount, totalRounds })}
        </p>

        {/* Shields remaining */}
        <div className="flex items-center gap-2 mb-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl px-5 py-3 shadow-lg">
          <ShieldBar shields={shields} maxShields={MAX_SHIELDS} />
          <span className="text-sm font-bold text-gray-600 dark:text-gray-300 ml-2">
            {shields}/{MAX_SHIELDS}
          </span>
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
          {shields > 0 && (
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl px-4 py-2.5 shadow-lg text-center">
              <div className="text-xl mb-0.5">🛡️</div>
              <div className="text-lg font-bold text-indigo-600">+{shields * 10}</div>
              <div className="text-xs text-gray-500">{t('shieldsRemaining', uiLang)}</div>
            </div>
          )}
        </div>

        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl px-6 py-3 mb-5 shadow-lg">
          <div className="flex items-center gap-2">
            <Zap size={20} className="text-yellow-500" />
            <span className="text-lg font-bold text-yellow-600">+{xp} XP</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={onContinue}
            className="btn-3d px-10 py-4 rounded-2xl font-black text-white text-xl shadow-2xl w-full"
            style={{ background: zone.skyGradient, boxShadow: 'none' }}
          >
            {t('continue', uiLang)} ✨
          </button>
          <button
            onClick={onBack}
            className="px-8 py-3 rounded-2xl font-bold text-gray-600 dark:text-gray-300 text-base bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm active:scale-95 transition-transform w-full"
          >
            {t('backHome', uiLang)} 🏠
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  MAIN GAME COMPONENT
// ═══════════════════════════════════════════════════════

export function SpeakliFlightGame({ onComplete, onBack, childLevel = 1 }) {
  const { uiLang } = useTheme();
  const { speak } = useSpeech();

  const [showStoryIntro, setShowStoryIntro] = useState(true);

  // Game state machine: story-intro → zone-select → countdown → flying → word-challenge → (boss-intro →) game-over
  const [phase, setPhase] = useState('zone-select');
  const [zone, setZone] = useState(null);

  // Round state
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isPowerMode, setIsPowerMode] = useState(false);
  const [showPause, setShowPause] = useState(false);

  // Flight / shield state
  const [shields, setShields] = useState(MAX_SHIELDS);
  const [distance, setDistance] = useState(0);

  // Timer state
  const [timerActive, setTimerActive] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
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
  const [challengeDisabled, setChallengeDisabled] = useState(false);

  // Visual effect states
  const [shakeClass, setShakeClass] = useState('');
  const [charEffect, setCharEffect] = useState('');
  const [showHitFlash, setShowHitFlash] = useState(false);

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

  // Preload Hebrew audio + cleanup
  useEffect(() => {
    const t = setTimeout(() => preloadHebrewAudio(FLIGHT_PHRASES), 3000);
    return () => { clearTimeout(t); stopAllAudio(); clearRoundTimers(); };
  }, []);

  // Prefetch audio for the upcoming round
  const prefetchRoundAudio = useCallback((pool, roundNum) => {
    if (roundNum >= diff.rounds) return;
    const targetIdx = roundNum % pool.length;
    const targetWord = pool[targetIdx];
    if (!targetWord) return;
    const translation = lf(targetWord, 'translation', uiLang);
    preloadEnglishAudio([targetWord.word]);
    if (translation) {
      const langMap = { he: 'he', ar: 'ar', ru: 'ru', en: 'en' };
      preloadHebrewAudio([translation], langMap[uiLang] || 'he');
    }
  }, [diff.rounds, uiLang]);

  // Build word pool when zone is selected
  const buildWordPool = useCallback((selectedZone) => {
    if (selectedZone.sentencesOnly && diff.useSentences && SENTENCES_BY_LEVEL[childLevel]) {
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

  // Launch the word challenge
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

  // Start a new challenge round
  const startChallenge = useCallback((pool, roundNum) => {
    if (roundNum >= diff.rounds) {
      setPhase('game-over');
      return;
    }

    const boss = roundNum === diff.rounds - 1;
    setIsBossRound(boss);

    if (boss) {
      setShowBossOverlay(true);
      return;
    }

    launchChallenge(pool, roundNum, boss);
  }, [diff, launchChallenge]);

  // Handle boss overlay done
  const handleBossOverlayDone = useCallback(() => {
    setShowBossOverlay(false);
    launchChallenge(wordPoolRef.current, round, true);
  }, [round, launchChallenge]);

  // Handle zone selection
  const handleZoneSelect = useCallback((selectedZone) => {
    setZone(selectedZone);
    const pool = buildWordPool(selectedZone);
    wordPoolRef.current = pool;
    setPhase('countdown');
  }, [buildWordPool]);

  // Handle countdown done → start flying
  const handleCountdownDone = useCallback(() => {
    setPhase('flying');
    prefetchRoundAudio(wordPoolRef.current, 0);
    clearRoundTimers();
    pushTimer(setTimeout(() => {
      startChallenge(wordPoolRef.current, 0);
    }, 2500));
  }, [startChallenge, prefetchRoundAudio]);

  // Handle back button
  const handleBack = useCallback(() => {
    clearRoundTimers();
    stopAllAudio();
    onBack();
  }, [onBack]);

  // Handle shield loss
  const loseShield = useCallback(() => {
    setShields(prev => {
      const newShields = prev - 1;
      if (newShields <= 0) {
        // Game over — shields depleted
        clearRoundTimers();
        pushTimer(setTimeout(() => {
          setPhase('game-over');
        }, 1500));
      }
      return Math.max(newShields, 0);
    });
    setShowHitFlash(true);
    setShakeClass('flight-shake');
    setCharEffect('runner-stumble');
    setTimeout(() => {
      setShowHitFlash(false);
      setShakeClass('');
      setCharEffect('');
    }, 600);
  }, []);

  // Handle time up
  const handleTimeUp = useCallback(() => {
    if (challengeDisabled || !target) return;
    setTimerActive(false);
    playWrong();
    setStreak(0);
    setIsPowerMode(false);

    // Lose shield on timeout
    loseShield();

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
      setPhase('flying');
      pushTimer(setTimeout(() => {
        startChallenge(wordPoolRef.current, nextRound);
      }, 2000 + Math.random() * 1000));
    }, 2000));
  }, [target, options, round, diff, speak, startChallenge, challengeDisabled, loseShield, uiLang, prefetchRoundAudio]);

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
      setCharEffect('runner-jump');
      setTimeout(() => { setCharEffect(''); }, 600);

      const newStreak = streak + 1;
      setStreak(newStreak);
      setCorrectCount(c => c + 1);

      // Distance advance
      setDistance(d => Math.min(d + distPerCorrect, TOTAL_DISTANCE));

      // Time bonus
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

      // Next round
      const nextRound = round + 1;
      clearRoundTimers();
      prefetchRoundAudio(wordPoolRef.current, nextRound);
      pushTimer(setTimeout(() => {
        setShowSparkle(false);
        setShowCoin(false);
        setRound(nextRound);
        setPhase('flying');

        pushTimer(setTimeout(() => {
          startChallenge(wordPoolRef.current, nextRound);
        }, 2000 + Math.random() * 1000));
      }, 1500));

    } else {
      // Wrong answer
      playWrong();
      setBoxStates(prev => ({ ...prev, [index]: 'wrong' }));
      setStreak(0);
      setIsPowerMode(false);
      setTimerActive(false);

      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts === 1) {
        // First wrong: shake only, second chance — no shield lost
        setShakeClass('flight-shake');
        setCharEffect('runner-stumble');
        setTimeout(() => { setShakeClass(''); setCharEffect(''); }, 500);
      }

      if (newAttempts >= 2) {
        // Second wrong: lose shield
        setChallengeDisabled(true);
        loseShield();

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
          setPhase('flying');
          pushTimer(setTimeout(() => {
            startChallenge(wordPoolRef.current, nextRound);
          }, 2000 + Math.random() * 1000));
        }, 2000));
      }
    }
  }, [target, streak, isPowerMode, attempts, round, options, diff, speak, startChallenge, challengeDisabled, isBossRound, distPerCorrect, loseShield, uiLang, prefetchRoundAudio]);

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
      <FlightStoryIntro
        uiLang={uiLang}
        onStart={() => setShowStoryIntro(false)}
      />
    );
  }

  if (phase === 'zone-select') {
    return <ZoneSelector onSelect={handleZoneSelect} onBack={handleBack} childLevel={childLevel} uiLang={uiLang} />;
  }

  // Game over screen
  if (phase === 'game-over') {
    const bossDefeated = bossDefeatedRef.current;
    const xp = score * 5 + coins * 2 + 5 + (bossDefeated ? 20 : 0) + (shields * 10);
    return (
      <FlightGameOver
        score={score}
        coins={coins}
        totalRounds={diff.rounds}
        correctCount={correctCount}
        xp={xp}
        shields={shields}
        onContinue={() => onComplete(xp)}
        onBack={handleBack}
        zone={zone}
        uiLang={uiLang}
        timeBonusTotal={timeBonusTotalRef.current}
        bossDefeated={bossDefeated}
      />
    );
  }

  const timerDuration = getTimerDuration(round);

  // Main game viewport
  return (
    <div className="h-screen relative overflow-hidden" style={{ touchAction: 'manipulation' }}>
      <SpaceViewport
        zone={zone}
        phase={phase}
        isPowerMode={isPowerMode}
        shakeClass={shakeClass}
        charEffect={charEffect}
        distance={distance}
      >
        {/* HUD */}
        <FlightHUD
          score={score}
          coins={coins}
          streak={streak}
          round={round}
          totalRounds={diff.rounds}
          shields={shields}
          onBack={handleBack}
          onPause={() => setShowPause(true)}
          isPowerMode={isPowerMode}
          uiLang={uiLang}
        />

        {/* Pause overlay */}
        {showPause && (
          <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
            <div className="text-center">
              <div className="text-6xl mb-6">⏸️</div>
              <h2 className="text-2xl font-black text-white mb-8">{t('gamePaused', uiLang)}</h2>
              <div className="flex flex-col gap-3 items-center">
                <button
                  onClick={() => setShowPause(false)}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold text-lg shadow-lg min-w-[200px]"
                >
                  ▶️ {t('gameResume', uiLang)}
                </button>
                <button
                  onClick={() => { setShowPause(false); handleBack(); }}
                  className="px-8 py-3 rounded-2xl bg-white/20 text-white font-bold text-lg min-w-[200px]"
                >
                  🏠 {t('gameExit', uiLang)}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hit flash overlay */}
        {showHitFlash && (
          <div
            className="absolute inset-0 pointer-events-none z-30 flight-hit-flash"
          />
        )}

        {/* Distance meter */}
        <DistanceMeter distance={distance} total={TOTAL_DISTANCE} />

        {/* Visual timer during word-challenge */}
        {phase === 'word-challenge' && (
          <VisualTimer
            key={timerKey}
            duration={timerDuration}
            active={timerActive}
            onTimeUp={handleTimeUp}
          />
        )}

        {/* Boss overlay */}
        {showBossOverlay && zone && (
          <BossOverlay zone={zone} uiLang={uiLang} onDone={handleBossOverlayDone} />
        )}

        {/* Countdown overlay */}
        {phase === 'countdown' && (
          <Countdown onDone={handleCountdownDone} zone={zone} />
        )}

        {/* Word challenge overlay */}
        {phase === 'word-challenge' && target && (
          <div className={`absolute inset-x-0 top-14 bottom-[15%] z-20 flex flex-col items-center justify-center px-4 ${isBossRound ? 'run-boss-border rounded-3xl mx-2' : ''}`}>
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
      </SpaceViewport>
    </div>
  );
}

export default SpeakliFlightGame;
