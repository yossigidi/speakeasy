import React, { useCallback, useRef } from 'react';

const TYPE_ICONS = {
  speaking: '\u{1F5E3}\uFE0F', vocabulary: '\u{1F4DA}', reading: '\u{1F4D6}',
  writing: '\u270D\uFE0F', mixed: '\u{1F3AF}', test: '\u2B50',
};

export default function LessonNode({ lesson, lessonResult, isUnlocked, isCurrent, levelColor, onTap, uiLang }) {
  const isCompleted = lessonResult?.completed;
  const stars = lessonResult?.stars || 0;
  const icon = TYPE_ICONS[lesson.type] || '\u{1F4DD}';
  const tappedRef = useRef(false);

  const fireTap = useCallback(() => {
    if (tappedRef.current) return;
    tappedRef.current = true;
    setTimeout(() => { tappedRef.current = false; }, 400);
    if (isUnlocked && onTap) {
      onTap(lesson);
    }
  }, [isUnlocked, onTap, lesson]);

  const handleClick = () => {
    fireTap();
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    fireTap();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div
        role="button"
        tabIndex={isUnlocked ? 0 : -1}
        onClick={handleClick}
        onTouchEnd={handleTouchEnd}
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          transition: 'box-shadow 0.3s, background 0.3s, border 0.3s',
          cursor: isUnlocked ? 'pointer' : 'not-allowed',
          opacity: !isUnlocked ? 0.6 : 1,
          background: !isUnlocked ? '#E5E7EB'
            : isCompleted ? levelColor
            : 'white',
          border: isCompleted ? `3px solid ${levelColor}`
            : isCurrent && !isCompleted ? `3px solid ${levelColor}`
            : !isUnlocked ? '2px solid #D1D5DB'
            : '2px solid #E5E7EB',
          boxShadow: isCurrent && !isCompleted
            ? `0 0 0 4px ${levelColor}33, 0 4px 16px rgba(0,0,0,0.1)`
            : isCompleted
            ? '0 4px 12px rgba(0,0,0,0.12)'
            : isUnlocked
            ? '0 2px 8px rgba(0,0,0,0.08)'
            : 'none',
          animation: isCurrent && !isCompleted ? 'curriculumNodePulse 2s ease-in-out infinite' : 'none',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
          userSelect: 'none',
          outline: 'none',
          padding: 0,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {!isUnlocked ? '\u{1F512}' : icon}
      </div>
      {/* Stars */}
      {isCompleted && (
        <div style={{ display: 'flex', gap: 2 }}>
          {[1, 2, 3].map(s => (
            <span key={s} style={{ fontSize: 10, opacity: s <= stars ? 1 : 0.2 }}>{'\u2B50'}</span>
          ))}
        </div>
      )}
      {isCurrent && !isCompleted && (
        <span style={{ fontSize: 10, fontWeight: 700, color: levelColor }}>
          {uiLang === 'he' ? '\u05D4\u05D1\u05D0' : 'Next'}
        </span>
      )}
    </div>
  );
}
