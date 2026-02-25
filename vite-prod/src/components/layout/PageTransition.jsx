import React, { useState, useEffect } from 'react';

export default function PageTransition({ children, pageKey }) {
  const [displayedKey, setDisplayedKey] = useState(pageKey);
  const [animClass, setAnimClass] = useState('page-enter-active');

  useEffect(() => {
    if (pageKey !== displayedKey) {
      setAnimClass('page-exit-active');
      const timer = setTimeout(() => {
        setDisplayedKey(pageKey);
        setAnimClass('page-enter-active');
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [pageKey, displayedKey]);

  return (
    <div className={`transition-all duration-200 ${animClass}`} key={displayedKey}>
      {children}
    </div>
  );
}
