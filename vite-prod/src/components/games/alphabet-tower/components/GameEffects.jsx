import React, { useState, useEffect, useMemo } from 'react';

/**
 * Shared visual effects for Alphabet Tower game modes.
 *
 * Components:
 *  - ConfettiBurst    — Confetti particles on celebrations
 *  - FloatingElements — Background floating stars/bubbles
 *  - SparkleTrail     — Sparkles on correct placement
 *  - RoundTransition  — Fade transition between rounds
 */

const CONFETTI_COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#fbbf24', '#06b6d4'];

// ─── ConfettiBurst ──────────────────────────────────────────────────
export const ConfettiBurst = React.memo(function ConfettiBurst({ active, count = 30 }) {
  const particles = useMemo(() => {
    if (!active) return [];
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: 10 + Math.random() * 80,
      delay: Math.random() * 0.6,
      duration: 1.2 + Math.random() * 1.2,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: 5 + Math.random() * 7,
      isCircle: Math.random() > 0.5,
      rotation: Math.random() * 360,
      drift: -20 + Math.random() * 40,
    }));
  }, [active, count]);

  if (!active || particles.length === 0) return null;

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 80,
      overflow: 'hidden',
    }}>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: '-5%',
            width: p.size,
            height: p.isCircle ? p.size : p.size * 1.4,
            borderRadius: p.isCircle ? '50%' : 2,
            background: p.color,
            transform: `rotate(${p.rotation}deg)`,
            animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
            opacity: 0,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 1; }
          25% { opacity: 1; }
          100% { transform: translateY(100vh) translateX(${30}px) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
});

// ─── FloatingElements ───────────────────────────────────────────────
export const FloatingElements = React.memo(function FloatingElements({
  type = 'stars', // 'stars' | 'bubbles'
  count = 8,
}) {
  const elements = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: 5 + Math.random() * 90,
      top: 10 + Math.random() * 80,
      size: type === 'stars' ? (8 + Math.random() * 10) : (12 + Math.random() * 20),
      delay: Math.random() * 6,
      duration: 4 + Math.random() * 4,
      opacity: 0.15 + Math.random() * 0.2,
    }));
  }, [type, count]);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 1,
      overflow: 'hidden',
    }}>
      {elements.map((el) => (
        <div
          key={el.id}
          style={{
            position: 'absolute',
            left: `${el.left}%`,
            top: `${el.top}%`,
            fontSize: el.size,
            opacity: el.opacity,
            animation: `float-element ${el.duration}s ${el.delay}s ease-in-out infinite alternate`,
          }}
        >
          {type === 'stars' ? '✦' : '○'}
        </div>
      ))}
      <style>{`
        @keyframes float-element {
          0% { transform: translateY(0) translateX(0) scale(1); opacity: 0.15; }
          50% { opacity: 0.35; }
          100% { transform: translateY(-18px) translateX(8px) scale(1.15); opacity: 0.15; }
        }
      `}</style>
    </div>
  );
});

// ─── SparkleTrail ───────────────────────────────────────────────────
export const SparkleTrail = React.memo(function SparkleTrail({ active, x, y }) {
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    if (!active) {
      setSparkles([]);
      return;
    }
    const newSparkles = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      dx: -15 + Math.random() * 30,
      dy: -15 + Math.random() * 30,
      size: 8 + Math.random() * 10,
      delay: i * 0.05,
    }));
    setSparkles(newSparkles);
    const timer = setTimeout(() => setSparkles([]), 800);
    return () => clearTimeout(timer);
  }, [active]);

  if (sparkles.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      left: 0,
      top: 0,
      pointerEvents: 'none',
      zIndex: 200,
    }}>
      {sparkles.map((s) => (
        <div
          key={s.id}
          style={{
            position: 'absolute',
            left: (x || 0) + s.dx,
            top: (y || 0) + s.dy,
            fontSize: s.size,
            animation: `sparkle-burst 0.7s ${s.delay}s ease-out forwards`,
            opacity: 0,
          }}
        >
          ✨
        </div>
      ))}
      <style>{`
        @keyframes sparkle-burst {
          0% { transform: scale(0) rotate(0deg); opacity: 1; }
          50% { transform: scale(1.3) rotate(90deg); opacity: 0.8; }
          100% { transform: scale(0.5) rotate(180deg) translateY(-20px); opacity: 0; }
        }
      `}</style>
    </div>
  );
});

// ─── RoundTransition ────────────────────────────────────────────────
export const RoundTransition = React.memo(function RoundTransition({ show }) {
  if (!show) return null;

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.1)',
      zIndex: 70,
      pointerEvents: 'none',
      animation: 'round-transition 0.6s ease-out forwards',
    }}>
      <style>{`
        @keyframes round-transition {
          0% { opacity: 1; }
          50% { opacity: 0.6; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
});

// ─── CorrectGlow — Green expanding ring on correct answer ───────────
export const CorrectGlow = React.memo(function CorrectGlow({ active }) {
  if (!active) return null;

  return (
    <div style={{
      position: 'absolute',
      inset: -8,
      borderRadius: 16,
      border: '3px solid #22c55e',
      animation: 'correct-ring 0.6s ease-out forwards',
      pointerEvents: 'none',
      zIndex: 8,
    }}>
      <style>{`
        @keyframes correct-ring {
          0% { transform: scale(0.8); opacity: 1; border-width: 3px; }
          50% { transform: scale(1.2); opacity: 0.6; border-width: 2px; }
          100% { transform: scale(1.5); opacity: 0; border-width: 1px; }
        }
      `}</style>
    </div>
  );
});
