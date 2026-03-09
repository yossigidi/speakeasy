import React, { useMemo } from 'react';
import { ArrowLeft, Lock, Star } from 'lucide-react';
import { GAME_MODES, DIFFICULTY_LEVELS, getNextReward, getUnlockedRewards } from '../data/alphabet-tower-data.js';

// ─── i18n helpers ───────────────────────────────────────────────────────────
const TITLE = { he: 'מגדל האותיות', ar: 'برج الحروف', ru: 'Башня алфавита', en: 'Alphabet Tower' };
const NEXT_REWARD_LABEL = { he: 'פרס הבא', ar: 'الجائزة التالية', ru: 'Следующая награда', en: 'Next reward' };
const STARS_MORE = { he: 'כוכבים נוספים!', ar: 'نجوم إضافية!', ru: 'звёзд ещё!', en: 'more stars!' };
const ALL_UNLOCKED = { he: 'כל הפרסים נפתחו!', ar: 'تم فتح جميع الجوائز!', ru: 'Все награды открыты!', en: 'All rewards unlocked!' };
const PICK_MODE = { he: 'בחרו משחק', ar: 'اختاروا لعبة', ru: 'Выберите игру', en: 'Pick a game' };

const getLangKey = (lang) => {
  if (lang === 'he') return 'He';
  if (lang === 'ar') return 'Ar';
  if (lang === 'ru') return 'Ru';
  return 'En';
};

const getLabel = (obj, lang) => obj[`label${getLangKey(lang)}`] || obj.labelEn || '';
const getDesc = (obj, lang) => obj[`desc${getLangKey(lang)}`] || obj.descEn || '';
const getName = (obj, lang) => obj[`name${getLangKey(lang)}`] || obj.nameEn || '';

const GRADIENT_MAP = {
  'from-blue-400 to-blue-600': 'linear-gradient(135deg, #60a5fa, #2563eb)',
  'from-purple-400 to-purple-600': 'linear-gradient(135deg, #c084fc, #9333ea)',
  'from-green-400 to-green-600': 'linear-gradient(135deg, #4ade80, #16a34a)',
  'from-orange-400 to-red-500': 'linear-gradient(135deg, #fb923c, #ef4444)',
  'from-teal-400 to-cyan-500': 'linear-gradient(135deg, #2dd4bf, #06b6d4)',
  'from-pink-400 to-rose-600': 'linear-gradient(135deg, #f472b6, #e11d48)',
};

