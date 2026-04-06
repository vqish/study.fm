import React, { useState } from 'react';
import { Music, AlertCircle, Minimize2, Maximize2 } from 'lucide-react';

type SourceType = 'youtube' | 'spotify' | 'none';

export const MusicPlayer = ({ isFocus = false }: { isFocus?: boolean }) => {
  const [url, setUrl] = useState('');
  const [embedId, setEmbedId] = useState('jfKfPfyJRdk'); // Default lofi girl
  const [sourceType, setSourceType] = useState<SourceType>('youtube');
  const [spotifyUri, setSpotifyUri] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);

  const parseYoutubeUrl = (inputUrl: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = inputUrl.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const parseSpotifyUrl = (inputUrl: string): { type: string, id: string } | null => {
    // Handles: https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
    // Also: https://open.spotify.com/track/..., /album/...
    const match = inputUrl.match(/open\.spotify\.com\/(playlist|track|album|episode|show)\/([a-zA-Z0-9]+)/);
    if (match) return { type: match[1], id: match[2] };
    return null;
  };

  const handleLoad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setEmbedId('');
      setSpotifyUri('');
      setSourceType('none');
      return;
    }

    // Try Spotify first
    const spotify = parseSpotifyUrl(url);
    if (spotify) {
      setSpotifyUri(`https://open.spotify.com/embed/${spotify.type}/${spotify.id}?utm_source=generator&theme=0`);
      setSourceType('spotify');
      setEmbedId('');
      return;
    }

    // Try YouTube
    const ytId = parseYoutubeUrl(url);
    if (ytId) {
      setEmbedId(ytId);
      setSourceType('youtube');
      setSpotifyUri('');
      return;
    }

    alert("Paste a valid YouTube or Spotify link.");
  };

  if (isMinimized && isFocus) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Music size={18} color="var(--accent-color)" />
          <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Audio Playing</span>
        </div>
        <button onClick={() => setIsMinimized(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', color: '#fff', transition: 'background 0.2s' }}>
          <Maximize2 size={16} />
        </button>
        {/* Hidden but playing iframe */}
        {sourceType === 'youtube' && embedId && (
          <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: '1px', height: '1px', overflow: 'hidden' }}>
            <iframe src={`https://www.youtube.com/embed/${embedId}?autoplay=1`} allow="autoplay" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: isFocus ? '260px' : 'auto', width: '100%', gap: '1.25rem', position: 'relative' }}>
        
      {isFocus && (
        <button onClick={() => setIsMinimized(true)} style={{ position: 'absolute', top: '-1.5rem', right: '-0.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', zIndex: 10 }}>
          <Minimize2 size={18} />
        </button>
      )}

      {!isFocus && (
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Music & Ambience</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Paste a YouTube or Spotify link to set your study vibe.</p>
        </div>
      )}

      <form onSubmit={handleLoad} style={{ display: 'flex', gap: '0.75rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Music size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Paste YouTube or Spotify link..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '0.875rem 1rem 0.875rem 2.75rem', 
              borderRadius: '10px', 
              background: 'rgba(0,0,0,0.3)', 
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              fontSize: '0.95rem'
            }}
          />
        </div>
        <button type="submit" className="primary-btn" style={{ padding: '0.875rem 1.5rem', borderRadius: '10px', fontWeight: 600 }}>
          Load
        </button>
      </form>

      {/* Quick Presets */}
      {!isFocus && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { label: '🎵 Lofi Girl', id: 'jfKfPfyJRdk', type: 'youtube' as const },
            { label: '🌧️ Rain Sounds', id: 'mPZkdNFkNps', type: 'youtube' as const },
            { label: '☕ Jazz Cafe', id: 'VMAPTo7RVCo', type: 'youtube' as const },
            { label: '🌌 Space Ambient', id: '2J5xnQVaYPo', type: 'youtube' as const },
          ].map(preset => (
            <button 
              key={preset.id}
              onClick={() => { setEmbedId(preset.id); setSourceType('youtube'); setSpotifyUri(''); }}
              style={{ 
                padding: '0.5rem 1rem', 
                borderRadius: '20px', 
                background: embedId === preset.id ? 'var(--accent-color)' : 'rgba(255,255,255,0.06)', 
                border: '1px solid rgba(255,255,255,0.1)', 
                color: embedId === preset.id ? '#fff' : 'var(--text-secondary)', 
                cursor: 'pointer', 
                fontSize: '0.85rem', 
                fontWeight: 500,
                transition: 'all 0.2s' 
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      <div style={{ flex: 1, borderRadius: '14px', overflow: 'hidden', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)', minHeight: isFocus ? '180px' : '300px' }}>
        {sourceType === 'youtube' && embedId ? (
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${embedId}?autoplay=1`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="YouTube Music"
            style={{ border: 'none' }}
          />
        ) : sourceType === 'spotify' && spotifyUri ? (
          <iframe
            src={spotifyUri}
            width="100%"
            height="100%"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title="Spotify Player"
            style={{ border: 'none', borderRadius: '14px' }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-secondary)', gap: '0.75rem' }}>
            <AlertCircle size={36} opacity={0.5} color="var(--accent-color)" />
            <p style={{ fontWeight: 500 }}>No media loaded</p>
            <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>Supports YouTube & Spotify links</p>
          </div>
        )}
      </div>
    </div>
  );
};
