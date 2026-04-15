import { useState } from 'react';
import { Play, Pause, X, Maximize2, Minimize2, Music, Tv, Video } from 'lucide-react';
import { useMusic } from '../../contexts/MusicContext';
import { DraggableWidget } from '../Shared/DraggableWidget';
import type { SlideId } from '../Layout/AppLayout';

const SAFE_MARGIN = 24;

export const MiniPlayer = ({ 
    activeSlide, 
    setActiveSlide 
}: { 
    activeSlide: SlideId, 
    setActiveSlide: (id: SlideId) => void 
}) => {
  const { activeTrack, isPlaying, togglePlay, stopMusic } = useMusic();
  const [playerMode, setPlayerMode] = useState<'audio' | 'video'>('audio');
  const [fullscreen, setFullscreen] = useState(false);

  const isFocusMode = activeSlide === ('focus' as any);
  
  if (!activeTrack || (activeSlide === 'media' && !isFocusMode)) return null;

  const isYoutube = activeTrack.type === 'youtube';

  // Safe initial position: bottom-right with safe margin from taskbar
  const playerW = playerMode === 'video' ? 320 : 280;
  const playerH = playerMode === 'video' ? 220 : 90;
  const initX = Math.max(SAFE_MARGIN, window.innerWidth - playerW - SAFE_MARGIN);
  const initY = Math.max(SAFE_MARGIN, window.innerHeight - playerH - SAFE_MARGIN);

  return (
    <>
      <DraggableWidget id="mini-player" initialPos={{ x: initX, y: initY }} safeBottom={SAFE_MARGIN}>
        <div 
          className="glass-panel" 
          style={{ 
            width: playerMode === 'video' ? '320px' : '280px', 
            padding: '1rem', 
            borderRadius: '24px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.75rem',
            boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(32px)',
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {/* DRAG HANDLE & HEADER */}
          <div className="drag-handle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'grab' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: isPlaying ? 'var(--accent-color)' : 'var(--text-secondary)' }}>
               {isYoutube ? <Tv size={14} /> : <Music size={14} />}
               <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>{activeTrack.type}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {isYoutube && (
                <button 
                  onClick={() => setPlayerMode(playerMode === 'audio' ? 'video' : 'audio')} 
                  style={{ color: playerMode === 'video' ? 'var(--accent-color)' : 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.4rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.65rem', fontWeight: 700 }}
                  title="Toggle Video Mode"
                >
                  <Video size={12} /> {playerMode === 'video' ? 'AUDIO' : 'VIDEO'}
                </button>
              )}
              {playerMode === 'video' && isYoutube && (
                <button onClick={() => setFullscreen(true)} style={{ color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem', borderRadius: '4px' }} title="Fullscreen">
                  <Maximize2 size={13} />
                </button>
              )}
              {!isFocusMode && (
                  <button onClick={() => setActiveSlide('media')} style={{ color: 'var(--text-secondary)' }}><Maximize2 size={14} /></button>
              )}
              <button onClick={stopMusic} style={{ color: 'var(--text-secondary)' }}><X size={16} /></button>
            </div>
          </div>

          {/* CONTENT AREA */}
          {playerMode === 'video' && isYoutube ? (
            <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '12px', overflow: 'hidden', background: '#000', border: '1px solid rgba(255,255,255,0.1)' }}>
              <iframe
                src={`https://www.youtube.com/embed/${activeTrack.url}?autoplay=${isPlaying ? 1 : 0}&mute=0&controls=1&modestbranding=1`}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="autoplay; encrypted-media"
                title="Mini Player Video"
              />
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button 
                 onClick={togglePlay} 
                 style={{ 
                   background: 'var(--accent-color)', 
                   color: '#fff', 
                   border: 'none', 
                   borderRadius: '50%', 
                   width: '40px', 
                   height: '40px', 
                   display: 'flex', 
                   alignItems: 'center', 
                   justifyContent: 'center',
                   cursor: 'pointer',
                   boxShadow: '0 4px 12px rgba(187, 134, 252, 0.4)',
                   flexShrink: 0
                 }}
              >
                 {isPlaying ? <Pause size={18} fill="#fff" /> : <Play size={18} fill="#fff" style={{ marginLeft: 2 }} />}
              </button>
              
              <div style={{ flex: 1, minWidth: 0 }}>
                 <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: '#fff' }}>
                    {activeTrack.name}
                 </h4>
                 <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: '0.1rem 0 0 0' }}>{activeTrack.author || 'Study FM'}</p>
              </div>
            </div>
          )}
        </div>
      </DraggableWidget>

      {/* Fullscreen video modal */}
      {fullscreen && isYoutube && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.95)',
          backdropFilter: 'blur(8px)',
          zIndex: 99999,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setFullscreen(false)}
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0.6rem 1.25rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
            >
              <Minimize2 size={16} /> Exit Fullscreen
            </button>
            <button onClick={stopMusic} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--danger-color)', padding: '0.6rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <X size={20} />
            </button>
          </div>
          <div style={{ width: '90vw', maxWidth: '1280px', aspectRatio: '16/9' }}>
            <iframe
              src={`https://www.youtube.com/embed/${activeTrack.url}?autoplay=1&mute=0&controls=1&modestbranding=1`}
              style={{ width: '100%', height: '100%', border: 'none', borderRadius: '16px' }}
              allow="autoplay; encrypted-media; fullscreen"
              title="Fullscreen Player"
              allowFullScreen
            />
          </div>
          <p style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>{activeTrack.name} • {activeTrack.author}</p>
        </div>
      )}
    </>
  );
};
