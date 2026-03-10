import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import LetterCube from '../components/LetterCube.jsx';
import useDragAndDrop from '../hooks/useDragAndDrop.js';
import { generateRound, MODE_CONFIGS } from '../data/alphabet-tower-data.js';
import { playFromAPI, playSequence, stopAllAudio } from '../../../../utils/hebrewAudio.js';
import { playCorrect, playWrong, playStar, playPop, playComplete } from '../../../../utils/gameSounds.js';
import { ArrowLeft, Volume2 } from 'lucide-react';

const CUBE_COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];
const TOTAL_ROUNDS = MODE_CONFIGS.wordBuilder.roundsPerGame;
const STARS_PER_ROUND = MODE_CONFIGS.wordBuilder.starsPerRound;
const BONUS_STARS = MODE_CONFIGS.wordBuilder.bonusStars;

const GUIDE = {
  he: 'בנו את המילה מהאותיות!',
  ar: 'ابنوا الكلمة من الحروف!',
  ru: 'Составьте слово из букв!',
  en: 'Build the word from the letters!',
};

const ENCOURAGEMENT = {
  he: ['יופי!', 'מצוין!', 'כל הכבוד!', 'נהדר!', 'סופר!'],
  ar: ['رائع!', 'ممتاز!', 'أحسنت!', 'مذهل!', 'سوبر!'],
  ru: ['Отлично!', 'Молодец!', 'Замечательно!', 'Супер!', 'Класс!'],
  en: ['Great!', 'Excellent!', 'Well done!', 'Amazing!', 'Super!'],
};

