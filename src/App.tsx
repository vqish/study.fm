import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RoomProvider } from './contexts/RoomContext';
import { AppLayout } from './components/Layout/AppLayout';
import type { SlideId } from './components/Layout/AppLayout';
import { Dashboard } from './components/Dashboard/Dashboard';
import { AuthModal } from './components/Auth/AuthModal';
import { ProfileCompletionModal } from './components/Auth/ProfileCompletionModal';
import { ActiveTopicTimer } from './components/Timer/ActiveTopicTimer';
import { AnalyticsProvider } from './contexts/AnalyticsContext';

function MainApp() {
  const [activeSlide, setActiveSlide] = useState<SlideId>('timer');
  const { user, showAuthModal, setShowAuthModal } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('room')) {
      setActiveSlide('rooms');
    }
  }, []);

  return (
    <RoomProvider>
      <AppLayout activeSlide={activeSlide} setActiveSlide={setActiveSlide}>
        <Dashboard activeSlide={activeSlide} setActiveSlide={setActiveSlide} />
      </AppLayout>

      <ActiveTopicTimer />

      {/* Auth Modal — shown when unauthenticated user tries a protected action */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

      {/* Profile Completion — forced for users with placeholder data (Google login fallback) */}
      {user && user.isInitial && (
        <ProfileCompletionModal />
      )}
    </RoomProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AnalyticsProvider>
        <MainApp />
      </AnalyticsProvider>
    </AuthProvider>
  );
}

export default App;
