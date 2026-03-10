import React from 'react';

// Map hex colors to cube image files
const COLOR_TO_IMAGE = {
  '#ef4444': '/images/games/cube-red.jpg',
  '#f59e0b': '/images/games/cube-orange.jpg',
  '#22c55e': '/images/games/cube-green.jpg',
  '#3b82f6': '/images/games/cube-blue.jpg',
  '#a855f7': '/images/games/cube-purple.jpg',
  '#ec4899': '/images/games/cube-pink.jpg',
};

/**
 * LetterCube - A 3D toy-block letter cube for the Alphabet Tower game.
 *
 * Uses Leonardo AI-generated cube images with letter overlay.
 * Supports drag, placed, wrong, and ghost states with matching animations.
 */
const LetterCube = React.memo(function LetterCube({
  letter = '',
  size = 56,
  color = '#6366f1',
  isDragging = false,
  isPlaced = false,
  isWrong = false,
  isGhost = false,
  style = {},
  onPointerDown,
  className = '',
}) {
  const baseColor = color.startsWith('#') ? color : '#6366f1';
  const cubeImage = COLOR_TO_IMAGE[baseColor] || COLOR_TO_IMAGE['#3b82f6'];

  const stateClass = isDragging
    ? 'cube-dragging'
    : isPlaced
      ? 'cube-placed'
      : isWrong
        ? 'cube-wrong'
        : isGhost
          ? 'cube-ghost'
          : 'cube-idle';

  return (
    <div
      className={`letter-cube-wrapper ${stateClass} ${className}`}
      style={{
        width: size,
        height: size,
        position: 'relative',
        cursor: isDragging ? 'grabbing' : isGhost ? 'default' : 'grab',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
        zIndex: isDragging ? 50 : 1,
        ...style,
      }}
      onPointerDown={onPointerDown}
    >
      {/* ---- Drag glow aura ---- */}
      {isDragging && (
        <div
          style={{
            position: 'absolute',
            inset: -6,
            borderRadius: size * 0.18,
            background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
            boxShadow: `0 0 20px 6px ${baseColor}55, 0 0 40px 10px ${baseColor}22`,
            animation: 'drag-glow 1s ease-in-out infinite alternate',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}

      {/* ---- Cube image ---- */}
      {isGhost ? (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: size * 0.16,
            border: '2.5px dashed rgba(150,150,150,0.5)',
            background: 'rgba(200,200,200,0.15)',
            opacity: 0.4,
          }}
        />
      ) : (
        <img
          src={cubeImage}
          alt=""
          draggable={false}
          style={{
            width: size,
            height: size,
            objectFit: 'cover',
            borderRadius: size * 0.14,
            pointerEvents: 'none',
            filter: isDragging ? 'brightness(1.1) drop-shadow(0 4px 12px rgba(0,0,0,0.3))' : undefined,
          }}
        />
      )}

      {/* ---- Letter overlay ---- */}
      {!isGhost && (
        <span
          style={{
            position: 'absolute',
            top: '38%',
            left: '32%',
            transform: 'translate(-50%, -50%)',
            fontSize: size * 0.48,
            fontWeight: 900,
            color: '#fff',
            textShadow: '0 2px 6px rgba(0,0,0,0.4), 0 0 10px rgba(255,255,255,0.25)',
            lineHeight: 1,
            fontFamily: "'Fredoka', 'Heebo', 'Inter', sans-serif",
            zIndex: 2,
            pointerEvents: 'none',
          }}
        >
          {letter}
        </span>
      )}

      {/* Ghost letter hint */}
      {isGhost && letter && (
        <span
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: size * 0.4,
            fontWeight: 800,
            color: 'rgba(150,150,150,0.35)',
            lineHeight: 1,
            fontFamily: "'Fredoka', 'Heebo', 'Inter', sans-serif",
            pointerEvents: 'none',
          }}
        >
          {letter}
        </span>
      )}

      {isDragging && (
        <style>{`
          @keyframes drag-glow {
            0% { box-shadow: 0 0 16px 4px ${baseColor}44, 0 0 32px 8px ${baseColor}18; }
            100% { box-shadow: 0 0 24px 8px ${baseColor}66, 0 0 48px 14px ${baseColor}28; }
          }
        `}</style>
      )}
    </div>
  );
});

export default LetterCube;
