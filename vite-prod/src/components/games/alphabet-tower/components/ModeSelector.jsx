import React, { useMemo } from 'react';
import { ArrowLeft, Lock, Star } from 'lucide-react';
import { GAME_MODES, DIFFICULTY_LEVELS, getNextReward, getUnlockedRewards } from '../data/alphabet-tower-data.js';

// ─── i18n helpers ───────────────────────────────────────────────────────────
const TITLE = { he: 'מגדל האותיות', ar: 'برج الحروف', ru: 'Башня алфавита', en: 'Alphabet Tower' };
const NEXT_REWARD_LABEL = { he: 'פרס הבא', ar: 'الجائزة التالية', ru: 'Следующая награда', en: 'Next reward' };
const STARS_MORE = { he: 'כוכבים נוספים!', ar: 'نجوم إضافية!', ru: 'звёзд ещё!', en: 'more stars!' };
const ALL_UNLOCKED = { he: 'כל הפרסים נפתחו!', ar: 'تم فتح جميع الجوائز!', ru: 'Все награды открыты!', en: 'All rewards unlocked!' };
const PICK_MODE = { he: 'בחרו משחק', ar: 'اختاروا لعبة', ru: 'Выберите игру', en: 'Pick a game' };
const COMING_SOON = { he: 'בקרוב!', ar: 'قريباً!', ru: 'Скоро!', en: 'Coming soon!' };
const PROGRESS_LABEL = { he: 'התקדמות', ar: 'تقدم', ru: 'Прогресс', en: 'Progress' };

const getLangKey = (lang) => {
  if (lang === 'he') return 'He';
  if (lang === 'ar') return 'Ar';
  if (lang === 'ru') return 'Ru';
  return 'En';
};

const getLabel = (obj, lang) => obj[`label${getLangKey(lang)}`] || obj.labelEn || '';
const getDesc = (obj, lang) => obj[`desc${getLangKey(lang)}`] || obj.descEn || '';
const getName = (obj, lang) => obj[`name${getLangKey(lang)}`] || obj.nameEn || '';

// Map mode id to background image
const MODE_BG = {
  alphabetOrder: '/images/games/bg-alphabet-order.jpg',
  missingLetter: '/images/games/bg-missing-letter.jpg',
  wordBuilder: '/images/games/bg-word-builder.jpg',
  fallingCubes: '/images/games/bg-falling-cubes.jpg',
  alphabetTrain: '/images/games/bg-alphabet-train.jpg',
  aiAdaptive: '/images/games/bg-ai-challenge.jpg',
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
    if (level.unlockStars > towerProgress.totalStars) return;
    setSelectedDifficulty(level.level);
    if (onSelectDifficulty) onSelectDifficulty(level.level);
  };

  const handleModeTap = (mode) => {
    onSelectMode(mode.id, selectedDifficulty);
  };

  const rewardProgressPct = nextReward
    ? Math.min(100, Math.round((towerProgress.totalStars / nextReward.stars) * 100))
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
        background: 'linear-gradient(180deg, #ecfdf5 0%, #f0f9ff 50%, #f5f3ff 100%)',
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
                  fontFamily: "'Fredoka', 'Heebo', sans-serif",
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
      <div style={{ fontSize: 18, fontWeight: 800, color: '#1e293b', marginBottom: 14, textAlign: 'center' }}>
        {PICK_MODE[lang] || PICK_MODE.en}
      </div>

      {/* ── Game mode cards — vertical panoramic list ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          marginBottom: 24,
        }}
      >
        {GAME_MODES.map((mode, idx) => {
          const timesPlayed = towerProgress.modesCompleted?.[mode.id] || 0;
          const bgImage = MODE_BG[mode.id];

          return (
            <button
              key={mode.id}
              onClick={() => handleModeTap(mode)}
              className="mode-card-wide"
              style={{
                position: 'relative',
                width: '100%',
                height: 120,
                borderRadius: 20,
                border: 'none',
                overflow: 'hidden',
                cursor: 'pointer',
                padding: 0,
                boxShadow: '0 4px 16px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)',
                transition: 'transform 0.15s, box-shadow 0.15s',
                animation: `card-slide-in 0.4s ease-out ${idx * 0.08}s both`,
              }}
            >
              {/* Background image */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: bgImage ? `url(${bgImage})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  zIndex: 0,
                }}
              />

              {/* Dark gradient overlay for text readability */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: isRTL
                    ? 'linear-gradient(to left, rgba(0,0,0,0.55) 30%, rgba(0,0,0,0.1) 100%)'
                    : 'linear-gradient(to right, rgba(0,0,0,0.55) 30%, rgba(0,0,0,0.1) 100%)',
                  zIndex: 1,
                }}
              />

              {/* Content */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                }}
              >
                {/* Left/start side: emoji icon area */}
                <div
                  style={{
                    width: 60,
                    height: 60,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 38,
                    lineHeight: 1,
                    flexShrink: 0,
                    filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))',
                  }}
                >
                  {mode.emoji}
                </div>

                {/* Center: text */}
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '0 12px',
                  }}
                >
                  <span
                    style={{
                      fontSize: 19,
                      fontWeight: 800,
                      color: '#fff',
                      textShadow: '0 2px 8px rgba(0,0,0,0.4)',
                      lineHeight: 1.2,
                      fontFamily: "'Fredoka', 'Heebo', sans-serif",
                    }}
                  >
                    {getName(mode, lang)}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.8)',
                      textShadow: '0 1px 4px rgba(0,0,0,0.3)',
                      marginTop: 4,
                      lineHeight: 1.3,
                    }}
                  >
                    {getDesc(mode, lang)}
                  </span>
                </div>

                {/* Right/end side: badge */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flexShrink: 0,
                    gap: 4,
                  }}
                >
                  {timesPlayed > 0 ? (
                    <>
                      {/* Progress circle */}
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 8px rgba(22,163,74,0.4)',
                          border: '3px solid rgba(255,255,255,0.5)',
                        }}
                      >
                        <span style={{ fontSize: 18, lineHeight: 1 }}>
                          {'⭐'}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: 'rgba(255,255,255,0.9)',
                          textShadow: '0 1px 4px rgba(0,0,0,0.4)',
                        }}
                      >
                        {PROGRESS_LABEL[lang]} x{timesPlayed}
                      </span>
                    </>
                  ) : (
                    /* Play indicator */
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.2)',
                        border: '2.5px solid rgba(255,255,255,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 20,
                          color: '#fff',
                          marginInlineStart: 2,
                          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
                        }}
                      >
                        ▶
                      </span>
                    </div>
                  )}
                </div>
              </div>
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

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                  {getName(nextReward, lang)}
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#f59e0b' }}>
                  {starsToNext} {STARS_MORE[lang]}
                </span>
              </div>
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
        .mode-card-wide:active {
          transform: scale(0.97) !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
        }
        @keyframes reward-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes card-slide-in {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
});

export default ModeSelector;
