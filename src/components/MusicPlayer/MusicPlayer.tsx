import { useState, useEffect } from 'react';
import { Music, Pause, Play, Square, Volume2, Globe, Search, Plus } from 'lucide-react';
import { useMusic } from '../../contexts/MusicContext';
import { useAuth } from '../../contexts/AuthContext';
import YouTube from 'react-youtube';

export const MusicPlayer = ({ isFocus = false }: { isFocus?: boolean }) => {
  const { user } = useAuth();
  const { activeTrack, isPlaying, playTrack, stopMusic, isMinimized, setIsMinimized } = useMusic();
  const [url, setUrl] = useState('');

  const parseYoutubeUrl = (inputUrl: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = inputUrl.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const parseSpotifyUrl = (inputUrl: string): { type: string, id: string } | null => {
    const match = inputUrl.match(/open\.spotify\.com\/(playlist|track|album|artist|show|episode)\/([a-zA-Z0-9]+)/);
    if (match) return { type: match[1], id: match[2] };
    return null;
  };

  const handleLoad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    const ytId = parseYoutubeUrl(url);
    if (ytId) {
      playTrack({ id: ytId, type: 'youtube', url, name: 'YouTube Stream', author: 'YouTube' });
      setUrl('');
      return;
    }

    const spotify = parseSpotifyUrl(url);
    if (spotify) {
      playTrack({ id: spotify.id, type: 'spotify', url, name: 'Spotify Playlist', author: 'Spotify' });
      setUrl('');
      return;
    }

    alert("Please paste a valid YouTube or Spotify link.");
  };

  const presets = [
    { label: '🎵 Lofi Study', id: 'jfKfPfyJRdk', type: 'youtube' as const },
    { label: '🌧️ Rain & Thunder', id: 'mPZkdNFkNps', type: 'youtube' as const },
    { label: '☕ Jazz Bar', id: 'VMAPTo7RVCo', type: 'youtube' as const },
    { label: '🎹 Piano Study', id: '4oStw0rre78', type: 'youtube' as const },
    { label: '🌊 Ocean Waves', id: '77ZozI0rw7w', type: 'youtube' as const },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', gap: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      {!isFocus && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Global Audio</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Sync your study session with lo-fi, nature, or your favorite playlist.</p>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '2rem', flex: 1, flexDirection: isFocus ? 'column' : 'row', overflow: 'hidden' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
             <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginBottom: '1rem' }}>Load External Stream</h4>
             <form onSubmit={handleLoad} style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  placeholder="Paste YouTube or Spotify link" 
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  style={{ flex: 1, padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                />
                <button type="submit" className="primary-btn" style={{ padding: '0.75rem' }}><Search size={20} /></button>
             </form>
          </div>
          
          <div className="glass-panel" style={{ flex: 1, padding: '1.5rem', borderRadius: '16px', overflowY: 'auto' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginBottom: '1rem' }}>Quick Presets</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {presets.map(preset => (
                <button 
                  key={preset.id}
                  onClick={() => playTrack({ id: preset.id, type: preset.type, url: `https://youtube.com/watch?v=${preset.id}`, name: preset.label.split(' ')[1], author: 'StudyFM' })}
                  style={{ ...styles.presetBtn, background: activeTrack?.id === preset.id ? 'rgba(255,255,255,0.1)' : 'transparent', padding: '0.8rem', fontSize: '0.9rem' }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div 
          className="glass-panel" 
          style={{ 
            flex: 2, 
            background: 'rgba(0,0,0,0.5)', 
            borderRadius: '24px', 
            overflow: 'hidden', 
            position: 'relative',
            minHeight: isFocus ? '300px' : '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.05)'
          }}
        >
          {activeTrack ? (
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              {activeTrack.type === 'youtube' ? (
                <YouTube
                  videoId={activeTrack.id}
                  className="youtube-container"
                  opts={{
                    height: '100%',
                    width: '100%',
                    playerVars: {
                      autoplay: isPlaying ? 1 : 0,
                      mute: 0,
                      rel: 0,
                      modestbranding: 1,
                      controls: 1,
                      showinfo: 0,
                    },
                  }}
                  onReady={(event) => {
                    if (isPlaying) event.target.playVideo();
                  }}
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={activeTrack.type === 'spotify' 
                    ? `https://open.spotify.com/embed/playlist/${activeTrack.id}?utm_source=generator&theme=0`
                    : `https://embed.music.apple.com/us/album/${activeTrack.id}`
                  }
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  title="Study FM Media Engine"
                  style={{ border: 'none', background: 'transparent' }}
                />
              )}
               {!isPlaying && activeTrack.type !== 'youtube' && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}>
                     <button onClick={() => playTrack(activeTrack)} style={{ ...styles.controlBtn, background: 'var(--accent-color)', width: '64px', height: '64px' }}>
                       <Play size={32} fill="#fff" />
                     </button>
                  </div>
               )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
              <Volume2 size={80} style={{ marginBottom: '1.5rem', color: 'var(--accent-color)' }} />
              <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>Choose a preset or paste a link to begin.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .music-pulse { animation: ${isPlaying ? 'pulse 2s infinite' : 'none'}; }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
        @keyframes eq { 0% { height: 10px; } 100% { height: 40px; } }
        .youtube-container { width: 100%; height: 100%; }
      `}</style>

    </div>
  );
};

const styles = {
  input: { 
    width: '100%', 
    padding: '0.9rem 1rem 0.9rem 3rem', 
    borderRadius: '12px', 
    background: 'rgba(0,0,0,0.3)', 
    color: 'var(--text-primary)',
    border: '1px solid rgba(255,255,255,0.1)',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  controlBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    color: '#fff',
    transition: 'all 0.3s'
  },
  presetBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.25rem',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.05)',
    color: '#fff',
    cursor: 'pointer',
    textAlign: 'left' as const,
    fontWeight: 600,
    transition: 'all 0.2s'
  }
};

