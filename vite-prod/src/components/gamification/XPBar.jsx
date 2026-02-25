import React from 'react';
import { Zap } from 'lucide-react';
import { useUserProgress } from '../../contexts/UserProgressContext.jsx';

export default function XPBar({ compact = false }) {
  const { levelInfo } = useUserProgress();

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Zap size={14} className="text-brand-500" fill="currentColor" />
        <div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-purple-500 transition-all duration-700"
            style={{ width: `${levelInfo.progressPercent}%` }}
          />
        </div>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {levelInfo.xpInLevel}/{levelInfo.xpForNext}
        </span>
      </div>
    );
  }

  return (
    <div className="glass-card-subtle p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
            <span className="text-xs font-bold text-white">{levelInfo.level}</span>
          </div>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            {levelInfo.title}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Zap size={14} className="text-brand-500" fill="currentColor" />
          <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
            {levelInfo.totalXP} XP
          </span>
        </div>
      </div>
      <div className="h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-purple-500 transition-all duration-700 ease-out"
          style={{ width: `${levelInfo.progressPercent}%` }}
        />
      </div>
      {!levelInfo.isMaxLevel && (
        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 text-center">
          {levelInfo.xpInLevel} / {levelInfo.xpForNext} XP
        </p>
      )}
    </div>
  );
}
