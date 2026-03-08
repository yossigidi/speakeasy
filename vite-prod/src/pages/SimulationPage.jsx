import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Volume2, Mic, MicOff, Send, Lock, ChevronRight, RotateCcw, Play, MessageCircle, Timer, AlertTriangle, Check } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useUserProgress } from '../contexts/UserProgressContext.jsx';
import { t, lf } from '../utils/translations.js';
import { calcSimulationXP } from '../utils/xpCalculator.js';
import { INDUSTRIES, CAREER_LEVELS, SCENARIOS, getCareerLevel, getNextCareerLevel } from '../data/simulation-scenarios.js';
import useSpeechRecognition from '../hooks/useSpeechRecognition.js';
import useSpeechSynthesis from '../hooks/useSpeechSynthesis.js';
import { stopAllAudio } from '../utils/hebrewAudio.js';
import GlassCard from '../components/shared/GlassCard.jsx';
import KidsIntro from '../components/kids/KidsIntro.jsx';
import useUsageLimit from '../hooks/useUsageLimit.js';
import PaywallModal from '../components/subscription/PaywallModal.jsx';

// ── Metric Bar ──────────────────────────────────────────
function MetricBar({ label, value, color }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-16 text-gray-600 dark:text-gray-400 truncate">{label}</span>
      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="w-8 text-right font-semibold text-gray-700 dark:text-gray-300">{value}%</span>
    </div>
  );
}

// ── NPC Bubble ──────────────────────────────────────────
function NPCBubble({ name, role, text, onSpeak }) {
  return (
    <div className="flex justify-start animate-slide-up">
      <div className="max-w-[85%] glass-card !rounded-bl-md p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold">
            {name[0]}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-900 dark:text-white">{name}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">{role}</p>
          </div>
          <button onClick={() => onSpeak(text)} aria-label="Listen" className="ml-auto p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            <Volume2 size={14} className="text-brand-500" />
          </button>
        </div>
        <p className="text-sm text-gray-900 dark:text-white leading-relaxed">"{text}"</p>
      </div>
    </div>
  );
}

