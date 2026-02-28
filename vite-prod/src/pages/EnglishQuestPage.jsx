import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ArrowLeft, Mic, MicOff, Volume2, Shield, Sword, Heart, Coins } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useUserProgress } from '../contexts/UserProgressContext.jsx';
import { useSpeech } from '../contexts/SpeechContext.jsx';
import useSpeechRecognition from '../hooks/useSpeechRecognition.js';
import { stopAllAudio } from '../utils/hebrewAudio.js';
import { playCorrect, playWrong, playComplete, playStar, playTap } from '../utils/gameSounds.js';
import { WORDS_BY_LEVEL, SENTENCES_BY_LEVEL, getWordsForLevel } from '../data/kids-vocabulary.js';
import { QUEST_GRAMMAR } from '../data/kids-vocabulary.js';
import KidsIntro from '../components/kids/KidsIntro.jsx';

/* ─── Constants ─── */

const QUEST_SCENES = [
  { id: 'forest', emoji: '🌲', nameEn: 'Magic Forest', nameHe: 'היער הקסום', bg: 'from-green-600 to-emerald-800', boss: '🐲', bossNameEn: 'Dragon', bossNameHe: 'דרקון' },
  { id: 'school', emoji: '🏫', nameEn: 'Haunted School', nameHe: 'בית הספר הרדוף', bg: 'from-purple-600 to-indigo-800', boss: '👻', bossNameEn: 'Ghost', bossNameHe: 'רוח רפאים' },
  { id: 'space', emoji: '🚀', nameEn: 'Space Station', nameHe: 'תחנת חלל', bg: 'from-blue-800 to-slate-900', boss: '👾', bossNameEn: 'Alien', bossNameHe: 'חייזר' },
  { id: 'ocean', emoji: '🌊', nameEn: 'Deep Ocean', nameHe: 'מעמקי הים', bg: 'from-cyan-600 to-blue-900', boss: '🐙', bossNameEn: 'Octopus', bossNameHe: 'תמנון' },
];

// First hero is Speakli (avatar image), rest are emoji heroes
const HEROES = ['speakli', '🧙‍♂️', '🦸‍♀️', '🧝‍♂️', '🥷', '🧑‍🚀', '🦹‍♀️'];

/** Renders a hero — Speakli avatar for index 0, emoji for others */
function HeroDisplay({ heroIdx, size = 'text-8xl', imgClass = 'w-24 h-24' }) {
  const [imgError, setImgError] = React.useState(false);
  const hero = HEROES[heroIdx || 0];
  if (hero === 'speakli' && !imgError) {
    return (
      <img
        src="/images/speakli-avatar.png"
        alt="Speakli"
        className={`${imgClass} drop-shadow-lg mx-auto`}
        onError={() => setImgError(true)}
      />
    );
  }
  const display = hero === 'speakli' ? '🦉' : hero;
  return <span className={size}>{display}</span>;
}
const OUTFITS = ['⚔️', '🛡️', '🪄', '👑', '🎩', '🦸'];
const PETS = ['🐉', '🦄', '🐺', '🦅', '🐱', '🤖'];
const OUTFIT_COST = 30;
const PET_COST = 50;

const MISSION_NAMES_EN = ['Vocabulary Hunt', 'Boss Battle', 'Speech Mission'];
const MISSION_NAMES_HE = ['ציד מילים', 'קרב בוס', 'משימת דיבור'];
const MISSION_EMOJIS = ['🏔️', '⚔️', '🎤'];

/* ─── Helpers ─── */

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom(arr, n, exclude = []) {
  const filtered = arr.filter(x => !exclude.includes(x));
  return shuffle(filtered).slice(0, n);
}

/* ─── Confetti ─── */
function ConfettiBurst({ show }) {
  if (!show) return null;
  const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'];
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 30}%`,
            background: colors[i % colors.length],
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${1 + Math.random() * 1}s`,
            width: `${6 + Math.random() * 8}px`,
            height: `${6 + Math.random() * 8}px`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}

/* ─── Floating XP indicator ─── */
function FloatingXP({ amount, x, y }) {
  return (
    <div
      className="fixed pointer-events-none z-50 text-xl font-black text-yellow-300 animate-float-up"
      style={{ left: x, top: y }}
    >
      +{amount} XP
    </div>
  );
}

