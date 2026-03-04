import React, { useState, useEffect, useRef } from 'react';

export default function PageTransition({ children, pageKey }) {
  const [displayedKey, setDisplayedKey] = useState(pageKey);
  const [animClass, setAnimClass] = useState('page-enter-active');
  const prevChildrenRef = useRef(children);

  // Keep a snapshot of the old children during exit animation
  if (pageKey === displayedKey) {
    prevChildrenRef.current = children;
  }

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

  // During exit, show old children; otherwise show current
  const displayedChildren = pageKey !== displayedKey ? prevChildrenRef.current : children;

  return (
    <div className={`transition-all duration-200 ${animClass}`} key={displayedKey}>
      {displayedChildren}
    </div>
  );
}
