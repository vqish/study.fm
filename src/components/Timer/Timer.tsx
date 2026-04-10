import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, Hourglass, StopCircle, Settings as SettingsIcon, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../utils/db';

type TimerMode = 'pomodoro' | 'countdown' | 'stopwatch';
type PomoPhase = 'focus' | 'shortBreak' | 'longBreak';

export const Timer = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState<TimerMode>('pomodoro');

  // Mark user as active in the global DB when they open the timer
  useEffect(() => {
    if (user) {
      db.syncProfile({ 
        uid: user.uid, 
        displayName: user.displayName, 
        email: user.email,
        lastActive: Date.now() 
      });
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

  const applySettings = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSettings(false);
    if (!isPomoActive) {
      if (pomoPhase === 'focus') setPomoTime(settings.focus * 60);
      else if (pomoPhase === 'shortBreak') setPomoTime(settings.shortBreak * 60);
      else if (pomoPhase === 'longBreak') setPomoTime(settings.longBreak * 60);
    }
  };

  useEffect(() => {
    let interval: any = null;
    
    if (mode === 'pomodoro' && isPomoActive && pomoTime > 0) {
      interval = setInterval(() => setPomoTime(t => t - 1), 1000);
    } else if (mode === 'pomodoro' && isPomoActive && pomoTime === 0) {
      setIsPomoActive(false);
      if (pomoPhase === 'focus') {
        const newSessions = sessionsCompleted + 1;
        setSessionsCompleted(newSessions);
        
        // SYNC WITH DB SESSION SYSTEM
        if (user) {
           db.addSession({
             userUid: user.uid,
             topicId: 'pomodoro',
             topicName: 'Pomodoro Session',
             subjectName: 'Focus Timer',
             minutes: settings.focus
           }).catch(console.error);
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

    return () => clearInterval(interval);
  }, [mode, isPomoActive, pomoTime, pomoPhase, isCdActive, cdTime, isSwActive, sessionsCompleted, settings, user]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
      <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.6rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', marginTop: '2rem' }}>
        <button onClick={() => setMode('pomodoro')} disabled={isPomoActive || isCdActive || isSwActive} style={{ ...styles.modeBtn, background: mode === 'pomodoro' ? 'var(--accent-color)' : 'transparent', color: mode === 'pomodoro' ? '#fff' : 'var(--text-secondary)' }}>
          <Clock size={16} style={{ marginRight: '8px' }} /> Pomodoro
        </button>
        <button onClick={() => setMode('countdown')} disabled={isPomoActive || isCdActive || isSwActive} style={{ ...styles.modeBtn, background: mode === 'countdown' ? 'var(--accent-color)' : 'transparent', color: mode === 'countdown' ? '#fff' : 'var(--text-secondary)' }}>
          <Hourglass size={16} style={{ marginRight: '6px' }} /> Countdown
        </button>
        <button onClick={() => setMode('stopwatch')} disabled={isPomoActive || isCdActive || isSwActive} style={{ ...styles.modeBtn, background: mode === 'stopwatch' ? 'var(--accent-color)' : 'transparent', color: mode === 'stopwatch' ? '#fff' : 'var(--text-secondary)' }}>
          <StopCircle size={16} style={{ marginRight: '6px' }} /> Stopwatch
        </button>
      </div>

      {showSettings && mode === 'pomodoro' && (
        <div style={{ position: 'absolute', top: '7rem', zIndex: 100, background: 'rgba(15,15,20,0.98)', padding: '2.5rem', borderRadius: '24px', boxShadow: '0 24px 64px rgba(0,0,0,0.7)', border: '1px solid var(--accent-color)', width: '360px', backdropFilter: 'blur(30px)', animation: 'slideUp 0.3s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Timer Settings</h3>
            <button onClick={() => setShowSettings(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem', borderRadius: '10px' }}><X size={20} /></button>
          </div>
          <form onSubmit={applySettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={styles.settingRow}><label>Focus Time</label><input type="number" value={settings.focus} onChange={e=>setSettings({...settings, focus: Number(e.target.value)})} style={styles.settingInput} min="1" max="120" /></div>
            <div style={styles.settingRow}><label>Short Break</label><input type="number" value={settings.shortBreak} onChange={e=>setSettings({...settings, shortBreak: Number(e.target.value)})} style={styles.settingInput} min="1" max="30" /></div>
            <div style={styles.settingRow}><label>Long Break</label><input type="number" value={settings.longBreak} onChange={e=>setSettings({...settings, longBreak: Number(e.target.value)})} style={styles.settingInput} min="1" max="60" /></div>
            <button type="submit" className="primary-btn" style={{ marginTop: '1.5rem', width: '100%', padding: '1rem' }}>Update Pomodoro</button>
          </form>
        </div>
      )}

      <div style={styles.displayBoard}>
        <div style={styles.topSection}>
          {mode === 'pomodoro' && (
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <span onClick={() => {setPomoPhase('focus'); setPomoTime(settings.focus*60); setIsPomoActive(false)}} style={{ ...styles.subMode, color: pomoPhase === 'focus' ? 'var(--accent-color)' : 'var(--text-secondary)', borderBottom: pomoPhase === 'focus' ? '2px solid var(--accent-color)' : 'none' }}>Focus</span>
              <span onClick={() => {setPomoPhase('shortBreak'); setPomoTime(settings.shortBreak*60); setIsPomoActive(false)}} style={{ ...styles.subMode, color: pomoPhase === 'shortBreak' ? 'var(--accent-color)' : 'var(--text-secondary)', borderBottom: pomoPhase === 'shortBreak' ? '2px solid var(--accent-color)' : 'none' }}>Short Break</span>
              <span onClick={() => {setPomoPhase('longBreak'); setPomoTime(settings.longBreak*60); setIsPomoActive(false)}} style={{ ...styles.subMode, color: pomoPhase === 'longBreak' ? 'var(--accent-color)' : 'var(--text-secondary)', borderBottom: pomoPhase === 'longBreak' ? '2px solid var(--accent-color)' : 'none' }}>Long Break</span>
            </div>
          )}
        </div>

        {mode === 'countdown' && !isCdActive && cdTime === (parseInt(cdInput.split(':')[0]||'0')*60 + parseInt(cdInput.split(':')[1]||'0')) ? (
          <input type="text" value={cdInput} onChange={e => setCdInput(e.target.value)} onBlur={parseCdInput} style={{ ...styles.timeText, background: 'transparent', width: '100%', textAlign: 'center', border: 'none', outline: 'none', color: '#fff' }} />
        ) : (
          <div style={styles.timeText}>{formatTime(mode === 'pomodoro' ? pomoTime : mode === 'countdown' ? cdTime : swTime)}</div>
        )}

        <div style={styles.controls}>
          {mode === 'pomodoro' ? (
            <button className="secondary-btn" onClick={() => setShowSettings(true)} style={styles.resetBtn}><SettingsIcon size={26} /></button>
          ) : <div style={{ width: '70px' }} />}

          <button className="primary-btn" onClick={() => {
            if(mode==='pomodoro') setIsPomoActive(!isPomoActive);
            if(mode==='countdown') setIsCdActive(!isCdActive);
            if(mode==='stopwatch') setIsSwActive(!isSwActive);
          }} style={styles.actionBtn}>
            { (mode==='pomodoro'?isPomoActive:mode==='countdown'?isCdActive:isSwActive) ? <Pause size={42} fill="white" /> : <Play size={42} fill="white" style={{ marginLeft: '6px' }} />}
          </button>

          <button className="secondary-btn" onClick={() => {
            if(mode==='pomodoro'){setIsPomoActive(false); setPomoTime(pomoPhase === 'focus' ? settings.focus*60 : pomoPhase === 'shortBreak' ? settings.shortBreak*60 : settings.longBreak*60);}
            if(mode==='countdown'){setIsCdActive(false); parseCdInput();}
            if(mode==='stopwatch'){setIsSwActive(false); setSwTime(0);}
          }} style={styles.resetBtn}><RotateCcw size={26} /></button>
        </div>

        <div style={{ height: '30px', marginTop: '3.5rem' }}>
          {mode === 'pomodoro' && (
            <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              Sessions: <span style={{ color: 'var(--accent-color)', fontWeight: 800 }}>{sessionsCompleted}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  modeBtn: { display: 'flex', alignItems: 'center', padding: '0.85rem 1.75rem', borderRadius: '14px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', border: 'none', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)' },
  displayBoard: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', width: '100%', flex: 1, animation: 'fadeIn 0.5s ease-out' },
  topSection: { height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2.5rem' },
  subMode: { fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', padding: '0.6rem 1rem', transition: 'all 0.2s', letterSpacing: '0.5px' },
  timeText: { fontSize: '11rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif", letterSpacing: '-2px', textShadow: '0 20px 80px rgba(0,0,0,0.5)', lineHeight: 1, marginBottom: '3rem', color: '#fff' },
  controls: { display: 'flex', gap: '3rem', alignItems: 'center' },
  actionBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100px', height: '100px', borderRadius: '50%', boxShadow: '0 12px 48px rgba(187, 134, 252, 0.5)', cursor: 'pointer', border: 'none' },
  resetBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', width: '70px', height: '70px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.2s' },
  settingRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600 },
  settingInput: { width: '90px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.75rem', borderRadius: '12px', textAlign: 'center' as const, outline: 'none' }
};
