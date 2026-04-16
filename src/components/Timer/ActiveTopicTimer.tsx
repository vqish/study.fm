import { useState, useEffect, useCallback } from 'react';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { Play, Pause, X, Clock, Award, RotateCcw, Timer as TimerIcon, Coffee } from 'lucide-react';

export const ActiveTopicTimer = () => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const { activeTopic, stopStudying } = useAnalytics();
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Pomodoro states
  const [pomodoroMode, setPomodoroMode] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60); // 25m focus

  // Reset clock when active topic changes
  useEffect(() => {
    setSeconds(0);
    setIsPaused(false);
    setIsBreak(false);
    setPomodoroTime(25 * 60);
  }, [activeTopic?.id]);

  const tick = useCallback(() => {
    if (pomodoroMode) {
      if (pomodoroTime > 0) {
        setPomodoroTime(t => t - 1);
        if (!isBreak) setSeconds(s => s + 1); // Only count study seconds during focus
      } else {
        // Toggle focus/break
        const newIsBreak = !isBreak;
        setIsBreak(newIsBreak);
        setPomodoroTime(newIsBreak ? 5 * 60 : 25 * 60);
        // Alert user
        new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3').play().catch(() => {});
        alert(newIsBreak ? "Time for a 5-minute break!" : "Break over! Back to focus.");
      }
    } else {
      setSeconds(s => s + 1);
    }
  }, [pomodoroMode, pomodoroTime, isBreak]);

  useEffect(() => {
    let interval: any;
    if (activeTopic && !isPaused) {
      interval = setInterval(tick, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTopic, isPaused, tick]);

  if (!activeTopic) return null;

  const formatDisplay = () => {
    const s = pomodoroMode ? pomodoroTime : seconds;
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };


  const handleReset = () => {
    setSeconds(0);
    setPomodoroTime(isBreak ? 5 * 60 : 25 * 60);
  };

  return (
    <div style={styles.floatingContainer(isMobile)} className="glass-panel">
      <div style={styles.header}>
        <div style={{ ...styles.statusDot, background: isBreak ? '#03DAC6' : 'var(--success-color)' }} />
        <span style={styles.statusText}>
          {isBreak ? 'Taking a Break' : pomodoroMode ? 'Pomodoro Focus' : 'Focused Studying'}
        </span>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
           <button onClick={() => setPomodoroMode(!pomodoroMode)} style={{ ...styles.iconBtn, color: pomodoroMode ? 'var(--accent-color)' : 'var(--text-secondary)' }} title="Toggle Pomodoro Mode">
             <TimerIcon size={14} />
           </button>
           <button onClick={stopStudying} style={styles.closeBtn} title="Stop and Save Session"><X size={14} /></button>
        </div>
      </div>

      <div style={styles.body}>
        <div style={styles.topicInfo}>
          <h4 style={styles.topicName}>{activeTopic.name}</h4>
          <span style={styles.subjectName}>{activeTopic.subjectName}</span>
        </div>

        <div style={{ ...styles.timerDisplay, border: pomodoroMode && isBreak ? '1px solid #03DAC6' : styles.timerDisplay.border }}>
          {isBreak ? <Coffee size={16} color="#03DAC6" /> : <Clock size={16} color="var(--accent-color)" />}
          <span style={styles.timeText}>{formatDisplay()}</span>
        </div>

        <div style={styles.controls}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => setIsPaused(!isPaused)} 
              style={{ ...styles.controlBtn, background: isPaused ? 'var(--success-color)' : 'rgba(255,255,255,0.1)' }}
            >
              {isPaused ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}
            </button>
            <button onClick={handleReset} style={styles.controlBtn} title="Reset Timer">
               <RotateCcw size={16} />
            </button>
          </div>
          
          <div style={styles.badge}>
            <Award size={14} /> +{Math.floor(seconds / 60)}m
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0% { opacity: 0.4; transform: scale(1); } 50% { opacity: 1; transform: scale(1.1); } 100% { opacity: 0.4; transform: scale(1); } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
};

const styles = {
  floatingContainer: (isMobile: boolean) => ({
    position: 'fixed' as const,
    bottom: isMobile ? 'calc(85px + env(safe-area-inset-bottom))' : '2rem',
    right: isMobile ? '1rem' : '2rem',
    width: isMobile ? 'calc(100vw - 2rem)' : '280px',
    padding: '1.25rem',
    zIndex: 2000,
    boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
    border: '1px solid rgba(187,134,252,0.3)',
    borderRadius: '24px',
    background: 'rgba(15, 15, 20, 0.85)',
    backdropFilter: 'blur(30px)',
    animation: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    boxSizing: 'border-box' as const,
  }),
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    animation: 'pulse 2s infinite',
  },
  statusText: {
    fontSize: '0.7rem',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    fontWeight: 800,
    flex: 1,
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.3rem',
    display: 'flex',
    transition: 'all 0.2s',
    borderRadius: '6px',
  },
  closeBtn: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: 'none',
    color: 'var(--danger-color)',
    cursor: 'pointer',
    padding: '0.3rem',
    display: 'flex',
    borderRadius: '6px',
    transition: 'all 0.2s',
  },
  body: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  topicInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.2rem',
  },
  topicName: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#fff',
    margin: 0,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  subjectName: {
    fontSize: '0.8rem',
    color: 'var(--accent-color)',
    fontWeight: 600,
    opacity: 0.8,
  },
  timerDisplay: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.6rem',
    background: 'rgba(0,0,0,0.3)',
    padding: '0.85rem 1.1rem',
    borderRadius: '14px',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  timeText: {
    fontSize: '1.85rem',
    fontWeight: 800,
    fontFamily: "'Outfit', sans-serif",
    color: '#fff',
    letterSpacing: '1px',
    lineHeight: 1,
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlBtn: {
    border: 'none',
    color: '#fff',
    borderRadius: '12px',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: 'rgba(255,255,255,0.08)',
  },
  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.45rem 0.8rem',
    borderRadius: '20px',
    background: 'rgba(187,134,252,0.15)',
    color: 'var(--accent-color)',
    fontSize: '0.85rem',
    fontWeight: 700,
    border: '1px solid rgba(187,134,252,0.25)',
    boxShadow: '0 4px 15px rgba(187,134,252,0.1)',
  }
};
