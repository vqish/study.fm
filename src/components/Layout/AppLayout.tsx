import React from 'react';
import { 
  LogOut, Timer as TimerIcon, MessageSquare, Music, BookOpen, 
  FileText, Layers, Trophy, Users, Settings, Target, BarChart3,
  Menu, X
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
  const [showMoreMenu, setShowMoreMenu] = React.useState(false);

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
      
      {!isFocusMode && !isMobile && (
        <aside className="glass-panel" style={{ width: '88px', height: 'calc(100vh - 2rem)', margin: '1rem 0 1rem 1rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', paddingTop: '24px', paddingBottom: '24px', zIndex: 1000, flexShrink: 0, border: '1px solid var(--border-color)', background: 'var(--surface-color)', backdropFilter: 'blur(16px)' }}>
          <div style={{ marginBottom: '2rem' }} className="mobile-hide brand-logo">
            <span style={{ fontWeight: 800, fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              s<span style={{ color: 'var(--accent-color)' }}>.fm</span>
            </span>
          </div>

          <nav className="nav-menu">
            <NavItem icon={<TimerIcon />} label="Focus" active={activeSlide === 'timer'} onClick={() => setActiveSlide('timer')} />
            <NavItem icon={<MessageSquare />} label="Rooms" active={activeSlide === 'rooms'} onClick={() => setActiveSlide('rooms')} />
            <NavItem icon={<Music />} label="Music" active={activeSlide === 'media'} onClick={() => setActiveSlide('media')} />
            <NavItem icon={<BookOpen />} label="Planner" active={activeSlide === 'syllabus'} onClick={() => setActiveSlide('syllabus')} />
            <NavItem icon={<FileText />} label="Notes" active={activeSlide === 'notes'} onClick={() => setActiveSlide('notes')} />
            <NavItem icon={<BarChart3 />} label="Analytics" active={activeSlide === 'analytics'} onClick={() => setActiveSlide('analytics')} />
            <NavItem icon={<Users />} label="Community" active={activeSlide === 'community'} onClick={() => setActiveSlide('community')} />
            <NavItem icon={<Layers />} label="Flashcards" active={activeSlide === 'flashcards'} onClick={() => setActiveSlide('flashcards')} className="desktop-only" />
            <NavItem icon={<Trophy />} label="Leaderboard" active={activeSlide === 'leaderboard'} onClick={() => setActiveSlide('leaderboard')} className="desktop-only" />
            <NavItem icon={<Settings />} label="Settings" active={activeSlide === 'settings'} onClick={() => setActiveSlide('settings')} />
          </nav>

          <nav className="nav-menu" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', width: '100%', flex: 1, justifyContent: 'center' }}>
            <NavItem icon={<Target color={activeSlide === ('focus' as any) ? '#fff' : 'var(--accent-color)'} />} label="Focus Mode" active={activeSlide === ('focus' as any)} onClick={() => setActiveSlide('focus' as SlideId)} />
            {user && (
              <button onClick={logout} className="nav-btn logout-btn sidebar-icon-btn" title="Log Out">
                <LogOut color="var(--danger-color)" />
              </button>
            )}
          </nav>
        </aside>
      )}

      <div className="main-wrapper">
        {!isFocusMode && <Navbar />}
        <main id="main-scroll-area" style={styles.main(isFocusMode, isMobile)}>
          <div style={styles.contentWrapper(isMobile)}>
            {children}
          </div>
        </main>
      </div>

      {/* MOBILE BOTTOM NAV */}
      {!isFocusMode && isMobile && (
        <div style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          height: '70px',
          background: 'rgba(15,15,22,0.85)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          paddingBottom: 'env(safe-area-inset-bottom)',
          zIndex: 2000
        }}>
          <BottomNavItem icon={<TimerIcon size={24} />} label="Timer" active={activeSlide === 'timer'} onClick={() => setActiveSlide('timer')} />
          <BottomNavItem icon={<Music size={24} />} label="Music" active={activeSlide === 'media'} onClick={() => setActiveSlide('media')} />
          <BottomNavItem icon={<BookOpen size={24} />} label="Planner" active={activeSlide === 'syllabus'} onClick={() => setActiveSlide('syllabus')} />
          <BottomNavItem icon={<FileText size={24} />} label="Notes" active={activeSlide === 'notes'} onClick={() => setActiveSlide('notes')} />
          <BottomNavItem icon={<Menu size={24} />} label="More" active={false} onClick={() => setShowMoreMenu(true)} />
        </div>
      )}
      <MiniPlayer activeSlide={activeSlide} setActiveSlide={setActiveSlide} />

      {/* Mobile More Menu */}
      {isMobile && showMoreMenu && (
        <div style={{
          position: 'fixed' as const, inset: 0, zIndex: 3000, 
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
          display: 'flex', flexDirection: 'column' as const, justifyContent: 'flex-end'
        }} onClick={() => setShowMoreMenu(false)}>
          <div style={{
             background: 'var(--surface-color)', padding: '2rem 1.5rem calc(2rem + env(safe-area-inset-bottom))',
             borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
             borderTop: '1px solid var(--border-color)',
             animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
             display: 'flex', flexDirection: 'column' as const, gap: '1rem'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
               <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>More...</h3>
               <button onClick={() => setShowMoreMenu(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '0.4rem', borderRadius: '50%', color: '#fff' }}><X size={20} /></button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <MenuItem icon={<MessageSquare size={20} />} label="Study Rooms" onClick={() => { setActiveSlide('rooms'); setShowMoreMenu(false); }} />
              <MenuItem icon={<BookOpen size={20} />} label="Planner" onClick={() => { setActiveSlide('syllabus'); setShowMoreMenu(false); }} />
              <MenuItem icon={<Users size={20} />} label="Community" onClick={() => { setActiveSlide('community'); setShowMoreMenu(false); }} />
              <MenuItem icon={<Layers size={20} />} label="Flashcards" onClick={() => { setActiveSlide('flashcards'); setShowMoreMenu(false); }} />
              <MenuItem icon={<Trophy size={20} />} label="Leaderboard" onClick={() => { setActiveSlide('leaderboard'); setShowMoreMenu(false); }} />
              <MenuItem icon={<Settings size={20} />} label="Settings" onClick={() => { setActiveSlide('settings'); setShowMoreMenu(false); }} />
              <MenuItem icon={<Target size={20} />} label="Focus Mode" onClick={() => { setActiveSlide('focus' as SlideId); setShowMoreMenu(false); }} color="var(--accent-color)" />
              {user && (
                 <MenuItem icon={<LogOut size={20} />} label="Log Out" onClick={() => { logout(); setShowMoreMenu(false); }} color="var(--danger-color)" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick, className = '' }: any) => (
  <button 
    onClick={onClick}
    className={`nav-btn sidebar-icon-btn ${active ? 'active-nav' : ''} ${className}`}
    title={label}
    style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '42px', height: '42px', borderRadius: '12px', border: 'none', cursor: 'pointer', transition: 'all 0.3s', background: active ? 'var(--accent-color)' : 'transparent', color: active ? '#fff' : 'var(--text-secondary)' }}
  >
    {icon}
  </button>
);

const BottomNavItem = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', border: 'none', background: 'transparent', color: active ? 'var(--accent-color)' : 'var(--text-secondary)', transition: 'color 0.2s', cursor: 'pointer' }}>
    {icon}
    <span style={{ fontSize: '10px', fontWeight: 600 }}>{label}</span>
  </button>
);

const MenuItem = ({ icon, label, onClick, color }: any) => (
  <button onClick={onClick} style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '0.6rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.2rem', borderRadius: '16px', color: color || 'var(--text-primary)', cursor: 'pointer', transition: 'background 0.2s' }}>
    {icon}
    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{label}</span>
  </button>
);

const styles = {
  container: {
    height: '100dvh',
    width: '100vw',
    display: 'flex',
    flexDirection: 'row' as const,
    position: 'relative' as const,
    overflow: 'hidden',
  },
  brand: {
    marginBottom: '2rem',
  },
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

