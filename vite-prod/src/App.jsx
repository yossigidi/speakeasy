import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { ThemeProvider, useTheme } from './contexts/ThemeContext.jsx';
import { UserProgressProvider, useUserProgress } from './contexts/UserProgressContext.jsx';
import { SpeechProvider } from './contexts/SpeechContext.jsx';
import useSpacedRepetition from './hooks/useSpacedRepetition.js';

import Header from './components/layout/Header.jsx';
import BottomNav from './components/layout/BottomNav.jsx';
import PageTransition from './components/layout/PageTransition.jsx';
import LoadingSpinner from './components/shared/LoadingSpinner.jsx';

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

import ChildModeBanner from './components/family/ChildModeBanner.jsx';

import { t } from './utils/translations.js';

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { progress, loading: progressLoading } = useUserProgress();
  const { uiLang } = useTheme();
  const { dueCount } = useSpacedRepetition();
  const [currentPage, setCurrentPage] = useState('home');
  const [lessonData, setLessonData] = useState(null);
  const isPopstateRef = useRef(false);

  // Browser back/forward button support
  useEffect(() => {
    // Set initial state
    window.history.replaceState({ page: 'home' }, '', '');

    const handlePopState = (e) => {
      if (e.state && e.state.page) {
        isPopstateRef.current = true;
        setCurrentPage(e.state.page);
      } else {
        // No state = user went back past the app's first page
        // Push home state to prevent leaving the app
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

  // Show onboarding if not authenticated or not completed
  if (!user || (user && !progress.onboardingComplete)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <OnboardingPage onComplete={() => setCurrentPage('home')} />
      </div>
    );
  }

  const isKids = progress.ageGroup === 'kids';

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
  };

  const isSubPage = ['pronunciation', 'reading', 'achievements', 'lesson', 'audio-learn', 'kids-games', 'family'].includes(currentPage);
  const showNav = !isSubPage;
  const showHeader = currentPage !== 'home' && currentPage !== 'audio-learn' && currentPage !== 'kids-games' && currentPage !== 'family';

  const navigateTo = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
    // Only push state if this navigation is NOT from the browser back/forward button
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

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UserProgressProvider>
          <SpeechProvider>
            <AppContent />
          </SpeechProvider>
        </UserProgressProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
