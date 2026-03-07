import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { ArrowLeft, Volume2, Star, Zap, Trophy, Coins } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { useSpeech } from '../../contexts/SpeechContext.jsx';
import { playSequence, preloadHebrewAudio, stopAllAudio } from '../../utils/hebrewAudio.js';
import { playCorrect, playWrong, playPop, playTap, playComplete, playStar, playWhoosh } from '../../utils/gameSounds.js';
import { getWordsForLevel, SENTENCES_BY_LEVEL } from '../../data/kids-vocabulary.js';
import { shuffle } from '../../utils/shuffle.js';
import SpeakliAvatar from '../kids/SpeakliAvatar.jsx';
import GameInstructionOverlay from './GameInstructionOverlay.jsx';
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

// ── Race Track Progress ──
function RaceTrack({ round, totalRounds, world }) {
  const progress = round / totalRounds;
  return (
    <div className="absolute bottom-[23%] left-0 right-0 z-[15] px-4 pointer-events-none">
      <div className="relative h-4 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
        {/* Track fill */}
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${Math.max(progress * 100, 3)}%`,
            background: 'linear-gradient(90deg, #22c55e, #3b82f6, #8b5cf6)',
          }}
        />
        {/* Speakli marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-out"
          style={{ left: `calc(${Math.max(progress * 100, 2)}% - 10px)` }}
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
          <span className="text-white/90 font-bold text-sm">{round}/{totalRounds}</span>
        </div>
      </div>
    </>
  );
}

// ── WordBox ──
function WordBox({ word, emoji, translation, showEmoji, showHebrew, onClick, state, index, disabled }) {
  const stateClass =
    state === 'correct' ? 'wordBoxCorrect' :
    state === 'wrong' ? 'wordBoxBreak' : '';

  return (
    <button
      onClick={onClick}
      disabled={disabled || !!state}
      className={`
        relative rounded-2xl font-bold shadow-xl
        active:scale-95 transition-transform
        ${state === 'correct'
          ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white ring-4 ring-green-300/50'
          : state === 'wrong'
          ? 'bg-gradient-to-br from-red-400 to-red-500 text-white'
          : 'bg-white/95 dark:bg-gray-800/95 text-gray-800 dark:text-white hover:bg-white border-2 border-white/50'}
      `}
      style={{
        animation: state
          ? `${stateClass} 0.5s ease-out forwards`
          : `wordBoxSlideIn 0.5s ease-out ${index * 0.08}s both`,
        minWidth: showEmoji ? '130px' : '120px',
        padding: showEmoji ? '10px 16px' : '12px 16px',
        backdropFilter: !state ? 'blur(8px)' : undefined,
      }}
    >
      <div className="flex flex-col items-center gap-0.5">
        {showEmoji && emoji && <span className="text-3xl leading-tight">{emoji}</span>}
        <span className={`font-black ${showEmoji ? 'text-sm' : 'text-base'}`}>{word}</span>
        {showHebrew && translation && (
          <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{translation}</span>
        )}
      </div>
      {state === 'correct' && <SparkleEffect show={true} />}
    </button>
  );
}

// ── RunnerViewport ──
function RunnerViewport({ world, phase, isPowerMode, children }) {
  // During challenges: slow down instead of fully stopping
  const isChallenge = phase === 'word-challenge';
  const isCountdown = phase === 'countdown';

  const farSpeed = isPowerMode ? '8s' : isChallenge ? '30s' : '15s';
  const midSpeed = isPowerMode ? '4s' : isChallenge ? '16s' : '8s';
  const groundSpeed = isPowerMode ? '2s' : isChallenge ? '8s' : '4s';
  const roadSpeed = isPowerMode ? '1s' : isChallenge ? '4s' : '2s';

  const renderLayerContent = (emojis, spacing, fontSize = '2rem') => {
    const items = [...emojis, ...emojis, ...emojis];
    return items.map((e, i) => (
      <span
        key={i}
        className="inline-block"
        style={{ marginLeft: `${spacing}px`, fontSize }}
      >{e}</span>
    ));
  };

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${isPowerMode ? 'runner-power' : ''} ${isCountdown ? 'runner-paused' : ''}`}
      style={{ background: world.skyGradient, minHeight: '100dvh' }}
    >
      {/* Animated clouds */}
      <div className="absolute top-[5%] w-[300%] pointer-events-none"
        style={{ animation: `runnerScroll ${isPowerMode ? '20s' : isChallenge ? '60s' : '40s'} linear infinite`, opacity: 0.4 }}>
        {['☁️', '☁️', '☁️', '☁️', '☁️', '☁️'].map((c, i) => (
          <span key={i} className="inline-block" style={{
            marginLeft: `${80 + i * 30}px`,
            fontSize: i % 2 === 0 ? '3rem' : '2rem',
            marginTop: `${(i * 17) % 40}px`,
          }}>{c}</span>
        ))}
      </div>

      {/* Far BG layer */}
      <div
        className="runner-layer absolute bottom-[28%] w-[300%] flex items-end"
        style={{ animation: `runnerScroll ${farSpeed} linear infinite`, opacity: 0.5 }}
      >
        {renderLayerContent(world.farEmojis, 100, '2.5rem')}
      </div>

      {/* Mid BG layer */}
      <div
        className="runner-layer absolute bottom-[20%] w-[300%] flex items-end"
        style={{ animation: `runnerScroll ${midSpeed} linear infinite`, opacity: 0.75 }}
      >
        {renderLayerContent(world.midEmojis, 70, '2.2rem')}
      </div>

      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-[22%]"
        style={{ background: `linear-gradient(180deg, ${world.groundColor}dd 0%, ${world.groundColor} 30%, ${world.groundColor}cc 100%)` }}>
        <div
          className="runner-layer absolute top-1 w-[300%] flex items-center"
          style={{ animation: `runnerScroll ${groundSpeed} linear infinite` }}
        >
          {renderLayerContent(world.groundEmojis, 55, '1.6rem')}
        </div>

        {/* Road */}
        <div className="absolute bottom-0 left-0 right-0 h-[55%] overflow-hidden"
          style={{ background: `linear-gradient(180deg, ${world.groundColor}99 0%, #374151 20%, #4B5563 50%, #374151 80%, ${world.groundColor}99 100%)` }}>
          <div className="absolute top-[48%] w-[300%] h-[4px] flex items-center gap-0"
            style={{ animation: `runnerScroll ${roadSpeed} linear infinite` }}>
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="shrink-0" style={{
                width: '30px', height: '4px', marginRight: '20px',
                background: 'rgba(255,255,255,0.5)', borderRadius: '2px',
              }} />
            ))}
          </div>
          <div className="absolute top-[15%] left-0 right-0 h-[2px]" style={{ background: 'rgba(255,255,255,0.15)' }} />
          <div className="absolute bottom-[15%] left-0 right-0 h-[2px]" style={{ background: 'rgba(255,255,255,0.15)' }} />
        </div>
      </div>

      {/* Speed lines — only during running */}
      {phase === 'running' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${20 + Math.random() * 40}px`,
                height: '2px',
                background: `rgba(255,255,255,${0.15 + Math.random() * 0.2})`,
                top: `${15 + Math.random() * 55}%`,
                animation: `speedLine ${0.6 + Math.random() * 0.6}s linear infinite`,
                animationDelay: `${i * 0.25}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Dust trail — only during running */}
      {phase === 'running' && (
        <div className="absolute z-[9] pointer-events-none" style={{ left: '8%', bottom: '22%' }}>
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

      {/* Speakli character */}
      <div
        className={`absolute z-10 speakli-run ${isCountdown ? 'runner-paused-char' : isChallenge ? '' : 'runner-leaning'}`}
        style={{ left: '15%', bottom: '22%' }}
      >
        <SpeakliAvatar
          mode={isChallenge ? 'idle' : isCountdown ? 'idle' : 'bounce'}
          size="lg"
          glow={isPowerMode}
        />
      </div>

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

// ── GameOverScreen ──
function RunGameOver({ score, coins, totalRounds, correctCount, xp, onContinue, world, uiLang }) {
  const stars = correctCount >= totalRounds ? 3 : correctCount >= totalRounds * 0.7 ? 2 : correctCount >= 1 ? 1 : 0;

  useEffect(() => {
    playComplete();
  }, []);

  return (
    <div className="kids-bg min-h-screen relative">
      <ConfettiBurst show={true} />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6">
        <div className="mb-3">
          <SpeakliAvatar mode="celebrate" size="xl" />
        </div>

        <h2 className="text-3xl font-black text-gray-800 dark:text-white mb-1">
          {t('raceComplete', uiLang)}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
          {tReplace('raceResultSummary', uiLang, { correctCount, totalRounds })}
        </p>

        <div className="flex gap-2 mb-4">
          {[...Array(3)].map((_, i) => (
            <Star
              key={i}
              size={36}
              className={`${i < stars ? 'text-yellow-400 fill-yellow-400 animate-pop-in' : 'text-gray-300'}`}
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>

        <div className="flex gap-4 mb-4">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl px-5 py-3 shadow-lg text-center">
            <div className="text-2xl mb-1">🪙</div>
            <div className="text-lg font-bold text-yellow-600">{coins}</div>
            <div className="text-xs text-gray-500">{t('coins', uiLang)}</div>
          </div>
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl px-5 py-3 shadow-lg text-center">
            <Star size={24} className="text-yellow-500 mx-auto mb-1" />
            <div className="text-lg font-bold text-gray-800 dark:text-white">{score}</div>
            <div className="text-xs text-gray-500">{t('points', uiLang)}</div>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl px-6 py-3 mb-6 shadow-lg">
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

  const [showInstructions, setShowInstructions] = useState(true);

  // Game state machine: world-select → countdown → running → word-challenge → game-over
  const [phase, setPhase] = useState('world-select');
  const [world, setWorld] = useState(null);

  // Round state
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isPowerMode, setIsPowerMode] = useState(false);

  // Challenge state
  const [target, setTarget] = useState(null);
  const [options, setOptions] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [boxStates, setBoxStates] = useState({});
  const [showCoin, setShowCoin] = useState(false);
  const [showSparkle, setShowSparkle] = useState(false);
  const [avatarMode, setAvatarMode] = useState('idle');
  const [challengeDisabled, setChallengeDisabled] = useState(false);

  // Refs
  const wordPoolRef = useRef([]);
  const roundTimersRef = useRef([]);
  const diff = DIFFICULTY[childLevel] || DIFFICULTY[1];

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
  }, [childLevel, diff.useSentences]);

  // Start a new challenge round
  const startChallenge = useCallback((pool, roundNum) => {
    if (roundNum >= diff.rounds) {
      setPhase('game-over');
      return;
    }

    const targetIdx = roundNum % pool.length;
    const targetWord = pool[targetIdx];

    const others = pool.filter((_, i) => i !== targetIdx);
    const distractors = shuffle(others).slice(0, diff.options - 1);

    const allOptions = shuffle([targetWord, ...distractors]);

    setTarget(targetWord);
    setOptions(allOptions);
    setAttempts(0);
    setBoxStates({});
    setChallengeDisabled(false);
    setShowCoin(false);
    setShowSparkle(false);
    setPhase('word-challenge');

    // Speak the target word immediately (in parallel with popup)
    playSequence([
      { text: targetWord.word, lang: 'en-US', rate: diff.ttsRate },
      { pause: 400 },
      { text: lf(targetWord, 'translation', uiLang), lang: uiLang, rate: 0.85 },
    ], null);
  }, [diff, speak]);

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
    clearRoundTimers();
    pushTimer(setTimeout(() => {
      startChallenge(wordPoolRef.current, 0);
    }, 2500));
  }, [startChallenge]);

  // Handle back button — clean up everything
  const handleBack = useCallback(() => {
    clearRoundTimers();
    stopAllAudio();
    onBack();
  }, [onBack]);

  // Handle word tap
  const handleWordTap = useCallback((tappedWord, index) => {
    if (challengeDisabled) return;
    playTap();

    const isCorrect = tappedWord.word === target.word;

    if (isCorrect) {
      setChallengeDisabled(true);
      playCorrect();
      setBoxStates(prev => ({ ...prev, [index]: 'correct' }));
      setShowSparkle(true);
      setShowCoin(true);
      setAvatarMode('celebrate');

      const newStreak = streak + 1;
      setStreak(newStreak);
      setCorrectCount(c => c + 1);

      const streakBonus = newStreak >= 3 ? 5 * newStreak : 0;
      const roundScore = 10 + streakBonus;
      setScore(s => s + roundScore);

      const coinAmount = (newStreak >= 3 || isPowerMode) ? 2 : 1;
      setCoins(c => c + coinAmount);

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
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= 2) {
        setChallengeDisabled(true);
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
        pushTimer(setTimeout(() => {
          setRound(nextRound);
          setPhase('running');
          pushTimer(setTimeout(() => {
            startChallenge(wordPoolRef.current, nextRound);
          }, 2000 + Math.random() * 1000));
        }, 2000));
      }
    }
  }, [target, streak, isPowerMode, attempts, round, options, diff, speak, startChallenge, challengeDisabled]);

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

  if (showInstructions) {
    return (
      <GameInstructionOverlay
        gameEmoji="🏃"
        title={t('gameSpeakliRunTitle', uiLang)}
        instruction={uiLang === 'he' ? 'רוצו עם ספיקלי! הקשיבו למילה ולחצו על התשובה' : uiLang === 'ar' ? 'اركضوا مع سبيكلي! استمعوا للكلمة واضغطوا على الإجابة' : uiLang === 'ru' ? 'Бегите со Спикли! Слушайте слово и нажимайте на ответ' : 'Run with Speakli! Listen to the word and tap the answer'}
        uiLang={uiLang}
        onStart={() => setShowInstructions(false)}
      />
    );
  }

  if (phase === 'world-select') {
    return <WorldSelector onSelect={handleWorldSelect} onBack={handleBack} childLevel={childLevel} uiLang={uiLang} />;
  }

  // Game over screen
  if (phase === 'game-over') {
    const xp = score * 5 + coins * 2 + 5;
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
      />
    );
  }

  // Main game viewport
  return (
    <div className="h-screen relative overflow-hidden" style={{ touchAction: 'manipulation' }}>
      <RunnerViewport
        world={world}
        phase={phase}
        isPowerMode={isPowerMode}
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

        {/* Race track progress */}
        <RaceTrack round={round} totalRounds={diff.rounds} world={world} />

        {/* Countdown overlay */}
        {phase === 'countdown' && (
          <Countdown onDone={handleCountdownDone} world={world} />
        )}

        {/* Word challenge overlay */}
        {phase === 'word-challenge' && target && (
          <div className="absolute inset-x-0 top-14 bottom-[28%] z-20 flex flex-col items-center justify-center px-4">
            {/* Dim backdrop */}
            <div className="absolute inset-0 bg-black/25 rounded-3xl mx-2" style={{ backdropFilter: 'blur(2px)' }} />

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
