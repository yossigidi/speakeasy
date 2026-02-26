import React from 'react';

export default function SpeechBubble({ text, direction = 'rtl', visible = true }) {
  if (!visible || !text) return null;
  return (
    <div style={{
      direction, animation: 'teacher-bubble-in 0.3s ease',
      background: 'white', borderRadius: 16, padding: '10px 16px', maxWidth: 220,
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)', position: 'relative',
      fontSize: 15, fontWeight: 500, lineHeight: 1.4,
      textAlign: direction === 'rtl' ? 'right' : 'left'
    }}>
      {text}
      <div style={{
        position: 'absolute', bottom: -8,
        left: direction === 'rtl' ? 'auto' : 20,
        right: direction === 'rtl' ? 20 : 'auto',
        width: 0, height: 0,
        borderLeft: '8px solid transparent',
        borderRight: '8px solid transparent',
        borderTop: '10px solid white'
      }} />
    </div>
  );
}
