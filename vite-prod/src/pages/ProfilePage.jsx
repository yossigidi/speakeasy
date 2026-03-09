import React, { useState, useEffect } from 'react';
import { Moon, Sun, Languages, LogOut, Trash2, Trophy, BarChart3, Flame, Zap, BookOpen, BookA, Star, Users, Bell, BellOff, HelpCircle, Music, Volume2, Crown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useUserProgress } from '../contexts/UserProgressContext.jsx';
import { t, lf, SUPPORTED_LANGS, LANG_LABELS } from '../utils/translations.js';
import { getLevelTitle } from '../utils/levelSystem.js';
import { LEVEL_META } from '../data/curriculum/curriculum-index.js';
import { useMusic } from '../contexts/MusicContext.jsx';
import GlassCard from '../components/shared/GlassCard.jsx';
import LevelBadge from '../components/gamification/LevelBadge.jsx';
import XPBar from '../components/gamification/XPBar.jsx';
import useSubscription from '../hooks/useSubscription.js';

export default function ProfilePage({ onNavigate }) {
  const { uiLang, setLang, isDark, toggleTheme } = useTheme();
  const { user, signOut, deleteAccount } = useAuth();
  const { progress, levelInfo, updateProgress, children: childrenList, isChildMode, activeChild, deleteAllUserData } = useUserProgress();
  const { musicEnabled, soundsEnabled, toggleMusic, toggleSounds } = useMusic();
  const { plan: currentPlan, isPremium, status: subStatus } = useSubscription();

  const [pushEnabled, setPushEnabled] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const handleManageSubscription = async () => {
    if (!user) return;
    setPortalLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/customer-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error('Portal error:', err);
    } finally {
      setPortalLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await deleteAllUserData();
      await deleteAccount();
    } catch (err) {
      console.error('Delete account failed:', err);
      setDeleteLoading(false);
      setShowDeleteModal(false);
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
              {getLevelTitle(levelInfo?.level || 1, uiLang)} · {t('level', uiLang)} {progress.curriculumLevel || 1}
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
            <p className="text-xs text-gray-500">{t('viewAchievements', uiLang)}</p>
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
              <p className="text-xs text-gray-500">{t('helpCenterDesc', uiLang)}</p>
            </div>
            <Star size={18} className="text-teal-500" fill="currentColor" />
          </div>
        </GlassCard>
      )}

      {/* Subscription */}
      {(
        <GlassCard
          variant="strong"
          className="relative overflow-hidden cursor-pointer !bg-gradient-to-br from-purple-50/80 to-amber-50/80 dark:from-purple-950/30 dark:to-amber-950/30"
          onClick={() => isPremium ? handleManageSubscription() : onNavigate('pricing')}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-amber-500" />
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${isPremium ? 'from-amber-400 to-orange-500' : 'from-purple-500 to-indigo-600'} flex items-center justify-center`}>
              <Crown size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {isPremium ? t(currentPlan === 'family' ? 'familyPlan' : 'personalPlan', uiLang) : t('freePlan', uiLang)}
                </h3>
                {isPremium && (
                  <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full font-bold uppercase">
                    {t('active', uiLang)}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {isPremium ? t('manageSub', uiLang) : t('upgradeNow', uiLang)}
              </p>
            </div>
            {isPremium ? (
              portalLoading ? <span className="text-xs text-gray-400">...</span> : <Star size={18} className="text-amber-500" fill="currentColor" />
            ) : (
              <Star size={18} className="text-purple-500" fill="currentColor" />
            )}
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
          <GlassCard className="!p-3">
            <div className="flex items-center gap-3 mb-3">
              <Languages size={20} className="text-brand-500" />
              <span className="font-medium text-gray-900 dark:text-white">{t('language', uiLang)}</span>
            </div>
            <div className="flex gap-2">
              {SUPPORTED_LANGS.map(lang => {
                const isActive = uiLang === lang;
                return (
                  <button
                    key={lang}
                    onClick={() => setLang(lang)}
                    className={`flex-1 py-2 px-2 rounded-xl transition-all text-sm font-semibold ${
                      isActive
                        ? 'bg-brand-100 dark:bg-brand-900/40 ring-2 ring-brand-500 text-brand-700 dark:text-brand-300'
                        : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {LANG_LABELS[lang]}
                  </button>
                );
              })}
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
                      {lf(meta, 'name', uiLang)}
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

          {/* Delete Account - hidden in child mode */}
          {!isChildMode && (
            <GlassCard className="!p-3 cursor-pointer" onClick={() => setShowDeleteModal(true)}>
              <div className="flex items-center gap-3">
                <Trash2 size={20} className="text-red-500" />
                <span className="font-medium text-red-600 dark:text-red-400">{t('deleteAccount', uiLang)}</span>
              </div>
            </GlassCard>
          )}
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => !deleteLoading && setShowDeleteModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Trash2 size={24} className="text-red-500" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-center text-gray-900 dark:text-white mb-2">
              {t('deleteAccountConfirm', uiLang)}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
              {t('deleteAccountWarning', uiLang)}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium"
              >
                {t('cancel', uiLang)}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-medium disabled:opacity-50"
              >
                {deleteLoading ? t('deleting', uiLang) : t('deleteAccount', uiLang)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
