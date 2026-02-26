import React from 'react';
import { useUserProgress } from '../../contexts/UserProgressContext.jsx';
import { useTheme } from '../../contexts/ThemeContext.jsx';

export default function LevelBadge({ size = 'md' }) {
  const { levelInfo } = useUserProgress();
  const { uiLang } = useTheme();

  const sizes = {
    sm: { outer: 'w-8 h-8', text: 'text-xs' },
    md: { outer: 'w-10 h-10', text: 'text-sm' },
    lg: { outer: 'w-14 h-14', text: 'text-lg' },
  };

  const s = sizes[size];

  return (
    <div className={`${s.outer} rounded-full bg-gradient-to-br from-brand-500 to-emerald-600 flex items-center justify-center badge-glow`}>
      <span className={`${s.text} font-bold text-white`}>{levelInfo.level}</span>
    </div>
  );
}
