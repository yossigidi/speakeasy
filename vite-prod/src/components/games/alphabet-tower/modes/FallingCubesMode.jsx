import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import LetterCube from '../components/LetterCube.jsx';
import { generateRound, MODE_CONFIGS } from '../data/alphabet-tower-data.js';
import { playSequence, playFromAPI, stopAllAudio } from '../../../../utils/hebrewAudio.js';
import { playCorrect, playWrong, playPop, playStar, playComplete } from '../../../../utils/gameSounds.js';
import SpeakliTeacher from '../components/SpeakliTeacher.jsx';
import { ConfettiBurst, FloatingElements } from '../components/GameEffects.jsx';
import { ArrowLeft } from 'lucide-react';

const CUBE_COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];
const TOTAL_ROUNDS = MODE_CONFIGS.fallingCubes.roundsPerGame;
const STARS_PER_ROUND = MODE_CONFIGS.fallingCubes.starsPerRound;
const BONUS_STARS = MODE_CONFIGS.fallingCubes.bonusStars;

const GUIDE = {
  he: '\u05EA\u05E4\u05E1\u05D5 \u05D0\u05EA \u05D4\u05D0\u05D5\u05EA \u05D4\u05E0\u05DB\u05D5\u05E0\u05D4!',
  ar: '\u0627\u0644\u062A\u0642\u0637\u0648\u0627 \u0627\u0644\u062D\u0631\u0641 \u0627\u0644\u0635\u062D\u064A\u062D!',
  ru: '\u041F\u043E\u0439\u043C\u0430\u0439\u0442\u0435 \u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0443\u044E \u0431\u0443\u043A\u0432\u0443!',
  en: 'Catch the correct letter!',
};

const ENCOURAGEMENT = {
  he: ['יופי!', 'מצוין!', 'כל הכבוד!', 'נהדר!', 'סופר!'],
  ar: ['رائع!', 'ممتاز!', 'أحسنت!', 'مذهل!', 'سوبر!'],
  ru: ['Отлично!', 'Молодец!', 'Замечательно!', 'Супер!', 'Класс!'],
  en: ['Great!', 'Excellent!', 'Well done!', 'Amazing!', 'Super!'],
};

const FIND_LETTER = {
  he: 'מצאו את האות',
  ar: 'جدوا الحرف',
  ru: 'Найдите букву',
  en: 'Find the letter',
};

const MISSED_LETTER = {
  he: 'אופס! האות הייתה',
  ar: 'أوه! الحرف كان',
  ru: 'Ой! Буква была',
  en: 'Oops! The letter was',
};

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * FallingCubesMode - Tap the correct falling letter cube.
 *
 * 4 cubes fall from the top at different speeds.
 * The kid must tap the one matching the target letter before it reaches the bottom.
 */
