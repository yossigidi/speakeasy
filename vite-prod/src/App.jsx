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
import ConversationPage from './pages/ConversationPage.jsx';
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

import ChildModeBanner from './components/family/ChildModeBanner.jsx';
import MathGateModal from './components/family/MathGateModal.jsx';

import { t } from './utils/translations.js';

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { childUser, logoutChild } = useChildAuth();
  const { progress, loading: progressLoading, children } = useUserProgress();
  const { uiLang } = useTheme();
  const { dueCount } = useSpacedRepetition();
  const [currentPage, setCurrentPage] = useState('home');
  const [lessonData, setLessonData] = useState(null);
  const [showChildLogin, setShowChildLogin] = useState(false);
  const [showMathGate, setShowMathGate] = useState(false);
  const [profileSelected, setProfileSelected] = useState(false);
  const [progressChildId, setProgressChildId] = useState(null);
  const isPopstateRef = useRef(false);

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

  // Show loading while auth initializes
  if (authLoading || (user && progressLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold gradient-text mb-4">SpeakEasy</h1>
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
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
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

  const isKids = progress.ageGroup === 'kids' || progress.ageGroup === 'children';

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
  };

  const isSubPage = ['pronunciation', 'reading', 'achievements', 'lesson', 'audio-learn', 'kids-games', 'family', 'child-progress'].includes(currentPage);
  const showNav = !isSubPage;
  const showHeader = currentPage !== 'home' && currentPage !== 'audio-learn' && currentPage !== 'kids-games' && currentPage !== 'family' && currentPage !== 'child-progress';

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
        return <ConversationPage />;
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
      case 'audio-learn':
        return <AudioLearningPage onBack={() => navigateTo('home')} />;
      case 'family':
        return <FamilyPage onNavigate={navigateTo} />;
      case 'child-progress':
        return <ChildProgressPage childId={progressChildId} onBack={() => navigateTo('family')} />;
      default:
        return <HomePage onNavigate={navigateTo} reviewCount={dueCount} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      <ChildModeBanner />
      {showHeader && (
        <Header
          title={pageTitles[currentPage]}
          showBack={isSubPage}
          onBack={() => navigateTo(isSubPage ? 'home' : 'home')}
        />
      )}

      <main className={showHeader ? '' : 'pt-4'}>
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
      default:
        return <HomePage onNavigate={navigateTo} reviewCount={dueCount} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      {/* Child banner with logout */}
      <div className={`sticky top-0 z-40 bg-gradient-to-r ${childUser.avatarColor || 'from-indigo-400 to-purple-500'} px-4 py-2 flex items-center justify-between shadow-md`}>
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
