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
  useEffect(() => {
    if (user?.uid !== prevUserRef.current) {
      setProfileSelected(false);
      sessionStorage.removeItem('speakeasy_profileSelected');
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

  // Remote child mode — takes priority over everything (even loading)
  if (childUser?.isRemoteChild) {
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

  // Show onboarding if not authenticated or not completed
  if (!user || (user && !progress.onboardingComplete)) {
    return (
      <div style={{ minHeight: '100dvh', background: '#030712' }}>
        <OnboardingPage
          onComplete={() => {
            setProfileSelected(true);
            sessionStorage.setItem('speakeasy_profileSelected', '1');
            setCurrentPage('home');
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

  const isKids = isChildMode;

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

  // Guard: children can't access family or profile pages
  const navigateTo = (page) => {
    if (page === 'family') return;
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
      default:
        return <HomePage onNavigate={navigateTo} reviewCount={dueCount} />;
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
