import React, { useState } from 'react';
import { Timer } from '../Timer/Timer';
import { Quotes } from './Quotes';
import { Minimize, Image as ImageIcon, Volume2, CloudRain, Music as MusicIcon, Ghost, Library, Sunset } from 'lucide-react';
import { MiniPlayer } from '../MusicPlayer/MiniPlayer';
import { useMusic } from '../../contexts/MusicContext';
import type { SlideId } from '../Layout/AppLayout';

interface FocusModeProps {
  onExit: () => void;
  ambientBrightness: number;
  onBrightnessChange: (val: number) => void;
  onAtmosphereChange: (type: 'youtube' | 'image' | 'video' | 'color' | null, url: string | null) => void;
  customBgUrl: string;
  onCustomBgChange: (val: string) => void;
  onCustomBgSubmit: (e: React.FormEvent) => void;
  activeSlide: SlideId;
  setActiveSlide: (id: SlideId) => void;
}

export const FocusMode = ({
  onExit,
  ambientBrightness,
  onBrightnessChange,
  onAtmosphereChange,
  customBgUrl,
  onCustomBgChange,
  onCustomBgSubmit,
  activeSlide,
  setActiveSlide
}: FocusModeProps) => {
  const { stopMusic } = useMusic();
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  const themes = [
    { name: 'None', icon: <Ghost size={16} />, type: null, url: null },
    { name: 'Rain', icon: <CloudRain size={16} />, type: 'youtube', url: 'mPZkdNFkNps' },
    { name: 'Lo-Fi', icon: <MusicIcon size={16} />, type: 'youtube', url: 'jfKfPfyJRdk' },
    { name: 'Library', icon: <Library size={16} />, type: 'youtube', url: 'HAt3vS5xPcs' },
    { name: 'Space', icon: <Sunset size={16} />, type: 'youtube', url: '4_E8E6s7X7A' },
  ];

  const handleAtmosphere = (type: any, url: any) => {
    if (type === 'youtube') stopMusic();
    onAtmosphereChange(type, url);
  };

  return (
    <div style={styles.container(isMobile)}>
      <style>{`
        .focus-layout {
          display: grid;
          grid-template-columns: 1fr 400px;
          grid-template-rows: auto 1fr;
          gap: 2.5rem;
          height: 100vh;
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          padding: 40px;
          box-sizing: border-box;
          position: relative;
        }
        .focus-left {
          grid-column: 1;
          grid-row: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 0;
        }
        .focus-right {
          grid-column: 2;
          grid-row: 2;
          display: flex;
          flex-direction: column;
          gap: 24px;
          overflow-y: auto;
          padding-right: 12px;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.1) transparent;
        }
        .focus-header {
          grid-column: 1 / span 2;
          display: flex;
          justify-content: flex-end;
        }
        @media (max-width: 1200px) {
          .focus-layout { grid-template-columns: 1fr 350px; padding: 24px; }
        }
        @media (max-width: 1024px) {
          .focus-layout { 
            grid-template-columns: 1fr; 
            grid-template-rows: auto auto 1fr;
            overflow-y: auto;
          }
          .focus-left { grid-row: 2; margin: 40px 0; }
          .focus-right { grid-row: 3; padding-right: 0; }
          .focus-header { grid-row: 1; }
        }
      `}</style>
      
      <div className="focus-layout">
        <div className="focus-header">
          <button 
            onClick={onExit}
            style={styles.exitBtn(isMobile)}
            className="hover-grow"
          >
            <Minimize size={20} /> Exit Focus
          </button>
        </div>
        
        <div className="focus-left">
           <div style={styles.timerWrapper}>
              <Timer />
           </div>
        </div>

        <div className="focus-right">
          <div style={styles.controlsStack(isMobile)}>
            <div className="glass-panel" style={styles.card}>
              <h4 style={styles.cardHeader}>Atmosphere</h4>
              <div style={styles.themeGrid}>
                {themes.map(t => (
                  <button 
                    key={t.name}
                    onClick={() => handleAtmosphere(t.type as any, t.url)} 
                    style={styles.themeBtn}
                    className="hover-grow"
                  >
                    {t.icon}
                    <span>{t.name}</span>
                  </button>
                ))}
              </div>
              
              <div style={styles.divider} />
              
              <div style={styles.sliderRow}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <label style={styles.label}>Brightness</label>
                  <span style={styles.valueText}>{ambientBrightness}%</span>
                </div>
                <input 
                  type="range" 
                  min="10" max="100" 
                  value={ambientBrightness} 
                  onChange={e => onBrightnessChange(Number(e.target.value))}
                  style={styles.range}
                />
              </div>

              <div style={styles.divider} />

              <div>
                <h4 style={styles.subHeader}>Custom Background</h4>
                <form onSubmit={onCustomBgSubmit} style={styles.form}>
                  <input 
                    type="text" 
                    placeholder="Image/Video URL" 
                    value={customBgUrl} 
                    onChange={e => onCustomBgChange(e.target.value)} 
                    style={styles.input} 
                  />
                  <button type="submit" className="primary-btn" style={styles.btn}>Set</button>
                </form>
              </div>
            </div>

            <div style={styles.quoteBox}>
              <Quotes />
            </div>

            <div className="glass-panel" style={{ padding: '20px', borderRadius: '24px' }}>
              <MiniPlayer activeSlide={activeSlide} setActiveSlide={setActiveSlide} />
            </div>
          </div>
        </div>
      </div>
      {isMobile && (
        <div style={styles.mobileTray}>
           {/* Add minimal mobile controls here if needed */}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: (isMobile: boolean): React.CSSProperties => ({
    width: '100%',
    height: '100%',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    padding: isMobile ? '1rem' : '0',
    animation: 'fadeIn 1s ease'
  }),
  exitBtn: (isMobile: boolean): React.CSSProperties => ({
    position: 'absolute',
    top: isMobile ? '16px' : '32px',
    right: isMobile ? '16px' : '32px',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    borderRadius: '16px',
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(20px)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.15)',
    fontWeight: 700,
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  }),
  timerWrapper: {
    width: '100%',
    maxWidth: '800px',
    display: 'flex',
    justifyContent: 'center',
    transform: 'scale(1.05)'
  },
  controlsStack: (isMobile: boolean) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
    width: '100%',
    maxWidth: '100%',
  }),
  card: {
    padding: '24px',
    background: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(24px)',
    borderRadius: '24px',
    border: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
  },
  cardHeader: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase' as const,
    letterSpacing: '2px',
    fontWeight: 800,
    marginBottom: '0.25rem'
  },
  themeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
    gap: '0.5rem'
  },
  themeBtn: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    padding: '0.75rem',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '12px',
    fontSize: '0.7rem',
    fontWeight: 600,
    color: '#fff',
    border: '1px solid transparent',
    transition: 'all 0.2s',
  },
  divider: {
    height: '1px',
    background: 'rgba(255,255,255,0.08)',
    margin: '0.25rem 0'
  },
  sliderRow: {
    display: 'flex',
    flexDirection: 'column' as const
  },
  label: { fontSize: '0.8rem', color: '#fff', fontWeight: 600 },
  valueText: { fontSize: '0.8rem', color: 'var(--accent-color)', fontWeight: 800 },
  range: { width: '100%', accentColor: 'var(--accent-color)', cursor: 'pointer' },
  subHeader: { fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' as const, letterSpacing: '1px', fontWeight: 800, marginBottom: '0.5rem' },
  form: { display: 'flex', gap: '0.5rem', alignItems: 'stretch' },
  input: { flex: 1, padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.85rem', outline: 'none' },
  btn: { padding: '0.75rem 1.25rem', borderRadius: '12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  quoteBox: {
    position: 'relative' as const,
    width: '100%'
  },
  mobileTray: {
     // placeholder
  }
};
