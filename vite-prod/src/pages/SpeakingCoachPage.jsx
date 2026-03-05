import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Mic, Square, Volume2, RotateCcw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useUserProgress } from '../contexts/UserProgressContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import useSpeechRecognition from '../hooks/useSpeechRecognition.js';
import { playFromAPI, stopAllAudio } from '../utils/hebrewAudio.js';
import { pronunciationScore } from '../utils/stringDistance.js';
import { calcSpeakingCoachXP } from '../utils/xpCalculator.js';
import { t, tReplace, lf } from '../utils/translations.js';
import { KIDS_SCENARIOS, ADULT_SCENARIOS } from '../data/speaking-scenarios.js';
import GlassCard from '../components/shared/GlassCard.jsx';
import SpeakliAvatar from '../components/kids/SpeakliAvatar.jsx';

/* ── Helpers ── */
function avg(arr) {
  if (!arr.length) return 0;
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}

function ScoreCircle({ label, score, color }) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-[76px] h-[76px] flex items-center justify-center">
        <svg width="76" height="76" className="absolute inset-0 transform -rotate-90">
          <circle cx="38" cy="38" r={radius} fill="none" stroke="currentColor" strokeWidth="6" className="text-gray-200 dark:text-gray-700" />
          <circle cx="38" cy="38" r={radius} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease' }} />
        </svg>
        <span className="text-lg font-bold" style={{ color }}>{score}</span>
      </div>
      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{label}</span>
    </div>
  );
}

