import React from 'react';
import { Target } from 'lucide-react';
import { useUserProgress } from '../../contexts/UserProgressContext.jsx';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { t } from '../../utils/translations.js';

export default function DailyGoalRing({ size = 80 }) {
  const { progress } = useUserProgress();
  const { uiLang } = useTheme();

  const goalMinutes = progress.dailyGoalMinutes || 10;
  const currentMinutes = progress.dailyMinutes || 0;
  const percent = Math.min((currentMinutes / goalMinutes) * 100, 100);
  const isComplete = percent >= 100;

  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={6}
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#goalGradient)"
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="goalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={isComplete ? '#10b981' : '#14b8a6'} />
              <stop offset="100%" stopColor={isComplete ? '#06b6d4' : '#10b981'} />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isComplete ? (
            <span className="text-lg">✓</span>
          ) : (
            <Target size={size > 60 ? 20 : 16} className="text-brand-500" />
          )}
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
            {currentMinutes}/{goalMinutes}
          </span>
        </div>
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {t('dailyGoal', uiLang)}
      </span>
    </div>
  );
}