// ── Correction Card ─────────────────────────────────────
function CorrectionCard({ correction, mistakes, uiLang }) {
  if (!correction && (!mistakes || mistakes.length === 0)) return null;
  return (
    <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 animate-slide-up">
      <div className="flex items-center gap-1.5 mb-2">
        <AlertTriangle size={14} className="text-amber-600" />
        <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{t('mistakeAnalysis', uiLang)}</span>
      </div>
      {correction && (
        <div className="mb-2">
          <p className="text-xs text-red-600 dark:text-red-400 line-through">{correction.original}</p>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">{correction.corrected}</p>
          <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">{correction.explanation}</p>
        </div>
      )}
      {mistakes && mistakes.map((m, i) => (
        <div key={i} className="text-xs text-gray-700 dark:text-gray-300 mt-1">
          <span className="font-semibold text-amber-600">{m.type}:</span> {m.detail} → <span className="text-emerald-600">{m.suggestion}</span>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// SIMULATION PAGE — Main Component
// ══════════════════════════════════════════════════════════
export default function SimulationPage() {
  const { uiLang } = useTheme();
  useAuth();
  const { progress, updateProgress, addXP } = useUserProgress();
  const { speak } = useSpeechSynthesis();
  const { transcript, isListening, startListening, stopListening, sttSupported } = useSpeechRecognition();
  // ── State ──
  const [selectedIndustry, setSelectedIndustry] = useState('tech');
  const [activeScenario, setActiveScenario] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState({ clarity: 0, grammar: 0, vocabulary: 0, confidence: 0 });
  const [allMistakes, setAllMistakes] = useState([]);
  const [allCorrections, setAllCorrections] = useState([]);
  const [stepScores, setStepScores] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [freeMode, setFreeMode] = useState(false);
  const [timer, setTimer] = useState(0);
  const [lastCorrection, setLastCorrection] = useState(null);
  const [lastMistakes, setLastMistakes] = useState([]);
  const { isBlocked, increment: incrementUsage } = useUsageLimit('simulation');
  const [showPaywall, setShowPaywall] = useState(false);
  const timerRef = useRef(null);
  const speechTimersRef = useRef([]);

  // Stop all audio and speech recognition on unmount
  useEffect(() => () => { stopAllAudio(); stopListening(); speechTimersRef.current.forEach(clearTimeout); }, []);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const simData = progress.simulation || { industry: null, careerXP: 0, careerLevel: 'junior', completedScenarios: {}, totalSimulations: 0 };
  const careerLevel = getCareerLevel(simData.careerXP);
  const nextLevel = getNextCareerLevel(careerLevel.id);

  // ── Timer ──
  useEffect(() => {
    if (activeScenario || freeMode) {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [activeScenario, freeMode]);

  // ── Auto-scroll ──
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Speech recognition result ──
  useEffect(() => {
    if (transcript && !isListening) {
      setInputText(prev => prev ? prev + ' ' + transcript : transcript);
    }
  }, [transcript, isListening]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // ── Start scenario ──
  const startScenario = (scenario) => {
    if (isBlocked) { setShowPaywall(true); return; }
    incrementUsage();
    setActiveScenario(scenario);
    setCurrentStep(0);
    setMessages([{ role: 'npc', content: scenario.steps[0].npc }]);
    setMetrics({ clarity: 0, grammar: 0, vocabulary: 0, confidence: 0 });
    setAllMistakes([]);
    setAllCorrections([]);
    setStepScores([]);
    setTimer(0);
    setShowResults(false);
    setLastCorrection(null);
    setLastMistakes([]);
    speak(scenario.steps[0].npc);
  };

  // ── Start free mode ──
  const startFreeMode = () => {
    if (isBlocked) { setShowPaywall(true); return; }
    incrementUsage();
    setFreeMode(true);
    setActiveScenario(null);
    setCurrentStep(0);
    setMessages([]);
    setMetrics({ clarity: 0, grammar: 0, vocabulary: 0, confidence: 0 });
    setAllMistakes([]);
    setAllCorrections([]);
    setStepScores([]);
    setTimer(0);
    setShowResults(false);
    setLastCorrection(null);
    setLastMistakes([]);
    const greeting = selectedIndustry === 'tech'
      ? "Hi! I'm Alex, a software engineer. What would you like to talk about?"
      : selectedIndustry === 'business'
      ? "Hello! I'm Sarah, a business consultant. How can I help you today?"
      : "Welcome! I'm Marco, a hotel concierge. What can I assist you with?";
    setMessages([{ role: 'npc', content: greeting }]);
    speak(greeting);
  };

  // ── Send message ──
  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

    const userMsg = text.trim();
    setInputText('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);
    setLastCorrection(null);
    setLastMistakes([]);

    try {
      const step = activeScenario ? activeScenario.steps[currentStep] : null;
      const body = {
        scenarioContext: activeScenario ? `${activeScenario.title}: ${activeScenario.desc}` : '',
        npcRole: activeScenario ? activeScenario.npcRole : '',
        npcName: activeScenario ? activeScenario.npcName : '',
        npcPersonality: activeScenario ? activeScenario.npcPersonality : '',
        userMessage: userMsg,
        cefrLevel: progress.cefrLevel || 'A2',
        uiLang,
        history: messages.map(m => ({ role: m.role === 'npc' ? 'assistant' : 'user', content: m.content })),
        evaluationFocus: step?.evaluationFocus || ['clarity', 'grammar', 'vocabulary', 'confidence'],
        step: currentStep + 1,
        freeMode,
        industry: selectedIndustry,
      };

      const token = await window.auth?.currentUser?.getIdToken();
      const res = await fetch('/api/simulation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();

      // Validate API response
      if (!data.npcReply) {
        throw new Error('Invalid API response: missing npcReply');
      }

      // Update metrics (running average)
      if (data.metrics) {
        setMetrics(prev => {
          const count = stepScores.length + 1;
          return {
            clarity: Math.round(((prev.clarity * stepScores.length) + data.metrics.clarity) / count),
            grammar: Math.round(((prev.grammar * stepScores.length) + data.metrics.grammar) / count),
            vocabulary: Math.round(((prev.vocabulary * stepScores.length) + data.metrics.vocabulary) / count),
            confidence: Math.round(((prev.confidence * stepScores.length) + data.metrics.confidence) / count),
          };
        });
        setStepScores(prev => [...prev, data.overallScore || 70]);
      }

      if (data.correction) {
        setLastCorrection(data.correction);
        setAllCorrections(prev => [...prev, data.correction]);
      }
      if (data.mistakes?.length > 0) {
        setLastMistakes(data.mistakes);
        setAllMistakes(prev => [...prev, ...data.mistakes]);
      }

      setMessages(prev => [...prev, { role: 'npc', content: data.npcReply }]);

      // Advance step (structured scenario)
      if (activeScenario) {
        const nextStep = currentStep + 1;
        if (nextStep >= activeScenario.steps.length) {
          // Scenario complete — speak reply, then finish after speech ends
          speak(data.npcReply, { onEnd: () => { speechTimersRef.current.push(setTimeout(() => finishScenario(), 500)); } });
          clearInterval(timerRef.current);
        } else {
          setCurrentStep(nextStep);
          // Speak reply, then show next NPC line after speech ends
          speak(data.npcReply, {
            onEnd: () => {
              speechTimersRef.current.push(setTimeout(() => {
                const nextNpc = activeScenario.steps[nextStep].npc;
                setMessages(prev => [...prev, { role: 'npc', content: nextNpc }]);
                speak(nextNpc);
              }, 500));
            }
          });
        }
      } else {
        speak(data.npcReply);
      }
    } catch (err) {
      console.error('Simulation error:', err);
      setMessages(prev => [...prev, { role: 'npc', content: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Finish scenario ──
  const finishScenario = async () => {
    clearInterval(timerRef.current);
    setShowResults(true);

    const avgScore = stepScores.length > 0
      ? Math.round(stepScores.reduce((a, b) => a + b, 0) / stepScores.length)
      : 70;

    const xpResult = calcSimulationXP(avgScore, stepScores.length);

    // Update progress
    const newCareerXP = (simData.careerXP || 0) + xpResult.total;
    const newTotalSimulations = (simData.totalSimulations || 0) + 1;
    const completedScenarios = { ...simData.completedScenarios };
    if (activeScenario) {
      completedScenarios[activeScenario.id] = {
        score: avgScore,
        completedAt: new Date().toISOString(),
      };
    }

    const newCareerLevel = getCareerLevel(newCareerXP);

    await updateProgress({
      simulation: {
        ...simData,
        industry: selectedIndustry,
        careerXP: newCareerXP,
        careerLevel: newCareerLevel.id,
        completedScenarios,
        totalSimulations: newTotalSimulations,
      },
      // Increment conversation counter for achievements
      conversationsCompleted: (progress.conversationsCompleted || 0) + 1,
    });

    await addXP(xpResult.total, 'simulation');
  };

  // ── End free mode ──
  const endFreeMode = () => {
    finishScenario();
    setFreeMode(false);
  };

  // ── Reset to selection ──
  const backToSelection = () => {
    clearInterval(timerRef.current);
    setActiveScenario(null);
    setFreeMode(false);
    setShowResults(false);
    setMessages([]);
    setCurrentStep(0);
    setTimer(0);
    setMetrics({ clarity: 0, grammar: 0, vocabulary: 0, confidence: 0 });
    setLastCorrection(null);
    setLastMistakes([]);
  };

  // ── Handle choice selection ──
  const handleChoiceSelect = (choice) => {
    sendMessage(choice);
  };

  // ═══ RESULTS SCREEN ═══
  if (showResults) {
    const avgScore = stepScores.length > 0
      ? Math.round(stepScores.reduce((a, b) => a + b, 0) / stepScores.length)
      : 70;
    const xpResult = calcSimulationXP(avgScore, stepScores.length);
    const newCareerXP = (simData.careerXP || 0) + xpResult.total;
    const prevLevel = careerLevel;
    const newLevel = getCareerLevel(newCareerXP);
    const leveledUp = newLevel.level > prevLevel.level;

    return (
      <div className="min-h-screen pb-24 px-4 pt-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={backToSelection} aria-label="Back" className="p-2 rounded-xl glass-card">
            <ArrowLeft size={20} className="rtl:rotate-180" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">{t('yourPerformance', uiLang)}</h1>
        </div>

        {/* Score */}
        <div className="text-center mb-6 animate-slide-up">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg mb-3">
            <span className="text-3xl font-black text-white">{avgScore}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('overallScore', uiLang)}</p>
        </div>

        {/* Metrics */}
        <GlassCard className="mb-4 space-y-3">
          <MetricBar label={t('clarity', uiLang)} value={metrics.clarity} color="bg-blue-500" />
          <MetricBar label={t('grammarAccuracy', uiLang)} value={metrics.grammar} color="bg-emerald-500" />
          <MetricBar label={t('vocabularyLevel', uiLang)} value={metrics.vocabulary} color="bg-purple-500" />
          <MetricBar label={t('confidenceScore', uiLang)} value={metrics.confidence} color="bg-amber-500" />
        </GlassCard>

        {/* XP */}
        <GlassCard className="mb-4 text-center">
          <p className="text-2xl font-bold text-brand-600">+{xpResult.total} XP</p>
          {xpResult.perfectBonus > 0 && <p className="text-xs text-amber-600 mt-1">+{xpResult.perfectBonus} {t('perfectLesson', uiLang)}</p>}
          <div className="mt-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('careerProgress', uiLang)}</p>
            <div className="flex items-center gap-2 justify-center mt-1">
              <span className="text-sm">{careerLevel.emoji}</span>
              <div className="w-40 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all duration-1000"
                  style={{ width: nextLevel ? `${Math.min(100, (newCareerXP / nextLevel.minXP) * 100)}%` : '100%' }} />
              </div>
              <span className="text-xs text-gray-500">{newCareerXP}{nextLevel ? `/${nextLevel.minXP}` : ''}</span>
            </div>
            {leveledUp && (
              <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 animate-slide-up">
                <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                  {t('levelUp', uiLang)} {newLevel.emoji} {lf(newLevel, 'title', uiLang)}
                </p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Mistakes */}
        {allCorrections.length > 0 && (
          <GlassCard className="mb-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">{t('mistakeAnalysis', uiLang)}</h3>
            {allCorrections.map((c, i) => (
              <div key={i} className="mb-2 last:mb-0">
                <p className="text-xs text-red-500 line-through">{c.original}</p>
                <p className="text-xs text-emerald-600 font-medium">{c.corrected}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{c.explanation}</p>
              </div>
            ))}
          </GlassCard>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {activeScenario && (
            <button onClick={() => startScenario(activeScenario)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg">
              <RotateCcw size={16} /> {t('tryAgain', uiLang)}
            </button>
          )}
          <button onClick={backToSelection}
            className="w-full py-3 rounded-2xl glass-card font-semibold text-sm text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2">
            <ChevronRight size={16} className="rtl:rotate-180" /> {t('nextScenario', uiLang)}
          </button>
        </div>
      </div>
    );
  }

  // ═══ ACTIVE SIMULATION / FREE MODE ═══
  if (activeScenario || freeMode) {
    const scenario = activeScenario;
    const step = scenario?.steps?.[currentStep];
    const totalSteps = scenario?.steps?.length || 0;

    return (
      <div className="min-h-screen flex flex-col pb-4">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <button onClick={backToSelection} aria-label="Back" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300 rtl:rotate-180" />
            </button>
            <div className="text-center flex-1 mx-3">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {freeMode ? t('freeConversation', uiLang) : lf(scenario, 'title', uiLang)}
              </p>
              {scenario && (
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <span className="text-[10px] text-gray-500">{t('step', uiLang)} {currentStep + 1}/{totalSteps}</span>
                  <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }} />
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Timer size={12} />
              <span>{formatTime(timer)}</span>
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg, i) => (
            msg.role === 'npc' ? (
              <NPCBubble
                key={i}
                name={scenario?.npcName || (selectedIndustry === 'tech' ? 'Alex' : selectedIndustry === 'business' ? 'Sarah' : 'Marco')}
                role={scenario?.npcRole || t('freeConversation', uiLang)}
                text={msg.content}
                onSpeak={speak}
              />
            ) : (
              <div key={i} className="flex justify-end animate-slide-up">
                <div className="max-w-[80%] rounded-2xl rounded-br-md px-4 py-3 bg-brand-500 text-white">
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            )
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="glass-card p-3 rounded-2xl rounded-bl-md">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {/* Correction inline */}
          <CorrectionCard correction={lastCorrection} mistakes={lastMistakes} uiLang={uiLang} />

          <div ref={chatEndRef} />
        </div>

        {/* Metrics bar */}
        {stepScores.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm space-y-1">
            <MetricBar label={t('clarity', uiLang)} value={metrics.clarity} color="bg-blue-500" />
            <MetricBar label={t('grammarAccuracy', uiLang)} value={metrics.grammar} color="bg-emerald-500" />
            <MetricBar label={t('vocabularyLevel', uiLang)} value={metrics.vocabulary} color="bg-purple-500" />
            <MetricBar label={t('confidenceScore', uiLang)} value={metrics.confidence} color="bg-amber-500" />
          </div>
        )}

        {/* Choice buttons (for choice responseType) */}
        {step?.responseType === 'choice' && step.choices && !isLoading && currentStep < totalSteps && (
          <div className="px-4 py-2 space-y-2 border-t border-gray-200/30 dark:border-gray-700/30">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('chooseResponse', uiLang)}</p>
            {step.choices.map((choice, i) => (
              <button key={i} onClick={() => handleChoiceSelect(choice)}
                className="w-full text-left px-4 py-2.5 rounded-xl glass-card text-sm text-gray-800 dark:text-gray-200 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors active:scale-[0.98]">
                {choice}
              </button>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="px-4 py-3 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
          {freeMode && (
            <button onClick={endFreeMode}
              className="w-full mb-2 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-semibold">
              {t('endSession', uiLang)}
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage(inputText)}
                placeholder={t('typeMessage', uiLang)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-400"
                disabled={isLoading}
              />
            </div>
            {sttSupported && (
              <button
                onClick={() => isListening ? stopListening() : startListening({ lang: 'en-US' })}
                aria-label="Toggle microphone"
                className={`p-2.5 rounded-xl transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                disabled={isLoading}>
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            )}
            <button
              onClick={() => sendMessage(inputText)}
              disabled={!inputText.trim() || isLoading}
              aria-label="Send"
              className="p-2.5 rounded-xl bg-brand-500 text-white disabled:opacity-40 transition-opacity">
              <Send size={18} />
            </button>
          </div>
          {step?.hints && !isLoading && (
            <div className="mt-2 flex flex-wrap gap-1">
              {step.hints.map((hint, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-900/20 text-[10px] text-brand-600 dark:text-brand-400">
                  {hint}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ═══ INDUSTRY & SCENARIO SELECTION ═══
  const scenarios = SCENARIOS[selectedIndustry] || {};
  const unlockedLevels = CAREER_LEVELS.filter(l => simData.careerXP >= l.minXP);
  const unlockedLevelIds = new Set(unlockedLevels.map(l => l.id));

  return (
    <div className="min-h-screen pb-24 px-4">
      <KidsIntro
        id="simulation-v1"
        name={progress.displayName}
        emoji="💬"
        title="Talk to Speakli!"
        titleHe="דברו עם ספיקלי!"
        titleAr="تحدث مع سبيكلي!"
        titleRu="Говори со Спикли!"
        desc="Hi! Let's practice speaking English together! I'll help you learn to talk!"
        descHe="היי! בואו נתרגל לדבר אנגלית ביחד! אני אעזור לכם ללמוד לדבר!"
        descAr="مرحباً! دعونا نتدرب على التحدث بالإنجليزية معاً! سأساعدك على التعلم!"
        descRu="Привет! Давайте вместе тренируем английский! Я помогу тебе научиться говорить!"
        uiLang={uiLang}
        gradient="from-amber-500 via-orange-500 to-red-500"
        buttonLabel="Let's talk!"
        buttonLabelHe="בואו נדבר!"
        buttonLabelAr="هيا نتحدث!"
        buttonLabelRu="Давай поговорим!"
      />

      {/* Header */}
      <div className="text-center pt-2 pb-4">
        <h1 className="text-xl font-black text-gray-900 dark:text-white">
          {t('simulations', uiLang)}
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t('simulationsSubtitle', uiLang)}
        </p>
      </div>

      {/* Career level badge + progress */}
      <GlassCard className="mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-2xl shadow-md">
            {careerLevel.emoji}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {lf(careerLevel, 'title', uiLang)}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">
              {t('careerLevel', uiLang)} {careerLevel.level}
            </p>
            {nextLevel && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (simData.careerXP / nextLevel.minXP) * 100)}%` }} />
                </div>
                <span className="text-[10px] text-gray-500">{simData.careerXP}/{nextLevel.minXP} XP</span>
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Industry tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
        {INDUSTRIES.map(ind => (
          <button key={ind.id}
            onClick={() => setSelectedIndustry(ind.id)}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              selectedIndustry === ind.id
                ? `bg-gradient-to-r ${ind.color} text-white shadow-md`
                : 'glass-card text-gray-700 dark:text-gray-300'
            }`}>
            <span className="mr-1.5">{ind.emoji}</span>
            {lf(ind, 'label', uiLang)}
          </button>
        ))}
      </div>

      {/* Scenarios by career level */}
      {CAREER_LEVELS.map(level => {
        const levelScenarios = scenarios[level.id] || [];
        if (levelScenarios.length === 0) return null;
        const isUnlocked = unlockedLevelIds.has(level.id);

        return (
          <div key={level.id} className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <span>{level.emoji}</span>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                {lf(level, 'title', uiLang)}
              </h2>
              {!isUnlocked && <Lock size={12} className="text-gray-400" />}
            </div>

            <div className="space-y-2">
              {levelScenarios.map(scenario => {
                const completed = simData.completedScenarios?.[scenario.id];

                return (
                  <div key={scenario.id}
                    onClick={() => isUnlocked && startScenario(scenario)}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      isUnlocked
                        ? 'glass-card cursor-pointer active:scale-[0.98] hover:shadow-md'
                        : 'bg-gray-100/50 dark:bg-gray-800/30 opacity-60 cursor-not-allowed'
                    }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                      isUnlocked ? 'bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/30 dark:to-brand-800/30' : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      {isUnlocked ? scenario.emoji : <Lock size={16} className="text-gray-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                        {lf(scenario, 'title', uiLang)}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                        {lf(scenario, 'desc', uiLang)} · {scenario.duration}{t('minuteShort', uiLang)}
                      </p>
                    </div>
                    {completed && (
                      <div className="flex items-center gap-1">
                        <Check size={14} className="text-emerald-500" />
                        <span className="text-xs text-emerald-600 font-semibold">{completed.score}</span>
                      </div>
                    )}
                    {isUnlocked && !completed && (
                      <ChevronRight size={16} className="text-gray-400 rtl:rotate-180" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Free AI Conversation */}
      <div className="mt-2 mb-6">
        <div onClick={startFreeMode}
          className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 text-white cursor-pointer active:scale-[0.98] transition-transform shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <MessageCircle size={20} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold">{t('freeConversation', uiLang)}</p>
            <p className="text-[11px] opacity-80">
              {t('freeConversationDesc', uiLang)}
            </p>
          </div>
          <Play size={18} className="opacity-80" />
        </div>
      </div>
      {showPaywall && <PaywallModal feature="simulation" onClose={() => setShowPaywall(false)} onNavigate={() => {}} />}
    </div>
  );
}
