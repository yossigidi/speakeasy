import React, { useState, useCallback } from 'react';
import { ArrowLeft, Check, Eye, EyeOff, Lock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useUserProgress } from '../contexts/UserProgressContext.jsx';
import { LEVEL_META } from '../data/curriculum/curriculum-index.js';
import { t } from '../utils/translations.js';

/* ───────── Placement-test questions (3 per level, 1-5) ───────── */
const PLACEMENT_QUESTIONS = [
  // ─── Level 1 (very basic) ───
  { question: 'What is the correct greeting for the morning?',
    questionHe: 'מה הברכה הנכונה לבוקר?',
    options: ['Good night', 'Good morning', 'Good luck', 'Goodbye'],
    correct: 1, level: 1, type: 'vocabulary' },
  { question: 'She ___ a student.',
    questionHe: 'היא ___ תלמידה.',
    options: ['am', 'is', 'are', 'be'],
    correct: 1, level: 1, type: 'grammar' },
  { question: 'What does "Thank you" mean?',
    questionHe: 'מה המשמעות של "Thank you"?',
    options: ['בבקשה', 'סליחה', 'תודה', 'שלום'],
    correct: 2, level: 1, type: 'vocabulary' },
  // ─── Level 2 ───
  { question: 'I ___ to the store yesterday.',
    questionHe: 'אני ___ לחנות אתמול.',
    options: ['go', 'goes', 'went', 'going'],
    correct: 2, level: 2, type: 'grammar',
    hint: 'Yesterday = past tense', hintHe: 'אתמול = זמן עבר' },
  { question: 'What does "Delicious" mean?',
    questionHe: 'מה המשמעות של "Delicious"?',
    options: ['יפה', 'טעים', 'גדול', 'מהיר'],
    correct: 1, level: 2, type: 'vocabulary' },
  { question: 'There are ___ apples on the table.',
    questionHe: 'יש ___ תפוחים על השולחן.',
    options: ['much', 'a', 'some', 'any'],
    correct: 2, level: 2, type: 'grammar' },
  // ─── Level 3 ───
  { question: 'If it rains tomorrow, I ___ at home.',
    questionHe: 'אם ירד גשם מחר, אני ___ בבית.',
    options: ['stay', 'will stay', 'stayed', 'would stay'],
    correct: 1, level: 3, type: 'grammar',
    hint: 'Future condition', hintHe: 'תנאי עתידי' },
  { question: 'What does "Although" mean?',
    questionHe: 'מה המשמעות של "Although"?',
    options: ['בגלל', 'למרות', 'כאשר', 'אחרי'],
    correct: 1, level: 3, type: 'vocabulary' },
  { question: 'The movie was ___ boring that we left early.',
    questionHe: 'הסרט היה ___ משעמם שיצאנו מוקדם.',
    options: ['such', 'too', 'so', 'very'],
    correct: 2, level: 3, type: 'grammar' },
  // ─── Level 4 ───
  { question: 'What does "Nevertheless" mean?',
    questionHe: 'מה המשמעות של "Nevertheless"?',
    options: ['לעולם לא', 'בכל זאת', 'לפעמים', 'מאוחר יותר'],
    correct: 1, level: 4, type: 'vocabulary' },
  { question: 'I wish I ___ more time to travel last year.',
    questionHe: 'הלוואי ש ___ יותר זמן לטייל בשנה שעברה.',
    options: ['have', 'had had', 'would have', 'having'],
    correct: 1, level: 4, type: 'grammar',
    hint: 'Past wish = past perfect', hintHe: 'משאלה על העבר = past perfect' },
  { question: 'The report ___ by the time the meeting starts.',
    questionHe: 'הדוח ___ עד שהישיבה תתחיל.',
    options: ['will have been completed', 'will complete', 'is completing', 'has completed'],
    correct: 0, level: 4, type: 'grammar' },
  // ─── Level 5 ───
  { question: 'What does "Ubiquitous" mean?',
    questionHe: 'מה המשמעות של "Ubiquitous"?',
    options: ['נדיר', 'נמצא בכל מקום', 'מסתורי', 'עתיק'],
    correct: 1, level: 5, type: 'vocabulary' },
  { question: 'Hardly ___ the station when the train departed.',
    questionHe: 'בקושי ___ לתחנה כשהרכבת יצאה.',
    options: ['I reached', 'had I reached', 'I had reached', 'did I reach'],
    correct: 1, level: 5, type: 'grammar',
    hint: 'Inversion after "Hardly"', hintHe: 'היפוך אחרי "Hardly"' },
  { question: 'She couldn\'t help but ___ at the absurdity of the situation.',
    questionHe: 'היא לא יכלה שלא ___ על האבסורד של המצב.',
    options: ['to laugh', 'laughing', 'laugh', 'laughed'],
    correct: 2, level: 5, type: 'grammar' },
];

