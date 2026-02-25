import React, { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';

export default function AchievementToast({ achievement, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 300);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onDismiss]);

  if (!achievement) return null;

  return (
    <div className={`toast-container ${visible ? '' : 'pointer-events-none'}`}>
      <div className={`toast ${visible ? '' : 'toast-exit'}`}
        style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.95), rgba(239,68,68,0.95))' }}
      >
        <Trophy size={22} className="text-white flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-white font-bold text-sm truncate">{achievement.title}</p>
          <p className="text-white/80 text-xs truncate">{achievement.description}</p>
        </div>
      </div>
    </div>
  );
}
