import React, { useState, useCallback, useEffect, useRef } from 'react';
import LevelSelector from '../components/curriculum/LevelSelector.jsx';
import UnitIsland from '../components/curriculum/UnitIsland.jsx';
import CurriculumLessonRunner from '../components/curriculum/CurriculumLessonRunner.jsx';
import useCurriculumProgress from '../hooks/useCurriculumProgress.js';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { t } from '../utils/translations.js';
import { getLevel, LEVEL_META, LESSON_TYPES } from '../data/curriculum/curriculum-index.js';

export default function CurriculumPage({ onBack }) {
  const { uiLang } = useTheme();
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

  // Close bottom sheet on outside tap
  useEffect(() => {
    if (!showBottomSheet) return;
    const handleClickOutside = (e) => {
      if (bottomSheetRef.current && !bottomSheetRef.current.contains(e.target)) {
        handleCloseSheet();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showBottomSheet, handleCloseSheet]);

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
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            zIndex: 50, animation: 'curriculum-fade-in 0.2s ease',
          }} />

          {/* Bottom Sheet */}
          <div
            ref={bottomSheetRef}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0,
              background: 'white', borderRadius: '24px 24px 0 0',
              padding: '24px 24px 32px', zIndex: 51,
              boxShadow: '0 -4px 20px rgba(0,0,0,0.12)',
              animation: 'curriculum-slide-up 0.3s ease',
              maxHeight: '60vh',
            }}
          >
            {/* Handle */}
            <div style={{
              width: 40, height: 4, background: '#D1D5DB', borderRadius: 2,
              margin: '0 auto 20px',
            }} />

            {/* Lesson info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16,
                background: `${selectedLessonInfo.typeInfo.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28,
              }}>
                {selectedLessonInfo.typeInfo.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#374151' }}>
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
                marginBottom: 16,
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

            {/* Start button */}
            <button
              onClick={handleStartLesson}
              style={{
                width: '100%', padding: '16px 24px', borderRadius: 18,
                fontSize: 18, fontWeight: 800,
                background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
                color: 'white', border: 'none', cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(255,107,107,0.35), 0 3px 0 #E5533A',
                transform: 'translateY(-2px)',
                transition: 'all 0.2s',
                minHeight: 56,
              }}
            >
              {selectedLessonInfo.result?.completed
                ? (uiLang === 'he' ? '\u05E0\u05E1\u05D4 \u05E9\u05D5\u05D1' : 'Try Again')
                : t('startLesson', uiLang)
              }
            </button>
          </div>
        </>
      )}

      {/* Inline styles */}
      <style>{`
        @keyframes curriculum-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes curriculum-slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
