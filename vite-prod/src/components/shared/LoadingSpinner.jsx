import React from 'react';

export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className={`${sizes[size]} border-3 border-brand-200 border-t-brand-500 rounded-full animate-spin`}
        style={{ borderWidth: size === 'sm' ? 2 : 3 }}
      />
      {text && <p className="text-sm text-gray-500 dark:text-gray-400">{text}</p>}
    </div>
  );
}
