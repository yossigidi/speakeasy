import React, { useState, useEffect, useMemo } from 'react';
import StarAnimation from './StarAnimation.jsx';
import { t } from '../../utils/translations.js';

// -- Confetti piece component --
function ConfettiPiece({ delay, color, left }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: -10,
        left: `${left}%`,
        width: 8 + Math.random() * 6,
        height: 8 + Math.random() * 6,
        background: color,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
        opacity: 0,
        animation: `confetti-fall ${1.8 + Math.random() * 1.2}s ease-out ${delay}s forwards`,
        pointerEvents: 'none',
      }}
    />
  );
}

const CONFETTI_COLORS = ['#FF6B6B', '#0EA5E9', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#FF8E8E', '#38BDF8'];

export default function LessonCompleteScreen({
  stars,
  accuracy,
  correctCount,
  totalCount,
  xpEarned,
  wordsLearned,
  onNext,
  onHome,
  onRetry,
  uiLang,
  lessonType,
}) {
  const [showStats, setShowStats] = useState(false);
  const [showWords, setShowWords] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  // Stagger the reveal animations
  useEffect(() => {
    const t1 = setTimeout(() => setShowStats(true), 600);
    const t2 = setTimeout(() => setShowWords(true), 1000);
    const t3 = setTimeout(() => setShowButtons(true), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  // Generate confetti pieces for 3 stars
  const confettiPieces = useMemo(() => {
    if (stars < 3) return [];
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
    }));
  }, [stars]);

  const headingText = stars === 3
    ? t('perfectScore', uiLang)
    : stars >= 1
    ? t('greatJob', uiLang)
    : t('keepPracticing', uiLang);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 40%, #FFB4B4 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      overflow: 'auto', padding: '40px 20px 32px',
    }}>
      {/* Confetti layer */}
      {confettiPieces.length > 0 && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {confettiPieces.map((piece) => (
            <ConfettiPiece key={piece.id} color={piece.color} left={piece.left} delay={piece.delay} />
          ))}
        </div>
      )}

      {/* Stars */}
      <div style={{ marginBottom: 16 }}>
        <StarAnimation stars={stars} />
      </div>

      {/* Heading */}
      <div style={{
        fontSize: 28, fontWeight: 800, color: 'white', textAlign: 'center',
        marginBottom: 8, textShadow: '0 2px 8px rgba(0,0,0,0.15)',
        animation: 'curriculum-fade-in 0.6s ease',
      }}>
        {headingText}
      </div>
      <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', marginBottom: 24 }}>
        {t('lessonComplete', uiLang)}
      </div>

      {/* Stats card */}
      <div style={{
        background: 'white', borderRadius: 20, padding: '24px 28px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)', maxWidth: 340, width: '100%',
        opacity: showStats ? 1 : 0, transform: showStats ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.5s ease', marginBottom: 20,
      }}>
        {/* Accuracy */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 14, color: '#6B7280', fontWeight: 600 }}>
            {t('accuracy', uiLang)}
          </span>
          <span style={{ fontSize: 28, fontWeight: 800, color: accuracy >= 80 ? '#10B981' : accuracy >= 50 ? '#F59E0B' : '#EF4444' }}>
            {Math.round(accuracy)}%
          </span>
        </div>

        {/* Correct / Total */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 14, color: '#6B7280', fontWeight: 600 }}>
            {t('correct', uiLang)}
          </span>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#374151' }}>
            {correctCount} / {totalCount}
          </span>
        </div>

        {/* XP Earned */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 16px', background: 'linear-gradient(135deg, #FFF7ED, #FEF3C7)',
          borderRadius: 12,
        }}>
          <span style={{ fontSize: 14, color: '#92400E', fontWeight: 600 }}>
            {t('xpEarned', uiLang)}
          </span>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#D97706' }}>
            +{xpEarned} XP
          </span>
        </div>
      </div>

      {/* Words learned */}
      {wordsLearned && wordsLearned.length > 0 && (
        <div style={{
          background: 'white', borderRadius: 20, padding: '20px 24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)', maxWidth: 340, width: '100%',
          opacity: showWords ? 1 : 0, transform: showWords ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.5s ease', marginBottom: 24,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#6B7280', marginBottom: 12 }}>
            {t('wordsLearnedSummary', uiLang)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {wordsLearned.map((w, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 12px', background: '#F9FAFB', borderRadius: 10,
                }}
              >
                <span style={{ fontSize: 24 }}>{w.emoji}</span>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#374151', flex: 1 }}>{w.word}</span>
                <span style={{ fontSize: 14, color: '#6B7280', direction: 'rtl' }}>{w.translation}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 340, width: '100%',
        opacity: showButtons ? 1 : 0, transform: showButtons ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.5s ease',
      }}>
        {/* Retry if 0 stars */}
        {stars === 0 && onRetry && (
          <button
            onClick={onRetry}
            style={{
              padding: '16px 24px', borderRadius: 16, fontSize: 17, fontWeight: 700,
              background: 'white', color: '#FF6B6B', border: '2px solid white',
              cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              minHeight: 52,
            }}
          >
            {t('tryAgain', uiLang)}
          </button>
        )}

        {/* Next Lesson */}
        {onNext && (
          <button
            onClick={onNext}
            style={{
              padding: '16px 24px', borderRadius: 16, fontSize: 17, fontWeight: 700,
              background: 'white', color: '#FF6B6B', border: 'none',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(0,0,0,0.15), 0 3px 0 #E5E7EB',
              minHeight: 52,
              transform: 'translateY(-2px)',
            }}
          >
            {t('continue', uiLang)} {'\u2192'}
          </button>
        )}

        {/* Back Home */}
        <button
          onClick={onHome}
          style={{
            padding: '14px 24px', borderRadius: 16, fontSize: 15, fontWeight: 600,
            background: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid rgba(255,255,255,0.4)',
            cursor: 'pointer', backdropFilter: 'blur(4px)',
            minHeight: 48,
          }}
        >
          {t('backHome', uiLang)}
        </button>
      </div>

      {/* Confetti keyframes */}
      <style>{`
        @keyframes confetti-fall {
          0% {
            opacity: 1;
            transform: translateY(0) rotate(0deg) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(100vh) rotate(${360 + Math.random() * 360}deg) scale(0.3);
          }
        }
        @keyframes curriculum-fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
