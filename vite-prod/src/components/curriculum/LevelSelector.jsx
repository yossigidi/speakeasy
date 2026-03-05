import React, { useRef, useEffect } from 'react';
import { LEVEL_META } from '../../data/curriculum/curriculum-index.js';
import { t } from '../../utils/translations.js';

export default function LevelSelector({ selectedLevel, onSelect, unlockedLevels, uiLang }) {
  const scrollRef = useRef(null);
  const activeTabRef = useRef(null);

  // Auto-scroll to active tab on mount / change
  useEffect(() => {
    if (activeTabRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const tab = activeTabRef.current;
      const scrollLeft = tab.offsetLeft - container.offsetWidth / 2 + tab.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [selectedLevel]);

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-2 snap-x snap-mandatory"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {LEVEL_META.map((level) => {
        const isActive = level.id === selectedLevel;
        const isLocked = !unlockedLevels.includes(level.id);
        const levelName = level[t('nameHeField', uiLang)];

        return (
          <button
            key={level.id}
            ref={isActive ? activeTabRef : null}
            onClick={() => !isLocked && onSelect(level.id)}
            disabled={isLocked}
            className={`flex-shrink-0 snap-center flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
              isActive
                ? 'text-white shadow-md scale-105'
                : isLocked
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-sm hover:shadow-md active:scale-95'
            }`}
            style={{
              ...(isActive ? { background: level.color } : {}),
              ...(isActive ? { borderBottom: `3px solid ${level.color}` } : {}),
            }}
          >
            <span className="text-base">{isLocked ? '\u{1F512}' : level.emoji}</span>
            <span>{levelName}</span>
          </button>
        );
      })}
    </div>
  );
}
