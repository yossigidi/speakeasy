import React from 'react';
import { Home, BookOpen, MessageCircle, BookA, User, CaseSensitive } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { useUserProgress } from '../../contexts/UserProgressContext.jsx';
import { t } from '../../utils/translations.js';

const adultTabs = [
  { id: 'home', icon: Home, labelKey: 'home' },
  { id: 'lessons', icon: BookOpen, labelKey: 'lessons' },
  { id: 'conversation', icon: MessageCircle, labelKey: 'chat' },
  { id: 'vocabulary', icon: BookA, labelKey: 'words' },
  { id: 'profile', icon: User, labelKey: 'profile' },
];

const kidsTabs = [
  { id: 'home', icon: Home, labelKey: 'home' },
  { id: 'alphabet', icon: CaseSensitive, labelKey: 'alphabet' },
  { id: 'vocabulary', icon: BookA, labelKey: 'words' },
  { id: 'profile', icon: User, labelKey: 'profile' },
];

export default function BottomNav({ currentPage, onNavigate, reviewCount = 0 }) {
  const { uiLang, isDark } = useTheme();
  const { progress, isChildMode } = useUserProgress();
  const tabs = (isChildMode && (!progress.curriculumLevel || progress.curriculumLevel <= 2)) ? kidsTabs : adultTabs;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: isDark ? 'rgba(17, 24, 39, 0.97)' : 'rgba(255, 255, 255, 0.97)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      <div className="rounded-none border-t border-gray-200/60 dark:border-white/5">
        <div className="flex justify-around items-center px-2 pt-2 pb-1">
          {tabs.map(({ id, icon: Icon, labelKey }) => {
            const active = currentPage === id;
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all duration-200 relative min-w-[56px] ${
                  active
                    ? 'text-brand-600 dark:text-brand-400'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                {active && (
                  <div className="absolute -top-1 w-8 h-1 rounded-full bg-brand-500" />
                )}
                <div className="relative">
                  <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                  {id === 'vocabulary' && reviewCount > 0 && (
                    <span className="absolute -top-1.5 ltr:-right-2.5 rtl:-left-2.5 min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full">
                      {reviewCount > 99 ? '99+' : reviewCount}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-medium ${active ? 'font-semibold' : ''}`}>
                  {t(labelKey, uiLang)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
