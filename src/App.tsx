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

import { useMusic } from './contexts/MusicContext';

function MiniPlayerOverlay() {
  const { activeTrack, isPlaying, isMinimized, setIsMinimized, stopMusic, togglePlay } = useMusic();
  
  if (!activeTrack || !isMinimized) return null;

  return (
    <div className="glass-panel" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: '0.9rem 1.5rem', 
      borderRadius: '18px', 
      position: 'fixed', 
      bottom: '1.5rem', 
      right: '1.5rem', 
      zIndex: 3000, 
      width: '320px', 
      boxShadow: '0 12px 40px rgba(0,0,0,0.6)', 
      border: '1px solid var(--accent-color)',
      animation: 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      background: 'rgba(20, 20, 25, 0.9)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', overflow: 'hidden', flex: 1 }}>
        <div className={isPlaying ? "playing-dot" : ""} style={{ 
          width: '10px', 
          height: '10px', 
          borderRadius: '50%', 
          background: isPlaying ? 'var(--accent-color)' : 'var(--text-secondary)', 
          boxShadow: isPlaying ? '0 0 12px var(--accent-color)' : 'none',
          flexShrink: 0
        }} />
        <span style={{ fontSize: '0.9rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#fff' }}>
          {activeTrack.name}
        </span>
      </div>
      <div style={{ display: 'flex', gap: '0.6rem', marginLeft: '1rem' }}>
        <button onClick={togglePlay} style={miniBtnStyle} title={isPlaying ? "Pause" : "Play"}>
           {isPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" />}
        </button>
        <button onClick={() => setIsMinimized(false)} style={miniBtnStyle} title="Maximize"><Maximize2 size={16} /></button>
        <button onClick={stopMusic} style={{ ...miniBtnStyle, color: 'var(--danger-color)' }} title="Stop"><X size={16} /></button>
      </div>
      <style>{`
        @keyframes slideInRight { from { transform: translateX(50px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .playing-dot { animation: pulse-light 2s infinite; }
        @keyframes pulse-light { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
      `}</style>
    </div>
  );
}


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
      <MiniPlayerOverlay />

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

const miniBtnStyle = {
  background: 'rgba(255,255,255,0.06)',
  border: 'none',
  borderRadius: '10px',
  padding: '0.6rem',
  cursor: 'pointer',
  color: '#fff',
  display: 'flex',
  transition: 'all 0.2s',
  border: '1px solid rgba(255,255,255,0.05)'
};


import { MusicProvider } from './contexts/MusicContext';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MusicProvider>
          <AnalyticsProvider>
            <MainApp />
          </AnalyticsProvider>
        </MusicProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}


export default App;
