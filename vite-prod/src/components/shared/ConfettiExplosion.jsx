import React, { useEffect, useState } from 'react';

const COLORS = ['#4263eb', '#7c3aed', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4'];

export default function ConfettiExplosion({ trigger, duration = 2000 }) {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (!trigger) return;

    const newPieces = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.5,
      size: 6 + Math.random() * 6,
      rotation: Math.random() * 360,
    }));
    setPieces(newPieces);

    const timer = setTimeout(() => setPieces([]), duration);
    return () => clearTimeout(timer);
  }, [trigger, duration]);

  if (pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            top: '-10px',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}
