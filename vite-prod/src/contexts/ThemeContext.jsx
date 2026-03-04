import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('se-theme') || 'light');
  const [uiLang, setUiLang] = useState(() => localStorage.getItem('se-lang') || 'he');

  const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const dir = uiLang === 'he' ? 'rtl' : 'ltr';

  useEffect(() => {
    localStorage.setItem('se-theme', theme);
    document.documentElement.classList.toggle('dark', isDark);
  }, [theme, isDark]);

  useEffect(() => {
    localStorage.setItem('se-lang', uiLang);
    document.body.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', uiLang);
  }, [uiLang, dir]);

  useEffect(() => {
    if (theme !== 'auto') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => document.documentElement.classList.toggle('dark', mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : prev === 'dark' ? 'auto' : 'light');
  }, []);

  const toggleLang = useCallback(() => {
    setUiLang(prev => prev === 'he' ? 'en' : 'he');
  }, []);

  const value = useMemo(() => (
    { theme, setTheme, toggleTheme, isDark, uiLang, setUiLang, toggleLang, dir }
  ), [theme, toggleTheme, isDark, uiLang, toggleLang, dir]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
