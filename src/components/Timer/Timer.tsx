import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, Hourglass, StopCircle, Settings as SettingsIcon, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../utils/db';
import { useAnalytics } from '../../contexts/AnalyticsContext';

type TimerMode = 'pomodoro' | 'countdown' | 'stopwatch';
type PomoPhase = 'focus' | 'shortBreak' | 'longBreak';

export const Timer = () => {
  const { user } = useAuth();
  const { refreshStats } = useAnalytics();
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timerSubject, setTimerSubject] = useState('General Focus');
  const [timerTopic, setTimerTopic] = useState('Pomodoro Session');

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
  const [cdHoursInput, setCdHoursInput] = useState(0);
  const [cdMinutesInput, setCdMinutesInput] = useState(45);
  const [cdSecondsInput, setCdSecondsInput] = useState(0);
  const [cdTime, setCdTime] = useState(45 * 60);
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

  // Stable Interval Implementation
  useEffect(() => {
    let interval: any = null;
    
    // Pomodoro Timer
    if (mode === 'pomodoro' && isPomoActive) {
      interval = setInterval(() => {
        setPomoTime((prev) => {
          if (prev <= 1) {
            setIsPomoActive(false);
            handlePomoFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } 
    // Countdown Timer
    else if (mode === 'countdown' && isCdActive) {
      interval = setInterval(() => {
        setCdTime((prev) => {
          if (prev <= 1) {
            setIsCdActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    // Stopwatch
    else if (mode === 'stopwatch' && isSwActive) {
      interval = setInterval(() => {
        setSwTime(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [mode, isPomoActive, isCdActive, isSwActive]);

  const handlePomoFinish = () => {
    if (pomoPhase === 'focus') {
      const newSessions = sessionsCompleted + 1;
      setSessionsCompleted(newSessions);
      
      if (user) {
         db.addSession({
           userUid: user.uid,
           topicId: 'pomodoro_' + Date.now(),
           topicName: timerTopic,
           subjectName: timerSubject,
           minutes: settings.focus
         }).then(() => {
           refreshStats();
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
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startCountdown = () => {
    const totalSeconds = (cdHoursInput * 3600) + (cdMinutesInput * 60) + cdSecondsInput;
    if (totalSeconds > 0) {
      setCdTime(totalSeconds);
      setIsCdActive(true);
    }
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%', position: 'relative' }}>
      <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '24px', border: '1px solid var(--border-color)', marginTop: '2rem' }}>
        <button onClick={() => setMode('pomodoro')} disabled={isPomoActive || isCdActive || isSwActive} style={{ ...styles.modeBtn, background: mode === 'pomodoro' ? 'var(--accent-color)' : 'transparent', color: mode === 'pomodoro' ? '#fff' : 'var(--text-secondary)' }}>
          Pomodoro
        </button>
        <button onClick={() => setMode('countdown')} disabled={isPomoActive || isCdActive || isSwActive} style={{ ...styles.modeBtn, background: mode === 'countdown' ? 'var(--accent-color)' : 'transparent', color: mode === 'countdown' ? '#fff' : 'var(--text-secondary)' }}>
          Countdown
        </button>
        <button onClick={() => setMode('stopwatch')} disabled={isPomoActive || isCdActive || isSwActive} style={{ ...styles.modeBtn, background: mode === 'stopwatch' ? 'var(--accent-color)' : 'transparent', color: mode === 'stopwatch' ? '#fff' : 'var(--text-secondary)' }}>
          Stopwatch
        </button>
      </div>

      <div style={styles.displayBoard}>
        <div style={styles.topSection}>
          {mode === 'pomodoro' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <span onClick={() => {setPomoPhase('focus'); setPomoTime(settings.focus*60); setIsPomoActive(false)}} style={{ ...styles.subMode, color: pomoPhase === 'focus' ? 'var(--accent-color)' : 'var(--text-secondary)', fontWeight: pomoPhase === 'focus' ? 800 : 500 }}>Focus</span>
                <span onClick={() => {setPomoPhase('shortBreak'); setPomoTime(settings.shortBreak*60); setIsPomoActive(false)}} style={{ ...styles.subMode, color: pomoPhase === 'shortBreak' ? 'var(--accent-color)' : 'var(--text-secondary)', fontWeight: pomoPhase === 'shortBreak' ? 800 : 500 }}>Break</span>
                <span onClick={() => {setPomoPhase('longBreak'); setPomoTime(settings.longBreak*60); setIsPomoActive(false)}} style={{ ...styles.subMode, color: pomoPhase === 'longBreak' ? 'var(--accent-color)' : 'var(--text-secondary)', fontWeight: pomoPhase === 'longBreak' ? 800 : 500 }}>Long Break</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', opacity: isPomoActive ? 0.3 : 1, transition: 'opacity 0.3s' }}>
                 <input type="text" value={timerSubject} onChange={e => setTimerSubject(e.target.value)} disabled={isPomoActive} placeholder="Subject" style={styles.topicInput} />
                 <input type="text" value={timerTopic} onChange={e => setTimerTopic(e.target.value)} disabled={isPomoActive} placeholder="Task" style={styles.topicInput} />
              </div>
            </div>
          ) : null}
        </div>

        {mode === 'countdown' && !isCdActive ? (
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '3.5rem' }}>
            <div style={styles.inputStack}>
              <input type="number" min="0" max="99" value={cdHoursInput} onChange={e => setCdHoursInput(Math.max(0, parseInt(e.target.value)||0))} style={styles.timeInput} />
              <span style={styles.inputLabel}>Hrs</span>
            </div>
            <span style={styles.timeColon}>:</span>
            <div style={styles.inputStack}>
              <input type="number" min="0" max="59" value={cdMinutesInput} onChange={e => setCdMinutesInput(Math.min(59, Math.max(0, parseInt(e.target.value)||0)))} style={styles.timeInput} />
              <span style={styles.inputLabel}>Min</span>
            </div>
            <span style={styles.timeColon}>:</span>
            <div style={styles.inputStack}>
              <input type="number" min="0" max="59" value={cdSecondsInput} onChange={e => setCdSecondsInput(Math.min(59, Math.max(0, parseInt(e.target.value)||0)))} style={styles.timeInput} />
              <span style={styles.inputLabel}>Sec</span>
            </div>
          </div>
        ) : (
          <div style={styles.timeText}>{formatTime(mode === 'pomodoro' ? pomoTime : mode === 'countdown' ? cdTime : swTime)}</div>
        )}

        <div style={styles.controls}>
          {mode === 'pomodoro' ? (
            <button className="secondary-btn" onClick={() => setShowSettings(true)} style={styles.resetBtn}><SettingsIcon size={24} /></button>
          ) : <div style={{ width: '70px' }} />}

          <button className="primary-btn" onClick={() => {
            if(mode==='pomodoro') setIsPomoActive(!isPomoActive);
            if(mode==='countdown') {
              if (isCdActive) setIsCdActive(false);
              else startCountdown();
            }
            if(mode==='stopwatch') setIsSwActive(!isSwActive);
          }} style={styles.actionBtn}>
            { (mode==='pomodoro'?isPomoActive:mode==='countdown'?isCdActive:isSwActive) ? <Pause size={48} fill="white" /> : <Play size={48} fill="white" style={{ marginLeft: '6px' }} />}
          </button>

          <button className="secondary-btn" onClick={() => {
            if(mode==='pomodoro'){setIsPomoActive(false); setPomoTime(pomoPhase === 'focus' ? settings.focus*60 : pomoPhase === 'shortBreak' ? settings.shortBreak*60 : settings.longBreak*60);}
            if(mode==='countdown'){setIsCdActive(false); setCdTime(cdHoursInput * 3600 + cdMinutesInput * 60 + cdSecondsInput);}
            if(mode==='stopwatch'){setIsSwActive(false); setSwTime(0);}
          }} style={styles.resetBtn}><RotateCcw size={24} /></button>
        </div>

        {mode === 'pomodoro' && (
          <div style={{ marginTop: '4rem' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px' }}>
              Pomodoros: <span style={{ color: 'var(--accent-color)' }}>{sessionsCompleted}</span>
            </div>
          </div>
        )}
      </div>

      {showSettings && (
        <div className="glass-panel" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000, padding: '2.5rem', width: '380px', boxShadow: '0 30px 60px rgba(0,0,0,0.8)', border: '1px solid var(--accent-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Settings</h3>
                <button onClick={() => setShowSettings(false)}><X /></button>
            </div>
            <form onSubmit={applySettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
               <div style={styles.settingRow}><label>Focus</label><input type="number" value={settings.focus} onChange={e=>setSettings({...settings, focus: Number(e.target.value)})} style={styles.settingInput} /></div>
               <div style={styles.settingRow}><label>Short Break</label><input type="number" value={settings.shortBreak} onChange={e=>setSettings({...settings, shortBreak: Number(e.target.value)})} style={styles.settingInput} /></div>
               <div style={styles.settingRow}><label>Long Break</label><input type="number" value={settings.longBreak} onChange={e=>setSettings({...settings, longBreak: Number(e.target.value)})} style={styles.settingInput} /></div>
               <button type="submit" className="primary-btn" style={{ marginTop: '1rem' }}>Apply Changes</button>
            </form>
        </div>
      )}
    </div>
  );
};

const styles = {
  modeBtn: { padding: '0.75rem 1.5rem', borderRadius: '20px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.3s' },
  displayBoard: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', width: '100%', flex: 1 },
  topSection: { height: '60px', marginBottom: '2rem' },
  subMode: { fontSize: '1rem', cursor: 'pointer', padding: '0.5rem 1rem' },
  timeText: { fontSize: '12rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif", letterSpacing: '-4px', color: '#fff', marginBottom: '3rem', textShadow: '0 10px 40px rgba(0,0,0,0.5)' },
  controls: { display: 'flex', gap: '2.5rem', alignItems: 'center' },
  actionBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '110px', height: '110px', borderRadius: '50%', boxShadow: '0 10px 30px rgba(187, 134, 252, 0.4)', transition: 'transform 0.2s' },
  resetBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', width: '70px', height: '70px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' },
  timeInput: { fontSize: '7.5rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif", background: 'transparent', border: 'none', color: '#fff', width: '160px', textAlign: 'center' as const, outline: 'none', borderBottom: '2px solid rgba(255,255,255,0.1)' },
  inputStack: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center' },
  inputLabel: { fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 800, marginTop: '0.5rem', textTransform: 'uppercase' as const },
  timeColon: { fontSize: '5rem', fontWeight: 900, color: 'rgba(255,255,255,0.1)', paddingBottom: '2rem' },
  settingRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  settingInput: { width: '80px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: '#fff', padding: '0.6rem', borderRadius: '10px', textAlign: 'center' as const },
  topicInput: { background: 'rgba(0,0,0,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', outline: 'none' }
};


