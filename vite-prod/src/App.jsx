import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { ThemeProvider, useTheme } from './contexts/ThemeContext.jsx';
import { ChildAuthProvider, useChildAuth } from './contexts/ChildAuthContext.jsx';
import { UserProgressProvider, useUserProgress } from './contexts/UserProgressContext.jsx';
import { SpeechProvider } from './contexts/SpeechContext.jsx';
import { MusicProvider, useMusic } from './contexts/MusicContext.jsx';
import useSpacedRepetition from './hooks/useSpacedRepetition.js';

import Header from './components/layout/Header.jsx';
import BottomNav from './components/layout/BottomNav.jsx';
import PageTransition from './components/layout/PageTransition.jsx';
import LoadingSpinner from './components/shared/LoadingSpinner.jsx';
import ErrorBoundary from './components/shared/ErrorBoundary.jsx';
import PageErrorBoundary from './components/shared/PageErrorBoundary.jsx';

/* ── Eagerly loaded (critical path) ── */
import HomePage from './pages/HomePage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import KidsHomePage from './pages/KidsHomePage.jsx';

/* ── Lazy loaded with auto-reload on stale chunks ── */
function lazyRetry(importFn) {
  return lazy(() => importFn().catch((err) => {
    if (!sessionStorage.getItem('chunk_reload')) {
      sessionStorage.setItem('chunk_reload', '1');
      window.location.reload();
      return new Promise(() => {}); // hang until reload completes
    }
    sessionStorage.removeItem('chunk_reload');
    throw err;
  }));
}

const LessonPage = lazyRetry(() => import('./pages/LessonPage.jsx'));
const SimulationPage = lazyRetry(() => import('./pages/SimulationPage.jsx'));
const VocabularyPage = lazyRetry(() => import('./pages/VocabularyPage.jsx'));
const ReadingPage = lazyRetry(() => import('./pages/ReadingPage.jsx'));
const PronunciationPage = lazyRetry(() => import('./pages/PronunciationPage.jsx'));
const ProfilePage = lazyRetry(() => import('./pages/ProfilePage.jsx'));
const AchievementsPage = lazyRetry(() => import('./pages/AchievementsPage.jsx'));
const KidsAlphabetPage = lazyRetry(() => import('./pages/KidsAlphabetPage.jsx'));
const AudioLearningPage = lazyRetry(() => import('./pages/AudioLearningPage.jsx'));
const KidsGamesPage = lazyRetry(() => import('./pages/KidsGamesPage.jsx'));
const FamilyPage = lazyRetry(() => import('./pages/FamilyPage.jsx'));
const ChildLoginPage = lazyRetry(() => import('./pages/ChildLoginPage.jsx'));
const ProfilePickerPage = lazyRetry(() => import('./pages/ProfilePickerPage.jsx'));
const ChildProgressPage = lazyRetry(() => import('./pages/ChildProgressPage.jsx'));
const KidsTeacherPage = lazyRetry(() => import('./pages/KidsTeacherPage.jsx'));
const CurriculumPage = lazyRetry(() => import('./pages/CurriculumPage.jsx'));
const SupportPage = lazyRetry(() => import('./pages/SupportPage.jsx'));
const SupportFAQPage = lazyRetry(() => import('./pages/SupportFAQPage.jsx'));
const SupportContactPage = lazyRetry(() => import('./pages/SupportContactPage.jsx'));
const SupportTicketsPage = lazyRetry(() => import('./pages/SupportTicketsPage.jsx'));
const EnglishQuestPage = lazyRetry(() => import('./pages/EnglishQuestPage.jsx'));
const SkillsPage = lazyRetry(() => import('./pages/SkillsPage.jsx'));
const AdventurePage = lazyRetry(() => import('./pages/AdventurePage.jsx'));
const SpeakingCoachPage = lazyRetry(() => import('./pages/SpeakingCoachPage.jsx'));
const LifeCoachPage = lazyRetry(() => import('./pages/LifeCoachPage.jsx'));
const PricingPage = lazyRetry(() => import('./pages/PricingPage.jsx'));
const TalkingWorldPage = lazyRetry(() => import('./pages/TalkingWorldPage.jsx'));
const KidsAILessonPage = lazyRetry(() => import('./pages/KidsAILessonPage.jsx'));

