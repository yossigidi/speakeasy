import React, { useState, useEffect, useMemo } from 'react';
import { Volume2, Star, Zap, Flame } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useUserProgress } from '../contexts/UserProgressContext.jsx';
import { useSpeech } from '../contexts/SpeechContext.jsx';

import wordsA1 from '../data/words-a1.json';
import { LEVEL_INFO } from '../data/kids-vocabulary.js';
import { t } from '../utils/translations.js';

/* ── Floating background decorations ── */
function FloatingDecorations() {
  const items = ['⭐', '🌈', '🎈', '🦋', '🌸', '✨', '🎵', '💫', '🌟', '🎨', '🦄', '🍭'];
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {items.map((e, i) => (
        <div
          key={i}
          className="absolute animate-float opacity-20"
          style={{
            left: `${(i * 8.5) % 95}%`,
            top: `${(i * 7.3) % 90}%`,
            fontSize: `${18 + (i % 3) * 8}px`,
            animationDelay: `${i * 0.35}s`,
            animationDuration: `${3 + (i % 4) * 0.8}s`,
          }}
        >
          {e}
        </div>
      ))}
    </div>
  );
}

/* ── Animated mascot character ── */
function MascotGreeting({ name, uiLang }) {
  const [bounce, setBounce] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setBounce(b => !b), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="text-center mb-2">
      <div className={`text-6xl mb-2 inline-block transition-transform duration-500 ${bounce ? 'scale-110 -rotate-3' : 'scale-100 rotate-3'}`}>
        🦉
      </div>
      <h1 className="text-3xl font-black rainbow-text py-1">
        {uiLang === 'he' ? `!${name || ''} היי` : `Hi ${name || ''}!`}
      </h1>
      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 animate-pop-in">
        {uiLang === 'he' ? '!בוא נלמד אנגלית היום' : "Let's learn English today!"}
      </p>
    </div>
  );
}

/* ── Stats bar for kids ── */
function KidsStatsBar({ progress, uiLang }) {
  return (
    <div className="flex justify-center gap-4 mb-4">
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-sm shadow-sm">
        <Flame size={18} className="text-orange-500" />
        <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{progress.streak || 0}</span>
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-sm shadow-sm">
        <Zap size={18} className="text-yellow-500" />
        <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{progress.xp || 0} XP</span>
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-sm shadow-sm">
        <Star size={18} className="text-purple-500" fill="currentColor" />
        <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
          {uiLang === 'he' ? `שלב ${progress.level || 1}` : `Lvl ${progress.level || 1}`}
        </span>
      </div>
    </div>
  );
}

/* ── Level badge ── */
function LevelBadge({ childLevel, uiLang }) {
  const info = LEVEL_INFO[childLevel] || LEVEL_INFO[1];
  return (
    <div className={`flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r ${info.color} shadow-md mx-auto`}
      style={{ maxWidth: '280px' }}
    >
      <span className="text-xl">{info.emoji}</span>
      <span className="text-sm font-black text-white drop-shadow-sm">
        {uiLang === 'he'
          ? `רמה ${childLevel}: ${info.name}`
          : `Level ${childLevel}: ${info.nameEn}`}
      </span>
    </div>
  );
}

