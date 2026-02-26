import React from 'react';
import LessonNode from './LessonNode.jsx';

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
  const unitName = uiLang === 'he' ? unit.nameHe : unit.name;
  const completedCount = unitProgress?.completed || 0;
  const totalCount = unitProgress?.total || 6;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Split lessons into rows of 3
  const row1 = unit.lessons.slice(0, 3);
  const row2 = unit.lessons.slice(3, 6);

  return (
    <div
      className={`relative rounded-2xl p-4 transition-all duration-300 ${
        isUnlocked
          ? 'bg-white/80 dark:bg-gray-800/80 shadow-lg'
          : 'bg-gray-100/60 dark:bg-gray-800/40 opacity-60'
      }`}
      style={{
        border: isUnlocked ? `2px solid ${levelColor}22` : '2px solid transparent',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Unit Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{unit.emoji}</span>
        <div className="flex-1 min-w-0">
          <h3
            className="font-bold text-sm truncate"
            style={{ color: isUnlocked ? levelColor : '#9CA3AF' }}
          >
            {unitName}
          </h3>
          <span className="text-[10px] text-gray-400">
            {completedCount}/{totalCount} {uiLang === 'he' ? '\u05E9\u05D9\u05E2\u05D5\u05E8\u05D9\u05DD' : 'lessons'}
          </span>
        </div>
        {!isUnlocked && <span className="text-lg">{'\u{1F512}'}</span>}
      </div>

      {/* Lesson Nodes Grid: 2 rows of 3 */}
      <div className="flex flex-col items-center gap-3">
        {/* Row 1 */}
        <div className="flex items-center gap-4 justify-center">
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
          <div className="flex items-center gap-4 justify-center">
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
      <div className="mt-3">
        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progressPercent}%`,
              background: levelColor,
            }}
          />
        </div>
      </div>
    </div>
  );
}