import ChildModeBanner from './components/family/ChildModeBanner.jsx';
import MathGateModal from './components/family/MathGateModal.jsx';
import FloatingMusicBtn from './components/ui/FloatingMusicBtn.jsx';
import InstallBanner from './components/ui/InstallBanner.jsx';

/* ── Lazy loading fallback ── */
function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <LoadingSpinner />
    </div>
  );
}

import { t, lf } from './utils/translations.js';
import AchievementToast from './components/gamification/AchievementToast.jsx';

/* ── Email verification screen (shown at App level to survive OnboardingPage remounts) ── */
function EmailVerificationScreen({ user, onVerified }) {
  const { resendVerification, signOut } = useAuth();
  const { uiLang } = useTheme();
  const [error, setError] = useState('');
  const [resent, setResent] = useState(false);

  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center px-6 text-center"
      style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 50%, #C7D2FE 100%)' }}>
      <div className="text-6xl mb-4">📧</div>
      <h2 className="text-2xl font-black text-gray-900 mb-3">{t('verifyEmailTitle', uiLang)}</h2>
      <p className="text-gray-600 mb-2 max-w-sm">{t('verifyEmailDesc', uiLang)}</p>
      <p className="text-indigo-600 font-bold mb-6">{user.email}</p>
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      <button
        onClick={async () => {
          setError('');
          try {
            await user.reload();
            if (user.emailVerified) {
              sessionStorage.removeItem('se_verify');
              onVerified();
            } else {
              setError(t('emailNotVerifiedYet', uiLang));
            }
          } catch (e) {
            setError(e.message);
          }
        }}
        className="w-full max-w-xs py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-blue-500 shadow-lg mb-3"
      >
        {t('verifyEmailDone', uiLang)}
      </button>
      <button
        onClick={async () => {
          try {
            await resendVerification();
            setResent(true);
            setTimeout(() => setResent(false), 5000);
          } catch (e) {
            setError(e.message);
          }
        }}
        className="text-indigo-500 underline text-sm mb-4"
      >
        {resent ? t('verificationResent', uiLang) : t('resendVerification', uiLang)}
      </button>
      <button
        onClick={() => { sessionStorage.removeItem('se_verify'); signOut(); }}
        className="text-gray-400 text-xs underline"
      >
        {t('signOut', uiLang) || 'Sign out'}
      </button>
    </div>
  );
}

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { childUser, logoutChild } = useChildAuth();
  const { progress, loading: progressLoading, children, childrenLoaded, isChildMode, achievementToast, dismissAchievementToast } = useUserProgress();
  const { uiLang } = useTheme();
  const { dueCount } = useSpacedRepetition();
  const [currentPage, setCurrentPage] = useState('home');
  const [lessonData, setLessonData] = useState(null);
  const [showChildLogin, setShowChildLogin] = useState(false);
  const [showMathGate, setShowMathGate] = useState(false);
  // Skip profile picker if a child/parent was already selected in a previous session
  const [profileSelected, setProfileSelected] = useState(() => {
    return !!localStorage.getItem('speakeasy_activeChildId') || !!sessionStorage.getItem('speakeasy_profileSelected');
  });
  const [progressChildId, setProgressChildId] = useState(null);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [showWeakPasswordBanner, setShowWeakPasswordBanner] = useState(() => sessionStorage.getItem('se_weak_password') === '1');
  const isPopstateRef = useRef(false);
  const prevUserRef = useRef(user?.uid);
  const { setSection } = useMusic();

  // ── Background music: map pages to music sections ──
  useEffect(() => {
    if (!isChildMode) { setSection(null); return; }
    const map = {
      home: 'kids-home', alphabet: 'kids-home', vocabulary: 'kids-home',
      'kids-games': 'kids-games',
      lessons: 'kids-lessons', 'kids-teacher': 'kids-lessons', curriculum: 'kids-lessons', 'kids-ai-lesson': 'kids-lessons',
      'english-quest': 'kids-quest',
      'adventure': 'kids-adventure',
    };
    setSection(map[currentPage] || null);
  }, [currentPage, isChildMode, setSection]);

  // Reset profile picker when user changes (logout/login)
  // Skip reset if child login is active (activeChildId is set during child login flow)
  useEffect(() => {
    if (user?.uid !== prevUserRef.current) {
      const hasActiveChild = !!localStorage.getItem('speakeasy_activeChildId');
      if (hasActiveChild) {
        // Child login flow — ensure profile picker is skipped
        setProfileSelected(true);
      } else {
        // Regular login/logout — reset profile picker
        setProfileSelected(false);
        sessionStorage.removeItem('speakeasy_profileSelected');
        if (!user) {
          localStorage.removeItem('speakeasy_childSession');
        }
      }
      prevUserRef.current = user?.uid;
    }
  }, [user]);

  // Check URL for childJoin or subscription return parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('childJoin')) {
      setShowChildLogin(true);
    }
    if (params.get('subscription') === 'success') {
      setCurrentPage('profile');
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Browser back/forward button support
  useEffect(() => {
    window.history.replaceState({ page: 'home' }, '', '');

    const handlePopState = (e) => {
      if (e.state && e.state.page) {
        isPopstateRef.current = true;
        setCurrentPage(e.state.page);
      } else {
        isPopstateRef.current = true;
        setCurrentPage('home');
        window.history.replaceState({ page: 'home' }, '', '');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Dynamic body background: dark for auth/profile-picker, white for app
  useEffect(() => {
    const showingAuth = !user || (user && !progress.onboardingComplete);
    const showingPicker = !profileSelected && children.length > 0;
    if (showingAuth || showingPicker) {
      document.body.style.background = '#030712';
      document.documentElement.style.background = '#030712';
    } else {
      document.body.style.background = '#ffffff';
      document.documentElement.style.background = '#ffffff';
    }
  }, [user, progress.onboardingComplete, profileSelected, children.length]);

  // Remote child mode — fallback only when custom token auth hasn't completed
  // (normally the custom token signs in as parent, so the regular flow handles it)
  if (childUser?.isRemoteChild && !user) {
    return (
      <RemoteChildAppContent
        childUser={childUser}
        onLogout={() => setShowMathGate(true)}
        showMathGate={showMathGate}
        onMathSuccess={() => {
          setShowMathGate(false);
          logoutChild();
        }}
        onMathClose={() => setShowMathGate(false)}
      />
    );
  }

  // Child login page (standalone, from separate device)
  if (showChildLogin && !childUser) {
    return <Suspense fallback={<PageLoader />}><ChildLoginPage onBack={() => setShowChildLogin(false)} /></Suspense>;
  }

  // Show loading while auth initializes or children are loading
  if (authLoading || (user && progressLoading) || (user && progress.onboardingComplete && !childrenLoaded)) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #030712 0%, #0f172a 60%, #0d1847 100%)' }}>
        <div className="text-center">
          <img src="/images/speakli-icon.webp" alt="Speakli" style={{ width: '120px', height: 'auto', margin: '0 auto 16px', filter: 'drop-shadow(0 8px 32px rgba(59,130,246,0.3))' }} />
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // Show email verification screen if user signed up with email but hasn't verified
  const needsEmailVerification = user
    && !user.emailVerified
    && user.providerData?.some(p => p.providerId === 'password')
    && sessionStorage.getItem('se_verify') === '1';

  if (needsEmailVerification) {
    return (
      <EmailVerificationScreen
        user={user}
        onVerified={() => {
          // Force re-render by reloading auth state
          window.location.reload();
        }}
      />
    );
  }

  // Show onboarding if not authenticated or not completed
  if (!user || (user && !progress.onboardingComplete)) {
    return (
      <div style={{ minHeight: '100dvh', background: '#030712' }}>
        <OnboardingPage
          key="onboarding"
          onComplete={() => {
            setProfileSelected(true);
            sessionStorage.setItem('speakeasy_profileSelected', '1');
            setCurrentPage('home');
            // Show upgrade popup after onboarding (only once per signup)
            if (!sessionStorage.getItem('se_upgrade_shown')) {
              sessionStorage.setItem('se_upgrade_shown', '1');
              setTimeout(() => setShowUpgradePopup(true), 1500);
            }
          }}
          onChildLogin={() => setShowChildLogin(true)}
        />
      </div>
    );
  }

  // Show profile picker on every app load (after onboarding)
  if (!profileSelected && children.length > 0) {
    return <Suspense fallback={<PageLoader />}><ProfilePickerPage onSelect={() => {
      setProfileSelected(true);
      sessionStorage.setItem('speakeasy_profileSelected', '1');
    }} /></Suspense>;
  }

  const isTeenProfile = isChildMode && progress?.profileType === 'teen';
  const isKids = isChildMode && !isTeenProfile;

  const pageTitles = {
    home: null,
    lessons: t('lessons', uiLang),
    conversation: t('conversation', uiLang),
    vocabulary: t('vocabulary', uiLang),
    pronunciation: t('pronunciation', uiLang),
    reading: t('reading', uiLang),
    profile: t('profile', uiLang),
    achievements: t('achievements', uiLang),
    lesson: t('lesson', uiLang),
    alphabet: null,
    'kids-games': null,
    'audio-learn': null,
    family: t('myFamily', uiLang),
    'child-progress': null,
    'kids-teacher': null,
    'curriculum': null,
    'support': t('helpCenter', uiLang),
    'support-faq': t('faq', uiLang),
    'support-contact': t('contactSupport', uiLang),
    'support-tickets': t('myTickets', uiLang),
    'english-quest': null,
    'skills': null,
    'adventure': null,
    'speaking-coach': t('speakingCoach', uiLang),
    'life-coach': t('lifeCoach', uiLang),
    'pricing': t('premium', uiLang),
    'talking-world': null,
    'kids-ai-lesson': null,
  };

  const isSubPage = ['pronunciation', 'reading', 'achievements', 'lesson', 'audio-learn', 'kids-games', 'english-quest', 'family', 'child-progress', 'kids-teacher', 'curriculum', 'support', 'support-faq', 'support-contact', 'support-tickets', 'skills', 'adventure', 'speaking-coach', 'life-coach', 'pricing', 'talking-world', 'kids-ai-lesson'].includes(currentPage);
  const showNav = !isSubPage;
  const showHeader = currentPage !== 'home' && currentPage !== 'audio-learn' && currentPage !== 'kids-games' && currentPage !== 'english-quest' && currentPage !== 'family' && currentPage !== 'child-progress' && currentPage !== 'kids-teacher' && currentPage !== 'curriculum' && currentPage !== 'support' && currentPage !== 'support-faq' && currentPage !== 'support-contact' && currentPage !== 'support-tickets' && currentPage !== 'achievements' && currentPage !== 'lesson' && currentPage !== 'skills' && currentPage !== 'adventure' && currentPage !== 'speaking-coach' && currentPage !== 'life-coach' && currentPage !== 'pricing' && currentPage !== 'talking-world' && currentPage !== 'kids-ai-lesson';

  const navigateTo = (page, data) => {
    if (page === 'child-progress' && data) {
      setProgressChildId(data);
    }
    if (page === 'lessons' && data) {
      setLessonData(data);
    }
    setCurrentPage(page);
    window.scrollTo(0, 0);
    if (!isPopstateRef.current) {
      window.history.pushState({ page }, '', '');
    }
    isPopstateRef.current = false;
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return isKids
          ? <KidsHomePage onNavigate={navigateTo} reviewCount={dueCount} />
          : <HomePage onNavigate={navigateTo} reviewCount={dueCount} />;
      case 'lessons':
        return <LessonPage onComplete={() => navigateTo('home')} onBack={() => navigateTo('home')} lesson={lessonData} />;
      case 'conversation':
        return <PageErrorBoundary><SimulationPage /></PageErrorBoundary>;
      case 'vocabulary':
        return <PageErrorBoundary><VocabularyPage /></PageErrorBoundary>;
      case 'pronunciation':
        return <PageErrorBoundary><PronunciationPage /></PageErrorBoundary>;
      case 'reading':
        return <PageErrorBoundary><ReadingPage /></PageErrorBoundary>;
      case 'profile':
        return <PageErrorBoundary><ProfilePage onNavigate={navigateTo} /></PageErrorBoundary>;
      case 'achievements':
        return <PageErrorBoundary><AchievementsPage onBack={() => navigateTo('profile')} /></PageErrorBoundary>;
      case 'alphabet':
        return <PageErrorBoundary><KidsAlphabetPage /></PageErrorBoundary>;
      case 'kids-games':
        return <PageErrorBoundary><KidsGamesPage onBack={() => navigateTo('home')} onNavigate={navigateTo} /></PageErrorBoundary>;
      case 'english-quest':
        return <PageErrorBoundary><EnglishQuestPage onBack={() => navigateTo('home')} /></PageErrorBoundary>;
      case 'audio-learn':
        return <PageErrorBoundary><AudioLearningPage onBack={() => navigateTo('home')} /></PageErrorBoundary>;
      case 'family':
        return <PageErrorBoundary><FamilyPage onNavigate={navigateTo} /></PageErrorBoundary>;
      case 'child-progress':
        return <PageErrorBoundary><ChildProgressPage childId={progressChildId} onBack={() => navigateTo('family')} /></PageErrorBoundary>;
      case 'kids-teacher':
        return <PageErrorBoundary><KidsTeacherPage onBack={() => navigateTo('home')} /></PageErrorBoundary>;
      case 'curriculum':
        return <PageErrorBoundary><CurriculumPage onBack={() => navigateTo('home')} /></PageErrorBoundary>;
      case 'kids-ai-lesson':
        return <PageErrorBoundary><KidsAILessonPage onNavigate={navigateTo} /></PageErrorBoundary>;
      case 'support':
        return <PageErrorBoundary><SupportPage onNavigate={navigateTo} onBack={() => navigateTo('profile')} /></PageErrorBoundary>;
      case 'support-faq':
        return <PageErrorBoundary><SupportFAQPage onBack={() => navigateTo('support')} /></PageErrorBoundary>;
      case 'support-contact':
        return <PageErrorBoundary><SupportContactPage onBack={() => navigateTo('support')} /></PageErrorBoundary>;
      case 'support-tickets':
        return <PageErrorBoundary><SupportTicketsPage onBack={() => navigateTo('support')} /></PageErrorBoundary>;
      case 'skills':
        return <PageErrorBoundary><SkillsPage onBack={() => navigateTo('home')} /></PageErrorBoundary>;
      case 'adventure':
        return <PageErrorBoundary><AdventurePage onBack={() => navigateTo('home')} /></PageErrorBoundary>;
      case 'speaking-coach':
        return <PageErrorBoundary><SpeakingCoachPage onBack={() => navigateTo('home')} /></PageErrorBoundary>;
      case 'life-coach':
        return <PageErrorBoundary><LifeCoachPage onBack={() => navigateTo('home')} /></PageErrorBoundary>;
      case 'pricing':
        return <PageErrorBoundary><PricingPage onBack={() => navigateTo('profile')} /></PageErrorBoundary>;
      case 'talking-world':
        return <PageErrorBoundary><TalkingWorldPage onBack={() => navigateTo('home')} /></PageErrorBoundary>;
      default:
        return <HomePage onNavigate={navigateTo} reviewCount={dueCount} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      {currentPage !== 'adventure' && <ChildModeBanner />}
      {isChildMode && currentPage !== 'profile' && currentPage !== 'adventure' && <FloatingMusicBtn />}
      {showHeader && (
        <Header
          title={pageTitles[currentPage]}
          showBack={isSubPage}
          onBack={() => navigateTo('home')}
        />
      )}

      <main className={showHeader ? '' : isChildMode ? '' : 'pt-4'} style={!showHeader && !isChildMode ? { paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' } : undefined}>
        <Suspense fallback={<PageLoader />}>
          <PageTransition pageKey={currentPage}>
            {renderPage()}
          </PageTransition>
        </Suspense>
      </main>

      {showNav && (
        <BottomNav
          currentPage={currentPage}
          onNavigate={navigateTo}
          reviewCount={dueCount}
        />
      )}

      <InstallBanner hasBottomNav={showNav} />

      {/* Global achievement toast */}
      {achievementToast && (
        <AchievementToast
          achievement={{
            title: lf(achievementToast, 'title', uiLang),
            description: lf(achievementToast, 'description', uiLang),
            icon: achievementToast.icon,
          }}
          onDismiss={dismissAchievementToast}
        />
      )}
    </div>
  );
}

// Simplified app content for remote child (logged in from separate device)
function RemoteChildAppContent({ childUser, onLogout, showMathGate, onMathSuccess, onMathClose }) {
  const { uiLang } = useTheme();
  const [currentPage, setCurrentPage] = useState('home');
  const { dueCount } = useSpacedRepetition();

  // Guard: children can't access family, profile, or settings pages
  const navigateTo = (page) => {
    if (page === 'family' || page === 'settings') return;
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const isKids = childUser.age && parseInt(childUser.age, 10) < 10;

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return isKids
          ? <KidsHomePage onNavigate={navigateTo} reviewCount={dueCount} />
          : <HomePage onNavigate={navigateTo} reviewCount={dueCount} />;
      case 'lessons':
        return <LessonPage onComplete={() => navigateTo('home')} onBack={() => navigateTo('home')} />;
      case 'vocabulary':
        return <PageErrorBoundary><VocabularyPage /></PageErrorBoundary>;
      case 'alphabet':
        return <PageErrorBoundary><KidsAlphabetPage /></PageErrorBoundary>;
      case 'kids-games':
        return <PageErrorBoundary><KidsGamesPage onBack={() => navigateTo('home')} onNavigate={navigateTo} /></PageErrorBoundary>;
      case 'english-quest':
        return <PageErrorBoundary><EnglishQuestPage onBack={() => navigateTo('home')} /></PageErrorBoundary>;
      case 'kids-teacher':
        return <KidsTeacherPage onBack={() => navigateTo('home')} />;
      case 'curriculum':
        return <PageErrorBoundary><CurriculumPage onBack={() => navigateTo('home')} /></PageErrorBoundary>;
      case 'kids-ai-lesson':
        return <PageErrorBoundary><KidsAILessonPage onNavigate={navigateTo} /></PageErrorBoundary>;
      case 'adventure':
        return <PageErrorBoundary><AdventurePage onBack={() => navigateTo('home')} /></PageErrorBoundary>;
      case 'speaking-coach':
        return <PageErrorBoundary><SpeakingCoachPage onBack={() => navigateTo('home')} /></PageErrorBoundary>;
      case 'life-coach':
        return <PageErrorBoundary><LifeCoachPage onBack={() => navigateTo('home')} /></PageErrorBoundary>;
      case 'talking-world':
        return <PageErrorBoundary><TalkingWorldPage onBack={() => navigateTo('home')} /></PageErrorBoundary>;
      case 'profile':
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${childUser.avatarColor || 'from-teal-400 to-emerald-500'} flex items-center justify-center text-5xl shadow-xl mb-4`}>
              {childUser.avatar}
            </div>
            <h2 className="text-2xl font-bold mb-1">{childUser.name}</h2>
            {childUser.age && <p className="text-gray-500 dark:text-gray-400 mb-6">{t('age', uiLang)}: {childUser.age}</p>}
            <button
              onClick={onLogout}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-400 to-red-500 text-white font-bold shadow-lg active:scale-95 transition-transform"
            >
              {t('backToLogin', uiLang)}
            </button>
          </div>
        );
      default:
        return isKids
          ? <KidsHomePage onNavigate={navigateTo} reviewCount={dueCount} />
          : <HomePage onNavigate={navigateTo} reviewCount={dueCount} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      {/* Child banner with logout */}
      <div className={`sticky top-0 z-40 bg-gradient-to-r ${childUser.avatarColor || 'from-teal-400 to-emerald-500'} px-4 py-2 flex items-center justify-between shadow-md`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{childUser.avatar}</span>
          <span className="text-white font-semibold text-sm">
            {t('playingAs', uiLang)} {childUser.name}
          </span>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium hover:bg-white/30 transition-colors"
        >
          {t('backToLogin', uiLang)}
        </button>
      </div>

      {/* Weak password banner */}
      {showWeakPasswordBanner && !isChildMode && (
        <div className="mx-4 mt-2 mb-0 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-xl">🔒</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">{t('weakPasswordBannerTitle', uiLang)}</p>
            <p className="text-xs text-amber-600 dark:text-amber-400">{t('weakPasswordBannerDesc', uiLang)}</p>
          </div>
          <button
            onClick={() => { navigateTo('profile'); setShowWeakPasswordBanner(false); sessionStorage.removeItem('se_weak_password'); }}
            className="px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-xl shrink-0"
          >
            {t('weakPasswordBannerCta', uiLang)}
          </button>
          <button onClick={() => { setShowWeakPasswordBanner(false); sessionStorage.removeItem('se_weak_password'); }} className="text-amber-400 text-lg leading-none">&times;</button>
        </div>
      )}

      <main className="pt-4">
        <Suspense fallback={<PageLoader />}>
          <PageTransition pageKey={currentPage}>
            {renderPage()}
          </PageTransition>
        </Suspense>
      </main>

      <BottomNav
        currentPage={currentPage}
        onNavigate={navigateTo}
        reviewCount={dueCount}
      />

      <MathGateModal
        isOpen={showMathGate}
        onClose={onMathClose}
        onSuccess={onMathSuccess}
      />

      {/* Upgrade Popup — shown after signup */}
      {showUpgradePopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={() => setShowUpgradePopup(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-[scaleIn_0.3s_ease-out]" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
                <span className="text-3xl">📊</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{t('upgradePopupTitle', uiLang)}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{t('upgradePopupDesc', uiLang)}</p>
            </div>

            <div className="space-y-2 mb-5">
              {['upgradePopupFeature1', 'upgradePopupFeature2', 'upgradePopupFeature3', 'upgradePopupFeature4'].map(k => (
                <div key={k} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/60 rounded-xl px-3 py-2">
                  <span className="text-green-500 text-sm font-bold">✓</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t(k, uiLang)}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => { setShowUpgradePopup(false); navigateTo('pricing'); }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm shadow-lg active:scale-[0.98] transition-transform mb-2"
            >
              {t('upgradePopupCta', uiLang)}
            </button>
            <button
              onClick={() => setShowUpgradePopup(false)}
              className="w-full py-2.5 text-gray-400 text-sm font-medium"
            >
              {t('upgradePopupSkip', uiLang)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary title="Oops!" description="Something went wrong. Please refresh.">
      <ThemeProvider>
        <AuthProvider>
          <ChildAuthProvider>
            <UserProgressProvider>
              <MusicProvider>
                <SpeechProvider>
                  <AppContent />
                </SpeechProvider>
              </MusicProvider>
            </UserProgressProvider>
          </ChildAuthProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
