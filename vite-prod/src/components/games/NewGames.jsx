import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { ArrowLeft, Volume2, Star, Zap, RotateCcw, Check } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { useUserProgress } from '../../contexts/UserProgressContext.jsx';
import { useSpeech } from '../../contexts/SpeechContext.jsx';
import { playSequence, playHebrew, preloadHebrewAudio, stopAllAudio } from '../../utils/hebrewAudio.js';
import { playCorrect, playWrong, playPop, playTap, playComplete, playStar, playSplash } from '../../utils/gameSounds.js';
import { getWordsForLevel, SENTENCES_BY_LEVEL, CATEGORIES_BY_LEVEL } from '../../data/kids-vocabulary.js';
import { shuffle } from '../../utils/shuffle.js';
import { t, tReplace, lf, RTL_LANGS } from '../../utils/translations.js';
import GameInstructionOverlay from './GameInstructionOverlay.jsx';

// Hebrew instruction phrases for new games — preloaded on mount
const NEW_GAME_PHRASES = [
  'הַקְשִׁיבוּ לַמִּלָּה וּמִצְאוּ אֶת הַתְּמוּנָה הַנְּכוֹנָה',
  'מַיְּנוּ אֶת הַפְּרִיטִים לַקָּטֵגוֹרְיָה הַנְּכוֹנָה!',
  'מִצְאוּ אֶת הָאוֹת שֶׁחֲסֵרָה בַּמִּלָּה!',
  'סַדְּרוּ אֶת הַמִּלִּים לְמִשְׁפָּט נָכוֹן!',
  'יוֹפִי!', 'נָכוֹן!', 'מְצוּיָּן!', 'כׇּל הַכָּבוֹד!', 'מַדְהִים!', 'נַסּוּ שׁוּב',
];

// Game instruction strings by language
const GAME_INSTRUCTIONS = {
  listenPop: {
    he: 'הקשיבו למילה ומצאו את התמונה הנכונה',
    ar: 'استمعوا إلى الكلمة وابحثوا عن الصورة الصحيحة',
    ru: 'Слушайте слово и найдите правильную картинку',
    en: 'Listen to the word and find the correct picture',
  },
  categorySort: {
    he: 'מיינו את הפריטים לקטגוריה הנכונה!',
    ar: 'صنّفوا العناصر في الفئة الصحيحة!',
    ru: 'Распределите предметы по правильной категории!',
    en: 'Sort the items into the correct category!',
  },
  missingLetter: {
    he: 'מצאו את האות שחסרה במילה!',
    ar: 'ابحثوا عن الحرف المفقود في الكلمة!',
    ru: 'Найдите пропущенную букву в слове!',
    en: 'Find the missing letter in the word!',
  },
  sentenceBuilder: {
    he: 'סדרו את המילים למשפט נכון!',
    ar: 'رتّبوا الكلمات لتكوين جملة صحيحة!',
    ru: 'Расставьте слова в правильном порядке!',
    en: 'Arrange the words into a correct sentence!',
  },
};

// Helper to get instruction text for current lang
const getInstruction = (key, lang) => GAME_INSTRUCTIONS[key]?.[lang] || GAME_INSTRUCTIONS[key]?.en || '';

/* ── Shared components ── */
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