/* ── Game cards data ── */
const GAME_CARDS = [
  {
    id: 'kids-teacher',
    emoji: '👩‍🏫',
    titleHe: 'שיעור עם המורה!',
    titleEn: 'Teacher Time!',
    descHe: 'למד עם המורה הווירטואלית',
    descEn: 'Learn with the virtual teacher',
    gradient: 'from-violet-400 via-purple-400 to-fuchsia-400',
    shadowColor: 'shadow-violet-400/30',
    page: 'kids-teacher',
  },
  {
    id: 'alphabet',
    emoji: '🔤',
    titleHe: 'למד אותיות!',
    titleEn: 'Learn Letters!',
    descHe: 'לחץ ולמד את ה-ABC',
    descEn: 'Tap & learn your ABCs',
    gradient: 'from-pink-400 via-rose-400 to-red-400',
    shadowColor: 'shadow-pink-400/30',
    page: 'alphabet',
  },
  {
    id: 'kids-games',
    emoji: '🫧',
    titleHe: 'משחקים!',
    titleEn: 'Fun Games!',
    descHe: 'בועות, זיכרון, בנה מילים',
    descEn: 'Bubbles, Memory & more',
    gradient: 'from-cyan-400 via-blue-400 to-indigo-400',
    shadowColor: 'shadow-cyan-400/30',
    page: 'kids-games',
  },
  {
    id: 'vocabulary',
    emoji: '📚',
    titleHe: 'מילים חדשות!',
    titleEn: 'New Words!',
    descHe: 'למד מילים באנגלית',
    descEn: 'Learn English words',
    gradient: 'from-emerald-400 via-green-400 to-teal-400',
    shadowColor: 'shadow-emerald-400/30',
    page: 'vocabulary',
  },
  {
    id: 'lessons',
    emoji: '🎮',
    titleHe: 'שיעורים',
    titleEn: 'Lessons',
    descHe: 'משחקים ותרגילים',
    descEn: 'Games & exercises',
    gradient: 'from-blue-400 via-indigo-400 to-violet-400',
    shadowColor: 'shadow-blue-400/30',
    page: 'lessons',
  },
  {
    id: 'pronunciation',
    emoji: '🎤',
    titleHe: 'דבר אנגלית!',
    titleEn: 'Speak English!',
    descHe: 'תרגל דיבור',
    descEn: 'Practice speaking',
    gradient: 'from-orange-400 via-amber-400 to-yellow-400',
    shadowColor: 'shadow-orange-400/30',
    page: 'pronunciation',
  },
];

/* ── YouTube educational videos for kids ── */
const KIDS_VIDEOS = [
  {
    id: 'abc-song',
    videoId: 'hq3yfQnllfQ',
    titleHe: 'שיר ה-ABC',
    titleEn: 'ABC Song',
    descHe: 'למד את האלפבית בשירה!',
    descEn: 'Learn the alphabet with a song!',
    emoji: '🎵',
  },
  {
    id: 'colors',
    videoId: 'jYAWf8Y91hA',
    titleHe: 'למד צבעים',
    titleEn: 'Learn Colors',
    descHe: 'צבעים באנגלית לילדים',
    descEn: 'Colors in English for kids',
    emoji: '🎨',
  },
  {
    id: 'animals',
    videoId: 'zXEq-QO3xTg',
    titleHe: 'חיות באנגלית',
    titleEn: 'Animal Names',
    descHe: 'למד שמות של חיות!',
    descEn: 'Learn animal names!',
    emoji: '🐾',
  },
  {
    id: 'numbers',
    videoId: 'DR-cfDsHCGA',
    titleHe: 'מספרים 1-10',
    titleEn: 'Numbers 1-10',
    descHe: 'ספירה באנגלית',
    descEn: 'Count in English',
    emoji: '🔢',
  },
  {
    id: 'greetings',
    videoId: 'gVIYbQuNMBc',
    titleHe: 'ברכות ופתיחות',
    titleEn: 'Greetings',
    descHe: 'Hello, Hi, Good morning!',
    descEn: 'Hello, Hi, Good morning!',
    emoji: '👋',
  },
  {
    id: 'fruits',
    videoId: 'mfReSbQ7JzU',
    titleHe: 'פירות באנגלית',
    titleEn: 'Fruits Song',
    descHe: 'Apple, Banana, Orange...',
    descEn: 'Apple, Banana, Orange...',
    emoji: '🍎',
  },
];

