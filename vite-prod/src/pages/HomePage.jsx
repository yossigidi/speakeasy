import React, { useMemo } from 'react';
import { BookOpen, MessageCircle, BookA, Mic, ChevronRight, Clock, Volume2, Lightbulb, GraduationCap, Headphones } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useUserProgress } from '../contexts/UserProgressContext.jsx';
import { useSpeech } from '../contexts/SpeechContext.jsx';
import { t } from '../utils/translations.js';
import GlassCard from '../components/shared/GlassCard.jsx';
import StreakDisplay from '../components/gamification/StreakDisplay.jsx';
import XPBar from '../components/gamification/XPBar.jsx';
import DailyGoalRing from '../components/gamification/DailyGoalRing.jsx';

import wordsA1 from '../data/words-a1.json';
import wordsA2 from '../data/words-a2.json';
import grammarRules from '../data/grammar-rules.json';

const ALL_WORDS = [...wordsA1, ...wordsA2];

export default function HomePage({ onNavigate, reviewCount = 0 }) {
  const { uiLang, dir } = useTheme();
  const { progress } = useUserProgress();
  const { speak } = useSpeech();

  // Word of the Day - deterministic based on date
  const wordOfDay = useMemo(() => {
    const today = new Date();
    const dayIndex = (today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate()) % ALL_WORDS.length;
    return ALL_WORDS[dayIndex];
  }, []);

  // Grammar tip of the day
  const grammarTip = useMemo(() => {
    const today = new Date();
    const tipIndex = (today.getDate() + today.getMonth()) % grammarRules.length;
    return grammarRules[tipIndex];
  }, []);

  const quickAccess = [
    { id: 'lessons', icon: BookOpen, label: t('lessons', uiLang), color: 'from-blue-500 to-indigo-600', page: 'lessons' },
    { id: 'conversation', icon: MessageCircle, label: t('chat', uiLang), color: 'from-purple-500 to-pink-600', page: 'conversation' },
    { id: 'vocabulary', icon: BookA, label: t('words', uiLang), color: 'from-emerald-500 to-teal-600', page: 'vocabulary' },
    { id: 'pronunciation', icon: Mic, label: t('pronunciation', uiLang), color: 'from-orange-500 to-red-600', page: 'pronunciation' },
  ];

  return (
    <div className="pb-24 px-4 pt-4 space-y-4 stagger-children">
      {/* Welcome + Streak Row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('welcomeBack', uiLang)}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {progress.displayName || ''}
          </p>
        </div>
        <DailyGoalRing size={64} />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3">
        <StreakDisplay />
        <XPBar />
      </div>

      {/* Kids Alphabet Card - shown for kids curriculum level */}
      {(!progress.curriculumLevel || progress.curriculumLevel <= 2) && (
        <GlassCard
          variant="strong"
          className="relative overflow-hidden cursor-pointer !bg-gradient-to-br from-pink-50/80 to-purple-50/80 dark:from-pink-950/30 dark:to-purple-950/30"
          onClick={() => onNavigate('alphabet')}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-pink-500/10 to-transparent rounded-bl-full" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/25 text-2xl">
                🔤
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {uiLang === 'he' ? 'למד אותיות!' : 'Learn Letters!'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {(progress.lettersCompleted || []).length}/26 {uiLang === 'he' ? 'אותיות' : 'letters'} ⭐
                </p>
              </div>
            </div>
            <ChevronRight size={20} className={`text-gray-400 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
          </div>
        </GlassCard>
      )}

      {/* Audio Learning Card - shown for higher levels */}
      {progress.curriculumLevel && progress.curriculumLevel > 2 && (
        <GlassCard
          variant="strong"
          className="relative overflow-hidden cursor-pointer !bg-gradient-to-br from-violet-50/80 to-indigo-50/80 dark:from-violet-950/30 dark:to-indigo-950/30"
          onClick={() => onNavigate('audio-learn')}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-500/10 to-transparent rounded-bl-full" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Headphones size={22} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {uiLang === 'he' ? 'למידה בשמיעה' : 'Audio Learning'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {uiLang === 'he' ? 'למד בזמן נהיגה' : 'Learn while driving'}
                </p>
              </div>
            </div>
            <ChevronRight size={20} className={`text-gray-400 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
          </div>
        </GlassCard>
      )}

      {/* Continue Lesson Card */}
      <GlassCard
        variant="strong"
        className="relative overflow-hidden cursor-pointer"
        onClick={() => onNavigate('lessons')}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-brand-500/10 to-transparent rounded-bl-full" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-brand-500/25">
              <BookOpen size={22} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                {t('continueLesson', uiLang)}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('unit', uiLang)} 1 - {t('lesson', uiLang)} 1
              </p>
            </div>
          </div>
          <ChevronRight size={20} className={`text-gray-400 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
        </div>
      </GlassCard>

      {/* Words to Review */}
      {reviewCount > 0 && (
        <GlassCard
          className="cursor-pointer border-l-4 border-amber-500"
          onClick={() => onNavigate('vocabulary')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock size={20} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t('wordsToReview', uiLang)}
                </h3>
                <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                  {reviewCount} {t('wordCount', uiLang)}
                </p>
              </div>
            </div>
            <ChevronRight size={20} className={`text-gray-400 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
          </div>
        </GlassCard>
      )}

      {/* Quick Access Grid */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
          {uiLang === 'he' ? 'גישה מהירה' : 'Quick Access'}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {quickAccess.map(({ id, icon: Icon, label, color, page }) => (
            <GlassCard
              key={id}
              className="!p-3 cursor-pointer"
              onClick={() => onNavigate(page)}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-2 shadow-lg`}>
                <Icon size={20} className="text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{label}</span>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Word of the Day */}
      {wordOfDay && (
        <GlassCard variant="strong" className="!bg-gradient-to-br from-brand-50/80 to-emerald-50/80 dark:from-brand-950/30 dark:to-emerald-950/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-400 via-emerald-400 to-teal-400" />
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">✨</span>
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              {uiLang === 'he' ? 'מילה של היום' : 'Word of the Day'}
            </h3>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{wordOfDay.word}</h4>
                <button
                  onClick={() => speak(wordOfDay.word)}
                  className="p-1.5 rounded-full hover:bg-brand-100 dark:hover:bg-brand-900/30"
                >
                  <Volume2 size={16} className="text-brand-500" />
                </button>
              </div>
              <p className="text-sm text-gray-400 font-mono mb-1">{wordOfDay.ipa}</p>
              <p className="text-base font-semibold text-brand-600 dark:text-brand-400">{wordOfDay.translation}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{wordOfDay.definition}</p>
              {wordOfDay.examples?.[0] && (
                <p className="text-xs text-gray-400 italic mt-1">"{wordOfDay.examples[0]}"</p>
              )}
            </div>
            <button
              onClick={() => onNavigate('vocabulary')}
              className="shrink-0 ml-3 px-3 py-2 rounded-xl bg-brand-500 text-white text-xs font-semibold hover:bg-brand-600 transition-colors"
            >
              {uiLang === 'he' ? 'למד עוד' : 'Learn More'}
            </button>
          </div>
        </GlassCard>
      )}

      {/* Grammar Tip */}
      {grammarTip && (
        <GlassCard className="border-l-4 border-amber-400">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
              <Lightbulb size={20} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                {uiLang === 'he' ? grammarTip.titleHe : grammarTip.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400" dir={uiLang === 'he' ? 'rtl' : 'ltr'}>
                {uiLang === 'he' ? grammarTip.explanationHe : grammarTip.explanation}
              </p>
              <p className="text-xs text-brand-500 font-mono mt-1">{grammarTip.rule}</p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Reading Card */}
      <GlassCard
        className="cursor-pointer"
        onClick={() => onNavigate('reading')}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">📖</span>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">
              {t('reading', uiLang)}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {uiLang === 'he' ? 'קרא סיפורים ושפר את האנגלית' : 'Read stories and improve your English'}
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
