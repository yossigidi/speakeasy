import React from 'react';
import { X, Crown, Zap, Lock } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { t } from '../../utils/translations.js';
import { FREE_LIMITS, CONTENT_LIMITS } from '../../data/subscription-plans.js';

const FEATURE_LABELS = {
  speakingCoach: 'speakingCoach',
  lifeCoach: 'lifeCoach',
  simulation: 'conversation',
  pronunciation: 'pronunciation',
  generateLesson: 'lessons',
  generateStory: 'reading',
  adventure: 'adventure',
  englishQuest: 'englishQuest',
  // Content-gated features
  alphabet: 'alphabet',
  vocabulary: 'words',
  games: 'speakliGames',
  lessons: 'lessons',
  reading: 'reading',
  teacherTopics: 'teacherTime',
  talkingWorld: 'twTitle',
  questScenes: 'englishQuest',
  skills: 'skillsTitle',
  adventureWorlds: 'adventure',
  audioLearning: 'audioLearning',
};

export default function PaywallModal({ feature, onClose, onNavigate }) {
  const { uiLang } = useTheme();
  const limit = FREE_LIMITS[feature] ?? CONTENT_LIMITS[feature] ?? 0;
  const isContentGated = feature in CONTENT_LIMITS;
  const featureLabel = t(FEATURE_LABELS[feature] || feature, uiLang);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Decorative gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-amber-500/5 pointer-events-none" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <X size={20} className="text-gray-400" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
            {isContentGated ? <Lock size={32} className="text-white" /> : <Crown size={32} className="text-white" />}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
          {t(isContentGated ? 'premiumContent' : 'limitReached', uiLang)}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-2">
          {t('dailyLimitDesc', uiLang)}
        </p>

        {/* Usage pill */}
        {!isContentGated && (
          <div className="flex justify-center mb-5">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-semibold">
              <Zap size={16} />
              {limit}/{limit} · {featureLabel}
            </div>
          </div>
        )}

        {/* Benefits */}
        <div className="space-y-2 mb-6">
          {['unlimitedLessons', 'unlimitedKidsGames', 'unlimitedCoaching', 'allAdventureWorlds'].map(key => (
            <div key={key} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="text-green-500">✓</span>
              {t(key, uiLang)}
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => { onClose(); onNavigate('pricing'); }}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-base shadow-lg shadow-purple-500/25 active:scale-[0.98] transition-transform"
        >
          {t('upgradeNow', uiLang)}
        </button>

        {/* Dismiss */}
        <button
          onClick={onClose}
          className="w-full mt-2 py-2 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          {t('maybeLater', uiLang)}
        </button>
      </div>
    </div>
  );
}