const WORD_COMPLETE = {
  he: 'כל הכבוד! בניתם את המילה',
  ar: 'أحسنتم! بنيتم الكلمة',
  ru: 'Молодцы! Вы составили слово',
  en: 'Well done! You built the word',
};

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const WordBuilderCubeMode = React.memo(function WordBuilderCubeMode({
  difficulty,
  onRoundComplete,
  onGameComplete,
  onBack,
  uiLang,
}) {
  const [round, setRound] = useState(1);
  const [roundData, setRoundData] = useState(null);
  const [placedLetters, setPlacedLetters] = useState({}); // { zoneIndex: { letter, cubeId } }
  const [poolCubes, setPoolCubes] = useState([]); // [{ id, letter, color }]
  const [wrongZone, setWrongZone] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [roundComplete, setRoundComplete] = useState(false);
  const [stars, setStars] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const timersRef = useRef([]);
  const abortRef = useRef(null);
  const isRTL = uiLang === 'he' || uiLang === 'ar';

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // Hear the word again (word + spell letters + translation)
  const hearAgain = useCallback(() => {
    if (!roundData) return;
    stopAllAudio();
    const seq = [
      { text: roundData.answer, lang: 'en-US' },
      { pause: 400 },
    ];
    // Spell out each letter
    for (const letter of roundData.answer.split('')) {
      seq.push({ text: letter.toUpperCase(), lang: 'en-US' });
      seq.push({ pause: 250 });
    }
    seq.push({ pause: 200 });
    if (roundData.translations && roundData.translations[uiLang]) {
      seq.push({ text: roundData.translations[uiLang], lang: uiLang });
    }
    playSequence(seq);
  }, [roundData, uiLang]);

  // Generate round data
  const initRound = useCallback((roundNum) => {
    const data = generateRound('wordBuilder', difficulty);
    setRoundData(data);
    setPlacedLetters({});
    setRoundComplete(false);
    setShowCelebration(false);
    setWrongZone(null);
    setIsAnimating(false);

    // Build pool cubes from scrambled letters
    const cubes = data.scrambled.map((letter, i) => ({
      id: `cube-${roundNum}-${i}`,
      letter,
      color: CUBE_COLORS[i % CUBE_COLORS.length],
    }));
    setPoolCubes(cubes);

    // Speak guidance + word + spell letters + translation (like a private tutor)
    stopAllAudio();
    const seq = [];
    // On first round, speak the full guide instruction
    if (roundNum === 1) {
      seq.push({ text: GUIDE[uiLang] || GUIDE.en, lang: uiLang });
      seq.push({ pause: 400 });
    }
    // Speak the word
    seq.push({ text: data.answer, lang: 'en-US' });
    seq.push({ pause: 400 });
    // Spell out each letter
    for (const letter of data.answer.split('')) {
      seq.push({ text: letter.toUpperCase(), lang: 'en-US' });
      seq.push({ pause: 250 });
    }
    seq.push({ pause: 200 });
    // Speak translation
    if (data.translations && data.translations[uiLang]) {
      seq.push({ text: data.translations[uiLang], lang: uiLang });
    }
    const t = setTimeout(() => {
      playSequence(seq);
    }, 400);
    timersRef.current.push(t);
  }, [difficulty, uiLang]);

  // Start first round
  useEffect(() => {
    initRound(1);
  }, [initRound]);

  // Answer letters array
  const answerLetters = useMemo(() => {
    if (!roundData) return [];
    return roundData.answer.split('');
  }, [roundData]);

  // Handle drop
  const handleDrop = useCallback((itemId, zoneId) => {
    if (isAnimating || roundComplete) return;

    const zoneIndex = parseInt(zoneId.replace('zone-', ''), 10);
    const cube = poolCubes.find((c) => c.id === itemId);
    if (!cube) return;

    // Check if correct letter for this position
    const correctLetter = answerLetters[zoneIndex];
    if (cube.letter.toLowerCase() === correctLetter.toLowerCase()) {
      // Correct placement
      playPop();
      setIsAnimating(true);
      setPlacedLetters((prev) => ({
        ...prev,
        [zoneIndex]: { letter: cube.letter, cubeId: cube.id, color: cube.color },
      }));
      // Remove from pool
      setPoolCubes((prev) => prev.filter((c) => c.id !== cube.id));

      const t = setTimeout(() => {
        playCorrect();
        // Speak the letter with encouragement
        playSequence([
          { text: cube.letter.toUpperCase(), lang: 'en-US' },
          { pause: 200 },
          { text: pickRandom(ENCOURAGEMENT[uiLang] || ENCOURAGEMENT.en), lang: uiLang },
        ]);
        setIsAnimating(false);
      }, 300);
      timersRef.current.push(t);
    } else {
      // Wrong placement
      playWrong();
      setWrongZone(zoneIndex);
      setIsAnimating(true);
      const t = setTimeout(() => {
        setWrongZone(null);
        setIsAnimating(false);
      }, 500);
      timersRef.current.push(t);
    }
  }, [isAnimating, roundComplete, poolCubes, answerLetters]);

  const handleMiss = useCallback(() => {
    // Cube returns to pool - no action needed since we only remove on correct drop
  }, []);

  const { dragHandlers, activeDrag, dropZoneRef } = useDragAndDrop({
    onDrop: handleDrop,
    onMiss: handleMiss,
    enabled: !isAnimating && !roundComplete,
  });

  // Check for round completion
  useEffect(() => {
    if (!roundData || roundComplete) return;
    const totalSlots = answerLetters.length;
    const filledSlots = Object.keys(placedLetters).length;

    if (filledSlots === totalSlots) {
      setRoundComplete(true);
      setShowCelebration(true);
      const earned = STARS_PER_ROUND;
      setStars((prev) => prev + earned);

      // Play celebration
      const t1 = setTimeout(() => playStar(), 200);
      const t2 = setTimeout(() => playComplete(), 600);
      timersRef.current.push(t1, t2);

      // Speak celebration: "Well done! You built the word CAT — חתול!"
      const celebSeq = [
        { text: WORD_COMPLETE[uiLang] || WORD_COMPLETE.en, lang: uiLang },
        { pause: 300 },
        { text: roundData.answer, lang: 'en-US' },
        { pause: 300 },
      ];
      if (roundData.translations && roundData.translations[uiLang]) {
        celebSeq.push({ text: roundData.translations[uiLang], lang: uiLang });
      }
      const t3 = setTimeout(() => playSequence(celebSeq), 800);
      timersRef.current.push(t3);

      if (onRoundComplete) onRoundComplete(earned);

      // Move to next round or complete game
      const t4 = setTimeout(() => {
        setShowCelebration(false);
        if (round >= TOTAL_ROUNDS) {
          const totalStars = stars + earned;
          if (onGameComplete) onGameComplete(totalStars + BONUS_STARS);
        } else {
          const nextRound = round + 1;
          setRound(nextRound);
          initRound(nextRound);
        }
      }, 2500);
      timersRef.current.push(t4);
    }
  }, [placedLetters, roundData, answerLetters, roundComplete, round, stars, uiLang, onRoundComplete, onGameComplete, initRound]);

  // Dragged cube for overlay
  const draggedCube = activeDrag ? poolCubes.find((c) => c.id === activeDrag.id) : null;

  if (!roundData) return null;

  const translation = roundData.translations?.[uiLang] || '';
  const emoji = roundData.hint || '';
  const dir = isRTL ? 'rtl' : 'ltr';

  return (
    <div
      className="word-builder-mode"
      dir={dir}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        padding: '12px 8px',
        gap: 8,
      }}
    >
      {/* ── Back button ── */}
      {onBack && (
        <button onClick={onBack} style={{ position: 'absolute', top: 12, [dir === 'rtl' ? 'right' : 'left']: 12, background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: 12, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 50, transform: dir === 'rtl' ? 'scaleX(-1)' : 'none' }} aria-label="Back">
          <ArrowLeft size={20} color="#475569" />
        </button>
      )}

      {/* Progress bar */}
      <div style={{
        width: '100%',
        maxWidth: 340,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
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
            background: 'linear-gradient(90deg, #22c55e, #16a34a)',
            borderRadius: 4,
            transition: 'width 0.4s ease',
          }} />
        </div>
        <span style={{
          fontSize: 13,
          fontWeight: 700,
          color: '#fff',
          textShadow: '0 1px 3px rgba(0,0,0,0.3)',
          minWidth: 40,
          textAlign: 'center',
        }}>
          {round}/{TOTAL_ROUNDS}
        </span>
        <span style={{ fontSize: 14 }}>{'⭐'.repeat(Math.min(stars, 5))}</span>
      </div>

      {/* Teacher guidance */}
      <div style={{
        fontSize: 14,
        color: '#e2e8f0',
        fontWeight: 500,
        textAlign: 'center',
        opacity: 0.85,
      }}>
        {GUIDE[uiLang] || GUIDE.en}
      </div>

      {/* Emoji + translation + hear again button */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
      }}>
        {emoji && <span style={{ fontSize: '4.5rem', lineHeight: 1.1 }}>{emoji}</span>}
        {translation && (
          <span style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#fbbf24',
            textShadow: '0 2px 6px rgba(0,0,0,0.3)',
            fontFamily: "'Fredoka', 'Heebo', sans-serif",
          }}>
            {translation}
          </span>
        )}
        {/* Hear again button */}
        <button
          onClick={hearAgain}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 6,
            padding: '8px 18px',
            background: 'rgba(255,255,255,0.15)',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: 20,
            color: '#fff',
            fontSize: 14,
            fontWeight: 700,
            fontFamily: "'Fredoka', 'Heebo', sans-serif",
            cursor: 'pointer',
          }}
          aria-label="Hear again"
        >
          <Volume2 size={18} />
          {uiLang === 'he' ? 'שמע שוב' : uiLang === 'ar' ? 'استمع مرة أخرى' : uiLang === 'ru' ? 'Послушать снова' : 'Hear again'}
        </button>
      </div>

      {/* Drop zones */}
      <div style={{
        display: 'flex',
        gap: 8,
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginTop: 12,
        minHeight: 80,
      }}>
        {answerLetters.map((letter, i) => {
          const placed = placedLetters[i];
          const isWrong = wrongZone === i;
          return (
            <div
              key={`zone-${i}`}
              ref={(el) => dropZoneRef(`zone-${i}`, el)}
              style={{
                width: 64,
                height: 72,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 12,
                border: placed
                  ? '2px solid transparent'
                  : isWrong
                    ? '2.5px solid #ef4444'
                    : '2.5px dashed rgba(255,255,255,0.35)',
                background: placed
                  ? 'transparent'
                  : 'rgba(255,255,255,0.06)',
                transition: 'border-color 0.3s, background 0.3s',
                position: 'relative',
              }}
            >
              {placed ? (
                <LetterCube
                  letter={placed.letter}
                  size={48}
                  color={placed.color}
                  isPlaced
                />
              ) : (
                <LetterCube
                  letter={letter}
                  size={48}
                  isGhost
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Scrambled cubes pool */}
      <div style={{
        display: 'flex',
        gap: 12,
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginTop: 20,
        minHeight: 80,
      }}>
        {poolCubes.map((cube) => {
          const isBeingDragged = activeDrag?.id === cube.id;
          return (
            <div key={cube.id} style={{ opacity: isBeingDragged ? 0.3 : 1, transition: 'opacity 0.15s' }}>
              <LetterCube
                letter={cube.letter}
                size={52}
                color={cube.color}
                isDragging={false}
                onPointerDown={(e) => dragHandlers.onPointerDown(e, cube.id)}
              />
            </div>
          );
        })}
      </div>

      {/* Drag overlay */}
      {activeDrag && draggedCube && (
        <div
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            transform: `translate(${activeDrag.x - 42}px, ${activeDrag.y - 48}px)`,
            pointerEvents: 'none',
            zIndex: 100,
          }}
        >
          <LetterCube
            letter={draggedCube.letter}
            size={52}
            color={draggedCube.color}
            isDragging
          />
        </div>
      )}

      {/* Celebration overlay */}
      {showCelebration && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 60,
        }}>
          <div style={{
            fontSize: '3rem',
            animation: 'cube-place 0.6s ease-out',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '4rem', marginBottom: 4 }}>{'🌟'}</div>
            <div style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#fff',
              textShadow: '0 2px 8px rgba(0,0,0,0.4)',
              fontFamily: "'Fredoka', 'Heebo', sans-serif",
            }}>
              {roundData.answer.toUpperCase()}
            </div>
          </div>
          {/* Confetti-like stars */}
          {[...Array(8)].map((_, i) => (
            <span
              key={i}
              style={{
                position: 'absolute',
                fontSize: 20 + Math.random() * 14,
                left: `${15 + Math.random() * 70}%`,
                top: `${10 + Math.random() * 70}%`,
                animation: `cube-place ${0.4 + Math.random() * 0.5}s ease-out ${i * 0.06}s`,
                opacity: 0.9,
              }}
            >
              {['⭐', '✨', '🎉', '💫'][i % 4]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
});

export default WordBuilderCubeMode;
