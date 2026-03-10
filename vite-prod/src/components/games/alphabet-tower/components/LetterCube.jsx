import React from 'react';

// Map hex colors to blank cube image files
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
 * Uses Leonardo AI blank cube images with letter text overlay.
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

  // Ghost cube (drop zone placeholder)
  if (isGhost) {
    return (
      <div
        className={`letter-cube-wrapper ${stateClass} ${className}`}
        style={{
          width: size,
          height: size,
          position: 'relative',
          cursor: 'default',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          touchAction: 'none',
          ...style,
        }}
      >
        <div style={{
          width: size,
          height: size,
          borderRadius: size * 0.16,
          border: '2.5px dashed rgba(100,150,255,0.5)',
          background: 'rgba(100,150,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {letter && (
            <span style={{
              fontSize: size * 0.42,
              fontWeight: 800,
              color: 'rgba(100,150,255,0.25)',
              fontFamily: "'Fredoka', 'Heebo', 'Inter', sans-serif",
              lineHeight: 1,
            }}>
              {letter}
            </span>
          )}
        </div>
      </div>
    );
  }

  // The cube images are ~1024x1024 with the cube centered.
  // We scale the image larger so the cube fills most of the container,
  // and clip overflow. The cube sits roughly in the center 75% of the image.
  const imgScale = 1.3;

  return (
    <div
      className={`letter-cube-wrapper ${stateClass} ${className}`}
      style={{
        width: size,
        height: size,
        position: 'relative',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
        zIndex: isDragging ? 50 : 1,
        overflow: 'hidden',
        borderRadius: size * 0.14,
        ...style,
      }}
      onPointerDown={onPointerDown}
    >
      {/* Drag glow */}
      {isDragging && (
        <div style={{
          position: 'absolute',
          inset: -8,
          borderRadius: size * 0.2,
          background: `radial-gradient(circle, ${baseColor}40 0%, transparent 70%)`,
          boxShadow: `0 0 24px 8px ${baseColor}44`,
          animation: 'cube-drag-glow 1s ease-in-out infinite alternate',
          pointerEvents: 'none',
          zIndex: 0,
        }} />
      )}

      {/* Cube image — scaled up and centered to crop out background */}
      <img
        src={cubeImage}
        alt=""
        draggable={false}
        style={{
          position: 'absolute',
          width: size * imgScale,
          height: size * imgScale,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          objectFit: 'contain',
          pointerEvents: 'none',
          filter: isDragging
            ? 'brightness(1.1)'
            : undefined,
        }}
      />

      {/* Letter overlay — centered on front face */}
      <span style={{
        position: 'absolute',
        top: '50%',
        left: '44%',
        transform: 'translate(-50%, -50%)',
        fontSize: size * 0.48,
        fontWeight: 900,
        color: '#fff',
        textShadow: '0 2px 6px rgba(0,0,0,0.5), 0 0 12px rgba(255,255,255,0.2)',
        lineHeight: 1,
        fontFamily: "'Fredoka', 'Heebo', 'Inter', sans-serif",
        zIndex: 2,
        pointerEvents: 'none',
      }}>
        {letter}
      </span>

      {isDragging && (
        <style>{`
          @keyframes cube-drag-glow {
            0% { box-shadow: 0 0 16px 4px ${baseColor}44; }
            100% { box-shadow: 0 0 28px 10px ${baseColor}66; }
          }
        `}</style>
      )}
    </div>
  );
});

export default LetterCube;
