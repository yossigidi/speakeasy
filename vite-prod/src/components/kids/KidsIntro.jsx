import React, { useState, useEffect, useCallback } from 'react';

const SESSION_KEY = 'kids-intro-seen';

function getSeenSet() {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(SESSION_KEY) || '[]'));
  } catch { return new Set(); }
}

function markSeen(id) {
  const set = getSeenSet();
  set.add(id);
  sessionStorage.setItem(SESSION_KEY, JSON.stringify([...set]));
}

/**
 * KidsIntro — fun animated intro overlay for kids pages.
 *
 * Props:
 *  - id: unique key per page (e.g. 'home', 'games', 'alphabet')
 *  - name: child's display name
 *  - emoji: large mascot/page emoji
 *  - title / titleHe: heading text
 *  - desc / descHe: description text
 *  - uiLang: 'he' or 'en'
 *  - gradient: tailwind gradient classes (default provided)
 *  - buttonLabel / buttonLabelHe: CTA text
 *  - onDone: optional callback after dismiss
 */
export default function KidsIntro({
  id,
  name,
  emoji = '🦉',
  title = "Let's go!",
  titleHe = '!בואו נתחיל',
  desc = '',
  descHe = '',
  uiLang = 'en',
  gradient = 'from-indigo-500 via-purple-500 to-pink-500',
  buttonLabel = "Let's go!",
  buttonLabelHe = '!יאללה',
  onDone,
}) {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState('enter'); // enter → visible → exit

  useEffect(() => {
    const seen = getSeenSet();
    if (seen.has(id)) {
      setVisible(false);
      return;
    }
    setVisible(true);
    // Animate in
    requestAnimationFrame(() => setPhase('visible'));
  }, [id]);

  const dismiss = useCallback(() => {
    setPhase('exit');
    markSeen(id);
    setTimeout(() => {
      setVisible(false);
      if (onDone) onDone();
    }, 400);
  }, [id, onDone]);

  if (!visible) return null;

  const isHe = uiLang === 'he';

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-6 transition-all duration-300 ${
        phase === 'exit' ? 'opacity-0 scale-95' : phase === 'visible' ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
      }`}
      style={{
        backdropFilter: 'blur(12px)',
        background: 'rgba(0,0,0,0.4)',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
      }}
      onClick={dismiss}
    >
      <div
        className={`relative w-full max-w-sm rounded-[2rem] bg-gradient-to-br ${gradient} p-1 shadow-2xl`}
        onClick={e => e.stopPropagation()}
      >
        {/* Inner card */}
        <div className="rounded-[1.8rem] bg-white/95 dark:bg-gray-900/95 p-6 text-center relative overflow-hidden">
          {/* Decorative sparkles */}
          <div className="absolute top-3 left-4 text-xl animate-sparkle">✨</div>
          <div className="absolute top-4 right-5 text-lg animate-sparkle" style={{ animationDelay: '0.3s' }}>⭐</div>
          <div className="absolute bottom-4 left-6 text-sm animate-sparkle" style={{ animationDelay: '0.6s' }}>💫</div>
          <div className="absolute bottom-3 right-4 text-lg animate-sparkle" style={{ animationDelay: '0.9s' }}>🌟</div>

          {/* Mascot emoji */}
          <div className="text-7xl mb-3 animate-jelly inline-block">{emoji}</div>

          {/* Greeting with name */}
          {name && (
            <h2 className="text-2xl font-black rainbow-text py-1 mb-1">
              {isHe ? `!${name} היי` : `Hi ${name}!`}
            </h2>
          )}

          {/* Title */}
          <h3 className="text-xl font-extrabold text-gray-800 dark:text-white mb-2">
            {isHe ? titleHe : title}
          </h3>

          {/* Description */}
          {(desc || descHe) && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed" dir={isHe ? 'rtl' : 'ltr'}>
              {isHe ? descHe : desc}
            </p>
          )}

          {/* CTA Button */}
          <button
            onClick={dismiss}
            className={`w-full py-3.5 rounded-2xl bg-gradient-to-r ${gradient} text-white font-black text-lg shadow-lg active:scale-95 transition-transform`}
          >
            {isHe ? buttonLabelHe : buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
