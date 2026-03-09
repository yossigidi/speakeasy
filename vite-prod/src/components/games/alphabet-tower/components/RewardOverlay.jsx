import React, { useEffect, useRef, useMemo } from 'react';
import { playComplete, playStar } from '../../../../utils/gameSounds.js';

// ─── i18n ───────────────────────────────────────────────────────────────────
const YAY = { he: 'יש!', ar: 'رائع!', ru: 'Ура!', en: 'Yay!' };
const NEW_FRIEND = { he: 'חבר חדש!', ar: 'صديق جديد!', ru: 'Новый друг!', en: 'New friend!' };
const YOU_WON = { he: 'זכית!', ar: 'فزت!', ru: 'Вы выиграли!', en: 'You won!' };
const CONTINUE = { he: 'המשך', ar: 'متابعة', ru: 'Продолжить', en: 'Continue' };

const getLangKey = (lang) => {
  if (lang === 'he') return 'He';
  if (lang === 'ar') return 'Ar';
  if (lang === 'ru') return 'Ru';
  return 'En';
};
const getName = (obj, lang) => obj?.[`name${getLangKey(lang)}`] || obj?.nameEn || '';

// ─── confetti particle generator ────────────────────────────────────────────
const CONFETTI_COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#fbbf24', '#06b6d4'];
const CONFETTI_COUNT = 40;

function generateConfetti() {
  return Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.8,
    duration: 1.5 + Math.random() * 1.5,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 6 + Math.random() * 6,
    rotation: Math.random() * 360,
    drift: -30 + Math.random() * 60,
    shape: Math.random() > 0.5 ? 'circle' : 'rect',
  }));
}

