import React, { useState, useCallback, useMemo } from 'react';
import { Plane, Briefcase, GraduationCap, FileText, Sparkles, ArrowLeft, ArrowRight, Check, Eye, EyeOff, Baby, School, Users, UserCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useUserProgress } from '../contexts/UserProgressContext.jsx';
import { t } from '../utils/translations.js';

/* ───────── Placement-test questions (3 per level, A1-C1) ───────── */
/* Each question has:
   - question: the question text
   - questionHe: Hebrew translation of the question (for context)
   - options: 4 answer options
   - correct: index of correct answer
   - level: CEFR level
   - hint / hintHe: optional hint for difficult questions
   - type: 'grammar' | 'vocabulary' | 'comprehension'
*/
const PLACEMENT_QUESTIONS = [
  // ─── A1 (very basic) ───
  { question: 'What is the correct greeting for the morning?',
    questionHe: 'מה הברכה הנכונה לבוקר?',
    options: ['Good night', 'Good morning', 'Good luck', 'Goodbye'],
    correct: 1, level: 'A1', type: 'vocabulary' },
  { question: 'She ___ a student.',
    questionHe: 'היא ___ תלמידה.',
    options: ['am', 'is', 'are', 'be'],
    correct: 1, level: 'A1', type: 'grammar' },
  { question: 'What does "Thank you" mean?',
    questionHe: 'מה המשמעות של "Thank you"?',
    options: ['בבקשה', 'סליחה', 'תודה', 'שלום'],
    correct: 2, level: 'A1', type: 'vocabulary' },
  // ─── A2 ───
  { question: 'I ___ to the store yesterday.',
    questionHe: 'אני ___ לחנות אתמול.',
    options: ['go', 'goes', 'went', 'going'],
    correct: 2, level: 'A2', type: 'grammar',
    hint: 'Yesterday = past tense', hintHe: 'אתמול = זמן עבר' },
  { question: 'What does "Delicious" mean?',
    questionHe: 'מה המשמעות של "Delicious"?',
    options: ['יפה', 'טעים', 'גדול', 'מהיר'],
    correct: 1, level: 'A2', type: 'vocabulary' },
  { question: 'There are ___ apples on the table.',
    questionHe: 'יש ___ תפוחים על השולחן.',
    options: ['much', 'a', 'some', 'any'],
    correct: 2, level: 'A2', type: 'grammar' },
  // ─── B1 ───
  { question: 'If it rains tomorrow, I ___ at home.',
    questionHe: 'אם ירד גשם מחר, אני ___ בבית.',
    options: ['stay', 'will stay', 'stayed', 'would stay'],
    correct: 1, level: 'B1', type: 'grammar',
    hint: 'Future condition', hintHe: 'תנאי עתידי' },
  { question: 'What does "Although" mean?',
    questionHe: 'מה המשמעות של "Although"?',
    options: ['בגלל', 'למרות', 'כאשר', 'אחרי'],
    correct: 1, level: 'B1', type: 'vocabulary' },
  { question: 'The movie was ___ boring that we left early.',
    questionHe: 'הסרט היה ___ משעמם שיצאנו מוקדם.',
    options: ['such', 'too', 'so', 'very'],
    correct: 2, level: 'B1', type: 'grammar' },
  // ─── B2 ───
  { question: 'What does "Nevertheless" mean?',
    questionHe: 'מה המשמעות של "Nevertheless"?',
    options: ['לעולם לא', 'בכל זאת', 'לפעמים', 'מאוחר יותר'],
    correct: 1, level: 'B2', type: 'vocabulary' },
  { question: 'I wish I ___ more time to travel last year.',
    questionHe: 'הלוואי ש ___ יותר זמן לטייל בשנה שעברה.',
    options: ['have', 'had had', 'would have', 'having'],
    correct: 1, level: 'B2', type: 'grammar',
    hint: 'Past wish = past perfect', hintHe: 'משאלה על העבר = past perfect' },
  { question: 'The report ___ by the time the meeting starts.',
    questionHe: 'הדוח ___ עד שהישיבה תתחיל.',
    options: ['will have been completed', 'will complete', 'is completing', 'has completed'],
    correct: 0, level: 'B2', type: 'grammar' },
  // ─── C1 ───
  { question: 'What does "Ubiquitous" mean?',
    questionHe: 'מה המשמעות של "Ubiquitous"?',
    options: ['נדיר', 'נמצא בכל מקום', 'מסתורי', 'עתיק'],
    correct: 1, level: 'C1', type: 'vocabulary' },
  { question: 'Hardly ___ the station when the train departed.',
    questionHe: 'בקושי ___ לתחנה כשהרכבת יצאה.',
    options: ['I reached', 'had I reached', 'I had reached', 'did I reach'],
    correct: 1, level: 'C1', type: 'grammar',
    hint: 'Inversion after "Hardly"', hintHe: 'היפוך אחרי "Hardly"' },
  { question: 'She couldn\'t help but ___ at the absurdity of the situation.',
    questionHe: 'היא לא יכלה שלא ___ על האבסורד של המצב.',
    options: ['to laugh', 'laughing', 'laugh', 'laughed'],
    correct: 2, level: 'C1', type: 'grammar' },
];

