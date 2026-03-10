import React from 'react';
import { Mic, Bell, X } from 'lucide-react';
import { t } from '../utils/translations.js';

const ICONS = {
  microphone: Mic,
  notification: Bell,
};

/**
 * Pre-permission dialog shown BEFORE the browser's native permission prompt.
 * Apple requires a clear explanation of why the app needs each permission.
 *
 * @param {'microphone'|'notification'} type
 * @param {string} lang - UI language
 * @param {() => void} onAllow
 * @param {() => void} onDeny
 */
export default function PermissionDialog({ type, lang, onAllow, onDeny }) {
  const isRTL = lang === 'he' || lang === 'ar';
  const Icon = ICONS[type] || Mic;

  const titleKey = type === 'notification' ? 'notifPermissionTitle' : 'micPermissionTitle';
  const descKey = type === 'notification' ? 'notifPermissionDesc' : 'micPermissionDesc';
  const allowKey = type === 'notification' ? 'notifPermissionAllow' : 'micPermissionAllow';
  const denyKey = type === 'notification' ? 'notifPermissionDeny' : 'micPermissionDeny';

  const iconBg = type === 'notification' ? '#f59e0b' : '#3b82f6';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        padding: 16,
      }}
      onClick={onDeny}
    >
      <div
        dir={isRTL ? 'rtl' : 'ltr'}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 20,
          padding: '28px 24px',
          maxWidth: 360,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          onClick={onDeny}
          style={{
            position: 'absolute',
            top: 12,
            [isRTL ? 'left' : 'right']: 12,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            color: '#9ca3af',
          }}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <Icon size={32} color="#fff" />
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: '#1e293b',
            marginBottom: 8,
            fontFamily: "'Fredoka', 'Heebo', sans-serif",
          }}
        >
          {t(titleKey, lang)}
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            color: '#64748b',
            marginBottom: 24,
            fontFamily: "'Heebo', sans-serif",
          }}
        >
          {t(descKey, lang)}
        </p>

        {/* Allow button */}
        <button
          onClick={onAllow}
          style={{
            width: '100%',
            padding: '14px 20px',
            borderRadius: 14,
            border: 'none',
            background: iconBg,
            color: '#fff',
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: "'Fredoka', 'Heebo', sans-serif",
            marginBottom: 10,
          }}
        >
          {t(allowKey, lang)}
        </button>

        {/* Deny button */}
        <button
          onClick={onDeny}
          style={{
            width: '100%',
            padding: '12px 20px',
            borderRadius: 14,
            border: 'none',
            background: 'transparent',
            color: '#9ca3af',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: "'Fredoka', 'Heebo', sans-serif",
          }}
        >
          {t(denyKey, lang)}
        </button>
      </div>
    </div>
  );
}
