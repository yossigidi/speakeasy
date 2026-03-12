import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, Zap, Flame, BookOpen, BookA, TrendingUp, Brain, RefreshCw, Calendar, Target, Award, Volume2, Star, Lock, CheckCircle, Home, MapPin, Mic, Play, Pause } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useUserProgress } from '../contexts/UserProgressContext.jsx';
import { getLevelInfo, getLevelTitle } from '../utils/levelSystem.js';
import { t, tReplace } from '../utils/translations.js';
import GlassCard from '../components/shared/GlassCard.jsx';
import { playFromAPI } from '../utils/hebrewAudio.js';

// Simple SVG bar chart component
function BarChart({ data, label, color = '#6366f1', uiLang }) {
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  const barWidth = Math.min(32, Math.floor((100 - data.length) / data.length));

  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-1 h-32 px-1">
        {data.map((d, i) => {
          const height = Math.max(4, (d.value / max) * 100);
          return (
            <div key={i} className="flex flex-col items-center flex-1 min-w-0">
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1">
                {d.value > 0 ? d.value : ''}
              </span>
              <div
                className="w-full rounded-t-md transition-all duration-500"
                style={{
                  height: `${height}%`,
                  background: `linear-gradient(to top, ${color}, ${color}88)`,
                  minHeight: d.value > 0 ? '4px' : '2px',
                  opacity: d.value > 0 ? 1 : 0.2,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between gap-1 mt-1 px-1">
        {data.map((d, i) => (
          <span key={i} className="text-[9px] text-gray-400 dark:text-gray-500 text-center flex-1 min-w-0 truncate">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// Donut chart for activity breakdown
function DonutChart({ segments, size = 120 }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return null;

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className="mx-auto">
      <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" strokeWidth="12" className="text-gray-100 dark:text-gray-800" />
      {segments.filter(s => s.value > 0).map((seg, i) => {
        const pct = seg.value / total;
        const dash = pct * circumference;
        const gap = circumference - dash;
        const currentOffset = offset;
        offset += dash;
        return (
          <circle
            key={i}
            cx="60" cy="60" r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth="12"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-currentOffset}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
            className="transition-all duration-700"
          />
        );
      })}
      <text x="60" y="56" textAnchor="middle" className="fill-gray-700 dark:fill-gray-200 text-sm font-bold">{total}</text>
      <text x="60" y="72" textAnchor="middle" className="fill-gray-400 dark:fill-gray-500 text-[10px]">XP</text>
    </svg>
  );
}

// Stat card mini
function StatMini({ icon: Icon, label, value, color, iconColor }) {
  return (
    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/50 dark:bg-white/5">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={18} className={iconColor} />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{label}</p>
      </div>
    </div>
  );
}

// Horizontal skill bar
function SkillBar({ label, percent, color }) {
  const clamped = Math.min(100, Math.max(0, Math.round(percent)));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-xs font-bold" style={{ color }}>{clamped}%</span>
      </div>
      <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${clamped}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)` }}
        />
      </div>
    </div>
  );
}

// Milestone item
function MilestoneItem({ label, achieved, icon: Icon }) {
  return (
    <div className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${achieved ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-gray-50 dark:bg-white/5 opacity-60'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${achieved ? 'bg-emerald-100 dark:bg-emerald-800/40' : 'bg-gray-200 dark:bg-gray-700'}`}>
        {achieved
          ? <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400" />
          : <Lock size={14} className="text-gray-400 dark:text-gray-500" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${achieved ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>{label}</p>
      </div>
      {achieved && <Star size={14} className="text-yellow-500 flex-shrink-0" />}
    </div>
  );
}

export default function ChildProgressPage({ childId, onBack }) {
  const { uiLang, dir } = useTheme();
  const { user } = useAuth();
  const { children } = useUserProgress();
  const [dailyData, setDailyData] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [advice, setAdvice] = useState('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [timeRange, setTimeRange] = useState(7);
  const [recordings, setRecordings] = useState([]);
  const [playingRecording, setPlayingRecording] = useState(null);
  const audioRef = React.useRef(null);

  const child = useMemo(() => children.find(c => c.id === childId), [children, childId]);

  // Fetch daily activity data
  useEffect(() => {
    if (!childId || !window.firestore || !window.db) return;

    async function fetchActivity() {
      setLoadingActivity(true);
      try {
        const days = [];
        const now = new Date();
        for (let i = timeRange - 1; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          days.push(d.toISOString().split('T')[0]);
        }

        const results = await Promise.all(days.map(async (date) => {
          try {
            const ref = window.firestore.doc(window.db, 'childProfiles', childId, 'dailyActivity', date);
            const snap = await window.firestore.getDoc(ref);
            if (snap.exists()) {
              return { date, ...snap.data() };
            }
            return { date, xp: 0, minutes: 0, sources: {} };
          } catch {
            return { date, xp: 0, minutes: 0, sources: {} };
          }
        }));
        setDailyData(results);
      } catch (e) {
        console.error('Failed to fetch activity:', e);
      }
      setLoadingActivity(false);
    }

    fetchActivity();
  }, [childId, timeRange]);

  // Fetch recent recordings
  useEffect(() => {
    if (!childId || !window.firestore || !window.db) return;
    async function fetchRecordings() {
      try {
        const recRef = window.firestore.query(
          window.firestore.collection(window.db, 'childProfiles', childId, 'recordings'),
          window.firestore.orderBy('createdAt', 'desc'),
          window.firestore.firestoreLimit(10)
        );
        const snap = await window.firestore.getDocs(recRef);
        setRecordings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.warn('Failed to fetch recordings:', e);
      }
    }
    fetchRecordings();
  }, [childId]);

  const togglePlayRecording = (rec) => {
    if (playingRecording === rec.id) {
      audioRef.current?.pause();
      setPlayingRecording(null);
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(rec.audioUrl);
    audio.onended = () => setPlayingRecording(null);
    audio.play();
    audioRef.current = audio;
    setPlayingRecording(rec.id);
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    return dailyData.map(d => {
      const date = new Date(d.date);
      const dayNames = t('dayNamesShort', uiLang).split(',');
      const label = timeRange <= 7
        ? dayNames[date.getDay()]
        : `${date.getDate()}/${date.getMonth() + 1}`;
      return { label, value: d.xp || 0 };
    });
  }, [dailyData, uiLang, timeRange]);

  // Activity source breakdown
  const sourceBreakdown = useMemo(() => {
    const totals = {};
    dailyData.forEach(d => {
      if (d.sources) {
        Object.entries(d.sources).forEach(([src, val]) => {
          totals[src] = (totals[src] || 0) + val;
        });
      }
    });
    return totals;
  }, [dailyData]);

  const sourceColors = {
    lesson: '#6366f1',
    vocabulary: '#10b981',
    conversation: '#f59e0b',
    'kids-game': '#ec4899',
    pronunciation: '#8b5cf6',
    reading: '#06b6d4',
    unknown: '#94a3b8',
  };

  const sourceLabels = {
    lesson: t('lessons', uiLang),
    vocabulary: t('vocabulary', uiLang),
    conversation: t('conversations', uiLang),
    'kids-game': t('games', uiLang),
    pronunciation: t('pronunciation', uiLang),
    reading: t('reading', uiLang),
    unknown: t('other', uiLang),
  };

  const donutSegments = Object.entries(sourceBreakdown)
    .filter(([, val]) => val > 0)
    .map(([src, val]) => ({
      label: sourceLabels[src] || src,
      value: val,
      color: sourceColors[src] || sourceColors.unknown,
    }));

  // Total XP in period
  const periodXP = dailyData.reduce((s, d) => s + (d.xp || 0), 0);
  const activeDays = dailyData.filter(d => d.xp > 0).length;
  const avgDailyXP = activeDays > 0 ? Math.round(periodXP / activeDays) : 0;

  // Fetch AI advice
  const fetchAdvice = async () => {
    if (!child) return;
    setLoadingAdvice(true);
    setAdvice('');
    try {
      const res = await fetch('/api/child-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childName: child.name,
          age: child.age,
          stats: {
            level: child.level || 1,
            cefrLevel: child.cefrLevel || 'A1',
            curriculumLevel: child.curriculumLevel || child.childLevel || 1,
            xp: child.xp || 0,
            totalWordsLearned: child.totalWordsLearned || 0,
            totalLessonsCompleted: child.totalLessonsCompleted || 0,
            streak: child.streak || 0,
            longestStreak: child.longestStreak || 0,
            dailyXP: child.dailyXP || 0,
          },
          lang: uiLang,
        }),
      });
      const data = await res.json();
      setAdvice(data.advice || '');
    } catch (e) {
      console.error('Failed to get advice:', e);
      setAdvice(t('adviceLoadError', uiLang));
    }
    setLoadingAdvice(false);
  };

  // Skills map scores (memoized)
  const skillScores = useMemo(() => {
    if (!child) return { vocab: 0, pronunciation: 0, lessons: 0, consistency: 0 };
    const wordsCount = child.totalWordsLearned || 0;
    const vocab = Math.min(100, Math.round((wordsCount / 100) * 100));
    const pronunciation = Math.min(100, child.pronunciationHighScore || 0);
    const lessonsCount = child.totalLessonsCompleted || 0;
    const lessons = Math.min(100, Math.round((lessonsCount / 50) * 100));
    const streakVal = Math.max(child.streak || 0, child.longestStreak || 0);
    const consistency = Math.min(100, Math.round((streakVal / 30) * 100));
    return { vocab, pronunciation, lessons, consistency };
  }, [child]);

  // Recent words
  const recentWords = useMemo(() => {
    if (!child?.wordsLearned || !Array.isArray(child.wordsLearned)) return [];
    return child.wordsLearned.slice(-15).reverse();
  }, [child]);

  // Curriculum level progress
  const curriculumLevels = useMemo(() => {
    const currentLvl = child?.curriculumLevel || child?.childLevel || 1;
    const lessonData = child?.curriculum?.lessons || {};
    return [1, 2, 3, 4].map(lvl => {
      const completedLessons = lessonData[lvl]?.completed || 0;
      const totalLessons = lessonData[lvl]?.total || 10;
      const pct = lvl < currentLvl ? 100 : lvl === currentLvl ? Math.round((completedLessons / totalLessons) * 100) : 0;
      const status = lvl < currentLvl ? 'completed' : lvl === currentLvl ? 'inProgress' : 'locked';
      return { level: lvl, percent: pct, status };
    });
  }, [child]);

  // Milestones
  const milestoneList = useMemo(() => {
    if (!child) return [];
    const wordsCount = child.totalWordsLearned || 0;
    const lessonsCount = child.totalLessonsCompleted || 0;
    const streak = child.longestStreak || child.streak || 0;
    const hasPerfect = child.perfectLessons > 0 || child.hasPerfectLesson;
    return [
      { key: 'first10Words', achieved: wordsCount >= 10 },
      { key: 'first25Words', achieved: wordsCount >= 25 },
      { key: 'first50Words', achieved: wordsCount >= 50 },
      { key: 'firstLessonDone', achieved: lessonsCount >= 1 },
      { key: 'sevenDayStreak', achieved: streak >= 7 },
      { key: 'perfectLessonMilestone', achieved: !!hasPerfect },
    ];
  }, [child]);

  // Parent tips based on curriculum level
  const parentTipKeys = useMemo(() => {
    const lvl = child?.curriculumLevel || child?.childLevel || 1;
    const clampedLvl = Math.min(4, Math.max(1, lvl));
    return [
      `parentTipLevel${clampedLvl}_1`,
      `parentTipLevel${clampedLvl}_2`,
      `parentTipLevel${clampedLvl}_3`,
    ];
  }, [child]);

  if (!child) {
    return (
      <div className="pb-24 px-4 pt-2">
        <button onClick={onBack} aria-label="Back" className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
          <ChevronLeft size={22} className={dir === 'rtl' ? 'rotate-180' : ''} />
        </button>
        <p className="text-center text-gray-500 mt-8">{t('childNotFound', uiLang)}</p>
      </div>
    );
  }

  const levelInfo = getLevelInfo(child.xp || 0);

  return (
    <div className="pb-24 px-4 pt-2 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <button
          onClick={onBack}
          aria-label="Back"
          className="p-1.5 ltr:-ml-1.5 rtl:-mr-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <ChevronLeft size={22} className={dir === 'rtl' ? 'rotate-180' : ''} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('childProgress', uiLang)}
        </h1>
      </div>

      {/* Child Profile Header */}
      <GlassCard variant="strong" className="!p-4">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${child.avatarColor} flex items-center justify-center text-3xl shadow-lg flex-shrink-0`}>
            {child.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
              {child.name}
              {child.age && <span className="text-sm font-normal text-gray-400 mx-1">({child.age})</span>}
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-sm">
                <Award size={14} className="text-indigo-500" />
                {t('level', uiLang)} {levelInfo.level}
              </span>
              <span className="text-xs text-gray-400">
                {getLevelTitle(levelInfo.level, uiLang)}
              </span>
            </div>
            {/* Level progress bar */}
            <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${levelInfo.progressPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {levelInfo.xpInLevel}/{levelInfo.xpForNext} XP
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <StatMini
          icon={Zap}
          label={t('totalXP', uiLang)}
          value={child.xp || 0}
          color="bg-yellow-50 dark:bg-yellow-900/20"
          iconColor="text-yellow-500"
        />
        <StatMini
          icon={Flame}
          label={t('streak', uiLang)}
          value={`${child.streak || 0} ${t('days', uiLang)}`}
          color="bg-orange-50 dark:bg-orange-900/20"
          iconColor="text-orange-500"
        />
        <StatMini
          icon={BookA}
          label={t('wordsLearned', uiLang)}
          value={child.totalWordsLearned || 0}
          color="bg-green-50 dark:bg-green-900/20"
          iconColor="text-green-500"
        />
        <StatMini
          icon={BookOpen}
          label={t('lessonsCompleted', uiLang)}
          value={child.totalLessonsCompleted || 0}
          color="bg-blue-50 dark:bg-blue-900/20"
          iconColor="text-blue-500"
        />
      </div>

      {/* Skills Map */}
      <GlassCard variant="strong" className="!p-4">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
          <MapPin size={18} className="text-violet-500" />
          {t('skillsMap', uiLang)}
        </h3>
        <div className="space-y-3">
          <SkillBar label={t('vocabularySkill', uiLang)} percent={skillScores.vocab} color="#10b981" />
          <SkillBar label={t('pronunciationSkill', uiLang)} percent={skillScores.pronunciation} color="#8b5cf6" />
          <SkillBar label={t('lessonsSkill', uiLang)} percent={skillScores.lessons} color="#6366f1" />
          <SkillBar label={t('consistencySkill', uiLang)} percent={skillScores.consistency} color="#f59e0b" />
        </div>
      </GlassCard>

      {/* XP Chart */}
      <GlassCard variant="strong" className="!p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-500" />
            {t('xpOverTime', uiLang)}
          </h3>
          <div className="flex gap-1">
            {[7, 14, 30].map(days => (
              <button
                key={days}
                onClick={() => setTimeRange(days)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  timeRange === days
                    ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {days}{t('daySuffix', uiLang)}
              </button>
            ))}
          </div>
        </div>

        {loadingActivity ? (
          <div className="h-32 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : (
          <BarChart data={chartData} color="#6366f1" uiLang={uiLang} />
        )}

        {/* Period summary */}
        <div className="flex justify-around mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{periodXP}</p>
            <p className="text-[10px] text-gray-400">{t('totalXpPeriod', uiLang)}</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{activeDays}/{timeRange}</p>
            <p className="text-[10px] text-gray-400">{t('activeDays', uiLang)}</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{avgDailyXP}</p>
            <p className="text-[10px] text-gray-400">{t('avgDailyXp', uiLang)}</p>
          </div>
        </div>
      </GlassCard>

      {/* Recently Learned Words */}
      <GlassCard variant="strong" className="!p-4">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
          <BookA size={18} className="text-green-500" />
          {t('recentWords', uiLang)}
        </h3>
        {recentWords.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {recentWords.map((word, i) => {
              const wordText = typeof word === 'string' ? word : word?.word || word?.text || '';
              const emoji = typeof word === 'object' ? word?.emoji : null;
              return (
                <button
                  key={i}
                  onClick={() => playFromAPI(wordText, 'en')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors text-sm"
                  title={t('playWord', uiLang)}
                >
                  {emoji && <span>{emoji}</span>}
                  <span className="font-medium text-gray-800 dark:text-gray-200">{wordText}</span>
                  <Volume2 size={12} className="text-green-600 dark:text-green-400 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-3">
            {t('noWordsYet', uiLang)}
          </p>
        )}
      </GlassCard>

      {/* Recent Recordings */}
      {recordings.length > 0 && (
        <GlassCard variant="strong" className="!p-4">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
            <Mic size={18} className="text-violet-500" />
            {t('recentRecordings', uiLang)}
          </h3>
          <div className="space-y-2">
            {recordings.map(rec => (
              <div key={rec.id} className="flex items-center gap-3 p-3 rounded-xl bg-violet-50/60 dark:bg-violet-900/10">
                <button
                  onClick={() => togglePlayRecording(rec)}
                  className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-800/40 flex items-center justify-center flex-shrink-0 hover:bg-violet-200 dark:hover:bg-violet-800/60 transition-colors"
                >
                  {playingRecording === rec.id
                    ? <Pause size={16} className="text-violet-600 dark:text-violet-400" />
                    : <Play size={16} className="text-violet-600 dark:text-violet-400 ml-0.5" />
                  }
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{rec.word}</p>
                  <p className="text-[10px] text-gray-400">{rec.date ? new Date(rec.date).toLocaleDateString(uiLang === 'he' ? 'he-IL' : 'en-US') : ''}</p>
                </div>
                {rec.score != null && (
                  <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    rec.score >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : rec.score >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {rec.score}%
                  </div>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Activity Breakdown */}
      {donutSegments.length > 0 && (
        <GlassCard variant="strong" className="!p-4">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
            <Target size={18} className="text-pink-500" />
            {t('activityBreakdown', uiLang)}
          </h3>
          <div className="flex items-center gap-4">
            <DonutChart segments={donutSegments} />
            <div className="flex-1 space-y-1.5">
              {donutSegments.map((seg, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: seg.color }} />
                  <span className="text-xs text-gray-600 dark:text-gray-300 flex-1 truncate">{seg.label}</span>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{seg.value}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Curriculum / Level Progress */}
      <GlassCard variant="strong" className="!p-4">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
          <BookOpen size={18} className="text-blue-500" />
          {t('curriculumProgress', uiLang)}
        </h3>
        <div className="space-y-3">
          {curriculumLevels.map(({ level, percent, status }) => {
            const levelNames = [null, 'level1Name', 'level2Name', 'level3Name', 'level4Name'];
            const statusColors = {
              completed: 'text-emerald-600 dark:text-emerald-400',
              inProgress: 'text-indigo-600 dark:text-indigo-400',
              locked: 'text-gray-400 dark:text-gray-500',
            };
            const barColors = {
              completed: '#10b981',
              inProgress: '#6366f1',
              locked: '#9ca3af',
            };
            return (
              <div key={level} className={`${status === 'locked' ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {status === 'locked'
                      ? <Lock size={13} className="text-gray-400" />
                      : status === 'completed'
                        ? <CheckCircle size={13} className="text-emerald-500" />
                        : <Star size={13} className="text-indigo-500" />
                    }
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {t('worldLabel', uiLang)} {level} — {t(levelNames[level], uiLang)}
                    </span>
                  </div>
                  <span className={`text-xs font-bold ${statusColors[status]}`}>
                    {t(status, uiLang)}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${percent}%`, backgroundColor: barColors[status] }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Additional Stats */}
      <GlassCard variant="strong" className="!p-4">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
          <Calendar size={18} className="text-cyan-500" />
          {t('moreStats', uiLang)}
        </h3>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('longestStreak', uiLang)}</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1">
              <Flame size={14} className="text-orange-500" />
              {child.longestStreak || 0} {t('days', uiLang)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('currentLevel', uiLang)}</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {levelInfo.level} - {getLevelTitle(levelInfo.level, uiLang)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('level', uiLang)}</span>
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
              {child.curriculumLevel || child.childLevel || 1}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('lastActive', uiLang)}</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {child.lastActiveDate || t('notYetShort', uiLang)}
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Milestones */}
      <GlassCard variant="strong" className="!p-4">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
          <Award size={18} className="text-yellow-500" />
          {t('milestones', uiLang)}
        </h3>
        <div className="space-y-2">
          {milestoneList.map(({ key, achieved }) => (
            <MilestoneItem key={key} label={t(key, uiLang)} achieved={achieved} />
          ))}
        </div>
      </GlassCard>

      {/* AI Advice Section */}
      <GlassCard variant="strong" className="!p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Brain size={18} className="text-teal-500" />
            {t('aiAdvice', uiLang)}
          </h3>
          <button
            onClick={fetchAdvice}
            disabled={loadingAdvice}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 text-xs font-bold hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={loadingAdvice ? 'animate-spin' : ''} />
            {loadingAdvice
              ? t('loading', uiLang)
              : advice
                ? t('refresh', uiLang)
                : t('getAdvice', uiLang)
            }
          </button>
        </div>

        {advice ? (
          <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line" dir={dir}>
            {advice}
          </div>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
            {t('advicePrompt', uiLang)}
          </p>
        )}
      </GlassCard>

      {/* Parent Tips */}
      <GlassCard variant="strong" className="!p-4">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
          <Home size={18} className="text-amber-500" />
          {t('parentTips', uiLang)}
        </h3>
        <div className="space-y-2.5">
          {parentTipKeys.map((key, i) => (
            <div key={key} className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/60 dark:bg-amber-900/10">
              <span className="text-lg flex-shrink-0">{['1️⃣', '2️⃣', '3️⃣'][i]}</span>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{t(key, uiLang)}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
