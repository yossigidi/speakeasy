import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { ThemeProvider, useTheme } from './contexts/ThemeContext.jsx';
import { ChildAuthProvider, useChildAuth } from './contexts/ChildAuthContext.jsx';
import { UserProgressProvider, useUserProgress } from './contexts/UserProgressContext.jsx';
import { SpeechProvider } from './contexts/SpeechContext.jsx';
import useSpacedRepetition from './hooks/useSpacedRepetition.js';

import Header from './components/layout/Header.jsx';
import BottomNav from './components/layout/BottomNav.jsx';
import PageTransition from './components/layout/PageTransition.jsx';
import LoadingSpinner from './components/shared/LoadingSpinner.jsx';
import ErrorBoundary from './components/shared/ErrorBoundary.jsx';

import HomePage from './pages/HomePage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import LessonPage from './pages/LessonPage.jsx';
import SimulationPage from './pages/SimulationPage.jsx';
import VocabularyPage from './pages/VocabularyPage.jsx';
import ReadingPage from './pages/ReadingPage.jsx';
import PronunciationPage from './pages/PronunciationPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AchievementsPage from './pages/AchievementsPage.jsx';
import KidsAlphabetPage from './pages/KidsAlphabetPage.jsx';
import AudioLearningPage from './pages/AudioLearningPage.jsx';
import KidsHomePage from './pages/KidsHomePage.jsx';
import KidsGamesPage from './pages/KidsGamesPage.jsx';
import FamilyPage from './pages/FamilyPage.jsx';
import ChildLoginPage from './pages/ChildLoginPage.jsx';
import ProfilePickerPage from './pages/ProfilePickerPage.jsx';
import ChildProgressPage from './pages/ChildProgressPage.jsx';
import KidsTeacherPage from './pages/KidsTeacherPage.jsx';
import CurriculumPage from './pages/CurriculumPage.jsx';
import SupportPage from './pages/SupportPage.jsx';
import SupportFAQPage from './pages/SupportFAQPage.jsx';
import SupportContactPage from './pages/SupportContactPage.jsx';
import SupportTicketsPage from './pages/SupportTicketsPage.jsx';
import EnglishQuestPage from './pages/EnglishQuestPage.jsx';
import SkillsPage from './pages/SkillsPage.jsx';
import BarcodeComparisonPage from './pages/BarcodeComparisonPage.jsx';

import ChildModeBanner from './components/family/ChildModeBanner.jsx';
import MathGateModal from './components/family/MathGateModal.jsx';

