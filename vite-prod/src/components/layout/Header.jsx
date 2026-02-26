import React from 'react';
import { Flame, Zap, ChevronLeft } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { useUserProgress } from '../../contexts/UserProgressContext.jsx';
import { t } from '../../utils/translations.js';

export default function Header({ title, showBack = false, onBack, showStats = true }) {
  const { uiLang, dir } = useTheme();
  const { progress, levelInfo, isChildMode, activeChild } = useUserProgress();

  return (
    <header className="sticky top-0 z-30 glass-card-strong rounded-none border-b border-white/20 dark:border-white/5">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Back button or title */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {showBack && (
            <button
              onClick={onBack}
              className="p-1.5 -ml-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <ChevronLeft size={22} className={dir === 'rtl' ? 'rotate-180' : ''} />
            </button>
          )}
          {title && (
            <h1 className="text-lg font-bold truncate text-gray-900 dark:text-white">
              {title}
            </h1>
          )}
        </div>

        {/* Right: Stats */}
        {showStats && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Child mode avatar indicator */}
            {isChildMode && activeChild && (
              <span className="text-lg" title={activeChild.name}>{activeChild.avatar}</span>
            )}
            {/* Streak */}
            <div className="flex items-center gap-1">
              <Flame
                size={18}
                className={progress.streak > 0 ? 'text-orange-500' : 'text-gray-300 dark:text-gray-600'}
                fill={progress.streak > 0 ? 'currentColor' : 'none'}
              />
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {progress.streak}
              </span>
            </div>

            {/* XP / Level */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                <Zap size={16} className="text-brand-500" fill="currentColor" />
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  {progress.xp}
                </span>
              </div>
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-emerald-600 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{levelInfo.level}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* XP progress bar */}
      {showStats && (
        <div className="px-4 pb-2">
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${levelInfo.progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </header>
  );
}