/* ─────────────────── helpers ─────────────────── */
const CEFR_MAP = ['A1', 'A2', 'B1', 'B2', 'C1'];

function calculateCurriculumLevel(answers) {
  const countByLevel = {};
  const correctByLevel = {};
  PLACEMENT_QUESTIONS.forEach((q, i) => {
    countByLevel[q.level] = (countByLevel[q.level] || 0) + 1;
    if (answers[i] === q.correct) {
      correctByLevel[q.level] = (correctByLevel[q.level] || 0) + 1;
    }
  });
  let highest = 1;
  for (let lvl = 1; lvl <= 5; lvl++) {
    const total = countByLevel[lvl] || 0;
    const right = correctByLevel[lvl] || 0;
    if (total > 0 && right / total >= 0.6) {
      highest = lvl;
    }
  }
  return highest;
}

/* ═══════════════════════════════════════════════
   Main OnboardingPage component
   New flow: Step 0 (Auth) → Step 1 (Placement Test) → Step 2 (Level Display)
   ═══════════════════════════════════════════════ */
export default function OnboardingPage({ onComplete, onChildLogin }) {
  const { uiLang, dir } = useTheme();
  const { signInWithGoogle, signInWithApple, signUpWithEmail, signInWithEmail, user } = useAuth();
  const { updateProgress, progress, addChild, familyCode } = useUserProgress();

  const [step, setStep] = useState(0);

  // Curriculum level (1-5)
  const [curriculumLevel, setCurriculumLevel] = useState(1);

  // Placement test state
  const [testStarted, setTestStarted] = useState(false);
  const [testIndex, setTestIndex] = useState(0);
  const [testAnswers, setTestAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [testFinished, setTestFinished] = useState(false);

  // Children setup state
  const [childrenToAdd, setChildrenToAdd] = useState([]);
  const [newChildName, setNewChildName] = useState('');
  const [newChildPin, setNewChildPin] = useState('');

  // Account form state
  const [authMode, setAuthMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const isRTL = uiLang === 'he';

  /* ── navigation helpers ── */
  const nextStep = useCallback(() => setStep(s => Math.min(s + 1, 3)), []);
  const prevStep = useCallback(() => setStep(s => Math.max(s - 1, 0)), []);

  /* ── finish (called at end of step 3) ── */
  const handleFinish = useCallback(async () => {
    try {
      await updateProgress({
        onboardingComplete: true,
        curriculumLevel,
        cefrLevel: CEFR_MAP[curriculumLevel - 1] || 'A1',
        dailyGoalMinutes: 10,
        ageGroup: 'kids',
      });
      // Create any children added during onboarding
      const avatars = ['🦊', '🐱', '🐶', '🐸', '🦁', '🐼', '🐨', '🐯'];
      const colors = ['from-pink-400 to-rose-500', 'from-blue-400 to-indigo-500', 'from-green-400 to-emerald-500', 'from-orange-400 to-amber-500', 'from-purple-400 to-violet-500'];
      for (let i = 0; i < childrenToAdd.length; i++) {
        const child = childrenToAdd[i];
        await addChild({
          name: child.name,
          pin: child.pin,
          avatar: avatars[i % avatars.length],
          avatarColor: colors[i % colors.length],
          age: null,
        });
      }
    } catch (e) {
      console.error('Failed to save onboarding progress', e);
    }
    onComplete();
  }, [curriculumLevel, childrenToAdd, onComplete, updateProgress, addChild]);

  /* ── placement test answer handler ── */
  const handleTestAnswer = useCallback((optionIndex) => {
    setSelectedOption(optionIndex);
    setTimeout(() => {
      const newAnswers = [...testAnswers, optionIndex];
      setTestAnswers(newAnswers);
      setSelectedOption(null);

      if (testIndex + 1 >= PLACEMENT_QUESTIONS.length) {
        const level = calculateCurriculumLevel(newAnswers);
        setCurriculumLevel(level);
        setTestFinished(true);
      } else {
        setTestIndex(i => i + 1);
      }
    }, 600);
  }, [testAnswers, testIndex]);

  /* ── skip question (don't know) ── */
  const handleSkipQuestion = useCallback(() => {
    const newAnswers = [...testAnswers, -1];
    setTestAnswers(newAnswers);

    if (testIndex + 1 >= PLACEMENT_QUESTIONS.length) {
      const level = calculateCurriculumLevel(newAnswers);
      setCurriculumLevel(level);
      setTestFinished(true);
    } else {
      setTestIndex(i => i + 1);
    }
  }, [testAnswers, testIndex]);

  /* ── auth success handler (just advances to next step) ── */
  const handleAuthSuccess = useCallback(async () => {
    // Wait for Firestore user doc to be created
    await new Promise(r => setTimeout(r, 500));
    // Check if returning user (onboardingComplete already true)
    // The snapshot listener will update progress, but we need a small delay
    await new Promise(r => setTimeout(r, 300));
    // If progress is already loaded and complete, skip to app
    if (progress.onboardingComplete) {
      onComplete();
      return;
    }
    nextStep();
  }, [progress.onboardingComplete, onComplete, nextStep]);

  /* ── auth handlers ── */
  const handleGoogle = useCallback(async () => {
    setAuthError('');
    setAuthLoading(true);
    try {
      await signInWithGoogle();
      await handleAuthSuccess();
    } catch (e) {
      setAuthError(e.message);
    } finally {
      setAuthLoading(false);
    }
  }, [signInWithGoogle, handleAuthSuccess]);

  const handleApple = useCallback(async () => {
    setAuthError('');
    setAuthLoading(true);
    try {
      await signInWithApple();
      await handleAuthSuccess();
    } catch (e) {
      setAuthError(e.message);
    } finally {
      setAuthLoading(false);
    }
  }, [signInWithApple, handleAuthSuccess]);

  const handleEmailSubmit = useCallback(async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      if (authMode === 'signup') {
        await signUpWithEmail(email, password, displayName);
      } else {
        await signInWithEmail(email, password);
      }
      await handleAuthSuccess();
    } catch (err) {
      const code = err.code || '';
      if (code === 'auth/email-already-in-use') {
        setAuthError(uiLang === 'he' ? 'האימייל כבר רשום. נסה להתחבר במקום להירשם.' : 'Email already in use. Try signing in instead.');
      } else if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setAuthError(uiLang === 'he' ? 'סיסמה שגויה. נסה שוב.' : 'Wrong password. Try again.');
      } else if (code === 'auth/user-not-found') {
        setAuthError(uiLang === 'he' ? 'משתמש לא נמצא. נסה להירשם.' : 'User not found. Try signing up.');
      } else if (code === 'auth/invalid-email') {
        setAuthError(uiLang === 'he' ? 'כתובת אימייל לא תקינה.' : 'Invalid email address.');
      } else if (code === 'auth/weak-password') {
        setAuthError(uiLang === 'he' ? 'הסיסמה חלשה מדי. לפחות 6 תווים.' : 'Password too weak. At least 6 characters.');
      } else {
        setAuthError(err.message);
      }
    } finally {
      setAuthLoading(false);
    }
  }, [email, password, displayName, authMode, signUpWithEmail, signInWithEmail, handleAuthSuccess, uiLang]);

  /* ─────────────── Step renderers ─────────────── */

  /* Step 0 — Auth Screen (Welcome + Login/Register) */
  const renderAuth = () => (
    <div className="flex flex-col items-center justify-center min-h-[100vh] text-center px-6 pt-0" style={{ background: 'linear-gradient(180deg, #030712 0%, #0f172a 60%, #0d3b3a 100%)' }}>
      {/* Glow effect behind icon */}
      <div className="relative mb-6">
        <div className="absolute inset-0 w-32 h-32 mx-auto rounded-full" style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.35) 0%, transparent 70%)', filter: 'blur(20px)', transform: 'scale(1.5)' }} />
        <img src="/icons/icon-192.png" alt="Speakli" className="relative w-28 h-28 rounded-[28px] shadow-2xl shadow-teal-500/20" />
      </div>

      <h1 className="text-4xl font-black mb-1" style={{ background: 'linear-gradient(135deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Speakli
      </h1>
      <p className="text-base font-medium mb-8" style={{ background: 'linear-gradient(135deg, #14b8a6, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        {uiLang === 'he' ? 'למד אנגלית בקלות' : 'Learn English the Easy Way'}
      </p>

      <div className="w-full max-w-sm flex flex-col gap-3">
        {/* Apple Sign-In */}
        <button
          onClick={handleApple}
          disabled={authLoading}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-semibold text-white active:scale-[0.97] transition-all disabled:opacity-50"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          {t('signInApple', uiLang)}
        </button>

        {/* Google Sign-In */}
        <button
          onClick={handleGoogle}
          disabled={authLoading}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-semibold text-white active:scale-[0.97] transition-all disabled:opacity-50"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {t('signInGoogle', uiLang)}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>{t('orDivider', uiLang)}</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
        </div>

        {/* Email form */}
        <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
          {authMode === 'signup' && (
            <input
              type="text"
              placeholder={t('displayName', uiLang)}
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl outline-none transition-all text-white placeholder-white/30"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          )}
          <input
            type="email"
            placeholder={t('email', uiLang)}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl outline-none transition-all text-white placeholder-white/30"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder={t('password', uiLang)}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl outline-none transition-all text-white placeholder-white/30"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: 'rgba(255,255,255,0.3)', [isRTL ? 'left' : 'right']: '12px' }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {authError && (
            <p className="text-sm text-red-400 text-center">{authError}</p>
          )}

          <button
            type="submit"
            disabled={authLoading}
            className="w-full py-3.5 rounded-2xl font-bold text-white active:scale-[0.97] transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #0d9488, #10b981)', boxShadow: '0 8px 32px rgba(13,148,136,0.35)' }}
          >
            {authLoading
              ? t('loading', uiLang)
              : authMode === 'signup'
                ? t('signUp', uiLang)
                : t('signIn', uiLang)}
          </button>
        </form>

        {/* Toggle auth mode */}
        <p className="text-center text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {authMode === 'signup' ? t('alreadyHaveAccount', uiLang) : t('dontHaveAccount', uiLang)}{' '}
          <button
            type="button"
            onClick={() => { setAuthMode(m => m === 'signup' ? 'signin' : 'signup'); setAuthError(''); }}
            className="font-semibold hover:underline"
            style={{ color: '#14b8a6' }}
          >
            {authMode === 'signup' ? t('signIn', uiLang) : t('signUp', uiLang)}
          </button>
        </p>

        {/* Child login link */}
        <button
          onClick={onChildLogin}
          className="mt-2 text-sm transition-colors"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          {t('loginAsChild', uiLang)}
        </button>
      </div>
    </div>
  );

  /* Step 1 — Placement Test */
  const renderPlacementTest = () => {
    if (!testStarted && !testFinished) {
      return (
        <StepWrapper title={t('findYourLevel', uiLang)} onBack={prevStep}>
          <p className="text-gray-500 dark:text-gray-400 text-center mt-4 mb-8">
            {t('placementTestDesc', uiLang)}
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setTestStarted(true)}
              className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-500 shadow-lg shadow-teal-500/25 active:scale-[0.97] transition-all"
            >
              {t('startTest', uiLang)}
            </button>
            <button
              onClick={() => {
                setCurriculumLevel(1);
                setTestFinished(true);
                nextStep();
              }}
              className="w-full py-3 rounded-2xl font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              {t('skipToLevel1', uiLang)}
            </button>
          </div>
        </StepWrapper>
      );
    }

    if (testFinished) {
      // Auto-advance to step 2 (level display)
      nextStep();
      return null;
    }

    // Question screen
    const q = PLACEMENT_QUESTIONS[testIndex];
    const progressPct = ((testIndex) / PLACEMENT_QUESTIONS.length) * 100;
    const levelColors = { 1: 'text-emerald-500', 2: 'text-blue-500', 3: 'text-amber-500', 4: 'text-orange-500', 5: 'text-red-500' };
    const levelMeta = LEVEL_META[q.level - 1];

    return (
      <StepWrapper title={t('placementTest', uiLang)} onBack={prevStep}>
        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 mb-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between mb-4">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 ${levelColors[q.level] || ''}`}>
            {levelMeta?.emoji} {uiLang === 'he' ? levelMeta?.nameHe : levelMeta?.name}
          </span>
          <span className="text-xs text-gray-400">
            {testIndex + 1} {t('of', uiLang)} {PLACEMENT_QUESTIONS.length}
          </span>
        </div>

        {/* Question */}
        <div className="glass-card p-5 mb-4">
          <p className="font-semibold text-lg text-center leading-relaxed" dir="ltr">{q.question}</p>
          {uiLang === 'he' && q.questionHe && (
            <p className="text-sm text-gray-400 text-center mt-2" dir="rtl">{q.questionHe}</p>
          )}
          {q.hint && (
            <p className="text-xs text-teal-500 dark:text-teal-400 text-center mt-2 italic">
              {uiLang === 'he' && q.hintHe ? q.hintHe : q.hint}
            </p>
          )}
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2.5">
          {q.options.map((opt, i) => {
            let btnClass = 'glass-card p-3.5 text-center font-medium transition-all duration-200 active:scale-[0.97] border-2 ';
            if (selectedOption === null) {
              btnClass += 'border-transparent hover:border-teal-400';
            } else if (i === q.correct) {
              btnClass += 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300';
            } else if (i === selectedOption && i !== q.correct) {
              btnClass += 'border-red-500 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300';
            } else {
              btnClass += 'border-transparent opacity-50';
            }
            return (
              <button
                key={i}
                disabled={selectedOption !== null}
                onClick={() => handleTestAnswer(i)}
                className={btnClass}
                dir="ltr"
              >
                {opt}
              </button>
            );
          })}

          {selectedOption === null && (
            <button
              onClick={handleSkipQuestion}
              className="mt-1 py-2.5 rounded-xl text-sm font-medium text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              {uiLang === 'he' ? 'לא יודע/ת' : "I don't know"}
            </button>
          )}
        </div>
      </StepWrapper>
    );
  };

  /* Step 2 — Level Assignment (Show all 5 levels) */
  const renderLevelDisplay = () => (
    <StepWrapper title={t('levelAssigned', uiLang)}>
      <div className="flex flex-col gap-3 mt-6">
        {LEVEL_META.map((meta) => {
          const isAssigned = meta.id === curriculumLevel;
          const isUnlocked = meta.id <= curriculumLevel;

          return (
            <div
              key={meta.id}
              className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 ${
                isAssigned
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/30 shadow-lg shadow-teal-500/20'
                  : isUnlocked
                    ? 'border-emerald-300 dark:border-emerald-700 bg-white dark:bg-gray-800/50'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 opacity-60'
              }`}
            >
              {/* Emoji */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                isAssigned
                  ? 'bg-gradient-to-br from-teal-500 to-emerald-500 shadow-md'
                  : isUnlocked
                    ? 'bg-emerald-100 dark:bg-emerald-900/30'
                    : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                {meta.emoji}
              </div>

              {/* Text */}
              <div className="flex-1">
                <span className={`font-bold text-base block ${
                  isAssigned ? 'text-teal-700 dark:text-teal-300' : ''
                }`}>
                  {uiLang === 'he' ? meta.nameHe : meta.name}
                </span>
                <span className="text-xs text-gray-400">
                  {uiLang === 'he' ? `רמה ${meta.id}` : `Level ${meta.id}`}
                </span>
              </div>

              {/* Status indicator */}
              {isAssigned ? (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500 text-white text-xs font-bold animate-pulse">
                  {uiLang === 'he' ? 'אתה כאן!' : 'YOU'}
                </div>
              ) : isUnlocked ? (
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Check size={14} className="text-white" />
                </div>
              ) : (
                <Lock size={18} className="text-gray-400" />
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4 px-4">
        {uiLang === 'he'
          ? 'תמיד אפשר לשנות את הרמה מאוחר יותר בהגדרות'
          : 'You can always change your level later in settings'}
      </p>

      <NextButton onClick={nextStep} label={t('next', uiLang)} />
    </StepWrapper>
  );

  /* Step 3 — Add Children (Optional) */
  const handleAddChild = () => {
    if (!newChildName.trim()) return;
    setChildrenToAdd(prev => [...prev, { name: newChildName.trim(), pin: newChildPin || '1234' }]);
    setNewChildName('');
    setNewChildPin('');
  };

  const handleRemoveChild = (index) => {
    setChildrenToAdd(prev => prev.filter((_, i) => i !== index));
  };

  const renderAddChildren = () => (
    <StepWrapper title={uiLang === 'he' ? 'הוסף ילדים' : 'Add Children'} onBack={prevStep}>
      <p className="text-gray-500 dark:text-gray-400 text-center text-sm mt-1 mb-6">
        {uiLang === 'he'
          ? 'הוסף את הילדים שלך כדי שיוכלו ללמוד בנפרד'
          : 'Add your children so they can learn separately'}
      </p>

      {/* Children added so far */}
      {childrenToAdd.length > 0 && (
        <div className="flex flex-col gap-2 mb-4">
          {childrenToAdd.map((child, i) => {
            const avatars = ['🦊', '🐱', '🐶', '🐸', '🦁', '🐼', '🐨', '🐯'];
            return (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <span className="text-2xl">{avatars[i % avatars.length]}</span>
                <div className="flex-1">
                  <span className="font-bold text-sm">{child.name}</span>
                  <span className="text-xs text-gray-400 block">
                    {uiLang === 'he' ? `קוד: ${child.pin}` : `PIN: ${child.pin}`}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveChild(i)}
                  className="text-red-400 hover:text-red-600 text-sm font-medium"
                >
                  {uiLang === 'he' ? 'הסר' : 'Remove'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add child form */}
      <div className="flex flex-col gap-3 mb-4">
        <input
          type="text"
          placeholder={uiLang === 'he' ? 'שם הילד/ה' : "Child's name"}
          value={newChildName}
          onChange={e => setNewChildName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
        />
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder={uiLang === 'he' ? 'קוד כניסה (4 ספרות)' : 'Login PIN (4 digits)'}
          value={newChildPin}
          onChange={e => setNewChildPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
        />
        <button
          onClick={handleAddChild}
          disabled={!newChildName.trim()}
          className="w-full py-3 rounded-xl font-semibold border-2 border-teal-500 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30 active:scale-[0.97] transition-all disabled:opacity-40 disabled:pointer-events-none"
        >
          {uiLang === 'he' ? '+ הוסף ילד/ה' : '+ Add Child'}
        </button>
      </div>

      <NextButton onClick={handleFinish} label={t('letsGo', uiLang)} />

      {childrenToAdd.length === 0 && (
        <button
          onClick={handleFinish}
          className="w-full mt-3 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all"
        >
          {uiLang === 'he' ? 'דלג, אוסיף מאוחר יותר' : 'Skip, add later'}
        </button>
      )}
    </StepWrapper>
  );

  /* ─────────────── Step array ─────────────── */
  const steps = [renderAuth, renderPlacementTest, renderLevelDisplay, renderAddChildren];

  /* ═══════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════ */
  return (
    <div
      dir={dir}
      className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-teal-950 transition-colors duration-300"
    >
      {/* Step indicator dots (hidden on auth screen) */}
      {step > 0 && (
        <div className="flex items-center justify-center gap-2 pt-6 pb-2">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step
                  ? 'w-8 bg-gradient-to-r from-teal-500 to-emerald-500'
                  : i < step
                    ? 'w-2 bg-teal-400'
                    : 'w-2 bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
      )}

      <div className="max-w-md mx-auto px-4 pb-12">
        {steps[step]()}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════ */

function StepWrapper({ title, onBack, children }) {
  return (
    <div className="animate-fade-in pt-4">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mb-4 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
      )}
      <h2 className="text-2xl font-bold text-center mb-2">{title}</h2>
      {children}
    </div>
  );
}

function NextButton({ onClick, label, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full mt-8 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 shadow-lg shadow-teal-500/25 active:scale-[0.97] transition-all disabled:opacity-40 disabled:pointer-events-none"
    >
      {label}
    </button>
  );
}