const FallingCubesMode = React.memo(function FallingCubesMode({
  difficulty,
  onRoundComplete,
  onGameComplete,
  onBack,
  uiLang,
}) {
  const [round, setRound] = useState(1);
  const [roundData, setRoundData] = useState(null);
  const [fallingCubes, setFallingCubes] = useState([]); // [{ id, letter, color, left, duration, state }]
  const [stars, setStars] = useState(0);
  const [frozen, setFrozen] = useState(false);
  const [roundActive, setRoundActive] = useState(false);
  const [showResult, setShowResult] = useState(null); // 'correct' | 'miss' | null
  const [tappedCubeId, setTappedCubeId] = useState(null);
  const [teacherPose, setTeacherPose] = useState('happy');
  const [showConfetti, setShowConfetti] = useState(false);

  const timersRef = useRef([]);
  const abortRef = useRef(null);
  const animEndCountRef = useRef(0);
  const roundActiveRef = useRef(false);
  const isRTL = uiLang === 'he' || uiLang === 'ar';

  // Keep ref in sync
  useEffect(() => {
    roundActiveRef.current = roundActive;
  }, [roundActive]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // Generate positions for cubes - spread across width
  const generatePositions = useCallback(() => {
    const positions = [];
    const slotWidth = 100 / 4;
    for (let i = 0; i < 4; i++) {
      const base = i * slotWidth;
      const offset = 4 + Math.random() * (slotWidth - 20);
      positions.push(Math.max(2, Math.min(78, base + offset)));
    }
    return positions;
  }, []);

  // Init a round
  const initRound = useCallback((roundNum) => {
    const data = generateRound('fallingCubes', difficulty);
    setRoundData(data);
    setShowResult(null);
    setTappedCubeId(null);
    setFrozen(false);
    animEndCountRef.current = 0;

    const positions = generatePositions();
    const cubes = data.allOptions.map((letter, i) => ({
      id: `falling-${roundNum}-${i}`,
      letter,
      color: CUBE_COLORS[i % CUBE_COLORS.length],
      left: positions[i],
      duration: 8 + Math.random() * 4, // 8s - 12s (slow enough for kids)
      state: 'falling', // 'falling' | 'correct' | 'wrong' | 'gone'
    }));

    setFallingCubes(cubes);
    setTeacherPose('happy');

    // Start falling after a short delay for the announcement
    const t1 = setTimeout(() => {
      setRoundActive(true);
    }, 800);
    timersRef.current.push(t1);

    // Speak "Find the letter [X]!" in uiLang, then say the letter in English
    stopAllAudio();
    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    const t2 = setTimeout(async () => {
      try {
        const findText = (FIND_LETTER[uiLang] || FIND_LETTER.en) + ' ' + data.target + '!';
        await playSequence([
          { text: findText, lang: uiLang },
          { pause: 300 },
          { text: data.target, lang: 'en-US' },
        ]);
      } catch {
        // ignore
      }
    }, 200);
    timersRef.current.push(t2);
  }, [difficulty, generatePositions]);

  // Start first round
  useEffect(() => {
    initRound(1);
  }, [initRound]);

  // Handle cube falling off screen (animation end)
  const handleAnimationEnd = useCallback((cubeId) => {
    if (!roundActiveRef.current) return;

    // Check if this is the target cube that fell without being tapped
    setFallingCubes((prev) => {
      const cube = prev.find((c) => c.id === cubeId);
      if (!cube || cube.state !== 'falling') return prev;

      // Mark as gone
      const updated = prev.map((c) =>
        c.id === cubeId ? { ...c, state: 'gone' } : c
      );

      // Check if target fell
      if (cube.letter === (roundDataRef.current?.target || '')) {
        // Target missed
        handleMissRef.current();
      }

      return updated;
    });
  }, []);

  // Refs for callbacks used in animation end
  const roundDataRef = useRef(null);
  useEffect(() => {
    roundDataRef.current = roundData;
  }, [roundData]);

  const advanceRound = useCallback((wasCorrect) => {
    setRoundActive(false);
    const t = setTimeout(() => {
      setShowResult(null);
      if (round >= TOTAL_ROUNDS) {
        // Only celebrate if player earned at least 1 star
        const finalStars = stars + (wasCorrect ? STARS_PER_ROUND : 0);
        if (finalStars > 0) {
          playComplete();
          if (onGameComplete) onGameComplete(finalStars + BONUS_STARS);
        } else {
          // No stars at all — still end the game but no bonus
          if (onGameComplete) onGameComplete(0);
        }
      } else {
        const nextRound = round + 1;
        setRound(nextRound);
        initRound(nextRound);
      }
    }, 1500);
    timersRef.current.push(t);
  }, [round, stars, onGameComplete, initRound]);

  // Handle miss (target fell off screen)
  const handleMiss = useCallback(() => {
    if (!roundActiveRef.current) return;
    setRoundActive(false);
    setShowResult('miss');
    setTeacherPose('sad');
    playWrong();

    // Say "Oops! The letter was [X]" in uiLang
    try {
      stopAllAudio();
      const target = roundDataRef.current?.target || '';
      const missText = (MISSED_LETTER[uiLang] || MISSED_LETTER.en) + ' ' + target;
      playSequence([
        { text: missText, lang: uiLang },
        { pause: 200 },
        { text: target, lang: 'en-US' },
      ]);
    } catch { /* */ }

    advanceRound(false);
  }, [advanceRound, uiLang]);

  const handleMissRef = useRef(handleMiss);
  useEffect(() => {
    handleMissRef.current = handleMiss;
  }, [handleMiss]);

  // Handle cube tap
  const handleCubeTap = useCallback((cubeId, letter) => {
    if (!roundActive || frozen) return;

    const target = roundData?.target;
    if (!target) return;

    setTappedCubeId(cubeId);

    if (letter === target) {
      // Correct!
      setRoundActive(false);
      setFrozen(true);
      playPop();
      setTeacherPose('clap');

      setFallingCubes((prev) =>
        prev.map((c) =>
          c.id === cubeId ? { ...c, state: 'correct' } : c
        )
      );

      const earned = STARS_PER_ROUND;
      setStars((prev) => prev + earned);
      setShowResult('correct');
      setShowConfetti(true);
      const t0 = setTimeout(() => setShowConfetti(false), 2000);
      timersRef.current.push(t0);

      // Say the letter + encouragement
      try {
        stopAllAudio();
        const enc = pickRandom(ENCOURAGEMENT[uiLang] || ENCOURAGEMENT.en);
        playSequence([
          { text: letter, lang: 'en-US' },
          { pause: 200 },
          { text: enc, lang: uiLang },
        ]);
      } catch { /* */ }

      const t1 = setTimeout(() => {
        playCorrect();
        playStar();
      }, 200);
      timersRef.current.push(t1);

      if (onRoundComplete) onRoundComplete(earned);
      advanceRound(true);
    } else {
      // Wrong tap
      playWrong();
      setFrozen(true);

      setFallingCubes((prev) =>
        prev.map((c) =>
          c.id === cubeId ? { ...c, state: 'wrong' } : c
        )
      );

      // Brief freeze, then resume
      const t = setTimeout(() => {
        setFrozen(false);
        setTappedCubeId(null);
        setFallingCubes((prev) =>
          prev.map((c) =>
            c.id === cubeId ? { ...c, state: 'falling' } : c
          )
        );
      }, 500);
      timersRef.current.push(t);
    }
  }, [roundActive, frozen, roundData, advanceRound, onRoundComplete, uiLang]);

  if (!roundData) return null;

  const dir = isRTL ? 'rtl' : 'ltr';

  return (
    <div
      className="falling-cubes-mode"
      dir={dir}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minHeight: '100dvh',
        position: 'relative',
        overflow: 'hidden',
        padding: '12px 8px env(safe-area-inset-bottom, 8px)',
      }}
    >
      {/* ── Background image ── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url(/images/games/bg-falling-cubes.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.4,
        borderRadius: 16,
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <FloatingElements type="bubbles" count={5} />
      <ConfettiBurst active={showConfetti} count={20} />

      {/* ── Back button ── */}
      {onBack && (
        <button onClick={onBack} style={{ position: 'absolute', top: 12, [dir === 'rtl' ? 'right' : 'left']: 12, background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: 12, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 50, transform: dir === 'rtl' ? 'scaleX(-1)' : 'none' }} aria-label="Back">
          <ArrowLeft size={20} color="#475569" />
        </button>
      )}

      {/* Top bar: progress + score */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 8,
        zIndex: 10,
      }}>
        {/* Progress bar */}
        <div style={{
          flex: 1,
          maxWidth: 200,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <div style={{
            flex: 1,
            height: 8,
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 4,
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${((round - 1) / TOTAL_ROUNDS) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
              borderRadius: 4,
              transition: 'width 0.4s ease',
            }} />
          </div>
          <span style={{
            fontSize: 13,
            fontWeight: 700,
            color: '#fff',
            minWidth: 40,
            textAlign: 'center',
          }}>
            {round}/{TOTAL_ROUNDS}
          </span>
        </div>

        {/* Score */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          background: 'rgba(0,0,0,0.25)',
          borderRadius: 20,
          padding: '4px 12px',
        }}>
          <span style={{ fontSize: 16 }}>{'⭐'}</span>
          <span style={{
            fontSize: 16,
            fontWeight: 800,
            color: '#fbbf24',
            fontFamily: "'Fredoka', sans-serif",
          }}>
            {stars}
          </span>
        </div>
      </div>

      {/* Teacher character */}
      <SpeakliTeacher
        pose={teacherPose}
        size="sm"
        isRTL={isRTL}
        style={{ marginBottom: 4, zIndex: 10 }}
      />

      {/* Target letter display */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: '8px 16px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        alignSelf: 'center',
        marginBottom: 8,
        zIndex: 10,
      }}>
        <span style={{
          fontSize: 16,
          fontWeight: 600,
          color: '#e2e8f0',
          fontFamily: "'Fredoka', 'Heebo', sans-serif",
        }}>
          {uiLang === 'he' ? ':מצאו' : uiLang === 'ar' ? ':جدوا' : uiLang === 'ru' ? 'Найди:' : 'Find:'}
        </span>
        <span style={{
          fontSize: 44,
          fontWeight: 900,
          color: '#fbbf24',
          textShadow: '0 2px 8px rgba(251,191,36,0.5), 0 0 20px rgba(251,191,36,0.3)',
          fontFamily: "'Fredoka', sans-serif",
          lineHeight: 1,
        }}>
          {roundData.target}
        </span>
      </div>

      {/* Falling area */}
      <div style={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        height: 'calc(100vh - 200px)',
      }}>
        {roundActive && fallingCubes.map((cube) => {
          if (cube.state === 'gone') return null;

          const isCorrectTap = cube.state === 'correct';
          const isWrongTap = cube.state === 'wrong';

          return (
            <div
              key={cube.id}
              className={
                isCorrectTap
                  ? ''
                  : isWrongTap
                    ? 'cube-wrong'
                    : 'falling-cube'
              }
              style={{
                position: 'absolute',
                left: `${cube.left}%`,
                top: 0,
                animationDuration: isCorrectTap || isWrongTap ? undefined : `${cube.duration}s`,
                animationTimingFunction: 'linear',
                animationFillMode: 'forwards',
                animationPlayState: frozen && !isCorrectTap && !isWrongTap ? 'paused' : 'running',
                zIndex: isCorrectTap ? 20 : 5,
                ...(isCorrectTap ? {
                  animation: 'cube-place 0.5s ease-out forwards',
                  transform: 'scale(1.3)',
                  opacity: 1,
                } : {}),
              }}
              onAnimationEnd={() => {
                if (!isCorrectTap && !isWrongTap) {
                  handleAnimationEnd(cube.id);
                }
              }}
              onClick={() => handleCubeTap(cube.id, cube.letter)}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleCubeTap(cube.id, cube.letter);
              }}
            >
              <LetterCube
                letter={cube.letter}
                size={62}
                color={isWrongTap ? '#ef4444' : cube.color}
                isWrong={isWrongTap}
                isPlaced={isCorrectTap}
                className={isCorrectTap ? '' : isWrongTap ? '' : 'cube-idle'}
                style={{ pointerEvents: 'auto', cursor: 'pointer' }}
              />
              {/* Star burst on correct */}
              {isCorrectTap && (
                <div style={{
                  position: 'absolute',
                  inset: -20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}>
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      style={{
                        position: 'absolute',
                        fontSize: 18 + Math.random() * 10,
                        transform: `rotate(${i * 72}deg) translateY(-${24 + Math.random() * 16}px)`,
                        animation: `cube-place ${0.3 + i * 0.08}s ease-out`,
                        opacity: 0.9,
                      }}
                    >
                      {'⭐'}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Miss indicator */}
        {showResult === 'miss' && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 30,
          }}>
            <div style={{
              fontSize: 28,
              fontWeight: 800,
              color: '#fca5a5',
              textShadow: '0 2px 8px rgba(0,0,0,0.4)',
              animation: 'cube-place 0.5s ease-out',
              fontFamily: "'Fredoka', 'Heebo', sans-serif",
            }}>
              {uiLang === 'he' ? '!פספוס' : uiLang === 'ar' ? '!فات الحرف' : uiLang === 'ru' ? 'Упустил!' : 'Missed!'}
            </div>
          </div>
        )}

        {/* Correct result */}
        {showResult === 'correct' && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 30,
          }}>
            <div style={{
              fontSize: 48,
              animation: 'cube-place 0.5s ease-out',
            }}>
              {'🌟'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default FallingCubesMode;
