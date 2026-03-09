import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ArrowLeft, Check, Eye, EyeOff, Lock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useUserProgress } from '../contexts/UserProgressContext.jsx';
import { LEVEL_META } from '../data/curriculum/curriculum-index.js';
import { t, tReplace, RTL_LANGS, SUPPORTED_LANGS, LANG_LABELS } from '../utils/translations.js';

/* Helper: get the data-object property suffix for the current uiLang
   e.g. 'he' → 'He', 'ar' → 'Ar', 'ru' → 'Ru', 'en'/default → '' */
const langSuffix = (lang) =>
  lang === 'he' ? 'He' : lang === 'ar' ? 'Ar' : lang === 'ru' ? 'Ru' : '';

/* ───────── Placement-test questions (3 per level, 1-5) ───────── */
const PLACEMENT_QUESTIONS = [
  // ─── Level 1 (very basic) ───
  { question: 'What is the correct greeting for the morning?',
    questionHe: 'מה הברכה הנכונה לבוקר?',
    questionAr: 'ما هي التحية الصحيحة للصباح؟',
    questionRu: 'Какое приветствие подходит для утра?',
    options: ['Good night', 'Good morning', 'Good luck', 'Goodbye'],
    correct: 1, level: 1, type: 'vocabulary' },
  { question: 'She ___ a student.',
    questionHe: 'היא ___ תלמידה.',
    questionAr: 'هي ___ طالبة.',
    questionRu: 'Она ___ студентка.',
    options: ['am', 'is', 'are', 'be'],
    correct: 1, level: 1, type: 'grammar' },
  { question: 'What does "Thank you" mean?',
    questionHe: 'מה המשמעות של "Thank you"?',
    questionAr: 'ما معنى "Thank you"؟',
    questionRu: 'Что означает "Thank you"?',
    options: ['בבקשה', 'סליחה', 'תודה', 'שלום'],
    optionsAr: ['من فضلك', 'عذراً', 'شكراً', 'مرحباً'],
    optionsRu: ['пожалуйста', 'извините', 'спасибо', 'привет'],
    correct: 2, level: 1, type: 'vocabulary' },
  // ─── Level 2 ───
  { question: 'I ___ to the store yesterday.',
    questionHe: 'אני ___ לחנות אתמול.',
    questionAr: 'أنا ___ إلى المتجر أمس.',
    questionRu: 'Я ___ в магазин вчера.',
    options: ['go', 'goes', 'went', 'going'],
    correct: 2, level: 2, type: 'grammar',
    hint: 'Yesterday = past tense', hintHe: 'אתמול = זמן עבר', hintAr: 'أمس = زمن ماضٍ', hintRu: 'Вчера = прошедшее время' },
  { question: 'What does "Delicious" mean?',
    questionHe: 'מה המשמעות של "Delicious"?',
    questionAr: 'ما معنى "Delicious"؟',
    questionRu: 'Что означает "Delicious"?',
    options: ['יפה', 'טעים', 'גדול', 'מהיר'],
    optionsAr: ['جميل', 'لذيذ', 'كبير', 'سريع'],
    optionsRu: ['красивый', 'вкусный', 'большой', 'быстрый'],
    correct: 1, level: 2, type: 'vocabulary' },
  { question: 'There are ___ apples on the table.',
    questionHe: 'יש ___ תפוחים על השולחן.',
    questionAr: 'يوجد ___ تفاحات على الطاولة.',
    questionRu: 'На столе ___ яблок.',
    options: ['much', 'a', 'some', 'any'],
    correct: 2, level: 2, type: 'grammar' },
  // ─── Level 3 ───
  { question: 'If it rains tomorrow, I ___ at home.',
    questionHe: 'אם ירד גשם מחר, אני ___ בבית.',
    questionAr: 'إذا أمطرت غدًا، سـ ___ في البيت.',
    questionRu: 'Если завтра будет дождь, я ___ дома.',
    options: ['stay', 'will stay', 'stayed', 'would stay'],
    correct: 1, level: 3, type: 'grammar',
    hint: 'Future condition', hintHe: 'תנאי עתידי', hintAr: 'شرط مستقبلي', hintRu: 'Условие будущего' },
  { question: 'What does "Although" mean?',
    questionHe: 'מה המשמעות של "Although"?',
    questionAr: 'ما معنى "Although"؟',
    questionRu: 'Что означает "Although"?',
    options: ['בגלל', 'למרות', 'כאשר', 'אחרי'],
    optionsAr: ['بسبب', 'رغم أن', 'عندما', 'بعد'],
    optionsRu: ['потому что', 'хотя', 'когда', 'после'],
    correct: 1, level: 3, type: 'vocabulary' },
  { question: 'The movie was ___ boring that we left early.',
    questionHe: 'הסרט היה ___ משעמם שיצאנו מוקדם.',
    questionAr: 'كان الفيلم ___ مملًا لدرجة أننا غادرنا باكرًا.',
    questionRu: 'Фильм был ___ скучным, что мы ушли рано.',
    options: ['such', 'too', 'so', 'very'],
    correct: 2, level: 3, type: 'grammar' },
  // ─── Level 4 ───
  { question: 'What does "Nevertheless" mean?',
    questionHe: 'מה המשמעות של "Nevertheless"?',
    questionAr: 'ما معنى "Nevertheless"؟',
    questionRu: 'Что означает "Nevertheless"?',
    options: ['לעולם לא', 'בכל זאת', 'לפעמים', 'מאוחר יותר'],
    optionsAr: ['أبداً', 'ومع ذلك', 'أحياناً', 'لاحقاً'],
    optionsRu: ['никогда', 'тем не менее', 'иногда', 'позже'],
    correct: 1, level: 4, type: 'vocabulary' },
  { question: 'I wish I ___ more time to travel last year.',
    questionHe: 'הלוואי ש ___ יותר זמן לטייל בשנה שעברה.',
    questionAr: 'أتمنى لو ___ وقتًا أكثر للسفر العام الماضي.',
    questionRu: 'Жаль, что я не ___ больше времени на путешествия в прошлом году.',
    options: ['have', 'had had', 'would have', 'having'],
    correct: 1, level: 4, type: 'grammar',
    hint: 'Past wish = past perfect', hintHe: 'משאלה על העבר = past perfect', hintAr: 'أمنية ماضية = past perfect', hintRu: 'Желание о прошлом = past perfect' },
  { question: 'The report ___ by the time the meeting starts.',
    questionHe: 'הדוח ___ עד שהישיבה תתחיל.',
    questionAr: 'التقرير ___ بحلول بدء الاجتماع.',
    questionRu: 'Отчёт ___ к началу совещания.',
    options: ['will have been completed', 'will complete', 'is completing', 'has completed'],
    correct: 0, level: 4, type: 'grammar' },
  // ─── Level 5 ───
  { question: 'What does "Ubiquitous" mean?',
    questionHe: 'מה המשמעות של "Ubiquitous"?',
    questionAr: 'ما معنى "Ubiquitous"؟',
    questionRu: 'Что означает "Ubiquitous"?',
    options: ['נדיר', 'נמצא בכל מקום', 'מסתורי', 'עתיק'],
    optionsAr: ['نادر', 'موجود في كل مكان', 'غامض', 'قديم'],
    optionsRu: ['редкий', 'везде присутствующий', 'таинственный', 'древний'],
    correct: 1, level: 5, type: 'vocabulary' },
  { question: 'Hardly ___ the station when the train departed.',
    questionHe: 'בקושי ___ לתחנה כשהרכבת יצאה.',
    questionAr: 'بالكاد ___ المحطة عندما غادر القطار.',
    questionRu: 'Едва ___ станцию, когда поезд отправился.',
    options: ['I reached', 'had I reached', 'I had reached', 'did I reach'],
    correct: 1, level: 5, type: 'grammar',
    hint: 'Inversion after "Hardly"', hintHe: 'היפוך אחרי "Hardly"', hintAr: 'انقلاب بعد "Hardly"', hintRu: 'Инверсия после "Hardly"' },
  { question: 'She couldn\'t help but ___ at the absurdity of the situation.',
    questionHe: 'היא לא יכלה שלא ___ על האבסורד של המצב.',
    questionAr: 'لم تستطع إلا أن ___ من سخافة الموقف.',
    questionRu: 'Она не могла не ___ над абсурдностью ситуации.',
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
  const { uiLang, dir, setLang } = useTheme();
  const { signInWithGoogle, signInWithApple, signUpWithEmail, signInWithEmail, resetPassword, user } = useAuth();
  const { updateProgress, progress, addChild, familyCode } = useUserProgress();

  const [step, setStep] = useState(0);
  const onboardTimersRef = useRef([]);
  useEffect(() => () => { onboardTimersRef.current.forEach(clearTimeout); }, []);

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
  const [resetSent, setResetSent] = useState(false);

  const isRTL = RTL_LANGS.includes(uiLang);

  /* ── navigation helpers ── */
  const nextStep = useCallback(() => setStep(s => Math.min(s + 1, 4)), []);
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
    onboardTimersRef.current.push(setTimeout(() => {
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
    }, 600));
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
      const result = await signInWithApple();
      // signInWithRedirect returns undefined (browser navigates away)
      if (result) await handleAuthSuccess();
    } catch (e) {
      // Don't show error for popup-closed (user cancelled)
      if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') {
        // User cancelled — do nothing
      } else {
        setAuthError(t('appleSignInError', uiLang));
      }
    } finally {
      setAuthLoading(false);
    }
  }, [signInWithApple, handleAuthSuccess, uiLang]);

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
        setAuthError(t('authEmailInUse', uiLang));
      } else if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setAuthError(t('authWrongPassword', uiLang));
      } else if (code === 'auth/user-not-found') {
        setAuthError(t('authUserNotFound', uiLang));
      } else if (code === 'auth/invalid-email') {
        setAuthError(t('authInvalidEmail', uiLang));
      } else if (code === 'auth/weak-password') {
        setAuthError(t('authWeakPassword', uiLang));
      } else {
        setAuthError(err.message);
      }
    } finally {
      setAuthLoading(false);
    }
  }, [email, password, displayName, authMode, signUpWithEmail, signInWithEmail, handleAuthSuccess, uiLang]);

  /* ─────────────── Step renderers ─────────────── */

  /* Step 0 — Language Selection */
  const renderLanguageSelection = () => (
    <div className="landing-root" tabIndex={0}>
      <div className="landing-bg-blobs">
        <div className="landing-blob landing-blob-1" />
        <div className="landing-blob landing-blob-2" />
        <div className="landing-blob landing-blob-3" />
      </div>
      <div className="landing-hero" style={{ marginBottom: 16, marginTop: 24 }}>
        <div className="landing-glow" />
        <img
          src="/images/speakli-icon.webp"
          alt="Speakli"
          className="landing-character"
          style={{ width: 'min(40vw, 160px)' }}
          onError={e => { e.target.src = '/images/speakli-avatar.webp'; }}
        />
      </div>
      <p className="landing-tagline" style={{ marginBottom: 24 }}>Speakli</p>
      <p style={{ color: 'rgba(148,163,184,0.8)', fontSize: 16, marginBottom: 32, fontWeight: 500 }}>
        {t('chooseLanguage', 'he')}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320 }}>
        {SUPPORTED_LANGS.map(lang => (
          <button
            key={lang}
            onClick={() => { setLang(lang); nextStep(); }}
            style={{
              padding: '18px 24px',
              borderRadius: 18,
              border: '2px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.06)',
              color: '#fff',
              fontSize: 20,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              backdropFilter: 'blur(10px)',
              direction: RTL_LANGS.includes(lang) ? 'rtl' : 'ltr',
            }}
          >
            {LANG_LABELS[lang]}
          </button>
        ))}
      </div>
      <style>{`
        .landing-root {
          position: fixed; inset: 0;
          background: linear-gradient(160deg, #020c1b 0%, #0a1e3d 30%, #0f2d5a 60%, #0d1847 100%);
          display: flex; flex-direction: column; align-items: center;
          text-align: center;
          padding: calc(env(safe-area-inset-top, 0px) + 16px) 20px calc(env(safe-area-inset-bottom, 0px) + 20px);
          overflow-y: auto; -webkit-overflow-scrolling: touch;
        }
        .landing-bg-blobs { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
        .landing-blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.3; }
        .landing-blob-1 { width: 300px; height: 300px; top: -80px; right: -60px; background: radial-gradient(circle, #2563eb 0%, transparent 70%); animation: blob-drift 8s ease-in-out infinite; }
        .landing-blob-2 { width: 250px; height: 250px; bottom: 10%; left: -40px; background: radial-gradient(circle, #3b82f6 0%, transparent 70%); animation: blob-drift 10s ease-in-out infinite reverse; }
        .landing-blob-3 { width: 200px; height: 200px; top: 40%; right: -30px; background: radial-gradient(circle, #f59e0b 0%, transparent 70%); animation: blob-drift 12s ease-in-out infinite 2s; }
        @keyframes blob-drift { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(30px, -20px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.95); } }
        .landing-hero { position: relative; flex-shrink: 0; }
        .landing-glow { position: absolute; inset: -40%; background: radial-gradient(circle, rgba(59,130,246,0.5) 0%, rgba(37,99,235,0.25) 35%, rgba(245,158,11,0.1) 55%, transparent 70%); filter: blur(35px); animation: glow-breathe 4s ease-in-out infinite; }
        .landing-character { position: relative; width: min(55vw, 220px); height: auto; animation: hero-float 4s ease-in-out infinite; filter: drop-shadow(0 20px 50px rgba(59,130,246,0.4)); }
        @keyframes hero-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes glow-breathe { 0%, 100% { opacity: 0.7; transform: scale(1); } 50% { opacity: 1; transform: scale(1.08); } }
        .landing-tagline { font-size: clamp(22px, 5vw, 28px); font-weight: 800; background: linear-gradient(135deg, #93c5fd, #3b82f6, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0; }
      `}</style>
    </div>
  );

  /* Step 1 — Auth Screen (Beautiful Landing + Login/Register) */
  const renderAuth = () => (
    <div className="landing-root" tabIndex={0}>
      {/* Animated background blobs */}
      <div className="landing-bg-blobs">
        <div className="landing-blob landing-blob-1" />
        <div className="landing-blob landing-blob-2" />
        <div className="landing-blob landing-blob-3" />
      </div>

      {/* Hero: Speakli character with logo */}
      <div className="landing-hero">
        <div className="landing-glow" />
        <img
          src="/images/speakli-icon.webp"
          alt="Speakli"
          className="landing-character"
          onError={e => { e.target.src = '/images/speakli-avatar.webp'; }}
        />
      </div>

      {/* Tagline */}
      <p className="landing-tagline">
        {t('onboardingTagline', uiLang)}
      </p>
      <p className="landing-sub">
        {t('onboardingSub', uiLang)}
      </p>

      {/* Auth card */}
      <div className="landing-card">
        {/* Social buttons */}
        <button onClick={handleApple} disabled={authLoading} className="landing-social-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          {t('signInApple', uiLang)}
        </button>

        <button onClick={handleGoogle} disabled={authLoading} className="landing-social-btn">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {t('signInGoogle', uiLang)}
        </button>

        {/* Divider */}
        <div className="landing-divider">
          <div className="landing-divider-line" />
          <span>{t('orDivider', uiLang)}</span>
          <div className="landing-divider-line" />
        </div>

        {/* Email form */}
        <form onSubmit={handleEmailSubmit} className="landing-form">
          {authMode === 'signup' && (
            <input
              type="text"
              placeholder={t('displayName', uiLang)}
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="landing-input"
            />
          )}
          <input
            type="email"
            placeholder={t('email', uiLang)}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="landing-input"
          />
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder={t('password', uiLang)}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="landing-input"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="landing-eye-btn"
              style={{ [isRTL ? 'left' : 'right']: '14px' }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {authMode === 'signin' && (
            <div style={{ textAlign: 'center', margin: '4px 0 12px' }}>
              <button
                type="button"
                onClick={async () => {
                  if (!email) { setAuthError(t('enterEmail', uiLang)); return; }
                  try {
                    const resp = await fetch('/api/reset-password', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email }),
                    });
                    const data = await resp.json();
                    if (!resp.ok) throw new Error(data.detail || data.error || 'failed');
                    setResetSent(true);
                    setAuthError('');
                  } catch (err) {
                    console.error('Password reset error:', err);
                    setAuthError(t('resetError', uiLang) + (err.message ? ` (${err.message})` : ''));
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#60a5fa',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: '4px 8px',
                }}
              >
                {t('forgotPassword', uiLang)}
              </button>
            </div>
          )}

          {resetSent && (
            <p style={{ color: '#22c55e', fontSize: '13px', textAlign: 'center', marginBottom: '8px' }}>
              {t('resetEmailSent', uiLang)}
            </p>
          )}

          {authError && (
            <p className="landing-error">{authError}</p>
          )}

          <button type="submit" disabled={authLoading} className="landing-submit-btn">
            {authLoading
              ? t('loading', uiLang)
              : authMode === 'signup'
                ? t('signUp', uiLang)
                : t('signIn', uiLang)}
          </button>
        </form>

        {/* Toggle auth mode */}
        <p className="landing-toggle">
          {authMode === 'signup' ? t('alreadyHaveAccount', uiLang) : t('dontHaveAccount', uiLang)}{' '}
          <button
            type="button"
            onClick={() => { setAuthMode(m => m === 'signup' ? 'signin' : 'signup'); setAuthError(''); }}
            className="landing-toggle-btn"
          >
            {authMode === 'signup' ? t('signIn', uiLang) : t('signUp', uiLang)}
          </button>
        </p>

        {/* Child login */}
        <button onClick={onChildLogin} className="landing-child-btn">
          👧 {t('loginAsChild', uiLang)}
        </button>
      </div>

      <style>{`
        .landing-root {
          position: fixed; inset: 0;
          background: linear-gradient(160deg, #020c1b 0%, #0a1e3d 30%, #0f2d5a 60%, #0d1847 100%);
          display: flex; flex-direction: column; align-items: center;
          justify-content: center;
          text-align: center;
          padding: calc(env(safe-area-inset-top, 0px) + 8px) 20px calc(env(safe-area-inset-bottom, 0px) + 8px);
          overflow-y: auto; -webkit-overflow-scrolling: touch;
        }

        /* Animated background blobs */
        .landing-bg-blobs { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
        .landing-blob {
          position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.3;
        }
        .landing-blob-1 {
          width: 300px; height: 300px; top: -80px; right: -60px;
          background: radial-gradient(circle, #2563eb 0%, transparent 70%);
          animation: blob-drift 8s ease-in-out infinite;
        }
        .landing-blob-2 {
          width: 250px; height: 250px; bottom: 10%; left: -40px;
          background: radial-gradient(circle, #3b82f6 0%, transparent 70%);
          animation: blob-drift 10s ease-in-out infinite reverse;
        }
        .landing-blob-3 {
          width: 200px; height: 200px; top: 40%; right: -30px;
          background: radial-gradient(circle, #f59e0b 0%, transparent 70%);
          animation: blob-drift 12s ease-in-out infinite 2s;
        }
        @keyframes blob-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }

        /* Floating sparkles */
        .landing-particles { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
        .landing-particle {
          position: absolute; opacity: 0;
          animation: sparkle-float linear infinite;
        }
        @keyframes sparkle-float {
          0% { opacity: 0; transform: translateY(0) scale(0.5); }
          15% { opacity: 0.4; }
          50% { opacity: 0.2; transform: translateY(-30px) scale(1); }
          85% { opacity: 0.3; }
          100% { opacity: 0; transform: translateY(-60px) scale(0.5) rotate(180deg); }
        }

        /* Hero section */
        .landing-hero {
          position: relative; flex-shrink: 0;
          margin-bottom: 4px; margin-top: 0;
        }
        .landing-glow {
          position: absolute; inset: -40%;
          background: radial-gradient(circle, rgba(59,130,246,0.5) 0%, rgba(37,99,235,0.25) 35%, rgba(245,158,11,0.1) 55%, transparent 70%);
          filter: blur(35px);
          animation: glow-breathe 4s ease-in-out infinite;
        }
        .landing-ring {
          position: absolute; inset: -15%;
          border: 2px solid rgba(59,130,246,0.15);
          border-radius: 50%;
          animation: ring-spin 20s linear infinite;
        }
        .landing-ring::before {
          content: ''; position: absolute; top: -4px; left: 50%;
          width: 8px; height: 8px; border-radius: 50%;
          background: #3b82f6; box-shadow: 0 0 12px #3b82f6;
        }
        .landing-character {
          position: relative;
          width: min(28vw, 120px); height: auto;
          animation: hero-float 4s ease-in-out infinite;
          filter: drop-shadow(0 20px 50px rgba(59,130,246,0.4));
        }
        @keyframes hero-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-10px) rotate(1deg); }
          75% { transform: translateY(4px) rotate(-1deg); }
        }
        @keyframes glow-breathe {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes ring-spin { to { transform: rotate(360deg); } }

        /* Tagline */
        .landing-tagline {
          font-size: clamp(16px, 4vw, 20px); font-weight: 800;
          background: linear-gradient(135deg, #93c5fd, #3b82f6, #f59e0b);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          margin: 0 0 2px; flex-shrink: 0; letter-spacing: 0.3px;
        }
        .landing-sub {
          font-size: clamp(11px, 2.5vw, 13px); color: rgba(148,163,184,0.7);
          margin: 0 0 clamp(8px, 2vh, 14px); flex-shrink: 0; max-width: 300px;
        }

        /* Auth card */
        .landing-card {
          width: 100%; max-width: 380px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px; padding: 16px;
          backdrop-filter: blur(20px);
          display: flex; flex-direction: column; gap: 8px;
          flex-shrink: 0;
        }

        /* Social buttons */
        .landing-social-btn {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: 11px 0; border-radius: 12px; font-weight: 600; font-size: 14px;
          color: #fff; background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          cursor: pointer; transition: all 0.2s;
        }
        .landing-social-btn:active { transform: scale(0.97); }
        .landing-social-btn:disabled { opacity: 0.5; }
        .landing-social-btn:hover { background: rgba(255,255,255,0.12); }

        /* Divider */
        .landing-divider {
          display: flex; align-items: center; gap: 12px; margin: 2px 0;
        }
        .landing-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
        .landing-divider span { font-size: 13px; color: rgba(255,255,255,0.25); }

        /* Form */
        .landing-form { display: flex; flex-direction: column; gap: 8px; }
        .landing-input {
          width: 100%; padding: 11px 14px; border-radius: 12px;
          outline: none; color: #fff; font-size: 16px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          box-sizing: border-box; transition: border-color 0.2s;
        }
        .landing-input::placeholder { color: rgba(255,255,255,0.25); }
        .landing-input:focus { border-color: rgba(59,130,246,0.5); }
        .landing-eye-btn {
          position: absolute; top: 50%; transform: translateY(-50%);
          color: rgba(255,255,255,0.3); background: none; border: none; cursor: pointer; padding: 4px;
        }

        .landing-error { font-size: 13px; color: #f87171; text-align: center; margin: 0; }

        .landing-submit-btn {
          width: 100%; padding: 12px 0; border-radius: 12px;
          font-weight: 700; font-size: 15px; color: #fff;
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          border: none; cursor: pointer;
          box-shadow: 0 8px 30px rgba(37,99,235,0.35), inset 0 1px 0 rgba(255,255,255,0.15);
          transition: all 0.2s;
        }
        .landing-submit-btn:active { transform: scale(0.97); }
        .landing-submit-btn:disabled { opacity: 0.5; }
        .landing-submit-btn:hover { box-shadow: 0 12px 40px rgba(37,99,235,0.5); }

        .landing-toggle {
          text-align: center; font-size: 13px; color: rgba(255,255,255,0.35); margin: 2px 0 0;
        }
        .landing-toggle-btn {
          font-weight: 600; color: #3b82f6; background: none;
          border: none; cursor: pointer; font-size: 13px;
        }
        .landing-toggle-btn:hover { color: #60a5fa; }

        .landing-child-btn {
          margin-top: 4px; font-size: 13px; color: rgba(255,255,255,0.5);
          background: none; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; padding: 8px 20px; cursor: pointer;
          font-weight: 600; transition: all 0.2s;
        }
        .landing-child-btn:hover { background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.9); }
      `}</style>
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
              className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/25 active:scale-[0.97] transition-all"
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
            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between mb-4">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 ${levelColors[q.level] || ''}`}>
            {levelMeta?.emoji} {levelMeta?.[`name${langSuffix(uiLang)}`] || levelMeta?.name}
          </span>
          <span className="text-xs text-gray-400">
            {testIndex + 1} {t('of', uiLang)} {PLACEMENT_QUESTIONS.length}
          </span>
        </div>

        {/* Question */}
        <div className="glass-card p-5 mb-4">
          <p className="font-semibold text-lg text-center leading-relaxed" dir="ltr">{q.question}</p>
          {(() => {
            const nativeQ = q[`question${langSuffix(uiLang)}`];
            return nativeQ ? <p className="text-sm text-gray-400 text-center mt-2" dir={isRTL ? 'rtl' : 'ltr'}>{nativeQ}</p> : null;
          })()}
          {q.hint && (
            <p className="text-xs text-blue-500 dark:text-blue-400 text-center mt-2 italic">
              {q[`hint${langSuffix(uiLang)}`] || q.hint}
            </p>
          )}
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2.5">
          {(uiLang === 'ar' && q.optionsAr ? q.optionsAr : uiLang === 'ru' && q.optionsRu ? q.optionsRu : q.options).map((opt, i) => {
            let btnClass = 'glass-card p-3.5 text-center font-medium transition-all duration-200 active:scale-[0.97] border-2 ';
            if (selectedOption === null) {
              btnClass += 'border-transparent hover:border-blue-400';
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
              {t('dontKnow', uiLang)}
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
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-lg shadow-blue-500/20'
                  : isUnlocked
                    ? 'border-emerald-300 dark:border-emerald-700 bg-white dark:bg-gray-800/50'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 opacity-60'
              }`}
            >
              {/* Emoji */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                isAssigned
                  ? 'bg-gradient-to-br from-blue-600 to-blue-400 shadow-md'
                  : isUnlocked
                    ? 'bg-emerald-100 dark:bg-emerald-900/30'
                    : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                {meta.emoji}
              </div>

              {/* Text */}
              <div className="flex-1">
                <span className={`font-bold text-base block ${
                  isAssigned ? 'text-blue-700 dark:text-blue-300' : ''
                }`}>
                  {meta[`name${langSuffix(uiLang)}`] || meta.name}
                </span>
                <span className="text-xs text-gray-400">
                  {tReplace('levelNumber', uiLang, { n: meta.id })}
                </span>
              </div>

              {/* Status indicator */}
              {isAssigned ? (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500 text-white text-xs font-bold animate-pulse">
                  {t('youAreHere', uiLang)}
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
        {t('canChangeLevelLater', uiLang)}
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
    <StepWrapper title={t('addChildren', uiLang)} onBack={prevStep}>
      <p className="text-gray-500 dark:text-gray-400 text-center text-sm mt-1 mb-6">
        {t('addChildrenDesc', uiLang)}
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
                    {tReplace('childPinLabel', uiLang, { pin: child.pin })}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveChild(i)}
                  className="text-red-400 hover:text-red-600 text-sm font-medium"
                >
                  {t('removeChild', uiLang)}
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
          placeholder={t('childNamePlaceholder', uiLang)}
          value={newChildName}
          onChange={e => setNewChildName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
        />
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder={t('loginPinPlaceholder', uiLang)}
          value={newChildPin}
          onChange={e => setNewChildPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
        />
        <button
          onClick={handleAddChild}
          disabled={!newChildName.trim()}
          className="w-full py-3 rounded-xl font-semibold border-2 border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 active:scale-[0.97] transition-all disabled:opacity-40 disabled:pointer-events-none"
        >
          {t('addChildButton', uiLang)}
        </button>
      </div>

      <NextButton onClick={handleFinish} label={t('letsGoStart', uiLang)} />

      {childrenToAdd.length === 0 && (
        <button
          onClick={handleFinish}
          className="w-full mt-3 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all"
        >
          {t('skipAddLater', uiLang)}
        </button>
      )}
    </StepWrapper>
  );

  /* ─────────────── Step array ─────────────── */
  const steps = [renderLanguageSelection, renderAuth, renderPlacementTest, renderLevelDisplay, renderAddChildren];

  /* ═══════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════ */
  return (
    <div
      dir={dir}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 transition-colors duration-300"
    >
      {/* Step indicator dots (hidden on language + auth screens) */}
      {step > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6 pb-2">
          {[2, 3, 4].map(i => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step
                  ? 'w-8 bg-gradient-to-r from-blue-600 to-blue-400'
                  : i < step
                    ? 'w-2 bg-blue-400'
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
          <ArrowLeft size={18} className="rtl:rotate-180" />
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
      className="w-full mt-8 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 shadow-lg shadow-blue-500/25 active:scale-[0.97] transition-all disabled:opacity-40 disabled:pointer-events-none"
    >
      {label}
    </button>
  );
}
