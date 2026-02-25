import React from 'react';

export default function GlassCard({ children, className = '', variant = 'default', onClick, ...props }) {
  const base = variant === 'strong' ? 'glass-card-strong' : variant === 'subtle' ? 'glass-card-subtle' : 'glass-card';

  return (
    <div
      className={`${base} p-4 ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}
