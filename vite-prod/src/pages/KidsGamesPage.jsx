import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { ArrowLeft, Volume2, Star, Zap, RotateCcw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useUserProgress } from '../contexts/UserProgressContext.jsx';
import { useSpeech } from '../contexts/SpeechContext.jsx';
import { playSequence, playHebrew } from '../utils/hebrewAudio.js';
import alphabetData from '../data/alphabet-kids.json';
import wordsA1 from '../data/words-a1.json';

/* ── Confetti burst ── */
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

/* ── Floating decorations ── */
function FloatingDecorations() {
  const items = ['⭐', '🌈', '🎈', '🦋', '🌸', '✨', '🎵', '💫'];
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {items.map((e, i) => (
        <div
          key={i}
          className="absolute animate-float text-2xl opacity-20"
          style={{
            left: `${10 + (i * 12) % 90}%`,
            top: `${5 + (i * 17) % 85}%`,
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${3 + i * 0.5}s`,
          }}
        >
          {e}
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   GAME 1: BUBBLE POP ABCs
   Bubbles float up with letters. Voice says "Find the
   letter B!" - child taps the right bubble to pop it.
   ══════════════════════════════════════════════════════ */
function BubblePopGame({ onComplete, onBack }) {
  const { uiLang } = useTheme();
  const { speak, speakSequence } = useSpeech();
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [bubbles, setBubbles] = useState([]);
  const [targetLetter, setTargetLetter] = useState(null);
  const [popped, setPopped] = useState([]);
  const [wrongId, setWrongId] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const animRef = useRef(null);
  const containerRef = useRef(null);
  const speakRef = useRef(speak);
  speakRef.current = speak;
  const instructionsGiven = useRef(false);

  const TOTAL_ROUNDS = 6;
  const BUBBLES_PER_ROUND = 8;

  // Pick random letters for each round
  const rounds = useMemo(() => {
    const shuffled = [...alphabetData].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, TOTAL_ROUNDS);
  }, []);

  // Generate bubbles for current round
  useEffect(() => {
    if (round >= TOTAL_ROUNDS) {
      setGameOver(true);
      setShowConfetti(true);
      return;
    }
    const target = rounds[round];
    setTargetLetter(target);
    setPopped([]);
    setWrongId(null);

    // Create bubbles: 2 correct + 6 wrong
    const others = alphabetData
      .filter(l => l.letter !== target.letter)
      .sort(() => Math.random() - 0.5)
      .slice(0, BUBBLES_PER_ROUND - 2);

    const allBubbles = [
      { id: 0, letter: target.letter, isTarget: true, color: target.color, emoji: target.emoji },
      { id: 1, letter: target.lower, isTarget: true, color: target.color, emoji: target.emoji },
      ...others.map((l, i) => ({
        id: i + 2,
        letter: Math.random() > 0.5 ? l.letter : l.lower,
        isTarget: false,
        color: l.color,
        emoji: l.emoji,
      })),
    ].sort(() => Math.random() - 0.5).map((b, i) => ({
      ...b,
      x: 8 + (i % 4) * 23 + (Math.random() * 8 - 4),
      y: 100 + Math.random() * 20,
      speed: 0.06 + Math.random() * 0.08,
      size: 62 + Math.random() * 18,
      wobbleOffset: Math.random() * Math.PI * 2,
    }));

    setBubbles(allBubbles);

    // Voice instructions on first round, then just say the letter
    if (round === 0 && !instructionsGiven.current) {
      instructionsGiven.current = true;
      const t = setTimeout(() => {
        playSequence([
          { text: 'היי!', lang: 'he' },
          { pause: 400 },
          { text: 'מצאו את הבועה', lang: 'he' },
          { pause: 300 },
          { text: 'עם האות הנכונה', lang: 'he' },
          { pause: 300 },
          { text: 'ולחצו עליה', lang: 'he' },
          { pause: 600 },
          { text: 'איפה האות', lang: 'he' },
          { pause: 300 },
          { text: target.letter, lang: 'en-US', rate: 0.7 },
        ], speakRef.current);
      }, 500);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        playSequence([
          { text: 'איפה האות', lang: 'he' },
          { pause: 300 },
          { text: target.letter, lang: 'en-US', rate: 0.7 },
        ], speakRef.current);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [round, rounds]);

  // Animate bubbles floating up
  useEffect(() => {
    if (gameOver) return;
    let lastTime = Date.now();
    const animate = () => {
      const now = Date.now();
      const dt = (now - lastTime) / 16;
      lastTime = now;
      setBubbles(prev => prev.map(b => ({
        ...b,
        y: b.y <= -20 ? 110 : b.y - b.speed * dt,
        x: b.x + Math.sin((now / 1000 + b.wobbleOffset) * 1.5) * 0.15,
      })));
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [gameOver]);

  const handlePop = (bubble) => {
    if (popped.includes(bubble.id)) return;
    speak(bubble.letter, { rate: 0.8 });

    if (bubble.isTarget) {
      setPopped(prev => {
        const next = [...prev, bubble.id];
        if (next.length >= 2) {
          // Round complete
          setScore(s => s + 1);
          setTimeout(() => setRound(r => r + 1), 800);
        }
        return next;
      });
    } else {
      setWrongId(bubble.id);
      setTimeout(() => setWrongId(null), 500);
    }
  };

  if (gameOver) {
    return (
      <div className="kids-bg min-h-screen relative">
        <FloatingDecorations />
        <ConfettiBurst show={showConfetti} />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6">
          <div className="text-7xl mb-4 animate-jelly">🫧</div>
          <h2 className="text-4xl font-black rainbow-text py-2 mb-2">
            {uiLang === 'he' ? '!כל הכבוד' : 'Great Job!'}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2 font-medium">
            {uiLang === 'he' ? `פוצצת ${score} בועות!` : `You popped ${score} bubbles!`}
          </p>
          <div className="flex gap-2 mb-6">
            {[...Array(TOTAL_ROUNDS)].map((_, i) => (
              <Star key={i} size={32} className={`${i < score ? 'text-yellow-400 fill-yellow-400 animate-pop-in' : 'text-gray-300'}`} style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl px-6 py-3 mb-6 shadow-lg">
            <div className="flex items-center gap-2">
              <Zap size={20} className="text-yellow-500" />
              <span className="text-lg font-bold text-yellow-600">+{score * 3} XP</span>
            </div>
          </div>
          <button onClick={() => onComplete(score * 3)} className="px-10 py-5 rounded-2xl font-black text-white text-xl bg-gradient-to-r from-cyan-400 to-blue-500 shadow-2xl active:scale-[0.97] transition-all">
            {uiLang === 'he' ? 'המשך' : 'Continue'} ✨
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="kids-bg min-h-screen relative overflow-hidden" ref={containerRef}>
      <FloatingDecorations />
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <button onClick={onBack} className="text-gray-400 hover:text-gray-600 bg-white/50 dark:bg-gray-800/50 rounded-full p-2 backdrop-blur-sm">
            <ArrowLeft size={18} />
          </button>
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full px-4 py-1.5 flex items-center gap-2">
            <span className="text-lg">🫧</span>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
              {round + 1}/{TOTAL_ROUNDS}
            </span>
          </div>
          <div className="flex gap-1">
            {[...Array(TOTAL_ROUNDS)].map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i < score ? 'bg-yellow-400' : i === round ? 'bg-cyan-400 w-4' : 'bg-gray-300 dark:bg-gray-600'}`} />
            ))}
          </div>
        </div>

        {/* Target letter prompt */}
        {targetLetter && (
          <div className="text-center mb-2 px-4">
            <button
              onClick={() => speak(targetLetter.letter, { rate: 0.7 })}
              className="inline-flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg"
            >
              <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                {uiLang === 'he' ? '!מצא את האות' : 'Find the letter'}
              </span>
              <span className={`text-4xl font-black bg-gradient-to-r ${targetLetter.color} bg-clip-text text-transparent animate-jelly`}>
                {targetLetter.letter}
              </span>
              <Volume2 size={18} className="text-gray-400" />
            </button>
          </div>
        )}

        {/* Bubble field */}
        <div className="relative w-full" style={{ height: 'calc(100vh - 140px)' }}>
          {bubbles.map(bubble => (
            <button
              key={bubble.id}
              onClick={() => handlePop(bubble)}
              disabled={popped.includes(bubble.id)}
              className={`absolute transition-all duration-200 rounded-full flex items-center justify-center font-black text-white drop-shadow-lg ${
                popped.includes(bubble.id)
                  ? 'scale-150 opacity-0'
                  : wrongId === bubble.id
                    ? 'animate-shake scale-90'
                    : 'hover:scale-110 active:scale-75'
              }`}
              style={{
                left: `${bubble.x}%`,
                top: `${bubble.y}%`,
                width: bubble.size,
                height: bubble.size,
                fontSize: bubble.size * 0.45,
                background: popped.includes(bubble.id)
                  ? 'rgba(52, 211, 153, 0.5)'
                  : `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.6), rgba(120,200,255,0.3) 40%, rgba(100,150,255,0.2) 70%, transparent)`,
                border: popped.includes(bubble.id) ? 'none' : '2px solid rgba(255,255,255,0.5)',
                boxShadow: popped.includes(bubble.id) ? 'none' : `inset 0 -4px 8px rgba(0,0,0,0.08), 0 4px 20px rgba(100,150,255,0.25)`,
                transitionProperty: popped.includes(bubble.id) ? 'all' : 'transform',
                transitionDuration: popped.includes(bubble.id) ? '0.4s' : '0.15s',
              }}
            >
              {popped.includes(bubble.id) ? '✨' : (
                <span className="drop-shadow-md" style={{ color: '#334155' }}>{bubble.letter}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   GAME 2: MEMORY MATCH
   Big colorful cards with simple kid words (colors,
   fruits, animals). Match word to picture.
   ══════════════════════════════════════════════════════ */

// Simple, visual words kids already know
const MEMORY_WORDS = [
  // Fruits
  { word: 'apple', emoji: '🍎', translation: 'תפוח', bg: 'from-red-300 to-red-400' },
  { word: 'banana', emoji: '🍌', translation: 'בננה', bg: 'from-yellow-200 to-yellow-400' },
  { word: 'orange', emoji: '🍊', translation: 'תפוז', bg: 'from-orange-300 to-orange-400' },
  { word: 'grape', emoji: '🍇', translation: 'ענבים', bg: 'from-purple-300 to-purple-400' },
  // Animals
  { word: 'cat', emoji: '🐱', translation: 'חתול', bg: 'from-amber-200 to-amber-400' },
  { word: 'dog', emoji: '🐶', translation: 'כלב', bg: 'from-yellow-300 to-amber-400' },
  { word: 'fish', emoji: '🐟', translation: 'דג', bg: 'from-blue-200 to-blue-400' },
  { word: 'bird', emoji: '🐦', translation: 'ציפור', bg: 'from-sky-200 to-sky-400' },
  // Colors
  { word: 'red', emoji: '🔴', translation: 'אדום', bg: 'from-red-300 to-red-500' },
  { word: 'blue', emoji: '🔵', translation: 'כחול', bg: 'from-blue-300 to-blue-500' },
  { word: 'green', emoji: '🟢', translation: 'ירוק', bg: 'from-green-300 to-green-500' },
  { word: 'yellow', emoji: '🟡', translation: 'צהוב', bg: 'from-yellow-200 to-yellow-400' },
  // Simple things
  { word: 'sun', emoji: '☀️', translation: 'שמש', bg: 'from-yellow-200 to-orange-300' },
  { word: 'moon', emoji: '🌙', translation: 'ירח', bg: 'from-indigo-200 to-indigo-400' },
  { word: 'star', emoji: '⭐', translation: 'כוכב', bg: 'from-yellow-200 to-yellow-400' },
  { word: 'heart', emoji: '❤️', translation: 'לב', bg: 'from-pink-300 to-rose-400' },
  { word: 'ball', emoji: '⚽', translation: 'כדור', bg: 'from-green-200 to-emerald-400' },
  { word: 'cake', emoji: '🎂', translation: 'עוגה', bg: 'from-pink-200 to-pink-400' },
];

function MemoryMatchGame({ onComplete, onBack }) {
  const { uiLang } = useTheme();
  const { speak, speakSequence } = useSpeech();
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const lockRef = useRef(false);

  const PAIRS = 4; // Only 4 pairs = 8 cards = big cards in 2 columns

  // Pick 4 simple words
  const wordPairs = useMemo(() => {
    return [...MEMORY_WORDS].sort(() => Math.random() - 0.5).slice(0, PAIRS);
  }, []);

  // Create card deck: "picture" card + "word" card per pair
  useEffect(() => {
    const deck = [];
    wordPairs.forEach((w, i) => {
      deck.push({
        id: i * 2, pairId: i, type: 'picture',
        emoji: w.emoji, word: w.word, translation: w.translation, bg: w.bg,
      });
      deck.push({
        id: i * 2 + 1, pairId: i, type: 'word',
        emoji: w.emoji, word: w.word, translation: w.translation, bg: w.bg,
      });
    });
    setCards(deck.sort(() => Math.random() - 0.5));
  }, [wordPairs]);

  // Voice instructions on game start - pre-recorded Hebrew audio
  useEffect(() => {
    const t = setTimeout(() => {
      playSequence([
        { text: 'משחק זיכרון', lang: 'he' },
        { pause: 400 },
        { text: 'לחצו על קלף', lang: 'he' },
        { pause: 350 },
        { text: 'ומצאו את הזוג שלו', lang: 'he' },
        { pause: 400 },
        { text: 'בהצלחה!', lang: 'he' },
      ], speak);
    }, 500);
    return () => clearTimeout(t);
  }, []);

  const handleFlip = (card) => {
    if (lockRef.current || flipped.includes(card.id) || matched.includes(card.pairId)) return;

    // Speak the English word clearly, then Hebrew (pre-recorded)
    playSequence([
      { text: card.word, lang: 'en-US', rate: 0.75 },
      { pause: 400 },
      { text: card.translation, lang: 'he' },
    ], speak);

    const newFlipped = [...flipped, card.id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      lockRef.current = true;
      setMoves(m => m + 1);

      const [first, second] = newFlipped.map(id => cards.find(c => c.id === id));

      if (first.pairId === second.pairId) {
        // Match found!
        setTimeout(() => {
          playSequence([
            { text: 'יופי!', lang: 'he' },
            { pause: 400 },
            { text: first.word, lang: 'en-US', rate: 0.75 },
            { pause: 300 },
            { text: first.translation, lang: 'he' },
          ], speak);
          setMatched(prev => {
            const next = [...prev, first.pairId];
            if (next.length >= PAIRS) {
              setShowConfetti(true);
              setTimeout(() => setGameOver(true), 800);
            }
            return next;
          });
          setFlipped([]);
          lockRef.current = false;
        }, 700);
      } else {
        // No match
        setTimeout(() => {
          setFlipped([]);
          lockRef.current = false;
        }, 1200);
      }
    }
  };

  const getStars = () => {
    if (moves <= PAIRS + 2) return 3;
    if (moves <= PAIRS * 2 + 1) return 2;
    return 1;
  };

  if (gameOver) {
    const starCount = getStars();
    const xp = starCount * 5 + PAIRS * 3;
    return (
      <div className="kids-bg min-h-screen relative">
        <FloatingDecorations />
        <ConfettiBurst show={showConfetti} />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6">
          <div className="text-7xl mb-4 animate-jelly">🧠</div>
          <h2 className="text-4xl font-black rainbow-text py-2 mb-2">
            {uiLang === 'he' ? '!מצוין' : 'Excellent!'}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-1 font-medium">
            {uiLang === 'he' ? `סיימת ב-${moves} מהלכים!` : `Done in ${moves} moves!`}
          </p>
          <div className="flex gap-2 mb-6 mt-2">
            {[0, 1, 2].map(i => (
              <Star key={i} size={44} className={`${i < starCount ? 'text-yellow-400 fill-yellow-400 animate-pop-in' : 'text-gray-300'}`} style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl px-6 py-3 mb-6 shadow-lg">
            <div className="flex items-center gap-2">
              <Zap size={22} className="text-yellow-500" />
              <span className="text-xl font-bold text-yellow-600">+{xp} XP</span>
            </div>
          </div>
          <button onClick={() => onComplete(xp)} className="px-10 py-5 rounded-2xl font-black text-white text-xl bg-gradient-to-r from-purple-400 to-pink-500 shadow-2xl active:scale-[0.97] transition-all">
            {uiLang === 'he' ? 'המשך' : 'Continue'} ✨
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="kids-bg min-h-screen pb-6 relative">
      <FloatingDecorations />
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <button onClick={onBack} className="text-gray-400 hover:text-gray-600 bg-white/50 dark:bg-gray-800/50 rounded-full p-2.5 backdrop-blur-sm">
            <ArrowLeft size={20} />
          </button>
          <div className="text-center">
            <h2 className="text-xl font-black text-gray-800 dark:text-white flex items-center gap-2">
              <span className="animate-wiggle inline-block">🧠</span>
              {uiLang === 'he' ? 'משחק זיכרון' : 'Memory Match'}
            </h2>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full px-3 py-1.5">
            <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
              {moves}
            </span>
          </div>
        </div>

        {/* Progress stars */}
        <div className="flex justify-center gap-3 mb-4 px-4">
          {[...Array(PAIRS)].map((_, i) => (
            <Star
              key={i}
              size={22}
              className={`transition-all duration-500 ${
                i < matched.length
                  ? 'text-yellow-400 fill-yellow-400 scale-125'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Card grid - 2 columns, big cards */}
        <div className="grid grid-cols-2 gap-3 px-4">
          {cards.map(card => {
            const isFlipped = flipped.includes(card.id) || matched.includes(card.pairId);
            const isMatched = matched.includes(card.pairId);

            return (
              <button
                key={card.id}
                onClick={() => handleFlip(card)}
                className={`rounded-2xl transition-all duration-300 relative overflow-hidden ${
                  isMatched
                    ? 'border-3 border-emerald-400 scale-[0.97] animate-success-flash'
                    : isFlipped
                      ? 'border-3 border-blue-400 shadow-2xl scale-[1.03]'
                      : 'shadow-lg active:scale-[0.93] hover:scale-[1.02]'
                }`}
                style={{ aspectRatio: '1 / 1.1' }}
              >
                {isFlipped ? (
                  <div className={`flex flex-col items-center justify-center h-full p-2 animate-pop-in rounded-2xl bg-gradient-to-br ${card.bg}`}>
                    {card.type === 'picture' ? (
                      <>
                        <span className="text-6xl mb-2 drop-shadow-lg">{card.emoji}</span>
                        <span className="text-lg font-black text-white drop-shadow-md">{card.word}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-3xl font-black text-white drop-shadow-md mb-1" dir="ltr">{card.word}</span>
                        <span className="text-base font-bold text-white/80" dir="rtl">{card.translation}</span>
                        <span className="text-3xl mt-1">{card.emoji}</span>
                      </>
                    )}
                    {isMatched && (
                      <div className="absolute top-2 right-2 animate-pop-in">
                        <Star size={20} className="text-yellow-300 fill-yellow-300 drop-shadow-md" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 rounded-2xl">
                    <span className="text-5xl text-white/60 drop-shadow-md mb-1">❓</span>
                    <span className="text-sm font-bold text-white/40">
                      {uiLang === 'he' ? 'לחץ!' : 'Tap!'}
                    </span>
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

/* ══════════════════════════════════════════════════════
   GAME 3: WORD BUILDER
   Drag/tap letter blocks to build CVC and simple words.
   Shows picture + plays sound, child arranges letters.
   ══════════════════════════════════════════════════════ */

// Simple words data for word builder (3-5 letters, kids-friendly)
const BUILDER_WORDS = [
  { word: 'cat', emoji: '🐱', translation: 'חתול' },
  { word: 'dog', emoji: '🐕', translation: 'כלב' },
  { word: 'sun', emoji: '☀️', translation: 'שמש' },
  { word: 'hat', emoji: '🎩', translation: 'כובע' },
  { word: 'cup', emoji: '🥤', translation: 'כוס' },
  { word: 'bed', emoji: '🛏️', translation: 'מיטה' },
  { word: 'bus', emoji: '🚌', translation: 'אוטובוס' },
  { word: 'fish', emoji: '🐟', translation: 'דג' },
  { word: 'bird', emoji: '🐦', translation: 'ציפור' },
  { word: 'star', emoji: '⭐', translation: 'כוכב' },
  { word: 'moon', emoji: '🌙', translation: 'ירח' },
  { word: 'tree', emoji: '🌳', translation: 'עץ' },
  { word: 'book', emoji: '📖', translation: 'ספר' },
  { word: 'ball', emoji: '⚽', translation: 'כדור' },
  { word: 'cake', emoji: '🎂', translation: 'עוגה' },
  { word: 'frog', emoji: '🐸', translation: 'צפרדע' },
  { word: 'duck', emoji: '🦆', translation: 'ברווז' },
  { word: 'rain', emoji: '🌧️', translation: 'גשם' },
  { word: 'milk', emoji: '🥛', translation: 'חלב' },
  { word: 'hand', emoji: '✋', translation: 'יד' },
];

function WordBuilderGame({ onComplete, onBack }) {
  const { uiLang } = useTheme();
  const { speak, speakSequence } = useSpeech();
  const [round, setRound] = useState(0);
  const [placed, setPlaced] = useState([]);
  const [available, setAvailable] = useState([]);
  const [wrongSlot, setWrongSlot] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [roundComplete, setRoundComplete] = useState(false);
  const speakRef = useRef(speak);
  speakRef.current = speak;
  const speakSeqRef = useRef(speakSequence);
  speakSeqRef.current = speakSequence;
  const instructionsGiven = useRef(false);

  const TOTAL_ROUNDS = 6;

  const words = useMemo(() => {
    return [...BUILDER_WORDS].sort(() => Math.random() - 0.5).slice(0, TOTAL_ROUNDS);
  }, []);

  const currentWord = words[round] || words[0];

  // Setup letters for current round
  useEffect(() => {
    if (round >= TOTAL_ROUNDS) {
      setGameOver(true);
      setShowConfetti(true);
      return;
    }
    const w = words[round];
    const letters = w.word.split('');
    // Add 2-3 extra random letters as distractors
    const extras = 'abcdefghijklmnopqrstuvwxyz'
      .split('')
      .filter(l => !letters.includes(l))
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(3, 6 - letters.length));

    const all = [...letters, ...extras].sort(() => Math.random() - 0.5).map((l, i) => ({
      id: i,
      letter: l,
      used: false,
    }));

    setAvailable(all);
    setPlaced([]);
    setRoundComplete(false);
    setWrongSlot(null);

    // Voice instructions on first round, then just say the word
    if (round === 0 && !instructionsGiven.current) {
      instructionsGiven.current = true;
      const t = setTimeout(() => {
        playSequence([
          { text: 'בונים מילה', lang: 'he' },
          { pause: 400 },
          { text: 'הקשיבו למילה', lang: 'he' },
          { pause: 350 },
          { text: 'ולחצו על האותיות', lang: 'he' },
          { pause: 300 },
          { text: 'בסדר הנכון', lang: 'he' },
          { pause: 600 },
          { text: w.word, lang: 'en-US', rate: 0.7 },
        ], speakRef.current);
      }, 400);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => speakRef.current(w.word, { rate: 0.7 }), 400);
      return () => clearTimeout(t);
    }
  }, [round, words]);

  const handleLetterTap = (letterObj) => {
    if (letterObj.used || roundComplete) return;

    const nextIndex = placed.length;
    const expectedLetter = currentWord.word[nextIndex];

    if (letterObj.letter === expectedLetter) {
      // Correct!
      speak(letterObj.letter, { rate: 0.8 });
      const newPlaced = [...placed, letterObj.letter];
      setPlaced(newPlaced);
      setAvailable(prev => prev.map(a => a.id === letterObj.id ? { ...a, used: true } : a));

      if (newPlaced.length === currentWord.word.length) {
        // Word complete!
        setRoundComplete(true);
        setScore(s => s + 1);
        setTimeout(() => {
          playSequence([
            { text: 'נכון!', lang: 'he' },
            { pause: 300 },
            { text: currentWord.word, lang: 'en-US', rate: 0.75 },
            { pause: 400 },
            { text: currentWord.translation, lang: 'he' },
          ], speak);
        }, 300);
      }
    } else {
      // Wrong letter
      setWrongSlot(nextIndex);
      setTimeout(() => setWrongSlot(null), 500);
    }
  };

  const handleNextRound = () => {
    if (round + 1 >= TOTAL_ROUNDS) {
      setGameOver(true);
      setShowConfetti(true);
    } else {
      setRound(r => r + 1);
    }
  };

  const handleReset = () => {
    setPlaced([]);
    setAvailable(prev => prev.map(a => ({ ...a, used: false })));
    setWrongSlot(null);
  };

  if (gameOver) {
    const xp = score * 4 + 5;
    return (
      <div className="kids-bg min-h-screen relative">
        <FloatingDecorations />
        <ConfettiBurst show={showConfetti} />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6">
          <div className="text-7xl mb-4 animate-jelly">🏗️</div>
          <h2 className="text-4xl font-black rainbow-text py-2 mb-2">
            {uiLang === 'he' ? '!בנאי מילים מעולה' : 'Word Builder Pro!'}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2 font-medium">
            {uiLang === 'he' ? `בנית ${score} מילים!` : `You built ${score} words!`}
          </p>
          <div className="flex gap-2 mb-6">
            {[...Array(TOTAL_ROUNDS)].map((_, i) => (
              <Star key={i} size={28} className={`${i < score ? 'text-yellow-400 fill-yellow-400 animate-pop-in' : 'text-gray-300'}`} style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl px-6 py-3 mb-6 shadow-lg">
            <div className="flex items-center gap-2">
              <Zap size={20} className="text-yellow-500" />
              <span className="text-lg font-bold text-yellow-600">+{xp} XP</span>
            </div>
          </div>
          <button onClick={() => onComplete(xp)} className="px-10 py-5 rounded-2xl font-black text-white text-xl bg-gradient-to-r from-orange-400 to-red-500 shadow-2xl active:scale-[0.97] transition-all">
            {uiLang === 'he' ? 'המשך' : 'Continue'} ✨
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="kids-bg min-h-screen pb-24 relative">
      <FloatingDecorations />
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <button onClick={onBack} className="text-gray-400 hover:text-gray-600 bg-white/50 dark:bg-gray-800/50 rounded-full p-2 backdrop-blur-sm">
            <ArrowLeft size={18} />
          </button>
          <div className="text-center">
            <h2 className="text-lg font-black text-gray-800 dark:text-white flex items-center gap-2">
              <span className="animate-wiggle inline-block">🏗️</span>
              {uiLang === 'he' ? 'בונה מילים' : 'Word Builder'}
            </h2>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full px-3 py-1.5">
            <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
              {round + 1}/{TOTAL_ROUNDS}
            </span>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mb-4 px-4">
          {[...Array(TOTAL_ROUNDS)].map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all duration-500 ${
              i < round ? 'w-2 bg-emerald-400' : i === round ? 'w-6 bg-gradient-to-r from-orange-400 to-red-400' : 'w-2 bg-gray-300 dark:bg-gray-600'
            }`} />
          ))}
        </div>

        {/* Word display: emoji + hint */}
        <div className="text-center mb-6 px-4">
          <button
            onClick={() => speak(currentWord.word, { rate: 0.7 })}
            className="inline-block"
          >
            <span className="text-7xl block mb-2 animate-jelly">{currentWord.emoji}</span>
          </button>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium" dir="rtl">
            {currentWord.translation}
          </p>
          <button
            onClick={() => speak(currentWord.word, { rate: 0.7 })}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full text-sm font-bold text-blue-500 active:scale-95 transition-transform"
          >
            <Volume2 size={16} /> {uiLang === 'he' ? 'השמע' : 'Listen'}
          </button>
        </div>

        {/* Letter slots - where placed letters go (dir=ltr to prevent RTL reversal) */}
        <div className="flex justify-center gap-2 mb-8 px-4" dir="ltr">
          {currentWord.word.split('').map((letter, i) => {
            const isPlaced = i < placed.length;
            const isNext = i === placed.length;
            const isWrong = wrongSlot === i;

            return (
              <div
                key={i}
                className={`w-14 h-16 rounded-2xl flex items-center justify-center text-2xl font-black transition-all duration-300 border-3 ${
                  isPlaced
                    ? 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-400 text-emerald-700 dark:text-emerald-300 animate-pop-in shadow-lg'
                    : isWrong
                      ? 'bg-red-100 dark:bg-red-900/40 border-red-400 animate-shake'
                      : isNext
                        ? 'bg-white/80 dark:bg-gray-800/80 border-blue-400 border-dashed shadow-md scale-105'
                        : 'bg-white/40 dark:bg-gray-800/40 border-gray-300 dark:border-gray-600 border-dashed'
                }`}
              >
                {isPlaced ? (
                  <span className="drop-shadow-sm">{placed[i]}</span>
                ) : isNext ? (
                  <span className="text-blue-300 text-lg animate-pulse">?</span>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Available letter blocks */}
        <div className="px-4" dir="ltr">
          <div className="flex flex-wrap justify-center gap-2.5">
            {available.map(letterObj => (
              <button
                key={letterObj.id}
                onClick={() => handleLetterTap(letterObj)}
                disabled={letterObj.used || roundComplete}
                className={`w-14 h-14 rounded-2xl text-xl font-black transition-all duration-200 border-2 ${
                  letterObj.used
                    ? 'opacity-20 scale-75 border-transparent bg-gray-200 dark:bg-gray-700'
                    : 'bg-gradient-to-br from-amber-300 to-orange-400 text-white border-amber-200 shadow-lg hover:scale-110 active:scale-90 active:shadow-sm'
                }`}
              >
                {letterObj.letter}
              </button>
            ))}
          </div>
        </div>

        {/* Reset button */}
        {placed.length > 0 && !roundComplete && (
          <div className="text-center mt-4">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full text-sm font-bold text-gray-500 active:scale-95 transition-transform"
            >
              <RotateCcw size={14} /> {uiLang === 'he' ? 'התחל מחדש' : 'Reset'}
            </button>
          </div>
        )}

        {/* Round complete overlay */}
        {roundComplete && (
          <div className="text-center mt-6 animate-pop-in">
            <div className="inline-block bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl px-8 py-6 shadow-2xl">
              <span className="text-5xl block mb-2">🎉</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mb-1">
                {uiLang === 'he' ? '!נכון' : 'Correct!'}
              </p>
              <p className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-1" dir="ltr">
                {currentWord.word} = {currentWord.emoji}
              </p>
              <p className="text-sm text-gray-500 mb-4" dir="rtl">{currentWord.translation}</p>
              <button
                onClick={handleNextRound}
                className="px-8 py-3 rounded-2xl font-black text-white bg-gradient-to-r from-emerald-400 to-green-500 shadow-lg active:scale-95 transition-all"
              >
                {round + 1 >= TOTAL_ROUNDS
                  ? (uiLang === 'he' ? 'סיים!' : 'Finish!')
                  : (uiLang === 'he' ? 'מילה הבאה' : 'Next Word')
                } →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   GAME SELECTOR - Choose which game to play
   ══════════════════════════════════════════════════════ */
const GAMES = [
  {
    id: 'bubble-pop',
    emoji: '🫧',
    titleHe: 'פוצץ בועות',
    titleEn: 'Bubble Pop ABCs',
    descHe: 'מצא את האות הנכונה!',
    descEn: 'Find the right letter!',
    gradient: 'from-cyan-400 via-blue-400 to-indigo-400',
    component: BubblePopGame,
  },
  {
    id: 'memory',
    emoji: '🧠',
    titleHe: 'משחק זיכרון',
    titleEn: 'Memory Match',
    descHe: 'התאם מילים לתמונות!',
    descEn: 'Match words to pictures!',
    gradient: 'from-purple-400 via-pink-400 to-rose-400',
    component: MemoryMatchGame,
  },
  {
    id: 'word-builder',
    emoji: '🏗️',
    titleHe: 'בונה מילים',
    titleEn: 'Word Builder',
    descHe: 'בנה מילים מאותיות!',
    descEn: 'Build words from letters!',
    gradient: 'from-orange-400 via-amber-400 to-yellow-400',
    component: WordBuilderGame,
  },
];

function GameSelector({ onSelectGame, onBack }) {
  const { uiLang } = useTheme();
  const [cardPops, setCardPops] = useState([]);

  useEffect(() => {
    const timers = GAMES.map((_, i) =>
      setTimeout(() => setCardPops(prev => [...prev, i]), 100 + i * 150)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="kids-bg min-h-screen pb-24 relative">
      <FloatingDecorations />
      <div className="relative z-10 px-4 pt-3">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="text-gray-400 hover:text-gray-600 bg-white/50 dark:bg-gray-800/50 rounded-full p-2 backdrop-blur-sm">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-2xl font-black rainbow-text py-1 flex-1 text-center">
            {uiLang === 'he' ? 'משחקי אותיות ומילים' : 'Letter & Word Games'}
          </h1>
          <div className="w-9" />
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
          {uiLang === 'he' ? 'בחר משחק וכיף!' : 'Pick a game and have fun!'}
        </p>

        {/* Game cards */}
        <div className="space-y-4">
          {GAMES.map((game, i) => (
            <button
              key={game.id}
              onClick={() => onSelectGame(game)}
              className={`w-full rounded-3xl overflow-hidden active:scale-[0.97] transition-all duration-300 shadow-xl ${
                cardPops.includes(i) ? 'animate-pop-in' : 'opacity-0 scale-0'
              }`}
            >
              <div className={`bg-gradient-to-r ${game.gradient} p-6 relative overflow-hidden`}>
                {/* Decorative circles */}
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10" />
                <div className="absolute top-1/2 right-1/4 w-8 h-8 rounded-full bg-white/5" />

                <div className="relative flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/25 flex items-center justify-center text-4xl shrink-0">
                    {game.emoji}
                  </div>
                  <div className="flex-1 text-left" dir={uiLang === 'he' ? 'rtl' : 'ltr'}>
                    <h3 className="text-xl font-black text-white drop-shadow-md">
                      {uiLang === 'he' ? game.titleHe : game.titleEn}
                    </h3>
                    <p className="text-sm text-white/80 font-medium mt-0.5">
                      {uiLang === 'he' ? game.descHe : game.descEn}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/25 flex items-center justify-center shrink-0">
                    <span className="text-white text-xl">▸</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   KIDS GAMES PAGE - Main orchestrator
   ══════════════════════════════════════════════════════ */
export default function KidsGamesPage({ onBack }) {
  const { addXP } = useUserProgress();
  const [selectedGame, setSelectedGame] = useState(null);

  const handleComplete = async (xp) => {
    if (xp > 0) await addXP(xp, 'kids-game');
    setSelectedGame(null);
  };

  const handleGameBack = () => setSelectedGame(null);

  if (selectedGame) {
    const GameComponent = selectedGame.component;
    return <GameComponent onComplete={handleComplete} onBack={handleGameBack} />;
  }

  return <GameSelector onSelectGame={setSelectedGame} onBack={onBack} />;
}
