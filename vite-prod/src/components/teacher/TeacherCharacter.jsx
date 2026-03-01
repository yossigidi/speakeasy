import React, { useState, useEffect } from 'react';

export default function TeacherCharacter({ state = 'idle', size = 'normal' }) {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    let blinkTimer;
    const interval = setInterval(() => {
      setBlink(true);
      blinkTimer = setTimeout(() => setBlink(false), 200);
    }, 3000 + Math.random() * 2000);
    return () => { clearInterval(interval); clearTimeout(blinkTimer); };
  }, []);

  const s = size === 'small' ? 80 : 140;
  const bodyAnim = state === 'celebrating' ? 'teacher-jelly 0.5s ease infinite'
    : state === 'idle' ? 'teacher-float 3s ease-in-out infinite' : 'none';
  const eyeScale = blink ? 'scaleY(0.1)' : 'scaleY(1)';
  const mouthPath = state === 'happy' || state === 'celebrating'
    ? 'M 35,75 Q 50,90 65,75'
    : state === 'talking' ? 'M 38,75 Q 50,82 62,75 Q 50,85 38,75'
    : state === 'thinking' ? 'M 45,78 A 3,3 0 1,1 55,78'
    : 'M 38,75 Q 50,82 62,75';
  const eyeX = state === 'thinking' ? 3 : 0;
  const eyeY = state === 'thinking' ? -3 : 0;

  return (
    <div style={{ width: s, height: s + 30, animation: bodyAnim, position: 'relative' }}>
      <svg viewBox="0 0 100 120" width={s} height={s + 30}>
        <rect x="25" y="85" width="50" height="35" rx="12" fill="url(#teacherShirt)" />
        <rect x="10" y="90" width="18" height="8" rx="4" fill="#E8B4B8"
          style={{ animation: state === 'celebrating' ? 'teacher-wave-left 0.4s ease infinite alternate' : 'none', transformOrigin: '25px 94px' }} />
        <rect x="72" y="90" width="18" height="8" rx="4" fill="#E8B4B8"
          style={{ animation: state === 'celebrating' ? 'teacher-wave-right 0.4s ease infinite alternate' : 'none', transformOrigin: '75px 94px' }} />
        <circle cx="50" cy="45" r="30" fill="#FDDCB5" />
        <path d="M 20,40 Q 20,10 50,12 Q 80,10 80,40 Q 75,25 50,22 Q 25,25 20,40" fill="#6B4226" />
        <circle cx="39" cy="45" r="10" fill="none" stroke="#555" strokeWidth="1.5" />
        <circle cx="61" cy="45" r="10" fill="none" stroke="#555" strokeWidth="1.5" />
        <line x1="49" y1="45" x2="51" y2="45" stroke="#555" strokeWidth="1.5" />
        <g transform={`translate(${eyeX}, ${eyeY})`}>
          <ellipse cx="39" cy="45" rx="3.5" ry="4" fill="#333"
            style={{ transform: eyeScale, transformOrigin: '39px 45px', transition: 'transform 0.1s' }} />
          <ellipse cx="61" cy="45" rx="3.5" ry="4" fill="#333"
            style={{ transform: eyeScale, transformOrigin: '61px 45px', transition: 'transform 0.1s' }} />
          <circle cx="40.5" cy="43.5" r="1.5" fill="white" />
          <circle cx="62.5" cy="43.5" r="1.5" fill="white" />
        </g>
        <path d={mouthPath}
          fill={state === 'happy' || state === 'celebrating' ? '#FF6B6B' : 'none'}
          stroke="#D4726A" strokeWidth="2" strokeLinecap="round">
          {state === 'talking' && (
            <animate attributeName="d"
              values="M 38,75 Q 50,82 62,75 Q 50,85 38,75;M 38,75 Q 50,78 62,75 Q 50,80 38,75;M 38,75 Q 50,82 62,75 Q 50,85 38,75"
              dur="0.3s" repeatCount="indefinite" />
          )}
        </path>
        {(state === 'happy' || state === 'celebrating') && <>
          <text x="15" y="20" fontSize="10" style={{ animation: 'teacher-sparkle 0.6s ease infinite' }}>✨</text>
          <text x="75" y="25" fontSize="10" style={{ animation: 'teacher-sparkle 0.6s ease 0.2s infinite' }}>✨</text>
          <text x="10" y="65" fontSize="8" style={{ animation: 'teacher-sparkle 0.6s ease 0.4s infinite' }}>⭐</text>
        </>}
        {state === 'encouraging' && <text x="75" y="35" fontSize="12" style={{ animation: 'teacher-sparkle 1s ease infinite' }}>💜</text>}
        {state === 'thinking' && <>
          <circle cx="78" cy="30" r="3" fill="#DDD" style={{ animation: 'teacher-think-dot 1s ease infinite' }} />
          <circle cx="85" cy="22" r="4" fill="#DDD" style={{ animation: 'teacher-think-dot 1s ease 0.3s infinite' }} />
          <circle cx="90" cy="12" r="5" fill="#DDD" style={{ animation: 'teacher-think-dot 1s ease 0.6s infinite' }} />
        </>}
        <defs>
          <linearGradient id="teacherShirt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
