import React, { useEffect, useRef, useMemo } from 'react';
import UnitIsland from './UnitIsland.jsx';
import PathConnector from './PathConnector.jsx';
import useCurriculumProgress from '../../hooks/useCurriculumProgress.js';
import { getLevel } from '../../data/curriculum/curriculum-index.js';
import { t } from '../../utils/translations.js';

export default function CurriculumMap({ levelId, onLessonTap, uiLang }) {
  const { curriculum, isLessonUnlocked, getLessonResult, getUnitProgress } = useCurriculumProgress();
  const scrollContainerRef = useRef(null);
  const unitRefs = useRef({});

  const level = getLevel(levelId);
  const unlockedLevels = curriculum.unlockedLevels || [1];
  const isLevelUnlocked = unlockedLevels.includes(levelId);

  // Find the current lesson (first incomplete unlocked lesson)
  const currentLessonId = useMemo(() => {
    if (!level || !isLevelUnlocked) return null;
    for (const unit of level.units) {
      for (const lesson of unit.lessons) {
        if (isLessonUnlocked(lesson.id, levelId) && !getLessonResult(lesson.id)?.completed) {
          return lesson.id;
        }
      }
    }
    return null;
  }, [level, levelId, isLevelUnlocked, curriculum]);

  // Find which unit contains the current lesson, for auto-scroll
  const currentUnitId = useMemo(() => {
    if (!currentLessonId || !level) return null;
    for (const unit of level.units) {
      if (unit.lessons.some(l => l.id === currentLessonId)) {
        return unit.id;
      }
    }
    return null;
  }, [currentLessonId, level]);

  // Auto-scroll to the current unit on mount
  useEffect(() => {
    if (currentUnitId && unitRefs.current[currentUnitId]) {
      const timer = setTimeout(() => {
        unitRefs.current[currentUnitId]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentUnitId, levelId]);

  if (!level) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        {t('levelNotAvailable', uiLang)}
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className="flex flex-col items-center px-4 py-6 overflow-y-auto"
      style={{ maxHeight: 'calc(100vh - 180px)' }}
    >
      {level.units.map((unit, index) => {
        const unitProgress = getUnitProgress(unit.id);
        const isUnitUnlocked = isLevelUnlocked && (
          index === 0 ||
          getUnitProgress(level.units[index - 1]?.id)?.isComplete
        );
        // Also unlock if any lesson in the unit is unlocked (handles partially-completed units)
        const hasUnlockedLesson = unit.lessons.some(l => isLessonUnlocked(l.id, levelId));
        const effectivelyUnlocked = isUnitUnlocked || hasUnlockedLesson;

        // Alternating left/right alignment for winding path
        const isEven = index % 2 === 0;
        const alignClass = isEven ? 'self-start' : 'self-end';

        return (
          <React.Fragment key={unit.id}>
            {/* Path connector between units */}
            {index > 0 && (
              <PathConnector
                color={level.color}
                completed={getUnitProgress(level.units[index - 1]?.id)?.isComplete}
              />
            )}

            {/* Unit island */}
            <div
              ref={el => { unitRefs.current[unit.id] = el; }}
              className={`w-full max-w-xs transition-all duration-300 ${alignClass}`}
            >
              <UnitIsland
                unit={unit}
                unitProgress={unitProgress}
                curriculum={curriculum}
                levelColor={level.color}
                isUnlocked={effectivelyUnlocked}
                onLessonTap={onLessonTap}
                uiLang={uiLang}
                isLessonUnlocked={(lessonId) => isLessonUnlocked(lessonId, levelId)}
                getLessonResult={getLessonResult}
                currentLessonId={currentLessonId}
              />
            </div>
          </React.Fragment>
        );
      })}

      {/* Bottom spacer */}
      <div className="h-20" />
    </div>
  );
}
