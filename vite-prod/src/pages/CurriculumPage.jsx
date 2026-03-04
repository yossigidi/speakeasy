import React, { useState, useCallback, useEffect, useRef } from 'react';
import LevelSelector from '../components/curriculum/LevelSelector.jsx';
import UnitIsland from '../components/curriculum/UnitIsland.jsx';
import CurriculumLessonRunner from '../components/curriculum/CurriculumLessonRunner.jsx';
import useCurriculumProgress from '../hooks/useCurriculumProgress.js';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useUserProgress } from '../contexts/UserProgressContext.jsx';
import { t } from '../utils/translations.js';
import { getLevel, LEVEL_META, LESSON_TYPES } from '../data/curriculum/curriculum-index.js';
import KidsIntro from '../components/kids/KidsIntro.jsx';
import { stopAllAudio } from '../utils/hebrewAudio.js';

export default function CurriculumPage({ onBack }) {
  const { uiLang } = useTheme();
  const { progress } = useUserProgress();
  const {
    curriculum,
    isLessonUnlocked,
    getLessonResult,
    getUnitProgress,
  } = useCurriculumProgress();

  const [selectedLevel, setSelectedLevel] = useState(curriculum.currentLevel || 1);
  const [activeLesson, setActiveLesson] = useState(null);
  const [selectedLessonInfo, setSelectedLessonInfo] = useState(null); // for bottom sheet
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const bottomSheetRef = useRef(null);

  // Clean up audio on unmount
  useEffect(() => {
    return () => stopAllAudio();
  }, []);

  const unlockedLevels = curriculum.unlockedLevels || [1];
  const totalStars = curriculum.totalStars || 0;

  const levelData = getLevel(selectedLevel);
  const levelMeta = LEVEL_META.find(l => l.id === selectedLevel) || LEVEL_META[0];

  // Find current (next) lesson to do
  const findCurrentLessonId = useCallback(() => {
    if (!levelData) return null;
    for (const unit of levelData.units) {
      for (const lesson of unit.lessons) {
        const result = getLessonResult(lesson.id);
        if (!result?.completed && isLessonUnlocked(lesson.id, selectedLevel)) {
          return lesson.id;
        }
      }
    }
    return null;
  }, [levelData, selectedLevel, getLessonResult, isLessonUnlocked]);

  const currentLessonId = findCurrentLessonId();

  // Handle lesson tap from UnitIsland
  const handleLessonTap = useCallback((lesson) => {
    const result = getLessonResult(lesson.id);
    const typeInfo = LESSON_TYPES[lesson.type] || LESSON_TYPES.mixed;
    setSelectedLessonInfo({
      lesson,
      typeInfo,
      result,
    });
    setShowBottomSheet(true);
  }, [getLessonResult]);

  // Start lesson
  const handleStartLesson = useCallback(() => {
    if (!selectedLessonInfo) return;
    setShowBottomSheet(false);
    setActiveLesson(selectedLessonInfo.lesson.id);
    setSelectedLessonInfo(null);
  }, [selectedLessonInfo]);

  // Lesson complete
  const handleLessonComplete = useCallback((result) => {
    setActiveLesson(null);
  }, []);

  // Lesson back
  const handleLessonBack = useCallback(() => {
    setActiveLesson(null);
  }, []);

  // Close bottom sheet
  const handleCloseSheet = useCallback(() => {
    setShowBottomSheet(false);
    setSelectedLessonInfo(null);
  }, []);

  // Bottom sheet closes via backdrop onClick (no document listener needed)

  // ── Full-screen Lesson Runner ──
  if (activeLesson) {
    return (
      <CurriculumLessonRunner
        lessonId={activeLesson}
        onComplete={handleLessonComplete}
        onBack={handleLessonBack}
        uiLang={uiLang}
      />
    );
  }

  // ── Map View ──
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #FFF8F0 0%, #FFE8D6 100%)',
    }}>
      <KidsIntro
        id="curriculum-v3"
        name={progress.displayName}
        emoji="📚"
        title="Speakli's Lessons!"
        titleHe="השיעורים של ספיקלי!"
        desc="Follow Speakli's path and complete lessons to earn stars!"
        descHe="עקבו אחרי המסלול של ספיקלי והשלימו שיעורים כדי לצבור כוכבים!"
        uiLang={uiLang}
        gradient="from-blue-500 via-sky-500 to-cyan-500"
        buttonLabel="Let's learn with Speakli!"
        buttonLabelHe="בואו נלמד עם ספיקלי!"
      />

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '16px 16px 12px',
        background: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        position: 'sticky', top: 0, zIndex: 20,
      }}>
        {/* Back button */}
        <button
          onClick={onBack}
          style={{
            width: 38, height: 38, borderRadius: '50%', border: 'none',
            background: '#F3F4F6', fontSize: 18, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#6B7280', flexShrink: 0,
          }}
        >
          {uiLang === 'he' ? '\u2192' : '\u2190'}
        </button>

        {/* Title */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#374151' }}>
            {uiLang === 'he' ? '\u05EA\u05D5\u05DB\u05E0\u05D9\u05EA \u05DC\u05D9\u05DE\u05D5\u05D3' : 'Curriculum'}
          </div>
        </div>

        {/* Total stars badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
          padding: '6px 14px', borderRadius: 20,
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
        }}>
          <span style={{ fontSize: 16 }}>{'\u2B50'}</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#92400E' }}>{totalStars}</span>
        </div>
      </div>

      {/* Level Selector */}
      <div style={{ background: 'white', paddingBottom: 8 }}>
        <LevelSelector
          selectedLevel={selectedLevel}
          onSelect={setSelectedLevel}
          unlockedLevels={unlockedLevels}
          uiLang={uiLang}
        />
      </div>

      {/* Map / scrollable area */}
      <div style={{ padding: '16px 16px 100px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {levelData ? levelData.units.map((unit, idx) => {
          const unitProgress = getUnitProgress(unit.id);
          const isUnitUnlocked = idx === 0 || (idx > 0 && getUnitProgress(levelData.units[idx - 1].id).isComplete);

          return (
            <UnitIsland
              key={unit.id}
              unit={unit}
              unitProgress={unitProgress}
              curriculum={curriculum}
              levelColor={levelMeta.color}
              isUnlocked={isUnitUnlocked}
              onLessonTap={handleLessonTap}
              uiLang={uiLang}
              isLessonUnlocked={(lessonId) => isLessonUnlocked(lessonId, selectedLevel)}
              getLessonResult={getLessonResult}
              currentLessonId={currentLessonId}
            />
          );
        }) : (
          <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>
            {t('loading', uiLang)}
          </div>
        )}
      </div>

      {/* Bottom Sheet / Modal for lesson info */}
      {showBottomSheet && selectedLessonInfo && (
        <>
          {/* Backdrop */}
          <div
            onClick={handleCloseSheet}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
              zIndex: 50, animation: 'curriculum-fade-in 0.2s ease',
            }}
          />

          {/* Top-aligned Modal */}
          <div
            ref={bottomSheetRef}
            style={{
              position: 'fixed',
              top: 'calc(env(safe-area-inset-top, 0px) + 72px)',
              left: 0, right: 0,
              width: 'calc(100% - 48px)', maxWidth: 360,
              margin: '0 auto',
              background: 'white', borderRadius: 24,
              padding: '24px', zIndex: 51,
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              animation: 'curriculum-pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            {/* Start button — first so it's always visible */}
            <button
              onClick={handleStartLesson}
              style={{
                width: '100%', padding: '16px 24px', borderRadius: 18,
                fontSize: 20, fontWeight: 800,
                background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
                color: 'white', border: 'none', cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(255,107,107,0.35), 0 3px 0 #E5533A',
                transform: 'translateY(-2px)',
                transition: 'all 0.2s',
                minHeight: 56,
                marginBottom: 16,
              }}
            >
              {selectedLessonInfo.result?.completed
                ? (uiLang === 'he' ? '\u05E0\u05E1\u05D4 \u05E9\u05D5\u05D1' : 'Try Again')
                : t('startLesson', uiLang)
              }
            </button>

            {/* Lesson info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: `${selectedLessonInfo.typeInfo.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26,
              }}>
                {selectedLessonInfo.typeInfo.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#374151' }}>
                  {uiLang === 'he'
                    ? (selectedLessonInfo.lesson.titleHe || selectedLessonInfo.lesson.titleEn)
                    : selectedLessonInfo.lesson.titleEn
                  }
                </div>
                <div style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 600 }}>
                  {uiLang === 'he' ? selectedLessonInfo.typeInfo.nameHe : selectedLessonInfo.typeInfo.nameEn}
                </div>
              </div>
            </div>

            {/* Previous stars */}
            {selectedLessonInfo.result?.completed && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 16px', background: '#FFFBEB', borderRadius: 12,
              }}>
                <span style={{ fontSize: 13, color: '#92400E', fontWeight: 600 }}>
                  {uiLang === 'he' ? '\u05E6\u05D9\u05D5\u05DF \u05E7\u05D5\u05D3\u05DD' : 'Previous score'}:
                </span>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[1, 2, 3].map(s => (
                    <span key={s} style={{
                      fontSize: 18,
                      opacity: s <= (selectedLessonInfo.result.stars || 0) ? 1 : 0.2,
                    }}>
                      {'\u2B50'}
                    </span>
                  ))}
                </div>
                <span style={{ fontSize: 13, color: '#92400E', marginLeft: 'auto' }}>
                  {Math.round(selectedLessonInfo.result.bestAccuracy || 0)}%
                </span>
              </div>
            )}
          </div>
        </>
      )}

      {/* Inline styles */}
      <style>{`
        @keyframes curriculum-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes curriculum-pop-in {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
