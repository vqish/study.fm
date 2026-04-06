import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RoomProvider } from './contexts/RoomContext';
import { AppLayout } from './components/Layout/AppLayout';
import type { SlideId } from './components/Layout/AppLayout';
import { Dashboard } from './components/Dashboard/Dashboard';
import { AuthModal } from './components/Auth/AuthModal';

function MainApp() {
  const [activeSlide, setActiveSlide] = useState<SlideId>('timer');
  const { showAuthModal, setShowAuthModal } = useAuth();

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

      {/* Auth Modal — shown when unauthenticated user tries a protected action */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </RoomProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