/* ── Video card with embedded player ── */
function VideoCard({ video, uiLang, isExpanded, onToggle }) {
  return (
    <div
      className={`rounded-3xl overflow-hidden transition-all duration-500 ${
        isExpanded ? 'col-span-2' : ''
      }`}
      style={{
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      }}
    >
      {isExpanded ? (
        <div>
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute inset-0 w-full h-full rounded-t-3xl"
              src={`https://www.youtube.com/embed/${video.videoId}?rel=0&modestbranding=1`}
              title={uiLang === 'he' ? video.titleHe : video.titleEn}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <button
            onClick={onToggle}
            className="w-full py-2.5 text-center text-sm font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            {uiLang === 'he' ? 'סגור ✕' : 'Close ✕'}
          </button>
        </div>
      ) : (
        <button
          onClick={onToggle}
          className="w-full p-3 flex items-center gap-3 active:scale-95 transition-transform"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-2xl shadow-md shrink-0">
            {video.emoji}
          </div>
          <div className="flex-1 text-left" dir={uiLang === 'he' ? 'rtl' : 'ltr'}>
            <p className="font-bold text-gray-800 dark:text-white text-sm">
              {uiLang === 'he' ? video.titleHe : video.titleEn}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {uiLang === 'he' ? video.descHe : video.descEn}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shrink-0">
            <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-l-[10px] border-transparent border-l-white ml-0.5" />
          </div>
        </button>
      )}
    </div>
  );
}

/* ── Word of the day for kids ── */
function KidsWordOfDay({ speak, speakSequence, uiLang }) {
  const word = useMemo(() => {
    const today = new Date();
    const idx = (today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate()) % wordsA1.length;
    return wordsA1[idx];
  }, []);

  if (!word) return null;

  return (
    <div
      className="rounded-3xl p-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #6366f1 100%)',
        boxShadow: '0 8px 30px rgba(99, 102, 241, 0.3)',
      }}
    >
      {/* Sparkles */}
      <div className="absolute top-2 right-3 text-lg animate-sparkle">✨</div>
      <div className="absolute bottom-2 left-3 text-sm animate-sparkle" style={{ animationDelay: '0.5s' }}>⭐</div>

      <p className="text-xs font-bold text-white/70 uppercase tracking-wider mb-1">
        {uiLang === 'he' ? 'המילה של היום' : 'Word of the Day'}
      </p>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <h3 className="text-2xl font-black text-white">{word.word}</h3>
          <p className="text-sm text-white/80 font-medium" dir="rtl">{word.translation}</p>
        </div>
        <button
          onClick={() => {
            speakSequence([
              { text: word.word, lang: 'en-US', rate: 0.85 },
              { pause: 600 },
              { text: word.translation, lang: 'he', rate: 0.95 },
            ]);
          }}
          className="w-12 h-12 rounded-full bg-white/25 flex items-center justify-center active:scale-90 transition-transform"
        >
          <Volume2 size={22} className="text-white" />
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   KIDS HOME PAGE - Main component
   ══════════════════════════════════════════ */
