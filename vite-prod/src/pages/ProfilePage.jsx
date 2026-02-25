import React from 'react';
import { Moon, Sun, Languages, LogOut, Trophy, BarChart3, Flame, Zap, BookOpen, BookA, Star, Users } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useUserProgress } from '../contexts/UserProgressContext.jsx';
import { t } from '../utils/translations.js';
import { getLevelTitle } from '../utils/levelSystem.js';
import GlassCard from '../components/shared/GlassCard.jsx';
import LevelBadge from '../components/gamification/LevelBadge.jsx';
import XPBar from '../components/gamification/XPBar.jsx';

export default function ProfilePage({ onNavigate }) {
  const { uiLang, toggleLang, isDark, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { progress, levelInfo, updateProgress, children: childrenList, isChildMode, activeChild } = useUserProgress();

  const stats = [
    { icon: Zap, label: t('totalXP', uiLang), value: progress.xp, color: 'text-brand-500' },
    { icon: BookA, label: t('wordsLearned', uiLang), value: progress.totalWordsLearned || 0, color: 'text-emerald-500' },
    { icon: BookOpen, label: t('lessonsCompleted', uiLang), value: progress.totalLessonsCompleted || 0, color: 'text-purple-500' },
    { icon: Flame, label: t('longestStreak', uiLang), value: `${progress.longestStreak || 0} ${t('days', uiLang)}`, color: 'text-orange-500' },
  ];

  return (
    <div className="pb-24 px-4 pt-4 space-y-4">
      {/* Profile Header */}
      <GlassCard variant="strong" className="text-center py-6">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            {isChildMode && activeChild ? (
              <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${activeChild.avatarColor} flex items-center justify-center text-4xl shadow-lg`}>
                {activeChild.avatar}
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-400 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                {(user?.displayName || user?.email || '?')[0].toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1">
              <LevelBadge size="sm" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {isChildMode && activeChild ? activeChild.name : (user?.displayName || user?.email?.split('@')[0] || 'User')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {getLevelTitle(levelInfo.level, uiLang)} · {progress.cefrLevel || 'A1'}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <XPBar />
        </div>
      </GlassCard>

      {/* Stats Grid */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
          {t('statistics', uiLang)}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {stats.map(({ icon: Icon, label, value, color }) => (
            <GlassCard key={label} className="!p-3">
              <Icon size={20} className={`${color} mb-1`} />
              <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Achievements Button */}
      <GlassCard className="cursor-pointer" onClick={() => onNavigate('achievements')}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Trophy size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 dark:text-white">{t('achievements', uiLang)}</h3>
            <p className="text-xs text-gray-500">{uiLang === 'he' ? 'צפה בהישגים שלך' : 'View your achievements'}</p>
          </div>
          <Star size={18} className="text-amber-500" fill="currentColor" />
        </div>
      </GlassCard>

      {/* My Family - hidden in child mode */}
      {!isChildMode && (
        <GlassCard className="cursor-pointer" onClick={() => onNavigate('family')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
              <Users size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white">{t('myFamily', uiLang)}</h3>
              <p className="text-xs text-gray-500">
                {childrenList.length} {t('children', uiLang)}
              </p>
            </div>
            <Star size={18} className="text-pink-500" fill="currentColor" />
          </div>
        </GlassCard>
      )}

      {/* Settings */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
          {t('settings', uiLang)}
        </h3>
        <div className="space-y-2">
          {/* Dark Mode */}
          <GlassCard className="!p-3 cursor-pointer" onClick={toggleTheme}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isDark ? <Moon size={20} className="text-indigo-400" /> : <Sun size={20} className="text-amber-500" />}
                <span className="font-medium text-gray-900 dark:text-white">{t('darkMode', uiLang)}</span>
              </div>
              <div className={`w-11 h-6 rounded-full transition-colors ${isDark ? 'bg-brand-500' : 'bg-gray-300'} relative`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isDark ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            </div>
          </GlassCard>

          {/* Language */}
          <GlassCard className="!p-3 cursor-pointer" onClick={toggleLang}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Languages size={20} className="text-brand-500" />
                <span className="font-medium text-gray-900 dark:text-white">{t('language', uiLang)}</span>
              </div>
              <span className="text-sm font-medium text-brand-600 dark:text-brand-400">
                {uiLang === 'he' ? 'עברית' : 'English'}
              </span>
            </div>
          </GlassCard>

          {/* Age Group / Mode */}
          <GlassCard
            className="!p-3 cursor-pointer"
            onClick={() => {
              const next = progress.ageGroup === 'kids' ? 'adults' : 'kids';
              updateProgress({ ageGroup: next });
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users size={20} className="text-pink-500" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {uiLang === 'he' ? 'מצב' : 'Mode'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400">
                {progress.ageGroup === 'kids'
                  ? (uiLang === 'he' ? 'ילדים' : 'Kids')
                  : (uiLang === 'he' ? 'מבוגרים' : 'Adults')}
              </span>
            </div>
          </GlassCard>

          {/* CEFR Level */}
          <GlassCard className="!p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 size={20} className="text-emerald-500" />
                <span className="font-medium text-gray-900 dark:text-white">{t('currentLevel', uiLang)}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                {progress.cefrLevel || 'A1'}
              </span>
            </div>
          </GlassCard>

          {/* Sign Out - hidden in child mode */}
          {!isChildMode && (
            <GlassCard className="!p-3 cursor-pointer" onClick={signOut}>
              <div className="flex items-center gap-3">
                <LogOut size={20} className="text-red-500" />
                <span className="font-medium text-red-600 dark:text-red-400">{t('signOut', uiLang)}</span>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