const RewardOverlay = React.memo(function RewardOverlay({ reward, onClose, uiLang }) {
  const lang = uiLang || 'en';
  const confetti = useMemo(generateConfetti, []);
  const hasPlayedRef = useRef(false);

  // Play celebration sound on mount
  useEffect(() => {
    if (!hasPlayedRef.current) {
      hasPlayedRef.current = true;
      try { playStar(); } catch { /* */ }
      setTimeout(() => {
        try { playComplete(); } catch { /* */ }
      }, 300);
    }
  }, []);

  if (!reward) return null;

  const isTrophy = reward.type === 'trophy';
  const isCharacter = reward.type === 'character';
  const isGiftbox = reward.type === 'giftbox';

  // Type-specific styling
  const glowColor = isTrophy
    ? 'rgba(251,191,36,0.6)'
    : isCharacter
      ? 'rgba(168,85,247,0.5)'
      : 'rgba(59,130,246,0.5)';

  const borderColor = isTrophy
    ? '#fbbf24'
    : isCharacter
      ? '#a855f7'
      : '#3b82f6';

  const subtitleText = isCharacter
    ? (NEW_FRIEND[lang])
    : (YOU_WON[lang]);

  const emojiAnimation = isGiftbox
    ? 'giftbox-shake 0.6s ease-in-out 0.3s, reward-appear 0.6s ease-out'
    : 'reward-appear 0.6s ease-out';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'overlay-fade-in 0.3s ease-out',
        fontFamily: "'Fredoka', 'Heebo', 'Inter', sans-serif",
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* ── Confetti particles ── */}
      {confetti.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            top: -10,
            left: `${p.x}%`,
            width: p.shape === 'circle' ? p.size : p.size * 0.6,
            height: p.size,
            background: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : 2,
            transform: `rotate(${p.rotation}deg)`,
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
            pointerEvents: 'none',
            zIndex: 0,
            opacity: 0,
          }}
        />
      ))}

      {/* ── Yay text ── */}
      <div
        style={{
          fontSize: 32,
          fontWeight: 800,
          color: '#fbbf24',
          textShadow: '0 2px 12px rgba(251,191,36,0.5)',
          marginBottom: 8,
          animation: 'yay-pop 0.5s ease-out 0.2s both',
          zIndex: 1,
        }}
      >
        {YAY[lang]}
      </div>

      {/* ── Reward container ── */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 1,
        }}
      >
        {/* Glow ring */}
        <div
          style={{
            position: 'absolute',
            width: 160,
            height: 160,
            borderRadius: '50%',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -60%)',
            boxShadow: `0 0 60px 20px ${glowColor}`,
            animation: 'glow-pulse-reward 2s ease-in-out infinite alternate',
            pointerEvents: 'none',
          }}
        />

        {/* Sparkles for trophy */}
        {isTrophy && (
          <>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={`sparkle-${i}`}
                style={{
                  position: 'absolute',
                  width: 6,
                  height: 6,
                  background: '#fbbf24',
                  borderRadius: '50%',
                  top: `${20 + Math.sin(i * 1.05) * 40}%`,
                  left: `${50 + Math.cos(i * 1.05) * 50}%`,
                  animation: `sparkle ${0.8 + i * 0.15}s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.2}s`,
                  boxShadow: '0 0 8px 2px rgba(251,191,36,0.6)',
                  pointerEvents: 'none',
                }}
              />
            ))}
          </>
        )}

        {/* Emoji */}
        <div
          style={{
            fontSize: 100,
            lineHeight: 1,
            animation: emojiAnimation,
            filter: `drop-shadow(0 8px 24px ${glowColor})`,
            marginBottom: 12,
          }}
        >
          {reward.emoji}
        </div>

        {/* Colorful border ring for character */}
        {isCharacter && (
          <div
            style={{
              position: 'absolute',
              width: 140,
              height: 140,
              borderRadius: '50%',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -65%)',
              border: `4px solid ${borderColor}`,
              animation: 'ring-rotate 4s linear infinite',
              borderTopColor: '#ec4899',
              borderRightColor: '#3b82f6',
              borderBottomColor: '#22c55e',
              borderLeftColor: '#f59e0b',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      {/* ── Subtitle ── */}
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.8)',
          marginBottom: 4,
          animation: 'slide-up 0.5s ease-out 0.4s both',
          zIndex: 1,
        }}
      >
        {subtitleText}
      </div>

      {/* ── Reward name ── */}
      <div
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: '#fff',
          textShadow: `0 2px 16px ${glowColor}`,
          marginBottom: 32,
          animation: 'slide-up 0.5s ease-out 0.5s both',
          zIndex: 1,
        }}
      >
        {getName(reward, lang)}
      </div>

      {/* ── Continue button ── */}
      <button
        onClick={onClose}
        style={{
          padding: '14px 48px',
          fontSize: 20,
          fontWeight: 800,
          color: '#fff',
          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
          border: 'none',
          borderRadius: 18,
          cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(22,163,74,0.4)',
          fontFamily: "'Fredoka', 'Heebo', sans-serif",
          transition: 'transform 0.15s',
          animation: 'slide-up 0.5s ease-out 0.6s both',
          zIndex: 1,
        }}
        onPointerDown={(e) => { e.currentTarget.style.transform = 'scale(0.93)'; }}
        onPointerUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {CONTINUE[lang]}
      </button>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes overlay-fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes reward-appear {
          0% { transform: scale(0.2) rotate(-15deg); opacity: 0; }
          50% { transform: scale(1.2) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes giftbox-shake {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(-12deg); }
          30% { transform: rotate(12deg); }
          45% { transform: rotate(-8deg); }
          60% { transform: rotate(8deg); }
          75% { transform: rotate(-4deg); }
          90% { transform: rotate(4deg); }
        }
        @keyframes yay-pop {
          0% { transform: scale(0.3); opacity: 0; }
          60% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slide-up {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes glow-pulse-reward {
          0% { box-shadow: 0 0 40px 10px currentColor; opacity: 0.5; }
          100% { box-shadow: 0 0 70px 25px currentColor; opacity: 0.8; }
        }
        @keyframes sparkle {
          0% { transform: scale(0.5); opacity: 0.3; }
          100% { transform: scale(1.4); opacity: 1; }
        }
        @keyframes ring-rotate {
          0% { transform: translate(-50%, -65%) rotate(0deg); }
          100% { transform: translate(-50%, -65%) rotate(360deg); }
        }
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
});

export default RewardOverlay;
