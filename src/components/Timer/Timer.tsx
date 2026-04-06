import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, Hourglass, StopCircle, Settings as SettingsIcon, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const LEADERBOARD_KEY = 'studyfm_leaderboard';

export type LeaderboardEntry = {
  uid: string;
  name: string;
  email: string;
  focusMinutes: number;
  sessions: number;
  lastActive: number; // timestamp
};

function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const stored = localStorage.getItem(LEADERBOARD_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return [];
}

function saveLeaderboard(entries: LeaderboardEntry[]) {
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
}

export function updateUserStudyTime(uid: string, name: string, email: string, addedMinutes: number, addedSessions: number) {
  const entries = loadLeaderboard();
  const idx = entries.findIndex(e => e.uid === uid);
  if (idx >= 0) {
    entries[idx].focusMinutes += addedMinutes;
    entries[idx].sessions += addedSessions;
    entries[idx].lastActive = Date.now();
    entries[idx].name = name; // update if changed
  } else {
    entries.push({ uid, name, email, focusMinutes: addedMinutes, sessions: addedSessions, lastActive: Date.now() });
  }
  saveLeaderboard(entries);
}

export function markUserActive(uid: string, name: string, email: string) {
  const entries = loadLeaderboard();
  const idx = entries.findIndex(e => e.uid === uid);
  if (idx >= 0) {
    entries[idx].lastActive = Date.now();
    entries[idx].name = name;
  } else {
    entries.push({ uid, name, email, focusMinutes: 0, sessions: 0, lastActive: Date.now() });
  }
  saveLeaderboard(entries);
}

type TimerMode = 'pomodoro' | 'countdown' | 'stopwatch';
type PomoPhase = 'focus' | 'shortBreak' | 'longBreak';

