import React from 'react';

/**
 * LetterCube - A 3D toy-block letter cube for the Alphabet Tower game.
 *
 * Renders an isometric-style cube with front, top, and right faces.
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
  // Derive lighter/darker shades from the base color
  const baseColor = color.startsWith('#') ? color : '#6366f1';

  const stateClass = isDragging
    ? 'cube-dragging'
    : isPlaced
      ? 'cube-placed'
      : isWrong
        ? 'cube-wrong'
        : isGhost
          ? 'cube-ghost'
          : 'cube-idle';

  const half = size / 2;
  const topH = size * 0.35; // height of the top face

  return (
    <div
      className={`letter-cube-wrapper ${stateClass} ${className}`}
      style={{
        width: size + half,
        height: size + topH,
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
      {/* ---- Front face ---- */}
      <div
        className="letter-cube-face letter-cube-front"
        style={{
          width: size,
          height: size,
          top: topH,
          left: 0,
          background: `linear-gradient(135deg, ${baseColor}, ${adjustBrightness(baseColor, -20)})`,
          borderRadius: size * 0.16,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isGhost
            ? 'none'
            : `inset 0 2px 4px rgba(255,255,255,0.35), inset 0 -2px 4px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.18)`,
          border: isGhost ? '2.5px dashed rgba(150,150,150,0.5)' : `2px solid ${adjustBrightness(baseColor, 20)}`,
          opacity: isGhost ? 0.3 : 1,
          overflow: 'hidden',
        }}
      >
        {/* Glossy highlight */}
        {!isGhost && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '45%',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 100%)',
              borderRadius: `${size * 0.16}px ${size * 0.16}px 0 0`,
              pointerEvents: 'none',
            }}
          />
        )}
        <span
          style={{
            fontSize: size * 0.52,
            fontWeight: 800,
            color: '#fff',
            textShadow: '0 2px 4px rgba(0,0,0,0.25), 0 0 8px rgba(255,255,255,0.3)',
            lineHeight: 1,
            fontFamily: "'Fredoka', 'Heebo', 'Inter', sans-serif",
            position: 'relative',
            zIndex: 2,
          }}
        >
          {letter}
        </span>
      </div>

      {/* ---- Top face ---- */}
      {!isGhost && (
        <div
          className="letter-cube-face letter-cube-top"
          style={{
            width: size,
            height: topH,
            top: 0,
            left: half * 0.08,
            background: `linear-gradient(180deg, ${adjustBrightness(baseColor, 35)}, ${adjustBrightness(baseColor, 10)})`,
            borderRadius: `${size * 0.14}px ${size * 0.14}px ${size * 0.06}px ${size * 0.06}px`,
            position: 'absolute',
            transform: `skewX(-${32}deg)`,
            transformOrigin: 'bottom left',
            border: `1.5px solid ${adjustBrightness(baseColor, 30)}`,
            borderBottom: 'none',
            boxShadow: 'inset 0 2px 6px rgba(255,255,255,0.4)',
          }}
        />
      )}

      {/* ---- Right face ---- */}
      {!isGhost && (
        <div
          className="letter-cube-face letter-cube-right"
          style={{
            width: half,
            height: size,
            top: topH,
            left: size,
            background: `linear-gradient(180deg, ${adjustBrightness(baseColor, -15)}, ${adjustBrightness(baseColor, -35)})`,
            borderRadius: `0 ${size * 0.14}px ${size * 0.14}px 0`,
            position: 'absolute',
            transform: `skewY(-${32}deg)`,
            transformOrigin: 'top left',
            border: `1.5px solid ${adjustBrightness(baseColor, -10)}`,
            borderLeft: 'none',
            boxShadow: 'inset -2px 0 6px rgba(0,0,0,0.15)',
          }}
        />
      )}
    </div>
  );
});

/**
 * Lighten or darken a hex colour by a fixed amount.
 * `amount` > 0 lightens, < 0 darkens.
 */
function adjustBrightness(hex, amount) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  const num = parseInt(c, 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

export default LetterCube;
