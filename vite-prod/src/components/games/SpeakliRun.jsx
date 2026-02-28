import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { ArrowLeft, Volume2, Star, Zap, Trophy, Coins } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { useSpeech } from '../../contexts/SpeechContext.jsx';
import { playSequence, preloadHebrewAudio, stopAllAudio } from '../../utils/hebrewAudio.js';
import { playCorrect, playWrong, playPop, playTap, playComplete, playStar, playWhoosh } from '../../utils/gameSounds.js';
import { getWordsForLevel, SENTENCES_BY_LEVEL } from '../../data/kids-vocabulary.js';
import { shuffle } from '../../utils/shuffle.js';
import SpeakliAvatar from '../kids/SpeakliAvatar.jsx';

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
    skyGradient: 'linear-gradient(180deg, #22c55e 0%, #059669 50%, #047857 100%)',
    groundColor: '#92400e',
    groundEmojis: ['🌿', '🍃', '🌺', '🪨', '🍄'],
    farEmojis: ['🏔️', '🌋', '🌴', '🌴', '🏔️', '🌴'],
    midEmojis: ['🦒', '🐘', '🌳', '🦜', '🌿', '🐒', '🌳', '🦁'],
    categories: ['animals', 'nature'],
    filterWords: w => /cat|dog|fish|bird|lion|elephant|monkey|bear|rabbit|frog|snake|horse|cow|sheep|duck|tiger/i.test(w.word) || true,
  },
  {
    id: 'food',
    emoji: '🍕',
    nameHe: 'עיר האוכל',
    nameEn: 'Food City',
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
  1: { options: 3, showEmoji: true,  showHebrew: true,  rounds: 6,  ttsRate: 0.65, useSentences: false },
  2: { options: 3, showEmoji: true,  showHebrew: false, rounds: 8,  ttsRate: 0.7,  useSentences: false },
  3: { options: 4, showEmoji: false, showHebrew: false, rounds: 8,  ttsRate: 0.8,  useSentences: false },
  4: { options: 4, showEmoji: false, showHebrew: false, rounds: 10, ttsRate: 0.85, useSentences: true  },
};