import { t } from './utils/translations.js';

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { childUser, logoutChild } = useChildAuth();
  const { progress, loading: progressLoading, children, childrenLoaded, isChildMode } = useUserProgress();
  const { uiLang } = useTheme();
  const { dueCount } = useSpacedRepetition();
  const [currentPage, setCurrentPage] = useState('home');
  const [lessonData, setLessonData] = useState(null);
  const [showChildLogin, setShowChildLogin] = useState(false);
  const [showMathGate, setShowMathGate] = useState(false);
  const [profileSelected, setProfileSelected] = useState(false);
  const [progressChildId, setProgressChildId] = useState(null);
  const isPopstateRef = useRef(false);
  const prevUserRef = useRef(user?.uid);

  // Reset profile picker when user changes (logout/login)
  useEffect(() => {
    if (user?.uid !== prevUserRef.current) {
      setProfileSelected(false);
      prevUserRef.current = user?.uid;
    }
  }, [user]);

  // Check URL for childJoin parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('childJoin')) {
      setShowChildLogin(true);
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

  // Show loading while auth initializes or children are loading
  if (authLoading || (user && progressLoading) || (user && progress.onboardingComplete && !childrenLoaded)) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #030712 0%, #0f172a 60%, #0d3b3a 100%)' }}>
        <div className="text-center">
          <img src="/icons/icon-192.png" alt="Speakli" style={{ width: '64px', height: '64px', borderRadius: '16px', margin: '0 auto 16px', boxShadow: '0 8px 32px rgba(20,184,166,0.3)' }} />
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // Child login page (standalone, from separate device)
  if (showChildLogin && !user && !childUser) {
    return <ChildLoginPage onBack={() => setShowChildLogin(false)} />;
  }

  // Remote child mode (child logged in from separate device)
  if (!user && childUser) {
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

  // Show onboarding if not authenticated or not completed
  if (!user || (user && !progress.onboardingComplete)) {
    return (
      <div style={{ minHeight: '100dvh', background: '#030712' }}>
        <OnboardingPage
          onComplete={() => {
            setProfileSelected(false);
            setCurrentPage('home');
          }}
          onChildLogin={() => setShowChildLogin(true)}
        />
      </div>
    );
  }

  // Show profile picker on every app load (after onboarding)
  if (!profileSelected && children.length > 0) {
    return <ProfilePickerPage onSelect={() => setProfileSelected(true)} />;
  }

  const isKids = isChildMode && (!progress.curriculumLevel || progress.curriculumLevel <= 2);

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
    'barcode': null,
  };

  const isSubPage = ['pronunciation', 'reading', 'achievements', 'lesson', 'audio-learn', 'kids-games', 'english-quest', 'family', 'child-progress', 'kids-teacher', 'curriculum', 'support', 'support-faq', 'support-contact', 'support-tickets', 'skills', 'barcode'].includes(currentPage);
  const showNav = !isSubPage;
  const showHeader = currentPage !== 'home' && currentPage !== 'audio-learn' && currentPage !== 'kids-games' && currentPage !== 'english-quest' && currentPage !== 'family' && currentPage !== 'child-progress' && currentPage !== 'kids-teacher' && currentPage !== 'curriculum' && currentPage !== 'support' && currentPage !== 'support-faq' && currentPage !== 'support-contact' && currentPage !== 'support-tickets' && currentPage !== 'achievements' && currentPage !== 'lesson' && currentPage !== 'skills' && currentPage !== 'barcode';

  const navigateTo = (page, data) => {
    if (page === 'child-progress' && data) {
      setProgressChildId(data);
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
        return <SimulationPage />;
      case 'vocabulary':
        return <VocabularyPage />;
      case 'pronunciation':
        return <PronunciationPage />;
      case 'reading':
        return <ReadingPage />;
      case 'profile':
        return <ProfilePage onNavigate={navigateTo} />;
      case 'achievements':
        return <AchievementsPage onBack={() => navigateTo('profile')} />;
      case 'alphabet':
        return <KidsAlphabetPage />;
      case 'kids-games':
        return <KidsGamesPage onBack={() => navigateTo('home')} />;
      case 'english-quest':
        return <EnglishQuestPage onBack={() => navigateTo('home')} />;
      case 'audio-learn':
        return <AudioLearningPage onBack={() => navigateTo('home')} />;
      case 'family':
        return <FamilyPage onNavigate={navigateTo} />;
      case 'child-progress':
        return <ChildProgressPage childId={progressChildId} onBack={() => navigateTo('family')} />;
      case 'kids-teacher':
        return <KidsTeacherPage onBack={() => navigateTo('home')} />;
      case 'curriculum':
        return <CurriculumPage onBack={() => navigateTo('home')} />;
      case 'support':
        return <SupportPage onNavigate={navigateTo} onBack={() => navigateTo('profile')} />;
      case 'support-faq':
        return <SupportFAQPage onBack={() => navigateTo('support')} />;
      case 'support-contact':
        return <SupportContactPage onBack={() => navigateTo('support')} />;
      case 'support-tickets':
        return <SupportTicketsPage onBack={() => navigateTo('support')} />;
      case 'skills':
        return <SkillsPage onBack={() => navigateTo('home')} />;
      case 'barcode':
        return <BarcodeComparisonPage onBack={() => navigateTo('home')} />;
      default:
        return <HomePage onNavigate={navigateTo} reviewCount={dueCount} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      <ChildModeBanner />
      {showHeader && (
        <Header
          title={pageTitles[currentPage]}
          showBack={isSubPage}
          onBack={() => navigateTo(isSubPage ? 'home' : 'home')}
        />
      )}

      <main className={showHeader ? '' : 'pt-4'} style={!showHeader ? { paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' } : undefined}>
        <PageTransition pageKey={currentPage}>
          {renderPage()}
        </PageTransition>
      </main>

      {showNav && (
        <BottomNav
          currentPage={currentPage}
          onNavigate={navigateTo}
          reviewCount={dueCount}
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
        return <VocabularyPage />;
      case 'alphabet':
        return <KidsAlphabetPage />;
      case 'kids-games':
        return <KidsGamesPage onBack={() => navigateTo('home')} />;
      case 'english-quest':
        return <EnglishQuestPage onBack={() => navigateTo('home')} />;
      case 'kids-teacher':
        return <KidsTeacherPage onBack={() => navigateTo('home')} />;
      case 'curriculum':
        return <CurriculumPage onBack={() => navigateTo('home')} />;
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
        <PageTransition pageKey={currentPage}>
          {renderPage()}
        </PageTransition>
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
              <SpeechProvider>
                <AppContent />
              </SpeechProvider>
            </UserProgressProvider>
          </ChildAuthProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
