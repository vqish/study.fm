import { Timer } from '../Timer/Timer';
import { MusicPlayer } from '../MusicPlayer/MusicPlayer';
import { RoomManager } from '../Room/RoomManager';
import { Chat } from '../Chat/Chat';
import { Syllabus } from '../Syllabus/Syllabus';
import { Notes } from '../Notes/Notes';
import { Flashcards } from '../Flashcards/Flashcards';
import { Leaderboard } from '../Leaderboard/Leaderboard';
import { Community } from '../Community/Community';
import { Settings } from '../Settings/Settings';
import { Quotes } from '../Focus/Quotes';
import type { SlideId } from '../Layout/AppLayout';
import { Minimize, Image as ImageIcon } from 'lucide-react';

export const Dashboard = ({ activeSlide, setActiveSlide }: { activeSlide: SlideId, setActiveSlide: (id: SlideId) => void }) => {
  
  const changeTheme = (newTheme: string) => {
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const isFocus = activeSlide === 'focus';

  // Render all main features so their internal state (like music iframe or countdown) persists
  // We strictly use CSS display logic to show/hide without unmounting.
  return (
    <div style={{ width: '100%', height: '100%', flex: 1, position: 'relative' }}>
      
      {/* 1. Timer */}
      <div 
        className={isFocus ? "" : "slide-content glass-panel"} 
        style={{ 
          ...styles.slideCard, 
          display: activeSlide === 'timer' || isFocus ? 'flex' : 'none',
          ...(isFocus ? { position: 'absolute', top: 0, left: 0, width: '65%', height: '100%', border: 'none', background: 'transparent', boxShadow: 'none', padding: '2rem', zIndex: 5 } : {})
        }}
      >
        <Timer />
      </div>

      {/* 2. Rooms (Doesn't use slideCard layout, uses split screen) */}
      <div style={{ display: activeSlide === 'rooms' ? 'flex' : 'none', gap: '1.5rem', height: 'calc(100vh - 2rem)', paddingBottom: '2rem' }}>
        <div className="slide-content glass-panel" style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <RoomManager />
        </div>
        <div className="slide-content glass-panel" style={{ flex: 1.5, padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Chat />
        </div>
      </div>

      {/* 3. Media: Persisted always, visible in media tab and focus mode */}
      <div 
        className={isFocus ? "" : "slide-content glass-panel"} 
        style={{ 
          ...styles.slideCard, 
          // Always render, but visibly hide if not media or focus. 
          display: activeSlide === 'media' || isFocus ? 'flex' : 'none',
          ...(isFocus ? { position: 'absolute', bottom: '2rem', right: '2rem', width: 'calc(35% - 4rem)', height: 'auto', padding: '1.25rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', zIndex: 10 } : {})
        }}
      >
        {isFocus && <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Background Audio</h3>}
        <MusicPlayer isFocus={isFocus} />
      </div>

      {/* Focus Mode ONLY Overlay Controls (Right 35%) */}
      {isFocus && (
        <div style={{ position: 'absolute', top: 0, right: 0, width: '35%', height: '100%', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', zIndex: 5 }}>
          
          {/* Header Action */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.25rem' }}>
            <button 
              onClick={() => setActiveSlide('timer')}
              className="glass-panel"
              style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1.75rem', borderRadius: '14px', cursor: 'pointer', background: 'var(--accent-color)', color: '#fff', border: 'none', fontWeight: 600, transition: 'transform 0.2s', boxShadow: '0 8px 32px rgba(187,134,252,0.4)', zIndex: 10 }}
              onMouseOver={e => e.currentTarget.style.transform='translateY(-2px)'}
              onMouseOut={e => e.currentTarget.style.transform='translateY(0)'}
            >
              <Minimize size={20} /> Exit Focus Mode
            </button>
          </div>
          
          {/* Atmosphere Settings */}
          <div style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', zIndex: 10 }}>
            <h3 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ImageIcon size={14} /> Atmosphere
            </h3>
            
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
               <button onClick={() => changeTheme('default')} style={styles.themeBtn}>Lo-Fi</button>
               <button onClick={() => changeTheme('rain')} style={styles.themeBtn}>Rain</button>
               <button onClick={() => changeTheme('night')} style={styles.themeBtn}>Night</button>
               <button onClick={() => changeTheme('library')} style={styles.themeBtn}>Library</button>
            </div>

            {/* Placeholder for YouTube Video Input (implemented via Context next) */}
            <div style={{ marginTop: '0.25rem' }}>
              <input 
                type="text" 
                placeholder="Paste YouTube Link for Background..." 
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.includes('youtube.com') || val.includes('youtu.be')) {
                    // Trigger custom YT background
                    document.documentElement.setAttribute('data-yt-bg', val);
                    const event = new CustomEvent('yt-bg-change', { detail: val });
                    window.dispatchEvent(event);
                  }
                }}
                style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '0.9rem', outline: 'none', transition: 'border 0.2s' }} 
                onFocus={e => e.target.style.borderColor = 'var(--accent-color)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          </div>

          <Quotes />

        </div>
      )}

      {/* 4. Syllabus */}
      <div style={{ ...styles.slideCard, display: activeSlide === 'syllabus' ? 'flex' : 'none' }} className="slide-content glass-panel">
        <Syllabus />
      </div>

      {/* 5. Notes */}
      <div style={{ ...styles.slideCard, display: activeSlide === 'notes' ? 'flex' : 'none' }} className="slide-content glass-panel">
        <Notes />
      </div>

      {/* 6. Flashcards */}
      <div style={{ ...styles.slideCard, display: activeSlide === 'flashcards' ? 'flex' : 'none' }} className="slide-content glass-panel">
        <Flashcards />
      </div>

      {/* 7. Leaderboard */}
      <div style={{ ...styles.slideCard, display: activeSlide === 'leaderboard' ? 'flex' : 'none' }} className="slide-content glass-panel">
        <Leaderboard />
      </div>

      {/* 8. Community */}
      <div style={{ ...styles.slideCard, display: activeSlide === 'community' ? 'flex' : 'none' }} className="slide-content glass-panel">
        <Community />
      </div>

      {/* 9. Settings */}
      <div style={{ ...styles.slideCard, display: activeSlide === 'settings' ? 'flex' : 'none' }} className="slide-content glass-panel">
        <Settings />
      </div>

      <style>{`
        .slide-content {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  slideCard: {
    padding: '3rem',
    display: 'flex', 
    flexDirection: 'column' as const,
    height: 'min(calc(100vh - 2rem), 900px)',
    width: '100%',
  },
  themeBtn: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    color: '#fff',
    padding: '0.6rem 1.25rem',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'background 0.2s'
  }
};
