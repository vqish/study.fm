import React, { useState } from 'react';
import { Music, AlertCircle, Minimize2, Maximize2 } from 'lucide-react';

export const MusicPlayer = ({ isFocus = false }: { isFocus?: boolean }) => {
  const [url, setUrl] = useState('');
  const [embedId, setEmbedId] = useState('jfKfPfyJRdk'); // Default to lofi girl
  const [isMinimized, setIsMinimized] = useState(false);

  const parseYoutubeUrl = (inputUrl: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = inputUrl.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleLoad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      setEmbedId('');
      return;
    }
    const id = parseYoutubeUrl(url);
    if (id) {
      setEmbedId(id);
    } else {
      alert("Please enter a valid YouTube link.");
    }
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
        {embedId && (
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

      <form onSubmit={handleLoad} style={{ display: 'flex', gap: '0.75rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Music size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Paste YouTube link (e.g. lofi hip hop radio)"
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

      <div style={{ flex: 1, borderRadius: '14px', overflow: 'hidden', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)' }}>
        {embedId ? (
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${embedId}?autoplay=1`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Embedded youtube"
            style={{ border: 'none' }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-secondary)', gap: '0.75rem' }}>
            <AlertCircle size={36} opacity={0.5} color="var(--accent-color)" />
            <p style={{ fontWeight: 500 }}>No video loaded</p>
          </div>
        )}
      </div>
    </div>
  );
};