const ModeSelector = React.memo(function ModeSelector({
  onSelectMode,
  onSelectDifficulty,
  onBack,
  progress,
  uiLang,
}) {
  const lang = uiLang || 'en';
  const isRTL = lang === 'he' || lang === 'ar';
  const towerProgress = progress?.alphabetTower || {
    totalStars: 0,
    modesCompleted: {},
    difficultyUnlocked: 1,
    letterStats: {},
    unlockedCharacters: [],
  };

  const [selectedDifficulty, setSelectedDifficulty] = React.useState(
    towerProgress.difficultyUnlocked || 1
  );

  const nextReward = useMemo(() => getNextReward(towerProgress.totalStars), [towerProgress.totalStars]);
  const starsToNext = nextReward ? nextReward.stars - towerProgress.totalStars : 0;

  const handleDifficultyTap = (level) => {
    if (level.unlockStars > towerProgress.totalStars) return; // locked
    setSelectedDifficulty(level.level);
    if (onSelectDifficulty) onSelectDifficulty(level.level);
  };

  const handleModeTap = (mode) => {
    onSelectMode(mode.id, selectedDifficulty);
  };

  // progress bar for next reward
  const rewardProgressPct = nextReward
    ? Math.min(100, Math.round(((towerProgress.totalStars) / nextReward.stars) * 100))
    : 100;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minHeight: '100%',
        padding: '16px 12px 24px',
        direction: isRTL ? 'rtl' : 'ltr',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        fontFamily: "'Fredoka', 'Heebo', 'Inter', sans-serif",
      }}
    >
      {/* ── Top bar: back + title + stars ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 16,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.85)',
            border: 'none',
            borderRadius: 12,
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            flexShrink: 0,
            transform: isRTL ? 'scaleX(-1)' : 'none',
          }}
          aria-label="Back"
        >
          <ArrowLeft size={22} color="#475569" />
        </button>

        <div style={{ flex: 1, fontSize: 22, fontWeight: 800, color: '#1e293b', textAlign: 'center' }}>
          {TITLE[lang] || TITLE.en}
        </div>

        {/* Star count */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
            borderRadius: 20,
            padding: '6px 14px',
            boxShadow: '0 2px 10px rgba(245,158,11,0.35)',
            flexShrink: 0,
          }}
        >
          <Star size={18} color="#fff" fill="#fff" />
          <span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>
            {towerProgress.totalStars}
          </span>
        </div>
      </div>

      {/* ── Difficulty selector ── */}
      <div
        style={{
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          marginBottom: 20,
          padding: '4px 0',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 10,
            minWidth: 'max-content',
            padding: '0 4px',
          }}
        >
          {DIFFICULTY_LEVELS.map((level) => {
            const isLocked = level.unlockStars > towerProgress.totalStars;
            const isSelected = selectedDifficulty === level.level;

            return (
              <button
                key={level.level}
                onClick={() => handleDifficultyTap(level)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '10px 18px',
                  borderRadius: 16,
                  border: isSelected
                    ? '2.5px solid #3b82f6'
                    : '2px solid transparent',
                  background: isLocked
                    ? 'rgba(148,163,184,0.15)'
                    : isSelected
                      ? 'rgba(59,130,246,0.1)'
                      : 'rgba(255,255,255,0.85)',
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  opacity: isLocked ? 0.55 : 1,
                  boxShadow: isSelected
                    ? '0 0 16px 3px rgba(59,130,246,0.3), 0 2px 8px rgba(0,0,0,0.08)'
                    : '0 2px 8px rgba(0,0,0,0.06)',
                  transition: 'all 0.2s',
                  minWidth: 80,
                  position: 'relative',
                }}
              >
                {isLocked && (
                  <Lock size={14} color="#94a3b8" style={{ position: 'absolute', top: 6, right: 6 }} />
                )}
                <span style={{ fontSize: 15, fontWeight: 800, color: isLocked ? '#94a3b8' : '#1e293b' }}>
                  {getLabel(level, lang)}
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, color: isLocked ? '#94a3b8' : '#64748b', marginTop: 2 }}>
                  {getDesc(level, lang)}
                </span>
                {isLocked && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', marginTop: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Star size={10} color="#94a3b8" /> {level.unlockStars}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Section label ── */}
      <div style={{ fontSize: 16, fontWeight: 700, color: '#64748b', marginBottom: 12, textAlign: 'center' }}>
        {PICK_MODE[lang] || PICK_MODE.en}
      </div>

      {/* ── Game mode cards — 2x3 grid ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 14,
          marginBottom: 24,
        }}
      >
        {GAME_MODES.map((mode) => {
          const gradient = GRADIENT_MAP[mode.gradient] || 'linear-gradient(135deg, #60a5fa, #3b82f6)';
          const timesPlayed = towerProgress.modesCompleted?.[mode.id] || 0;

          return (
            <button
              key={mode.id}
              onClick={() => handleModeTap(mode)}
              className="mode-card"
              style={{
                background: gradient,
                border: 'none',
                borderRadius: 20,
                padding: '20px 12px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.08)',
                transition: 'transform 0.15s, box-shadow 0.15s',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Subtle shine overlay */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '50%',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
                  borderRadius: '20px 20px 0 0',
                  pointerEvents: 'none',
                }}
              />

              {/* Emoji */}
              <span style={{ fontSize: 42, lineHeight: 1, marginBottom: 8 }}>
                {mode.emoji}
              </span>

              {/* Name */}
              <span style={{ fontSize: 15, fontWeight: 800, color: '#fff', textAlign: 'center', lineHeight: 1.2 }}>
                {getName(mode, lang)}
              </span>

              {/* Description */}
              <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 4, lineHeight: 1.3 }}>
                {getDesc(mode, lang)}
              </span>

              {/* Times played badge */}
              {timesPlayed > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: isRTL ? 'auto' : 8,
                    left: isRTL ? 8 : 'auto',
                    background: 'rgba(255,255,255,0.3)',
                    borderRadius: 10,
                    padding: '2px 7px',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#fff',
                  }}
                >
                  x{timesPlayed}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Next reward bar ── */}
      <div
        style={{
          background: 'rgba(255,255,255,0.9)',
          borderRadius: 18,
          padding: '14px 18px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        {nextReward ? (
          <>
            {/* Reward emoji */}
            <span
              style={{
                fontSize: 36,
                lineHeight: 1,
                animation: 'reward-bounce 2s ease-in-out infinite',
                flexShrink: 0,
              }}
            >
              {nextReward.emoji}
            </span>

            {/* Info + progress bar */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                  {getName(nextReward, lang)}
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#f59e0b' }}>
                  {starsToNext} {STARS_MORE[lang]}
                </span>
              </div>
              {/* Progress bar */}
              <div
                style={{
                  width: '100%',
                  height: 8,
                  background: '#e2e8f0',
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${rewardProgressPct}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                    borderRadius: 4,
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#16a34a' }}>
            {ALL_UNLOCKED[lang]}
          </div>
        )}
      </div>

      {/* ── Styles ── */}
      <style>{`
        .mode-card:active {
          transform: scale(0.95) !important;
          box-shadow: 0 3px 10px rgba(0,0,0,0.12) !important;
        }
        @keyframes reward-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
});

export default ModeSelector;
