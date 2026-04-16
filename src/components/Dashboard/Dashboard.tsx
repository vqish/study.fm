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
import { FocusMode } from '../Focus/FocusMode';
import { Minimize, Image as ImageIcon } from 'lucide-react';

const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

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
    if (slideName === 'timer' && isFocus) return { display: 'none' }; // Handle via Focus layout
    
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
      <div style={{ ...getSlideStyle('rooms'), gap: '24px', height: '100%', width: '100%', flexDirection: isMobile ? 'column' : 'row' }}>
        <div className="slide-content glass-panel" style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <RoomManager />
        </div>
        <div className="slide-content glass-panel" style={{ flex: 1.5, padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
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
        <FocusMode 
          onExit={() => setActiveSlide('timer')}
          ambientBrightness={ambientBrightness}
          onBrightnessChange={handleBrightnessChange}
          onAtmosphereChange={changeAtmosphere}
          customBgUrl={customBgUrl}
          onCustomBgChange={setCustomBgUrl}
          onCustomBgSubmit={handleCustomBg}
          activeSlide={activeSlide}
          setActiveSlide={setActiveSlide}
        />
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
    padding: '2rem',
    display: 'flex', 
    flexDirection: 'column' as const,
    height: '100%',
    width: '100%',
    flex: 1,
    overflow: 'hidden',
    position: 'relative' as const,
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
