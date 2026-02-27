import React, { useState, useEffect, useRef } from 'react';

/**
 * SpeakliAvatar — an animated, lifelike mascot character.
 *
 * Modes:
 *  - idle       Gentle floating + breathing + occasional blink/tilt (default)
 *  - wave       Waving hello (entrance greeting)
 *  - celebrate  Excited jumping + spinning (correct answer / completion)
 *  - fly        Flies in from offscreen
 *  - talk       Bounces slightly as if speaking
 *  - sleep      Slow breathing, slight tilt (inactive state)
 *  - bounce     Playful bouncing
 */

const MODES = {
  idle: 'speakli-idle',
  wave: 'speakli-wave',
  celebrate: 'speakli-celebrate',
  fly: 'speakli-fly',
  talk: 'speakli-talk',
  sleep: 'speakli-sleep',
  bounce: 'speakli-bounce',
};

export default function SpeakliAvatar({
  mode = 'idle',
  size = 'md',       // xs, sm, md, lg, xl
  className = '',
  onClick,
  style,
  glow = false,
  shadow = true,
}) {
  const [blinking, setBlinking] = useState(false);
  const imgRef = useRef(null);

  // Random blink every 2-5 seconds (simulates alive feeling)
  useEffect(() => {
    if (mode === 'sleep') return;
    const blink = () => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 150);
    };
    const schedule = () => {
      const delay = 2000 + Math.random() * 3000;
      return setTimeout(() => {
        blink();
        timerRef.current = schedule();
      }, delay);
    };
    const timerRef = { current: schedule() };
    return () => clearTimeout(timerRef.current);
  }, [mode]);

  const sizeClasses = {
    xs: 'w-8 h-8',
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
    xl: 'w-36 h-36',
  };

  const animClass = MODES[mode] || MODES.idle;
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={`speakli-avatar-wrap ${animClass} ${className}`}
      onClick={onClick}
      style={style}
    >
      {/* Glow ring behind avatar */}
      {glow && (
        <div className="speakli-glow" />
      )}

      {/* Shadow on the ground */}
      {shadow && (
        <div className="speakli-shadow" />
      )}

      {/* The character image */}
      <img
        ref={imgRef}
        src="/images/speakli-avatar.png"
        alt="Speakli"
        className={`speakli-img ${sizeClass} ${blinking ? 'speakli-blink' : ''}`}
        draggable={false}
        onError={(e) => {
          e.target.outerHTML = '<span class="text-6xl">🦉</span>';
        }}
      />
    </div>
  );
}
