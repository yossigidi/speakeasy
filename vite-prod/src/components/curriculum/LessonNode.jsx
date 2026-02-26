import React from 'react';

const TYPE_ICONS = {
  speaking: '\u{1F5E3}\uFE0F', vocabulary: '\u{1F4DA}', reading: '\u{1F4D6}',
  writing: '\u270D\uFE0F', mixed: '\u{1F3AF}', test: '\u2B50',
};

export default function LessonNode({ lesson, lessonResult, isUnlocked, isCurrent, levelColor, onTap, uiLang }) {
  const isCompleted = lessonResult?.completed;
  const stars = lessonResult?.stars || 0;
  const icon = TYPE_ICONS[lesson.type] || '\u{1F4DD}';

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={() => isUnlocked && onTap(lesson)}
        disabled={!isUnlocked}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all duration-300 ${
          !isUnlocked ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed opacity-60' :
          isCompleted ? 'shadow-lg cursor-pointer active:scale-90' :
          isCurrent ? 'bg-white shadow-xl cursor-pointer active:scale-90 curriculum-node-pulse' :
          'bg-white shadow-md cursor-pointer active:scale-90'
        }`}
        style={{
          ...(isCompleted ? { background: levelColor, border: `3px solid ${levelColor}` } : {}),
          ...(isCurrent && !isCompleted ? { border: `3px solid ${levelColor}` } : {}),
          ...(!isUnlocked ? {} : !isCompleted && !isCurrent ? { border: '2px solid #E5E7EB' } : {}),
        }}
      >
        {!isUnlocked ? '\u{1F512}' : icon}
      </button>
      {/* Stars */}
      {isCompleted && (
        <div className="flex gap-0.5">
          {[1, 2, 3].map(s => (
            <span key={s} className="text-xs" style={{ opacity: s <= stars ? 1 : 0.2 }}>{'\u2B50'}</span>
          ))}
        </div>
      )}
      {isCurrent && !isCompleted && (
        <span className="text-[10px] font-bold" style={{ color: levelColor }}>
          {uiLang === 'he' ? '\u05D4\u05D1\u05D0' : 'Next'}
        </span>
      )}
    </div>
  );
}