// ── ConfettiBurst (same pattern as NewGames) ──
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
function WorldSelector({ onSelect, childLevel, uiLang }) {
  const availableWorlds = WORLDS.filter(w => !w.minLevel || childLevel >= w.minLevel);

  return (
    <div className="kids-bg min-h-screen relative flex flex-col">
      <div className="relative z-10 flex flex-col items-center px-4 pt-6 pb-4 flex-1">
        <div className="mb-4">
          <SpeakliAvatar mode="bounce" size="lg" />
        </div>
        <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-1 text-center">
          {uiLang === 'he' ? '🏃 מרוץ המילים' : '🏃 Speakli Run'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">
          {uiLang === 'he' ? 'בחרו עולם ורוצו!' : 'Pick a world and run!'}
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
                {uiLang === 'he' ? world.nameHe : world.nameEn}
              </span>
            </button>
          ))}
        </div>

        {WORLDS.some(w => w.minLevel && childLevel < w.minLevel) && (
          <p className="text-xs text-gray-400 mt-4 text-center">
            {uiLang === 'he' ? '🚀 עולמות נוספים נפתחים ברמות גבוהות!' : '🚀 More worlds unlock at higher levels!'}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Countdown overlay ──
function Countdown({ onDone }) {
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
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/30">
      <div
        key={count}
        className="text-8xl font-black text-white drop-shadow-lg"
        style={{ animation: 'countdownPop 0.6s ease-out' }}
      >
        {count === 0 ? '!Go' : count}
      </div>
    </div>
  );
}

// ── RunHUD ──
function RunHUD({ score, coins, streak, round, totalRounds, onBack, isPowerMode, uiLang }) {
  return (
    <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3 py-2">
      <button
        onClick={onBack}
        className="text-white/80 hover:text-white bg-black/20 rounded-full p-2 backdrop-blur-sm active:scale-90 transition-transform"
      >
        <ArrowLeft size={18} className={uiLang === 'he' ? 'rotate-180' : ''} />
      </button>

      <div className="flex items-center gap-3">
        <div className="bg-black/20 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5">
          <span className="text-yellow-300 text-sm">🪙</span>
          <span className="text-white font-bold text-sm">{coins}</span>
        </div>
        <div className="bg-black/20 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5">
          <Star size={14} className="text-yellow-300 fill-yellow-300" />
          <span className="text-white font-bold text-sm">{score}</span>
        </div>
        {streak >= 2 && (
          <div className="bg-orange-500/80 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 animate-pulse">
            <Zap size={12} className="text-yellow-200" />
            <span className="text-white font-bold text-xs">{streak}x</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="bg-black/20 backdrop-blur-sm rounded-full h-2 w-16 overflow-hidden">
        <div
          className="h-full bg-white/80 rounded-full transition-all duration-500"
          style={{ width: `${(round / totalRounds) * 100}%` }}
        />
      </div>
    </div>
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
        relative px-4 py-3 rounded-2xl font-bold text-lg shadow-lg
        active:scale-95 transition-transform
        ${state === 'correct' ? 'bg-green-400 text-white ring-4 ring-green-300' :
          state === 'wrong' ? 'bg-red-400 text-white' :
          'bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-white hover:bg-white'}
        ${!state ? 'backdrop-blur-sm' : ''}
      `}
      style={{
        animation: state
          ? `${stateClass} 0.5s ease-out forwards`
          : `wordBoxSlideIn 0.5s ease-out ${index * 0.1}s both`,
        minWidth: '120px',
      }}
    >
      <div className="flex flex-col items-center gap-1">
        {showEmoji && emoji && <span className="text-2xl">{emoji}</span>}
        <span className="text-base font-black">{word}</span>
        {showHebrew && translation && (
          <span className="text-xs text-gray-500 dark:text-gray-400">{translation}</span>
        )}
      </div>
      {state === 'correct' && <SparkleEffect show={true} />}
    </button>
  );
}

// ── RunnerViewport ──
function RunnerViewport({ world, isPaused, isPowerMode, children }) {
  const skySpeed = isPowerMode ? '15s' : '30s';
  const farSpeed = isPowerMode ? '8s' : '15s';
  const midSpeed = isPowerMode ? '4s' : '8s';
  const groundSpeed = isPowerMode ? '2s' : '4s';

  const renderLayerContent = (emojis, spacing) => {
    // Duplicate content for seamless loop
    const items = [...emojis, ...emojis];
    return items.map((e, i) => (
      <span
        key={i}
        className="inline-block"
        style={{ marginLeft: `${spacing}px`, fontSize: '2rem' }}
      >{e}</span>
    ));
  };

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${isPowerMode ? 'runner-power' : ''} ${isPaused ? 'runner-paused' : ''}`}
      style={{ background: world.skyGradient }}
    >
      {/* Far BG layer */}
      <div
        className="runner-layer absolute bottom-[30%] w-[200%] flex items-end"
        style={{ animation: `runnerScroll ${farSpeed} linear infinite`, opacity: 0.5 }}
      >
        {renderLayerContent(world.farEmojis, 80)}
      </div>

      {/* Mid BG layer */}
      <div
        className="runner-layer absolute bottom-[20%] w-[200%] flex items-end"
        style={{ animation: `runnerScroll ${midSpeed} linear infinite`, opacity: 0.7 }}
      >
        {renderLayerContent(world.midEmojis, 60)}
      </div>

      {/* Ground layer */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[20%]"
        style={{ backgroundColor: world.groundColor }}
      >
        <div
          className="runner-layer absolute top-1 w-[200%] flex items-center"
          style={{ animation: `runnerScroll ${groundSpeed} linear infinite` }}
        >
          {renderLayerContent(world.groundEmojis, 50)}
        </div>
      </div>

      {/* Speed lines */}
      {!isPaused && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-0.5 bg-white/30 rounded"
              style={{
                width: `${20 + Math.random() * 30}px`,
                top: `${20 + Math.random() * 50}%`,
                animation: `speedLine ${0.8 + Math.random() * 0.5}s linear infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Speakli character */}
      <div
        className={`absolute z-10 speakli-run ${isPaused ? 'runner-paused-char' : ''}`}
        style={{ left: '15%', bottom: '22%' }}
      >
        <SpeakliAvatar
          mode={isPaused ? 'idle' : 'bounce'}
          size="lg"
          glow={isPowerMode}
        />
      </div>

      {/* Children overlay (HUD, word boxes, countdown) */}
      {children}
    </div>
  );
}

// ── GameOverScreen (runner-themed) ──
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
          {uiLang === 'he' ? '🏁 סיום המרוץ!' : '🏁 Race Complete!'}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
          {uiLang === 'he'
            ? `ענית נכון על ${correctCount} מתוך ${totalRounds} מילים!`
            : `You got ${correctCount} out of ${totalRounds} words!`}
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
            <div className="text-xs text-gray-500">{uiLang === 'he' ? 'מטבעות' : 'Coins'}</div>
          </div>
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl px-5 py-3 shadow-lg text-center">
            <Star size={24} className="text-yellow-500 mx-auto mb-1" />
            <div className="text-lg font-bold text-gray-800 dark:text-white">{score}</div>
            <div className="text-xs text-gray-500">{uiLang === 'he' ? 'נקודות' : 'Score'}</div>
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
          {uiLang === 'he' ? 'המשך' : 'Continue'} ✨
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
  const roundTimerRef = useRef(null);
  const diff = DIFFICULTY[childLevel] || DIFFICULTY[1];

  // Preload Hebrew audio + cleanup
  useEffect(() => {
    preloadHebrewAudio(RUN_PHRASES);
    return () => { stopAllAudio(); clearTimeout(roundTimerRef.current); };
  }, []);

  // Build word pool when world is selected
  const buildWordPool = useCallback((selectedWorld) => {
    if (selectedWorld.sentencesOnly && diff.useSentences && SENTENCES_BY_LEVEL[childLevel]) {
      // Space world at level 3+: use sentences
      const sentences = SENTENCES_BY_LEVEL[childLevel] || SENTENCES_BY_LEVEL[3];
      return shuffle(sentences).map(s => ({
        word: s.sentence,
        emoji: s.emoji,
        translation: s.translationHe,
      }));
    }
    // Regular words
    const allWords = getWordsForLevel(childLevel);
    return shuffle(allWords);
  }, [childLevel, diff.useSentences]);

  // Start a new challenge round
  const startChallenge = useCallback((pool, roundNum) => {
    if (roundNum >= diff.rounds) {
      setPhase('game-over');
      return;
    }

    // Pick target word
    const targetIdx = roundNum % pool.length;
    const targetWord = pool[targetIdx];

    // Pick distractors from pool (excluding target)
    const others = pool.filter((_, i) => i !== targetIdx);
    const distractors = shuffle(others).slice(0, diff.options - 1);

    // Build options and shuffle
    const allOptions = shuffle([targetWord, ...distractors]);

    setTarget(targetWord);
    setOptions(allOptions);
    setAttempts(0);
    setBoxStates({});
    setChallengeDisabled(false);
    setShowCoin(false);
    setShowSparkle(false);
    setPhase('word-challenge');

    // Speak the target word after a brief delay
    setTimeout(() => {
      speak(targetWord.word, { rate: diff.ttsRate });
    }, 600);
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
    // After 2-3s of running, show first challenge
    roundTimerRef.current = setTimeout(() => {
      startChallenge(wordPoolRef.current, 0);
    }, 2500);
  }, [startChallenge]);

  // Handle word tap
  const handleWordTap = useCallback((tappedWord, index) => {
    if (challengeDisabled) return;
    playTap();

    const isCorrect = tappedWord.word === target.word;

    if (isCorrect) {
      // Correct answer
      setChallengeDisabled(true);
      playCorrect();
      setBoxStates(prev => ({ ...prev, [index]: 'correct' }));
      setShowSparkle(true);
      setShowCoin(true);
      setAvatarMode('celebrate');

      const newStreak = streak + 1;
      setStreak(newStreak);
      setCorrectCount(c => c + 1);

      // Score
      const streakBonus = newStreak >= 3 ? 5 * newStreak : 0;
      const roundScore = 10 + streakBonus;
      setScore(s => s + roundScore);

      // Coins
      const coinAmount = (newStreak >= 3 || isPowerMode) ? 2 : 1;
      setCoins(c => c + coinAmount);

      // Power mode at 3-streak
      if (newStreak >= 3 && !isPowerMode) {
        setIsPowerMode(true);
        playWhoosh();
      }

      // Hebrew praise
      const praises = ['יוֹפִי!', 'נָכוֹן!', 'מְצוּיָּן!', 'כׇּל הַכָּבוֹד!', 'מַדְהִים!'];
      const praise = praises[Math.floor(Math.random() * praises.length)];
      setTimeout(() => {
        playSequence([{ text: praise, lang: 'he' }], null);
      }, 300);

      // Next round after delay
      const nextRound = round + 1;
      roundTimerRef.current = setTimeout(() => {
        setAvatarMode('idle');
        setShowSparkle(false);
        setShowCoin(false);
        setRound(nextRound);
        setPhase('running');

        // Run for 2-3s then next challenge
        roundTimerRef.current = setTimeout(() => {
          startChallenge(wordPoolRef.current, nextRound);
        }, 2000 + Math.random() * 1000);
      }, 1500);

    } else {
      // Wrong answer
      playWrong();
      setBoxStates(prev => ({ ...prev, [index]: 'wrong' }));
      setStreak(0);
      setIsPowerMode(false);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= 2) {
        // Auto-reveal correct answer after 2 wrong attempts
        setChallengeDisabled(true);
        const correctIdx = options.findIndex(o => o.word === target.word);
        setTimeout(() => {
          setBoxStates(prev => ({ ...prev, [correctIdx]: 'correct' }));
          speak(target.word, { rate: diff.ttsRate });
        }, 500);

        // Move on after showing correct
        const nextRound = round + 1;
        roundTimerRef.current = setTimeout(() => {
          setRound(nextRound);
          setPhase('running');
          roundTimerRef.current = setTimeout(() => {
            startChallenge(wordPoolRef.current, nextRound);
          }, 2000 + Math.random() * 1000);
        }, 2000);
      }
    }
  }, [target, streak, isPowerMode, attempts, round, options, diff, speak, startChallenge, challengeDisabled]);

  // Re-speak target word
  const handleReplay = useCallback(() => {
    if (target) {
      speak(target.word, { rate: diff.ttsRate });
    }
  }, [target, speak, diff.ttsRate]);

  // ── RENDER ──

  // World selection screen
  if (phase === 'world-select') {
    return <WorldSelector onSelect={handleWorldSelect} childLevel={childLevel} uiLang={uiLang} />;
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

  // Main game viewport (countdown, running, word-challenge)
  const isPaused = phase === 'word-challenge' || phase === 'countdown';

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ touchAction: 'manipulation' }}>
      <RunnerViewport
        world={world}
        isPaused={isPaused}
        isPowerMode={isPowerMode}
      >
        {/* HUD */}
        <RunHUD
          score={score}
          coins={coins}
          streak={streak}
          round={round}
          totalRounds={diff.rounds}
          onBack={onBack}
          isPowerMode={isPowerMode}
          uiLang={uiLang}
        />

        {/* Countdown overlay */}
        {phase === 'countdown' && (
          <Countdown onDone={handleCountdownDone} />
        )}

        {/* Word challenge overlay */}
        {phase === 'word-challenge' && target && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
            {/* Replay button */}
            <button
              onClick={handleReplay}
              className="mb-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full p-3 shadow-lg active:scale-90 transition-transform animate-pulse"
            >
              <Volume2 size={28} className="text-blue-500" />
            </button>

            {/* Instruction text */}
            <p className="text-white font-bold text-sm drop-shadow mb-3 text-center px-4">
              {uiLang === 'he' ? 'הקשיבו ולחצו על המילה הנכונה!' : 'Listen and tap the right word!'}
            </p>

            {/* Word boxes */}
            <div className="flex flex-wrap gap-3 justify-center px-4 max-w-sm">
              {options.map((opt, i) => (
                <WordBox
                  key={`${round}-${i}`}
                  word={opt.word}
                  emoji={opt.emoji}
                  translation={opt.translation}
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
        )}
      </RunnerViewport>
    </div>
  );
}

export default SpeakliRunGame;
