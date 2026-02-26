import React from 'react';
import { Zap, Flame } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useUserProgress } from '../contexts/UserProgressContext.jsx';
import { t } from '../utils/translations.js';

export default function ProfilePickerPage({ onSelect }) {
  const { uiLang } = useTheme();
  const { user } = useAuth();
  const { children, switchToChild, switchToParent, progress } = useUserProgress();

  const handleParent = () => {
    switchToParent();
    onSelect();
  };

  const handleChild = (childId) => {
    switchToChild(childId);
    onSelect();
  };

  // Parent display info
  const parentName = user?.displayName || user?.email?.split('@')[0] || t('parentProfile', uiLang);
  const parentInitial = parentName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 flex flex-col items-center justify-center px-6 py-12">
      {/* Logo */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center mb-4 shadow-xl shadow-purple-500/20">
        <span className="text-2xl font-black text-white">SE</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {t('whoIsLearning', uiLang)}
      </h1>
      <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">Speakly</p>

      <div className="w-full max-w-sm space-y-3">
        {/* Parent Card */}
        <button
          onClick={handleParent}
          className="w-full flex items-center gap-4 p-4 rounded-2xl glass-card border-2 border-transparent hover:border-indigo-400 active:scale-[0.97] transition-all"
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg flex-shrink-0">
            {parentInitial}
          </div>
          <div className="flex-1 text-start min-w-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {parentName}
            </h3>
            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Zap size={14} className="text-indigo-500" />
                {progress.xp || 0} XP
              </span>
              <span className="flex items-center gap-1">
                <Flame size={14} className={progress.streak > 0 ? 'text-orange-500' : 'text-gray-400'} />
                {progress.streak || 0}
              </span>
              <span>{t('level', uiLang)} {progress.level || 1}</span>
            </div>
          </div>
        </button>

        {/* Children Cards */}
        {children.map(child => (
          <button
            key={child.id}
            onClick={() => handleChild(child.id)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl glass-card border-2 border-transparent hover:border-indigo-400 active:scale-[0.97] transition-all"
          >
            <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${child.avatarColor} flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}>
              {child.avatar}
            </div>
            <div className="flex-1 text-start min-w-0">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                {child.name}
                {child.age && (
                  <span className="text-sm font-normal text-gray-400 mr-1 ml-1">({child.age})</span>
                )}
              </h3>
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Zap size={14} className="text-brand-500" />
                  {child.xp || 0} XP
                </span>
                <span className="flex items-center gap-1">
                  <Flame size={14} className={child.streak > 0 ? 'text-orange-500' : 'text-gray-400'} />
                  {child.streak || 0}
                </span>
                <span>{t('level', uiLang)} {child.level || 1}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
