/**
 * Word Runner Adventure — A Mario-style platformer for learning English.
 *
 * Architecture:
 *  - DOM-based rendering (no Canvas) for consistency with existing games
 *  - requestAnimationFrame game loop for smooth 60fps physics
 *  - Game state stored in refs (mutable, no re-render per frame)
 *  - React state only for UI overlays (HUD, menus, challenges)
 *  - Collision detection: AABB (axis-aligned bounding boxes)
 *  - Auto-scroll + tap-to-jump controls
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ArrowLeft, Volume2, Star, Zap, Heart, Trophy } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { useUserProgress } from '../../contexts/UserProgressContext.jsx';
import { useSpeech } from '../../contexts/SpeechContext.jsx';
import { playSequence, stopAllAudio } from '../../utils/hebrewAudio.js';
import { playCorrect, playWrong, playPop, playComplete, playStar } from '../../utils/gameSounds.js';
import { getWordsForLevel } from '../../data/kids-vocabulary.js';
import { shuffle } from '../../utils/shuffle.js';
import { t, tReplace, lf, RTL_LANGS } from '../../utils/translations.js';
import GameInstructionOverlay from './GameInstructionOverlay.jsx';
import SpeakliAvatar from '../kids/SpeakliAvatar.jsx';

// ═══════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════

const GRAVITY = 0.55;
const JUMP_VEL = -11.5;
const PLAYER_W = 44;
const PLAYER_H = 44;
const TILE = 40; // base tile size
const GROUND_TILES = 2; // ground thickness in tiles
const VIEWPORT_W = 375; // reference width
const VIEWPORT_H = 600; // reference height — game scales to fit

// Speeds scale with viewport
const BASE_SCROLL_SPEED = 1.6;
const ENEMY_SPEED = 0.6;
const COIN_BOB_SPEED = 0.003;
const COIN_BOB_AMP = 4;

// Game balance
const MAX_LIVES = 3;
const INVINCIBLE_MS = 1500;
const POWER_STREAK = 3;
const CHALLENGE_TIME = 12; // seconds

// ═══════════════════════════════════════════
//  WORLD DATA
// ═══════════════════════════════════════════

const WORLDS = [
  {
    id: 'abc-forest',
    nameHe: 'יער ה-ABC',
    nameEn: 'ABC Forest',
    emoji: '🌳',
    bgGradient: 'linear-gradient(180deg, #87CEEB 0%, #98FB98 70%, #228B22 100%)',
    groundColor: '#4a7c2e',
    grassColor: '#66bb6a',
    platformColor: '#8B4513',
    platformTop: '#66bb6a',
    farBg: ['🌲', '🌳', '🌿'],
    categories: ['alphabet'],
    minLevel: 1,
    bossEmoji: '🐻',
    bossName: 'Bear',
  },
  {
    id: 'animal-valley',
    nameHe: 'עמק החיות',
    nameEn: 'Animal Valley',
    emoji: '🦁',
    bgGradient: 'linear-gradient(180deg, #FFD700 0%, #FFA500 30%, #8B4513 100%)',
    groundColor: '#8B6914',
    grassColor: '#DAA520',
    platformColor: '#A0522D',
    platformTop: '#DAA520',
    farBg: ['🌴', '🌵', '🏜️'],
    categories: ['animals'],
    minLevel: 1,
    bossEmoji: '🐉',
    bossName: 'Dragon',
  },
  {
    id: 'color-hills',
    nameHe: 'גבעות הצבעים',
    nameEn: 'Color Hills',
    emoji: '🌈',
    bgGradient: 'linear-gradient(180deg, #E0BBE4 0%, #957DAD 40%, #D291BC 100%)',
    groundColor: '#7B68AE',
    grassColor: '#B39DDB',
    platformColor: '#6A5ACD',
    platformTop: '#CE93D8',
    farBg: ['🌸', '🦋', '✨'],
    categories: ['colors'],
    minLevel: 1,
    bossEmoji: '🧙',
    bossName: 'Wizard',
  },
  {
    id: 'food-city',
    nameHe: 'עיר האוכל',
    nameEn: 'Food City',
    emoji: '🍕',
    bgGradient: 'linear-gradient(180deg, #FFE4B5 0%, #FFA07A 50%, #CD853F 100%)',
    groundColor: '#CD853F',
    grassColor: '#DEB887',
    platformColor: '#D2691E',
    platformTop: '#F4A460',
    farBg: ['🏪', '🏬', '🏠'],
    categories: ['food'],
    minLevel: 2,
    bossEmoji: '🤖',
    bossName: 'Robot Chef',
  },
  {
    id: 'word-island',
    nameHe: 'אי המילים',
    nameEn: 'Word Island',
    emoji: '🏝️',
    bgGradient: 'linear-gradient(180deg, #00CED1 0%, #20B2AA 40%, #2E8B57 100%)',
    groundColor: '#C2B280',
    grassColor: '#F0E68C',
    platformColor: '#8B7355',
    platformTop: '#F0E68C',
    farBg: ['🌊', '🐚', '🏖️'],
    categories: ['sentences'],
    minLevel: 3,
    bossEmoji: '🦈',
    bossName: 'Shark',
  },
];

const LEVELS_PER_WORLD = 6;

// ═══════════════════════════════════════════
//  VOCABULARY HELPERS
// ═══════════════════════════════════════════

const ALPHABET_WORDS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => ({
  word: l, emoji: l, translation: l, lower: l.toLowerCase(),
}));

function getWorldWords(worldId, childLevel) {
  const world = WORLDS.find(w => w.id === worldId);
  if (!world) return [];
  if (world.categories.includes('alphabet')) {
    return ALPHABET_WORDS;
  }
  const lvlWords = getWordsForLevel(childLevel);
  if (world.categories.includes('animals')) {
    const animals = lvlWords.filter(w => ['cat','dog','bird','fish','lion','tiger','bear','frog','duck','rabbit','monkey','elephant','horse','cow','pig','sheep','chicken'].includes(w.word));
    return animals.length >= 6 ? animals : lvlWords.slice(0, 18);
  }
  if (world.categories.includes('colors')) {
    const colors = lvlWords.filter(w => ['red','blue','green','yellow','black','white','pink','orange','purple','brown'].includes(w.word));
    return colors.length >= 6 ? colors : lvlWords.slice(0, 18);
  }
  if (world.categories.includes('food')) {
    const food = lvlWords.filter(w => ['apple','banana','milk','pizza','bread','cake','water','juice','egg','rice','cheese','cookie'].includes(w.word));
    return food.length >= 6 ? food : lvlWords.slice(0, 18);
  }
  return lvlWords.slice(0, 24);
}

// ═══════════════════════════════════════════
//  LEVEL GENERATOR
// ═══════════════════════════════════════════

function generateLevel(worldId, levelIndex, words, difficulty) {
  const isBoss = levelIndex === LEVELS_PER_WORLD - 1;
  const isReview = levelIndex === 3; // level 4 is review

  // Level length grows with difficulty
  const levelLength = 4000 + levelIndex * 600 + difficulty * 200;
  const groundY = VIEWPORT_H - TILE * GROUND_TILES;

  // Words for this level: 2-3 new + review
  const wordsPerLevel = 2 + Math.min(1, Math.floor(levelIndex / 2));
  const startIdx = levelIndex * 2;
  const levelWords = words.slice(startIdx, startIdx + wordsPerLevel);
  // Fill with more words for variety
  const allLevelWords = [...levelWords];
  if (allLevelWords.length < 4) {
    const extras = words.filter(w => !allLevelWords.find(lw => lw.word === w.word));
    allLevelWords.push(...shuffle(extras).slice(0, 4 - allLevelWords.length));
  }

  const platforms = [];
  const coins = [];
  const blocks = [];
  const enemies = [];

  // Generate platforms procedurally
  let x = VIEWPORT_W + 100; // start after first screen
  const gapBase = 120 + difficulty * 10;
  const platWidthBase = TILE * 3;

  let coinIdx = 0;
  let blockIdx = 0;
  let enemyIdx = 0;

  while (x < levelLength - 200) {
    const gap = gapBase + Math.random() * 60;
    x += gap;

    // Platform width: 2-5 tiles
    const tilesWide = 2 + Math.floor(Math.random() * 3) + (difficulty < 2 ? 1 : 0);
    const w = tilesWide * TILE;

    // Platform height: varies
    const heightOptions = [groundY - TILE * 2, groundY - TILE * 3, groundY - TILE * 4];
    const y = heightOptions[Math.floor(Math.random() * Math.min(heightOptions.length, 1 + difficulty))];

    platforms.push({ x, y, w, h: TILE });

    // Place coins on platform
    if (coinIdx < allLevelWords.length * 2) {
      const word = allLevelWords[coinIdx % allLevelWords.length];
      coins.push({
        x: x + w / 2 - 15,
        y: y - TILE - 10,
        word: word.word,
        emoji: word.emoji,
        translation: lf(word, 'translation', 'he') || word.translation || word.word,
        collected: false,
      });
      coinIdx++;
    }

    // Place question block every 3rd platform
    if (blockIdx % 3 === 1 && blockIdx < 4) {
      const qWord = allLevelWords[blockIdx % allLevelWords.length];
      const wrongWords = shuffle(words.filter(w => w.word !== qWord.word)).slice(0, 2);
      blocks.push({
        x: x + TILE,
        y: y - TILE * 2.5,
        w: TILE,
        h: TILE,
        activated: false,
        question: qWord,
        options: shuffle([qWord, ...wrongWords]),
      });
    }
    blockIdx++;

    // Place enemy every 4th platform (after level 1)
    if (enemyIdx % 4 === 2 && levelIndex > 0 && enemyIdx < 3) {
      const eWord = allLevelWords[enemyIdx % allLevelWords.length];
      enemies.push({
        x: x + TILE,
        y: y - PLAYER_H,
        w: PLAYER_W,
        h: PLAYER_H,
        word: eWord,
        alive: true,
        dir: 1,
        moveRange: w - TILE,
        startX: x + TILE,
      });
    }
    enemyIdx++;
  }

  // Ground platforms (continuous with some gaps)
  const groundPlatforms = [];
  let gx = 0;
  while (gx < levelLength) {
    const gw = 200 + Math.random() * 300;
    groundPlatforms.push({ x: gx, y: groundY, w: gw, h: TILE * GROUND_TILES, isGround: true });
    gx += gw;
    // Gap in ground (small, jumpable)
    if (gx > VIEWPORT_W && Math.random() > 0.6 && levelIndex > 0) {
      gx += 60 + Math.random() * 40;
    }
  }

  // Flag at end
  const flag = { x: levelLength - 100, y: groundY - TILE * 5, w: TILE, h: TILE * 5 };

  return {
    length: levelLength,
    groundY,
    platforms: [...groundPlatforms, ...platforms],
    coins,
    blocks,
    enemies,
    flag,
    words: allLevelWords,
    isBoss,
    isReview,
    boss: isBoss ? {
      emoji: WORLDS.find(w => w.id === worldId)?.bossEmoji || '🐉',
      name: WORLDS.find(w => w.id === worldId)?.bossName || 'Boss',
      hp: 3,
      words: shuffle(allLevelWords).slice(0, 3),
    } : null,
  };
}

// ═══════════════════════════════════════════
//  COLLISION HELPERS
// ═══════════════════════════════════════════

function aabb(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function playerBox(p) {
  return { x: p.x, y: p.y, w: PLAYER_W, h: PLAYER_H };
}

// ═══════════════════════════════════════════
//  BACKGROUND COMPONENT (parallax)
// ═══════════════════════════════════════════

function ParallaxBackground({ world, cameraX, viewW, viewH }) {
  const farItems = useMemo(() => {
    const items = [];
    for (let i = 0; i < 12; i++) {
      items.push({
        emoji: world.farBg[i % world.farBg.length],
        x: i * 350 + Math.random() * 100,
        y: viewH * 0.35 + Math.random() * viewH * 0.15,
        scale: 0.8 + Math.random() * 0.6,
      });
    }
    return items;
  }, [world, viewH]);

  const clouds = useMemo(() => {
    const c = [];
    for (let i = 0; i < 8; i++) {
      c.push({
        x: i * 500 + Math.random() * 200,
        y: 20 + Math.random() * 80,
        size: 30 + Math.random() * 40,
        opacity: 0.3 + Math.random() * 0.3,
      });
    }
    return c;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ background: world.bgGradient }}>
      {/* Clouds — slow parallax */}
      {clouds.map((c, i) => (
        <div key={`c${i}`} className="absolute rounded-full" style={{
          left: ((c.x - cameraX * 0.1) % (viewW + 200)) - 100,
          top: c.y,
          width: c.size * 2,
          height: c.size,
          background: `rgba(255,255,255,${c.opacity})`,
          filter: 'blur(4px)',
        }} />
      ))}
      {/* Far background elements */}
      {farItems.map((item, i) => (
        <div key={`f${i}`} className="absolute" style={{
          left: ((item.x - cameraX * 0.3) % (viewW * 3)) - viewW * 0.5,
          top: item.y,
          fontSize: 32 * item.scale,
          opacity: 0.6,
          filter: 'blur(1px)',
        }}>
          {item.emoji}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════
//  FLOATING DECORATIONS (reused from other games)
// ═══════════════════════════════════════════

function FloatingDecorations() {
  const items = useMemo(() => ['⭐','🌈','🎈','🦋','🌸','✨','🎵','💫'].map((e, i) => ({
    emoji: e,
    style: {
      position: 'absolute',
      fontSize: 16 + Math.random() * 12,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      opacity: 0.15,
      animation: `floatEmoji ${6 + Math.random() * 6}s ease-in-out infinite`,
      animationDelay: `${Math.random() * -10}s`,
      pointerEvents: 'none',
    },
  })), []);

  return <>{items.map((item, i) => <span key={i} style={item.style}>{item.emoji}</span>)}</>;
}

function ConfettiBurst({ show }) {
  if (!show) return null;
  const pieces = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    color: ['#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FFEAA7','#DDA0DD','#98D8C8','#F7DC6F'][i % 8],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.5}s`,
    duration: `${1 + Math.random() * 1.5}s`,
  })), []);
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {pieces.map((p, i) => (
        <div key={i} className="absolute animate-confetti-fall" style={{
          left: p.left, top: '-10px', width: 8, height: 8, borderRadius: '50%',
          background: p.color, animationDelay: p.delay, animationDuration: p.duration,
        }} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════
//  WORLD SELECT SCREEN
// ═══════════════════════════════════════════

function WorldSelect({ worlds, progress, onSelect, onBack, uiLang, childLevel }) {
  return (
    <div className="kids-bg min-h-screen relative">
      <FloatingDecorations />
      <div className="relative z-10 px-4 pb-24" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="text-gray-400 bg-white/50 dark:bg-gray-800/50 rounded-full p-3 backdrop-blur-sm min-w-[44px] min-h-[44px] flex items-center justify-center">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-black text-gray-800 dark:text-white flex items-center gap-2">
            🎮 Word Runner
          </h1>
        </div>

        <div className="grid gap-3">
          {worlds.map((world, wi) => {
            const locked = childLevel < world.minLevel;
            const worldProgress = progress?.[world.id] || {};
            const completedLevels = worldProgress.completedLevels || 0;
            const stars = worldProgress.stars || 0;

            return (
              <button
                key={world.id}
                onClick={() => !locked && onSelect(world.id)}
                disabled={locked}
                className={`relative overflow-hidden rounded-2xl p-4 text-left transition-all active:scale-[0.97] ${
                  locked ? 'opacity-50 grayscale' : 'shadow-lg'
                }`}
                style={{ background: world.bgGradient }}
              >
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{locked ? '🔒' : world.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-black text-white drop-shadow-md">
                      {uiLang === 'he' ? world.nameHe : world.nameEn}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex gap-0.5">
                        {[...Array(LEVELS_PER_WORLD)].map((_, i) => (
                          <div key={i} className={`w-2.5 h-2.5 rounded-full ${
                            i < completedLevels ? 'bg-yellow-300' : 'bg-white/30'
                          }`} />
                        ))}
                      </div>
                      {stars > 0 && (
                        <span className="text-xs font-bold text-yellow-200 flex items-center gap-0.5">
                          <Star size={12} className="fill-yellow-200" /> {stars}
                        </span>
                      )}
                    </div>
                  </div>
                  {!locked && (
                    <span className="text-white/80 text-2xl">▶</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
//  LEVEL SELECT SCREEN
// ═══════════════════════════════════════════

function LevelSelect({ world, progress, onSelect, onBack, uiLang }) {
  const worldProgress = progress?.[world.id] || {};
  const completedLevels = worldProgress.completedLevels || 0;

  return (
    <div className="min-h-screen relative" style={{ background: world.bgGradient }}>
      <FloatingDecorations />
      <div className="relative z-10 px-4 pb-24" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack} className="text-white/70 bg-white/20 rounded-full p-3 backdrop-blur-sm min-w-[44px] min-h-[44px] flex items-center justify-center">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-black text-white drop-shadow-md flex items-center gap-2">
            {world.emoji} {uiLang === 'he' ? world.nameHe : world.nameEn}
          </h1>
        </div>

        {/* Level path — vertical */}
        <div className="flex flex-col items-center gap-4">
          {[...Array(LEVELS_PER_WORLD)].map((_, i) => {
            const levelNum = i + 1;
            const isCompleted = i < completedLevels;
            const isNext = i === completedLevels;
            const isLocked = i > completedLevels;
            const isBoss = i === LEVELS_PER_WORLD - 1;
            const levelStars = worldProgress[`level${i}`]?.stars || 0;

            return (
              <button
                key={i}
                onClick={() => !isLocked && onSelect(i)}
                disabled={isLocked}
                className={`relative w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-emerald-400 shadow-lg shadow-emerald-400/30'
                    : isNext
                      ? 'bg-white shadow-xl animate-pulse ring-4 ring-yellow-300'
                      : 'bg-white/20 backdrop-blur-sm'
                } ${isLocked ? 'opacity-40' : 'active:scale-90'}`}
              >
                {isBoss ? (
                  <span className="text-2xl">{isLocked ? '🔒' : world.bossEmoji}</span>
                ) : isLocked ? (
                  <span className="text-xl">🔒</span>
                ) : (
                  <span className={`text-2xl font-black ${isCompleted ? 'text-white' : 'text-gray-700'}`}>
                    {levelNum}
                  </span>
                )}
                {isCompleted && levelStars > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {[...Array(3)].map((_, s) => (
                      <Star key={s} size={10} className={s < levelStars ? 'text-yellow-200 fill-yellow-200' : 'text-white/30'} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
//  WORD CHALLENGE OVERLAY
// ═══════════════════════════════════════════

function WordChallenge({ question, options, onAnswer, uiLang, speak, timeLimit }) {
  const [selected, setSelected] = useState(null);
  const [timer, setTimer] = useState(timeLimit);
  const timerRef = useRef(null);

  useEffect(() => {
    // Speak the word
    speak(question.word, { lang: 'en-US', rate: 0.5 });
    // Start timer
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          onAnswer(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleSelect = (opt) => {
    if (selected !== null) return;
    setSelected(opt.word);
    clearInterval(timerRef.current);
    const isCorrect = opt.word === question.word;
    if (isCorrect) playCorrect(); else playWrong();
    setTimeout(() => onAnswer(isCorrect), 600);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 mx-4 w-full max-w-sm shadow-2xl animate-pop-in">
        {/* Timer */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-4xl">{question.emoji}</span>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-black ${
            timer <= 3 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-100 text-blue-600'
          }`}>
            {timer}
          </div>
        </div>

        {/* Question */}
        <div className="text-center mb-4">
          <button onClick={() => speak(question.word, { lang: 'en-US', rate: 0.5 })}
            className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl px-4 py-2">
            <Volume2 size={18} className="text-blue-500" />
            <span className="text-sm text-gray-500">{t('listenAgain', uiLang)}</span>
          </button>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 gap-2">
          {options.map((opt, i) => {
            const isThis = selected === opt.word;
            const isCorrect = opt.word === question.word;
            const showResult = selected !== null;

            return (
              <button
                key={i}
                onClick={() => handleSelect(opt)}
                disabled={selected !== null}
                className={`px-4 py-3 rounded-xl font-bold text-lg transition-all flex items-center gap-3 ${
                  showResult && isCorrect
                    ? 'bg-emerald-100 border-2 border-emerald-400 text-emerald-700'
                    : showResult && isThis && !isCorrect
                      ? 'bg-red-100 border-2 border-red-400 text-red-700 animate-shake'
                      : 'bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 active:scale-95'
                }`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span>{opt.word}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
//  BOSS FIGHT
// ═══════════════════════════════════════════

function BossFight({ boss, world, onComplete, uiLang, speak }) {
  const [hp, setHp] = useState(boss.hp);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [phase, setPhase] = useState('intro'); // intro, fight, victory

  const currentWord = boss.words[currentWordIdx];

  useEffect(() => {
    if (phase === 'intro') {
      setTimeout(() => setPhase('fight'), 2000);
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== 'fight' || !currentWord) return;
    // Create options
    const wrongWords = shuffle(boss.words.filter(w => w.word !== currentWord.word));
    const opts = shuffle([currentWord, ...wrongWords.slice(0, 2)]);
    setOptions(opts);
    setSelected(null);
    speak(currentWord.word, { lang: 'en-US', rate: 0.5 });
  }, [phase, currentWordIdx]);

  const handleSelect = (opt) => {
    if (selected !== null) return;
    setSelected(opt.word);
    const isCorrect = opt.word === currentWord.word;

    if (isCorrect) {
      playCorrect();
      const newHp = hp - 1;
      setHp(newHp);
      setTimeout(() => {
        if (newHp <= 0) {
          playComplete();
          setPhase('victory');
        } else {
          setCurrentWordIdx(prev => prev + 1);
        }
      }, 800);
    } else {
      playWrong();
      setTimeout(() => setSelected(null), 600);
    }
  };

  if (phase === 'intro') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center" style={{ background: world.bgGradient }}>
        <div className="animate-jelly text-8xl mb-4">{boss.emoji}</div>
        <h2 className="text-3xl font-black text-white drop-shadow-lg mb-2">
          {boss.name}
        </h2>
        <p className="text-white/70 text-lg font-medium">
          {uiLang === 'he' ? 'הביסו את הבוס!' : 'Defeat the boss!'}
        </p>
      </div>
    );
  }

  if (phase === 'victory') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center" style={{ background: world.bgGradient }}>
        <ConfettiBurst show={true} />
        <div className="relative z-10 text-center">
          <SpeakliAvatar mode="celebrate" size="lg" glow />
          <h2 className="text-3xl font-black text-white drop-shadow-lg mt-4 mb-2">
            {uiLang === 'he' ? 'ניצחת!' : 'You Won!'}
          </h2>
          <button
            onClick={() => onComplete(true)}
            className="mt-6 px-10 py-4 rounded-2xl font-black text-white text-xl bg-gradient-to-r from-yellow-400 to-orange-500 shadow-2xl active:scale-95"
          >
            {t('continue', uiLang)} ✨
          </button>
        </div>
      </div>
    );
  }

  // Fight phase
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center" style={{ background: world.bgGradient }}>
      <div className="relative z-10 w-full max-w-sm mx-auto px-4">
        {/* Boss */}
        <div className="text-center mb-6">
          <div className={`text-7xl ${selected && selected !== currentWord?.word ? 'animate-shake' : hp < boss.hp ? 'animate-jelly' : ''}`}>
            {boss.emoji}
          </div>
          {/* HP bar */}
          <div className="flex justify-center gap-2 mt-3">
            {[...Array(boss.hp)].map((_, i) => (
              <Heart key={i} size={24} className={`transition-all ${
                i < hp ? 'text-red-500 fill-red-500' : 'text-gray-400 opacity-30'
              }`} />
            ))}
          </div>
        </div>

        {/* Word */}
        <div className="text-center mb-4">
          <button onClick={() => speak(currentWord?.word, { lang: 'en-US', rate: 0.5 })}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-white">
            <Volume2 size={18} />
            <span className="text-lg font-bold">{currentWord?.emoji}</span>
          </button>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 gap-2">
          {options.map((opt, i) => {
            const isThis = selected === opt.word;
            const isCorrect = opt.word === currentWord?.word;
            const showResult = selected !== null;

            return (
              <button
                key={`${currentWordIdx}-${i}`}
                onClick={() => handleSelect(opt)}
                disabled={selected !== null && isThis}
                className={`px-4 py-3 rounded-xl font-bold text-lg transition-all flex items-center gap-3 ${
                  showResult && isCorrect
                    ? 'bg-emerald-400 text-white'
                    : showResult && isThis && !isCorrect
                      ? 'bg-red-400 text-white animate-shake'
                      : 'bg-white/90 text-gray-800 active:scale-95'
                }`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span>{opt.word}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
//  GAME OVER SCREEN
// ═══════════════════════════════════════════

function RunnerGameOver({ score, coins, wordsLearned, stars, xp, onContinue, uiLang }) {
  return (
    <div className="kids-bg min-h-screen relative">
      <FloatingDecorations />
      <ConfettiBurst show={stars >= 2} />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6">
        <SpeakliAvatar mode={stars >= 2 ? 'celebrate' : 'happy'} size="lg" glow />
        <h2 className="text-3xl font-black mt-4 mb-2" style={{
          background: 'linear-gradient(135deg, #2563EB, #06B6D4, #F59E0B)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          {stars >= 3
            ? (uiLang === 'he' ? 'מושלם!' : 'Perfect!')
            : stars >= 2
              ? (uiLang === 'he' ? 'מעולה!' : 'Excellent!')
              : (uiLang === 'he' ? 'כל הכבוד!' : 'Well Done!')}
        </h2>

        {/* Stats */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl px-6 py-4 mb-4 shadow-lg w-full max-w-xs">
          <div className="flex justify-around">
            <div className="text-center">
              <div className="text-2xl">🪙</div>
              <div className="text-sm font-bold text-gray-600">{coins}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl">📖</div>
              <div className="text-sm font-bold text-gray-600">{wordsLearned}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl">🏆</div>
              <div className="text-sm font-bold text-gray-600">{score}</div>
            </div>
          </div>
        </div>

        {/* Stars */}
        <div className="flex gap-2 mb-4">
          {[0, 1, 2].map(i => (
            <Star key={i} size={40} className={`transition-all ${
              i < stars ? 'text-yellow-400 fill-yellow-400 animate-pop-in' : 'text-gray-300'
            }`} style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>

        {/* XP */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl px-6 py-3 mb-6 shadow-lg">
          <div className="flex items-center gap-2">
            <Zap size={20} className="text-yellow-500" />
            <span className="text-lg font-bold text-yellow-600">+{xp} XP</span>
          </div>
        </div>

        <button onClick={onContinue}
          className="px-10 py-4 rounded-2xl font-black text-white text-xl bg-gradient-to-r from-cyan-400 to-blue-500 shadow-2xl active:scale-95"
        >
          {t('continue', uiLang)} ✨
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
//  MAIN GAME COMPONENT
// ═══════════════════════════════════════════

export default function WordRunnerGame({ onComplete, onBack, childLevel = 1 }) {
  const { uiLang } = useTheme();
  const { speak } = useSpeech();
  const { progress, updateProgress, addXP, recordWordPractice } = useUserProgress();
  const speakRef = useRef(speak);
  speakRef.current = speak;

  // ── Phase state ──
  const [phase, setPhase] = useState('world-select');
  // world-select, level-select, countdown, playing, challenge, boss, game-over
  const [selectedWorld, setSelectedWorld] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);

  // ── Game state ──
  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [wordsLearned, setWordsLearned] = useState([]);
  const [streak, setStreak] = useState(0);
  const [powerMode, setPowerMode] = useState(false);
  const [gameResult, setGameResult] = useState(null); // { stars, xp }
  const [challengeData, setChallengeData] = useState(null);

  // ── Refs for game loop ──
  const viewportRef = useRef(null);
  const rafRef = useRef(null);
  const levelRef = useRef(null);
  const playerRef = useRef({
    x: 60, y: 0, vx: 0, vy: 0,
    onGround: false, jumping: false,
    invincible: false, invincibleUntil: 0,
  });
  const cameraRef = useRef({ x: 0 });
  const inputRef = useRef({ jump: false });
  const frameRef = useRef(0);
  const scrollSpeedRef = useRef(BASE_SCROLL_SPEED);
  const pausedRef = useRef(false);
  const collectedCoinsRef = useRef(new Set());
  const activatedBlocksRef = useRef(new Set());
  const deadEnemiesRef = useRef(new Set());

  // ── Force re-render from game loop ──
  const [, setFrame] = useState(0);

  // ── Cleanup ──
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      stopAllAudio();
    };
  }, []);

  // ── Viewport dimensions ──
  const [viewSize, setViewSize] = useState({ w: VIEWPORT_W, h: VIEWPORT_H });
  useEffect(() => {
    const update = () => {
      setViewSize({ w: window.innerWidth, h: window.innerHeight });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const scaleX = viewSize.w / VIEWPORT_W;
  const scaleY = viewSize.h / VIEWPORT_H;
  const scale = Math.min(scaleX, scaleY);

  // ── World progress ──
  const runnerProgress = progress.wordRunner || {};

  // ── Start level ──
  const startLevel = useCallback((worldId, levelIdx) => {
    const world = WORLDS.find(w => w.id === worldId);
    const words = getWorldWords(worldId, childLevel);
    const level = generateLevel(worldId, levelIdx, words, childLevel);
    levelRef.current = level;

    // Reset player
    playerRef.current = {
      x: 60, y: level.groundY - PLAYER_H, vx: 0, vy: 0,
      onGround: true, jumping: false,
      invincible: false, invincibleUntil: 0,
    };
    cameraRef.current = { x: 0 };
    collectedCoinsRef.current = new Set();
    activatedBlocksRef.current = new Set();
    deadEnemiesRef.current = new Set();
    scrollSpeedRef.current = BASE_SCROLL_SPEED;
    pausedRef.current = false;
    frameRef.current = 0;

    setLives(MAX_LIVES);
    setScore(0);
    setCoinsCollected(0);
    setWordsLearned([]);
    setStreak(0);
    setPowerMode(false);
    setChallengeData(null);
    setGameResult(null);
    setPhase('countdown');

    // Countdown → playing
    setTimeout(() => setPhase('playing'), 2500);
  }, [childLevel]);

  // ── Game loop ──
  useEffect(() => {
    if (phase !== 'playing') return;
    const level = levelRef.current;
    if (!level) return;

    const loop = () => {
      if (pausedRef.current) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const player = playerRef.current;
      const camera = cameraRef.current;
      frameRef.current++;

      // Auto-scroll
      player.x += scrollSpeedRef.current;

      // Jump input
      if (inputRef.current.jump && player.onGround) {
        player.vy = JUMP_VEL;
        player.onGround = false;
        player.jumping = true;
        inputRef.current.jump = false;
        playPop();
      }
      inputRef.current.jump = false;

      // Gravity
      player.vy += GRAVITY;
      player.y += player.vy;

      // Platform collision (only check nearby platforms)
      player.onGround = false;
      const pb = playerBox(player);
      for (const plat of level.platforms) {
        // Only check platforms near player
        if (plat.x > player.x + VIEWPORT_W || plat.x + plat.w < player.x - 100) continue;

        if (
          player.vy >= 0 &&
          pb.x + pb.w > plat.x &&
          pb.x < plat.x + plat.w &&
          pb.y + pb.h >= plat.y &&
          pb.y + pb.h <= plat.y + plat.h + player.vy + 2
        ) {
          player.y = plat.y - PLAYER_H;
          player.vy = 0;
          player.onGround = true;
          player.jumping = false;
        }
      }

      // Fall off screen
      if (player.y > VIEWPORT_H + 50) {
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            endGame(false);
          } else {
            // Respawn
            player.x = Math.max(60, camera.x + 60);
            player.y = level.groundY - PLAYER_H - 50;
            player.vy = 0;
            player.invincible = true;
            player.invincibleUntil = Date.now() + INVINCIBLE_MS;
          }
          return newLives;
        });
      }

      // Invincibility timer
      if (player.invincible && Date.now() > player.invincibleUntil) {
        player.invincible = false;
      }

      // Coin collection
      for (let i = 0; i < level.coins.length; i++) {
        if (collectedCoinsRef.current.has(i)) continue;
        const coin = level.coins[i];
        if (aabb(pb, { x: coin.x, y: coin.y, w: 30, h: 30 })) {
          collectedCoinsRef.current.add(i);
          playPop();
          setCoinsCollected(prev => prev + 1);
          setScore(prev => prev + 10);
          setWordsLearned(prev => [...prev, coin.word]);
          // Speak word quietly
          speak(coin.word, { lang: 'en-US', rate: 0.6 });
        }
      }

      // Question block activation (jump into from below)
      for (let i = 0; i < level.blocks.length; i++) {
        if (activatedBlocksRef.current.has(i)) continue;
        const block = level.blocks[i];
        if (
          player.vy < 0 &&
          aabb(pb, { x: block.x, y: block.y, w: block.w, h: block.h })
        ) {
          activatedBlocksRef.current.add(i);
          pausedRef.current = true;
          player.vy = 0;
          // Show challenge
          setChallengeData({
            blockIndex: i,
            question: block.question,
            options: block.options,
          });
          setPhase('challenge');
        }
      }

      // Enemy collision
      for (let i = 0; i < level.enemies.length; i++) {
        if (deadEnemiesRef.current.has(i)) continue;
        const enemy = level.enemies[i];
        if (!enemy.alive) continue;

        // Move enemy
        enemy.x += ENEMY_SPEED * enemy.dir;
        if (enemy.x > enemy.startX + enemy.moveRange || enemy.x < enemy.startX) {
          enemy.dir *= -1;
        }

        if (aabb(pb, { x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h })) {
          // Jump on top = kill
          if (player.vy > 0 && player.y + PLAYER_H < enemy.y + enemy.h / 2) {
            deadEnemiesRef.current.add(i);
            enemy.alive = false;
            player.vy = JUMP_VEL * 0.6; // bounce
            playCorrect();
            setScore(prev => prev + 20);
          } else if (!player.invincible) {
            // Hit by enemy
            playWrong();
            player.invincible = true;
            player.invincibleUntil = Date.now() + INVINCIBLE_MS;
            player.vy = JUMP_VEL * 0.5;
            setLives(prev => {
              const newLives = prev - 1;
              if (newLives <= 0) endGame(false);
              return newLives;
            });
          }
        }
      }

      // Reached flag
      if (player.x >= level.flag.x) {
        if (level.isBoss) {
          setPhase('boss');
        } else {
          endGame(true);
        }
        return; // stop loop
      }

      // Camera follow
      camera.x = Math.max(0, player.x - VIEWPORT_W * 0.3);

      // Force re-render
      setFrame(frameRef.current);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  // ── End game ──
  const endGame = useCallback((won) => {
    cancelAnimationFrame(rafRef.current);
    const baseXP = coinsCollected * 3 + score / 10;
    const stars = won ? (lives >= 3 ? 3 : lives >= 2 ? 2 : 1) : 0;
    const xp = Math.round(baseXP + stars * 5);

    // Save progress
    if (won && selectedWorld && selectedLevel !== null) {
      const worldProg = runnerProgress[selectedWorld] || {};
      const completedLevels = Math.max(worldProg.completedLevels || 0, selectedLevel + 1);
      const totalStars = (worldProg.stars || 0) + stars;
      updateProgress({
        wordRunner: {
          ...runnerProgress,
          [selectedWorld]: {
            ...worldProg,
            completedLevels,
            stars: totalStars,
            [`level${selectedLevel}`]: { stars, score },
          },
        },
      });
    }

    if (wordsLearned.length > 0) {
      recordWordPractice(wordsLearned);
    }

    setGameResult({ stars, xp, won });
    setPhase('game-over');
    if (xp > 0) addXP(xp, 'word-runner').catch(() => {});
  }, [coinsCollected, score, lives, selectedWorld, selectedLevel, wordsLearned, runnerProgress]);

  // ── Handle challenge answer ──
  const handleChallengeAnswer = useCallback((isCorrect) => {
    setChallengeData(null);
    if (isCorrect) {
      setScore(prev => prev + 30);
      setStreak(prev => {
        const ns = prev + 1;
        if (ns >= POWER_STREAK) setPowerMode(true);
        return ns;
      });
      playCorrect();
    } else {
      setStreak(0);
      setPowerMode(false);
      playWrong();
    }
    pausedRef.current = false;
    setPhase('playing');
  }, []);

  // ── Handle boss completion ──
  const handleBossComplete = useCallback((won) => {
    if (won) {
      setScore(prev => prev + 100);
    }
    endGame(won);
  }, [endGame]);

  // ── Input handler ──
  const handleTap = useCallback(() => {
    if (phase === 'playing') {
      inputRef.current.jump = true;
    }
  }, [phase]);

  // ── Get current world ──
  const world = WORLDS.find(w => w.id === selectedWorld);
  const level = levelRef.current;

  // ═══════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════

  // World select
  if (phase === 'world-select') {
    return (
      <WorldSelect
        worlds={WORLDS}
        progress={runnerProgress}
        childLevel={childLevel}
        onSelect={(worldId) => { setSelectedWorld(worldId); setPhase('level-select'); }}
        onBack={onBack}
        uiLang={uiLang}
      />
    );
  }

  // Level select
  if (phase === 'level-select' && world) {
    return (
      <LevelSelect
        world={world}
        progress={runnerProgress}
        onSelect={(levelIdx) => { setSelectedLevel(levelIdx); startLevel(selectedWorld, levelIdx); }}
        onBack={() => setPhase('world-select')}
        uiLang={uiLang}
      />
    );
  }

  // Countdown
  if (phase === 'countdown' && world) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center" style={{ background: world.bgGradient }}>
        <div className="text-center">
          <div className="text-8xl font-black text-white drop-shadow-lg animate-pop-in">
            3
          </div>
          <p className="text-white/70 text-lg mt-4 font-medium">
            {uiLang === 'he' ? 'הקש לקפוץ!' : 'Tap to jump!'}
          </p>
        </div>
      </div>
    );
  }

  // Boss fight
  if (phase === 'boss' && world && level?.boss) {
    return (
      <BossFight
        boss={level.boss}
        world={world}
        onComplete={handleBossComplete}
        uiLang={uiLang}
        speak={speak}
      />
    );
  }

  // Game over
  if (phase === 'game-over' && gameResult) {
    return (
      <RunnerGameOver
        score={score}
        coins={coinsCollected}
        wordsLearned={wordsLearned.length}
        stars={gameResult.stars}
        xp={gameResult.xp}
        onContinue={() => onComplete(gameResult.xp)}
        uiLang={uiLang}
      />
    );
  }

  // ── Main gameplay ──
  if ((phase === 'playing' || phase === 'challenge') && world && level) {
    const player = playerRef.current;
    const camera = cameraRef.current;

    // Only render entities near the camera
    const visibleRange = { left: camera.x - 100, right: camera.x + VIEWPORT_W + 100 };

    return (
      <div
        ref={viewportRef}
        className="fixed inset-0 overflow-hidden select-none touch-none"
        onClick={handleTap}
        onTouchStart={handleTap}
        style={{ cursor: 'pointer' }}
      >
        {/* Background */}
        <ParallaxBackground world={world} cameraX={camera.x} viewW={viewSize.w} viewH={viewSize.h} />

        {/* Game world — scrolls with camera */}
        <div className="absolute inset-0" style={{
          transform: `translateX(${-camera.x * scaleX / (VIEWPORT_W / viewSize.w)}px)`,
        }}>
          {/* Ground */}
          {level.platforms.filter(p => p.isGround).map((plat, i) => (
            <div key={`g${i}`} className="absolute" style={{
              left: plat.x * (viewSize.w / VIEWPORT_W),
              top: plat.y * (viewSize.h / VIEWPORT_H),
              width: plat.w * (viewSize.w / VIEWPORT_W),
              height: plat.h * (viewSize.h / VIEWPORT_H),
              background: world.groundColor,
              borderTop: `3px solid ${world.grassColor}`,
            }} />
          ))}

          {/* Platforms */}
          {level.platforms.filter(p => !p.isGround && p.x > visibleRange.left && p.x < visibleRange.right).map((plat, i) => (
            <div key={`p${i}`} className="absolute" style={{
              left: plat.x * (viewSize.w / VIEWPORT_W),
              top: plat.y * (viewSize.h / VIEWPORT_H),
              width: plat.w * (viewSize.w / VIEWPORT_W),
              height: plat.h * (viewSize.h / VIEWPORT_H),
              background: world.platformColor,
              borderTop: `3px solid ${world.platformTop}`,
              borderRadius: '4px 4px 0 0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }} />
          ))}

          {/* Coins */}
          {level.coins.map((coin, i) => {
            if (collectedCoinsRef.current.has(i)) return null;
            if (coin.x < visibleRange.left || coin.x > visibleRange.right) return null;
            const bobY = Math.sin(frameRef.current * COIN_BOB_SPEED + i) * COIN_BOB_AMP;
            return (
              <div key={`c${i}`} className="absolute flex flex-col items-center" style={{
                left: coin.x * (viewSize.w / VIEWPORT_W),
                top: (coin.y + bobY) * (viewSize.h / VIEWPORT_H),
                transition: 'none',
              }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                  style={{
                    background: 'radial-gradient(circle at 30% 30%, #FFD700, #FFA500)',
                    boxShadow: '0 0 8px rgba(255,215,0,0.6), 0 2px 4px rgba(0,0,0,0.2)',
                    border: '2px solid #FFE44D',
                  }}>
                  {coin.emoji}
                </div>
                <span className="text-xs font-bold text-white drop-shadow-md mt-0.5">{coin.word}</span>
              </div>
            );
          })}

          {/* Question blocks */}
          {level.blocks.map((block, i) => {
            if (activatedBlocksRef.current.has(i)) return null;
            if (block.x < visibleRange.left || block.x > visibleRange.right) return null;
            return (
              <div key={`b${i}`} className="absolute animate-jelly" style={{
                left: block.x * (viewSize.w / VIEWPORT_W),
                top: block.y * (viewSize.h / VIEWPORT_H),
                width: TILE * (viewSize.w / VIEWPORT_W),
                height: TILE * (viewSize.h / VIEWPORT_H),
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                borderRadius: 6,
                border: '3px solid #B8860B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: 900,
                color: '#8B4513',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.3)',
              }}>
                ?
              </div>
            );
          })}

          {/* Enemies */}
          {level.enemies.map((enemy, i) => {
            if (deadEnemiesRef.current.has(i) || !enemy.alive) return null;
            if (enemy.x < visibleRange.left || enemy.x > visibleRange.right) return null;
            return (
              <div key={`e${i}`} className="absolute" style={{
                left: enemy.x * (viewSize.w / VIEWPORT_W),
                top: enemy.y * (viewSize.h / VIEWPORT_H),
                fontSize: 32,
                transform: enemy.dir < 0 ? 'scaleX(-1)' : 'none',
              }}>
                🐸
              </div>
            );
          })}

          {/* Flag */}
          <div className="absolute flex flex-col items-center" style={{
            left: level.flag.x * (viewSize.w / VIEWPORT_W),
            top: level.flag.y * (viewSize.h / VIEWPORT_H),
          }}>
            <span className="text-3xl">🏁</span>
            <div style={{
              width: 4,
              height: level.flag.h * (viewSize.h / VIEWPORT_H),
              background: '#8B4513',
            }} />
          </div>
        </div>

        {/* Player character — fixed position relative to viewport */}
        <div className="absolute z-20" style={{
          left: (player.x - camera.x) * (viewSize.w / VIEWPORT_W),
          top: player.y * (viewSize.h / VIEWPORT_H),
          width: PLAYER_W * (viewSize.w / VIEWPORT_W),
          height: PLAYER_H * (viewSize.h / VIEWPORT_H),
          opacity: player.invincible ? (Math.floor(Date.now() / 100) % 2 ? 0.3 : 1) : 1,
          transition: 'opacity 0.1s',
        }}>
          <SpeakliAvatar
            mode={player.jumping ? 'jump' : powerMode ? 'celebrate' : 'idle'}
            size="sm"
          />
        </div>

        {/* Power mode glow */}
        {powerMode && (
          <div className="fixed inset-0 pointer-events-none z-10" style={{
            background: 'radial-gradient(circle at 30% 80%, rgba(255,215,0,0.15) 0%, transparent 60%)',
            animation: 'powerPulse 1s ease-in-out infinite alternate',
          }} />
        )}

        {/* HUD */}
        <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-3"
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)' }}>
          {/* Back button */}
          <button onClick={(e) => { e.stopPropagation(); onBack(); }}
            className="bg-black/30 backdrop-blur-sm rounded-full p-2 min-w-[40px] min-h-[40px] flex items-center justify-center">
            <ArrowLeft size={18} className="text-white" />
          </button>

          {/* Lives */}
          <div className="flex gap-1">
            {[...Array(MAX_LIVES)].map((_, i) => (
              <Heart key={i} size={20} className={i < lives ? 'text-red-500 fill-red-500' : 'text-white/30'} />
            ))}
          </div>

          {/* Score + Coins */}
          <div className="bg-black/30 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2">
            <span className="text-yellow-300 text-sm font-bold">🪙 {coinsCollected}</span>
            <span className="text-white text-sm font-bold">{score}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="fixed bottom-4 left-4 right-4 z-30">
          <div className="bg-black/20 backdrop-blur-sm rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all"
              style={{ width: `${Math.min(100, (player.x / level.length) * 100)}%` }} />
          </div>
        </div>

        {/* Streak indicator */}
        {streak >= 2 && (
          <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-30 bg-yellow-400 text-yellow-900 rounded-full px-3 py-1 text-sm font-black animate-pop-in">
            🔥 {streak}x
          </div>
        )}

        {/* Word challenge overlay */}
        {phase === 'challenge' && challengeData && (
          <WordChallenge
            question={challengeData.question}
            options={challengeData.options}
            onAnswer={handleChallengeAnswer}
            uiLang={uiLang}
            speak={speak}
            timeLimit={CHALLENGE_TIME}
          />
        )}
      </div>
    );
  }

  // Fallback
  return null;
}
