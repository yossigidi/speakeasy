import React from 'react';
import { Zap, Flame, Crown, Star } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useUserProgress } from '../contexts/UserProgressContext.jsx';
import { t } from '../utils/translations.js';

export default function ProfilePickerPage({ onSelect }) {
  const { uiLang } = useTheme();
  const { user } = useAuth();
  const { children, switchToChild, switchToParent, progress } = useUserProgress();

  const handleParent = () => {
    switchToParent();
    onSelect();
  };

  const handleChild = (childId) => {
    switchToChild(childId);
    onSelect();
  };

  const parentName = user?.displayName || user?.email?.split('@')[0] || t('parentProfile', uiLang);
  const parentInitial = parentName.charAt(0).toUpperCase();

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(180deg, #030712 0%, #0f172a 50%, #0d3b3a 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      paddingTop: 'max(48px, env(safe-area-inset-top, 48px))',
      paddingBottom: 'max(48px, env(safe-area-inset-bottom, 48px))',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow orbs */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(20,184,166,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '-10%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Icon with glow */}
      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '120px',
          height: '120px',
          background: 'radial-gradient(circle, rgba(20,184,166,0.3) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <img
          src="/images/speakli-icon.webp"
          alt="Speakli"
          style={{
            width: '100px',
            height: 'auto',
            position: 'relative',
            zIndex: 1,
            filter: 'drop-shadow(0 8px 32px rgba(20,184,166,0.3))',
          }}
        />
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: '26px',
        fontWeight: 700,
        color: '#ffffff',
        marginBottom: '4px',
        textAlign: 'center',
      }}>
        {t('whoIsLearning', uiLang)}
      </h1>
      <p style={{
        fontSize: '14px',
        color: 'rgba(255,255,255,0.4)',
        marginBottom: '36px',
        letterSpacing: '2px',
        textTransform: 'uppercase',
      }}>
        Speakli
      </p>

      {/* Profile Cards */}
      <div style={{
        width: '100%',
        maxWidth: '380px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}>
        {/* Parent Card */}
        <button
          onClick={handleParent}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '18px 20px',
            borderRadius: '20px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textAlign: 'start',
            outline: 'none',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.borderColor = 'rgba(20,184,166,0.5)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(20,184,166,0.15)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          onTouchStart={e => {
            e.currentTarget.style.transform = 'scale(0.97)';
          }}
          onTouchEnd={e => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {/* Parent Avatar */}
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #14b8a6, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 700,
            color: '#fff',
            flexShrink: 0,
            boxShadow: '0 4px 16px rgba(20,184,166,0.3)',
            position: 'relative',
          }}>
            {parentInitial}
            <div style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(245,158,11,0.4)',
            }}>
              <Crown size={12} color="#fff" />
            </div>
          </div>

          {/* Parent Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#ffffff',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {parentName}
            </h3>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              marginTop: '4px',
              fontSize: '13px',
              color: 'rgba(255,255,255,0.5)',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Zap size={14} color="#14b8a6" />
                {progress.xp || 0} XP
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Flame size={14} color={(progress.streak > 0) ? '#f97316' : 'rgba(255,255,255,0.3)'} />
                {progress.streak || 0}
              </span>
              <span>{t('level', uiLang)} {progress.level || 1}</span>
            </div>
          </div>
        </button>

        {/* Children Cards */}
        {children.map((child, idx) => (
          <button
            key={child.id}
            onClick={() => handleChild(child.id)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '18px 20px',
              borderRadius: '20px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'start',
              outline: 'none',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.borderColor = 'rgba(20,184,166,0.5)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(20,184,166,0.15)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            onTouchStart={e => {
              e.currentTarget.style.transform = 'scale(0.97)';
            }}
            onTouchEnd={e => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {/* Child Avatar */}
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: child.avatarColor
                ? `linear-gradient(135deg, ${getGradientColors(child.avatarColor)})`
                : 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              flexShrink: 0,
              boxShadow: '0 4px 16px rgba(139,92,246,0.25)',
              position: 'relative',
            }}>
              {child.avatar}
              <div style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(96,165,250,0.4)',
              }}>
                <Star size={12} color="#fff" fill="#fff" />
              </div>
            </div>

            {/* Child Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#ffffff',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {child.name}
                {child.age && (
                  <span style={{
                    fontSize: '13px',
                    fontWeight: 400,
                    color: 'rgba(255,255,255,0.35)',
                    marginRight: '6px',
                    marginLeft: '6px',
                  }}>
                    ({child.age})
                  </span>
                )}
              </h3>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                marginTop: '4px',
                fontSize: '13px',
                color: 'rgba(255,255,255,0.5)',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Zap size={14} color="#a78bfa" />
                  {child.xp || 0} XP
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Flame size={14} color={(child.streak > 0) ? '#f97316' : 'rgba(255,255,255,0.3)'} />
                  {child.streak || 0}
                </span>
                <span>{t('level', uiLang)} {child.level || 1}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function getGradientColors(tailwindClass) {
  const colorMap = {
    'from-purple-500 to-violet-600': '#8b5cf6, #7c3aed',
    'from-pink-500 to-rose-600': '#ec4899, #e11d48',
    'from-blue-500 to-indigo-600': '#3b82f6, #4f46e5',
    'from-green-500 to-emerald-600': '#22c55e, #059669',
    'from-orange-500 to-amber-600': '#f97316, #d97706',
    'from-cyan-500 to-teal-600': '#06b6d4, #0d9488',
    'from-red-500 to-rose-600': '#ef4444, #e11d48',
    'from-yellow-500 to-amber-600': '#eab308, #d97706',
  };
  return colorMap[tailwindClass] || '#8b5cf6, #6d28d9';
}
