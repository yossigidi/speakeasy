import React from 'react';
import LessonNode from './LessonNode.jsx';
import { t, lf } from '../../utils/translations.js';

export default function UnitIsland({
  unit,
  unitProgress,
  curriculum,
  levelColor,
  isUnlocked,
  onLessonTap,
  uiLang,
  isLessonUnlocked,
  getLessonResult,
  currentLessonId,
}) {
  const unitName = lf(unit, 'name', uiLang);
  const completedCount = unitProgress?.completed || 0;
  const totalCount = unitProgress?.total || 6;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Split lessons into rows of 3
  const row1 = unit.lessons.slice(0, 3);
  const row2 = unit.lessons.slice(3, 6);

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 16,
        padding: 16,
        transition: 'all 0.3s',
        background: isUnlocked ? 'rgba(255,255,255,0.85)' : 'rgba(243,244,246,0.6)',
        opacity: isUnlocked ? 1 : 0.6,
        border: isUnlocked ? `2px solid ${levelColor}22` : '2px solid transparent',
        boxShadow: isUnlocked ? '0 4px 20px rgba(0,0,0,0.06)' : 'none',
      }}
    >
      {/* Unit Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 24 }}>{unit.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontWeight: 700, fontSize: 14, margin: 0,
              color: isUnlocked ? levelColor : '#9CA3AF',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
          >
            {unitName}
          </h3>
          <span style={{ fontSize: 10, color: '#9CA3AF' }}>
            {completedCount}/{totalCount} {t('curriculumLessons', uiLang)}
          </span>
        </div>
        {!isUnlocked && <span style={{ fontSize: 18 }}>{'\u{1F512}'}</span>}
      </div>

      {/* Lesson Nodes Grid: 2 rows of 3 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        {/* Row 1 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center' }}>
          {row1.map((lesson) => (
            <LessonNode
              key={lesson.id}
              lesson={lesson}
              lessonResult={getLessonResult(lesson.id)}
              isUnlocked={isUnlocked && isLessonUnlocked(lesson.id)}
              isCurrent={lesson.id === currentLessonId}
              levelColor={levelColor}
              onTap={onLessonTap}
              uiLang={uiLang}
            />
          ))}
        </div>
        {/* Row 2 */}
        {row2.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center' }}>
            {row2.map((lesson) => (
              <LessonNode
                key={lesson.id}
                lesson={lesson}
                lessonResult={getLessonResult(lesson.id)}
                isUnlocked={isUnlocked && isLessonUnlocked(lesson.id)}
                isCurrent={lesson.id === currentLessonId}
                levelColor={levelColor}
                onTap={onLessonTap}
                uiLang={uiLang}
              />
            ))}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div style={{ marginTop: 12 }}>
        <div style={{ height: 6, background: '#E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%', borderRadius: 3,
              width: `${progressPercent}%`,
              background: levelColor,
              transition: 'width 0.5s ease-out',
            }}
          />
        </div>
      </div>
    </div>
  );
}
