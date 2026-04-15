import React from 'react';
import { 
  LogOut, Timer as TimerIcon, MessageSquare, Music, BookOpen, 
  FileText, Layers, Trophy, Users, Settings, Target, BarChart3
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Navbar } from './Navbar';
import { MiniPlayer } from '../MusicPlayer/MiniPlayer';

export type SlideId = 'timer' | 'rooms' | 'media' | 'syllabus' | 'notes' | 'flashcards' | 'leaderboard' | 'community' | 'settings' | 'focus' | 'analytics';

export const AppLayout = ({ children, activeSlide, setActiveSlide }: { 
  children: React.ReactNode, 
  activeSlide: SlideId, 
  setActiveSlide: (id: SlideId) => void 
}) => {
  const { user, logout } = useAuth();
  
  const isFocusMode = activeSlide === ('focus' as any);

  const [bgData, setBgData] = React.useState<{ type: 'youtube' | 'image' | 'video' | 'color' | null, url: string | null, brightness: number }>({
    type: null,
    url: null,
    brightness: 100
  });

  React.useEffect(() => {
    const handleBgChange = (e: any) => {
      const { type, url, brightness } = e.detail;
      
      setBgData(prev => ({
        type: type !== undefined ? type : prev.type,
        url: url !== undefined ? url : prev.url,
        brightness: brightness !== undefined ? brightness : prev.brightness
      }));
    };
    window.addEventListener('bg-change', handleBgChange);
    return () => window.removeEventListener('bg-change', handleBgChange);
  }, []);
  
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  return (
    <div style={styles.container}>
      <div className="global-bg-layer" style={{ opacity: isFocusMode && bgData.type && bgData.url ? 0 : 0.35 }} />
      
      {isFocusMode && bgData.type && bgData.url && (
        <div style={{ position: 'absolute', inset: 0, zIndex: -2, overflow: 'hidden', pointerEvents: 'none', animation: 'fadeIn 1s ease' }}>
          {bgData.type === 'youtube' ? (
             <iframe
               src={`https://www.youtube.com/embed/${bgData.url}?autoplay=1&mute=1&controls=0&loop=1&playlist=${bgData.url}&modestbranding=1&iv_load_policy=3&rel=0`}
               style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', minWidth: '100%', minHeight: '100%', width: '110vw', height: '110vh', objectFit: 'cover' }}
               allow="autoplay; encrypted-media"
               title="Ambient Backdrop"
             />
          ) : bgData.type === 'video' ? (
             <video src={bgData.url} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
             <div style={{ width: '100%', height: '100%', backgroundImage: `url(${bgData.url})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,1)', opacity: 1 - (bgData.brightness / 100), transition: 'opacity 0.3s ease' }} />
        </div>
      )}
      
      {!isFocusMode && (
        <aside className="glass-panel" style={styles.sidebar(isMobile)}>
          <div style={styles.brand} className="mobile-hide">
            <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              s<span style={{ color: 'var(--accent-color)' }}>.fm</span>
            </span>
          </div>

          <nav style={styles.nav(isMobile)}>
            <NavItem icon={<TimerIcon size={22} />} label="Focus Timer" active={activeSlide === 'timer'} onClick={() => setActiveSlide('timer')} />
            <NavItem icon={<MessageSquare size={22} />} label="Study Rooms" active={activeSlide === 'rooms'} onClick={() => setActiveSlide('rooms')} />
            <NavItem icon={<Music size={22} />} label="Music" active={activeSlide === 'media'} onClick={() => setActiveSlide('media')} />
            <NavItem icon={<BookOpen size={22} />} label="Planner" active={activeSlide === 'syllabus'} onClick={() => setActiveSlide('syllabus')} />
            <NavItem icon={<FileText size={22} />} label="Notes" active={activeSlide === 'notes'} onClick={() => setActiveSlide('notes')} />
            <NavItem icon={<BarChart3 size={22} />} label="Analytics" active={activeSlide === 'analytics'} onClick={() => setActiveSlide('analytics')} />
            <NavItem icon={<Users size={22} />} label="Community" active={activeSlide === 'community'} onClick={() => setActiveSlide('community')} />
            {!isMobile && (
              <>
                <NavItem icon={<Layers size={22} />} label="Flashcards" active={activeSlide === 'flashcards'} onClick={() => setActiveSlide('flashcards')} />
                <NavItem icon={<Trophy size={22} />} label="Leaderboard" active={activeSlide === 'leaderboard'} onClick={() => setActiveSlide('leaderboard')} />
              </>
            )}
            <NavItem icon={<Settings size={22} />} label="Settings" active={activeSlide === 'settings'} onClick={() => setActiveSlide('settings')} />
          </nav>

          {!isMobile && (
            <nav style={{ ...styles.nav(false), marginTop: 'auto' }}>
              <NavItem icon={<Target size={22} color={activeSlide === ('focus' as any) ? '#fff' : 'var(--accent-color)'} />} label="Focus Mode" active={activeSlide === ('focus' as any)} onClick={() => setActiveSlide('focus' as SlideId)} />
              {user && (
                <button onClick={logout} style={styles.logoutBtn} title="Log Out" className="nav-btn logout-btn">
                  <LogOut size={22} color="var(--danger-color)" />
                </button>
              )}
            </nav>
          )}
        </aside>
      )}

      <div style={styles.mainWrapper(isMobile)}>
        {!isFocusMode && <Navbar />}
        <main id="main-scroll-area" style={styles.main(isFocusMode, isMobile)}>
          <div style={styles.contentWrapper(isMobile)}>
            {children}
          </div>
        </main>
      </div>
      <MiniPlayer activeSlide={activeSlide} setActiveSlide={setActiveSlide} />
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    style={{
      ...styles.navItem,
      background: active ? 'var(--accent-color)' : 'transparent',
      color: active ? '#fff' : 'var(--text-secondary)',
      boxShadow: active ? '0 4px 12px rgba(187, 134, 252, 0.4)' : 'none'
    }}
    title={label}
    className="nav-btn"
  >
    {icon}
  </button>
);

const styles = {
  container: {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    flexDirection: 'row' as const,
    position: 'relative' as const,
    overflow: 'hidden',
  },
  sidebar: (isMobile: boolean) => ({
    width: isMobile ? '100%' : '80px',
    height: isMobile ? '70px' : 'calc(100vh - 2rem)',
    margin: isMobile ? '0' : '1rem 0 1rem 1rem',
    borderRadius: isMobile ? '0' : '20px',
    display: 'flex',
    flexDirection: isMobile ? 'row' as const : 'column' as const,
    alignItems: 'center',
    justifyContent: isMobile ? 'space-around' : 'flex-start',
    padding: isMobile ? '0' : '1.5rem 0',
    zIndex: 1000,
    flexShrink: 0,
    boxShadow: isMobile ? '0 -4px 20px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.3)',
    position: isMobile ? 'fixed' as const : 'relative' as const,
    bottom: isMobile ? 0 : 'auto',
    left: isMobile ? 0 : 'auto',
    border: isMobile ? 'none' : '1px solid var(--border-color)',
    borderTop: isMobile ? '1px solid var(--border-color)' : '1px solid var(--border-color)',
  }),
  brand: {
    marginBottom: '2rem',
  },
  nav: (isMobile: boolean) => ({
    display: 'flex',
    flexDirection: isMobile ? 'row' as const : 'column' as const,
    gap: isMobile ? '0.25rem' : '1.25rem',
    alignItems: 'center',
    justifyContent: isMobile ? 'space-around' : 'flex-start',
    width: '100%',
  }),
  navItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    border: 'none',
    cursor: 'pointer',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    transition: 'all 0.3s',
    background: 'rgba(239, 68, 68, 0.05)',
    border: 'none',
    cursor: 'pointer',
  },
  mainWrapper: (isMobile: boolean) => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100vh',
    position: 'relative' as const,
    paddingBottom: isMobile ? '70px' : '0',
    overflow: 'hidden',
  }),
  main: (isFocusMode: boolean, isMobile: boolean) => ({
    flex: 1,
    overflow: 'hidden' as const,
    padding: isFocusMode ? '0' : isMobile ? '1rem' : '2rem',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
  }),
  contentWrapper: (isMobile: boolean) => ({
    height: 'min(calc(100vh - 120px), 900px)',
    width: '100%',
    maxWidth: isMobile ? '100%' : '1100px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'relative' as const,
  })
};

