import React, { useState } from 'react';
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
import { StudyAnalytics } from '../Analytics/StudyAnalytics';
import { Quotes } from '../Focus/Quotes';
import type { SlideId } from '../Layout/AppLayout';
import { Minimize, Image as ImageIcon } from 'lucide-react';

export const Dashboard = ({ activeSlide, setActiveSlide }: { activeSlide: SlideId, setActiveSlide: (id: SlideId) => void }) => {
  
  const [ambientBrightness, setAmbientBrightness] = useState(100);
  const [customBgUrl, setCustomBgUrl] = useState('');

  const changeAtmosphere = (type: 'youtube' | 'image' | 'video' | 'color' | null, url: string | null) => {
    window.dispatchEvent(new CustomEvent('bg-change', { detail: { type, url, brightness: ambientBrightness } }));
  };

  const handleBrightnessChange = (val: number) => {
    setAmbientBrightness(val);
    window.dispatchEvent(new CustomEvent('bg-change', { detail: { brightness: val } }));
  };

  const handleCustomBg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customBgUrl.trim()) return;
    
    // Guess type from URL
    let type: 'youtube' | 'image' | 'video' = 'image';
    if (customBgUrl.includes('youtube.com') || customBgUrl.includes('youtu.be')) type = 'youtube';
    else if (customBgUrl.match(/\.(mp4|webm|ogg)$/i)) type = 'video';
    
    // Extract ID for YT if needed
    let finalUrl = customBgUrl;
    if (type === 'youtube') {
      if (customBgUrl.includes('youtube.com/watch')) {
        finalUrl = new URL(customBgUrl).searchParams.get('v') || customBgUrl;
      } else if (customBgUrl.includes('youtu.be/')) {
        finalUrl = customBgUrl.split('youtu.be/')[1].split('?')[0];
      }
    }
    
    changeAtmosphere(type, finalUrl);
  };

  const isFocus = activeSlide === ('focus' as any);

  const getSlideStyle = (slideName: SlideId | 'rooms' | 'media' | 'syllabus' | 'notes' | 'flashcards' | 'leaderboard' | 'community' | 'analytics' | 'settings'): React.CSSProperties => {
    const isActive = activeSlide === slideName;
    if (slideName === 'timer' && isFocus) return { display: 'flex', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', background: 'transparent', boxShadow: 'none', padding: '1rem', zIndex: 5, justifyContent: 'center' };
    
    // For media, we must never use display: none, otherwise iframe pauses
    if (slideName === 'media') {
      return {
        display: 'flex',
        position: isActive ? 'relative' : 'absolute',
        visibility: isActive ? 'visible' : 'hidden',
        pointerEvents: isActive ? 'all' : 'none',
        opacity: isActive ? 1 : 0,
        zIndex: isActive ? 1 : -100
      };
    }
    
    return { display: isActive ? 'flex' : 'none' };
  };

  return (
    <div style={{ width: '100%', height: '100%', flex: 1, position: 'relative' }}>
      
      {/* 1. Timer */}
      <div 
        className={isFocus && activeSlide === 'timer' ? "" : "slide-content glass-panel"} 
        style={{ 
          ...styles.slideCard, 
          ...getSlideStyle('timer')
        }}
      >
        <Timer />
      </div>

      {/* 2. Rooms */}
      <div style={{ ...getSlideStyle('rooms'), gap: '1.5rem', height: 'calc(100vh - 2rem)', paddingBottom: '2rem', width: '100%' }}>
        <div className="slide-content glass-panel" style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <RoomManager />
        </div>
        <div className="slide-content glass-panel" style={{ flex: 1.5, padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Chat />
        </div>
      </div>

      {/* 3. Media */}
      <div 
        className="slide-content glass-panel" 
        style={{ 
          ...styles.slideCard, 
          ...getSlideStyle('media')
        }}
      >
        <MusicPlayer isFocus={isFocus} />
      </div>

      {/* Focus Mode Overlay Controls */}
      {isFocus && (
        <>
          {/* Floating Atmosphere Palette */}
          <div style={{ position: 'absolute', top: '2rem', right: '2rem', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-end' }}>
             <button 
                onClick={() => setActiveSlide('timer')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1.75rem', borderRadius: '14px', cursor: 'pointer', background: 'var(--accent-color)', color: '#fff', border: 'none', fontWeight: 700, boxShadow: '0 8px 30px rgba(187, 134, 252, 0.4)', transition: 'all 0.3s' }}
                className="focus-exit-btn"
              >
                <Minimize size={20} /> Exit Focus
              </button>

              <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '280px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800, marginBottom: '0.25rem' }}>Atmosphere</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button onClick={() => changeAtmosphere(null, null)} style={styles.themeBtn}>None</button>
                  <button onClick={() => changeAtmosphere('youtube', 'mPZkdNFkNps')} style={styles.themeBtn}>Rain</button>
                  <button onClick={() => changeAtmosphere('youtube', 'jfKfPfyJRdk')} style={styles.themeBtn}>Lo-Fi</button>
                  <button onClick={() => changeAtmosphere('youtube', 'HAt3vS5xPcs')} style={styles.themeBtn}>Library</button>
                  <button onClick={() => changeAtmosphere('youtube', '4_E8E6s7X7A')} style={styles.themeBtn}>Space</button>
                  <button onClick={() => changeAtmosphere('youtube', 'VMAPTo7RVCo')} style={styles.themeBtn}>Jazz</button>
                </div>
                
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                     <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Brightness</label>
                     <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 700 }}>{ambientBrightness}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" max="100" 
                    value={ambientBrightness} 
                    onChange={e => handleBrightnessChange(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent-color)' }}
                  />
                </div>

                <form onSubmit={handleCustomBg} style={{ display: 'flex', marginTop: '0.5rem', gap: '0.4rem' }}>
                   <input type="text" placeholder="Custom image or YT link" value={customBgUrl} onChange={e => setCustomBgUrl(e.target.value)} style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.8rem' }} />
                   <button type="submit" className="primary-btn" style={{ padding: '0.5rem', borderRadius: '8px', fontSize: '0.8rem' }}>Set</button>
                </form>
              </div>
          </div>
          <Quotes />
        </>
      )}


      {/* 4. Syllabus */}
      <div style={{ ...styles.slideCard, ...getSlideStyle('syllabus') }} className="slide-content glass-panel">
        <Syllabus />
      </div>

      {/* 5. Notes */}
      <div style={{ ...styles.slideCard, ...getSlideStyle('notes') }} className="slide-content glass-panel">
        <Notes />
      </div>

      {/* 6. Flashcards */}
      <div style={{ ...styles.slideCard, ...getSlideStyle('flashcards') }} className="slide-content glass-panel">
        <Flashcards />
      </div>

      {/* 7. Leaderboard */}
      <div style={{ ...styles.slideCard, ...getSlideStyle('leaderboard') }} className="slide-content glass-panel">
        <Leaderboard />
      </div>

      {/* 8. Community */}
      <div style={{ ...styles.slideCard, ...getSlideStyle('community') }} className="slide-content glass-panel">
        <Community />
      </div>

      {/* 9. Analytics */}
      <div style={{ ...styles.slideCard, ...getSlideStyle('analytics') }} className="slide-content glass-panel">
        <StudyAnalytics />
      </div>

      {/* 10. Settings */}
      <div style={{ ...styles.slideCard, ...getSlideStyle('settings') }} className="slide-content glass-panel">
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