export const Timer = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState<TimerMode>('pomodoro');

  // Register user on leaderboard when they open the timer
  useEffect(() => {
    if (user) {
      markUserActive(user.uid, user.displayName, user.email);
    }
  }, [user]);
  
  // Pomodoro Settings
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({ focus: 25, shortBreak: 5, longBreak: 15 });
  
  // Pomodoro State
  const [pomoPhase, setPomoPhase] = useState<PomoPhase>('focus');
  const [pomoTime, setPomoTime] = useState(settings.focus * 60);
  const [isPomoActive, setIsPomoActive] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  // Countdown State
  const [cdInput, setCdInput] = useState('10:00');
  const [cdTime, setCdTime] = useState(10 * 60);
  const [isCdActive, setIsCdActive] = useState(false);

  // Stopwatch State
  const [swTime, setSwTime] = useState(0);
  const [isSwActive, setIsSwActive] = useState(false);

  // Handle settings update
  const applySettings = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSettings(false);
    // Reset timer to new setting if stopped
    if (!isPomoActive) {
      if (pomoPhase === 'focus') setPomoTime(settings.focus * 60);
      else if (pomoPhase === 'shortBreak') setPomoTime(settings.shortBreak * 60);
      else if (pomoPhase === 'longBreak') setPomoTime(settings.longBreak * 60);
    }
  };

  // Global Tick
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (mode === 'pomodoro' && isPomoActive && pomoTime > 0) {
      interval = setInterval(() => setPomoTime(t => t - 1), 1000);
    } else if (mode === 'pomodoro' && isPomoActive && pomoTime === 0) {
      setIsPomoActive(false);
      if (pomoPhase === 'focus') {
        const newSessions = sessionsCompleted + 1;
        setSessionsCompleted(newSessions);
        // Track focus time for leaderboard
        if (user) {
          updateUserStudyTime(user.uid, user.displayName, user.email, settings.focus, 1);
        }
        if (newSessions % 4 === 0) {
          setPomoPhase('longBreak');
          setPomoTime(settings.longBreak * 60);
        } else {
          setPomoPhase('shortBreak');
          setPomoTime(settings.shortBreak * 60);
        }
      } else {
        setPomoPhase('focus');
        setPomoTime(settings.focus * 60);
      }
    }
    
    if (mode === 'countdown' && isCdActive && cdTime > 0) {
      interval = setInterval(() => setCdTime(t => t - 1), 1000);
    } else if (mode === 'countdown' && isCdActive && cdTime === 0) {
      setIsCdActive(false);
    }

    if (mode === 'stopwatch' && isSwActive) {
      interval = setInterval(() => setSwTime(t => t + 1), 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mode, isPomoActive, pomoTime, pomoPhase, isCdActive, cdTime, isSwActive, sessionsCompleted, settings]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const parseCdInput = () => {
    const parts = cdInput.split(':').map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      setCdTime(parts[0] * 60 + parts[1]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%', position: 'relative' }}>
      
      {/* Mode Selector */}
      <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', marginTop: '2rem' }}>
        <button onClick={() => setMode('pomodoro')} disabled={isPomoActive || isCdActive || isSwActive} style={{ ...styles.modeBtn, background: mode === 'pomodoro' ? 'var(--accent-color)' : 'transparent', color: mode === 'pomodoro' ? '#fff' : 'var(--text-secondary)' }}>
          <Clock size={16} style={{ marginRight: '6px' }} /> Pomodoro
        </button>
        <button onClick={() => setMode('countdown')} disabled={isPomoActive || isCdActive || isSwActive} style={{ ...styles.modeBtn, background: mode === 'countdown' ? 'var(--accent-color)' : 'transparent', color: mode === 'countdown' ? '#fff' : 'var(--text-secondary)' }}>
          <Hourglass size={16} style={{ marginRight: '6px' }} /> Countdown
        </button>
        <button onClick={() => setMode('stopwatch')} disabled={isPomoActive || isCdActive || isSwActive} style={{ ...styles.modeBtn, background: mode === 'stopwatch' ? 'var(--accent-color)' : 'transparent', color: mode === 'stopwatch' ? '#fff' : 'var(--text-secondary)' }}>
          <StopCircle size={16} style={{ marginRight: '6px' }} /> Stopwatch
        </button>
      </div>

      {showSettings && mode === 'pomodoro' && (
        <div style={{ position: 'absolute', top: '6rem', zIndex: 50, background: 'rgba(20,20,20,0.95)', padding: '2rem', borderRadius: '16px', boxShadow: '0 16px 40px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', width: '320px', backdropFilter: 'blur(16px)', animation: 'fadeIn 0.2s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Pomodoro Settings</h3>
            <button onClick={() => setShowSettings(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
          </div>
          <form onSubmit={applySettings} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={styles.settingRow}>
              <label>Focus Time (min)</label>
              <input type="number" value={settings.focus} onChange={e=>setSettings({...settings, focus: Number(e.target.value)})} style={styles.settingInput} min="1" max="120" />
            </div>
            <div style={styles.settingRow}>
              <label>Short Break (min)</label>
              <input type="number" value={settings.shortBreak} onChange={e=>setSettings({...settings, shortBreak: Number(e.target.value)})} style={styles.settingInput} min="1" max="30" />
            </div>
            <div style={styles.settingRow}>
              <label>Long Break (min)</label>
              <input type="number" value={settings.longBreak} onChange={e=>setSettings({...settings, longBreak: Number(e.target.value)})} style={styles.settingInput} min="1" max="60" />
            </div>
            <button type="submit" className="primary-btn" style={{ marginTop: '1rem', width: '100%' }}>Save Profile</button>
          </form>
        </div>
      )}

      {/* Main Display Area */}
      <div style={styles.displayBoard}>
        
        {/* Top Section Fixed Height Placeholder */}
        <div style={styles.topSection}>
          {mode === 'pomodoro' && (
            <div style={{ display: 'flex', gap: '1.5rem', position: 'relative' }}>
              <span onClick={() => {setPomoPhase('focus'); setPomoTime(settings.focus*60); setIsPomoActive(false)}} style={{ ...styles.subMode, color: pomoPhase === 'focus' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>Focus</span>
              <span onClick={() => {setPomoPhase('shortBreak'); setPomoTime(settings.shortBreak*60); setIsPomoActive(false)}} style={{ ...styles.subMode, color: pomoPhase === 'shortBreak' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>Short Break</span>
              <span onClick={() => {setPomoPhase('longBreak'); setPomoTime(settings.longBreak*60); setIsPomoActive(false)}} style={{ ...styles.subMode, color: pomoPhase === 'longBreak' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>Long Break</span>
            </div>
          )}
        </div>

        {/* Global Centered Clock Engine */}
        {mode === 'countdown' && !isCdActive && cdTime === (parseInt(cdInput.split(':')[0]||'0')*60 + parseInt(cdInput.split(':')[1]||'0')) ? (
          <input 
            type="text" 
            value={cdInput} 
            onChange={e => setCdInput(e.target.value)}
            onBlur={parseCdInput}
            style={{ ...styles.timeText, background: 'transparent', width: '100%', textAlign: 'center', border: 'none', outline: 'none', color: 'var(--text-primary)' }}
          />
        ) : (
          <div style={styles.timeText}>{formatTime(mode === 'pomodoro' ? pomoTime : mode === 'countdown' ? cdTime : swTime)}</div>
        )}

        {/* Fixed Controls Block */}
        <div style={styles.controls}>
          {mode === 'pomodoro' ? (
            <button className="secondary-btn" onClick={() => setShowSettings(true)} style={styles.resetBtn}>
              <SettingsIcon size={24} color="var(--text-secondary)" />
            </button>
          ) : (
            <div style={{ width: '64px', height: '64px' }} /> /* Spacer to keep Play button dead center */
          )}

          <button className="primary-btn" onClick={() => {
            if(mode==='pomodoro') setIsPomoActive(!isPomoActive);
            if(mode==='countdown') setIsCdActive(!isCdActive);
            if(mode==='stopwatch') setIsSwActive(!isSwActive);
          }} style={styles.actionBtn}>
            { (mode==='pomodoro'?isPomoActive:mode==='countdown'?isCdActive:isSwActive) ? <Pause size={38} /> : <Play size={38} style={{ marginLeft: '4px' }} />}
          </button>

          <button className="secondary-btn" onClick={() => {
            if(mode==='pomodoro'){setIsPomoActive(false); setPomoTime(pomoPhase === 'focus' ? settings.focus*60 : pomoPhase === 'shortBreak' ? settings.shortBreak*60 : settings.longBreak*60);}
            if(mode==='countdown'){setIsCdActive(false); parseCdInput();}
            if(mode==='stopwatch'){setIsSwActive(false); setSwTime(0);}
          }} style={styles.resetBtn}>
            <RotateCcw size={26} color="var(--text-secondary)" />
          </button>
        </div>

        <div style={{ height: '30px', marginTop: '2.5rem' }}>
          {mode === 'pomodoro' && (
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', letterSpacing: '1px' }}>
              SESSIONS COMPLETED: <span style={{ color: 'var(--accent-color)', fontWeight: 700 }}>{sessionsCompleted}</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

const styles = {
  modeBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem 1.5rem',
    borderRadius: '12px',
    fontWeight: 600,
    fontSize: '0.95rem',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    border: 'none',
  },
  displayBoard: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    flex: 1, // Full centering
    animation: 'fadeIn 0.4s ease-out forwards',
  },
  topSection: {
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '2rem'
  },
  subMode: {
    fontSize: '1.25rem',
    fontWeight: 600,
    cursor: 'pointer',
    padding: '0.5rem 1rem',
    transition: 'color 0.2s',
  },
  timeText: {
    fontSize: '9.5rem',  // Enlarged specifically for Focus split view
    fontWeight: 800, 
    fontFamily: "'Outfit', sans-serif", 
    letterSpacing: '2px', 
    textShadow: '0 12px 40px rgba(0,0,0,0.4)', 
    lineHeight: 1,
    marginBottom: '2.5rem'
  },
  controls: {
    display: 'flex', 
    gap: '2.5rem',
    alignItems: 'center',
    height: '100px'
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    borderRadius: '50%',
    width: '96px', // Larger action button
    height: '96px',
    boxShadow: '0 8px 32px rgba(187, 134, 252, 0.4)',
    cursor: 'pointer',
    border: 'none',
  },
  resetBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    width: '64px',
    height: '64px',
    background: 'rgba(255,255,255,0.05)', 
    border: '1px solid rgba(255,255,255,0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  settingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.95rem'
  },
  settingInput: {
    width: '80px',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#fff',
    padding: '0.5rem',
    borderRadius: '8px',
    textAlign: 'center' as const
  }
};
