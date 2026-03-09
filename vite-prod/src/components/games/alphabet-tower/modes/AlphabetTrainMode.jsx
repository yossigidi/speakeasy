import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import LetterCube from '../components/LetterCube.jsx';
import useDragAndDrop from '../hooks/useDragAndDrop.js';
import { generateRound, MODE_CONFIGS } from '../data/alphabet-tower-data.js';
import { playSequence, playFromAPI, stopAllAudio } from '../../../../utils/hebrewAudio.js';
import { playCorrect, playWrong, playStar, playComplete } from '../../../../utils/gameSounds.js';

const CUBE_COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];

const GUIDE = {
  he: 'השלימו את הרכבת!',
  ar: 'أكملوا القطار!',
  ru: 'Дополните поезд!',
  en: 'Complete the train!',
};

const TOTAL_ROUNDS = MODE_CONFIGS.alphabetTrain.roundsPerGame; // 5

const AlphabetTrainMode = React.memo(function AlphabetTrainMode({
  difficulty,
  onRoundComplete,
  onGameComplete,
  uiLang,
}) {
  // ─── state ──────────────────────────────────────────────────────────
  const [currentRound, setCurrentRound] = useState(0);
  const [roundData, setRoundData] = useState(() => generateRound('alphabetTrain', difficulty));
  const [filledBlanks, setFilledBlanks] = useState({}); // { blankIndex: letter }
  const [isAnimating, setIsAnimating] = useState(false);
  const [wrongZone, setWrongZone] = useState(null);
  const [wrongCube, setWrongCube] = useState(null);
  const [justPlaced, setJustPlaced] = useState(null);
  const [starBurst, setStarBurst] = useState(null);
  const [showRoundStars, setShowRoundStars] = useState(false);
  const [trainMoving, setTrainMoving] = useState(false);
  const [showSmoke, setShowSmoke] = useState(false);
  const [showWhistle, setShowWhistle] = useState(false);
  const [totalStars, setTotalStars] = useState(0);

  const timersRef = useRef([]);
  const isRTL = uiLang === 'he' || uiLang === 'ar';

  // ─── timer helpers ──────────────────────────────────────────────────
  const addTimer = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  // ─── cleanup ────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      clearTimers();
      stopAllAudio();
    };
  }, [clearTimers]);

  // ─── speak on round start ──────────────────────────────────────────
  useEffect(() => {
    try {
      playSequence([GUIDE[uiLang] || GUIDE.en], uiLang);
    } catch { /* ignore */ }
  }, [currentRound, uiLang]);

  // ─── derive data ───────────────────────────────────────────────────
  const display = useMemo(() => roundData.display, [roundData]);
  const answers = useMemo(() => roundData.answers, [roundData]);
  const blanks = useMemo(() => roundData.blanks, [roundData]);

  // Build available letters: the correct answers + some distractors
  const availableLetters = useMemo(() => {
    const pool = [...answers];
    // Add 2 distractors from display that aren't answers
    const nonBlanks = display.filter((l) => l !== '_');
    const shuffled = [...nonBlanks].sort(() => Math.random() - 0.5);
    for (const letter of shuffled) {
      if (!pool.includes(letter) && pool.length < answers.length + 2) {
        pool.push(letter);
      }
    }
    // If we still need more, add random letters
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    for (const letter of alphabet.sort(() => Math.random() - 0.5)) {
      if (!pool.includes(letter) && pool.length < answers.length + 2) {
        pool.push(letter);
      }
    }
    return pool.sort(() => Math.random() - 0.5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundData]);

  const [availableCubes, setAvailableCubes] = useState([]);

  // Reset available cubes when round data changes
  useEffect(() => {
    setAvailableCubes(
      availableLetters.map((l, i) => ({ id: `cube-${currentRound}-${i}`, letter: l }))
    );
  }, [availableLetters, currentRound]);

  // ─── check round complete ──────────────────────────────────────────
  const checkAllFilled = useCallback(
    (nextFilled) => {
      if (Object.keys(nextFilled).length === blanks.length) {
        setIsAnimating(true);

        // Train completion sequence
        addTimer(() => setShowWhistle(true), 500);
        addTimer(() => setShowSmoke(true), 600);
        addTimer(() => setTrainMoving(true), 800);
        addTimer(() => setShowRoundStars(true), 900);
        try { playComplete(); } catch { /* */ }

        const stars = MODE_CONFIGS.alphabetTrain.starsPerRound;
        const newTotal = totalStars + stars;
        setTotalStars(newTotal);

        addTimer(() => {
          setShowRoundStars(false);
          setTrainMoving(false);
          setShowSmoke(false);
          setShowWhistle(false);
          onRoundComplete(stars);

          const nextRound = currentRound + 1;
          if (nextRound >= TOTAL_ROUNDS) {
            const bonus = MODE_CONFIGS.alphabetTrain.bonusStars;
            onGameComplete(newTotal + bonus);
          } else {
            const newRoundData = generateRound('alphabetTrain', difficulty);
            setCurrentRound(nextRound);
            setRoundData(newRoundData);
            setFilledBlanks({});
            setIsAnimating(false);
          }
        }, 2500);
      }
    },
    [blanks, totalStars, currentRound, difficulty, onRoundComplete, onGameComplete, addTimer],
  );

  // ─── drag and drop ─────────────────────────────────────────────────
  const handleDrop = useCallback(
    (itemId, zoneId) => {
      const blankIdx = parseInt(zoneId.replace('blank-', ''), 10);
      const blankArrayIndex = blanks.indexOf(blankIdx);
      if (blankArrayIndex === -1) return;

      const item = availableCubes.find((c) => c.id === itemId);
      if (!item) return;

      const expectedLetter = answers[blankArrayIndex];

      if (item.letter === expectedLetter && !filledBlanks[blankIdx]) {
        // Correct
        try { playCorrect(); } catch { /* */ }
        try { playStar(); } catch { /* */ }

        const nextFilled = { ...filledBlanks, [blankIdx]: item.letter };
        setFilledBlanks(nextFilled);
        setAvailableCubes((prev) => prev.filter((c) => c.id !== itemId));

        setJustPlaced(blankIdx);
        setStarBurst(blankIdx);
        addTimer(() => setJustPlaced(null), 600);
        addTimer(() => setStarBurst(null), 900);

        checkAllFilled(nextFilled);
      } else {
        // Wrong
        try { playWrong(); } catch { /* */ }
        setIsAnimating(true);
        setWrongZone(blankIdx);
        setWrongCube(itemId);
        addTimer(() => {
          setWrongZone(null);
          setWrongCube(null);
          setIsAnimating(false);
        }, 500);
      }
    },
    [answers, blanks, availableCubes, filledBlanks, checkAllFilled, addTimer],
  );

  const handleMiss = useCallback(() => {}, []);

  const { dragHandlers, activeDrag, dropZoneRef } = useDragAndDrop({
    onDrop: handleDrop,
    onMiss: handleMiss,
    enabled: !isAnimating,
  });

  const draggedItem = activeDrag
    ? availableCubes.find((c) => c.id === activeDrag.id)
    : null;

  // ─── hoveredZone ──────────────────────────────────────────────────
  const [hoveredZone, setHoveredZone] = useState(null);

  useEffect(() => {
    if (!activeDrag) {
      setHoveredZone(null);
      return;
    }
    const zones = document.querySelectorAll('[data-train-drop]');
    let found = null;
    zones.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (
        activeDrag.x >= rect.left &&
        activeDrag.x <= rect.right &&
        activeDrag.y >= rect.top &&
        activeDrag.y <= rect.bottom
      ) {
        found = el.getAttribute('data-train-drop');
      }
    });
    setHoveredZone(found);
  }, [activeDrag]);

  // ─── render ────────────────────────────────────────────────────────
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        minHeight: '100%',
        padding: '12px 8px',
        direction: isRTL ? 'rtl' : 'ltr',
        position: 'relative',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        overflow: 'hidden',
      }}
    >
      {/* ── Sky + ground background ── */}
      <div className="train-bg" />

      {/* ── Progress dots ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 8, zIndex: 2 }}>
        {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: i < currentRound ? '#22c55e' : i === currentRound ? '#3b82f6' : '#d1d5db',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>

      {/* ── Round counter ── */}
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: '#6b7280',
          marginBottom: 6,
          fontFamily: "'Fredoka', 'Heebo', sans-serif",
          zIndex: 2,
        }}
      >
        {currentRound + 1}/{TOTAL_ROUNDS}
      </div>

      {/* ── Teacher guidance ── */}
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: '#1e293b',
          marginBottom: 16,
          textAlign: 'center',
          fontFamily: "'Fredoka', 'Heebo', sans-serif",
          zIndex: 2,
        }}
      >
        {GUIDE[uiLang] || GUIDE.en}
      </div>

      {/* ── Train area ── */}
      <div
        className={trainMoving ? 'train-container train-moving' : 'train-container'}
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          direction: 'ltr',
          marginBottom: 12,
          position: 'relative',
          zIndex: 2,
          overflowX: 'auto',
          overflowY: 'visible',
          maxWidth: '100%',
          padding: '20px 16px 0',
        }}
      >
        {/* ── Locomotive ── */}
        <div className="locomotive" style={{ position: 'relative', marginRight: 4, flexShrink: 0 }}>
          {/* Smoke puffs */}
          {showSmoke && (
            <div className="train-smoke-container">
              <div className="train-smoke smoke-1" />
              <div className="train-smoke smoke-2" />
              <div className="train-smoke smoke-3" />
            </div>
          )}

          {/* Whistle */}
          {showWhistle && (
            <div
              style={{
                position: 'absolute',
                top: -28,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 24,
                animation: 'whistle-bounce 0.5s ease-in-out infinite alternate',
                zIndex: 20,
              }}
            >
              🚨
            </div>
          )}

          {/* Chimney */}
          <div
            style={{
              position: 'absolute',
              top: -18,
              left: 14,
              width: 16,
              height: 22,
              background: '#292524',
              borderRadius: '3px 3px 0 0',
              zIndex: 5,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: -24,
              left: 10,
              width: 24,
              height: 8,
              background: '#44403c',
              borderRadius: 3,
              zIndex: 6,
            }}
          />

          {/* Engine body */}
          <div
            style={{
              width: 72,
              height: 56,
              background: 'linear-gradient(180deg, #dc2626, #b91c1c)',
              borderRadius: '10px 10px 4px 4px',
              position: 'relative',
              boxShadow: '0 4px 12px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.2)',
              border: '2px solid #991b1b',
              overflow: 'hidden',
            }}
          >
            {/* Yellow front detail */}
            <div
              style={{
                position: 'absolute',
                top: 8,
                left: 8,
                right: 8,
                height: 16,
                background: 'linear-gradient(180deg, #eab308, #ca8a04)',
                borderRadius: 4,
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4)',
              }}
            />
            {/* Window */}
            <div
              style={{
                position: 'absolute',
                top: 10,
                left: 14,
                width: 20,
                height: 12,
                background: 'linear-gradient(180deg, #93c5fd, #60a5fa)',
                borderRadius: 3,
                border: '1.5px solid #ca8a04',
              }}
            />
            {/* Yellow stripe */}
            <div
              style={{
                position: 'absolute',
                bottom: 8,
                left: 4,
                right: 4,
                height: 6,
                background: '#eab308',
                borderRadius: 3,
              }}
            />
          </div>

          {/* Wheels */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: -4, position: 'relative', zIndex: 3 }}>
            <div className="train-wheel" style={{ width: 20, height: 20 }}>
              <div className="train-wheel-spoke" />
            </div>
            <div className="train-wheel" style={{ width: 20, height: 20 }}>
              <div className="train-wheel-spoke" />
            </div>
            <div className="train-wheel" style={{ width: 24, height: 24, marginTop: -2 }}>
              <div className="train-wheel-spoke" />
            </div>
          </div>

          {/* Coupling */}
          <div
            style={{
              position: 'absolute',
              right: -10,
              bottom: 16,
              width: 12,
              height: 4,
              background: '#78716c',
              borderRadius: 2,
              zIndex: 4,
            }}
          />
        </div>

        {/* ── Train cars ── */}
        {display.map((letter, idx) => {
          const isBlank = letter === '_';
          const blankIdx = blanks.indexOf(idx);
          const isFilled = isBlank && filledBlanks[idx] != null;
          const isHovered = hoveredZone === `blank-${idx}` && !isFilled;
          const isJustPlaced = justPlaced === idx;
          const isWrongTarget = wrongZone === idx;
          const hasBurst = starBurst === idx;

          return (
            <div
              key={`car-${idx}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                flexShrink: 0,
              }}
            >
              {/* Cube on car */}
              <div
                style={{
                  marginBottom: -2,
                  position: 'relative',
                  animation: isWrongTarget ? 'cube-shake 0.4s ease-in-out' : 'none',
                  transform: isJustPlaced ? 'scale(1.12)' : 'scale(1)',
                  transition: 'transform 0.2s',
                }}
              >
                {isBlank && !isFilled ? (
                  <div
                    data-train-drop={`blank-${idx}`}
                    ref={(el) => dropZoneRef(`blank-${idx}`, el)}
                    style={{ position: 'relative' }}
                  >
                    {/* Glow on hover */}
                    {isHovered && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: -6,
                          borderRadius: 14,
                          background: 'rgba(34, 197, 94, 0.25)',
                          boxShadow: '0 0 18px 4px rgba(34, 197, 94, 0.4)',
                          zIndex: 0,
                          animation: 'glow-pulse 0.8s ease-in-out infinite alternate',
                        }}
                      />
                    )}
                    <LetterCube
                      letter="?"
                      color="#9ca3af"
                      isGhost
                      size={48}
                    />
                  </div>
                ) : (
                  <LetterCube
                    letter={isFilled ? filledBlanks[idx] : letter}
                    color={CUBE_COLORS[idx % CUBE_COLORS.length]}
                    isPlaced={isFilled}
                    size={48}
                  />
                )}

                {/* Star burst */}
                {hasBurst && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -18,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: 24,
                      animation: 'star-float-up 0.9s ease-out forwards',
                      pointerEvents: 'none',
                      zIndex: 10,
                    }}
                  >
                    ⭐
                  </div>
                )}

                {/* Green glow on placed */}
                {isJustPlaced && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: -4,
                      borderRadius: 14,
                      boxShadow: '0 0 20px 6px rgba(34,197,94,0.5)',
                      pointerEvents: 'none',
                      zIndex: 3,
                    }}
                  />
                )}
              </div>

              {/* Car body */}
              <div className="train-car-body">
                {/* Coupling to next car */}
                {idx < display.length - 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      right: -10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 12,
                      height: 4,
                      background: '#78716c',
                      borderRadius: 2,
                      zIndex: 4,
                    }}
                  />
                )}
              </div>

              {/* Wheels */}
              <div style={{ display: 'flex', gap: 10, marginTop: -4, position: 'relative', zIndex: 3 }}>
                <div className="train-wheel train-wheel-small">
                  <div className="train-wheel-spoke" />
                </div>
                <div className="train-wheel train-wheel-small">
                  <div className="train-wheel-spoke" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Railroad tracks ── */}
      <div className="railroad-track" style={{ zIndex: 1 }}>
        <div className="rail rail-top" />
        <div className="rail rail-bottom" />
        <div className="ties-container">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="tie" />
          ))}
        </div>
      </div>

      {/* ── Draggable cubes below ── */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          justifyContent: 'center',
          flexWrap: 'wrap',
          direction: 'ltr',
          marginTop: 24,
          zIndex: 2,
        }}
      >
        {availableCubes.map((item) => {
          const isBeingDragged = activeDrag?.id === item.id;
          const isShaking = wrongCube === item.id;

          return (
            <div
              key={item.id}
              style={{
                opacity: isBeingDragged ? 0.3 : 1,
                transition: 'opacity 0.15s, transform 0.2s',
                animation: isShaking ? 'cube-shake 0.4s ease-in-out' : 'none',
              }}
            >
              <LetterCube
                letter={item.letter}
                color={CUBE_COLORS[availableLetters.indexOf(item.letter) % CUBE_COLORS.length]}
                size={52}
                onPointerDown={(e) => {
                  dragHandlers.onPointerDown(e, item.id);
                }}
              />
            </div>
          );
        })}
      </div>

      {/* ── Drag overlay ── */}
      {activeDrag && draggedItem && (
        <div
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            pointerEvents: 'none',
            zIndex: 1000,
            transform: `translate(${activeDrag.x - 38}px, ${activeDrag.y - 38}px)`,
            transition: 'none',
          }}
        >
          <LetterCube
            letter={draggedItem.letter}
            color={CUBE_COLORS[availableLetters.indexOf(draggedItem.letter) % CUBE_COLORS.length]}
            isDragging
            size={52}
          />
        </div>
      )}

      {/* ── Round-complete overlay ── */}
      {showRoundStars && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.15)',
            zIndex: 100,
            animation: 'fade-in 0.3s ease-out',
          }}
        >
          <div style={{ fontSize: 60, animation: 'star-pop 0.6s ease-out' }}>
            ⭐🚂⭐
          </div>
        </div>
      )}

      {/* ── Inline styles ── */}
      <style>{`
        .train-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, #bae6fd 0%, #e0f2fe 45%, #86efac 45%, #22c55e 100%);
          opacity: 0.35;
          z-index: 0;
          pointer-events: none;
          border-radius: 16px;
        }

        .train-container {
          transition: transform 1.2s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .train-container.train-moving {
          transform: translateX(120%);
        }

        .locomotive {
          animation: loco-idle 2s ease-in-out infinite;
        }
        @keyframes loco-idle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }

        .train-car-body {
          width: 60px;
          height: 24px;
          background: linear-gradient(180deg, #a3a3a3, #737373);
          border-radius: 4px;
          position: relative;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.3);
          border: 1.5px solid #525252;
          margin: 0 4px;
        }

        .train-wheel {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #57534e, #292524);
          border: 2px solid #44403c;
          position: relative;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          animation: wheel-spin 1.5s linear infinite;
        }
        .train-wheel-small {
          width: 16px;
          height: 16px;
        }
        .train-wheel-spoke {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 60%;
          height: 2px;
          background: #78716c;
          transform-origin: center;
          transform: translate(-50%, -50%);
        }
        .train-wheel-spoke::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 2px;
          background: #78716c;
          transform: translate(-50%, -50%) rotate(90deg);
        }

        @keyframes wheel-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .train-smoke-container {
          position: absolute;
          top: -50px;
          left: 10px;
          z-index: 20;
          pointer-events: none;
        }
        .train-smoke {
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(200, 200, 200, 0.7);
          animation: smoke-rise 1.5s ease-out infinite;
        }
        .smoke-1 { left: 0; animation-delay: 0s; }
        .smoke-2 { left: 8px; animation-delay: 0.3s; }
        .smoke-3 { left: -4px; animation-delay: 0.6s; }

        @keyframes smoke-rise {
          0% { transform: translateY(0) scale(0.5); opacity: 0.8; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 0.5; }
          100% { transform: translateY(-45px) scale(1.8); opacity: 0; }
        }

        @keyframes whistle-bounce {
          0% { transform: translateX(-50%) scale(1) rotate(-5deg); }
          100% { transform: translateX(-50%) scale(1.2) rotate(5deg); }
        }

        .railroad-track {
          width: 100%;
          max-width: 500px;
          height: 16px;
          position: relative;
          margin-top: -8px;
        }
        .rail {
          position: absolute;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #78716c, #a8a29e, #78716c);
          border-radius: 2px;
        }
        .rail-top { top: 2px; }
        .rail-bottom { bottom: 2px; }
        .ties-container {
          display: flex;
          justify-content: space-between;
          position: absolute;
          inset: 0;
          padding: 0 4px;
        }
        .tie {
          width: 6px;
          height: 100%;
          background: #a1887f;
          border-radius: 1px;
        }

        @keyframes cube-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes glow-pulse {
          0% { box-shadow: 0 0 12px 2px rgba(34,197,94,0.3); }
          100% { box-shadow: 0 0 22px 6px rgba(34,197,94,0.55); }
        }
        @keyframes star-float-up {
          0% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-36px) scale(1.5); }
        }
        @keyframes star-pop {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
});

export default AlphabetTrainMode;
