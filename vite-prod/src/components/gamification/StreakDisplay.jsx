import React from 'react';
import { Flame } from 'lucide-react';
import { useUserProgress } from '../../contexts/UserProgressContext.jsx';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { t } from '../../utils/translations.js';

export default function StreakDisplay({ compact = false }) {
  const { progress } = useUserProgress();
  const { uiLang } = useTheme();
  const streak = progress.streak || 0;

  const flameSize = streak >= 365 ? 32 : streak >= 100 ? 28 : streak >= 30 ? 24 : streak >= 7 ? 22 : 20;

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <Flame
          size={18}
          className={streak > 0 ? 'text-orange-500' : 'text-gray-300 dark:text-gray-600'}
          fill={streak > 0 ? 'currentColor' : 'none'}
        />
        <span className="text-sm font-bold">{streak}</span>
      </div>
    );
  }

  return (
    <div className="glass-card-subtle p-3 flex items-center gap-3">
      <div className={`relative ${streak > 0 ? 'streak-fire' : ''}`}>
        <Flame
          size={flameSize}
          className={streak > 0 ? 'text-orange-500' : 'text-gray-300 dark:text-gray-600'}
          fill={streak > 0 ? 'currentColor' : 'none'}
        />
        {streak >= 7 && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center">
            <span className="text-[8px] font-bold text-white">{streak >= 100 ? '🔥' : ''}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-lg font-bold text-gray-900 dark:text-white">
          {streak} {streak === 1 ? t('day', uiLang) : t('days', uiLang)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('streak', uiLang)}</p>
      </div>
    </div>
  );
}
