import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { t } from '../utils/translations.js';
import GlassCard from '../components/shared/GlassCard.jsx';
import achievementsData from '../data/achievements.json';

const CATEGORIES = ['all', 'streaks', 'vocabulary', 'lessons', 'conversations', 'pronunciation', 'milestones'];
const CATEGORY_LABELS = {
  all: { en: 'All', he: 'הכל' },
  streaks: { en: 'Streaks', he: 'רצפים' },
  vocabulary: { en: 'Vocabulary', he: 'אוצר מילים' },
  lessons: { en: 'Lessons', he: 'שיעורים' },
  conversations: { en: 'Conversations', he: 'שיחות' },
  pronunciation: { en: 'Pronunciation', he: 'הגייה' },
  milestones: { en: 'Milestones', he: 'אבני דרך' },
};

export default function AchievementsPage({ onBack }) {
  const { uiLang } = useTheme();
  const { user } = useAuth();
  const [unlockedIds, setUnlockedIds] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user) return;
    const ref = window.firestore.collection(window.db, 'users', user.uid, 'achievements');
    const unsub = window.firestore.onSnapshot(ref, (snap) => {
      setUnlockedIds(snap.docs.map(d => d.id));
    });
    return unsub;
  }, [user]);

  const filtered = filter === 'all' ? achievementsData : achievementsData.filter(a => a.category === filter);
  const unlockedCount = achievementsData.filter(a => unlockedIds.includes(a.id)).length;

  return (
    <div className="pb-24 px-4 pt-4 space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('achievements', uiLang)}</h2>
        <span className="ml-auto text-sm text-gray-500">{unlockedCount}/{achievementsData.length}</span>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              filter === cat
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            {CATEGORY_LABELS[cat]?.[uiLang] || cat}
          </button>
        ))}
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map(achievement => {
          const unlocked = unlockedIds.includes(achievement.id);
          return (
            <GlassCard
              key={achievement.id}
              className={`!p-3 text-center ${!unlocked ? 'opacity-50 grayscale' : ''}`}
            >
              <div className="text-3xl mb-2">{unlocked ? achievement.icon : '🔒'}</div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {uiLang === 'he' ? achievement.titleHe : achievement.title}
              </h4>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                {uiLang === 'he' ? achievement.descriptionHe : achievement.description}
              </p>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
