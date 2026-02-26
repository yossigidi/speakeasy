import React from 'react';

export default function PathConnector({ color = '#E5E7EB', completed = false }) {
  return (
    <div className="flex justify-center py-1">
      <svg width="60" height="40" viewBox="0 0 60 40">
        <path
          d="M 30 0 Q 45 20 30 40"
          fill="none"
          stroke={completed ? color : '#D1D5DB'}
          strokeWidth="3"
          strokeDasharray={completed ? 'none' : '6 4'}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
