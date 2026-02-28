import React, { useState, useRef, useEffect } from 'react';
import { Send, Volume2, Mic, MicOff, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { useUserProgress } from '../../contexts/UserProgressContext.jsx';
import { useSpeech } from '../../contexts/SpeechContext.jsx';
import useSpeechRecognition from '../../hooks/useSpeechRecognition.js';
import { t } from '../../utils/translations.js';

export default function SkillSimulationRunner({ simulation, onComplete, uiLang }) {
  const { progress } = useUserProgress();
  const { speak } = useSpeech();
  const { transcript, isActive: isListening, startListening, stopListening, sttSupported } = useSpeechRecognition();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [metrics, setMetrics] = useState({ clarity: 0, grammar: 0, vocabulary: 0, confidence: 0 });
  const [corrections, setCorrections] = useState([]);
  const [finished, setFinished] = useState(false);

  const chatRef = useRef(null);
  const inputRef = useRef(null);

  const { npcName, npcRole, context, steps } = simulation;

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-populate input from speech recognition
  useEffect(() => {
    if (transcript && !isListening) {
      setInputText(prev => prev ? prev + ' ' + transcript : transcript);
    }
  }, [transcript, isListening]);

  // Initial NPC greeting
  useEffect(() => {
    const greeting = `Hi! ${context.split('.')[0]}.`;
    setMessages([{ role: 'assistant', content: greeting }]);
    if (speak) {
      setTimeout(() => speak(greeting, { lang: 'en', rate: 0.9 }), 500);
    }
  }, []);

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || isLoading || finished) return;

    const userMsg = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioContext: context,
          npcRole: npcRole,
          npcName: npcName,
          npcPersonality: 'Friendly and professional',
          userMessage: text,
          cefrLevel: progress.cefrLevel || 'A2',
          uiLang,
          history: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          evaluationFocus: ['clarity', 'grammar', 'vocabulary', 'confidence'],
          step: currentStep + 1,
          freeMode: false,
          industry: 'tech',
        }),
      });

      const data = await res.json();

      // Add NPC reply
      if (data.npcReply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.npcReply, correction: data.correction, mistakes: data.mistakes }]);
        if (speak) {
          speak(data.npcReply, { lang: 'en', rate: 0.9 });
        }
      }

      // Update metrics (true arithmetic average)
      if (data.metrics) {
        const count = currentStep + 1;
        setMetrics(prev => ({
          clarity: Math.round(((prev.clarity * currentStep) + data.metrics.clarity) / count),
          grammar: Math.round(((prev.grammar * currentStep) + data.metrics.grammar) / count),
          vocabulary: Math.round(((prev.vocabulary * currentStep) + data.metrics.vocabulary) / count),
          confidence: Math.round(((prev.confidence * currentStep) + data.metrics.confidence) / count),
        }));
      }

      // Collect corrections
      if (data.correction) {
        setCorrections(prev => [...prev, data.correction]);
      }

      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);

      // End after all steps
      if (nextStep >= steps.length) {
        setFinished(true);
      }
    } catch (err) {
      console.error('Simulation API error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't process that. Let's continue." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    const avg = Math.round((metrics.clarity + metrics.grammar + metrics.vocabulary + metrics.confidence) / 4);
    onComplete(avg);
  };

  const currentHint = steps[currentStep]?.hint;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: '#FAFAFA',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: 'calc(env(safe-area-inset-top, 0px) + 12px) 16px 12px',
        background: 'white', borderBottom: '1px solid #F3F4F6',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 13, fontWeight: 700,
          }}>
            {npcName[0]}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1F2937' }}>{npcName}</div>
            <div style={{ fontSize: 11, color: '#6B7280' }}>{npcRole}</div>
          </div>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 4 }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              width: 24, height: 4, borderRadius: 2,
              background: i < currentStep ? '#10B981' : i === currentStep ? '#3B82F6' : '#E5E7EB',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>
      </div>

      {/* Hint bar */}
      {currentHint && !finished && (
        <div style={{
          padding: '8px 16px', background: '#FEF3C7', borderBottom: '1px solid #FDE68A',
          fontSize: 12, color: '#92400E', fontWeight: 600,
          direction: uiLang === 'he' ? 'rtl' : 'ltr',
        }}>
          💡 {currentHint}
        </div>
      )}

      {/* Chat area */}
      <div ref={chatRef} style={{ flex: 1, overflow: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((msg, i) => {
          const isUser = msg.role === 'user';
          return (
            <div key={i}>
              <div style={{
                display: 'flex', flexDirection: isUser ? 'row-reverse' : 'row', gap: 8,
              }}>
                <div style={{
                  maxWidth: '80%', padding: '10px 14px', borderRadius: 16,
                  borderBottomRightRadius: isUser ? 4 : 16,
                  borderBottomLeftRadius: isUser ? 16 : 4,
                  background: isUser ? '#DCF8E7' : 'white',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}>
                  <div style={{ fontSize: 14, color: '#1F2937', lineHeight: 1.5 }}>{msg.content}</div>
                  {!isUser && (
                    <button
                      onClick={() => speak && speak(msg.content, { lang: 'en', rate: 0.9 })}
                      style={{ marginTop: 4, padding: 2, background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <Volume2 size={12} style={{ color: '#0EA5E9' }} />
                    </button>
                  )}
                </div>
              </div>

              {/* Inline correction */}
              {msg.correction && (
                <div style={{
                  marginTop: 6, marginLeft: isUser ? 0 : 44, marginRight: isUser ? 44 : 0,
                  padding: '8px 12px', borderRadius: 10,
                  background: '#FEF3C7', border: '1px solid #FDE68A',
                  fontSize: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <AlertTriangle size={12} style={{ color: '#D97706' }} />
                    <span style={{ fontWeight: 700, color: '#92400E' }}>{t('correction', uiLang)}</span>
                  </div>
                  <div style={{ color: '#DC2626', textDecoration: 'line-through' }}>{msg.correction.original}</div>
                  <div style={{ color: '#059669', fontWeight: 600 }}>{msg.correction.corrected}</div>
                  <div style={{ color: '#6B7280', marginTop: 2 }}>{msg.correction.explanation}</div>
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div style={{ display: 'flex', gap: 4, padding: '8px 12px' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#9CA3AF', animation: 'typing-dot 1s infinite 0s' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#9CA3AF', animation: 'typing-dot 1s infinite 0.2s' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#9CA3AF', animation: 'typing-dot 1s infinite 0.4s' }} />
          </div>
        )}
      </div>

      {/* Metrics bar */}
      {(metrics.clarity > 0 || metrics.grammar > 0) && (
        <div style={{
          padding: '6px 16px', background: 'white', borderTop: '1px solid #F3F4F6',
          display: 'flex', gap: 12, justifyContent: 'center',
        }}>
          {[
            { label: uiLang === 'he' ? 'בהירות' : 'Clarity', val: metrics.clarity },
            { label: uiLang === 'he' ? 'דקדוק' : 'Grammar', val: metrics.grammar },
            { label: uiLang === 'he' ? 'אוצר' : 'Vocab', val: metrics.vocabulary },
          ].map(m => (
            <div key={m.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: m.val >= 70 ? '#10B981' : '#F59E0B' }}>{m.val}%</div>
              <div style={{ fontSize: 9, color: '#9CA3AF' }}>{m.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Input or Finish */}
      {finished ? (
        <div style={{
          padding: '16px 20px calc(env(safe-area-inset-bottom, 0px) + 16px)',
          background: 'white', borderTop: '1px solid #F3F4F6',
        }}>
          <button
            onClick={handleFinish}
            style={{
              width: '100%', padding: '16px', borderRadius: 16,
              fontSize: 17, fontWeight: 700,
              background: 'linear-gradient(135deg, #10B981, #059669)',
              color: 'white', border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(16,185,129,0.35)',
              minHeight: 52,
            }}
          >
            {t('continue', uiLang)}
          </button>
        </div>
      ) : (
        <div style={{
          padding: '10px 16px calc(env(safe-area-inset-bottom, 0px) + 10px)',
          background: 'white', borderTop: '1px solid #F3F4F6',
          display: 'flex', gap: 8, alignItems: 'flex-end',
        }}>
          {/* Mic button */}
          {sttSupported && (
            <button
              onClick={() => isListening ? stopListening() : startListening('en-US')}
              style={{
                width: 44, height: 44, borderRadius: '50%', border: 'none',
                background: isListening ? '#EF4444' : '#F3F4F6',
                color: isListening ? 'white' : '#6B7280',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          )}

          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={t('typeMessage', uiLang)}
            style={{
              flex: 1, padding: '12px 16px', borderRadius: 24,
              border: '2px solid #E5E7EB', fontSize: 14,
              background: '#F9FAFB', outline: 'none',
            }}
            dir="ltr"
          />

          <button
            onClick={sendMessage}
            disabled={!inputText.trim() || isLoading}
            style={{
              width: 44, height: 44, borderRadius: '50%', border: 'none',
              background: inputText.trim() ? 'linear-gradient(135deg, #3B82F6, #2563EB)' : '#E5E7EB',
              color: 'white', cursor: inputText.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Send size={18} />
          </button>
        </div>
      )}

      <style>{`
        @keyframes typing-dot {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
