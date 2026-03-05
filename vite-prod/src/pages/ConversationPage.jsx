import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, ArrowLeft, AlertCircle, Sparkles } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useUserProgress } from '../contexts/UserProgressContext.jsx';
import { t, lf, RTL_LANGS } from '../utils/translations.js';
import useSpeechRecognition from '../hooks/useSpeechRecognition.js';
import useSpeechSynthesis from '../hooks/useSpeechSynthesis.js';
import { stopAllAudio } from '../utils/hebrewAudio.js';
import GlassCard from '../components/shared/GlassCard.jsx';
import AnimatedButton from '../components/shared/AnimatedButton.jsx';
import LoadingSpinner from '../components/shared/LoadingSpinner.jsx';

const SCENARIOS = [
  { id: 'free', emoji: '💬', label: 'Free Chat', labelHe: 'שיחה חופשית', labelAr: 'محادثة حرة', labelRu: 'Свободный разговор', desc: 'Talk about anything', descHe: 'דברו על מה שתרצו', descAr: 'تحدث عن أي شيء تريد', descRu: 'Говори на любую тему' },
  { id: 'restaurant', emoji: '🍽️', label: 'Restaurant', labelHe: 'מסעדה', labelAr: 'مطعم', labelRu: 'Ресторан', desc: 'Order food & drinks', descHe: 'הזמנת אוכל ושתייה', descAr: 'طلب الطعام والمشروبات', descRu: 'Заказ еды и напитков' },
  { id: 'airport', emoji: '✈️', label: 'Airport', labelHe: 'שדה תעופה', labelAr: 'المطار', labelRu: 'Аэропорт', desc: 'Navigate the airport', descHe: 'ניווט בשדה התעופה', descAr: 'التنقل في المطار', descRu: 'Навигация в аэропорту' },
  { id: 'job-interview', emoji: '💼', label: 'Job Interview', labelHe: 'ראיון עבודה', labelAr: 'مقابلة عمل', labelRu: 'Собеседование', desc: 'Practice interviews', descHe: 'תרגול ראיונות', descAr: 'تدريب على المقابلات', descRu: 'Практика собеседований' },
  { id: 'doctor', emoji: '🏥', label: 'Doctor', labelHe: 'רופא', labelAr: 'طبيب', labelRu: 'Врач', desc: 'Medical appointment', descHe: 'ביקור אצל הרופא', descAr: 'موعد طبي', descRu: 'Визит к врачу' },
  { id: 'hotel', emoji: '🏨', label: 'Hotel', labelHe: 'מלון', labelAr: 'فندق', labelRu: 'Гостиница', desc: 'Check in & requests', descHe: 'צ\'ק-אין ובקשות', descAr: 'تسجيل الوصول والطلبات', descRu: 'Заселение и запросы' },
  { id: 'small-talk', emoji: '☕', label: 'Small Talk', labelHe: 'שיחת חולין', labelAr: 'دردشة عابرة', labelRu: 'Светская беседа', desc: 'Casual conversation', descHe: 'שיחה יומיומית', descAr: 'محادثة يومية غير رسمية', descRu: 'Непринуждённый разговор' },
];

function ChatBubble({ message, onSpeak }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-slide-up`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
        isUser
          ? 'bg-brand-500 text-white rounded-br-md'
          : 'glass-card !rounded-bl-md'
      }`}>
        <p className={`text-sm ${isUser ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
          {message.content}
        </p>
        {!isUser && (
          <button
            onClick={() => onSpeak(message.content)}
            className="mt-1 p-1 rounded hover:bg-black/5 dark:hover:bg-white/5"
          >
            <Volume2 size={14} className="text-gray-400" />
          </button>
        )}
        {message.correction && (
          <div className="mt-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-1 mb-1">
              <AlertCircle size={12} className="text-amber-600" />
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Correction</span>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-300 line-through">{message.correction.original}</p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">{message.correction.corrected}</p>
            {message.correction.explanation && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{message.correction.explanation}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConversationPage() {
  const { uiLang } = useTheme();
  const { user } = useAuth();
  const { progress, addXP } = useUserProgress();
  const { speak } = useSpeechSynthesis();
  const { transcript, isListening, startListening, stopListening, sttSupported } = useSpeechRecognition();
  const [scenario, setScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [useMic, setUseMic] = useState(false);
  const chatEndRef = useRef(null);

  // Stop all audio and speech recognition on unmount
  useEffect(() => () => { stopAllAudio(); stopListening(); }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (transcript && useMic) {
      setInput(transcript);
    }
  }, [transcript, useMic]);

  const startScenario = (s) => {
    setScenario(s);
    const greeting = s.id === 'free'
      ? "Hi there! Let's have a conversation in English. What would you like to talk about?"
      : `Welcome! Let's practice a ${s.label.toLowerCase()} scenario. I'll be the ${s.id === 'restaurant' ? 'waiter' : s.id === 'doctor' ? 'doctor' : s.id === 'hotel' ? 'receptionist' : s.id === 'job-interview' ? 'interviewer' : 'other person'}. Let's begin!`;

    setMessages([{ role: 'assistant', content: greeting }]);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.slice(-20),
          scenario: scenario?.id || 'free',
          cefrLevel: progress.cefrLevel || 'A1',
          uiLang,
        }),
      });

      if (!res.ok) throw new Error('API error');

      const data = await res.json();
      const assistantMsg = {
        role: 'assistant',
        content: data.reply,
        correction: data.correction || null,
      };
      setMessages(prev => [...prev, assistantMsg]);

      // Award XP once after exactly 5 exchanges
      if (newMessages.filter(m => m.role === 'user').length === 5) {
        addXP(15, 'conversation');
      }
    } catch (err) {
      // Fallback response when API is unavailable
      const fallback = {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please check your internet connection and try again.",
      };
      setMessages(prev => [...prev, fallback]);
    }

    setLoading(false);
  };

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
      setUseMic(false);
    } else {
      startListening();
      setUseMic(true);
    }
  };

  // Scenario Selection
  if (!scenario) {
    return (
      <div className="pb-24 px-4 pt-4 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('scenarios', uiLang)}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('chooseScenario', uiLang)}
        </p>
        <div className="space-y-3">
          {SCENARIOS.map(s => (
            <GlassCard
              key={s.id}
              className="cursor-pointer"
              onClick={() => startScenario(s)}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{s.emoji}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {lf(s, 'label', uiLang)}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {lf(s, 'desc', uiLang)}
                  </p>
                </div>
                <Sparkles size={18} className="text-brand-400" />
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    );
  }

  // Chat View
  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200/50 dark:border-gray-700/50">
        <button onClick={() => { setScenario(null); setMessages([]); }} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
          <ArrowLeft size={20} className={RTL_LANGS.includes(uiLang) ? 'rotate-180' : ''} />
        </button>
        <span className="text-xl">{scenario.emoji}</span>
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {lf(scenario, 'label', uiLang)}
        </h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 hide-scrollbar">
        {messages.map((msg, i) => (
          <ChatBubble key={i} message={msg} onSpeak={speak} />
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="glass-card !rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-200/50 dark:border-gray-700/50 glass-card-strong !rounded-none">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={t('typeMessage', uiLang)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 border-none"
          />
          {sttSupported && (
            <button
              onClick={handleMicToggle}
              className={`p-2.5 rounded-xl transition-all ${
                isListening
                  ? 'bg-red-500 text-white recording-pulse'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
              }`}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          )}
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-brand-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