const LEVELS_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1'];

/* ─────────────────── helpers ─────────────────── */
function calculateCefrLevel(answers) {
  const countByLevel = {};
  const correctByLevel = {};
  PLACEMENT_QUESTIONS.forEach((q, i) => {
    countByLevel[q.level] = (countByLevel[q.level] || 0) + 1;
    if (answers[i] === q.correct) {
      correctByLevel[q.level] = (correctByLevel[q.level] || 0) + 1;
    }
  });
  let highest = 'A1';
  for (const lvl of LEVELS_ORDER) {
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
   ═══════════════════════════════════════════════ */
export default function OnboardingPage({ onComplete, onChildLogin }) {
  const { uiLang, setUiLang, dir } = useTheme();
  const { signInWithGoogle, signUpWithEmail, signInWithEmail } = useAuth();
  const { updateProgress } = useUserProgress();

  const [step, setStep] = useState(0);

  // Shared state across steps
  const [ageGroup, setAgeGroup] = useState(null);
  const [motivation, setMotivation] = useState(null);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(10);
  const [cefrLevel, setCefrLevel] = useState('A1');

  // Placement test state
  const [testStarted, setTestStarted] = useState(false);
  const [testIndex, setTestIndex] = useState(0);
  const [testAnswers, setTestAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [testFinished, setTestFinished] = useState(false);

  // Account form state
  const [authMode, setAuthMode] = useState('signin'); // signin | signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const isRTL = uiLang === 'he';
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;
  const NextArrow = isRTL ? ArrowLeft : ArrowRight;

  /* ── navigation helpers ── */
  const totalSteps = 7; // 0:welcome, 1:lang, 2:age, 3:motivation, 4:placement, 5:dailyGoal, 6:account
  const nextStep = useCallback(() => setStep(s => {
    // Kids (4-7) skip motivation and placement test → go directly from age to daily goal
    if (s === 2 && ageGroup === 'kids') return 5;
    return Math.min(s + 1, totalSteps - 1);
  }), [ageGroup]);
  const prevStep = useCallback(() => setStep(s => {
    // Kids going back from daily goal should return to age selection
    if (s === 5 && ageGroup === 'kids') return 2;
    return Math.max(s - 1, 0);
  }), [ageGroup]);

  /* ── finish ── */
  const handleFinish = useCallback(async () => {
    try {
      await updateProgress({
        onboardingComplete: true,
        cefrLevel: ageGroup === 'kids' ? 'A1' : cefrLevel,
        dailyGoalMinutes,
        motivation: ageGroup === 'kids' ? 'fun' : (motivation || 'fun'),
        ageGroup: ageGroup || 'adults',
      });
    } catch (e) {
      console.error('Failed to save onboarding progress', e);
    }
    onComplete();
  }, [cefrLevel, dailyGoalMinutes, motivation, ageGroup, onComplete, updateProgress]);

  /* ── placement test answer handler ── */
  const handleTestAnswer = useCallback((optionIndex) => {
    setSelectedOption(optionIndex);
    setTimeout(() => {
      const newAnswers = [...testAnswers, optionIndex];
      setTestAnswers(newAnswers);
      setSelectedOption(null);

      if (testIndex + 1 >= PLACEMENT_QUESTIONS.length) {
        const level = calculateCefrLevel(newAnswers);
        setCefrLevel(level);
        setTestFinished(true);
      } else {
        setTestIndex(i => i + 1);
      }
    }, 600);
  }, [testAnswers, testIndex]);

  /* ── skip question (don't know) ── */
  const handleSkipQuestion = useCallback(() => {
    const newAnswers = [...testAnswers, -1]; // -1 = skipped
    setTestAnswers(newAnswers);

    if (testIndex + 1 >= PLACEMENT_QUESTIONS.length) {
      const level = calculateCefrLevel(newAnswers);
      setCefrLevel(level);
      setTestFinished(true);
    } else {
      setTestIndex(i => i + 1);
    }
  }, [testAnswers, testIndex]);

  /* ── auth handlers ── */
  const handleGoogle = useCallback(async () => {
    setAuthError('');
    setAuthLoading(true);
    try {
      await signInWithGoogle();
      // Small delay to let Firestore user doc be created by the snapshot listener
      await new Promise(r => setTimeout(r, 500));
      await handleFinish();
    } catch (e) {
      setAuthError(e.message);
    } finally {
      setAuthLoading(false);
    }
  }, [signInWithGoogle, handleFinish]);

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
      // Small delay to let Firestore user doc be created by the snapshot listener
      await new Promise(r => setTimeout(r, 500));
      await handleFinish();
    } catch (err) {
      // Show user-friendly error messages in Hebrew
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
  }, [email, password, displayName, authMode, signUpWithEmail, signInWithEmail, handleFinish, uiLang]);

  /* ─────────────── Step renderers ─────────────── */

  /* 0 - Welcome */
  const renderWelcome = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6 animate-fade-in">
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/30">
        <span className="text-4xl font-black text-white">SE</span>
      </div>
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
        SpeakEasy
      </h1>
      <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 max-w-xs">
        {t('appTagline', uiLang)}
      </p>
      <button
        onClick={nextStep}
        className="px-10 py-4 rounded-2xl font-bold text-white text-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 active:scale-[0.97] transition-all duration-200"
      >
        {uiLang === 'he' ? 'בוא נתחיל' : 'Get Started'}
      </button>

      {/* Child login link */}
      <button
        onClick={onChildLogin}
        className="mt-6 text-sm text-gray-400 hover:text-indigo-500 transition-colors"
      >
        {t('orLoginAsChild', uiLang)}
      </button>
    </div>
  );

  /* 1 - Language Select */
  const renderLanguageSelect = () => (
    <StepWrapper title={t('chooseLanguage', uiLang)} onBack={prevStep}>
      <div className="grid grid-cols-2 gap-4 mt-6">
        {[
          { code: 'he', label: 'עברית', flag: '🇮🇱' },
          { code: 'en', label: 'English', flag: '🇬🇧' },
        ].map(lang => (
          <button
            key={lang.code}
            onClick={() => setUiLang(lang.code)}
            className={`glass-card p-6 flex flex-col items-center gap-3 transition-all duration-200 active:scale-[0.97] border-2 ${
              uiLang === lang.code
                ? 'border-indigo-500 shadow-lg shadow-indigo-500/20'
                : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <span className="text-5xl">{lang.flag}</span>
            <span className="font-bold text-lg">{lang.label}</span>
          </button>
        ))}
      </div>
      <NextButton onClick={nextStep} label={t('next', uiLang)} />
    </StepWrapper>
  );

  /* 2 - Age Group Selection */
  const ageGroups = useMemo(() => [
    { key: 'kids', icon: Baby, emoji: '🧒', label: uiLang === 'he' ? 'ילדים (4-7)' : 'Kids (4-7)', desc: uiLang === 'he' ? 'אותיות, מילים ומשחקים' : 'Letters, words & games' },
    { key: 'children', icon: School, emoji: '📚', label: uiLang === 'he' ? 'ילדים (8-12)' : 'Children (8-12)', desc: uiLang === 'he' ? 'קריאה, כתיבה ושיחה' : 'Reading, writing & talking' },
    { key: 'teens', icon: Users, emoji: '🎓', label: uiLang === 'he' ? 'נוער (13-17)' : 'Teens (13-17)', desc: uiLang === 'he' ? 'דקדוק, אוצר מילים ושיחה' : 'Grammar, vocabulary & chat' },
    { key: 'adults', icon: UserCircle, emoji: '💼', label: uiLang === 'he' ? 'מבוגרים (18+)' : 'Adults (18+)', desc: uiLang === 'he' ? 'הכל כלול' : 'Full experience' },
  ], [uiLang]);

  const renderAgeSelect = () => (
    <StepWrapper title={uiLang === 'he' ? 'מי לומד?' : 'Who is learning?'} onBack={prevStep}>
      <div className="flex flex-col gap-3 mt-6">
        {ageGroups.map(ag => {
          const isSelected = ageGroup === ag.key;
          return (
            <button
              key={ag.key}
              onClick={() => setAgeGroup(ag.key)}
              className={`glass-card p-4 flex items-center gap-4 transition-all duration-200 active:scale-[0.97] border-2 ${
                isSelected
                  ? 'border-indigo-500 shadow-lg shadow-indigo-500/20 bg-indigo-50 dark:bg-indigo-950/30'
                  : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <span className="text-4xl">{ag.emoji}</span>
              <div className="text-start">
                <span className="font-bold text-base block">{ag.label}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{ag.desc}</span>
              </div>
              {isSelected && (
                <div className="ml-auto w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                  <Check size={14} className="text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
      <NextButton onClick={nextStep} label={t('next', uiLang)} disabled={!ageGroup} />
    </StepWrapper>
  );

  /* 3 - Motivation */
  const motivations = useMemo(() => [
    { key: 'travel', icon: Plane, label: t('travel', uiLang) },
    { key: 'work', icon: Briefcase, label: t('work', uiLang) },
    { key: 'study', icon: GraduationCap, label: t('study', uiLang) },
    { key: 'exam', icon: FileText, label: t('exam', uiLang) },
    { key: 'fun', icon: Sparkles, label: t('fun', uiLang) },
  ], [uiLang]);

  const renderMotivation = () => (
    <StepWrapper title={t('whyLearning', uiLang)} onBack={prevStep}>
      <div className="grid grid-cols-2 gap-3 mt-6">
        {motivations.map(m => {
          const Icon = m.icon;
          const isSelected = motivation === m.key;
          return (
            <button
              key={m.key}
              onClick={() => setMotivation(m.key)}
              className={`glass-card p-5 flex flex-col items-center gap-3 transition-all duration-200 active:scale-[0.97] border-2 ${
                isSelected
                  ? 'border-indigo-500 shadow-lg shadow-indigo-500/20 bg-indigo-50 dark:bg-indigo-950/30'
                  : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isSelected
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
              }`}>
                <Icon size={24} />
              </div>
              <span className="font-semibold text-sm">{m.label}</span>
            </button>
          );
        })}
      </div>
      <NextButton onClick={nextStep} label={t('next', uiLang)} disabled={!motivation} />
    </StepWrapper>
  );

  /* 3 - Placement Test */
  const renderPlacementTest = () => {
    if (!testStarted && !testFinished) {
      // Intro screen
      return (
        <StepWrapper title={t('placementTest', uiLang)} onBack={prevStep}>
          <p className="text-gray-500 dark:text-gray-400 text-center mt-4 mb-8">
            {t('placementTestDesc', uiLang)}
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setTestStarted(true)}
              className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/25 active:scale-[0.97] transition-all"
            >
              {t('startTest', uiLang)}
            </button>
            <button
              onClick={() => {
                setCefrLevel('A1');
                setTestFinished(true);
              }}
              className="w-full py-3 rounded-2xl font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              {t('skipTest', uiLang)}
            </button>
          </div>
        </StepWrapper>
      );
    }

    if (testFinished) {
      // Result screen
      const correctCount = testAnswers.filter((a, i) => a === PLACEMENT_QUESTIONS[i].correct).length;
      const skippedCount = testAnswers.filter(a => a === -1).length;
      const levelDescriptions = {
        A1: { en: 'Beginner - Perfect for starting your journey!', he: 'מתחיל - מושלם כדי להתחיל את המסע!' },
        A2: { en: 'Elementary - You know the basics!', he: 'בסיסי - אתה מכיר את הבסיס!' },
        B1: { en: 'Intermediate - Nice! You can hold conversations.', he: 'בינוני - יפה! אתה יכול לנהל שיחות.' },
        B2: { en: 'Upper Intermediate - Impressive vocabulary!', he: 'בינוני-מתקדם - אוצר מילים מרשים!' },
        C1: { en: 'Advanced - Excellent command of English!', he: 'מתקדם - שליטה מצוינת באנגלית!' },
      };
      return (
        <StepWrapper title={t('placementTest', uiLang)} onBack={prevStep}>
          <div className="flex flex-col items-center mt-8 gap-5">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/30 animate-pop-in">
              <span className="text-3xl font-black text-white">{cefrLevel}</span>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-1">
                {uiLang === 'he' ? 'הרמה שלך' : 'Your Level'}
              </h3>
              <p className="text-sm text-indigo-500 dark:text-indigo-400 font-medium mb-2">
                {levelDescriptions[cefrLevel]?.[uiLang] || levelDescriptions[cefrLevel]?.en}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {uiLang === 'he'
                  ? `ענית נכון על ${correctCount} מתוך ${PLACEMENT_QUESTIONS.length} שאלות`
                  : `You answered ${correctCount} of ${PLACEMENT_QUESTIONS.length} correctly`}
                {skippedCount > 0 && (
                  <span className="text-gray-400">
                    {uiLang === 'he' ? ` (דילגת על ${skippedCount})` : ` (skipped ${skippedCount})`}
                  </span>
                )}
              </p>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center px-4">
              {uiLang === 'he'
                ? 'תמיד אפשר לשנות את הרמה מאוחר יותר בהגדרות'
                : 'You can always change your level later in settings'}
            </p>
          </div>
          <NextButton onClick={nextStep} label={t('next', uiLang)} />
        </StepWrapper>
      );
    }

    // Question screen
    const q = PLACEMENT_QUESTIONS[testIndex];
    const progress = ((testIndex) / PLACEMENT_QUESTIONS.length) * 100;
    const levelColors = { A1: 'text-emerald-500', A2: 'text-blue-500', B1: 'text-amber-500', B2: 'text-orange-500', C1: 'text-red-500' };

    return (
      <StepWrapper title={t('placementTest', uiLang)} onBack={prevStep}>
        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 mb-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between mb-4">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 ${levelColors[q.level] || ''}`}>
            {q.level}
          </span>
          <span className="text-xs text-gray-400">
            {testIndex + 1} {t('of', uiLang)} {PLACEMENT_QUESTIONS.length}
          </span>
        </div>

        {/* Question */}
        <div className="glass-card p-5 mb-4">
          <p className="font-semibold text-lg text-center leading-relaxed" dir="ltr">{q.question}</p>
          {/* Hebrew translation for context */}
          {uiLang === 'he' && q.questionHe && (
            <p className="text-sm text-gray-400 text-center mt-2" dir="rtl">{q.questionHe}</p>
          )}
          {/* Hint */}
          {q.hint && (
            <p className="text-xs text-indigo-500 dark:text-indigo-400 text-center mt-2 italic">
              {uiLang === 'he' && q.hintHe ? q.hintHe : q.hint}
            </p>
          )}
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2.5">
          {q.options.map((opt, i) => {
            let btnClass = 'glass-card p-3.5 text-center font-medium transition-all duration-200 active:scale-[0.97] border-2 ';
            if (selectedOption === null) {
              btnClass += 'border-transparent hover:border-indigo-400';
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

          {/* Skip / I don't know button */}
          {selectedOption === null && (
            <button
              onClick={handleSkipQuestion}
              className="mt-1 py-2.5 rounded-xl text-sm font-medium text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              {uiLang === 'he' ? 'לא יודע/ת ←' : "I don't know →"}
            </button>
          )}
        </div>
      </StepWrapper>
    );
  };

  /* 4 - Daily Goal */
  const goalOptions = [5, 10, 15, 20];
  const renderDailyGoal = () => (
    <StepWrapper title={t('dailyGoalSelect', uiLang)} onBack={prevStep}>
      <div className="grid grid-cols-2 gap-4 mt-6">
        {goalOptions.map(mins => {
          const isSelected = dailyGoalMinutes === mins;
          const pct = (mins / 20) * 100;
          return (
            <button
              key={mins}
              onClick={() => setDailyGoalMinutes(mins)}
              className={`flex flex-col items-center gap-3 p-5 rounded-2xl transition-all duration-200 active:scale-[0.97] border-2 ${
                isSelected
                  ? 'border-indigo-500 shadow-lg shadow-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/30'
                  : 'glass-card border-transparent hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {/* Circular display */}
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="5"
                    className="text-gray-200 dark:text-gray-700" />
                  <circle cx="40" cy="40" r="34" fill="none" strokeWidth="5" strokeLinecap="round"
                    className={isSelected ? 'text-indigo-500' : 'text-gray-400 dark:text-gray-500'}
                    strokeDasharray={`${2 * Math.PI * 34}`}
                    strokeDashoffset={`${2 * Math.PI * 34 * (1 - pct / 100)}`}
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                  />
                </svg>
                <span className={`absolute inset-0 flex items-center justify-center text-xl font-bold ${
                  isSelected ? 'text-indigo-600 dark:text-indigo-400' : ''
                }`}>
                  {mins}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('minutes', uiLang)}
              </span>
            </button>
          );
        })}
      </div>
      <NextButton onClick={nextStep} label={t('next', uiLang)} />
    </StepWrapper>
  );

  /* 5 - Account Creation */
  const renderAccount = () => (
    <StepWrapper title={authMode === 'signup' ? t('createAccount', uiLang) : t('signIn', uiLang)} onBack={prevStep}>
      <div className="flex flex-col gap-4 mt-6">
        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={authLoading}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm active:scale-[0.97] transition-all disabled:opacity-50"
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
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          <span className="text-sm text-gray-400">{t('or', uiLang)}</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Email form */}
        <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
          {authMode === 'signup' && (
            <input
              type="text"
              placeholder={t('displayName', uiLang)}
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            />
          )}
          <input
            type="email"
            placeholder={t('email', uiLang)}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder={t('password', uiLang)}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              style={{ [isRTL ? 'left' : 'right']: '12px' }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {authError && (
            <p className="text-sm text-red-500 text-center">{authError}</p>
          )}

          <button
            type="submit"
            disabled={authLoading}
            className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/25 active:scale-[0.97] transition-all disabled:opacity-50"
          >
            {authLoading
              ? t('loading', uiLang)
              : authMode === 'signup'
                ? t('signUp', uiLang)
                : t('signIn', uiLang)}
          </button>
        </form>

        {/* Toggle auth mode */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          {authMode === 'signup' ? t('alreadyHaveAccount', uiLang) : t('dontHaveAccount', uiLang)}{' '}
          <button
            type="button"
            onClick={() => { setAuthMode(m => m === 'signup' ? 'signin' : 'signup'); setAuthError(''); }}
            className="text-indigo-500 font-semibold hover:underline"
          >
            {authMode === 'signup' ? t('signIn', uiLang) : t('signUp', uiLang)}
          </button>
        </p>
      </div>
    </StepWrapper>
  );

  /* ─────────────── Step array ─────────────── */
  const steps = [renderWelcome, renderLanguageSelect, renderAgeSelect, renderMotivation, renderPlacementTest, renderDailyGoal, renderAccount];

  /* ═══════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════ */
  return (
    <div
      dir={dir}
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 transition-colors duration-300"
    >
      {/* Step indicator dots (hidden on welcome screen) */}
      {step > 0 && (
        <div className="flex items-center justify-center gap-2 pt-6 pb-2">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step
                  ? 'w-8 bg-gradient-to-r from-indigo-500 to-purple-500'
                  : i < step
                    ? 'w-2 bg-indigo-400'
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
      className="w-full mt-8 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/25 active:scale-[0.97] transition-all disabled:opacity-40 disabled:pointer-events-none"
    >
      {label}
    </button>
  );
}
