import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { useUserProgress } from '../../contexts/UserProgressContext.jsx';
import { t } from '../../utils/translations.js';

export default function ChildModeBanner() {
  const { uiLang, dir } = useTheme();
  const { activeChild, switchToParent, isChildMode } = useUserProgress();

  if (!isChildMode || !activeChild) return null;

  return (
    <div className={`sticky top-0 z-40 bg-gradient-to-r ${activeChild.avatarColor} px-4 py-2 flex items-center justify-between shadow-md`}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{activeChild.avatar}</span>
        <span className="text-white font-semibold text-sm">
          {t('playingAs', uiLang)} {activeChild.name}
        </span>
      </div>
      <button
        onClick={switchToParent}
        className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium hover:bg-white/30 transition-colors"
      >
        <ArrowLeft size={14} className={dir === 'rtl' ? 'rotate-180' : ''} />
        {t('backToParent', uiLang)}
      </button>
    </div>
  );
}
