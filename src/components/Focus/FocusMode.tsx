import React, { useState } from 'react';
import { Timer } from '../Timer/Timer';
import { Quotes } from './Quotes';
import { Minimize, Image as ImageIcon, Volume2, CloudRain, Music, Ghost, Library, Sunset } from 'lucide-react';
import { MiniPlayer } from '../MusicPlayer/MiniPlayer';
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
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  const themes = [
    { name: 'None', icon: <Ghost size={16} />, type: null, url: null },
    { name: 'Rain', icon: <CloudRain size={16} />, type: 'youtube', url: 'mPZkdNFkNps' },
    { name: 'Lo-Fi', icon: <Music size={16} />, type: 'youtube', url: 'jfKfPfyJRdk' },
    { name: 'Library', icon: <Library size={16} />, type: 'youtube', url: 'HAt3vS5xPcs' },
    { name: 'Space', icon: <Sunset size={16} />, type: 'youtube', url: '4_E8E6s7X7A' },
  ];

  return (
    <div style={styles.container(isMobile)}>
      <style>{`
        .focus-layout {
          display: grid;
          grid-template-columns: 60% 40%;
          gap: 2rem;
          height: 100%;
          width: 100%;
          padding: 2rem;
          box-sizing: border-box;
        }
        .focus-left {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .focus-right {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          padding: 2rem 2rem 2rem 0;
        }
        
        @media (max-width: 1440px) {
          .focus-layout { grid-template-columns: 55% 45%; }
        }
        @media (max-width: 1024px) {
          .focus-layout { 
            grid-template-columns: 1fr; 
            padding: 1.5rem;
            overflow-y: auto;
          }
          .focus-right { padding: 0; align-items: center; }
        }
        @media (max-width: 768px) {
          .focus-layout { padding: 1rem; gap: 1.5rem; }
        }
      `}</style>
      
      {/* 1. EXIT BUTTON - Fixed Top Right */}
      <button 
        onClick={onExit}
        style={styles.exitBtn}
        className="focus-exit-btn hover-grow"
      >
        <Minimize size={20} /> Exit Focus
      </button>

      {/* 2. MAIN SPLIT LAYOUT */}
      <div className="focus-layout">
        
        {/* LEFT 60% - TIMER */}
        <div className="focus-left">
           <div style={styles.timerWrapper}>
              <Timer />
           </div>
        </div>

        {/* RIGHT 40% - CONTROLS */}
        <div className="focus-right">
          <div style={styles.controlsStack}>
            
            {/* Atmosphere Card */}
            <div className="glass-panel" style={styles.card}>
              <h4 style={styles.cardHeader}>Atmosphere</h4>
              <div style={styles.themeGrid}>
                {themes.map(t => (
                  <button 
                    key={t.name}
                    onClick={() => onAtmosphereChange(t.type as any, t.url)} 
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
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
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

            {/* Dynamic Quote Widget */}
            <div style={styles.quoteBox}>
              <Quotes />
            </div>

          </div>
        </div>
      </div>

      {/* 3. MOBILE OVERLAY CONTROLS (Floating if mobile) */}
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
  exitBtn: {
    position: 'absolute' as const,
    top: '2rem',
    right: '2rem',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.8rem 1.75rem',
    borderRadius: '16px',
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(20px)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.15)',
    fontWeight: 700,
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  },
  timerWrapper: {
    width: '100%',
    maxWidth: '800px',
    display: 'flex',
    justifyContent: 'center',
    transform: 'scale(1.05)'
  },
  controlsStack: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2rem',
    width: '100%',
    maxWidth: '440px',
  },
  card: {
    padding: '2rem',
    background: 'rgba(0,0,0,0.3)',
    backdropFilter: 'blur(24px)',
    borderRadius: '24px',
    border: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.25rem',
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
    gridTemplateColumns: 'repeat(3, 1fr)',
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
  form: { display: 'flex', gap: '0.5rem' },
  input: { flex: 1, padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.85rem', outline: 'none' },
  btn: { padding: '0.75rem 1.25rem', borderRadius: '12px', fontSize: '0.85rem' },
  quoteBox: {
    position: 'relative' as const,
    width: '100%'
  },
  mobileTray: {
     // placeholder
  }
};