/* ── Chat Bubble ── */
function ChatBubble({ role, content, corrections, isChild, uiLang, onPlayAudio }) {
  const isAI = role === 'assistant';
  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-3`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
        isAI
          ? 'bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700'
          : 'bg-gradient-to-br from-brand-500 to-emerald-500 text-white'
      }`}>
        {isAI && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
              {isChild ? <><SpeakliAvatar mode="idle" size="xs" shadow={false} glow={false} /> Speakli</> : '👩‍🏫 Emma'}
            </span>
            {onPlayAudio && (
              <button onClick={onPlayAudio} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <Volume2 size={14} className="text-brand-500" />
              </button>
            )}
          </div>
        )}
        <p className={`text-sm leading-relaxed ${isAI ? 'text-gray-800 dark:text-gray-200' : 'text-white'}`}>
          {content}
        </p>
        {corrections && corrections.length > 0 && (
          <div className="mt-2 space-y-1.5 border-t border-gray-200 dark:border-gray-600 pt-2">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{t('corrections', uiLang)}</span>
            {corrections.map((c, i) => (
              <div key={i} className="text-xs bg-amber-50 dark:bg-amber-900/20 rounded-lg px-2 py-1.5">
                <span className="text-red-500 line-through">{c.wrong}</span>
                {' → '}
                <span className="text-green-600 dark:text-green-400 font-semibold">{c.correct}</span>
                {c.explanation && <p className="text-gray-500 dark:text-gray-400 mt-0.5">{c.explanation}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Mini Exercise (uses its own local recognition to avoid shared recognitionRef conflict) ── */
function ExercisePanel({ exercise, uiLang, onComplete }) {
  const [exTranscript, setExTranscript] = useState('');
  const [exListening, setExListening] = useState(false);
  const [exConfidence, setExConfidence] = useState(0);
  const [score, setScore] = useState(null);
  const recRef = useRef(null);

  const sttAvailable = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const startExerciseRecording = () => {
    if (!sttAvailable) return;
    if (recRef.current) { try { recRef.current.abort(); } catch {} }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';
    rec.onstart = () => { setExListening(true); setExTranscript(''); setScore(null); };
    rec.onresult = (e) => {
      const result = e.results[0];
      if (result.isFinal) {
        setExTranscript(result[0].transcript);
        setExConfidence(result[0].confidence);
      }
    };
    rec.onerror = () => setExListening(false);
    rec.onend = () => setExListening(false);
    recRef.current = rec;
    rec.start();
  };

  const stopExerciseRecording = () => {
    if (recRef.current) { recRef.current.stop(); recRef.current = null; }
    setExListening(false);
  };

  // Score after recording stops
  useEffect(() => {
    if (!exListening && exTranscript) {
      const s = pronunciationScore(exercise.sentence, exTranscript, exConfidence);
      setScore(s);
    }
  }, [exListening, exTranscript, exConfidence, exercise.sentence]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { if (recRef.current) { try { recRef.current.abort(); } catch {} } };
  }, []);

  return (
    <div className="mx-4 mb-3 p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200/50 dark:border-indigo-800/50">
      <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
        {exercise.type === 'repeat' ? t('repeatAfterMe', uiLang) : t('tryAgainSentence', uiLang)}
      </p>
      <p className="text-sm font-semibold text-gray-800 dark:text-white mb-1">"{exercise.sentence}"</p>
      {exercise.translation && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{exercise.translation}</p>
      )}

      <div className="flex items-center gap-3">
        {sttAvailable && (
          <button
            onClick={exListening ? stopExerciseRecording : startExerciseRecording}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              exListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-indigo-500 text-white hover:bg-indigo-600'
            }`}
          >
            {exListening ? <Square size={16} /> : <Mic size={16} />}
          </button>
        )}

        {score !== null && (
          <div className="flex-1 flex items-center gap-2">
            <div className={`text-sm font-bold ${score >= 80 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
              {score}%
            </div>
            <span className="text-xs text-gray-500">{exTranscript}</span>
          </div>
        )}

        {(score !== null || !sttAvailable) && (
          <button
            onClick={onComplete}
            className="ml-auto px-3 py-1.5 rounded-lg bg-indigo-500 text-white text-xs font-semibold hover:bg-indigo-600"
          >
            {t('nextTurn', uiLang)}
          </button>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   SPEAKING COACH PAGE - Main component
   ══════════════════════════════════════════ */
export default function SpeakingCoachPage({ onBack }) {
  const { uiLang, dir } = useTheme();
  const { user } = useAuth();
  const { progress, addXP, isChildMode } = useUserProgress();
  const { transcript, interimTranscript, isListening, startListening, stopListening, confidence, sttSupported } = useSpeechRecognition();

  const isChild = isChildMode && (!progress.curriculumLevel || progress.curriculumLevel <= 2);
  const scenarios = isChild ? KIDS_SCENARIOS : ADULT_SCENARIOS;

  const [phase, setPhase] = useState('scenario-select'); // scenario-select | session | exercise | results
  const [scenario, setScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [turnCount, setTurnCount] = useState(0);
  const [sessionScores, setSessionScores] = useState({ grammar: [], pronunciation: [], fluency: [] });
  const [currentExercise, setCurrentExercise] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState(null);
  const [speakingTimes, setSpeakingTimes] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [weaknesses, setWeaknesses] = useState({});

  const chatEndRef = useRef(null);
  const abortRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentExercise]);

  // Load weaknesses from Firestore
  useEffect(() => {
    if (!user?.uid || !window.firestore || !window.db) return;
    try {
      const uid = isChild && progress.activeChildId ? progress.activeChildId : user.uid;
      const col = isChild && progress.activeChildId ? 'childProfiles' : 'users';
      const docRef = window.firestore.doc(window.db, col, uid, 'speakingProfile', 'data');
      window.firestore.getDoc(docRef)
        .then(snap => {
          if (snap.exists()) {
            setWeaknesses(snap.data().weaknesses || {});
          }
        })
        .catch(() => {});
    } catch (e) {
      console.warn('Speaking coach: failed to load weaknesses', e);
    }
  }, [user, isChild, progress.activeChildId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // Handle transcript ready after recording stops
  useEffect(() => {
    if (!isListening && transcript && recordingStartTime && phase === 'session') {
      const speakingTime = (Date.now() - recordingStartTime) / 1000;
      setRecordingStartTime(null);
      handleUserTranscript(transcript, speakingTime);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening, transcript]);

  /* ── Select scenario & start ── */
  const selectScenario = (s) => {
    setScenario(s);
    setPhase('session');
    setMessages([{ role: 'assistant', content: s.opener }]);
    setTurnCount(0);
    setSessionScores({ grammar: [], pronunciation: [], fluency: [] });
    setSpeakingTimes([]);
    // Play opener TTS
    playAI(s.opener);
  };

  /* ── Play AI message via ElevenLabs TTS ── */
  const playAI = async (text) => {
    if (!text) return;
    setIsSpeaking(true);
    try {
      const result = await playFromAPI(text, 'en');
      if (result?.started && result.endPromise) await result.endPromise;
    } catch {}
    setIsSpeaking(false);
  };

  /* ── Start recording ── */
  const handleStartRecording = () => {
    if (!sttSupported) return;
    stopAllAudio();
    setRecordingStartTime(Date.now());
    startListening({ continuous: true, lang: 'en-US' });
  };

  /* ── Stop recording ── */
  const handleStopRecording = () => {
    stopListening();
  };

  /* ── Process user transcript ── */
  const handleUserTranscript = async (text, speakingTime) => {
    if (!text.trim()) return;

    const wordCount = text.trim().split(/\s+/).length;
    setSpeakingTimes(prev => [...prev, speakingTime]);

    // Add user message
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setTurnCount(prev => prev + 1);
    setIsAnalyzing(true);

    // Build history for API (only content, not corrections metadata)
    const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));

    try {
      const token = await window.auth?.currentUser?.getIdToken();
      const res = await fetch('/api/speaking-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          transcript: text,
          scenario: scenario?.id || 'free',
          history: history.slice(-20),
          cefrLevel: progress.cefrLevel || 'A1',
          uiLang,
          isChild,
          speakingTime,
          wordCount,
          weaknesses,
        }),
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json();

      // Calculate pronunciation score from STT confidence
      const pronScore = Math.round(confidence * 100);

      // Add AI message
      const aiMsg = {
        role: 'assistant',
        content: data.reply || 'Could you say that again?',
        corrections: data.corrections || [],
        scores: {
          grammar: data.grammarScore || 70,
          vocabulary: data.vocabularyScore || 70,
          fluency: data.fluencyScore || 70,
          overall: data.overallScore || 70,
        },
      };
      setMessages(prev => [...prev, aiMsg]);

      // Update session scores
      setSessionScores(prev => ({
        grammar: [...prev.grammar, data.grammarScore || 70],
        pronunciation: [...prev.pronunciation, pronScore],
        fluency: [...prev.fluency, data.fluencyScore || 70],
      }));

      // Play AI response
      playAI(data.reply || '');

      // Set exercise if provided
      if (data.exercise) {
        setCurrentExercise(data.exercise);
        setPhase('exercise');
      }
    } catch (err) {
      console.error('Speaking coach API error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I had trouble understanding. Could you try again?' }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  /* ── Complete exercise, go back to session ── */
  const completeExercise = () => {
    setCurrentExercise(null);
    setPhase('session');
  };

  /* ── End session & show results ── */
  const endSession = async () => {
    stopAllAudio();
    setPhase('results');

    // Calculate XP
    const avgGrammar = avg(sessionScores.grammar);
    const avgPron = avg(sessionScores.pronunciation);
    const avgFluency = avg(sessionScores.fluency);
    const avgOverall = Math.round((avgGrammar + avgPron + avgFluency) / 3);
    const xpResult = calcSpeakingCoachXP(avgOverall, turnCount);

    // Award XP
    try {
      await addXP(xpResult.total, 'speakingCoach');
    } catch {}

    // Save speaking profile to Firestore
    try {
      if (user?.uid && window.firestore && window.db) {
        const uid = isChild && progress.activeChildId ? progress.activeChildId : user.uid;
        const col = isChild && progress.activeChildId ? 'childProfiles' : 'users';
        const docRef = window.firestore.doc(window.db, col, uid, 'speakingProfile', 'data');
        const snap = await window.firestore.getDoc(docRef);
        const prev = snap.exists() ? snap.data() : {};

        // Merge weaknesses
        const allCorrections = messages.filter(m => m.corrections?.length).flatMap(m => m.corrections);
        const newWeaknesses = { ...(prev.weaknesses || {}) };
        for (const c of allCorrections) {
          if (c.rule) {
            newWeaknesses[c.rule] = {
              count: ((newWeaknesses[c.rule]?.count) || 0) + 1,
              lastSeen: new Date().toISOString().split('T')[0],
            };
          }
        }

        const totalMinutes = speakingTimes.reduce((a, b) => a + b, 0) / 60;
        const totalSessions = (prev.totalSessions || 0) + 1;

        await window.firestore.setDoc(docRef, {
          totalSessions,
          totalMinutes: Math.round(((prev.totalMinutes || 0) + totalMinutes) * 10) / 10,
          avgGrammar: Math.round(((prev.avgGrammar || 0) * (totalSessions - 1) + avgGrammar) / totalSessions),
          avgPronunciation: Math.round(((prev.avgPronunciation || 0) * (totalSessions - 1) + avgPron) / totalSessions),
          avgFluency: Math.round(((prev.avgFluency || 0) * (totalSessions - 1) + avgFluency) / totalSessions),
          weaknesses: newWeaknesses,
          lastSessionDate: new Date().toISOString().split('T')[0],
        });
      }
    } catch (err) {
      console.error('Failed to save speaking profile:', err);
    }
  };

  /* ── Render: Scenario Selection ── */
  if (phase === 'scenario-select') {
    return (
      <div className="min-h-screen pb-8">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
            <ArrowLeft size={20} className={dir === 'rtl' ? 'rotate-180' : ''} />
          </button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">{t('speakingCoach', uiLang)}</h1>
        </div>

        <div className="px-4 pt-4 space-y-4">
          {/* Coach intro */}
          <div className="text-center mb-2">
            <div className="mb-2">{isChild ? <SpeakliAvatar mode="idle" size="lg" glow /> : <span className="text-5xl">👩‍🏫</span>}</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {isChild ? t('coachSpeakli', uiLang) : t('coachEmma', uiLang)}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t('chooseSituation', uiLang)}
            </p>
          </div>

          {/* Scenario grid */}
          <div className="grid grid-cols-2 gap-3">
            {scenarios.map(s => (
              <button
                key={s.id}
                onClick={() => selectScenario(s)}
                className="rounded-2xl p-4 text-left active:scale-95 transition-all bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md"
              >
                <span className="text-3xl block mb-2">{s.emoji}</span>
                <h3 className="font-bold text-sm text-gray-800 dark:text-white">
                  {lf(s, 'label', uiLang)}
                </h3>
              </button>
            ))}
          </div>

          {/* Mic check */}
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
    const avgGrammar = avg(sessionScores.grammar);
    const avgPron = avg(sessionScores.pronunciation);
    const avgFluency = avg(sessionScores.fluency);
    const avgOverall = Math.round((avgGrammar + avgPron + avgFluency) / 3);
    const xpResult = calcSpeakingCoachXP(avgOverall, turnCount);
    const totalMinutes = Math.round(speakingTimes.reduce((a, b) => a + b, 0) / 60 * 10) / 10;
    const allCorrections = messages.filter(m => m.corrections?.length).flatMap(m => m.corrections);
    const encouragement = avgOverall >= 85 ? t('greatJob', uiLang) : avgOverall >= 60 ? t('almostPerfect', uiLang) : t('keepPracticing', uiLang);

    return (
      <div className="min-h-screen pb-8">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
            <ArrowLeft size={20} className={dir === 'rtl' ? 'rotate-180' : ''} />
          </button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">{t('sessionResults', uiLang)}</h1>
        </div>

        <div className="px-4 pt-6 space-y-5">
          {/* Encouragement */}
          <div className="text-center">
            <div className="text-5xl mb-2">{avgOverall >= 85 ? '🎉' : avgOverall >= 60 ? '💪' : '📚'}</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{encouragement}</h2>
          </div>

          {/* Score circles */}
          <div className="flex justify-center gap-6">
            <ScoreCircle label={t('grammarScore', uiLang)} score={avgGrammar} color="#3b82f6" />
            <ScoreCircle label={t('pronunciationScoreLabel', uiLang)} score={avgPron} color="#10b981" />
            <ScoreCircle label={t('fluencyScore', uiLang)} score={avgFluency} color="#f59e0b" />
          </div>

          {/* Overall + stats */}
          <GlassCard className="text-center">
            <div className="text-3xl font-black text-brand-600 dark:text-brand-400">{avgOverall}</div>
            <div className="text-sm text-gray-500">{t('overallScore', uiLang)}</div>
            <div className="flex justify-center gap-6 mt-3 text-xs text-gray-500">
              <span>{turnCount} {t('turnCount', uiLang).replace('{n}', '').trim()}</span>
              <span>{totalMinutes} {t('speakingMinutes', uiLang)}</span>
            </div>
          </GlassCard>

          {/* XP earned */}
          <GlassCard className="!bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-amber-700 dark:text-amber-400">{t('sessionXP', uiLang)}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {xpResult.base} + {xpResult.turnsBonus} bonus {xpResult.perfectBonus > 0 ? `+ ${xpResult.perfectBonus} perfect` : ''}
                </p>
              </div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">+{xpResult.total} XP</div>
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
                    {' → '}
                    <span className="text-green-600 font-semibold">{c.correct}</span>
                    {c.explanation && <p className="text-xs text-gray-500 mt-1">{c.explanation}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setPhase('scenario-select');
                setMessages([]);
                setTurnCount(0);
                setScenario(null);
                setSessionScores({ grammar: [], pronunciation: [], fluency: [] });
                setSpeakingTimes([]);
                setCurrentExercise(null);
              }}
              className="flex-1 py-3 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors"
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

  /* ── Render: Session + Exercise ── */
  const canEnd = turnCount >= 3;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
            <ArrowLeft size={20} className={dir === 'rtl' ? 'rotate-180' : ''} />
          </button>
          <div>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">
              {scenario ? lf(scenario, 'label', uiLang) : t('speakingCoach', uiLang)}
            </h1>
            <p className="text-xs text-gray-500">{tReplace('turnCount', uiLang, { n: turnCount })}</p>
          </div>
        </div>
        {canEnd && (
          <button
            onClick={endSession}
            className="px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-200 dark:hover:bg-red-900/50"
          >
            {t('endSession', uiLang)}
          </button>
        )}
      </div>

      {/* Chat area */}
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
                <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                <span className="text-xs text-gray-500">{t('analyzing', uiLang)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Exercise panel (inline in chat) */}
        {phase === 'exercise' && currentExercise && (
          <ExercisePanel
            exercise={currentExercise}
            uiLang={uiLang}
            onComplete={completeExercise}
          />
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Recording controls */}
      {phase !== 'exercise' && (
        <div className="sticky bottom-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-t border-gray-200/50 dark:border-gray-700/50 px-4 py-4">
          {isListening ? (
            <div className="flex items-center justify-center gap-4">
              {/* Waveform indicator */}
              <div className="flex items-center gap-1">
                {[16, 24, 32, 20, 28].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 bg-red-500 rounded-full animate-pulse"
                    style={{ height: `${h}px`, animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-red-500">{t('listening', uiLang)}</span>
              {interimTranscript && (
                <span className="text-xs text-gray-400 max-w-[40%] truncate">{interimTranscript}</span>
              )}
              <button
                onClick={handleStopRecording}
                className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/30 active:scale-90 transition-transform"
              >
                <Square size={20} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs text-gray-500">{t('tapToSpeak', uiLang)}</p>
              <button
                onClick={handleStartRecording}
                disabled={isAnalyzing || isSpeaking}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 ${
                  isAnalyzing || isSpeaking
                    ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-br from-brand-500 to-emerald-500 text-white shadow-brand-500/30 hover:shadow-brand-500/50'
                }`}
              >
                <Mic size={24} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
