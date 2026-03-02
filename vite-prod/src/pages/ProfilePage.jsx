import React, { useState, useEffect } from 'react';
import { Moon, Sun, Languages, LogOut, Trophy, BarChart3, Flame, Zap, BookOpen, BookA, Star, Users, Bell, BellOff, HelpCircle, Music, Volume2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useUserProgress } from '../contexts/UserProgressContext.jsx';
import { t } from '../utils/translations.js';
import { getLevelTitle } from '../utils/levelSystem.js';
import { LEVEL_META } from '../data/curriculum/curriculum-index.js';
import { useMusic } from '../contexts/MusicContext.jsx';
import GlassCard from '../components/shared/GlassCard.jsx';
import LevelBadge from '../components/gamification/LevelBadge.jsx';
import XPBar from '../components/gamification/XPBar.jsx';

export default function ProfilePage({ onNavigate }) {
  const { uiLang, toggleLang, isDark, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { progress, levelInfo, updateProgress, children: childrenList, isChildMode, activeChild } = useUserProgress();
  const { musicEnabled, soundsEnabled, toggleMusic, toggleSounds } = useMusic();

  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready
        .then(reg => reg.pushManager.getSubscription())
        .then(sub => setPushEnabled(!!sub))
        .catch(() => {}); // Push not available
    }
  }, []);

  const togglePush = async () => {
    if (pushLoading) return; // Prevent double-click
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
      setPushLoading(true);
      const reg = await navigator.serviceWorker.ready;

      if (pushEnabled) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
          // Remove from Firestore
          if (user && window.firestore && window.db) {
            try {
              const subsRef = window.firestore.collection(window.db, 'push-subscriptions');
              const q = window.firestore.query(subsRef, window.firestore.where('userId', '==', user.uid));
              const snap = await window.firestore.getDocs(q);
              snap.forEach(doc => window.firestore.deleteDoc(doc.ref));
            } catch (err) {
              console.error('Failed to remove push subscription from Firestore:', err);
            }
          }
        }
        setPushEnabled(false);
      } else {
        if (Notification.permission === 'default') {
          const perm = await Notification.requestPermission();
          if (perm !== 'granted') return;
        }
        if (Notification.permission !== 'granted') return;

        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: window.VAPID_PUBLIC_KEY
        });
        setPushEnabled(true);

        if (user && window.firestore && window.db) {
          try {
            const subJson = sub.toJSON();
            await window.firestore.addDoc(
              window.firestore.collection(window.db, 'push-subscriptions'),
              {
                endpoint: subJson.endpoint,
                keys: { p256dh: subJson.keys.p256dh, auth: subJson.keys.auth },
                userId: user.uid,
                language: uiLang,
                createdAt: new Date(),
                userAgent: navigator.userAgent
              }
            );
          } catch (err) {
            console.error('Failed to save push subscription to Firestore:', err);
          }
        }
      }
    } catch (e) {
      console.error('Push toggle error:', e);
    } finally {
      setPushLoading(false);
    }
  };

  const stats = [
    { icon: Zap, label: t('totalXP', uiLang), value: progress.xp, color: 'text-brand-500' },
    { icon: BookA, label: t('wordsLearned', uiLang), value: progress.totalWordsLearned || 0, color: 'text-emerald-500' },
    { icon: BookOpen, label: t('lessonsCompleted', uiLang), value: progress.totalLessonsCompleted || 0, color: 'text-teal-500' },
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
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
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
              {getLevelTitle(levelInfo.level, uiLang)} · {uiLang === 'he' ? `רמה ${progress.curriculumLevel || 1}` : `Level ${progress.curriculumLevel || 1}`}
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
            <p className="text-xs text-gray-500">{uiLang === 'he' ? 'צפו בהישגים שלכם' : 'View your achievements'}</p>
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

      {/* Help Center */}
      {!isChildMode && (
        <GlassCard className="cursor-pointer" onClick={() => onNavigate('support')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
              <HelpCircle size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white">{t('helpCenter', uiLang)}</h3>
              <p className="text-xs text-gray-500">{uiLang === 'he' ? 'שאלות נפוצות, יצירת קשר ופניות' : 'FAQ, contact us & tickets'}</p>
            </div>
            <Star size={18} className="text-teal-500" fill="currentColor" />
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

          {/* Background Music */}
          <GlassCard className="!p-3 cursor-pointer" onClick={toggleMusic}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Music size={20} className="text-purple-500" />
                <span className="font-medium text-gray-900 dark:text-white">{t('backgroundMusic', uiLang)}</span>
              </div>
              <div className={`w-11 h-6 rounded-full transition-colors ${musicEnabled ? 'bg-purple-500' : 'bg-gray-300'} relative`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${musicEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            </div>
          </GlassCard>

          {/* Sound Effects */}
          <GlassCard className="!p-3 cursor-pointer" onClick={toggleSounds}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 size={20} className="text-emerald-500" />
                <span className="font-medium text-gray-900 dark:text-white">{t('soundEffects', uiLang)}</span>
              </div>
              <div className={`w-11 h-6 rounded-full transition-colors ${soundsEnabled ? 'bg-emerald-500' : 'bg-gray-300'} relative`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${soundsEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            </div>
          </GlassCard>

          {/* Push Notifications */}
          {'PushManager' in (typeof window !== 'undefined' ? window : {}) && (
            <GlassCard className="!p-3 cursor-pointer" onClick={togglePush}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {pushEnabled ? <Bell size={20} className="text-green-500" /> : <BellOff size={20} className="text-gray-400" />}
                  <span className="font-medium text-gray-900 dark:text-white">{t('notifications', uiLang)}</span>
                </div>
                <div className={`w-11 h-6 rounded-full transition-colors ${pushEnabled ? 'bg-green-500' : 'bg-gray-300'} relative`}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${pushEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
              </div>
            </GlassCard>
          )}

          {/* Curriculum Level Selector */}
          <GlassCard className="!p-3">
            <div className="flex items-center gap-3 mb-3">
              <BarChart3 size={20} className="text-emerald-500" />
              <span className="font-medium text-gray-900 dark:text-white">{t('currentLevel', uiLang)}</span>
            </div>
            <div className="flex gap-2">
              {LEVEL_META.map(meta => {
                const isActive = (progress.curriculumLevel || 1) === meta.id;
                return (
                  <button
                    key={meta.id}
                    onClick={() => updateProgress({
                      curriculumLevel: meta.id,
                      cefrLevel: ['A1', 'A2', 'B1', 'B2', 'C1'][meta.id - 1],
                    })}
                    className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all text-xs ${
                      isActive
                        ? 'bg-teal-100 dark:bg-teal-900/40 ring-2 ring-teal-500 font-bold'
                        : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="text-lg">{meta.emoji}</span>
                    <span className={isActive ? 'text-teal-700 dark:text-teal-300' : 'text-gray-500 dark:text-gray-400'}>
                      {uiLang === 'he' ? meta.nameHe : meta.name}
                    </span>
                  </button>
                );
              })}
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
