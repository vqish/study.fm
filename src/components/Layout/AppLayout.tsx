import React from 'react';
import { 
  LogOut, Timer, MessageSquare, Music, BookOpen, 
  FileText, Layers, Trophy, Users, Settings, Target 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export type SlideId = 'timer' | 'rooms' | 'media' | 'syllabus' | 'notes' | 'flashcards' | 'leaderboard' | 'community' | 'settings' | 'focus';

export const AppLayout = ({ children, activeSlide, setActiveSlide }: { 
  children: React.ReactNode, 
  activeSlide: SlideId, 
  setActiveSlide: (id: SlideId) => void 
}) => {
  const { logout } = useAuth();
  
  const isFocusMode = activeSlide === ('focus' as any);

  const [ytVideoId, setYtVideoId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleYtChange = (e: any) => {
      const url = e.detail;
      let id = '';
      if (url.includes('youtube.com/watch')) {
        id = new URL(url).searchParams.get('v') || '';
      } else if (url.includes('youtu.be/')) {
        id = url.split('youtu.be/')[1].split('?')[0];
      }
      if (id) {
        setYtVideoId(id);
      }
    };
    window.addEventListener('yt-bg-change', handleYtChange);
    return () => window.removeEventListener('yt-bg-change', handleYtChange);
  }, []);
  
  return (
    <div style={styles.container}>
      {/* Background layer mapped to CSS variables instead of React state */}
      <div className="global-bg-layer" />
      
      {/* Optional YouTube Video Background Layer */}
      {ytVideoId && (
        <>
          <iframe
            src={`https://www.youtube.com/embed/${ytVideoId}?autoplay=1&mute=0&controls=0&loop=1&playlist=${ytVideoId}&modestbranding=1`}
            style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', minWidth: '100vw', minHeight: '100vh', width: 'auto', height: 'auto', zIndex: -2, border: 'none', pointerEvents: 'none' }}
            allow="autoplay; encrypted-media"
          />
          {/* Dark overlay for readability */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: -1, pointerEvents: 'none' }} />
        </>
      )}
      
      {!isFocusMode && (
        <aside className="glass-panel" style={styles.sidebar}>
          <div style={styles.brand}>
            <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              s<span style={{ color: 'var(--accent-color)' }}>.fm</span>
            </span>
          </div>

          <nav style={styles.nav}>
            <NavItem icon={<Timer size={22} />} label="Focus Timer" active={activeSlide === 'timer'} onClick={() => setActiveSlide('timer')} />
            <NavItem icon={<MessageSquare size={22} />} label="Study Rooms" active={activeSlide === 'rooms'} onClick={() => setActiveSlide('rooms')} />
            <NavItem icon={<Music size={22} />} label="Music & Background" active={activeSlide === 'media'} onClick={() => setActiveSlide('media')} />
            <NavItem icon={<BookOpen size={22} />} label="Task Planner" active={activeSlide === 'syllabus'} onClick={() => setActiveSlide('syllabus')} />
            <NavItem icon={<FileText size={22} />} label="Rich Notes" active={activeSlide === 'notes'} onClick={() => setActiveSlide('notes')} />
            <NavItem icon={<Layers size={22} />} label="Flashcards" active={activeSlide === 'flashcards'} onClick={() => setActiveSlide('flashcards')} />
            <NavItem icon={<Trophy size={22} />} label="Leaderboard" active={activeSlide === 'leaderboard'} onClick={() => setActiveSlide('leaderboard')} />
            <NavItem icon={<Users size={22} />} label="Community" active={activeSlide === 'community'} onClick={() => setActiveSlide('community')} />
          </nav>

          <nav style={{ ...styles.nav, marginTop: 'auto' }}>
            <NavItem icon={<Target size={22} color={activeSlide === ('focus' as any) ? '#fff' : 'var(--accent-color)'} />} label="Focus Mode" active={activeSlide === ('focus' as any)} onClick={() => setActiveSlide('focus' as SlideId)} />
            <NavItem icon={<Settings size={22} />} label="Settings Profile" active={activeSlide === 'settings'} onClick={() => setActiveSlide('settings')} />
            <button onClick={logout} style={styles.logoutBtn} title="Log Out" className="nav-btn logout-btn">
              <LogOut size={22} color="var(--danger-color)" />
            </button>
          </nav>
        </aside>
      )}

      {/* Main Content Area */}
      <main id="main-scroll-area" style={styles.main(isFocusMode)}>
        <div style={styles.contentWrapper}>
          {children}
        </div>
      </main>
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
    position: 'relative' as const,
    overflow: 'hidden',
  },
  sidebar: {
    width: '80px',
    height: 'calc(100vh - 2rem)',
    margin: '1rem 0 1rem 1rem',
    borderRadius: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '1.5rem 0',
    zIndex: 10,
    flexShrink: 0,
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  },
  brand: {
    marginBottom: '2rem',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.8rem',
    alignItems: 'center',
    width: '100%',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
  },
  main: (isFocusMode: boolean) => ({
    flex: 1,
    height: '100vh',
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const,
    padding: isFocusMode ? '0' : '1rem',
    transition: 'padding 0.4s ease',
  }),
  contentWrapper: {
    minHeight: '100%',
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column' as const,
  }
};
