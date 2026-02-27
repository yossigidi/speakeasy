import React, { useState, useEffect, useMemo } from 'react';
import { Volume2, Star, Zap, Flame } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useUserProgress } from '../contexts/UserProgressContext.jsx';
import { useSpeech } from '../contexts/SpeechContext.jsx';
import KidsIntro from '../components/kids/KidsIntro.jsx';
import SpeakliAvatar from '../components/kids/SpeakliAvatar.jsx';

import wordsA1 from '../data/words-a1.json';
import { LEVEL_INFO } from '../data/kids-vocabulary.js';
import { t } from '../utils/translations.js';

/* ── Floating background decorations (Speakli-themed) ── */
function FloatingDecorations() {
  const items = ['⭐', '🌟', '✨', '💫', '🎵', '📖', '🔤', '🎮', '🌈', '⭐', '✨', '💫'];
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

/* ── Animated Speakli mascot character ── */
function MascotGreeting({ name, uiLang }) {
  return (
    <div className="text-center mb-2">
      <SpeakliAvatar mode="idle" size="lg" glow />
      <h1 className="text-3xl font-black py-1 mt-1" style={{ background: 'linear-gradient(135deg, #2563EB, #06B6D4, #F59E0B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        {uiLang === 'he' ? `היי ${name || ''}!` : `Hi ${name || ''}!`}
      </h1>
      <p className="text-sm font-bold text-blue-600 dark:text-sky-400 mt-1 animate-pop-in">
        {uiLang === 'he' ? 'ספיקלי כאן! בוא נלמד אנגלית!' : "Speakli is here! Let's learn English!"}
      </p>
    </div>
  );
}

/* ── Stats bar for kids (Speakli colors) ── */
function KidsStatsBar({ progress, uiLang }) {
  return (
    <div className="flex justify-center gap-4 mb-4">
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 dark:bg-white/10 backdrop-blur-sm shadow-sm border border-orange-200/50">
        <Flame size={18} className="text-orange-500" />
        <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{progress.streak || 0}</span>
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 dark:bg-white/10 backdrop-blur-sm shadow-sm border border-amber-200/50">
        <Zap size={18} className="text-amber-500" />
        <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{progress.xp || 0} XP</span>
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 dark:bg-white/10 backdrop-blur-sm shadow-sm border border-blue-200/50">
        <Star size={18} className="text-blue-500" fill="currentColor" />
        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
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

/* ── Game cards data (Speakli character colors: blue, cyan, orange, green, red) ── */
const GAME_CARDS = [
  {
    id: 'english-quest',
    emoji: '⚔️',
    titleHe: 'המשימה של ספיקלי!',
    titleEn: "Speakli's Quest!",
    descHe: 'הצל את העולם עם אנגלית',
    descEn: 'Save the world with English',
    gradient: 'from-orange-400 via-amber-500 to-yellow-500',
    shadowColor: 'shadow-orange-400/30',
    page: 'english-quest',
  },
  {
    id: 'curriculum',
    emoji: '📚',
    titleHe: 'השיעורים של ספיקלי!',
    titleEn: "Speakli's Lessons!",
    descHe: 'למד שלב אחר שלב',
    descEn: 'Learn step by step',
    gradient: 'from-blue-400 via-blue-500 to-sky-500',
    shadowColor: 'shadow-blue-400/30',
    page: 'curriculum',
  },
  {
    id: 'alphabet',
    emoji: '🔤',
    titleHe: 'האותיות של ספיקלי!',
    titleEn: "Speakli's Letters!",
    descHe: 'לחץ ולמד את ה-ABC',
    descEn: 'Tap & learn your ABCs',
    gradient: 'from-sky-400 via-cyan-400 to-teal-400',
    shadowColor: 'shadow-sky-400/30',
    page: 'alphabet',
  },
  {
    id: 'kids-games',
    emoji: '🎮',
    titleHe: 'המשחקים של ספיקלי!',
    titleEn: "Speakli's Games!",
    descHe: 'בועות, זיכרון, בנה מילים',
    descEn: 'Bubbles, Memory & more',
    gradient: 'from-green-400 via-emerald-400 to-teal-400',
    shadowColor: 'shadow-green-400/30',
    page: 'kids-games',
  },
  {
    id: 'vocabulary',
    emoji: '📖',
    titleHe: 'המילים של ספיקלי!',
    titleEn: "Speakli's Words!",
    descHe: 'למד מילים באנגלית',
    descEn: 'Learn English words',
    gradient: 'from-red-400 via-rose-400 to-pink-400',
    shadowColor: 'shadow-red-400/30',
    page: 'vocabulary',
  },
  {
    id: 'lessons',
    emoji: '🎯',
    titleHe: 'תרגול עם ספיקלי!',
    titleEn: 'Practice with Speakli!',
    descHe: 'משחקים ותרגילים',
    descEn: 'Games & exercises',
    gradient: 'from-indigo-400 via-blue-400 to-sky-400',
    shadowColor: 'shadow-indigo-400/30',
    page: 'lessons',
  },
  {
    id: 'pronunciation',
    emoji: '🎤',
    titleHe: 'דבר עם ספיקלי!',
    titleEn: 'Talk to Speakli!',
    descHe: 'תרגל דיבור באנגלית',
    descEn: 'Practice speaking',
    gradient: 'from-amber-400 via-orange-400 to-red-400',
    shadowColor: 'shadow-amber-400/30',
    page: 'pronunciation',
  },
  {
    id: 'reading',
    emoji: '📚',
    titleHe: 'הסיפורים של ספיקלי!',
    titleEn: "Speakli's Stories!",
    descHe: 'קרא ולמד מילים חדשות',
    descEn: 'Read & learn new words',
    gradient: 'from-cyan-400 via-sky-400 to-blue-400',
    shadowColor: 'shadow-cyan-400/30',
    page: 'reading',
  },
];

/* ── YouTube educational videos for kids ── */
const KIDS_VIDEOS = [
  {
    id: 'abc-song',
    videoId: 'hq3yfQnllfQ',
    titleHe: 'שיר ה-ABC',
    titleEn: 'ABC Song',
    descHe: 'למד את האותיות בשירה!',
    descEn: 'Learn the letters with a song!',
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

/* ── Speakli's Word of the day for kids ── */
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
        background: 'linear-gradient(135deg, #2563EB 0%, #0EA5E9 50%, #06B6D4 100%)',
        boxShadow: '0 8px 30px rgba(37, 99, 235, 0.3)',
      }}
    >
      {/* Sparkles */}
      <div className="absolute top-2 right-3 text-lg animate-sparkle">✨</div>
      <div className="absolute bottom-2 left-3 text-sm animate-sparkle" style={{ animationDelay: '0.5s' }}>⭐</div>
      {/* Mini Speakli avatar */}
      <div className="absolute top-1 left-2 opacity-40">
        <SpeakliAvatar mode="idle" size="xs" shadow={false} glow={false} />
      </div>

      <p className="text-xs font-bold text-white/70 uppercase tracking-wider mb-1">
        {uiLang === 'he' ? 'המילה של ספיקלי להיום' : "Speakli's Word of the Day"}
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

      <KidsIntro
        id="kids-home-v4"
        name={progress.displayName}
        emoji="🦉"
        title="Speakli is here!"
        titleHe="ספיקלי כאן!"
        desc="Hi! I'm Speakli! So glad you're here! Let's learn and play together!"
        descHe="הַיי! אֲנִי סְפִּיקְלִי! אֵיזֶה כֵּיף שֶׁבָּאתֶם! בּוֹאוּ נִלְמַד וְנִשְׂחַק בְּיַחַד!"
        uiLang={uiLang}
        gradient="from-blue-500 via-sky-500 to-cyan-500"
        buttonLabel="Let's go!"
        buttonLabelHe="יאללה, בואו!"
      />

      <div className="relative z-10 px-4 pt-4 space-y-5">
        {/* Mascot greeting */}
        <MascotGreeting name={progress.displayName} uiLang={uiLang} />

        {/* Stats bar */}
        <KidsStatsBar progress={progress} uiLang={uiLang} />

        {/* Level badge */}
        <LevelBadge childLevel={progress.curriculumLevel || progress.childLevel || 1} uiLang={uiLang} />

        {/* Progress bar for letters */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
              {uiLang === 'he' ? 'התקדמות אותיות' : 'Letter Progress'}
            </span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
              {lettersDone}/26 ⭐
            </span>
          </div>
          <div className="h-4 rounded-full bg-white/50 dark:bg-white/10 overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
              style={{
                width: `${(lettersDone / 26) * 100}%`,
                background: 'linear-gradient(90deg, #2563EB, #0EA5E9, #06B6D4, #10B981)',
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
            <SpeakliAvatar mode="bounce" size="xs" shadow={false} />
            {uiLang === 'he' ? 'בואו נשחק עם ספיקלי!' : "Let's Play with Speakli!"}
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
            {uiLang === 'he' ? 'הסרטונים של ספיקלי' : "Speakli's Videos"}
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
            background: 'linear-gradient(135deg, #2563EB 0%, #0EA5E9 50%, #06B6D4 100%)',
            boxShadow: '0 6px 20px rgba(37, 99, 235, 0.3)',
          }}
        >
          <div className="flex items-center gap-3">
            <SpeakliAvatar mode="idle" size="sm" shadow={false} glow={false} />
            <div className="text-left">
              <h3 className="text-white font-extrabold text-sm">
                {uiLang === 'he' ? 'הסיפורים של ספיקלי' : "Speakli's Stories"}
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