function FloatingDecorations() {
  const items = ['⭐', '🌈', '🎈', '🦋', '🌸', '✨', '🎵', '💫'];
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {items.map((e, i) => (
        <div
          key={i}
          className="absolute animate-float text-2xl opacity-20"
          style={{
            left: `${10 + (i * 12) % 90}%`,
            top: `${5 + (i * 17) % 85}%`,
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${3 + i * 0.5}s`,
          }}
        >
          {e}
        </div>
      ))}
    </div>
  );
}

function GameOverScreen({ emoji, title, subtitle, score, total, xp, onContinue, gradient, uiLang }) {
  return (
    <div className="kids-bg min-h-screen relative">
      <FloatingDecorations />
      <ConfettiBurst show={true} />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6">
        <div className="text-7xl mb-4 animate-jelly">{emoji}</div>
        <h2 className="text-4xl font-black rainbow-text py-2 mb-2">{title}</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-2 font-medium">{subtitle}</p>
        <div className="flex gap-2 mb-6">
          {[...Array(total)].map((_, i) => (
            <Star key={i} size={32} className={`${i < score ? 'text-yellow-400 fill-yellow-400 animate-pop-in' : 'text-gray-300'}`} style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl px-6 py-3 mb-6 shadow-lg">
          <div className="flex items-center gap-2">
            <Zap size={20} className="text-yellow-500" />
            <span className="text-lg font-bold text-yellow-600">+{xp} XP</span>
          </div>
        </div>
        <button onClick={onContinue}
          className={`btn-3d px-10 py-4 rounded-2xl font-black text-white text-xl shadow-2xl bg-gradient-to-r ${gradient} box-shadow-none`}
          style={{ boxShadow: 'none' }}
        >
          {t('continue', uiLang)} ✨
        </button>
      </div>
    </div>
  );
}

function GameHeader({ onBack, title, emoji, right, uiLang }) {
  return (
    <div className="flex items-center justify-between px-3 pt-2 pb-1 shrink-0">
      <button onClick={onBack} className="text-gray-400 hover:text-gray-600 bg-white/50 dark:bg-gray-800/50 rounded-full p-2 backdrop-blur-sm active:scale-90 transition-transform">
        <ArrowLeft size={18} className={RTL_LANGS.includes(uiLang) ? 'rotate-180' : ''} />
      </button>
      <div className="text-center">
        <h2 className="text-base font-black text-gray-800 dark:text-white flex items-center gap-1.5">
          <span className="animate-wiggle inline-block">{emoji}</span>
          {title}
        </h2>
      </div>
      {right || <div className="w-9" />}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   GAME: LISTEN & POP
   A word is spoken, bubbles float with images.
   Child pops the bubble matching what they heard.
   ══════════════════════════════════════════════════════ */

const LISTEN_POP_WORDS = [
  { word: 'apple', emoji: '🍎', translation: 'תַּפּוּחַ', translationAr: 'تفاحة', translationRu: 'яблоко' },
  { word: 'banana', emoji: '🍌', translation: 'בָּנָנָה', translationAr: 'موزة', translationRu: 'банан' },
  { word: 'cat', emoji: '🐱', translation: 'חָתוּל', translationAr: 'قطة', translationRu: 'кошка' },
  { word: 'dog', emoji: '🐶', translation: 'כֶּלֶב', translationAr: 'كلب', translationRu: 'собака' },
  { word: 'fish', emoji: '🐟', translation: 'דָּג', translationAr: 'سمكة', translationRu: 'рыба' },
  { word: 'sun', emoji: '☀️', translation: 'שֶׁמֶשׁ', translationAr: 'شمس', translationRu: 'солнце' },
  { word: 'moon', emoji: '🌙', translation: 'יָרֵחַ', translationAr: 'قمر', translationRu: 'луна' },
  { word: 'star', emoji: '⭐', translation: 'כּוֹכָב', translationAr: 'نجمة', translationRu: 'звезда' },
  { word: 'bird', emoji: '🐦', translation: 'צִפּוֹר', translationAr: 'طائر', translationRu: 'птица' },
  { word: 'tree', emoji: '🌳', translation: 'עֵץ', translationAr: 'شجرة', translationRu: 'дерево' },
  { word: 'cake', emoji: '🎂', translation: 'עוּגָה', translationAr: 'كعكة', translationRu: 'торт' },
  { word: 'ball', emoji: '⚽', translation: 'כַּדּוּר', translationAr: 'كرة', translationRu: 'мяч' },
  { word: 'car', emoji: '🚗', translation: 'מְכוֹנִית', translationAr: 'سيارة', translationRu: 'машина' },
  { word: 'house', emoji: '🏠', translation: 'בַּיִת', translationAr: 'بيت', translationRu: 'дом' },
  { word: 'flower', emoji: '🌸', translation: 'פֶּרַח', translationAr: 'زهرة', translationRu: 'цветок' },
  { word: 'heart', emoji: '❤️', translation: 'לֵב', translationAr: 'قلب', translationRu: 'сердце' },
  { word: 'book', emoji: '📖', translation: 'סֵפֶר', translationAr: 'كتاب', translationRu: 'книга' },
  { word: 'rain', emoji: '🌧️', translation: 'גֶּשֶׁם', translationAr: 'مطر', translationRu: 'дождь' },
];

export function ListenPopGame({ onComplete, onBack, childLevel = 1 }) {
  const { uiLang } = useTheme();
  const { speak } = useSpeech();
  const { recordWordPractice } = useUserProgress();
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState([]);
  const [target, setTarget] = useState(null);
  const [popped, setPopped] = useState(null);
  const [wrongId, setWrongId] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const speakRef = useRef(speak);
  speakRef.current = speak;
  const instructionsGiven = useRef(false);
  const gameTimersRef = useRef([]);
  const correctWordsRef = useRef([]);

  const TOTAL_ROUNDS = 6;
  // Options count by level: 1→4, 2→6, 3→6, 4→8
  const NUM_OPTIONS = childLevel === 1 ? 4 : childLevel <= 3 ? 6 : 8;

  // Preload Hebrew instruction phrases on mount
  useEffect(() => {
    preloadHebrewAudio(NEW_GAME_PHRASES);
  }, []);

  // Use level-based vocabulary (with fallback to built-in words)
  const levelWords = useMemo(() => {
    const lvlWords = getWordsForLevel(childLevel);
    // Only use words that have emojis
    return lvlWords.length >= TOTAL_ROUNDS ? lvlWords : LISTEN_POP_WORDS;
  }, [childLevel]);

  const words = useMemo(() => {
    return shuffle(levelWords).slice(0, TOTAL_ROUNDS);
  }, [levelWords]);

  // Stop all audio + clear timers on unmount
  useEffect(() => {
    return () => { stopAllAudio(); gameTimersRef.current.forEach(clearTimeout); };
  }, []);

  useEffect(() => {
    if (showInstructions) return;
    if (round >= TOTAL_ROUNDS) {
      setGameOver(true);
      setShowConfetti(true);
      playComplete();
      if (correctWordsRef.current.length > 0) recordWordPractice(correctWordsRef.current);
      return;
    }
    const tgt = words[round];
    setTarget(tgt);
    setPopped(null);
    setWrongId(null);

    // Create options: 1 correct + (NUM_OPTIONS-1) wrong
    const others = shuffle(levelWords.filter(w => w.word !== tgt.word))
      .slice(0, NUM_OPTIONS - 1);

    const all = shuffle([tgt, ...others]).map((w, i) => ({
      id: i, ...w, isTarget: w.word === tgt.word,
    }));
    setOptions(all);

    // Voice instructions on first round, then just the word
    if (round === 0 && !instructionsGiven.current) {
      instructionsGiven.current = true;
      const t = setTimeout(() => {
        playSequence([
          { text: getInstruction('listenPop', uiLang), lang: uiLang },
          { pause: 300 },
          { text: tgt.word, lang: 'en-US', rate: 0.6 },
          { pause: 400 },
          { text: lf(tgt, 'translation', uiLang), lang: uiLang, rate: 0.85 },
        ], speakRef.current);
      }, 500);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        playSequence([
          { text: tgt.word, lang: 'en-US', rate: 0.6 },
          { pause: 400 },
          { text: lf(tgt, 'translation', uiLang), lang: uiLang, rate: 0.85 },
        ], speakRef.current);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [round, words, showInstructions]);

  const poppingRef = useRef(false);
  const handlePop = (opt) => {
    if (popped !== null || poppingRef.current) return;

    if (opt.isTarget) {
      poppingRef.current = true;
      setPopped(opt.id);
      setScore(s => s + 1);
      correctWordsRef.current.push(opt.word);
      playCorrect();
      gameTimersRef.current.push(setTimeout(() => {
        playSequence([
          { text: opt.word, lang: 'en-US', rate: 0.6 },
          { pause: 300 },
          { text: lf(opt, 'translation', uiLang), lang: uiLang, rate: 0.85 },
        ], speak);
      }, 400));
      gameTimersRef.current.push(setTimeout(() => {
        setRound(r => r + 1);
        poppingRef.current = false;
      }, 1200));
    } else {
      setWrongId(opt.id);
      playWrong();
      gameTimersRef.current.push(setTimeout(() => setWrongId(null), 500));
    }
  };

  const replayWord = () => {
    if (target) playSequence([
      { text: target.word, lang: 'en-US', rate: 0.6 },
      { pause: 400 },
      { text: lf(target, 'translation', uiLang), lang: uiLang, rate: 0.85 },
    ], speak);
  };

  if (gameOver) {
    const xp = score * 4 + 5;
    return (
      <GameOverScreen
        emoji="🎧" title={t('greatListening', uiLang)}
        subtitle={tReplace('identifiedWords', uiLang, { count: score })}
        score={score} total={TOTAL_ROUNDS} xp={xp}
        onContinue={() => onComplete(xp)}
        gradient="from-cyan-400 to-blue-500" uiLang={uiLang}
      />
    );
  }

  return (
    <div className="kids-bg min-h-screen relative">
      <FloatingDecorations />
      {showInstructions && (
        <GameInstructionOverlay
          gameEmoji="🎧"
          title={t('gameListenPopTitle', uiLang)}
          instruction={getInstruction('listenPop', uiLang)}
          uiLang={uiLang}
          onStart={() => setShowInstructions(false)}
        />
      )}
      <div className="relative z-10">
        <GameHeader onBack={onBack} emoji="🎧"
          title={t('listenAndPop', uiLang)}
          right={
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                {round + 1}/{TOTAL_ROUNDS}
              </span>
            </div>
          }
        />

        {/* Progress */}
        <div className="flex justify-center gap-1.5 mb-3 px-4">
          {[...Array(TOTAL_ROUNDS)].map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all ${
              i < round ? 'w-2 bg-cyan-400' : i === round ? 'w-6 bg-gradient-to-r from-cyan-400 to-blue-500' : 'w-2 bg-gray-300 dark:bg-gray-600'
            }`} />
          ))}
        </div>

        {/* Listen button */}
        <div className="text-center mb-6 px-4">
          <button
            onClick={replayWord}
            className="inline-flex items-center gap-3 btn-3d-blue rounded-2xl px-8 py-4 text-lg animate-glow-pulse"
          >
            <Volume2 size={24} />
            {t('listenAgain', uiLang)}
          </button>
        </div>

        {/* Emoji grid */}
        <div className={`grid ${NUM_OPTIONS <= 4 ? 'grid-cols-2' : 'grid-cols-3'} gap-3 px-4`}>
          {options.map(opt => {
            const isPopped = popped === opt.id;
            const isWrong = wrongId === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handlePop(opt)}
                disabled={popped !== null && !opt.isTarget}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${
                  isPopped
                    ? 'bg-emerald-100 dark:bg-emerald-900/40 border-3 border-emerald-400 scale-105 animate-spring'
                    : isWrong
                      ? 'bg-red-100 dark:bg-red-900/40 border-3 border-red-400 animate-shake'
                      : 'bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 shadow-lg hover:scale-105 active:scale-95'
                }`}
                style={{ boxShadow: !isPopped && !isWrong ? '0 4px 0 rgba(0,0,0,0.08)' : 'none' }}
              >
                <span className="text-4xl sm:text-5xl mb-1">{opt.emoji}</span>
                {isPopped && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-pop-in">{opt.word}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   GAME: CATEGORY SORT
   Items appear and child taps to sort into 2-3 buckets
   ══════════════════════════════════════════════════════ */

const CATEGORY_SETS = [
  {
    categories: [
      { name: 'Animals', nameHe: 'חיות', nameAr: 'حيوانات', nameRu: 'Животные', emoji: '🐾', color: 'from-amber-400 to-orange-500' },
      { name: 'Food', nameHe: 'אוכל', nameAr: 'طعام', nameRu: 'Еда', emoji: '🍽️', color: 'from-green-400 to-emerald-500' },
    ],
    items: [
      { word: 'cat', emoji: '🐱', translation: 'חָתוּל', translationAr: 'قطة', translationRu: 'кошка', category: 0 },
      { word: 'dog', emoji: '🐶', translation: 'כֶּלֶב', translationAr: 'كلب', translationRu: 'собака', category: 0 },
      { word: 'fish', emoji: '🐟', translation: 'דָּג', translationAr: 'سمكة', translationRu: 'рыба', category: 0 },
      { word: 'bird', emoji: '🐦', translation: 'צִפּוֹר', translationAr: 'طائر', translationRu: 'птица', category: 0 },
      { word: 'apple', emoji: '🍎', translation: 'תַּפּוּחַ', translationAr: 'تفاحة', translationRu: 'яблоко', category: 1 },
      { word: 'cake', emoji: '🎂', translation: 'עוּגָה', translationAr: 'كعكة', translationRu: 'торт', category: 1 },
      { word: 'banana', emoji: '🍌', translation: 'בָּנָנָה', translationAr: 'موزة', translationRu: 'банан', category: 1 },
      { word: 'milk', emoji: '🥛', translation: 'חָלָב', translationAr: 'حليب', translationRu: 'молоко', category: 1 },
    ],
  },
  {
    categories: [
      { name: 'Nature', nameHe: 'טבע', nameAr: 'طبيعة', nameRu: 'Природа', emoji: '🌿', color: 'from-green-400 to-teal-500' },
      { name: 'Things', nameHe: 'דברים', nameAr: 'أشياء', nameRu: 'Вещи', emoji: '📦', color: 'from-blue-400 to-indigo-500' },
    ],
    items: [
      { word: 'sun', emoji: '☀️', translation: 'שֶׁמֶשׁ', translationAr: 'شمس', translationRu: 'солнце', category: 0 },
      { word: 'moon', emoji: '🌙', translation: 'יָרֵחַ', translationAr: 'قمر', translationRu: 'луна', category: 0 },
      { word: 'tree', emoji: '🌳', translation: 'עֵץ', translationAr: 'شجرة', translationRu: 'дерево', category: 0 },
      { word: 'flower', emoji: '🌸', translation: 'פֶּרַח', translationAr: 'زهرة', translationRu: 'цветок', category: 0 },
      { word: 'book', emoji: '📖', translation: 'סֵפֶר', translationAr: 'كتاب', translationRu: 'книга', category: 1 },
      { word: 'ball', emoji: '⚽', translation: 'כַּדּוּר', translationAr: 'كرة', translationRu: 'мяч', category: 1 },
      { word: 'car', emoji: '🚗', translation: 'מְכוֹנִית', translationAr: 'سيارة', translationRu: 'машина', category: 1 },
      { word: 'house', emoji: '🏠', translation: 'בַּיִת', translationAr: 'بيت', translationRu: 'дом', category: 1 },
    ],
  },
  {
    categories: [
      { name: 'Big', nameHe: 'גדולים', nameAr: 'كبيرة', nameRu: 'Большие', emoji: '🐘', color: 'from-purple-400 to-violet-500' },
      { name: 'Small', nameHe: 'קטנים', nameAr: 'صغيرة', nameRu: 'Маленькие', emoji: '🐁', color: 'from-pink-400 to-rose-500' },
    ],
    items: [
      { word: 'elephant', emoji: '🐘', translation: 'פִּיל', translationAr: 'فيل', translationRu: 'слон', category: 0 },
      { word: 'whale', emoji: '🐋', translation: 'לִוְיָתָן', translationAr: 'حوت', translationRu: 'кит', category: 0 },
      { word: 'horse', emoji: '🐎', translation: 'סוּס', translationAr: 'حصان', translationRu: 'лошадь', category: 0 },
      { word: 'bear', emoji: '🐻', translation: 'דֹּב', translationAr: 'دب', translationRu: 'медведь', category: 0 },
      { word: 'mouse', emoji: '🐭', translation: 'עַכְבָּר', translationAr: 'فأر', translationRu: 'мышь', category: 1 },
      { word: 'ant', emoji: '🐜', translation: 'נְמָלָה', translationAr: 'نملة', translationRu: 'муравей', category: 1 },
      { word: 'bee', emoji: '🐝', translation: 'דְּבוֹרָה', translationAr: 'نحلة', translationRu: 'пчела', category: 1 },
      { word: 'butterfly', emoji: '🦋', translation: 'פַּרְפַּר', translationAr: 'فراشة', translationRu: 'бабочка', category: 1 },
    ],
  },
];

export function CategorySortGame({ onComplete, onBack, childLevel = 1 }) {
  const { uiLang } = useTheme();
  const { speak } = useSpeech();
  const [setIndex, setSetIndex] = useState(0);
  const [currentItem, setCurrentItem] = useState(0);
  const [sorted, setSorted] = useState([]);
  const [correct, setCorrect] = useState(0);
  const [lastResult, setLastResult] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const sortTimersRef = useRef([]);

  // Sets by level: 1-2→1 set, 3-4→2 sets
  const TOTAL_SETS = childLevel >= 3 ? 2 : 1;
  const speakRef = useRef(speak);
  speakRef.current = speak;
  const instructionsGiven = useRef(false);

  // Preload Hebrew instruction phrases on mount
  useEffect(() => {
    preloadHebrewAudio(NEW_GAME_PHRASES);
  }, []);

  // Stop all audio + clear timers on unmount
  useEffect(() => {
    return () => { stopAllAudio(); sortTimersRef.current.forEach(clearTimeout); };
  }, []);

  // Use level-specific categories
  const sets = useMemo(() => {
    const lvlCategories = CATEGORIES_BY_LEVEL[childLevel] || CATEGORIES_BY_LEVEL[1];
    const available = shuffle(lvlCategories);
    return available.slice(0, TOTAL_SETS);
  }, [childLevel]);

  const currentSet = sets[setIndex] || sets[0];
  const shuffledItems = useMemo(() => {
    return shuffle(currentSet.items);
  }, [setIndex]);

  const item = shuffledItems[currentItem];
  const totalItems = TOTAL_SETS * currentSet.items.length;

  useEffect(() => {
    if (!item || showInstructions) return;
    // Voice instructions on first item
    if (!instructionsGiven.current) {
      instructionsGiven.current = true;
      const t = setTimeout(() => {
        playSequence([
          { text: getInstruction('categorySort', uiLang), lang: uiLang },
          { pause: 300 },
          { text: item.word, lang: 'en-US', rate: 0.6 },
          { pause: 400 },
          { text: lf(item, 'translation', uiLang), lang: uiLang, rate: 0.85 },
        ], speakRef.current);
      }, 500);
      return () => clearTimeout(t);
    } else {
      // Delay to let previous answer's game sound finish
      const t2 = setTimeout(() => playSequence([
        { text: item.word, lang: 'en-US', rate: 0.6 },
        { pause: 400 },
        { text: lf(item, 'translation', uiLang), lang: uiLang, rate: 0.85 },
      ], speak), 400);
      return () => clearTimeout(t2);
    }
  }, [currentItem, setIndex, showInstructions]);

  const handleSort = (categoryIndex) => {
    if (!item || lastResult) return;
    playTap();

    const isCorrect = item.category === categoryIndex;
    if (isCorrect) {
      setCorrect(c => c + 1);
      setLastResult('correct');
      playCorrect();
      playSplash();
    } else {
      setLastResult('wrong');
      playWrong();
    }

    sortTimersRef.current.push(setTimeout(() => {
      setLastResult(null);
      setSorted(prev => [...prev, currentItem]);

      if (currentItem + 1 >= shuffledItems.length) {
        if (setIndex + 1 >= TOTAL_SETS) {
          setGameOver(true);
          setShowConfetti(true);
          playComplete();
        } else {
          setSetIndex(s => s + 1);
          setCurrentItem(0);
          setSorted([]);
        }
      } else {
        setCurrentItem(c => c + 1);
      }
    }, 800));
  };

  if (gameOver) {
    const xp = correct * 3 + 5;
    return (
      <GameOverScreen
        emoji="📦" title={t('greatSorting', uiLang)}
        subtitle={tReplace('sortedItems', uiLang, { count: correct })}
        score={Math.min(correct, 6)} total={6} xp={xp}
        onContinue={() => onComplete(xp)}
        gradient="from-green-400 to-emerald-500" uiLang={uiLang}
      />
    );
  }

  const progress = ((setIndex * currentSet.items.length + currentItem) / totalItems) * 100;

  return (
    <div className="kids-bg min-h-screen relative">
      <FloatingDecorations />
      {showInstructions && (
        <GameInstructionOverlay
          gameEmoji="📦"
          title={t('gameCategorySortTitle', uiLang)}
          instruction={getInstruction('categorySort', uiLang)}
          uiLang={uiLang}
          onStart={() => setShowInstructions(false)}
        />
      )}
      <div className="relative z-10">
        <GameHeader onBack={onBack} emoji="📦"
          title={t('categorySort', uiLang)}
          right={
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                {correct}
              </span>
            </div>
          }
        />

        {/* Progress bar */}
        <div className="px-4 mb-4">
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Current item */}
        {item && (
          <div className="text-center mb-6 px-4">
            <div className={`inline-block p-6 rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl transition-all duration-300 ${
              lastResult === 'correct' ? 'border-3 border-emerald-400 animate-spring' :
              lastResult === 'wrong' ? 'border-3 border-red-400 animate-shake' :
              'border-2 border-gray-200 dark:border-gray-700'
            }`}>
              <span className="text-6xl block mb-2 animate-jelly">{item.emoji}</span>
              <span className="text-xl font-black text-gray-800 dark:text-white" dir="ltr">{item.word}</span>
              <span className="text-sm text-gray-400 block" dir={RTL_LANGS.includes(uiLang) ? 'rtl' : 'ltr'}>{lf(item, 'translation', uiLang)}</span>
            </div>
          </div>
        )}

        {/* Category buckets */}
        <div className="grid grid-cols-2 gap-3 px-4">
          {currentSet.categories.map((cat, i) => (
            <button
              key={i}
              onClick={() => handleSort(i)}
              disabled={!!lastResult}
              className={`rounded-2xl p-4 flex flex-col items-center gap-2 transition-all duration-200 active:scale-95 bg-gradient-to-br ${cat.color} text-white shadow-lg`}
              style={{ boxShadow: `0 4px 0 rgba(0,0,0,0.15)`, minHeight: '120px' }}
            >
              <span className="text-4xl">{cat.emoji}</span>
              <span className="text-lg font-black drop-shadow-md">
                {lf(cat, 'name', uiLang)}
              </span>
              {/* Show sorted count */}
              <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                {sorted.map(si => {
                  const sortedItem = shuffledItems[si];
                  if (sortedItem && sortedItem.category === i) {
                    return <span key={si} className="text-sm">{sortedItem.emoji}</span>;
                  }
                  return null;
                })}
              </div>
            </button>
          ))}
        </div>

        {/* Instruction */}
        <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-4 px-4">
          {t('tapRightCategory', uiLang)}
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   GAME: MISSING LETTER
   Show image + word with one letter missing.
   Child picks the missing letter.
   ══════════════════════════════════════════════════════ */

const MISSING_LETTER_WORDS = [
  { word: 'apple', emoji: '🍎', translation: 'תַּפּוּחַ', translationAr: 'تفاحة', translationRu: 'яблоко' },
  { word: 'banana', emoji: '🍌', translation: 'בָּנָנָה', translationAr: 'موزة', translationRu: 'банан' },
  { word: 'cat', emoji: '🐱', translation: 'חָתוּל', translationAr: 'قطة', translationRu: 'кошка' },
  { word: 'dog', emoji: '🐶', translation: 'כֶּלֶב', translationAr: 'كلب', translationRu: 'собака' },
  { word: 'fish', emoji: '🐟', translation: 'דָּג', translationAr: 'سمكة', translationRu: 'рыба' },
  { word: 'bird', emoji: '🐦', translation: 'צִפּוֹר', translationAr: 'طائر', translationRu: 'птица' },
  { word: 'cake', emoji: '🎂', translation: 'עוּגָה', translationAr: 'كعكة', translationRu: 'торт' },
  { word: 'moon', emoji: '🌙', translation: 'יָרֵחַ', translationAr: 'قمر', translationRu: 'луна' },
  { word: 'star', emoji: '⭐', translation: 'כּוֹכָב', translationAr: 'نجمة', translationRu: 'звезда' },
  { word: 'tree', emoji: '🌳', translation: 'עֵץ', translationAr: 'شجرة', translationRu: 'дерево' },
  { word: 'book', emoji: '📖', translation: 'סֵפֶר', translationAr: 'كتاب', translationRu: 'книга' },
  { word: 'ball', emoji: '⚽', translation: 'כַּדּוּר', translationAr: 'كرة', translationRu: 'мяч' },
  { word: 'rain', emoji: '🌧️', translation: 'גֶּשֶׁם', translationAr: 'مطر', translationRu: 'дождь' },
  { word: 'milk', emoji: '🥛', translation: 'חָלָב', translationAr: 'حليب', translationRu: 'молоко' },
  { word: 'frog', emoji: '🐸', translation: 'צְפַרְדֵּעַ', translationAr: 'ضفدع', translationRu: 'лягушка' },
  { word: 'duck', emoji: '🦆', translation: 'בַּרְוָז', translationAr: 'بطة', translationRu: 'утка' },
  { word: 'hand', emoji: '✋', translation: 'יָד', translationAr: 'يد', translationRu: 'рука' },
  { word: 'door', emoji: '🚪', translation: 'דֶּלֶת', translationAr: 'باب', translationRu: 'дверь' },
];

export function MissingLetterGame({ onComplete, onBack, childLevel = 1 }) {
  const { uiLang } = useTheme();
  const { speak } = useSpeech();
  const { recordWordPractice } = useUserProgress();
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const speakRef = useRef(speak);
  speakRef.current = speak;
  const instructionsGiven = useRef(false);
  const huntTimersRef = useRef([]);
  const completedWordsRef = useRef([]);

  const TOTAL_ROUNDS = 8;
  // Options by level: 1→2, 2→3, 3→4, 4→4
  const NUM_OPTIONS = childLevel === 1 ? 2 : childLevel === 2 ? 3 : 4;
  // Word length by level: 1→3, 2→3-4, 3→4-5, 4→4+
  const maxWordLen = childLevel === 1 ? 3 : childLevel === 2 ? 4 : 5;

  // Preload Hebrew instruction phrases on mount
  useEffect(() => {
    preloadHebrewAudio(NEW_GAME_PHRASES);
  }, []);

  // Stop all audio + clear timers on unmount
  useEffect(() => {
    return () => { stopAllAudio(); huntTimersRef.current.forEach(clearTimeout); };
  }, []);

  const rounds = useMemo(() => {
    // Filter words by length based on level
    const filtered = MISSING_LETTER_WORDS.filter(w =>
      childLevel === 1 ? w.word.length <= 3 :
      childLevel === 2 ? w.word.length <= 4 :
      w.word.length <= 5
    );
    const source = filtered.length >= TOTAL_ROUNDS ? filtered : MISSING_LETTER_WORDS;
    const picked = shuffle(source).slice(0, TOTAL_ROUNDS);
    return picked.map(w => {
      // Pick a random position to remove
      const pos = Math.floor(Math.random() * w.word.length);
      const missingLetter = w.word[pos];
      const displayed = w.word.split('').map((l, i) => i === pos ? '_' : l).join('');

      // Generate options: correct + (NUM_OPTIONS-1) wrong
      const allLetters = 'abcdefghijklmnopqrstuvwxyz'.split('').filter(l => l !== missingLetter);
      const wrongLetters = shuffle(allLetters).slice(0, NUM_OPTIONS - 1);
      const options = shuffle([missingLetter, ...wrongLetters]);

      return { ...w, pos, missingLetter, displayed, options };
    });
  }, []);

  const current = rounds[round];

  useEffect(() => {
    if (!current || showInstructions) return;
    if (!instructionsGiven.current) {
      instructionsGiven.current = true;
      const t = setTimeout(() => {
        playSequence([
          { text: getInstruction('missingLetter', uiLang), lang: uiLang },
          { pause: 300 },
          { text: current.word, lang: 'en-US', rate: 0.6 },
          { pause: 400 },
          { text: lf(current, 'translation', uiLang), lang: uiLang, rate: 0.85 },
        ], speakRef.current);
      }, 500);
      return () => clearTimeout(t);
    } else {
      // Small delay so previous audio is fully stopped
      const t = setTimeout(() => {
        playSequence([
          { text: current.word, lang: 'en-US', rate: 0.6 },
          { pause: 400 },
          { text: lf(current, 'translation', uiLang), lang: uiLang, rate: 0.85 },
        ], speak);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [round, showInstructions]);

  const handlePick = (letter) => {
    if (selectedLetter !== null) return;
    setSelectedLetter(letter);
    playTap();

    const isCorrect = letter === current.missingLetter;

    const advanceToNext = () => {
      stopAllAudio();
      setSelectedLetter(null);
      if (round + 1 >= TOTAL_ROUNDS) {
        setGameOver(true);
        playComplete();
        if (completedWordsRef.current.length > 0) recordWordPractice(completedWordsRef.current);
      } else {
        setRound(r => r + 1);
      }
    };

    if (isCorrect) {
      playCorrect();
      setScore(s => s + 1);
      completedWordsRef.current.push(current.word);
      // Play English word, short pause, then Hebrew translation
      // Wait for audio to finish before advancing
      let audioDone = false;
      let timerDone = false;
      const tryAdvance = () => {
        if (audioDone && timerDone) advanceToNext();
      };
      huntTimersRef.current.push(setTimeout(() => {
        playSequence([
          { text: current.word, lang: 'en-US', rate: 0.6 },
          { pause: 400 },
          { text: lf(current, 'translation', uiLang), lang: uiLang, rate: 0.85 },
        ], speak, () => {
          audioDone = true;
          tryAdvance();
        });
      }, 400));
      // Minimum visual delay of 1.5s so user sees the green feedback
      huntTimersRef.current.push(setTimeout(() => {
        timerDone = true;
        tryAdvance();
      }, 1500));
    } else {
      playWrong();
      huntTimersRef.current.push(setTimeout(advanceToNext, 1000));
    }
  };

  if (gameOver) {
    const xp = score * 3 + 5;
    return (
      <GameOverScreen
        emoji="🔤" title={t('letterChampion', uiLang)}
        subtitle={tReplace('foundLetters', uiLang, { count: score })}
        score={score} total={TOTAL_ROUNDS} xp={xp}
        onContinue={() => onComplete(xp)}
        gradient="from-violet-400 to-purple-500" uiLang={uiLang}
      />
    );
  }

  if (!current) return null;

  return (
    <div className="kids-bg min-h-screen relative">
      <FloatingDecorations />
      {showInstructions && (
        <GameInstructionOverlay
          gameEmoji="🔤"
          title={t('gameMissingLetterTitle', uiLang)}
          instruction={getInstruction('missingLetter', uiLang)}
          uiLang={uiLang}
          onStart={() => setShowInstructions(false)}
        />
      )}
      <div className="relative z-10">
        <GameHeader onBack={onBack} emoji="🔤"
          title={t('missingLetter', uiLang)}
          right={
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{round + 1}/{TOTAL_ROUNDS}</span>
            </div>
          }
        />

        {/* Progress */}
        <div className="flex justify-center gap-1.5 mb-4 px-4">
          {[...Array(TOTAL_ROUNDS)].map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all ${
              i < round ? 'w-2 bg-violet-400' : i === round ? 'w-6 bg-gradient-to-r from-violet-400 to-purple-500' : 'w-2 bg-gray-300 dark:bg-gray-600'
            }`} />
          ))}
        </div>

        {/* Emoji & word display */}
        <div className="text-center mb-8 px-4">
          <button onClick={() => playSequence([{ text: current.word, lang: 'en-US', rate: 0.6 }, { pause: 400 }, { text: lf(current, 'translation', uiLang), lang: uiLang, rate: 0.85 }], speak)} className="inline-block">
            <span className="text-7xl block mb-3 animate-jelly">{current.emoji}</span>
          </button>
          <p className="text-sm text-gray-400 mb-2" dir={RTL_LANGS.includes(uiLang) ? 'rtl' : 'ltr'}>{lf(current, 'translation', uiLang)}</p>

          {/* Word with missing letter */}
          <div className="flex justify-center gap-1.5" dir="ltr">
            {current.word.split('').map((letter, i) => {
              const isMissing = i === current.pos;
              const isRevealed = isMissing && selectedLetter !== null;
              return (
                <div
                  key={i}
                  className={`w-11 h-14 rounded-xl flex items-center justify-center text-2xl font-black transition-all duration-300 ${
                    isMissing
                      ? isRevealed
                        ? selectedLetter === current.missingLetter
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-400 text-emerald-700 animate-pop-in'
                          : 'bg-red-100 dark:bg-red-900/40 border-2 border-red-400 text-red-700'
                        : 'bg-indigo-100 dark:bg-indigo-900/30 border-2 border-dashed border-indigo-400 text-indigo-400 animate-breathe'
                      : 'bg-white/60 dark:bg-gray-800/60 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  {isMissing ? (isRevealed ? current.missingLetter : '?') : letter}
                </div>
              );
            })}
          </div>

          <button onClick={() => playSequence([{ text: current.word, lang: 'en-US', rate: 0.6 }, { pause: 400 }, { text: lf(current, 'translation', uiLang), lang: uiLang, rate: 0.85 }], speak)}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full text-xs font-bold text-indigo-500 active:scale-95 transition-transform"
          >
            <Volume2 size={14} /> {t('listenBtn', uiLang)}
          </button>
        </div>

        {/* Letter options */}
        <div className="flex justify-center gap-3 px-4" dir="ltr">
          {current.options.map((letter, i) => {
            let btnClass = 'w-16 h-16 rounded-2xl text-2xl font-black flex items-center justify-center transition-all duration-200 ';
            if (selectedLetter === null) {
              btnClass += 'game-option-btn hover:scale-105 active:scale-90';
            } else if (letter === current.missingLetter) {
              btnClass += 'game-option-btn correct scale-105';
            } else if (letter === selectedLetter) {
              btnClass += 'game-option-btn wrong';
            } else {
              btnClass += 'game-option-btn opacity-40';
            }
            return (
              <button key={i} onClick={() => handlePick(letter)} disabled={selectedLetter !== null}
                className={btnClass}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   GAME: SENTENCE BUILDER
   Show image, arrange word tiles into a sentence.
   ══════════════════════════════════════════════════════ */

const SENTENCE_DATA = [
  { sentence: 'The cat is small', words: ['The', 'cat', 'is', 'small'], emoji: '🐱', translationHe: 'הֶחָתוּל קָטָן', translationAr: 'القطة صغيرة', translationRu: 'Кошка маленькая' },
  { sentence: 'I like apples', words: ['I', 'like', 'apples'], emoji: '🍎', translationHe: 'אֲנִי אוֹהֵב תַּפּוּחִים', translationAr: 'أنا أحب التفاح', translationRu: 'Я люблю яблоки' },
  { sentence: 'The sun is hot', words: ['The', 'sun', 'is', 'hot'], emoji: '☀️', translationHe: 'הַשֶּׁמֶשׁ חַמָּה', translationAr: 'الشمس حارة', translationRu: 'Солнце горячее' },
  { sentence: 'She has a dog', words: ['She', 'has', 'a', 'dog'], emoji: '🐶', translationHe: 'יֵשׁ לָהּ כֶּלֶב', translationAr: 'لديها كلب', translationRu: 'У неё есть собака' },
  { sentence: 'The bird can fly', words: ['The', 'bird', 'can', 'fly'], emoji: '🐦', translationHe: 'הַצִּפּוֹר יְכוֹלָה לָעוּף', translationAr: 'الطائر يستطيع الطيران', translationRu: 'Птица может летать' },
  { sentence: 'I am happy', words: ['I', 'am', 'happy'], emoji: '😊', translationHe: 'אֲנִי שָׂמֵחַ', translationAr: 'أنا سعيد', translationRu: 'Я счастлив' },
  { sentence: 'He reads a book', words: ['He', 'reads', 'a', 'book'], emoji: '📖', translationHe: 'הוּא קוֹרֵא סֵפֶר', translationAr: 'هو يقرأ كتاباً', translationRu: 'Он читает книгу' },
  { sentence: 'The fish is blue', words: ['The', 'fish', 'is', 'blue'], emoji: '🐟', translationHe: 'הַדָּג כָּחֹל', translationAr: 'السمكة زرقاء', translationRu: 'Рыба синяя' },
  { sentence: 'We go to school', words: ['We', 'go', 'to', 'school'], emoji: '🏫', translationHe: 'אֲנַחְנוּ הוֹלְכִים לְבֵית סֵפֶר', translationAr: 'نحن نذهب إلى المدرسة', translationRu: 'Мы идём в школу' },
  { sentence: 'They eat cake', words: ['They', 'eat', 'cake'], emoji: '🎂', translationHe: 'הֵם אוֹכְלִים עוּגָה', translationAr: 'هم يأكلون الكعكة', translationRu: 'Они едят торт' },
  { sentence: 'The ball is red', words: ['The', 'ball', 'is', 'red'], emoji: '🔴', translationHe: 'הַכַּדּוּר אָדֹם', translationAr: 'الكرة حمراء', translationRu: 'Мяч красный' },
  { sentence: 'She drinks milk', words: ['She', 'drinks', 'milk'], emoji: '🥛', translationHe: 'הִיא שׁוֹתָה חָלָב', translationAr: 'هي تشرب الحليب', translationRu: 'Она пьёт молоко' },
];

export function SentenceBuilderGame({ onComplete, onBack, childLevel = 1 }) {
  const { uiLang } = useTheme();
  const { speak } = useSpeech();
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongTapId, setWrongTapId] = useState(null);
  const [placed, setPlaced] = useState([]);
  const [available, setAvailable] = useState([]);
  const [isCorrect, setIsCorrect] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const speakRef = useRef(speak);
  speakRef.current = speak;
  const instructionsGiven = useRef(false);
  const sentenceTimersRef = useRef([]);

  // Rounds by level: 1→4, 2→5, 3→6, 4→6
  const TOTAL_ROUNDS = childLevel === 1 ? 4 : childLevel === 2 ? 5 : 6;

  // Preload Hebrew instruction phrases on mount
  useEffect(() => {
    preloadHebrewAudio(NEW_GAME_PHRASES);
  }, []);

  // Stop all audio + clear timers on unmount
  useEffect(() => {
    return () => { stopAllAudio(); sentenceTimersRef.current.forEach(clearTimeout); };
  }, []);

  // Use level-specific sentences
  const sentences = useMemo(() => {
    const lvlSentences = SENTENCES_BY_LEVEL[childLevel] || SENTENCES_BY_LEVEL[1];
    // Also include lower levels to have enough variety
    const allSentences = [];
    for (let l = 1; l <= childLevel; l++) {
      if (SENTENCES_BY_LEVEL[l]) allSentences.push(...SENTENCES_BY_LEVEL[l]);
    }
    const source = allSentences.length >= TOTAL_ROUNDS ? allSentences : SENTENCE_DATA;
    return shuffle(source).slice(0, TOTAL_ROUNDS);
  }, [childLevel]);

  const current = sentences[round];

  useEffect(() => {
    if (!current || showInstructions) return;
    setPlaced([]);
    setIsCorrect(null);
    // Shuffle the words
    setAvailable(shuffle(current.words.map((w, i) => ({ id: i, word: w, used: false }))));

    // Voice instructions on first round, then just the sentence
    if (!instructionsGiven.current) {
      instructionsGiven.current = true;
      const t = setTimeout(() => {
        playSequence([
          { text: getInstruction('sentenceBuilder', uiLang), lang: uiLang },
          { pause: 300 },
          { text: current.sentence, lang: 'en-US', rate: 0.55 },
          { pause: 500 },
          { text: lf(current, 'translation', uiLang), lang: uiLang, rate: 0.85 },
        ], speakRef.current);
      }, 500);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        playSequence([
          { text: current.sentence, lang: 'en-US', rate: 0.55 },
          { pause: 500 },
          { text: lf(current, 'translation', uiLang), lang: uiLang, rate: 0.85 },
        ], speak);
      }, 400);
      return () => clearTimeout(t);
    }
  }, [round, showInstructions]);

  const handleWordTap = (wordObj) => {
    if (wordObj.used || isCorrect !== null) return;
    playTap();

    const nextIndex = placed.length;
    const expectedWord = current.words[nextIndex];

    if (wordObj.word === expectedWord) {
      const newPlaced = [...placed, wordObj.word];
      setPlaced(newPlaced);
      setAvailable(prev => prev.map(a => a.id === wordObj.id ? { ...a, used: true } : a));

      if (newPlaced.length === current.words.length) {
        // Sentence complete!
        setIsCorrect(true);
        setScore(s => s + 1);
        playCorrect();
        sentenceTimersRef.current.push(setTimeout(() => {
          playSequence([
            { text: current.sentence, lang: 'en-US', rate: 0.55 },
            { pause: 500 },
            { text: lf(current, 'translation', uiLang), lang: uiLang, rate: 0.85 },
          ], speak);
        }, 400));
      }
    } else {
      // Wrong word - flash red and shake
      playWrong();
      setWrongTapId(wordObj.id);
      sentenceTimersRef.current.push(setTimeout(() => setWrongTapId(null), 500));
    }
  };

  const handleReset = () => {
    setPlaced([]);
    setAvailable(prev => prev.map(a => ({ ...a, used: false })));
    setIsCorrect(null);
  };

  const handleNext = () => {
    if (round + 1 >= TOTAL_ROUNDS) {
      setGameOver(true);
      playComplete();
    } else {
      setRound(r => r + 1);
    }
  };

  if (gameOver) {
    const xp = score * 5 + 5;
    return (
      <GameOverScreen
        emoji="📝" title={t('sentencePro', uiLang)}
        subtitle={tReplace('builtSentences', uiLang, { count: score })}
        score={score} total={TOTAL_ROUNDS} xp={xp}
        onContinue={() => onComplete(xp)}
        gradient="from-indigo-400 to-blue-500" uiLang={uiLang}
      />
    );
  }

  if (!current) return null;

  return (
    <div className="kids-bg min-h-screen pb-24 relative">
      <FloatingDecorations />
      {showInstructions && (
        <GameInstructionOverlay
          gameEmoji="📝"
          title={t('gameSentenceBuilderTitle', uiLang)}
          instruction={getInstruction('sentenceBuilder', uiLang)}
          uiLang={uiLang}
          onStart={() => setShowInstructions(false)}
        />
      )}
      <div className="relative z-10">
        <GameHeader onBack={onBack} emoji="📝"
          title={t('sentenceBuilder', uiLang)}
          right={
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{round + 1}/{TOTAL_ROUNDS}</span>
            </div>
          }
        />

        {/* Progress */}
        <div className="flex justify-center gap-1.5 mb-4 px-4">
          {[...Array(TOTAL_ROUNDS)].map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all ${
              i < round ? 'w-2 bg-indigo-400' : i === round ? 'w-6 bg-gradient-to-r from-indigo-400 to-blue-500' : 'w-2 bg-gray-300 dark:bg-gray-600'
            }`} />
          ))}
        </div>

        {/* Image & translation */}
        <div className="text-center mb-4 px-4">
          <button onClick={() => playSequence([{ text: current.sentence, lang: 'en-US', rate: 0.55 }, { pause: 500 }, { text: lf(current, 'translation', uiLang), lang: uiLang, rate: 0.85 }], speak)} className="inline-block">
            <span className="text-6xl block mb-2 animate-jelly">{current.emoji}</span>
          </button>
          <p className="text-sm text-gray-500 dark:text-gray-400" dir={RTL_LANGS.includes(uiLang) ? 'rtl' : 'ltr'}>{lf(current, 'translation', uiLang)}</p>
          <button onClick={() => playSequence([{ text: current.sentence, lang: 'en-US', rate: 0.55 }, { pause: 500 }, { text: lf(current, 'translation', uiLang), lang: uiLang, rate: 0.85 }], speak)}
            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full text-xs font-bold text-indigo-500 active:scale-95"
          >
            <Volume2 size={14} /> {t('listenBtn', uiLang)}
          </button>
        </div>

        {/* Sentence slots */}
        <div className="flex flex-wrap justify-center gap-2 mb-6 px-4 min-h-[56px]" dir="ltr">
          {current.words.map((word, i) => {
            const isPlaced = i < placed.length;
            const isNext = i === placed.length;
            return (
              <div
                key={i}
                className={`px-4 py-2.5 rounded-xl text-base font-bold transition-all duration-300 ${
                  isPlaced
                    ? 'bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-400 text-emerald-700 dark:text-emerald-300 animate-pop-in'
                    : isNext
                      ? 'bg-white/80 dark:bg-gray-800/80 border-2 border-dashed border-blue-400 text-blue-300 animate-breathe min-w-[60px] text-center'
                      : 'bg-white/40 dark:bg-gray-800/40 border-2 border-dashed border-gray-300 dark:border-gray-600 text-transparent min-w-[60px]'
                }`}
              >
                {isPlaced ? placed[i] : isNext ? '?' : word}
              </div>
            );
          })}
        </div>

        {/* Available word tiles */}
        <div className="px-4" dir="ltr">
          <div className="flex flex-wrap justify-center gap-2">
            {available.map(wordObj => (
              <button
                key={wordObj.id}
                onClick={() => handleWordTap(wordObj)}
                disabled={wordObj.used || isCorrect !== null}
                className={`px-5 py-3 rounded-xl text-base font-bold transition-all duration-200 ${
                  wordObj.used
                    ? 'opacity-20 scale-90 bg-gray-200 dark:bg-gray-700 text-gray-400'
                    : wrongTapId === wordObj.id
                      ? 'bg-red-100 dark:bg-red-900/40 border-2 border-red-400 text-red-600 dark:text-red-300 animate-shake'
                      : 'game-option-btn hover:scale-105 active:scale-90'
                }`}
              >
                {wordObj.word}
              </button>
            ))}
          </div>
        </div>

        {/* Reset button */}
        {placed.length > 0 && !isCorrect && (
          <div className="text-center mt-4">
            <button onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full text-sm font-bold text-gray-500 active:scale-95"
            >
              <RotateCcw size={14} /> {t('resetGame', uiLang)}
            </button>
          </div>
        )}

        {/* Success overlay */}
        {isCorrect && (
          <div className="text-center mt-6 animate-pop-in">
            <div className="inline-block bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl px-8 py-5 shadow-2xl">
              <span className="text-4xl block mb-2">🎉</span>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mb-1">
                {t('correct', uiLang)}
              </p>
              <p className="text-sm text-gray-500 mb-3" dir="ltr">{current.sentence}</p>
              <button onClick={handleNext}
                className="btn-3d-green rounded-xl px-6 py-2.5 text-sm active:scale-95"
              >
                {round + 1 >= TOTAL_ROUNDS
                  ? t('finishExclaim', uiLang)
                  : t('nextSentence', uiLang)} →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
