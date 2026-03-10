import React, { useState, useMemo } from 'react';

/**
 * SpeakliTeacher — Shows the Speakli character as a teacher/guide in game modes.
 *
 * Poses:
 *  - happy   Waving, winking (round start, idle)
 *  - clap    Clapping, joyful (correct answer)
 *  - think   Thinking, question mark (waiting for answer)
 *  - star    Holding star, celebrating (round complete)
 *  - sad     Encouraging, reaching out (wrong answer)
 */

const POSE_IMAGES = {
  happy: '/images/games/speakli-happy.jpg',
  clap: '/images/games/speakli-clap.jpg',
  think: '/images/games/speakli-think.jpg',
  star: '/images/games/speakli-star.jpg',
  sad: '/images/games/speakli-sad.jpg',
};

const POSE_ANIMATIONS = {
  happy: 'teacher-bounce 2s ease-in-out infinite',
  clap: 'teacher-celebrate 0.6s ease-out',
  think: 'teacher-tilt 3s ease-in-out infinite',
  star: 'teacher-celebrate 0.6s ease-out',
  sad: 'teacher-shake 0.5s ease-in-out',
};

const SIZES = {
  sm: 56,
  md: 72,
  lg: 96,
};

const SpeakliTeacher = React.memo(function SpeakliTeacher({
  pose = 'happy',
  size = 'md',
  style,
  speech,
  isRTL = false,
}) {
  const [imgError, setImgError] = useState(false);
  const px = SIZES[size] || SIZES.md;
  const src = POSE_IMAGES[pose] || POSE_IMAGES.happy;
  const anim = POSE_ANIMATIONS[pose] || POSE_ANIMATIONS.happy;

  const containerStyle = useMemo(() => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexDirection: isRTL ? 'row-reverse' : 'row',
    position: 'relative',
    zIndex: 5,
    ...style,
  }), [isRTL, style]);

  if (imgError) {
    return null;
  }

  return (
    <div style={containerStyle}>
      {/* Character image */}
      <div style={{
        width: px,
        height: px,
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0,
        animation: anim,
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        border: '3px solid rgba(255,255,255,0.6)',
        background: '#f0f9ff',
      }}>
        <img
          src={src}
          alt="Speakli Teacher"
          width={px}
          height={px}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
          draggable={false}
          onError={() => setImgError(true)}
        />
      </div>

      {/* Speech bubble */}
      {speech && (
        <div style={{
          background: 'rgba(255,255,255,0.92)',
          borderRadius: 14,
          padding: '6px 12px',
          fontSize: 13,
          fontWeight: 600,
          color: '#1e293b',
          fontFamily: "'Fredoka', 'Heebo', sans-serif",
          maxWidth: 160,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          lineHeight: 1.3,
          textAlign: 'center',
          animation: 'teacher-bubble 0.3s ease-out',
          direction: isRTL ? 'rtl' : 'ltr',
        }}>
          {speech}
        </div>
      )}

      <style>{`
        @keyframes teacher-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes teacher-celebrate {
          0% { transform: scale(1); }
          30% { transform: scale(1.15) rotate(5deg); }
          60% { transform: scale(1.05) rotate(-3deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes teacher-tilt {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(5deg); }
        }
        @keyframes teacher-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          75% { transform: translateX(3px); }
        }
        @keyframes teacher-bubble {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
});

export default SpeakliTeacher;
