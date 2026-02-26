import React, { useState, useEffect } from 'react';

export default function StarAnimation({ stars, onComplete }) {
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    if (revealedCount < stars) {
      // Reveal next star with staggered timing
      const delay = revealedCount === 0 ? 400 : 600;
      const timer = setTimeout(() => {
        setRevealedCount(prev => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    } else if (revealedCount === stars && onComplete) {
      // All stars revealed, call onComplete after a pause
      const timer = setTimeout(() => {
        onComplete();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [revealedCount, stars, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* Stars row */}
      <div className="flex items-center gap-4">
        {[1, 2, 3].map((starNum) => {
          const isRevealed = starNum <= revealedCount;
          const isFilled = starNum <= stars;

          return (
            <div
              key={starNum}
              className="relative"
              style={{
                transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                transform: isRevealed ? 'scale(1)' : 'scale(0.3)',
                opacity: isRevealed ? 1 : 0.3,
              }}
            >
              <span
                className="text-5xl block"
                style={{
                  filter: isRevealed && isFilled ? 'none' : 'grayscale(100%)',
                  transition: 'filter 0.3s ease',
                }}
              >
                {isFilled && isRevealed ? '\u2B50' : '\u2606'}
              </span>
              {/* Burst effect on reveal */}
              {isRevealed && isFilled && (
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{
                    animation: 'star-burst 0.6s ease-out forwards',
                  }}
                >
                  <div
                    className="w-16 h-16 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%)',
                      animation: 'star-glow 0.6s ease-out forwards',
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Label */}
      <div
        className="text-center transition-all duration-500"
        style={{
          opacity: revealedCount === stars ? 1 : 0,
          transform: revealedCount === stars ? 'translateY(0)' : 'translateY(10px)',
        }}
      >
        <p className="text-2xl font-bold text-gray-800 dark:text-white">
          {stars === 3 ? '\u{1F389}' : stars === 2 ? '\u{1F44F}' : '\u{1F44D}'}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {stars === 3 ? 'Perfect!' : stars === 2 ? 'Great job!' : 'Good try!'}
        </p>
      </div>

      {/* Inline keyframe styles */}
      <style>{`
        @keyframes star-burst {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes star-glow {
          0% { transform: scale(0.5); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