export default function KidsHomePage({ onNavigate, reviewCount = 0 }) {
  const { uiLang } = useTheme();
  const { progress } = useUserProgress();
  const { speak, speakSequence } = useSpeech();
  const [expandedVideo, setExpandedVideo] = useState(null);
  const [cardPops, setCardPops] = useState([]);

  // Stagger card pop-in animations
  useEffect(() => {
    const timers = GAME_CARDS.map((_, i) =>
      setTimeout(() => setCardPops(prev => [...prev, i]), 100 + i * 120)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const lettersDone = (progress.lettersCompleted || []).length;

  return (
    <div className="kids-bg min-h-screen pb-24 relative">
      <FloatingDecorations />

      <div className="relative z-10 px-4 pt-4 space-y-5">
        {/* Mascot greeting */}
        <MascotGreeting name={progress.displayName} uiLang={uiLang} />

        {/* Stats bar */}
        <KidsStatsBar progress={progress} uiLang={uiLang} />

        {/* Level badge */}
        <LevelBadge childLevel={progress.childLevel || 1} uiLang={uiLang} />

        {/* Progress bar for letters */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
              {uiLang === 'he' ? 'התקדמות אותיות' : 'Letter Progress'}
            </span>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
              {lettersDone}/26 ⭐
            </span>
          </div>
          <div className="h-4 rounded-full bg-white/50 dark:bg-white/10 overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
              style={{
                width: `${(lettersDone / 26) * 100}%`,
                background: 'linear-gradient(90deg, #f472b6, #a78bfa, #60a5fa, #34d399)',
                minWidth: lettersDone > 0 ? '12%' : '0%',
              }}
            >
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  background: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.4) 8px, rgba(255,255,255,0.4) 16px)',
                  animation: 'slideStripes 1s linear infinite',
                }}
              />
            </div>
          </div>
        </div>

        {/* Game cards grid */}
        <div>
          <h2 className="text-lg font-black text-gray-800 dark:text-white mb-3 flex items-center gap-2">
            <span className="animate-wiggle inline-block">🎮</span>
            {uiLang === 'he' ? 'בוא נשחק!' : "Let's Play!"}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {GAME_CARDS.map((card, i) => (
              <button
                key={card.id}
                onClick={() => onNavigate(card.page)}
                className={`rounded-3xl p-4 text-left active:scale-90 transition-all duration-300 ${
                  cardPops.includes(i) ? 'animate-pop-in' : 'opacity-0 scale-0'
                }`}
                style={{
                  background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                  boxShadow: `0 8px 25px rgba(0,0,0,0.12)`,
                }}
              >
                <div className={`w-full rounded-3xl bg-gradient-to-br ${card.gradient} p-4 relative overflow-hidden`}>
                  {/* Decorative circle */}
                  <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/15" />
                  <div className="absolute -bottom-3 -left-3 w-12 h-12 rounded-full bg-white/10" />

                  <div className="relative z-10">
                    <span className="text-4xl block mb-2">{card.emoji}</span>
                    <h3 className="text-white font-extrabold text-sm leading-tight">
                      {uiLang === 'he' ? card.titleHe : card.titleEn}
                    </h3>
                    <p className="text-white/70 text-[10px] mt-0.5 font-medium">
                      {uiLang === 'he' ? card.descHe : card.descEn}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Word of the Day */}
        <KidsWordOfDay speak={speak} speakSequence={speakSequence} uiLang={uiLang} />

        {/* Review words reminder */}
        {reviewCount > 0 && (
          <button
            onClick={() => onNavigate('vocabulary')}
            className="w-full rounded-3xl p-4 active:scale-95 transition-transform relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
              boxShadow: '0 6px 20px rgba(217, 119, 6, 0.3)',
            }}
          >
            <div className="absolute top-1 right-2 text-xl animate-jelly">🔔</div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">📝</span>
              <div className="text-left">
                <h3 className="text-white font-extrabold text-sm">
                  {uiLang === 'he' ? 'מילים לחזרה!' : 'Words to Review!'}
                </h3>
                <p className="text-white/80 text-xs">
                  {reviewCount} {uiLang === 'he' ? 'מילים מחכות לך' : 'words waiting for you'}
                </p>
              </div>
            </div>
          </button>
        )}

        {/* Videos section */}
        <div>
          <h2 className="text-lg font-black text-gray-800 dark:text-white mb-3 flex items-center gap-2">
            <span className="text-xl">🎬</span>
            {uiLang === 'he' ? 'סרטונים ללמידה' : 'Learning Videos'}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {KIDS_VIDEOS.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                uiLang={uiLang}
                isExpanded={expandedVideo === video.id}
                onToggle={() => setExpandedVideo(expandedVideo === video.id ? null : video.id)}
              />
            ))}
          </div>
        </div>

        {/* Reading card */}
        <button
          onClick={() => onNavigate('reading')}
          className="w-full rounded-3xl p-4 active:scale-95 transition-transform relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #0e7490 100%)',
            boxShadow: '0 6px 20px rgba(8, 145, 178, 0.3)',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">📖</span>
            <div className="text-left">
              <h3 className="text-white font-extrabold text-sm">
                {uiLang === 'he' ? 'סיפורים באנגלית' : 'English Stories'}
              </h3>
              <p className="text-white/80 text-xs">
                {uiLang === 'he' ? 'קרא סיפורים קצרים ולמד!' : 'Read short stories & learn!'}
              </p>
            </div>
          </div>
        </button>

        {/* Bottom spacer */}
        <div className="h-4" />
      </div>
    </div>
  );
}
