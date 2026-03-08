import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Mic, MicOff, Send, Lock, Star, ChevronRight, Sparkles, MessageCircle, Trophy, Eye } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useUserProgress } from '../contexts/UserProgressContext.jsx';
import { useSpeech } from '../contexts/SpeechContext.jsx';
import useSpeechRecognition from '../hooks/useSpeechRecognition.js';
import useUsageLimit from '../hooks/useUsageLimit.js';
import { playFromAPI } from '../utils/hebrewAudio.js';
import { playCorrect, playComplete, playStar, playWrong } from '../utils/gameSounds.js';
import { WORLDS, TW_XP, TW_STARS, scoreToStars } from '../data/talking-world-data.js';
import { t, tReplace, lf, RTL_LANGS } from '../utils/translations.js';
// KidsIntro replaced by video intro

/* ════════════════════════════════════════════════════════════════
   TALKING WORLD PAGE
   ════════════════════════════════════════════════════════════════ */

export default function TalkingWorldPage({ onBack }) {
  const { uiLang } = useTheme();
  const { progress, addXP, updateProgress } = useUserProgress();
  const { sttSupported } = useSpeech();
  const { transcript, interimTranscript, isListening, startListening, stopListening } = useSpeechRecognition();
  const { isBlocked: usageLimitBlocked, remaining: usageRemaining } = useUsageLimit('talkingWorld');

  const [phase, setPhase] = useState('world-select');
  const [selectedWorld, setSelectedWorld] = useState(null);
  const [selectedNpc, setSelectedNpc] = useState(null);
  const [taskIndex, setTaskIndex] = useState(0);
  const [chatHistory, setChatHistory] = useState([]);
  const [typedInput, setTypedInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [npcStarsEarned, setNpcStarsEarned] = useState(0);
  const [npcTotalScore, setNpcTotalScore] = useState(0);
  const [npcTaskCount, setNpcTaskCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [worldStarsEarned, setWorldStarsEarned] = useState(0);
  const [showIntroVideo, setShowIntroVideo] = useState(false);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const isRTL = RTL_LANGS.includes(uiLang);
  const childLevel = progress.curriculumLevel || progress.childLevel || 1;

  const twProgress = progress.talkingWorld || {};

  // ── Helpers ──
  const getNpcsCompleted = useCallback((worldId) => {
    return twProgress.npcsCompleted?.[worldId] || [];
  }, [twProgress]);

  const getNpcStars = useCallback((npcId) => {
    return twProgress.npcStars?.[npcId] || 0;
  }, [twProgress]);

  const isWorldCompleted = useCallback((worldId) => {
    return (twProgress.worldsCompleted || []).includes(worldId);
  }, [twProgress]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Handle transcript from STT
  useEffect(() => {
    if (transcript && !isListening && phase === 'conversation' && !isProcessing) {
      handleUserInput(transcript);
    }
  }, [transcript, isListening]);

  // ── Save progress to Firestore ──
  const saveProgress = useCallback(async (updates) => {
    const current = progress.talkingWorld || {};
    const merged = {
      worldsCompleted: updates.worldsCompleted || current.worldsCompleted || [],
      npcsCompleted: { ...(current.npcsCompleted || {}), ...(updates.npcsCompleted || {}) },
      npcStars: { ...(current.npcStars || {}), ...(updates.npcStars || {}) },
      totalStars: updates.totalStars ?? current.totalStars ?? 0,
      totalNpcsCompleted: updates.totalNpcsCompleted ?? current.totalNpcsCompleted ?? 0,
      totalWorldsCompleted: updates.totalWorldsCompleted ?? current.totalWorldsCompleted ?? 0,
    };
    await updateProgress({ talkingWorld: merged });
  }, [progress.talkingWorld, updateProgress]);

  // ── TTS at kid-friendly rate (English then Hebrew translation) ──
  const speakNpc = useCallback(async (textEn, textHe) => {
    setIsSpeaking(true);
    try {
      // Speak Hebrew translation first so kid understands
      if (textHe && uiLang === 'he') {
        await playFromAPI(textHe, 'he', undefined, { rate: 0.9 });
        // Small pause between languages
        await new Promise(r => setTimeout(r, 400));
      }
      // Then speak English (the actual learning part)
      await playFromAPI(textEn, 'en', undefined, { rate: 0.82 });
    } catch (_) {}
    setIsSpeaking(false);
  }, [uiLang]);

  // ── Local evaluation for say-word / say-sentence ──
  function evaluateLocally(task, userText) {
    const cleaned = userText.toLowerCase().trim().replace(/[.,!?'"]/g, '');

    if (task.acceptAny && cleaned.length > 0) {
      return { score: 90, correction: null, understood: true };
    }

    if (task.type === 'say-word') {
      const target = (task.answer || '').toLowerCase();
      const alts = (task.altAnswers || []).map(a => a.toLowerCase());
      if (cleaned === target || cleaned.includes(target) || alts.some(a => cleaned === a || cleaned.includes(a))) {
        return { score: 95, correction: null, understood: true };
      }
      // Partial match (close enough)
      if (target && cleaned.length > 0 && (target.includes(cleaned) || cleaned.includes(target.slice(0, 3)))) {
        return { score: 70, correction: task.answer, understood: true };
      }
      return { score: 50, correction: task.answer, understood: cleaned.length > 0 };
    }

    if (task.type === 'say-sentence' && task.pattern) {
      const regex = typeof task.pattern === 'string' ? new RegExp(task.pattern, 'i') : task.pattern;
      if (regex.test(cleaned)) {
        return { score: 92, correction: null, understood: true };
      }
      // Said something meaningful but didn't match pattern
      if (cleaned.split(' ').length >= 2) {
        return { score: 65, correction: task.hintEn, understood: true };
      }
      return { score: 45, correction: task.hintEn, understood: cleaned.length > 0 };
    }

    return { score: 70, correction: null, understood: cleaned.length > 0 };
  }

  // ── API call for ai-conversation tasks ──
  async function callTalkingWorldAPI(task, userText) {
    try {
      const token = await window.auth?.currentUser?.getIdToken();
      if (!token) return { reply: 'Great job!', score: 80, correction: null, understood: true };

      const world = WORLDS.find(w => w.id === selectedWorld);
      const npc = world?.npcs?.find(n => n.id === selectedNpc);

      const res = await fetch('/api/talking-world', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          transcript: userText,
          npcName: lf(npc, 'name', 'en'),
          npcPersonality: npc?.personality || '',
          taskPrompt: task.promptEn,
          topic: task.topic,
          worldLevel: world?.level || 1,
          history: chatHistory.slice(-6).map(m => ({
            role: m.role,
            content: m.text,
          })),
          uiLang,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (errData.error === 'limit_reached') {
          return { reply: t('twLimitReached', uiLang) || 'Come back tomorrow for more!', score: 0, correction: null, understood: true, limitReached: true };
        }
        throw new Error('API error');
      }

      return await res.json();
    } catch (err) {
      console.warn('Talking World API error:', err);
      return { reply: 'Great job talking to me!', score: 75, correction: null, understood: true };
    }
  }

  // ── Handle user input (from mic or typing) ──
  async function handleUserInput(text) {
    if (!text?.trim() || isProcessing) return;
    setIsProcessing(true);
    setShowHint(false);

    const world = WORLDS.find(w => w.id === selectedWorld);
    const npc = world?.npcs?.find(n => n.id === selectedNpc);
    const task = npc?.tasks?.[taskIndex];
    if (!task) { setIsProcessing(false); return; }

    // Add user message to chat
    setChatHistory(prev => [...prev, { role: 'user', text: text.trim() }]);

    let result;
    if (task.type === 'ai-conversation') {
      result = await callTalkingWorldAPI(task, text.trim());
    } else {
      result = evaluateLocally(task, text.trim());
      // Generate NPC reply for local eval
      const score = result.score;
      if (score >= TW_STARS.three) {
        result.reply = 'Amazing! You said it perfectly!';
      } else if (score >= TW_STARS.two) {
        result.reply = 'Great job! That was really good!';
      } else if (score >= TW_STARS.one) {
        result.reply = result.correction
          ? `Good try! The answer is "${result.correction}". Try again next time!`
          : 'Good try! Keep practicing!';
      } else {
        result.reply = result.correction
          ? `No worries! The answer is "${result.correction}". You'll get it next time!`
          : 'No worries! Keep trying!';
      }
    }

    if (result.limitReached) {
      setChatHistory(prev => [...prev, { role: 'npc', text: result.reply }]);
      setIsProcessing(false);
      return;
    }

    // Add NPC reply
    setChatHistory(prev => [...prev, {
      role: 'npc',
      text: result.reply,
      score: result.score,
      correction: result.correction,
      stars: scoreToStars(result.score),
    }]);

    // Play sounds
    const stars = scoreToStars(result.score);
    if (stars >= 2) playCorrect();
    else if (stars === 1) playCorrect();
    else if (result.score > 0) playWrong();

    // Speak NPC reply
    if (result.reply) speakNpc(result.reply);

    // Track score
    const newTotal = npcTotalScore + (result.score || 0);
    const newCount = npcTaskCount + 1;
    setNpcTotalScore(newTotal);
    setNpcTaskCount(newCount);
    setNpcStarsEarned(prev => prev + stars);

    // XP for task
    addXP(TW_XP.taskComplete, 'talking-world');
    if (stars === 3) addXP(TW_XP.perfectTask, 'talking-world');

    // Wait a bit then advance
    setTimeout(() => {
      setIsProcessing(false);
      setTypedInput('');

      const nextIndex = taskIndex + 1;
      if (nextIndex < (npc?.tasks?.length || 0)) {
        setTaskIndex(nextIndex);
        // Show & speak next task prompt with translation
        const nextTask = npc.tasks[nextIndex];
        if (nextTask) {
          setTimeout(() => {
            const taskHe = nextTask.promptHe || null;
            setChatHistory(prev => [...prev, { role: 'npc', text: nextTask.promptEn, isTask: true, translation: taskHe }]);
            speakNpc(nextTask.promptEn, taskHe);
          }, 800);
        }
      } else {
        // NPC complete
        completeNpc(newTotal, newCount);
      }
    }, 2000);
  }

  // ── Complete NPC ──
  async function completeNpc(totalScore, taskCount) {
    const avgScore = taskCount > 0 ? Math.round(totalScore / taskCount) : 0;
    const totalStarsForNpc = npcStarsEarned + scoreToStars(avgScore > 0 ? avgScore : 70);

    playComplete();
    addXP(TW_XP.npcComplete, 'talking-world');

    // Save progress
    const world = WORLDS.find(w => w.id === selectedWorld);
    const currentNpcsCompleted = getNpcsCompleted(selectedWorld);
    const newNpcsCompleted = currentNpcsCompleted.includes(selectedNpc)
      ? currentNpcsCompleted
      : [...currentNpcsCompleted, selectedNpc];

    const currentTotalNpcs = twProgress.totalNpcsCompleted || 0;
    const wasAlreadyCompleted = currentNpcsCompleted.includes(selectedNpc);

    await saveProgress({
      npcsCompleted: { [selectedWorld]: newNpcsCompleted },
      npcStars: { [selectedNpc]: Math.max(getNpcStars(selectedNpc), totalStarsForNpc) },
      totalNpcsCompleted: wasAlreadyCompleted ? currentTotalNpcs : currentTotalNpcs + 1,
    });

    // Check if world is complete
    const allNpcs = world?.npcs?.map(n => n.id) || [];
    const isWorldDone = allNpcs.every(id => newNpcsCompleted.includes(id));

    if (isWorldDone && !isWorldCompleted(selectedWorld)) {
      // Calculate total stars for world
      let wStars = 0;
      allNpcs.forEach(id => {
        wStars += id === selectedNpc ? Math.max(getNpcStars(id), totalStarsForNpc) : getNpcStars(id);
      });
      setWorldStarsEarned(wStars);

      addXP(TW_XP.worldComplete, 'talking-world');
      const currentWorldsCompleted = twProgress.worldsCompleted || [];
      await saveProgress({
        worldsCompleted: [...currentWorldsCompleted, selectedWorld],
        totalWorldsCompleted: (twProgress.totalWorldsCompleted || 0) + 1,
      });

      setPhase('world-complete');
    } else {
      setPhase('npc-complete');
    }
  }

  // ── Start NPC conversation ──
  function startNpcConversation(npcId) {
    const world = WORLDS.find(w => w.id === selectedWorld);
    const npc = world?.npcs?.find(n => n.id === npcId);
    if (!npc) return;

    setSelectedNpc(npcId);
    setTaskIndex(0);
    setChatHistory([]);
    setTypedInput('');
    setNpcStarsEarned(0);
    setNpcTotalScore(0);
    setNpcTaskCount(0);
    setShowHint(false);
    setPhase('conversation');

    // NPC greeting + first task
    setTimeout(() => {
      const greetHe = npc.greetingHe || null;
      setChatHistory([{ role: 'npc', text: npc.greetingEn, translation: greetHe }]);
      speakNpc(npc.greetingEn, greetHe);
      setTimeout(() => {
        const task0 = npc.tasks[0];
        const taskHe = task0.promptHe || null;
        setChatHistory(prev => [...prev, { role: 'npc', text: task0.promptEn, isTask: true, translation: taskHe }]);
        speakNpc(task0.promptEn, taskHe);
      }, 4000);
    }, 500);
  }

  // ── Send typed message ──
  function handleSendTyped() {
    if (!typedInput.trim() || isProcessing) return;
    handleUserInput(typedInput.trim());
  }

  // ══════════════════════════════════════════
  // RENDER PHASES
  // ══════════════════════════════════════════

  // ── Phase: World Select ──
  function renderWorldSelect() {
    return (
      <div className="px-4 pt-4 pb-24 space-y-4">
        <h2 className="text-2xl font-black text-center text-gray-800 dark:text-white">
          {t('twTitle', uiLang)}
        </h2>
        <p className="text-sm text-center text-gray-500 dark:text-gray-400 font-medium">
          {t('twMeetFriends', uiLang)}
        </p>

        {WORLDS.map((world) => {
          const locked = world.level > childLevel;
          const completed = isWorldCompleted(world.id);
          const npcsCompleted = getNpcsCompleted(world.id);
          const totalNpcs = world.npcs.length;

          return (
            <button
              key={world.id}
              onClick={() => {
                if (locked) return;
                setSelectedWorld(world.id);
                setPhase('world-intro');
              }}
              disabled={locked}
              className={`w-full rounded-3xl p-5 text-left transition-all duration-300 relative overflow-hidden ${
                locked ? 'opacity-50 grayscale' : 'active:scale-95'
              }`}
              style={{
                background: locked
                  ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
                  : undefined,
              }}
            >
              <div className="w-full rounded-3xl p-5 relative overflow-hidden" style={{ background: `linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.55)), url(${world.bg}) center/cover` }}>
                {/* Decorative circles */}
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10" />

                {locked && (
                  <div className="absolute top-3 right-3 bg-black/30 rounded-full p-1.5">
                    <Lock size={16} className="text-white" />
                  </div>
                )}

                {completed && (
                  <div className="absolute top-3 right-3 bg-yellow-400 rounded-full p-1.5">
                    <Trophy size={16} className="text-yellow-900" />
                  </div>
                )}

                <div className="relative z-10">
                  <img src={world.icon} alt="" className="w-16 h-16 rounded-full object-cover mb-2 shadow-lg border-2 border-white/30" />
                  <h3 className="text-white font-black text-xl">
                    {lf(world, 'name', uiLang)}
                  </h3>
                  <p className="text-white/70 text-sm font-medium mt-1">
                    {locked
                      ? t('twLocked', uiLang)
                      : tReplace('twFriendsMet', uiLang, { n: `${npcsCompleted.length}/${totalNpcs}` })
                    }
                  </p>

                  {/* NPC image preview */}
                  {!locked && (
                    <div className="flex gap-2 mt-3">
                      {world.npcs.map(npc => (
                        <img
                          key={npc.id}
                          src={npc.image}
                          alt={lf(npc, 'name', 'en')}
                          className={`w-10 h-10 rounded-full object-cover border-2 ${
                            npcsCompleted.includes(npc.id) ? 'border-yellow-300 shadow-md' : 'border-white/30 opacity-70'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // ── Phase: NPC Path ──
  function renderNpcPath() {
    const world = WORLDS.find(w => w.id === selectedWorld);
    if (!world) return null;

    const npcsCompleted = getNpcsCompleted(world.id);

    return (
      <div className="px-4 pt-4 pb-24 min-h-screen" style={{ background: `linear-gradient(to bottom, rgba(255,255,255,0.85), rgba(255,255,255,0.95)), url(${world.bg}) center/cover fixed` }}>
        <div className="text-center mb-6">
          <img src={world.icon} alt="" className="w-20 h-20 rounded-full object-cover mx-auto mb-2 shadow-lg border-3 border-white/50" />
          <h2 className="text-2xl font-black text-gray-800 dark:text-white">
            {lf(world, 'name', uiLang)}
          </h2>
        </div>

        {/* NPC path (vertical board game) */}
        <div className="flex flex-col items-center gap-2">
          {world.npcs.map((npc, i) => {
            const isCompleted = npcsCompleted.includes(npc.id);
            const isUnlocked = i === 0 || npcsCompleted.includes(world.npcs[i - 1].id);
            const stars = getNpcStars(npc.id);

            return (
              <React.Fragment key={npc.id}>
                {i > 0 && (
                  <div className="flex flex-col items-center gap-0.5">
                    {[0, 1, 2].map(d => (
                      <div key={d} className={`w-1.5 h-1.5 rounded-full ${isUnlocked ? 'bg-blue-400' : 'bg-gray-300 dark:bg-gray-600'}`} />
                    ))}
                  </div>
                )}

                <button
                  onClick={() => {
                    if (!isUnlocked) return;
                    startNpcConversation(npc.id);
                  }}
                  disabled={!isUnlocked}
                  className={`w-full max-w-sm rounded-2xl p-4 flex items-center gap-4 transition-all duration-300 ${
                    isUnlocked
                      ? 'bg-white dark:bg-gray-800 shadow-lg active:scale-95'
                      : 'bg-gray-100 dark:bg-gray-800/50 opacity-50'
                  }`}
                >
                  {isUnlocked ? (
                    <img
                      src={npc.image}
                      alt={lf(npc, 'name', 'en')}
                      className={`w-16 h-16 rounded-full object-cover shrink-0 border-3 shadow-md ${
                        isCompleted ? 'border-yellow-400' : 'border-white/50'
                      }`}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 bg-gray-200 dark:bg-gray-700">
                      <Lock size={20} className="text-gray-400" />
                    </div>
                  )}

                  <div className="flex-1 text-left" dir={isRTL ? 'rtl' : 'ltr'}>
                    <h3 className="font-bold text-gray-800 dark:text-white">
                      {lf(npc, 'name', uiLang)}
                    </h3>
                    {isCompleted && stars > 0 && (
                      <div className="flex items-center gap-0.5 mt-1">
                        {[1, 2, 3].map(s => (
                          <Star
                            key={s}
                            size={14}
                            className={s <= Math.min(3, Math.ceil(stars / (npc.tasks.length || 1))) ? 'text-yellow-400' : 'text-gray-300'}
                            fill={s <= Math.min(3, Math.ceil(stars / (npc.tasks.length || 1))) ? 'currentColor' : 'none'}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {isUnlocked && !isCompleted && (
                    <ChevronRight size={20} className="text-gray-400 shrink-0" />
                  )}
                  {isCompleted && (
                    <div className="text-green-500 text-lg shrink-0">✓</div>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Phase: Conversation ──
  function renderConversation() {
    const world = WORLDS.find(w => w.id === selectedWorld);
    const npc = world?.npcs?.find(n => n.id === selectedNpc);
    if (!npc) return null;

    const task = npc.tasks[taskIndex];
    const isAiTask = task?.type === 'ai-conversation';

    return (
      <div className="flex flex-col h-[100dvh]">
        {/* Header */}
        <div className={`bg-gradient-to-r ${world.gradient} px-4 py-3 flex items-center gap-3 shadow-md`}
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
        >
          <button onClick={() => setPhase('npc-path')} className="text-white/80 hover:text-white">
            <ArrowLeft size={22} />
          </button>
          <img src={npc.image} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-white/30" />
          <div className="flex-1">
            <h3 className="text-white font-bold text-sm">{lf(npc, 'name', uiLang)}</h3>
            <p className="text-white/70 text-xs">
              {tReplace('twTask', uiLang, { current: taskIndex + 1, total: npc.tasks.length })}
            </p>
          </div>
          {/* Stars earned so far */}
          <div className="flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-1">
            <Star size={14} className="text-yellow-300" fill="currentColor" />
            <span className="text-white text-xs font-bold">{npcStarsEarned}</span>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          {chatHistory.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white rounded-br-md'
                  : msg.isTask
                    ? `bg-gradient-to-r ${world.gradient} text-white rounded-bl-md`
                    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm rounded-bl-md'
              }`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>

                {/* Hebrew/UI language translation */}
                {msg.role === 'npc' && msg.translation && (
                  <p className="text-xs mt-1.5 pt-1 border-t border-black/10 text-gray-500 dark:text-gray-400" dir={isRTL ? 'rtl' : 'ltr'}>
                    {msg.translation}
                  </p>
                )}

                {/* Score stars */}
                {msg.score !== undefined && msg.score > 0 && (
                  <div className="flex items-center gap-1 mt-1.5 pt-1.5 border-t border-white/20">
                    {[1, 2, 3].map(s => (
                      <Star
                        key={s}
                        size={12}
                        className={s <= (msg.stars || 0) ? 'text-yellow-400' : 'text-gray-300/50'}
                        fill={s <= (msg.stars || 0) ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                )}

                {/* Correction */}
                {msg.correction && (
                  <p className="text-xs mt-1 opacity-80 italic" dir={isRTL ? 'rtl' : 'ltr'}>
                    💡 {msg.correction}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Processing indicator */}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {/* Listening indicator */}
          {isListening && (
            <div className="flex justify-center">
              <div className="bg-red-50 dark:bg-red-900/30 rounded-full px-4 py-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-medium text-red-600 dark:text-red-400">
                  {interimTranscript || t('twListening', uiLang) || 'Listening...'}
                </span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Hint button */}
        {task && !showHint && !isProcessing && (
          <div className="px-4 pb-1">
            <button
              onClick={() => { setShowHint(true); playStar(); }}
              className="text-xs text-blue-500 dark:text-blue-400 font-medium flex items-center gap-1"
            >
              <Eye size={12} /> {t('twHint', uiLang)}
            </button>
          </div>
        )}
        {showHint && task && (
          <div className="px-4 pb-1">
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl px-3 py-2 text-xs text-blue-700 dark:text-blue-300 font-medium" dir={isRTL ? 'rtl' : 'ltr'}>
              💡 {task.hintEn || lf(task, 'prompt', uiLang)}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-white dark:bg-gray-800"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
        >
          <div className="flex items-center gap-2">
            {/* Mic button */}
            {sttSupported && (
              <button
                onClick={() => {
                  if (isListening) {
                    stopListening();
                  } else if (!isProcessing) {
                    startListening({ lang: 'en-US' });
                  }
                }}
                disabled={isProcessing}
                className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                    : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md'
                } ${isProcessing ? 'opacity-50' : ''}`}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
            )}

            {/* Text input (always visible as fallback) */}
            <div className="flex-1 flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2">
              <input
                ref={inputRef}
                type="text"
                value={typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendTyped(); }}
                placeholder={t('twTypeHere', uiLang)}
                disabled={isProcessing}
                className="flex-1 bg-transparent text-sm text-gray-800 dark:text-white outline-none placeholder-gray-400"
                dir="ltr"
              />
              <button
                onClick={handleSendTyped}
                disabled={!typedInput.trim() || isProcessing}
                className="text-blue-500 disabled:text-gray-300"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Phase: NPC Complete ──
  function renderNpcComplete() {
    const world = WORLDS.find(w => w.id === selectedWorld);
    const npc = world?.npcs?.find(n => n.id === selectedNpc);
    if (!npc) return null;

    const avgScore = npcTaskCount > 0 ? Math.round(npcTotalScore / npcTaskCount) : 0;
    const avgStars = scoreToStars(avgScore);
    const npcsCompleted = getNpcsCompleted(selectedWorld);
    const nextNpcIndex = world.npcs.findIndex(n => n.id === selectedNpc) + 1;
    const nextNpc = nextNpcIndex < world.npcs.length ? world.npcs[nextNpcIndex] : null;
    const hasNext = nextNpc && !npcsCompleted.includes(nextNpc.id);

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="animate-pop-in">
          <img src={npc.image} alt="" className="w-28 h-28 rounded-full object-cover mx-auto mb-4 shadow-xl border-4 border-yellow-300 animate-float" />
          <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-2">
            {t('twGreatJob', uiLang)}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            {lf(npc, 'name', uiLang)}
          </p>

          {/* Stars */}
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3].map(s => (
              <Star
                key={s}
                size={36}
                className={`transition-all duration-500 ${s <= avgStars ? 'text-yellow-400 animate-pop-in' : 'text-gray-300'}`}
                fill={s <= avgStars ? 'currentColor' : 'none'}
                style={{ animationDelay: `${s * 200}ms` }}
              />
            ))}
          </div>

          {/* XP earned */}
          <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full px-4 py-2 font-bold text-sm mb-8">
            <Sparkles size={16} /> +{TW_XP.npcComplete + TW_XP.taskComplete * (npc.tasks?.length || 0)} XP
          </div>
        </div>

        <div className="w-full max-w-sm space-y-3">
          {hasNext && (
            <button
              onClick={() => startNpcConversation(nextNpc.id)}
              className={`w-full py-3.5 rounded-2xl bg-gradient-to-r ${world.gradient} text-white font-bold text-sm shadow-lg active:scale-95 transition-transform`}
            >
              {t('twNextFriend', uiLang)} → {nextNpc.emoji} {lf(nextNpc, 'name', uiLang)}
            </button>
          )}
          <button
            onClick={() => setPhase('npc-path')}
            className="w-full py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium text-sm"
          >
            {t('back', uiLang) || 'Back'}
          </button>
        </div>
      </div>
    );
  }

  // ── Phase: World Complete ──
  function renderWorldComplete() {
    const world = WORLDS.find(w => w.id === selectedWorld);
    if (!world) return null;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="animate-pop-in">
          <div className="text-8xl mb-4">🎉</div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white mb-2">
            {t('twWorldComplete', uiLang)}
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 font-medium mb-2">
            {lf(world, 'name', uiLang)}
          </p>

          <div className="text-6xl mb-4">{world.emoji}</div>

          {/* Stars */}
          <div className="flex justify-center gap-1 mb-4">
            {[1, 2, 3].map(s => (
              <Star
                key={s}
                size={40}
                className="text-yellow-400 animate-pop-in"
                fill="currentColor"
                style={{ animationDelay: `${s * 200}ms` }}
              />
            ))}
          </div>

          {/* XP */}
          <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full px-5 py-2.5 font-bold mb-8">
            <Trophy size={18} /> +{TW_XP.worldComplete} XP
          </div>
        </div>

        <button
          onClick={() => {
            setPhase('world-select');
            setSelectedWorld(null);
            setSelectedNpc(null);
          }}
          className="w-full max-w-sm py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold text-sm shadow-lg active:scale-95 transition-transform"
        >
          {t('backHome', uiLang) || 'Back to Worlds'}
        </button>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // MAIN RENDER
  // ══════════════════════════════════════════

  // Check if intro video was seen before
  useEffect(() => {
    const seen = localStorage.getItem('tw-intro-seen');
    if (!seen) setShowIntroVideo(true);
  }, []);

  function handleIntroDone() {
    localStorage.setItem('tw-intro-seen', '1');
    setShowIntroVideo(false);
  }

  // ── Phase: World Intro (video before NPC path) ──
  function renderWorldIntro() {
    const world = WORLDS.find(w => w.id === selectedWorld);
    if (!world) return null;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black relative">
        <video
          ref={videoRef}
          src={world.video}
          autoPlay
          playsInline
          muted={false}
          className="w-full max-h-[70vh] object-contain"
          onEnded={() => setPhase('npc-path')}
        />
        <button
          onClick={() => setPhase('npc-path')}
          className="absolute bottom-10 bg-white/20 backdrop-blur-sm text-white px-6 py-2.5 rounded-full font-bold text-sm active:scale-95 transition-transform"
        >
          {t('skip', uiLang) || 'Skip'}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Video Intro (first time only) */}
      {showIntroVideo && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
          <video
            autoPlay
            playsInline
            muted={false}
            src="/videos/talking-world/tw-intro-main.mp4"
            className="w-full max-h-[70vh] object-contain"
            onEnded={handleIntroDone}
          />
          <button
            onClick={handleIntroDone}
            className="absolute bottom-10 bg-white/20 backdrop-blur-sm text-white px-6 py-2.5 rounded-full font-bold text-sm active:scale-95 transition-transform"
          >
            {t('skip', uiLang) || 'Skip'}
          </button>
        </div>
      )}

      {/* Back header (for non-conversation phases) */}
      {phase !== 'conversation' && phase !== 'world-intro' && (
        <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-4 py-3 flex items-center gap-3"
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
        >
          <button
            onClick={() => {
              if (phase === 'npc-path') setPhase('world-select');
              else if (phase === 'npc-complete' || phase === 'world-complete') setPhase('world-select');
              else onBack();
            }}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-lg font-bold text-gray-800 dark:text-white">
            {t('twTitle', uiLang)}
          </h1>
        </div>
      )}

      {phase === 'world-select' && renderWorldSelect()}
      {phase === 'world-intro' && renderWorldIntro()}
      {phase === 'npc-path' && renderNpcPath()}
      {phase === 'conversation' && renderConversation()}
      {phase === 'npc-complete' && renderNpcComplete()}
      {phase === 'world-complete' && renderWorldComplete()}
    </div>
  );
}
