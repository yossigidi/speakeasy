import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Mic, Square, RotateCcw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useUserProgress } from '../contexts/UserProgressContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import useSpeechRecognition from '../hooks/useSpeechRecognition.js';
import { playFromAPI, stopAllAudio } from '../utils/hebrewAudio.js';
import { calcLifeCoachXP } from '../utils/xpCalculator.js';
import { t, lf } from '../utils/translations.js';
import { ADULT_MODES, KIDS_MODES } from '../data/life-coach-modes.js';
import ChatBubble from '../components/shared/ChatBubble.jsx';
import GlassCard from '../components/shared/GlassCard.jsx';
import SpeakliAvatar from '../components/kids/SpeakliAvatar.jsx';
import useUsageLimit from '../hooks/useUsageLimit.js';
import PaywallModal from '../components/subscription/PaywallModal.jsx';

/* ── Timer display ── */
function SessionTimer({ startTime }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  return (
    <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
      {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </span>
  );
}

export default function LifeCoachPage({ onBack }) {
  const { uiLang, dir } = useTheme();
  const { user } = useAuth();
  const { progress, addXP, addSpeakingMinutes, isChildMode, activeChildId } = useUserProgress();
  const { transcript, interimTranscript, isListening, startListening, stopListening, confidence, sttSupported } = useSpeechRecognition();

  const isChild = isChildMode && (!progress.curriculumLevel || progress.curriculumLevel <= 2);
  const modes = isChild ? KIDS_MODES : ADULT_MODES;
  const { isBlocked, increment: incrementUsage } = useUsageLimit('lifeCoach');
  const [showPaywall, setShowPaywall] = useState(false);

  const [phase, setPhase] = useState('mode-select');
  const [mode, setMode] = useState(null);
  const [messages, setMessages] = useState([]);
  const [turnCount, setTurnCount] = useState(0);
  const [allCorrections, setAllCorrections] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState(null);
  const [speakingTimes, setSpeakingTimes] = useState([]);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [sessionXP, setSessionXP] = useState(null);
  const [savedDailyTotal, setSavedDailyTotal] = useState(null);

  const chatEndRef = useRef(null);
  const lastProcessedTranscript = useRef('');
  const endingRef = useRef(false);
  const abortRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => {
      stopAllAudio();
      stopListening();
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // Handle finished recording — guard against stale/duplicate transcripts
  useEffect(() => {
    if (!isListening && transcript && transcript !== lastProcessedTranscript.current && recordingStartTime && phase === 'session') {
      lastProcessedTranscript.current = transcript;
      const speakingTime = (Date.now() - recordingStartTime) / 1000;
      setRecordingStartTime(null);
      handleUserTranscript(transcript, speakingTime);
    }
  }, [isListening, transcript]);

  const selectMode = (m) => {
    if (isBlocked) { setShowPaywall(true); return; }
    incrementUsage();
    setMode(m);
    setPhase('session');
    setMessages([{ role: 'assistant', content: m.opener }]);
    setTurnCount(0);
    setAllCorrections([]);
    setSpeakingTimes([]);
    setSessionStartTime(Date.now());
    playAI(m.opener);
  };

  const playAI = async (text) => {
    if (!text) return;
    stopAllAudio();
    setIsSpeaking(true);
    try {
      const result = await playFromAPI(text, 'en');
      if (result?.started && result.endPromise) await result.endPromise;
    } catch {}
    setIsSpeaking(false);
  };

  const handleStartRecording = () => {
    if (!sttSupported) return;
    stopAllAudio();
    setRecordingStartTime(Date.now());
    startListening({ continuous: true, lang: 'en-US' });
  };

  const handleStopRecording = () => {
    stopListening();
  };

  const handleUserTranscript = async (text, speakingTime) => {
    if (!text.trim()) return;
    setSpeakingTimes(prev => [...prev, speakingTime]);
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setTurnCount(prev => prev + 1);
    setIsAnalyzing(true);

    const history = messages.map(m => ({ role: m.role, content: m.content }));

    try {
      abortRef.current = new AbortController();
      const token = await window.auth?.currentUser?.getIdToken();
      const res = await fetch('/api/life-coach', {
        method: 'POST',
        signal: abortRef.current.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          transcript: text,
          mode: mode?.id || 'free-chat',
          modeContext: mode?.context || '',
          history: history.slice(-20),
          cefrLevel: progress.cefrLevel || 'A1',
          uiLang,
          isChild,
        }),
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();

      const aiMsg = {
        role: 'assistant',
        content: data.reply || "I'd love to hear more!",
        corrections: data.corrections || [],
      };
      setMessages(prev => [...prev, aiMsg]);
      if (data.corrections?.length) {
        setAllCorrections(prev => [...prev, ...data.corrections]);
      }
      playAI(data.reply || "I'd love to hear more!");
    } catch (err) {
      console.error('Life coach API error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: t('tryAgainSpeech', uiLang) || 'Sorry, could you say that again?' }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const endSession = async () => {
    if (endingRef.current) return;
    endingRef.current = true;
    stopAllAudio();
    stopListening();
    if (abortRef.current) abortRef.current.abort();
    const totalMinutes = speakingTimes.reduce((a, b) => a + b, 0) / 60;
    const xpResult = turnCount > 0 ? calcLifeCoachXP(turnCount, totalMinutes) : { base: 0, turnsBonus: 0, minuteBonus: 0, total: 0 };
    setSessionXP(xpResult);
    // Snapshot dailyTotal before Firestore writes to avoid double-counting from onSnapshot
    setSavedDailyTotal(Math.round(((progress.dailyMinutes || 0) + totalMinutes) * 10) / 10);
    setPhase('results');

    try {
      if (xpResult.total > 0) await addXP(xpResult.total, 'lifeCoach');
      if (totalMinutes > 0) await addSpeakingMinutes(totalMinutes, 'lifeCoach');
    } catch {}

    // Save to speaking profile (only if the user actually spoke)
    try {
      if (turnCount > 0 && user?.uid && window.firestore && window.db) {
        const uid = isChild && activeChildId ? activeChildId : user.uid;
        const col = isChild && activeChildId ? 'childProfiles' : 'users';
        const docRef = window.firestore.doc(window.db, col, uid, 'speakingProfile', 'data');
        const snap = await window.firestore.getDoc(docRef);
        const prev = snap.exists() ? snap.data() : {};
        const totalSessions = (prev.totalSessions || 0) + 1;
        await window.firestore.setDoc(docRef, {
          totalSessions,
          totalMinutes: Math.round(((prev.totalMinutes || 0) + totalMinutes) * 10) / 10,
          lastSessionDate: new Date().toISOString().split('T')[0],
        }, { merge: true });
      }
    } catch (err) {
      console.error('Failed to save speaking profile:', err);
    }
  };

  /* ── Render: Mode Selection ── */
  if (phase === 'mode-select') {
    return (
      <div className="min-h-screen pb-8">
        <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
            <ArrowLeft size={20} className={dir === 'rtl' ? 'rotate-180' : ''} />
          </button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">{t('lifeCoach', uiLang)}</h1>
        </div>
        <div className="px-4 pt-4 space-y-4">
          <div className="text-center mb-2">
            <div className="mb-2">
              {isChild
                ? <SpeakliAvatar mode="idle" size="lg" glow />
                : <img src="/images/emma-avatar.webp" alt="Emma" className="w-28 h-28 rounded-full mx-auto shadow-lg" />
              }
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {isChild ? 'Speakli' : 'Emma'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t('chooseConversation', uiLang)}
            </p>
          </div>

          {/* Today's speaking progress mini */}
          <div className="text-center">
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
              {t('todaySpeaking', uiLang)}: {Math.round((progress.dailyMinutes || 0) * 10) / 10} / 5 {t('speakingMinutes', uiLang)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {modes.map(m => (
              <button
                key={m.id}
                onClick={() => selectMode(m)}
                className="rounded-2xl p-4 text-left active:scale-95 transition-all bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md"
              >
                <span className="text-3xl block mb-2">{m.emoji}</span>
                <h3 className="font-bold text-sm text-gray-800 dark:text-white">
                  {lf(m, 'label', uiLang)}
                </h3>
              </button>
            ))}
          </div>
          {!sttSupported && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                {t('micNotSupported', uiLang)}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── Render: Results ── */
  if (phase === 'results') {
    const totalMinutes = Math.round(speakingTimes.reduce((a, b) => a + b, 0) / 60 * 10) / 10;
    const xp = sessionXP || calcLifeCoachXP(turnCount, totalMinutes);
    const dailyTotal = savedDailyTotal != null ? savedDailyTotal : Math.round(((progress.dailyMinutes || 0) + totalMinutes) * 10) / 10;
    const goalPct = Math.min(100, Math.round((dailyTotal / 5) * 100));

    return (
      <div className="min-h-screen pb-8">
        <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
            <ArrowLeft size={20} className={dir === 'rtl' ? 'rotate-180' : ''} />
          </button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">{t('sessionResults', uiLang)}</h1>
        </div>
        <div className="px-4 pt-6 space-y-5">
          <div className="text-center">
            <div className="text-5xl mb-2">{goalPct >= 100 ? '\u{1F389}' : '\u{1F4AA}'}</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {goalPct >= 100 ? t('goalReached', uiLang) : t('greatJob', uiLang)}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {t('todaySpeaking', uiLang)}: {dailyTotal} / 5 {t('speakingMinutes', uiLang)}
            </p>
          </div>

          {/* Progress bar */}
          <div className="h-4 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
              style={{ width: `${goalPct}%` }}
            />
          </div>

          {/* Session stats */}
          <GlassCard className="text-center">
            <div className="flex justify-around">
              <div>
                <div className="text-2xl font-black text-purple-600 dark:text-purple-400">{totalMinutes}</div>
                <div className="text-xs text-gray-500">{t('speakingMinutes', uiLang)}</div>
              </div>
              <div>
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{turnCount}</div>
                <div className="text-xs text-gray-500">{t('turnCount', uiLang).replace('{n}', '').trim()}</div>
              </div>
              <div>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{allCorrections.length}</div>
                <div className="text-xs text-gray-500">{t('corrections', uiLang)}</div>
              </div>
            </div>
          </GlassCard>

          {/* XP Card */}
          <GlassCard className="!bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-amber-700 dark:text-amber-400">{t('sessionXP', uiLang)}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {xp.base} + {xp.turnsBonus} turns + {xp.minuteBonus} time
                </p>
              </div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">+{xp.total} XP</div>
            </div>
          </GlassCard>

          {/* Corrections summary */}
          {allCorrections.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('corrections', uiLang)}</h3>
              <div className="space-y-2">
                {allCorrections.map((c, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm">
                    <span className="text-red-500 line-through">{c.wrong}</span>
                    {' \u2192 '}
                    <span className="text-green-600 font-semibold">{c.correct}</span>
                    {c.explanation && <p className="text-xs text-gray-500 mt-1">{c.explanation}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => {
                setPhase('mode-select');
                setMessages([]);
                setTurnCount(0);
                setMode(null);
                setAllCorrections([]);
                setSpeakingTimes([]);
                setSessionStartTime(null);
                setSessionXP(null);
                setSavedDailyTotal(null);
                endingRef.current = false;
                lastProcessedTranscript.current = '';
              }}
              className="flex-1 py-3 rounded-xl bg-purple-500 text-white font-semibold hover:bg-purple-600 transition-colors"
            >
              <RotateCcw size={16} className="inline mr-1 mb-0.5" />
              {t('tryAgain', uiLang)}
            </button>
            <button
              onClick={onBack}
              className="flex-1 py-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {t('finish', uiLang)}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Render: Session ── */
  return (
    <div className="min-h-screen flex flex-col">
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
            <ArrowLeft size={20} className={dir === 'rtl' ? 'rotate-180' : ''} />
          </button>
          <div>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">
              {mode ? lf(mode, 'label', uiLang) : t('lifeCoach', uiLang)}
            </h1>
            <SessionTimer startTime={sessionStartTime} />
          </div>
        </div>
        <button
          onClick={endSession}
          className="px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-semibold hover:bg-purple-200 dark:hover:bg-purple-900/50"
        >
          {t('endSession', uiLang)}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.map((msg, i) => (
          <ChatBubble
            key={i}
            role={msg.role}
            content={msg.content}
            corrections={msg.corrections}
            isChild={isChild}
            uiLang={uiLang}
            onPlayAudio={msg.role === 'assistant' ? () => playAI(msg.content) : undefined}
          />
        ))}
        {isAnalyzing && (
          <div className="flex justify-start mb-3">
            <div className="rounded-2xl px-4 py-3 bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <span className="text-xs text-gray-500">{t('analyzing', uiLang)}</span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="sticky bottom-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-t border-gray-200/50 dark:border-gray-700/50 px-4 py-4">
        {isListening ? (
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-1">
              {[16, 24, 32, 20, 28].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-purple-500 rounded-full animate-pulse"
                  style={{ height: `${h}px`, animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-purple-500">{t('listening', uiLang)}</span>
            {interimTranscript && (
              <span className="text-xs text-gray-400 max-w-[40%] truncate">{interimTranscript}</span>
            )}
            <button
              onClick={handleStopRecording}
              className="w-14 h-14 rounded-full bg-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 active:scale-90 transition-transform"
            >
              <Square size={20} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs text-gray-500">{t('tapToSpeak', uiLang)}</p>
            <button
              onClick={handleStartRecording}
              disabled={isAnalyzing || isSpeaking || !sttSupported}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 ${
                isAnalyzing || isSpeaking
                  ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-purple-500/30 hover:shadow-purple-500/50'
              }`}
            >
              <Mic size={24} />
            </button>
          </div>
        )}
      </div>
      {showPaywall && <PaywallModal feature="lifeCoach" onClose={() => setShowPaywall(false)} onNavigate={() => {}} />}
    </div>
  );
}
