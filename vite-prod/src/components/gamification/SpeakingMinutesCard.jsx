import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useUserProgress } from '../../contexts/UserProgressContext.jsx';
import { t } from '../../utils/translations.js';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const GOAL_MINUTES = 5;

export default function SpeakingMinutesCard({ uiLang, onNavigate }) {
  const { user } = useAuth();
  const { progress, isChildMode, activeChildId } = useUserProgress();
  const [weekData, setWeekData] = useState([]);

  const today = new Date().toISOString().split('T')[0];
  const todayMinutes = progress.lastActiveDate === today ? (progress.dailyMinutes || 0) : 0;
  const todayPct = Math.min(100, Math.round((todayMinutes / GOAL_MINUTES) * 100));

  // Fetch last 7 days from dailyActivity
  useEffect(() => {
    if (!user?.uid || !window.firestore || !window.db) return;

    const fetchWeek = async () => {
      try {
        const days = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          days.push(d.toISOString().split('T')[0]);
        }

        const basePath = isChildMode && activeChildId
          ? ['childProfiles', activeChildId, 'dailyActivity']
          : ['users', user.uid, 'dailyActivity'];

        const results = await Promise.all(days.map(async (date) => {
          try {
            const ref = window.firestore.doc(window.db, ...basePath, date);
            const snap = await window.firestore.getDoc(ref);
            const data = snap.exists() ? snap.data() : {};
            return { date, minutes: data.minutes || 0 };
          } catch {
            return { date, minutes: 0 };
          }
        }));

        setWeekData(results);
      } catch (err) {
        console.warn('Failed to fetch weekly speaking data:', err);
      }
    };

    fetchWeek();
  }, [user, isChildMode, activeChildId, progress.dailyMinutes]);

  const maxMinutes = Math.max(GOAL_MINUTES, ...weekData.map(d => d.minutes));

  return (
    <div
      className="rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-transform"
      style={{
        background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 40%, #ec4899 100%)',
        boxShadow: '0 6px 20px rgba(124, 58, 237, 0.25)',
      }}
      onClick={() => onNavigate('life-coach')}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageCircle size={16} className="text-white/80" />
          <span className="text-sm font-bold text-white">{t('todaySpeaking', uiLang)}</span>
        </div>
        <span className="text-xs text-white/70 font-semibold">
          {todayPct >= 100 ? t('goalReached', uiLang) : t('startSpeaking', uiLang)}
        </span>
      </div>

      {/* Today progress */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 h-3 rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full rounded-full bg-white transition-all duration-700"
            style={{ width: `${todayPct}%` }}
          />
        </div>
        <span className="text-sm font-bold text-white whitespace-nowrap">
          {Math.round(todayMinutes * 10) / 10} / {GOAL_MINUTES} min
        </span>
      </div>

      {/* Weekly bar chart */}
      {weekData.length > 0 && (
        <div className="flex items-end justify-between gap-1 h-10">
          {weekData.map((day, i) => {
            const dayOfWeek = new Date(day.date + 'T12:00:00').getDay();
            const barHeight = maxMinutes > 0 ? Math.max(4, (day.minutes / maxMinutes) * 100) : 4;
            const isToday = i === weekData.length - 1;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center" style={{ height: '28px' }}>
                  <div
                    className={`w-full max-w-[16px] rounded-sm transition-all duration-500 ${
                      isToday ? 'bg-white' : day.minutes > 0 ? 'bg-white/60' : 'bg-white/20'
                    }`}
                    style={{ height: `${barHeight}%` }}
                  />
                </div>
                <span className={`text-[9px] font-bold ${isToday ? 'text-white' : 'text-white/50'}`}>
                  {DAY_LABELS[dayOfWeek]}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
