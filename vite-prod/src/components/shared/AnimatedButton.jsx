import React from 'react';

export default function AnimatedButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25',
    danger: 'px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-red-500 to-pink-500 shadow-lg shadow-red-500/25',
    ghost: 'px-6 py-3 rounded-xl font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
  };

  const sizes = {
    sm: '!px-4 !py-2 text-sm',
    md: '',
    lg: '!px-8 !py-4 text-lg',
    full: 'w-full',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${variants[variant]} ${sizes[size]} inline-flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none ${className}`}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18} />}
      {children}
    </button>
  );
}
