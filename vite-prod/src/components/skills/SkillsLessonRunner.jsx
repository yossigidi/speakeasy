import React, { useState, useEffect, useCallback, useRef } from 'react';
import TeacherCharacter from '../teacher/TeacherCharacter.jsx';
import CurriculumExerciseRenderer from '../curriculum/CurriculumExerciseRenderer.jsx';
import LessonCompleteScreen from '../curriculum/LessonCompleteScreen.jsx';
import DialogueViewer from './DialogueViewer.jsx';
import SkillSimulationRunner from './SkillSimulationRunner.jsx';
import { getSkillLesson } from '../../data/skills/skills-data.js';
import { generateExercises } from '../../data/curriculum/exercise-generator.js';
import { calculateStars, calculateXP, LESSON_TYPES } from '../../data/curriculum/curriculum-index.js';
import useSkillsProgress from '../../hooks/useSkillsProgress.js';
import { useSpeech } from '../../contexts/SpeechContext.jsx';
import { stopAllAudio } from '../../utils/hebrewAudio.js';
import { playCorrect, playWrong, playComplete } from '../../utils/gameSounds.js';
import { t } from '../../utils/translations.js';

export default function SkillsLessonRunner({ lessonId, onComplete, onBack, uiLang }) {
  // Phase: 'intro' → 'dialogue' → 'exercise' → 'simulation' → 'complete'
  const [phase, setPhase] = useState('intro');
  const [exercises, setExercises] = useState([]);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [hearts, setHearts] = useState(3);
  const [savedAccuracy, setSavedAccuracy] = useState(null);
  const [streak, setStreak] = useState(0);
  const [teacherState, setTeacherState] = useState('idle');
  const [lessonInfo, setLessonInfo] = useState(null);
  const [simulationAccuracy, setSimulationAccuracy] = useState(null);

  const skillsProgress = useSkillsProgress();
  const { speak, stopSpeaking } = useSpeech();
  const spokenRef = useRef(false);

  // Load lesson data
  useEffect(() => {
    const data = getSkillLesson(lessonId);
    if (!data) return;
    setLessonInfo(data);

    // Generate exercises only if lesson has exerciseTypes
    if (data.lesson.exerciseTypes && data.lesson.exerciseTypes.length > 0) {
      const exs = generateExercises(data.skill, data.lesson);
      setExercises(exs);
    }
  }, [lessonId]);

  // Speak intro
  useEffect(() => {
    if (phase === 'intro' && lessonInfo && !spokenRef.current) {
      spokenRef.current = true;
      const title = uiLang === 'he' ? lessonInfo.lesson.titleHe : lessonInfo.lesson.titleEn;
      setTimeout(() => {
        speak(title, { lang: uiLang === 'he' ? 'he' : 'en', rate: 0.9 });
      }, 200);
    }
  }, [phase, lessonInfo]);

  // Start lesson from intro
  const handleStartLesson = useCallback(() => {
    stopSpeaking && stopSpeaking();
    if (lessonInfo?.lesson.hasDialogue) {
      setPhase('dialogue');
    } else if (lessonInfo?.lesson.hasSimulation) {
      setPhase('simulation');
    } else {
      setPhase('exercise');
    }
    setTeacherState('idle');
  }, [stopSpeaking, lessonInfo]);

  // After dialogue, move to exercises (or complete if no exercises)
  const handleDialogueComplete = useCallback(() => {
    if (exercises.length > 0) {
      setPhase('exercise');
    } else {
      handleLessonComplete(true);
    }
  }, [exercises.length]);

  // After simulation, complete
  const handleSimulationComplete = useCallback((accuracy) => {
    setSimulationAccuracy(accuracy);
    const stars = calculateStars(accuracy);
    handleLessonSave(stars, accuracy);
  }, []);

  const exerciseTimersRef = useRef([]);

  // Handle exercise answer
  const handleAnswer = useCallback((isCorrect, wordData) => {
    // Clear any pending timers from previous exercise
    exerciseTimersRef.current.forEach(clearTimeout);
    exerciseTimersRef.current = [];

    if (isCorrect) {
      playCorrect();
      setCorrectCount(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        setTeacherState(newStreak >= 3 ? 'celebrating' : 'happy');
        const msg = newStreak >= 3 ? t('teacherEncourage3', uiLang) : t('teacherEncourage1', uiLang);
        speak(msg, { lang: uiLang === 'he' ? 'he' : 'en', rate: 1.0, _queued: true });
        return newStreak;
      });
    } else {
      playWrong();
      setWrongCount(prev => prev + 1);
      let heartsReachedZero = false;
      setHearts(prev => {
        const newHearts = Math.max(0, prev - 1);
        if (newHearts === 0) heartsReachedZero = true;
        return newHearts;
      });
      setStreak(0);
      setTeacherState('encouraging');
      speak(t('teacherWrong', uiLang), { lang: uiLang === 'he' ? 'he' : 'en', rate: 0.95, _queued: true });

      // Always record answer once
      setAnswers(prev => [...prev, { isCorrect, wordData }]);

      if (heartsReachedZero) {
        const t1 = setTimeout(() => handleLessonComplete(isCorrect), 1200);
        exerciseTimersRef.current.push(t1);
        return;
      }
    }

    // Record answer for correct path (wrong path records above)
    if (isCorrect) {
      setAnswers(prev => [...prev, { isCorrect, wordData }]);
    }

    const t1 = setTimeout(() => setTeacherState('idle'), 1500);
    exerciseTimersRef.current.push(t1);

    // Stop any ongoing speech before advancing to next exercise
    const t2 = setTimeout(() => {
      stopAllAudio();
      if (currentExercise + 1 >= exercises.length) {
        handleLessonComplete(isCorrect);
      } else {
        setCurrentExercise(prev => prev + 1);
      }
    }, 1200);
    exerciseTimersRef.current.push(t2);
  }, [currentExercise, exercises.length, uiLang, speak]);

  // Use ref for correctCount to avoid stale closure in handleLessonComplete
  const correctCountRef = useRef(0);
  useEffect(() => { correctCountRef.current = correctCount; }, [correctCount]);

  // Complete exercises and save
  const handleLessonComplete = useCallback(async (lastWasCorrect) => {
    const totalCount = exercises.length;
    const finalCorrect = correctCountRef.current;
    const acc = totalCount > 0 ? ((finalCorrect) / totalCount) * 100 : 100;
    const stars = calculateStars(acc);
    await handleLessonSave(stars, acc);
  }, [exercises.length, lessonId]);

  // Save progress
  const handleLessonSave = useCallback(async (stars, accuracy) => {
    try {
      await skillsProgress.completeLesson(lessonId, stars, accuracy);
    } catch (err) {
      console.error('Failed to save skill lesson progress:', err);
    }
    setSavedAccuracy(accuracy);
    playComplete && playComplete();
    setPhase('complete');
  }, [lessonId, skillsProgress]);

  // Cleanup speech and timers on unmount
  useEffect(() => {
    return () => {
      stopSpeaking && stopSpeaking();
      exerciseTimersRef.current.forEach(clearTimeout);
    };
  }, [stopSpeaking]);

  // Calculate final stats — use savedAccuracy (set at save time) for consistent display
  const totalCount = exercises.length || 1;
  const finalAccuracy = savedAccuracy != null
    ? savedAccuracy
    : simulationAccuracy != null
    ? simulationAccuracy
    : (totalCount > 0 ? (correctCount / (exercises.length || 1)) * 100 : 100);
  const finalStars = calculateStars(finalAccuracy);
  const finalXP = calculateXP(finalStars);

  const wordsLearned = answers
    .filter(a => a.wordData)
    .reduce((acc, a) => {
      if (!acc.find(w => w.word === a.wordData.word)) acc.push(a.wordData);
      return acc;
    }, []);

  const lessonTypeInfo = lessonInfo?.lesson
    ? LESSON_TYPES[lessonInfo.lesson.type] || LESSON_TYPES.mixed
    : LESSON_TYPES.mixed;

  const lessonTitle = lessonInfo?.lesson
    ? (uiLang === 'he' ? lessonInfo.lesson.titleHe : lessonInfo.lesson.titleEn) || ''
    : '';

  // ── Intro Phase ──
  if (phase === 'intro') {
    const introDesc = lessonInfo?.lesson?.type === 'speaking' ? t('introSpeakingDesc', uiLang)
      : lessonInfo?.lesson?.type === 'vocabulary' ? t('introVocabDesc', uiLang)
      : lessonInfo?.lesson?.type === 'reading' ? t('introReadingDesc', uiLang)
      : lessonInfo?.lesson?.type === 'test' ? t('introTestDesc', uiLang)
      : t('introMixedDesc', uiLang);

    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'linear-gradient(135deg, #FFF8F0 0%, #FFE8D6 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '24px', paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)',
      }}>
        <div style={{ animation: 'teacher-float 3s ease-in-out infinite', marginBottom: 24 }}>
          <TeacherCharacter state="talking" size="normal" />
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
          background: 'white', padding: '10px 20px', borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}>
          <span style={{ fontSize: 24 }}>{lessonTypeInfo.icon}</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: lessonTypeInfo.color }}>
            {uiLang === 'he' ? lessonTypeInfo.nameHe : lessonTypeInfo.nameEn}
          </span>
        </div>

        <div style={{
          fontSize: 24, fontWeight: 800, color: '#374151', textAlign: 'center',
          marginBottom: 8, maxWidth: 300,
        }}>
          {lessonTitle}
        </div>

        <div style={{
          fontSize: 15, color: '#6B7280', marginBottom: 12, textAlign: 'center',
          maxWidth: 280, lineHeight: 1.5,
          direction: uiLang === 'he' ? 'rtl' : 'ltr',
        }}>
          {introDesc}
        </div>

        {exercises.length > 0 && (
          <div style={{
            fontSize: 14, color: '#9CA3AF', marginBottom: 32,
            background: 'white', padding: '8px 16px', borderRadius: 12,
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            {exercises.length} {t('exercisesCount', uiLang)}
          </div>
        )}

        <button
          onClick={handleStartLesson}
          style={{
            padding: '16px 48px', borderRadius: 20, fontSize: 20, fontWeight: 800,
            background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
            color: 'white', border: 'none', cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(255,107,107,0.35), 0 3px 0 #E5533A',
            transform: 'translateY(-2px)', transition: 'all 0.2s', minHeight: 56,
          }}
        >
          {t('letsStart', uiLang)}
        </button>

        <button
          onClick={() => { stopSpeaking && stopSpeaking(); onBack(); }}
          style={{
            marginTop: 16, padding: '10px 20px', borderRadius: 12,
            fontSize: 14, fontWeight: 600, background: 'transparent',
            color: '#9CA3AF', border: 'none', cursor: 'pointer',
          }}
        >
          {t('back', uiLang)}
        </button>
      </div>
    );
  }

  // ── Dialogue Phase ──
  if (phase === 'dialogue') {
    return (
      <DialogueViewer
        dialogue={lessonInfo.skill.dialogue}
        phrases={lessonInfo.skill.phrases}
        uiLang={uiLang}
        speak={speak}
        onComplete={handleDialogueComplete}
      />
    );
  }

  // ── Simulation Phase ──
  if (phase === 'simulation') {
    return (
      <SkillSimulationRunner
        simulation={lessonInfo.skill.simulation}
        uiLang={uiLang}
        onComplete={handleSimulationComplete}
      />
    );
  }

  // ── Complete Phase ──
  if (phase === 'complete') {
    return (
      <LessonCompleteScreen
        stars={finalStars}
        accuracy={finalAccuracy}
        correctCount={correctCount}
        totalCount={exercises.length || 1}
        xpEarned={finalXP}
        wordsLearned={wordsLearned}
        onNext={() => onComplete && onComplete({ stars: finalStars, accuracy: finalAccuracy, xp: finalXP })}
        onHome={onBack}
        onRetry={finalStars === 0 ? () => {
          spokenRef.current = false;
          setPhase('intro');
          setCurrentExercise(0);
          setCorrectCount(0);
          setWrongCount(0);
          setAnswers([]);
          setHearts(3);
          setStreak(0);
          setTeacherState('idle');
          setSimulationAccuracy(null);
          setSavedAccuracy(null);
          if (lessonInfo) {
            const data = getSkillLesson(lessonId);
            if (data && data.lesson.exerciseTypes?.length > 0) {
              setExercises(generateExercises(data.skill, data.lesson));
            }
          }
        } : null}
        uiLang={uiLang}
        lessonType={lessonInfo?.lesson?.type}
        speak={speak}
      />
    );
  }

  // ── Exercise Phase ──
  const exercise = exercises[currentExercise];
  const progress = exercises.length > 0 ? ((currentExercise) / exercises.length) * 100 : 0;
  const isLastExercise = currentExercise === exercises.length - 1;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: '#FAFAFA',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Top Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: 'calc(env(safe-area-inset-top, 0px) + 12px) 16px 12px 16px',
        background: 'white', borderBottom: '1px solid #F3F4F6',
        position: 'relative', zIndex: 10,
      }}>
        <button
          onClick={() => { stopSpeaking && stopSpeaking(); onBack(); }}
          style={{
            width: 36, height: 36, borderRadius: '50%', border: 'none',
            background: '#F3F4F6', fontSize: 16, fontWeight: 700,
            color: '#9CA3AF', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          {'\u2715'}
        </button>

        <div style={{ flex: 1, height: 10, background: '#E5E7EB', borderRadius: 5, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 5,
            background: 'linear-gradient(90deg, #FF6B6B, #0EA5E9)',
            width: `${progress}%`, transition: 'width 0.5s ease',
          }} />
        </div>

        <span style={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF', flexShrink: 0 }}>
          {currentExercise + 1}/{exercises.length}
        </span>

        <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
          {[1, 2, 3].map(h => (
            <span key={h} style={{
              fontSize: 18, opacity: h <= hearts ? 1 : 0.25,
              transition: 'all 0.3s', transform: h <= hearts ? 'scale(1)' : 'scale(0.8)',
            }}>
              {'\u2764\uFE0F'}
            </span>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', position: 'relative' }}>
        {/* Teacher */}
        <div style={{
          position: 'absolute', top: 8, right: 12, zIndex: 5,
          transition: 'all 0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <TeacherCharacter state={teacherState} size="small" />
          {teacherState !== 'idle' && (
            <div style={{
              marginTop: 2, padding: '3px 8px', borderRadius: 8,
              background: teacherState === 'encouraging' ? '#FEF3C7' : '#D1FAE5',
              fontSize: 11, fontWeight: 700,
              color: teacherState === 'encouraging' ? '#92400E' : '#065F46',
              animation: 'curriculum-fade-in 0.3s ease', whiteSpace: 'nowrap',
            }}>
              {teacherState === 'happy' ? t('teacherEncourage1', uiLang) :
               teacherState === 'celebrating' ? t('teacherEncourage3', uiLang) :
               t('teacherWrong', uiLang)}
            </div>
          )}
        </div>

        {isLastExercise && (
          <div style={{
            textAlign: 'center', padding: '8px 0', fontSize: 13,
            fontWeight: 700, color: '#FF6B6B', animation: 'curriculum-fade-in 0.5s ease',
          }}>
            {t('lastExercise', uiLang)}
          </div>
        )}

        {streak >= 3 && (
          <div style={{
            textAlign: 'center', padding: '4px 0', fontSize: 13,
            fontWeight: 700, color: '#F59E0B', animation: 'curriculum-fade-in 0.3s ease',
          }}>
            🔥 {streak} {t('streakMessage', uiLang)}
          </div>
        )}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '20px 20px 32px' }}>
          {exercise && (
            <CurriculumExerciseRenderer
              key={`${exercise.lessonId}-${exercise.index}-${currentExercise}`}
              exercise={exercise}
              onAnswer={handleAnswer}
              uiLang={uiLang}
              speak={speak}
            />
          )}
        </div>
      </div>

      <style>{`
        @keyframes curriculum-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