/* ─── Boss HP Bar ─── */
function BossHPBar({ hp, maxHP, bossEmoji, bossName, isHe }) {
  const pct = Math.max(0, (hp / maxHP) * 100);
  const barColor = pct > 50 ? 'bg-red-500' : pct > 25 ? 'bg-orange-500' : 'bg-yellow-500';
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <span className="text-3xl">{bossEmoji}</span>
      <div className="flex-1">
        <div className="flex justify-between text-xs font-bold text-white/80 mb-1">
          <span>{bossName}</span>
          <span>{Math.round(hp)}/{maxHP} HP</span>
        </div>
        <div className="h-3 rounded-full bg-black/30 overflow-hidden">
          <div
            className={`h-full rounded-full ${barColor} transition-all duration-500`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Game Header ─── */
function QuestHeader({ scene, onBack, missionIndex, isHe }) {
  return (
    <div className={`sticky top-0 z-30 bg-gradient-to-r ${scene.bg} shadow-lg`}>
      <div className="flex items-center justify-between px-3 py-2">
        <button onClick={onBack} className="p-2 rounded-full bg-white/20 active:scale-90 transition-transform">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div className="text-center">
          <span className="text-white font-black text-sm">
            {isHe ? scene.nameHe : scene.nameEn}
          </span>
          <div className="flex items-center justify-center gap-1 mt-0.5">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i < missionIndex ? 'bg-green-400' : i === missionIndex ? 'bg-yellow-300 scale-125' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="w-9" />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   QUEST INTRO — Scene selection + hero display
   ══════════════════════════════════════════════════════ */
function QuestIntro({ scene, hero, questCoins, questLevel, onStart, onHero, isHe }) {
  const heroIdx = hero?.character || 0;
  const outfitEmoji = OUTFITS[hero?.outfit || 0];
  const petEmoji = hero?.pet != null ? PETS[hero.pet] : null;

  return (
    <div className={`min-h-screen bg-gradient-to-b ${scene.bg} flex flex-col items-center justify-center p-6 relative overflow-hidden`}>
      {/* Background scene emojis */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-float opacity-20 text-4xl"
            style={{
              left: `${(i * 13) % 90}%`,
              top: `${(i * 11) % 80}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${3 + (i % 3)}s`,
            }}
          >
            {scene.emoji}
          </div>
        ))}
      </div>

      <div className="relative z-10 text-center space-y-4 max-w-sm w-full">
        {/* Hero display */}
        <div className="relative inline-block">
          <div className="animate-jelly"><HeroDisplay heroIdx={heroIdx} /></div>
          <div className="absolute -top-1 -right-2 text-3xl">{outfitEmoji}</div>
          {petEmoji && <div className="absolute -bottom-1 -left-2 text-3xl animate-wiggle">{petEmoji}</div>}
        </div>

        {/* Quest level badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">
          <Shield size={16} className="text-yellow-300" />
          <span className="text-white font-bold text-sm">
            {isHe ? `גיבור ספיקלי רמה ${questLevel}` : `Speakli Hero Level ${questLevel}`}
          </span>
        </div>

        {/* Coins */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl">🪙</span>
          <span className="text-white font-black text-xl">{questCoins}</span>
        </div>

        {/* Scene info */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <div className="text-4xl mb-2">{scene.emoji}</div>
          <h2 className="text-white font-black text-xl mb-1">
            {isHe ? scene.nameHe : scene.nameEn}
          </h2>
          <p className="text-white/70 text-sm">
            {isHe ? `הביסו את ה${scene.bossNameHe} עם כוח האנגלית!` : `Defeat the ${scene.bossNameEn} with English power!`}
          </p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <span className="text-2xl">{scene.boss}</span>
            <span className="text-white/60 text-xs">
              {isHe ? `בוס: ${scene.bossNameHe}` : `Boss: ${scene.bossNameEn}`}
            </span>
          </div>
        </div>

        {/* Missions preview */}
        <div className="flex justify-center gap-2">
          {MISSION_EMOJIS.map((e, i) => (
            <div key={i} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/15 text-white text-xs font-bold">
              <span>{e}</span>
              <span>{isHe ? MISSION_NAMES_HE[i] : MISSION_NAMES_EN[i]}</span>
            </div>
          ))}
        </div>

        {/* Start button */}
        <button
          onClick={onStart}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black text-xl shadow-xl active:scale-95 transition-transform"
        >
          {isHe ? '!התחילו משימה' : 'Start Quest!'}
        </button>

        {/* Hero button */}
        <button
          onClick={onHero}
          className="w-full py-3 rounded-2xl bg-white/20 text-white font-bold text-sm active:scale-95 transition-transform"
        >
          {isHe ? '🦸 התאמה אישית של הגיבור' : '🦸 Customize Hero'}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MISSION TRANSITION — Between stages
   ══════════════════════════════════════════════════════ */
function MissionTransition({ missionIndex, scene, isHe, onReady }) {
  useEffect(() => {
    const t = setTimeout(onReady, 2500);
    return () => clearTimeout(t);
  }, [onReady]);

  return (
    <div className={`min-h-screen bg-gradient-to-b ${scene.bg} flex items-center justify-center`}>
      <div className="text-center animate-pop-in space-y-4">
        <div className="text-6xl">{MISSION_EMOJIS[missionIndex]}</div>
        <h2 className="text-white font-black text-2xl">
          {isHe ? `משימה ${missionIndex + 1}` : `Mission ${missionIndex + 1}`}
        </h2>
        <p className="text-white/80 font-bold text-lg">
          {isHe ? MISSION_NAMES_HE[missionIndex] : MISSION_NAMES_EN[missionIndex]}
        </p>
        <div className="flex justify-center gap-1">
          {[0, 1, 2].map(i => (
            <div key={i} className={`w-8 h-1.5 rounded-full ${i <= missionIndex ? 'bg-yellow-400' : 'bg-white/20'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   STAGE 1: VOCABULARY HUNT
   ══════════════════════════════════════════════════════ */
function VocabularyHuntMission({ scene, childLevel, onComplete, isHe, speak, speakSequence }) {
  const words = useMemo(() => getWordsForLevel(childLevel), [childLevel]);
  const optionCount = childLevel <= 2 ? 4 : 6;
  const TOTAL_ROUNDS = 5;

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [options, setOptions] = useState([]);
  const [target, setTarget] = useState(null);
  const [tapped, setTapped] = useState(null);
  const [correct, setCorrect] = useState(null);
  const [shakeWrong, setShakeWrong] = useState(null);
  const roundInitRef = useRef(false);

  const setupRound = useCallback((r) => {
    const targetWord = words[Math.floor(Math.random() * words.length)];
    const distractors = pickRandom(words, optionCount - 1, [targetWord]);
    const opts = shuffle([targetWord, ...distractors]);
    setTarget(targetWord);
    setOptions(opts);
    setTapped(null);
    setCorrect(null);
    setShakeWrong(null);

    // Voice instruction
    setTimeout(() => {
      speakSequence([
        { text: isHe ? 'מצא את ה' : 'Find the', lang: isHe ? 'he' : 'en-US', rate: 0.9 },
        { pause: 200 },
        { text: targetWord.word, lang: 'en-US', rate: 0.85 },
      ]);
    }, 400);
  }, [words, optionCount, isHe, speakSequence]);

  useEffect(() => {
    if (!roundInitRef.current) {
      roundInitRef.current = true;
      setupRound(0);
    }
  }, [setupRound]);

  const handleTap = (word, idx) => {
    if (tapped !== null) return;
    setTapped(idx);
    playTap();

    if (word.word === target.word) {
      setCorrect(idx);
      playCorrect();
      const xp = 10;
      setScore(s => s + 1);
      setXpEarned(x => x + xp);

      setTimeout(() => {
        const nextRound = round + 1;
        if (nextRound >= TOTAL_ROUNDS) {
          onComplete(xpEarned + xp, score + 1);
        } else {
          setRound(nextRound);
          setupRound(nextRound);
        }
      }, 1200);
    } else {
      setShakeWrong(idx);
      playWrong();
      setTimeout(() => {
        setTapped(null);
        setShakeWrong(null);
      }, 800);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${scene.bg} pt-2 pb-6 px-4`}>
      {/* Round counter */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-white/70 text-sm font-bold">
          {isHe ? `סיבוב ${round + 1}/${TOTAL_ROUNDS}` : `Round ${round + 1}/${TOTAL_ROUNDS}`}
        </span>
        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-400/20">
          <span className="text-yellow-300 text-sm font-bold">⚡ {xpEarned} XP</span>
        </div>
      </div>

      {/* Instruction */}
      <div className="text-center mb-6">
        <p className="text-white/70 text-sm font-medium mb-1">
          {isHe ? '!מצא את' : 'Find the'}
        </p>
        <h2 className="text-white font-black text-3xl">{target?.word || ''}</h2>
        <p className="text-white/50 text-xs mt-1" dir="rtl">{target?.translation || ''}</p>
        <button
          onClick={() => speak(target?.word, { lang: 'en-US', rate: 0.8 })}
          className="mt-2 p-2 rounded-full bg-white/20 active:scale-90 transition-transform inline-flex"
        >
          <Volume2 size={18} className="text-white" />
        </button>
      </div>

      {/* Options grid */}
      <div className={`grid ${optionCount <= 4 ? 'grid-cols-2' : 'grid-cols-3'} gap-3`}>
        {options.map((word, i) => {
          let bg = 'bg-white/15 hover:bg-white/25';
          let extra = '';
          if (correct === i) {
            bg = 'bg-green-500/60';
            extra = 'scale-110 ring-4 ring-green-400';
          } else if (shakeWrong === i) {
            bg = 'bg-red-500/40';
            extra = 'animate-shake';
          }
          return (
            <button
              key={`${round}-${i}`}
              onClick={() => handleTap(word, i)}
              className={`${bg} ${extra} rounded-2xl p-4 flex flex-col items-center gap-2 transition-all duration-300 active:scale-90`}
              disabled={tapped !== null && correct !== null}
            >
              <span className="text-4xl">{word.emoji}</span>
              <span className="text-white font-bold text-sm">{word.word}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   STAGE 2: BOSS BATTLE
   ══════════════════════════════════════════════════════ */
function BossBattleMission({ scene, childLevel, bossHP, bossMaxHP, onComplete, onBossHPChange, isHe, speak }) {
  const grammar = useMemo(() => {
    const lvl = QUEST_GRAMMAR[childLevel] || QUEST_GRAMMAR[1];
    return shuffle(lvl).slice(0, 4);
  }, [childLevel]);

  const TOTAL_ROUNDS = 4;
  const [round, setRound] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [bossAnim, setBossAnim] = useState('');
  const [attackAnim, setAttackAnim] = useState(false);

  const current = grammar[round] || grammar[0];

  const handleAnswer = (answer, idx) => {
    if (selected !== null) return;
    setSelected(idx);
    playTap();

    if (answer === current.blank) {
      setIsCorrect(true);
      setAttackAnim(true);
      playStar();
      const dmg = bossMaxHP / TOTAL_ROUNDS;
      onBossHPChange(Math.max(0, bossHP - dmg));
      setXpEarned(x => x + 15);
      setBossAnim('animate-shake');

      setTimeout(() => {
        setAttackAnim(false);
        setBossAnim('');
        const nextRound = round + 1;
        if (nextRound >= TOTAL_ROUNDS) {
          playComplete();
          onComplete(xpEarned + 15);
        } else {
          setRound(nextRound);
          setSelected(null);
          setIsCorrect(null);
        }
      }, 1500);
    } else {
      setIsCorrect(false);
      playWrong();
      onBossHPChange(Math.min(bossMaxHP, bossHP + 5));
      setBossAnim('scale-110 animate-shake');

      setTimeout(() => {
        setBossAnim('');
        setSelected(null);
        setIsCorrect(null);
      }, 1200);
    }
  };

  // Display sentence with blank
  const parts = current.sentence.split('___');

  return (
    <div className={`min-h-screen bg-gradient-to-b ${scene.bg} pt-2 pb-6 px-4`}>
      {/* Boss */}
      <div className="text-center mb-4">
        <div className={`text-8xl inline-block transition-all duration-500 ${bossAnim}`}>
          {scene.boss}
        </div>
        {attackAnim && (
          <div className="absolute left-1/2 top-1/3 -translate-x-1/2 text-5xl animate-pop-in">
            ⚔️
          </div>
        )}
      </div>

      <BossHPBar hp={bossHP} maxHP={bossMaxHP} bossEmoji={scene.boss} bossName={isHe ? scene.bossNameHe : scene.bossNameEn} isHe={isHe} />

      {/* Round */}
      <div className="flex justify-between items-center my-3">
        <span className="text-white/70 text-sm font-bold">
          {isHe ? `התקפה ${round + 1}/${TOTAL_ROUNDS}` : `Attack ${round + 1}/${TOTAL_ROUNDS}`}
        </span>
        <span className="text-yellow-300 text-sm font-bold">⚡ {xpEarned} XP</span>
      </div>

      {/* Sentence with blank */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4">
        <p className="text-white/60 text-xs mb-2" dir="rtl">{current.translationHe}</p>
        <p className="text-white font-bold text-xl text-center">
          {parts[0]}
          <span className="inline-block px-3 py-1 mx-1 rounded-lg bg-yellow-400/30 border-2 border-dashed border-yellow-400 min-w-[60px]">
            {isCorrect === true ? current.blank : isCorrect === false && selected !== null ? '✗' : '?'}
          </span>
          {parts[1] || ''}
        </p>
      </div>

      {/* Answer options */}
      <div className="space-y-2">
        {current.options.map((opt, i) => {
          let bg = 'bg-white/15';
          if (selected === i) {
            bg = isCorrect ? 'bg-green-500/50 ring-2 ring-green-400' : 'bg-red-500/40 ring-2 ring-red-400';
          }
          return (
            <button
              key={`${round}-${i}`}
              onClick={() => handleAnswer(opt, i)}
              className={`${bg} w-full py-3 px-4 rounded-xl text-white font-bold text-lg text-center transition-all active:scale-95`}
              disabled={selected !== null && isCorrect}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   STAGE 3: SPEECH MISSION
   ══════════════════════════════════════════════════════ */
function SpeechMission({ scene, childLevel, onComplete, isHe, speak: speakFn }) {
  const sentences = useMemo(() => {
    const lvl = SENTENCES_BY_LEVEL[childLevel] || SENTENCES_BY_LEVEL[1];
    return shuffle(lvl).slice(0, 3);
  }, [childLevel]);

  const { transcript, isListening, startListening, stopListening, sttSupported: supported } = useSpeechRecognition();

  // Stop mic on unmount or when leaving this mission
  useEffect(() => {
    return () => stopListening();
  }, [stopListening]);

  const TOTAL_ROUNDS = 3;
  const [round, setRound] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [result, setResult] = useState(null); // 'correct' | 'wrong' | null
  const [matchedWords, setMatchedWords] = useState([]);
  const [typeFallback, setTypeFallback] = useState(!supported);
  const [typedText, setTypedText] = useState('');
  const prevTranscript = useRef('');

  const current = sentences[round] || sentences[0];

  // Compare transcript when speech ends
  useEffect(() => {
    if (!isListening && transcript && transcript !== prevTranscript.current) {
      prevTranscript.current = transcript;
      checkMatch(transcript);
    }
  }, [isListening, transcript]);

  const checkMatch = (spoken) => {
    const targetWords = current.sentence.toLowerCase().split(/\s+/);
    const spokenWords = spoken.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);

    const matched = [];
    targetWords.forEach((tw, i) => {
      if (spokenWords.some(sw => sw === tw || (tw.length > 3 && sw.includes(tw)))) {
        matched.push(i);
      }
    });

    setMatchedWords(matched);
    const matchPct = matched.length / targetWords.length;

    if (matchPct >= 0.7) {
      setResult('correct');
      playCorrect();
      stopListening();
      const xp = 15;
      setXpEarned(x => x + xp);

      setTimeout(() => {
        const nextRound = round + 1;
        if (nextRound >= TOTAL_ROUNDS) {
          stopListening();
          onComplete(xpEarned + xp);
        } else {
          setRound(nextRound);
          setResult(null);
          setMatchedWords([]);
          setTypedText('');
          prevTranscript.current = '';
        }
      }, 1500);
    } else {
      setResult('wrong');
      playWrong();
      setTimeout(() => {
        setResult(null);
        setMatchedWords([]);
      }, 1500);
    }
  };

  const handleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      setResult(null);
      setMatchedWords([]);
      startListening({ lang: 'en-US' });
    }
  };

  const handleTypeSubmit = () => {
    if (typedText.trim()) {
      checkMatch(typedText.trim());
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${scene.bg} pt-2 pb-6 px-4`}>
      {/* Round */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-white/70 text-sm font-bold">
          {isHe ? `סיבוב ${round + 1}/${TOTAL_ROUNDS}` : `Round ${round + 1}/${TOTAL_ROUNDS}`}
        </span>
        <span className="text-yellow-300 text-sm font-bold">⚡ {xpEarned} XP</span>
      </div>

      {/* Instruction */}
      <div className="text-center mb-6">
        <p className="text-white/70 text-sm mb-2">
          {isHe ? '!אמרו את המשפט' : 'Say the phrase!'}
        </p>

        {/* Target phrase */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 mb-4">
          <div className="text-4xl mb-3">{current.emoji}</div>
          <p className="text-white font-black text-2xl mb-1 leading-relaxed">
            {current.sentence.split(' ').map((word, i) => (
              <span
                key={i}
                className={matchedWords.includes(i) ? 'text-green-400' : ''}
              >
                {word}{' '}
              </span>
            ))}
          </p>
          <p className="text-white/50 text-sm" dir="rtl">{current.translationHe}</p>
          <button
            onClick={() => speakFn(current.sentence, { lang: 'en-US', rate: 0.8 })}
            className="mt-3 p-2.5 rounded-full bg-white/20 active:scale-90 transition-transform inline-flex"
          >
            <Volume2 size={20} className="text-white" />
          </button>
        </div>

        {/* Result feedback */}
        {result && (
          <div className={`text-xl font-black mb-3 animate-pop-in ${result === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
            {result === 'correct'
              ? (isHe ? '!מדהים! נכון' : 'Amazing! Correct!')
              : (isHe ? 'נסו שוב...' : 'Try again...')}
          </div>
        )}

        {/* Mic button or type fallback */}
        {typeFallback ? (
          <div className="space-y-3">
            <input
              type="text"
              value={typedText}
              onChange={e => setTypedText(e.target.value)}
              placeholder={isHe ? 'הקלד את המשפט...' : 'Type the phrase...'}
              className="w-full py-3 px-4 rounded-xl bg-white/15 text-white placeholder-white/40 text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              dir="ltr"
              onKeyDown={e => e.key === 'Enter' && handleTypeSubmit()}
            />
            <button
              onClick={handleTypeSubmit}
              className="w-full py-3 rounded-xl bg-yellow-400/30 text-yellow-300 font-bold active:scale-95 transition-transform"
            >
              {isHe ? 'בדוק' : 'Check'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleMic}
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-all active:scale-90 ${
              isListening
                ? 'bg-red-500 ring-4 ring-red-400/50 animate-pulse'
                : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            {isListening ? <MicOff size={32} className="text-white" /> : <Mic size={32} className="text-white" />}
          </button>
        )}

        {isListening && (
          <p className="text-white/60 text-sm mt-3 animate-pulse">
            {isHe ? '...מקשיב' : 'Listening...'}
          </p>
        )}

        {!typeFallback && supported && (
          <button
            onClick={() => setTypeFallback(true)}
            className="mt-4 text-white/40 text-xs underline"
          >
            {isHe ? 'העדף הקלדה' : 'Prefer typing'}
          </button>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   QUEST COMPLETE SCREEN
   ══════════════════════════════════════════════════════ */
function QuestCompleteScreen({ scene, totalXp, coinsEarned, questLevel, onContinue, isHe }) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    playComplete();
    const t = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`min-h-screen bg-gradient-to-b ${scene.bg} flex items-center justify-center p-6 relative`}>
      <ConfettiBurst show={showConfetti} />

      <div className="text-center space-y-5 animate-pop-in relative z-10 max-w-sm w-full">
        {/* Boss defeated */}
        <div className="relative inline-block">
          <div className="text-7xl opacity-50 grayscale">{scene.boss}</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl">💥</span>
          </div>
        </div>

        <h1 className="text-white font-black text-3xl">
          {isHe ? '!המשימה הושלמה' : 'Quest Complete!'}
        </h1>

        <p className="text-white/70 text-sm">
          {isHe ? `הביסת את ה${scene.bossNameHe}!` : `You defeated the ${scene.bossNameEn}!`}
        </p>

        {/* Rewards */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 space-y-3">
          <h3 className="text-yellow-300 font-black text-lg">
            {isHe ? 'פרסים' : 'Rewards'}
          </h3>
          <div className="flex justify-center gap-6">
            <div className="text-center">
              <div className="text-3xl mb-1">⚡</div>
              <span className="text-white font-black text-xl">{totalXp}</span>
              <p className="text-white/60 text-xs">XP</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-1">🪙</div>
              <span className="text-white font-black text-xl">{coinsEarned}</span>
              <p className="text-white/60 text-xs">{isHe ? 'מטבעות' : 'Coins'}</p>
            </div>
          </div>
        </div>

        {/* English power meter */}
        <div className="bg-white/10 rounded-2xl p-3">
          <p className="text-white/70 text-xs font-bold mb-1.5">
            {isHe ? 'כוח אנגלית' : 'English Power'}
          </p>
          <div className="h-3 rounded-full bg-black/30 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-1000"
              style={{ width: `${Math.min(100, questLevel * 15)}%` }}
            />
          </div>
          <p className="text-yellow-300 text-xs font-bold mt-1">
            {isHe ? `רמת גיבור ${questLevel}` : `Hero Level ${questLevel}`}
          </p>
        </div>

        <button
          onClick={onContinue}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 text-white font-black text-xl shadow-xl active:scale-95 transition-transform"
        >
          {isHe ? '!המשך' : 'Continue!'}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   HERO CUSTOMIZER
   ══════════════════════════════════════════════════════ */
function HeroCustomizer({ hero, questCoins, onBuy, onBack, isHe }) {
  const [tab, setTab] = useState('heroes'); // heroes | outfits | pets
  const heroIdx = hero?.character || 0;
  const outfitEmoji = OUTFITS[hero?.outfit || 0];
  const petEmoji = hero?.pet != null ? PETS[hero.pet] : null;

  const unlockedOutfits = hero?.unlockedOutfits || [0];
  const unlockedPets = hero?.unlockedPets || [];

  const renderItems = () => {
    if (tab === 'heroes') {
      return HEROES.map((h, i) => {
        const isCurrent = (hero?.character || 0) === i;
        // First 2 heroes free (Speakli + wizard), rest cost 20 coins each
        const cost = i < 2 ? 0 : 20;
        const unlocked = i < 2 || (hero?.unlockedHeroes || [0, 1]).includes(i);
        return (
          <button
            key={i}
            onClick={() => {
              if (unlocked) {
                onBuy('selectHero', i, 0);
              } else if (questCoins >= cost) {
                onBuy('buyHero', i, cost);
              }
            }}
            className={`rounded-2xl p-3 flex flex-col items-center gap-1 transition-all active:scale-90 ${
              isCurrent ? 'bg-yellow-400/30 ring-2 ring-yellow-400' : unlocked ? 'bg-white/15' : 'bg-white/5 opacity-60'
            }`}
          >
            <HeroDisplay heroIdx={i} size="text-4xl" imgClass="w-12 h-12" />
            {!unlocked && <span className="text-xs text-yellow-300">🪙 {cost}</span>}
            {isCurrent && <span className="text-xs text-green-400 font-bold">✓</span>}
          </button>
        );
      });
    }

    if (tab === 'outfits') {
      return OUTFITS.map((o, i) => {
        const isCurrent = (hero?.outfit || 0) === i;
        const unlocked = unlockedOutfits.includes(i) || i === 0;
        return (
          <button
            key={i}
            onClick={() => {
              if (unlocked) {
                onBuy('selectOutfit', i, 0);
              } else if (questCoins >= OUTFIT_COST) {
                onBuy('buyOutfit', i, OUTFIT_COST);
              }
            }}
            className={`rounded-2xl p-3 flex flex-col items-center gap-1 transition-all active:scale-90 ${
              isCurrent ? 'bg-yellow-400/30 ring-2 ring-yellow-400' : unlocked ? 'bg-white/15' : 'bg-white/5 opacity-60'
            }`}
          >
            <span className="text-4xl">{o}</span>
            {!unlocked && <span className="text-xs text-yellow-300">🪙 {OUTFIT_COST}</span>}
            {isCurrent && <span className="text-xs text-green-400 font-bold">✓</span>}
          </button>
        );
      });
    }

    // Pets
    return PETS.map((p, i) => {
      const isCurrent = hero?.pet === i;
      const unlocked = unlockedPets.includes(i);
      return (
        <button
          key={i}
          onClick={() => {
            if (unlocked) {
              onBuy('selectPet', i, 0);
            } else if (questCoins >= PET_COST) {
              onBuy('buyPet', i, PET_COST);
            }
          }}
          className={`rounded-2xl p-3 flex flex-col items-center gap-1 transition-all active:scale-90 ${
            isCurrent ? 'bg-yellow-400/30 ring-2 ring-yellow-400' : unlocked ? 'bg-white/15' : 'bg-white/5 opacity-60'
          }`}
        >
          <span className="text-4xl">{p}</span>
          {!unlocked && <span className="text-xs text-yellow-300">🪙 {PET_COST}</span>}
          {isCurrent && <span className="text-xs text-green-400 font-bold">✓</span>}
        </button>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-800 to-purple-900 pt-2 pb-6 px-4">
      {/* Back */}
      <button onClick={onBack} className="p-2 rounded-full bg-white/20 active:scale-90 transition-transform mb-4">
        <ArrowLeft size={20} className="text-white" />
      </button>

      {/* Hero preview */}
      <div className="text-center mb-6">
        <div className="relative inline-block">
          <HeroDisplay heroIdx={heroIdx} />
          <div className="absolute -top-1 -right-2 text-3xl">{outfitEmoji}</div>
          {petEmoji && <div className="absolute -bottom-1 -left-2 text-3xl animate-wiggle">{petEmoji}</div>}
        </div>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="text-2xl">🪙</span>
          <span className="text-white font-black text-xl">{questCoins}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'heroes', label: isHe ? 'גיבורים' : 'Heroes', emoji: '🦸' },
          { key: 'outfits', label: isHe ? 'ציוד' : 'Outfits', emoji: '⚔️' },
          { key: 'pets', label: isHe ? 'חיות' : 'Pets', emoji: '🐉' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${
              tab === t.key ? 'bg-yellow-400/30 text-yellow-300' : 'bg-white/10 text-white/60'
            }`}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-3 gap-3">
        {renderItems()}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN ORCHESTRATOR — EnglishQuestPage
   ══════════════════════════════════════════════════════════ */
export default function EnglishQuestPage({ onBack }) {
  const { uiLang } = useTheme();
  const { progress, updateProgress, addXP } = useUserProgress();
  const { speak, speakSequence } = useSpeech();
  const isHe = uiLang === 'he';

  const childLevel = progress.curriculumLevel || progress.childLevel || 1;
  const questsCompleted = progress.questsCompleted || 0;
  const questCoins = progress.questCoins || 0;
  const questLevel = progress.questLevel || 1;
  const questHero = progress.questHero || { character: 0, outfit: 0, pet: null, unlockedHeroes: [0, 1], unlockedOutfits: [0], unlockedPets: [] };

  const scene = QUEST_SCENES[questsCompleted % QUEST_SCENES.length];

  const [phase, setPhase] = useState('intro'); // intro | transition | mission | complete | hero
  const [missionIndex, setMissionIndex] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [bossHP, setBossHP] = useState(100);
  const BOSS_MAX_HP = 100;

  // Stop audio on unmount
  useEffect(() => {
    return () => stopAllAudio();
  }, []);

  const startQuest = () => {
    playTap();
    setMissionIndex(0);
    setTotalXp(0);
    setBossHP(BOSS_MAX_HP);
    setPhase('transition');
  };

  const handleTransitionReady = useCallback(() => {
    setPhase('mission');
  }, []);

  const handleMissionComplete = useCallback((xp, correctCount) => {
    const newTotalXp = totalXp + xp;
    setTotalXp(newTotalXp);

    const nextMission = missionIndex + 1;
    if (nextMission >= 3) {
      // All missions done → quest complete
      const coinsEarned = Math.floor(newTotalXp / 5);
      const newQuestsCompleted = questsCompleted + 1;
      const newQuestLevel = Math.floor(newQuestsCompleted / 3) + 1;

      // Save progress
      addXP(newTotalXp, 'english-quest');
      updateProgress({
        questCoins: questCoins + coinsEarned,
        questsCompleted: newQuestsCompleted,
        questLevel: newQuestLevel,
        questHero: questHero,
      });

      setPhase('complete');
    } else {
      setMissionIndex(nextMission);
      setPhase('transition');
    }
  }, [missionIndex, totalXp, questsCompleted, questCoins, questHero, addXP, updateProgress]);

  const handleHeroBuy = useCallback((action, index, cost) => {
    const newHero = { ...questHero };
    let newCoins = questCoins;

    switch (action) {
      case 'selectHero':
        newHero.character = index;
        break;
      case 'buyHero':
        newCoins -= cost;
        newHero.unlockedHeroes = [...(newHero.unlockedHeroes || [0, 1]), index];
        newHero.character = index;
        break;
      case 'selectOutfit':
        newHero.outfit = index;
        break;
      case 'buyOutfit':
        newCoins -= cost;
        newHero.unlockedOutfits = [...(newHero.unlockedOutfits || [0]), index];
        newHero.outfit = index;
        break;
      case 'selectPet':
        newHero.pet = index;
        break;
      case 'buyPet':
        newCoins -= cost;
        newHero.unlockedPets = [...(newHero.unlockedPets || []), index];
        newHero.pet = index;
        break;
    }

    playTap();
    updateProgress({ questHero: newHero, questCoins: newCoins });
  }, [questHero, questCoins, updateProgress]);

  // Use same formula as handleMissionComplete for consistency
  const coinsEarned = Math.floor(totalXp / 5);

  const renderContent = () => {
    switch (phase) {
      case 'intro':
        return (
          <QuestIntro
            scene={scene}
            hero={questHero}
            questCoins={questCoins}
            questLevel={questLevel}
            onStart={startQuest}
            onHero={() => { playTap(); setPhase('hero'); }}
            isHe={isHe}
          />
        );

      case 'transition':
        return (
          <MissionTransition
            missionIndex={missionIndex}
            scene={scene}
            isHe={isHe}
            onReady={handleTransitionReady}
          />
        );

      case 'mission':
        return (
          <>
            <QuestHeader
              scene={scene}
              onBack={onBack}
              missionIndex={missionIndex}
              isHe={isHe}
            />
            {missionIndex === 0 && (
              <VocabularyHuntMission
                scene={scene}
                childLevel={childLevel}
                onComplete={handleMissionComplete}
                isHe={isHe}
                speak={speak}
                speakSequence={speakSequence}
              />
            )}
            {missionIndex === 1 && (
              <BossBattleMission
                scene={scene}
                childLevel={childLevel}
                bossHP={bossHP}
                bossMaxHP={BOSS_MAX_HP}
                onComplete={handleMissionComplete}
                onBossHPChange={setBossHP}
                isHe={isHe}
                speak={speak}
              />
            )}
            {missionIndex === 2 && (
              <SpeechMission
                scene={scene}
                childLevel={childLevel}
                onComplete={handleMissionComplete}
                isHe={isHe}
                speak={speak}
              />
            )}
          </>
        );

      case 'complete':
        return (
          <QuestCompleteScreen
            scene={scene}
            totalXp={totalXp}
            coinsEarned={coinsEarned}
            questLevel={Math.floor((questsCompleted + 1) / 3) + 1}
            onContinue={onBack}
            isHe={isHe}
          />
        );

      case 'hero':
        return (
          <HeroCustomizer
            hero={questHero}
            questCoins={questCoins}
            onBuy={handleHeroBuy}
            onBack={() => setPhase('intro')}
            isHe={isHe}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <KidsIntro
        id="english-quest-v3"
        name={progress.displayName}
        emoji="⚔️"
        title="Speakli's Quest!"
        titleHe="המשימה של ספיקלי!"
        desc="Join Speakli on an adventure! Defeat monsters using your English skills!"
        descHe="הצטרפו לספיקלי להרפתקה! הביסו מפלצות עם כישורי האנגלית שלכם!"
        uiLang={uiLang}
        gradient="from-blue-500 via-sky-500 to-cyan-500"
        buttonLabel="Let's go with Speakli!"
        buttonLabelHe="יאללה עם ספיקלי!"
      />

      {phase === 'intro' && (
        <button
          onClick={onBack}
          className="fixed top-4 left-4 z-40 p-2 rounded-full bg-black/30 backdrop-blur-sm active:scale-90 transition-transform"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
      )}

      {renderContent()}
    </div>
  );
}
