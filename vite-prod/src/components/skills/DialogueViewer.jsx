import React, { useState, useEffect, useRef } from 'react';
import { Volume2 } from 'lucide-react';
import { t } from '../../utils/translations.js';

export default function DialogueViewer({ dialogue, phrases, uiLang, speak, onComplete }) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [tooltip, setTooltip] = useState(null);
  const scrollRef = useRef(null);
  const autoPlayRef = useRef(null);
  const tooltipTimerRef = useRef(null);
  const speakRef = useRef(speak);
  speakRef.current = speak;

  const { speakers, lines } = dialogue;

  // Auto-reveal lines one by one with TTS
  useEffect(() => {
    if (visibleLines >= lines.length) return;

    // Dynamic delay based on previous line's word count (300ms per word + 1000ms base, min 2500ms)
    let delay = 500;
    if (visibleLines > 0) {
      const prevText = lines[visibleLines - 1]?.text || '';
      const wordCount = prevText.split(/\s+/).filter(Boolean).length;
      delay = Math.max(2500, 1000 + wordCount * 300);
    }

    autoPlayRef.current = setTimeout(() => {
      const nextIndex = visibleLines;
      setVisibleLines(nextIndex + 1);

      // Auto-speak the new line (use ref to avoid stale closure)
      if (speakRef.current && lines[nextIndex]) {
        speakRef.current(lines[nextIndex].text, { lang: 'en', rate: 0.9 });
      }
    }, delay);

    return () => clearTimeout(autoPlayRef.current);
  }, [visibleLines, lines.length]);

  // Scroll to bottom when new lines appear
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleLines]);

  const getSpeaker = (speakerId) => speakers.find(s => s.id === speakerId) || { name: speakerId, emoji: '🗣️' };

  const handleLineTap = (line) => {
    if (speak) {
      speak(line.text, { lang: 'en', rate: 0.9 });
    }
  };

  const findHebrewForPhrase = (phrase) => {
    if (!phrases) return phrase;
    const match = phrases.find(p => p.en.toLowerCase().includes(phrase.toLowerCase()));
    return match ? match.he : phrase;
  };

  const handlePhraseTap = (phrase) => {
    clearTimeout(tooltipTimerRef.current);
    setTooltip(tooltip === phrase ? null : phrase);
    tooltipTimerRef.current = setTimeout(() => setTooltip(null), 3000);
  };

  // Cleanup tooltip timer on unmount
  useEffect(() => {
    return () => clearTimeout(tooltipTimerRef.current);
  }, []);

  const renderLineText = (text, keyPhrases = []) => {
    if (!keyPhrases || keyPhrases.length === 0) return text;

    const parts = [];
    let remaining = text;

    for (const phrase of keyPhrases) {
      const index = remaining.toLowerCase().indexOf(phrase.toLowerCase());
      if (index !== -1) {
        if (index > 0) parts.push({ text: remaining.slice(0, index), bold: false });
        parts.push({ text: remaining.slice(index, index + phrase.length), bold: true, phrase });
        remaining = remaining.slice(index + phrase.length);
      }
    }
    if (remaining) parts.push({ text: remaining, bold: false });

    if (parts.length === 0) return text;

    return parts.map((part, i) => (
      part.bold ? (
        <span
          key={i}
          onClick={(e) => { e.stopPropagation(); handlePhraseTap(part.phrase); }}
          style={{
            fontWeight: 700,
            color: '#0EA5E9',
            textDecoration: 'underline',
            textDecorationStyle: 'dotted',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          {part.text}
          {tooltip === part.phrase && (
            <span style={{
              position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
              background: '#1F2937', color: 'white', padding: '4px 10px', borderRadius: 8,
              fontSize: 12, whiteSpace: 'nowrap', zIndex: 10,
              animation: 'curriculum-fade-in 0.2s ease',
            }}>
              {findHebrewForPhrase(part.phrase)}
            </span>
          )}
        </span>
      ) : (
        <span key={i}>{part.text}</span>
      )
    ));
  };

  const allRevealed = visibleLines >= lines.length;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: 'calc(env(safe-area-inset-top, 0px) + 16px) 20px 12px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0369A1' }}>
          {t('dialogue', uiLang)}
        </div>
        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
          {t('dialogueInstructions', uiLang)}
        </div>
      </div>

      {/* Chat area */}
      <div
        ref={scrollRef}
        style={{
          flex: 1, overflow: 'auto', padding: '12px 16px',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}
      >
        {lines.slice(0, visibleLines).map((line, i) => {
          const speaker = getSpeaker(line.speaker);
          const isUser = line.speaker === 'you';

          return (
            <div
              key={i}
              onClick={() => handleLineTap(line)}
              style={{
                display: 'flex',
                flexDirection: isUser ? 'row-reverse' : 'row',
                gap: 8,
                animation: 'dialogue-slide-in 0.4s ease',
                cursor: 'pointer',
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: isUser
                  ? 'linear-gradient(135deg, #10B981, #059669)'
                  : 'linear-gradient(135deg, #3B82F6, #2563EB)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
              }}>
                {speaker.emoji}
              </div>

              {/* Bubble */}
              <div style={{
                maxWidth: '75%',
                background: isUser ? '#DCF8E7' : 'white',
                padding: '10px 14px',
                borderRadius: 16,
                borderBottomRightRadius: isUser ? 4 : 16,
                borderBottomLeftRadius: isUser ? 16 : 4,
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', marginBottom: 4 }}>
                  {speaker.name}
                </div>
                <div style={{ fontSize: 15, color: '#1F2937', lineHeight: 1.5 }}>
                  {renderLineText(line.text, line.keyPhrases)}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleLineTap(line); }}
                  style={{
                    marginTop: 4, padding: '2px 6px', borderRadius: 6,
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 3,
                  }}
                >
                  <Volume2 size={12} style={{ color: '#0EA5E9' }} />
                </button>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {!allRevealed && (
          <div style={{
            display: 'flex', gap: 4, padding: '8px 12px',
            animation: 'dialogue-slide-in 0.3s ease',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#9CA3AF', animation: 'typing-dot 1s infinite 0s' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#9CA3AF', animation: 'typing-dot 1s infinite 0.2s' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#9CA3AF', animation: 'typing-dot 1s infinite 0.4s' }} />
          </div>
        )}
      </div>

      {/* Continue button */}
      {allRevealed && (
        <div style={{
          padding: '16px 20px calc(env(safe-area-inset-bottom, 0px) + 16px)',
          animation: 'curriculum-fade-in 0.5s ease',
        }}>
          <button
            onClick={onComplete}
            style={{
              width: '100%', padding: '16px', borderRadius: 16,
              fontSize: 17, fontWeight: 700,
              background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
              color: 'white', border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(59,130,246,0.35)',
              minHeight: 52,
            }}
          >
            {t('continue', uiLang)}
          </button>
        </div>
      )}

      <style>{`
        @keyframes dialogue-slide-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes typing-dot {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
        @keyframes curriculum-fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
