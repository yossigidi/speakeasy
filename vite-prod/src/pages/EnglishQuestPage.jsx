import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ArrowLeft, Mic, MicOff, Volume2, Shield, Sword, Heart, Coins } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useUserProgress } from '../contexts/UserProgressContext.jsx';
import { useSpeech } from '../contexts/SpeechContext.jsx';
import useSpeechRecognition from '../hooks/useSpeechRecognition.js';
import { playSequence, stopAllAudio } from '../utils/hebrewAudio.js';
import { playCorrect, playWrong, playComplete, playStar, playTap } from '../utils/gameSounds.js';
import { WORDS_BY_LEVEL, SENTENCES_BY_LEVEL, getWordsForLevel, QUEST_GRAMMAR, QUEST_LEVEL_THEMES, QUEST_DIFFICULTY } from '../data/kids-vocabulary.js';
import KidsIntro from '../components/kids/KidsIntro.jsx';
import { t, tReplace, RTL_LANGS, lf } from '../utils/translations.js';
import { Lock } from 'lucide-react';
import useContentGate from '../hooks/useContentGate.js';
import PaywallModal from '../components/subscription/PaywallModal.jsx';

/* ─── Constants ─── */

const QUEST_SCENES = [
  { id: 'forest', emoji: '🌲', nameKey: 'questSceneForest', bg: 'from-green-600 to-emerald-800', boss: '🐲', bossNameKey: 'questBossForest', bgImage: '/images/adventure/backgrounds/forest-sky.jpg', bgVideo: '/videos/quest/forest.mp4', bossImage: '/images/adventure/characters/dragon-drago.jpg', icon: '/images/adventure/objects/world-icon-forest.jpg' },
  { id: 'school', emoji: '🏫', nameKey: 'questSceneSchool', bg: 'from-purple-600 to-indigo-800', boss: '👻', bossNameKey: 'questBossSchool', bgImage: '/images/adventure/backgrounds/castle-scene3-library.jpg', bgVideo: '/videos/quest/school.mp4', bossImage: '/images/adventure/characters/owl-oliver.jpg', icon: '/images/adventure/objects/world-icon-castle.jpg' },
  { id: 'space', emoji: '🚀', nameKey: 'questSceneSpace', bg: 'from-blue-800 to-slate-900', boss: '👾', bossNameKey: 'questBossSpace', bgImage: '/images/adventure/backgrounds/space-scene5-nebula.jpg', bgVideo: '/videos/quest/space.mp4', bossImage: '/images/adventure/characters/alien-luna.jpg', icon: '/images/adventure/objects/world-icon-space.jpg' },
  { id: 'ocean', emoji: '🌊', nameKey: 'questSceneOcean', bg: 'from-cyan-600 to-blue-900', boss: '🐙', bossNameKey: 'questBossOcean', bgImage: '/images/adventure/backgrounds/ocean-scene1-reef.jpg', bgVideo: '/videos/quest/ocean.mp4', bossImage: '/images/adventure/characters/octopus-oscar.jpg', icon: '/images/adventure/objects/world-icon-ocean.jpg' },
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
        src="/images/speakli-avatar.webp"
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

const MISSION_NAME_KEYS = ['questMissionVocab', 'questMissionBoss', 'questMissionSpeech'];
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

/* ─── Video background for quest scenes ─── */
function SceneBgVideo({ src }) {
  if (!src) return null;
  return (
    <video
      autoPlay muted loop playsInline
      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      style={{ zIndex: 0 }}
      src={src}
      onError={(e) => { e.target.style.display = 'none'; }}
    />
  );
}

/* ─── Boss HP Bar ─── */
function BossHPBar({ hp, maxHP, bossEmoji, bossImage, bossName }) {
  const pct = Math.max(0, (hp / maxHP) * 100);
  const barColor = pct > 50 ? 'bg-red-500' : pct > 25 ? 'bg-orange-500' : 'bg-yellow-500';
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      {bossImage ? (
        <div className="w-9 h-9 rounded-lg overflow-hidden bg-gradient-to-br from-red-500/30 to-purple-600/30 ring-1 ring-white/20 flex-shrink-0">
          <img src={bossImage} alt="" className="w-full h-full object-cover" onError={e => { e.target.parentElement.style.display = 'none'; }} />
        </div>
      ) : (
        <span className="text-3xl">{bossEmoji}</span>
      )}
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
function QuestHeader({ scene, onBack, missionIndex, uiLang }) {
  return (
    <div className={`sticky top-0 z-30 bg-gradient-to-r ${scene.bg} shadow-lg`} style={scene.bgImage ? { backgroundImage: `url(${scene.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center top' } : undefined}>
      <div className="flex items-center justify-between px-3 py-2">
        <button onClick={onBack} className="p-2 rounded-full bg-white/20 active:scale-90 transition-transform">
          <ArrowLeft size={20} className="text-white rtl:rotate-180" />
        </button>
        <div className="text-center">
          <span className="text-white font-black text-sm">
            {t(scene.nameKey, uiLang)}
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
function QuestIntro({ scene, hero, questCoins, questLevel, onStart, onHero, uiLang, speak }) {
  const heroIdx = hero?.character || 0;
  const outfitEmoji = OUTFITS[hero?.outfit || 0];
  const petEmoji = hero?.pet != null ? PETS[hero.pet] : null;
  const guidePlayed = useRef(false);

  // Teacher guidance TTS on mount — use speak() directly for reliable iOS playback
  useEffect(() => {
    if (guidePlayed.current) return;
    guidePlayed.current = true;
    const TTS_LANG = { he: 'he-IL', ar: 'ar-SA', ru: 'ru-RU' };
    const timer = setTimeout(() => {
      const text = t('questGuideWelcome', uiLang);
      if (text && speak) {
        speak(text, { lang: TTS_LANG[uiLang] || 'en-US', rate: 0.9 });
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [uiLang, speak]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 pb-6 overflow-auto">
      {/* Header area with hero */}
      <div className="text-center pt-4 pb-2">
        <div className="relative inline-block">
          <div className="animate-jelly"><HeroDisplay heroIdx={heroIdx} imgClass="w-20 h-20" /></div>
          <div className="absolute -top-1 -right-2 text-2xl">{outfitEmoji}</div>
          {petEmoji && <div className="absolute -bottom-1 -left-2 text-2xl animate-wiggle">{petEmoji}</div>}
        </div>
        <div className="flex items-center justify-center gap-3 mt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40">
            <Shield size={14} className="text-blue-500" />
            <span className="text-blue-700 dark:text-blue-300 font-bold text-xs">
              {tReplace('questHeroLevel', uiLang, { level: questLevel })}
            </span>
          </div>
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/40">
            <span className="text-sm">🪙</span>
            <span className="text-yellow-700 dark:text-yellow-300 font-bold text-xs">{questCoins}</span>
          </div>
        </div>
      </div>

      {/* Scene card — TalkingWorld style */}
      <div className="px-4 max-w-lg mx-auto">
        <div
          className="w-full rounded-3xl p-5 relative overflow-hidden"
          style={{ background: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6)), url(${scene.bgImage}) center/cover` }}
        >
          {/* Scene icon badge */}
          {scene.icon && (
            <img
              src={scene.icon}
              alt=""
              className="absolute top-3 right-3 w-14 h-14 rounded-full object-cover border-2 border-white/40 shadow-lg"
            />
          )}

          <div className="relative z-10 mt-10">
            <h2 className="text-white font-black text-2xl">
              {t(scene.nameKey, uiLang)}
            </h2>
            <p className="text-white/70 text-sm font-medium mt-1">
              {tReplace('questDefeatBoss', uiLang, { boss: t(scene.bossNameKey, uiLang) })}
            </p>

            {/* Boss + mission preview as avatar row */}
            <div className="flex items-center gap-2 mt-3">
              {scene.bossImage && (
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-red-300 shadow-md flex-shrink-0">
                  <img src={scene.bossImage} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              {MISSION_EMOJIS.map((e, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm border border-white/30">
                  {e}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mission types */}
        <div className="flex justify-center gap-2 mt-4">
          {MISSION_EMOJIS.map((e, i) => (
            <div key={i} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold">
              <span>{e}</span>
              <span>{t(MISSION_NAME_KEYS[i], uiLang)}</span>
            </div>
          ))}
        </div>

        {/* Start button */}
        <button
          onClick={onStart}
          className="w-full mt-5 py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black text-xl shadow-xl active:scale-95 transition-transform"
        >
          {t('questStart', uiLang)}
        </button>

        {/* Hero button */}
        <button
          onClick={onHero}
          className="w-full mt-3 py-3 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-sm active:scale-95 transition-transform"
        >
          {t('questCustomizeHero', uiLang)}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MISSION TRANSITION — Between stages
   ══════════════════════════════════════════════════════ */
function MissionTransition({ missionIndex, scene, uiLang, onReady, speak }) {
  const MISSION_GUIDE_KEYS = ['questGuideMission1', 'questGuideMission2', 'questGuideMission3'];

  useEffect(() => {
    // Play mission guidance TTS
    playSequence([
      { text: t(MISSION_GUIDE_KEYS[missionIndex], uiLang), lang: uiLang, rate: 0.9 },
    ], speak);

    const tid = setTimeout(onReady, 3500); // Extended from 2500 to allow TTS to finish
    return () => clearTimeout(tid);
  }, [onReady, missionIndex, uiLang, speak]);

  return (
    <div className={`min-h-screen bg-gradient-to-b ${scene.bg} flex items-center justify-center relative overflow-hidden`} style={scene.bgImage ? { backgroundImage: `url(${scene.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
      <SceneBgVideo src={scene.bgVideo} />
      {scene.bgVideo && <div className="absolute inset-0 bg-black/30" style={{ zIndex: 1 }} />}
      <div className="text-center animate-pop-in space-y-4 relative z-10">
        <div className="text-6xl">{MISSION_EMOJIS[missionIndex]}</div>
        <h2 className="text-white font-black text-2xl">
          {tReplace('questMissionNumber', uiLang, { number: missionIndex + 1 })}
        </h2>
        <p className="text-white/80 font-bold text-lg">
          {t(MISSION_NAME_KEYS[missionIndex], uiLang)}
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
function VocabularyHuntMission({ scene, childLevel, difficulty, onComplete, uiLang, speak, speakSequence }) {
  const diff = difficulty || QUEST_DIFFICULTY[childLevel] || QUEST_DIFFICULTY[1];
  const words = useMemo(() => WORDS_BY_LEVEL[childLevel] || WORDS_BY_LEVEL[1], [childLevel]);
  const optionCount = diff.vocabOptions;
  const TOTAL_ROUNDS = diff.vocabRounds;

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [options, setOptions] = useState([]);
  const [target, setTarget] = useState(null);
  const [tapped, setTapped] = useState(null);
  const [correct, setCorrect] = useState(null);
  const [shakeWrong, setShakeWrong] = useState(null);
  const roundInitRef = useRef(false);
  const xpRef = useRef(0);
  const scoreRef = useRef(0);

  const guidePlayed = useRef(false);

  const setupRound = useCallback((r) => {
    const targetWord = words[Math.floor(Math.random() * words.length)];
    const distractors = pickRandom(words, optionCount - 1, [targetWord]);
    const opts = shuffle([targetWord, ...distractors]);
    setTarget(targetWord);
    setOptions(opts);
    setTapped(null);
    setCorrect(null);
    setShakeWrong(null);

    // Opening guidance on first round, then per-round word instruction
    const delay = (!guidePlayed.current && r === 0) ? 1200 : 400;
    if (!guidePlayed.current && r === 0) {
      guidePlayed.current = true;
      setTimeout(() => {
        playSequence([
          { text: t('questGuideVocabStart', uiLang), lang: uiLang, rate: 0.9 },
          { pause: 600 },
          { text: t('questFindThe', uiLang), lang: uiLang, rate: 0.9 },
          { pause: 200 },
          { text: targetWord.word, lang: 'en-US', rate: 0.6 },
          { pause: 400 },
          { text: lf(targetWord, 'translation', uiLang), lang: uiLang, rate: 0.85 },
        ], speak);
      }, 400);
    } else {
      // Regular round voice instruction
      setTimeout(() => {
        playSequence([
          { text: t('questFindThe', uiLang), lang: uiLang, rate: 0.9 },
          { pause: 200 },
          { text: targetWord.word, lang: 'en-US', rate: 0.6 },
          { pause: 400 },
          { text: lf(targetWord, 'translation', uiLang), lang: uiLang, rate: 0.85 },
        ], speak);
      }, 400);
    }
  }, [words, optionCount, uiLang, speak]);

  useEffect(() => {
    if (!roundInitRef.current) {
      roundInitRef.current = true;
      setupRound(0);
    }
  }, [setupRound]);

  const handleTimeout = useCallback(() => {
    if (tapped !== null) return;
    playWrong();
    setShakeWrong(-1); // flash all
    setTimeout(() => {
      setShakeWrong(null);
      const nextRound = round + 1;
      if (nextRound >= TOTAL_ROUNDS) {
        onComplete(xpRef.current, scoreRef.current);
      } else {
        setRound(nextRound);
        setupRound(nextRound);
      }
    }, 1200);
  }, [tapped, round, TOTAL_ROUNDS, onComplete, setupRound]);

  const handleTap = (word, idx) => {
    if (tapped !== null) return;
    setTapped(idx);
    playTap();

    if (word.word === target.word) {
      setCorrect(idx);
      playCorrect();
      const xp = diff.vocabXP;
      scoreRef.current += 1;
      xpRef.current += xp;
      setScore(s => s + 1);
      setXpEarned(x => x + xp);

      setTimeout(() => {
        const nextRound = round + 1;
        if (nextRound >= TOTAL_ROUNDS) {
          onComplete(xpRef.current, scoreRef.current);
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
    <div className={`min-h-screen bg-gradient-to-b ${scene.bg} pt-2 pb-6 px-4 relative overflow-hidden`} style={scene.bgImage ? { backgroundImage: `url(${scene.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
      <SceneBgVideo src={scene.bgVideo} />
      {scene.bgVideo && <div className="absolute inset-0 bg-black/30" style={{ zIndex: 1 }} />}
      {/* Round counter */}
      <div className="flex justify-between items-center mb-4 relative z-10">
        <span className="text-white/70 text-sm font-bold">
          {tReplace('questRoundCounter', uiLang, { current: round + 1, total: TOTAL_ROUNDS })}
        </span>
        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-400/20">
          <span className="text-yellow-300 text-sm font-bold">⚡ {xpEarned} XP</span>
        </div>
      </div>

      {/* Timer for levels 3-4 */}
      {diff.timerEnabled && tapped === null && (
        <CountdownTimer seconds={diff.timerSeconds} onTimeout={handleTimeout} roundKey={round} />
      )}

      {/* Instruction */}
      <div className="text-center mb-6">
        <p className="text-white/70 text-sm font-medium mb-1">
          {t('questFindThe', uiLang)}
        </p>
        <h2 className="text-white font-black text-3xl">{target?.word || ''}</h2>
        <p className="text-white/50 text-xs mt-1" dir={RTL_LANGS.includes(uiLang) ? 'rtl' : 'ltr'}>{lf(target, 'translation', uiLang) || ''}</p>
        <button
          onClick={() => target && playSequence([{ text: target.word, lang: 'en-US', rate: 0.6 }, { pause: 400 }, { text: lf(target, 'translation', uiLang), lang: uiLang, rate: 0.85 }], speak)}
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
function BossBattleMission({ scene, childLevel, difficulty, bossHP, bossMaxHP, onComplete, onBossHPChange, uiLang, speak }) {
  const diff = difficulty || QUEST_DIFFICULTY[childLevel] || QUEST_DIFFICULTY[1];
  const grammar = useMemo(() => {
    const lvl = QUEST_GRAMMAR[childLevel] || QUEST_GRAMMAR[1];
    return shuffle(lvl).slice(0, diff.grammarRounds);
  }, [childLevel, diff.grammarRounds]);

  const TOTAL_ROUNDS = diff.grammarRounds;
  const [round, setRound] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [bossAnim, setBossAnim] = useState('');
  const [attackAnim, setAttackAnim] = useState(false);
  const bossXpRef = useRef(0);
  const guidePlayed = useRef(false);

  // Teacher guidance on mount
  useEffect(() => {
    if (guidePlayed.current) return;
    guidePlayed.current = true;
    const timer = setTimeout(() => {
      playSequence([
        { text: t('questGuideBossStart', uiLang), lang: uiLang, rate: 0.9 },
      ], speak);
    }, 500);
    return () => clearTimeout(timer);
  }, [uiLang, speak]);

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
      bossXpRef.current += diff.grammarXP;
      setXpEarned(x => x + diff.grammarXP);
      setBossAnim('animate-shake');

      setTimeout(() => {
        setAttackAnim(false);
        setBossAnim('');
        const nextRound = round + 1;
        if (nextRound >= TOTAL_ROUNDS) {
          playComplete();
          onComplete(bossXpRef.current);
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
    <div className={`min-h-screen bg-gradient-to-b ${scene.bg} pt-2 pb-6 px-4 relative overflow-hidden`} style={scene.bgImage ? { backgroundImage: `url(${scene.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
      <SceneBgVideo src={scene.bgVideo} />
      {scene.bgVideo && <div className="absolute inset-0 bg-black/30" style={{ zIndex: 1 }} />}
      {/* Boss */}
      <div className="text-center mb-4 relative z-10">
        <div className={`inline-block transition-all duration-500 ${bossAnim}`}>
          {scene.bossImage ? (
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-red-500/30 to-purple-600/30 ring-2 ring-white/20 mx-auto drop-shadow-lg">
              <img src={scene.bossImage} alt={t(scene.bossNameKey, 'en')}
                className="w-full h-full object-cover"
                onError={e => { e.target.parentElement.innerHTML = `<span class="text-8xl flex items-center justify-center h-full">${scene.boss}</span>`; }}
              />
            </div>
          ) : (
            <span className="text-8xl">{scene.boss}</span>
          )}
        </div>
        {attackAnim && (
          <div className="absolute left-1/2 top-1/3 -translate-x-1/2 text-5xl animate-pop-in">
            ⚔️
          </div>
        )}
      </div>

      <BossHPBar hp={bossHP} maxHP={bossMaxHP} bossEmoji={scene.boss} bossImage={scene.bossImage} bossName={t(scene.bossNameKey, uiLang)} />

      {/* Round */}
      <div className="flex justify-between items-center my-3">
        <span className="text-white/70 text-sm font-bold">
          {tReplace('questAttackCounter', uiLang, { current: round + 1, total: TOTAL_ROUNDS })}
        </span>
        <span className="text-yellow-300 text-sm font-bold">⚡ {xpEarned} XP</span>
      </div>

      {/* Sentence with blank */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4">
        <p className="text-white/60 text-xs mb-2" dir={RTL_LANGS.includes(uiLang) ? 'rtl' : 'ltr'}>{lf(current, 'translation', uiLang)}</p>
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
function SpeechMission({ scene, childLevel, difficulty, onComplete, uiLang, speak: speakFn }) {
  const diff = difficulty || QUEST_DIFFICULTY[childLevel] || QUEST_DIFFICULTY[1];
  const sentences = useMemo(() => {
    const lvl = SENTENCES_BY_LEVEL[childLevel] || SENTENCES_BY_LEVEL[1];
    return shuffle(lvl).slice(0, diff.speechRounds);
  }, [childLevel, diff.speechRounds]);

  const { transcript, isListening, startListening, stopListening, sttSupported: supported } = useSpeechRecognition();

  // Stop mic on unmount or when leaving this mission
  useEffect(() => {
    return () => stopListening();
  }, [stopListening]);

  // Teacher guidance on mount
  const guidePlayed = useRef(false);
  useEffect(() => {
    if (guidePlayed.current) return;
    guidePlayed.current = true;
    const timer = setTimeout(() => {
      playSequence([
        { text: t('questGuideSpeechStart', uiLang), lang: uiLang, rate: 0.9 },
      ], speakFn);
    }, 500);
    return () => clearTimeout(timer);
  }, [uiLang, speakFn]);

  const TOTAL_ROUNDS = diff.speechRounds;
  const [round, setRound] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [result, setResult] = useState(null); // 'correct' | 'wrong' | null
  const [matchedWords, setMatchedWords] = useState([]);
  const [typeFallback, setTypeFallback] = useState(!supported);
  const [typedText, setTypedText] = useState('');
  const prevTranscript = useRef('');
  const speechXpRef = useRef(0);

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
      const xp = diff.speechXP;
      speechXpRef.current += xp;
      setXpEarned(x => x + xp);

      setTimeout(() => {
        const nextRound = round + 1;
        if (nextRound >= TOTAL_ROUNDS) {
          stopListening();
          onComplete(speechXpRef.current);
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
    <div className={`min-h-screen bg-gradient-to-b ${scene.bg} pt-2 pb-6 px-4 relative overflow-hidden`} style={scene.bgImage ? { backgroundImage: `url(${scene.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
      <SceneBgVideo src={scene.bgVideo} />
      {scene.bgVideo && <div className="absolute inset-0 bg-black/30" style={{ zIndex: 1 }} />}
      {/* Round */}
      <div className="flex justify-between items-center mb-4 relative z-10">
        <span className="text-white/70 text-sm font-bold">
          {tReplace('questRoundCounter', uiLang, { current: round + 1, total: TOTAL_ROUNDS })}
        </span>
        <span className="text-yellow-300 text-sm font-bold">⚡ {xpEarned} XP</span>
      </div>

      {/* Instruction */}
      <div className="text-center mb-6">
        <p className="text-white/70 text-sm mb-2">
          {t('questSayPhrase', uiLang)}
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
          <p className="text-white/50 text-sm" dir={RTL_LANGS.includes(uiLang) ? 'rtl' : 'ltr'}>{lf(current, 'translation', uiLang)}</p>
          <button
            onClick={() => playSequence([{ text: current.sentence, lang: 'en-US', rate: 0.55 }, { pause: 500 }, { text: lf(current, 'translation', uiLang), lang: uiLang, rate: 0.85 }], speakFn)}
            className="mt-3 p-2.5 rounded-full bg-white/20 active:scale-90 transition-transform inline-flex"
          >
            <Volume2 size={20} className="text-white" />
          </button>
        </div>

        {/* Result feedback */}
        {result && (
          <div className={`text-xl font-black mb-3 animate-pop-in ${result === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
            {result === 'correct'
              ? t('questAmazingCorrect', uiLang)
              : t('questTryAgain', uiLang)}
          </div>
        )}

        {/* Mic button or type fallback */}
        {typeFallback ? (
          <div className="space-y-3">
            <input
              type="text"
              value={typedText}
              onChange={e => setTypedText(e.target.value)}
              placeholder={t('questTypePhrase', uiLang)}
              className="w-full py-3 px-4 rounded-xl bg-white/15 text-white placeholder-white/40 text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              dir="ltr"
              onKeyDown={e => e.key === 'Enter' && handleTypeSubmit()}
            />
            <button
              onClick={handleTypeSubmit}
              className="w-full py-3 rounded-xl bg-yellow-400/30 text-yellow-300 font-bold active:scale-95 transition-transform"
            >
              {t('questCheck', uiLang)}
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
            {t('questListening', uiLang)}
          </p>
        )}

        {!typeFallback && supported && (
          <button
            onClick={() => setTypeFallback(true)}
            className="mt-4 text-white/40 text-xs underline"
          >
            {t('questPreferTyping', uiLang)}
          </button>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   QUEST COMPLETE SCREEN
   ══════════════════════════════════════════════════════ */
function QuestCompleteScreen({ scene, totalXp, coinsEarned, questLevel, onContinue, uiLang, speak }) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    playComplete();
    const tid = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(tid);
  }, []);

  // Teacher congratulations TTS
  useEffect(() => {
    const timer = setTimeout(() => {
      playSequence([
        { text: t('questGuideComplete', uiLang), lang: uiLang, rate: 0.9 },
      ], speak);
    }, 1000);
    return () => clearTimeout(timer);
  }, [uiLang, speak]);

  return (
    <div className={`min-h-screen bg-gradient-to-b ${scene.bg} flex items-center justify-center p-6 relative overflow-hidden`} style={scene.bgImage ? { backgroundImage: `url(${scene.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
      <SceneBgVideo src={scene.bgVideo} />
      {scene.bgVideo && <div className="absolute inset-0 bg-black/30" style={{ zIndex: 1 }} />}
      <ConfettiBurst show={showConfetti} />

      <div className="text-center space-y-5 animate-pop-in relative z-10 max-w-sm w-full">
        {/* Boss defeated */}
        <div className="relative inline-block">
          {scene.bossImage ? (
            <div className="w-20 h-20 rounded-2xl overflow-hidden opacity-50 grayscale mx-auto">
              <img src={scene.bossImage} alt={t(scene.bossNameKey, 'en')} className="w-full h-full object-cover" onError={e => { e.target.parentElement.innerHTML = `<span class="text-7xl flex items-center justify-center h-full">${scene.boss}</span>`; }} />
            </div>
          ) : (
            <div className="text-7xl opacity-50 grayscale">{scene.boss}</div>
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl">💥</span>
          </div>
        </div>

        <h1 className="text-white font-black text-3xl">
          {t('questComplete', uiLang)}
        </h1>

        <p className="text-white/70 text-sm">
          {tReplace('questDefeatedBoss', uiLang, { boss: t(scene.bossNameKey, uiLang) })}
        </p>

        {/* Rewards */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 space-y-3">
          <h3 className="text-yellow-300 font-black text-lg">
            {t('questRewards', uiLang)}
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
              <p className="text-white/60 text-xs">{t('questCoins', uiLang)}</p>
            </div>
          </div>
        </div>

        {/* English power meter */}
        <div className="bg-white/10 rounded-2xl p-3">
          <p className="text-white/70 text-xs font-bold mb-1.5">
            {t('questEnglishPower', uiLang)}
          </p>
          <div className="h-3 rounded-full bg-black/30 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-1000"
              style={{ width: `${Math.min(100, questLevel * 15)}%` }}
            />
          </div>
          <p className="text-yellow-300 text-xs font-bold mt-1">
            {tReplace('questHeroLevelShort', uiLang, { level: questLevel })}
          </p>
        </div>

        <button
          onClick={onContinue}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 text-white font-black text-xl shadow-xl active:scale-95 transition-transform"
        >
          {t('questContinue', uiLang)}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   HERO CUSTOMIZER
   ══════════════════════════════════════════════════════ */
function HeroCustomizer({ hero, questCoins, onBuy, onBack, uiLang }) {
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
        <ArrowLeft size={20} className="text-white rtl:rotate-180" />
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
          { key: 'heroes', label: t('questHeroes', uiLang), emoji: '🦸' },
          { key: 'outfits', label: t('questOutfits', uiLang), emoji: '⚔️' },
          { key: 'pets', label: t('questPets', uiLang), emoji: '🐉' },
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${
              tab === item.key ? 'bg-yellow-400/30 text-yellow-300' : 'bg-white/10 text-white/60'
            }`}
          >
            {item.emoji} {item.label}
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

/* ══════════════════════════════════════════════════════
   QUEST LEVEL SELECTOR
   ══════════════════════════════════════════════════════ */
function QuestLevelSelector({ childLevel, onSelect, onBack, uiLang, speak }) {
  const guidePlayed = useRef(false);
  const langKey = uiLang === 'ar' ? 'nameAr' : uiLang === 'ru' ? 'nameRu' : uiLang === 'he' ? 'nameHe' : 'nameEn';

  useEffect(() => {
    if (guidePlayed.current) return;
    guidePlayed.current = true;
    const timer = setTimeout(() => {
      playSequence([
        { text: t('questGuidePickLevel', uiLang), lang: uiLang, rate: 0.9 },
      ], speak);
    }, 600);
    return () => clearTimeout(timer);
  }, [uiLang, speak]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-800 to-purple-900 flex flex-col items-center p-6">
      <button onClick={onBack} className="self-start p-2 rounded-full bg-white/20 active:scale-90 transition-transform mb-4">
        <ArrowLeft size={20} className="text-white rtl:rotate-180" />
      </button>

      <h2 className="text-white font-black text-2xl mb-1">{t('questPickLevel', uiLang)}</h2>
      <p className="text-white/60 text-sm mb-6">{t('questPickLevelDesc', uiLang)}</p>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {[1, 2, 3, 4].map(level => {
          const theme = QUEST_LEVEL_THEMES[level];
          const unlocked = level <= childLevel;
          return (
            <button
              key={level}
              onClick={() => unlocked && onSelect(level)}
              disabled={!unlocked}
              className={`relative rounded-2xl p-4 flex flex-col items-center gap-2 transition-all active:scale-95 ${
                unlocked
                  ? `bg-gradient-to-br ${theme.color} shadow-lg`
                  : 'bg-white/10 opacity-50'
              }`}
            >
              <span className="text-4xl">{unlocked ? theme.emoji : '🔒'}</span>
              <span className="text-white font-black text-sm">
                {tReplace('questLevelLabel', uiLang, { level })}
              </span>
              <span className="text-white/80 text-xs font-medium">
                {theme[langKey]}
              </span>
              <span className="text-white/60 text-[10px]">
                {unlocked
                  ? tReplace('questAges', uiLang, { ages: theme.ageRange })
                  : t('questLevelLocked', uiLang)}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-white/40 text-xs mt-6 text-center">
        {t('questMoreLevelsUnlock', uiLang)}
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   COUNTDOWN TIMER BAR (for levels 3-4)
   ══════════════════════════════════════════════════════ */
function CountdownTimer({ seconds, onTimeout, roundKey }) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const timerRef = useRef(null);

  useEffect(() => {
    setTimeLeft(seconds);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [seconds, roundKey]);

  const pct = (timeLeft / seconds) * 100;
  const barColor = pct > 50 ? 'bg-green-400' : pct > 25 ? 'bg-yellow-400' : 'bg-red-500 animate-pulse';

  return (
    <div className="px-4 mb-2">
      <div className="h-2 rounded-full bg-black/20 overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-1000 ease-linear`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-white/60 text-xs text-center mt-1">{timeLeft}s</p>
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

  const childLevel = progress.curriculumLevel || progress.childLevel || 1;
  const questsCompleted = progress.questsCompleted || 0;
  const questCoins = progress.questCoins || 0;
  const questLevel = progress.questLevel || 1;
  const questHero = progress.questHero || { character: 0, outfit: 0, pet: null, unlockedHeroes: [0, 1], unlockedOutfits: [0], unlockedPets: [] };

  const sceneIndex = questsCompleted % QUEST_SCENES.length;
  const scene = QUEST_SCENES[sceneIndex];
  const { isLocked: isContentLocked } = useContentGate();
  const questLocked = isContentLocked('questScenes', sceneIndex);
  const [showPaywall, setShowPaywall] = useState(false);

  const [phase, setPhase] = useState('intro'); // intro | level-select | transition | mission | complete | hero
  const [missionIndex, setMissionIndex] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [selectedQuestLevel, setSelectedQuestLevel] = useState(null);

  // Difficulty config based on selected level
  const diff = QUEST_DIFFICULTY[selectedQuestLevel || childLevel] || QUEST_DIFFICULTY[1];
  const [bossHP, setBossHP] = useState(diff.bossHP);
  const BOSS_MAX_HP = diff.bossHP;

  // Stop audio on unmount
  useEffect(() => {
    return () => stopAllAudio();
  }, []);

  const startQuest = () => {
    if (questLocked) { setShowPaywall(true); return; }
    playTap();
    setPhase('level-select');
  };

  const handleLevelSelect = (level) => {
    playTap();
    setSelectedQuestLevel(level);
    const d = QUEST_DIFFICULTY[level] || QUEST_DIFFICULTY[1];
    setMissionIndex(0);
    setTotalXp(0);
    setBossHP(d.bossHP);
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
        // Increment lesson counter for achievements (quests count as lessons)
        totalLessonsCompleted: (progress.totalLessonsCompleted || 0) + 1,
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

  const effectiveLevel = selectedQuestLevel || childLevel;

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
            uiLang={uiLang}
            speak={speak}
          />
        );

      case 'level-select':
        return (
          <QuestLevelSelector
            childLevel={childLevel}
            onSelect={handleLevelSelect}
            onBack={() => setPhase('intro')}
            uiLang={uiLang}
            speak={speak}
          />
        );

      case 'transition':
        return (
          <MissionTransition
            missionIndex={missionIndex}
            scene={scene}
            uiLang={uiLang}
            onReady={handleTransitionReady}
            speak={speak}
          />
        );

      case 'mission':
        return (
          <>
            <QuestHeader
              scene={scene}
              onBack={onBack}
              missionIndex={missionIndex}
              uiLang={uiLang}
            />
            {missionIndex === 0 && (
              <VocabularyHuntMission
                key={`vocab-${effectiveLevel}`}
                scene={scene}
                childLevel={effectiveLevel}
                difficulty={diff}
                onComplete={handleMissionComplete}
                uiLang={uiLang}
                speak={speak}
                speakSequence={speakSequence}
              />
            )}
            {missionIndex === 1 && (
              <BossBattleMission
                key={`boss-${effectiveLevel}`}
                scene={scene}
                childLevel={effectiveLevel}
                difficulty={diff}
                bossHP={bossHP}
                bossMaxHP={BOSS_MAX_HP}
                onComplete={handleMissionComplete}
                onBossHPChange={setBossHP}
                uiLang={uiLang}
                speak={speak}
              />
            )}
            {missionIndex === 2 && (
              <SpeechMission
                key={`speech-${effectiveLevel}`}
                scene={scene}
                childLevel={effectiveLevel}
                difficulty={diff}
                onComplete={handleMissionComplete}
                uiLang={uiLang}
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
            uiLang={uiLang}
            speak={speak}
          />
        );

      case 'hero':
        return (
          <HeroCustomizer
            hero={questHero}
            questCoins={questCoins}
            onBuy={handleHeroBuy}
            onBack={() => setPhase('intro')}
            uiLang={uiLang}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <KidsIntro
        id="english-quest-v3"
        name={progress?.displayName || ''}
        emoji="⚔️"
        title="Speakli's Quest!"
        titleHe="המשימה של ספיקלי!"
        titleAr="مهمة سبيكلي!"
        titleRu="Миссия Спикли!"
        desc="Join Speakli on an adventure! Defeat monsters using your English skills!"
        descHe="הצטרפו לספיקלי להרפתקה! הביסו מפלצות עם כישורי האנגלית שלכם!"
        descAr="انضموا إلى سبيكلي في مغامرة! هزموا الوحوش باستخدام مهاراتكم في الإنجليزية!"
        descRu="Присоединяйтесь к Спикли в приключении! Победите монстров с помощью своих знаний английского!"
        uiLang={uiLang}
        gradient="from-blue-500 via-sky-500 to-cyan-500"
        buttonLabel="Let's go with Speakli!"
        buttonLabelHe="יאללה עם ספיקלי!"
        buttonLabelAr="يالله مع سبيكلي!"
        buttonLabelRu="Вперёд со Спикли!"
      />

      {(phase === 'intro' || phase === 'level-select' || phase === 'transition') && (
        <button
          onClick={onBack}
          className="fixed ltr:left-4 rtl:right-4 z-40 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm active:scale-90 transition-transform shadow-lg"
          style={{ top: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
        >
          <ArrowLeft size={20} className="text-white rtl:rotate-180" />
        </button>
      )}

      {renderContent()}
      {showPaywall && <PaywallModal feature="englishQuest" onClose={() => setShowPaywall(false)} onNavigate={() => {}} />}
    </div>
  );
}
