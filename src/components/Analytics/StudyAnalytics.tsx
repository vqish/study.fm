import { useState, useMemo } from 'react';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { 
  BarChart, Clock, Target, Calendar, TrendingUp, BookOpen, 
  Award, Loader2, ChevronRight, PieChart, Activity, Zap 
} from 'lucide-react';

// --- Types ---
type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface SubjectStats {
  name: string;
  minutes: number;
}

// --- Main Component ---
export const StudyAnalytics = () => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const { studyStats } = useAnalytics();
  const [period, setPeriod] = useState<Period>('weekly');

  const now = new Date();
  const filteredSessions = useMemo(() => {
    if (!studyStats) return [];
    const now = new Date();
    now.setHours(23,59,59,999);
    
    return studyStats.filter(s => {
      const sDate = new Date(s.dateStr || s.timestamp?.toDate?.() || s.timestamp);
      const diffDays = (now.getTime() - sDate.getTime()) / (24 * 60 * 60 * 1000);
      
      if (period === 'daily') return diffDays < 1;
      if (period === 'weekly') return diffDays < 7;
      if (period === 'monthly') return diffDays < 30;
      return true; // yearly/all
    });
  }, [studyStats, period]);

  const stats = useMemo(() => {
    if (!studyStats || studyStats.length === 0) return null;

    const todayDateStr = new Date().toISOString().split('T')[0];
    const todaySessions = studyStats.filter(s => {
      const sDate = s.dateStr || s.timestamp?.toDate?.().toISOString().split('T')[0];
      return sDate === todayDateStr;
    });
    
    const todayMins = todaySessions.reduce((acc, s) => acc + s.minutes, 0);

    // Subject breakdown using FILTERED sessions
    const subjectMap: Record<string, number> = {};
    filteredSessions.forEach(s => {
      const name = s.subjectName || 'Uncategorized';
      subjectMap[name] = (subjectMap[name] || 0) + s.minutes;
    });

    const subjects = Object.entries(subjectMap)
      .map(([name, minutes]) => ({ name, minutes }))
      .sort((a,b) => b.minutes - a.minutes);

    return {
      todayMins,
      todaySessions: todaySessions.length,
      totalMins: filteredSessions.reduce((acc, s) => acc + s.minutes, 0),
      subjects,
      streak: calculateStreak(studyStats)
    };
  }, [studyStats, filteredSessions]);

  if (studyStats === null) {
    return (
      <div style={styles.loadingContainer}>
        <Loader2 size={40} color="var(--accent-color)" style={{ animation: 'spin 1.5s linear infinite' }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Fetching your progress...</p>
      </div>
    );
  }

  if (studyStats.length === 0) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Keep the header so it looks like a real page */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Progress Board</h2>
            <p style={styles.subtitle}>Your study growth, visualized in real-time.</p>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem' }}>📊</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>No Sessions Yet</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '360px', lineHeight: 1.6, fontSize: '0.95rem' }}>
            Start a Pomodoro, Countdown, or Stopwatch session to begin tracking your progress. Your charts will appear here!
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', background: 'rgba(187,134,252,0.1)', border: '1px solid rgba(187,134,252,0.2)', borderRadius: '12px', padding: '0.75rem 1.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-color)', fontWeight: 600 }}>💡 Tip: Click on a Planner topic and hit "Start Studying" to track subjects automatically.</span>
          </div>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Progress Board</h2>
          <p style={styles.subtitle}>Real-time synchronization of your growth.</p>
        </div>
        <div className="module-scroll-area" style={styles.periodSelector(isMobile)}>
           {(['daily', 'weekly', 'monthly', 'yearly'] as Period[]).map(p => (
             <button 
                key={p} 
                onClick={() => setPeriod(p)} 
                style={{ 
                  ...styles.periodBtn, 
                  background: period === p ? 'var(--accent-color)' : 'transparent', 
                  color: period === p ? '#fff' : 'var(--text-secondary)' 
                }}
             >
               {p}
             </button>
           ))}
        </div>
      </div>

      <div className="module-scroll-area" style={styles.scrollArea}>
        
        {/* Top Summary Cards */}
        <div style={styles.statGrid}>
          <StatCard 
            icon={<Clock size={20} color="var(--accent-color)" />} 
            label="Today's Focus" 
            value={(stats?.todayMins || 0) + 'm'} 
            subtext={(stats?.todaySessions || 0) + " sessions"} 
          />
          <StatCard 
            icon={<Activity size={20} color="#03DAC6" />} 
            label="Streak" 
            value={(stats?.streak || 0) + ' Days'} 
            subtext="Current streak" 
          />
          <StatCard 
            icon={<Target size={20} color="#CF6679" />} 
            label="Yearly" 
            value={Math.floor((stats?.totalMins || 0)/60) + 'h'} 
            subtext="Total focus time" 
          />
          <StatCard 
            icon={<Zap size={20} color="#FFB74D" />} 
            label="Productivity" 
            value={(stats?.subjects.length || 0) + ""} 
            subtext="Active domains" 
          />
        </div>

        <div style={styles.mainGrid(isMobile)}>
          
          {/* Calendar Heatmap */}
          <div className="glass-panel" style={styles.panel}>
             <h3 style={styles.panelTitle}>
               <Calendar size={18} color="var(--accent-color)" /> Focus Heatmap - {now.toLocaleString('default', { month: 'long' })}
             </h3>
             <MonthHeatmap sessions={studyStats} />
          </div>

          {/* Subject Breakdown */}
          <div className="glass-panel" style={styles.panel}>
             <h3 style={styles.panelTitle}>
               <PieChart size={18} color="#03DAC6" /> Domain Split
             </h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {stats?.subjects.slice(0, 5).map(({name, minutes}) => (
                  <div key={name}>
                    <div style={styles.subjectRow}>
                      <span style={{ fontWeight: 600 }}>{name}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{Math.floor(minutes/60)}h {minutes%60}m</span>
                    </div>
                    <div style={styles.progressBarBg}>
                      <div style={{ 
                        height: '100%', 
                        background: 'var(--accent-color)', 
                        width: `${Math.min(100, (minutes / (stats.totalMins || 1)) * 100)}%`, 
                        borderRadius: '3px',
                        transition: 'width 1s ease'
                      }} />
                    </div>
                  </div>
                ))}
                {(!stats?.subjects || stats.subjects.length === 0) && (
                   <div style={{ textAlign: 'center', py: '1rem', opacity: 0.5, fontSize: '0.9rem' }}>No domain data yet</div>
                )}
             </div>
          </div>
        </div>

        {/* Detailed Trends */}
        <div className="glass-panel" style={{ ...styles.panel, flex: 1, minHeight: '300px' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={styles.panelTitle}>Activity Trend ({period})</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Average Focus: {stats ? Math.floor(stats.totalMins / (studyStats.length || 1)) : 0}m
              </div>
           </div>
           
           <TrendChart studyStats={studyStats} period={period} />
        </div>

      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .hover-grow { transition: transform 0.2s ease; }
        .hover-grow:hover { transform: scaleY(1.05); }
      `}</style>
    </div>
  );
};

// --- Sub-Components ---

const StatCard = ({ icon, label, value, subtext }: { icon: any, label: string, value: string, subtext: string }) => (
  <div className="glass-panel" style={styles.statCard}>
    <div style={styles.statIconBox}>{icon}</div>
    <div>
       <p style={styles.statLabel}>{label}</p>
       <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
          <span style={styles.statValue}>{value}</span>
          <span style={styles.statSubtext}>{subtext}</span>
       </div>
    </div>
  </div>
);

const MonthHeatmap = ({ sessions }: { sessions: any[] }) => {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  
  const intensityMap: Record<number, number> = {};
  sessions.forEach(s => {
    const d = new Date(s.dateStr || s.timestamp?.toDate?.() || s.timestamp);
    if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
      intensityMap[d.getDate()] = (intensityMap[d.getDate()] || 0) + s.minutes;
    }
  });

  const getIntensityColor = (mins: number) => {
    if (!mins) return 'rgba(255,255,255,0.03)';
    if (mins < 60) return 'rgba(187, 134, 252, 0.2)';
    if (mins < 180) return 'rgba(187, 134, 252, 0.4)';
    if (mins < 300) return 'rgba(187, 134, 252, 0.7)';
    return 'var(--accent-color)';
  };

  return (
    <div style={styles.heatmapGrid}>
      {['S','M','T','W','T','F','S'].map(day => (
        <div key={day} style={styles.heatmapDayLabel}>{day}</div>
      ))}
      {Array(firstDay).fill(0).map((_, i) => <div key={`empty-${i}`} />)}
      {Array(daysInMonth).fill(0).map((_, i) => {
        const dayNum = i + 1;
        const mins = intensityMap[dayNum] || 0;
        return (
          <div 
            key={dayNum} 
            title={`${dayNum} ${now.toLocaleString('default', { month: 'short' })}: ${Math.floor(mins/60)}h ${mins%60}m studied`}
            style={{ 
              aspectRatio: '1', 
              borderRadius: '6px', 
              background: getIntensityColor(mins), 
              border: dayNum === now.getDate() ? '1px solid rgba(255,255,255,0.4)' : 'none', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '0.75rem', 
              fontWeight: 700,
              color: mins > 180 ? '#fff' : 'rgba(255,255,255,0.4)',
              cursor: 'default'
            }}
          >
            {dayNum}
          </div>
        );
      })}
    </div>
  );
};

const TrendChart = ({ studyStats, period }: { studyStats: any[], period: Period }) => {
  const { labels, buckets } = useMemo(() => {
    const now = new Date();
    
    if (period === 'daily') {
      const lbls = ['12a','3a','6a','9a','12p','3p','6p','9p'];
      const bkts = new Array(8).fill(0);
      studyStats.forEach(s => {
        const d = s.timestamp?.toDate ? s.timestamp.toDate() : new Date(s.timestamp);
        if (!isNaN(d.getTime())) {
          const today = new Date(); today.setHours(0,0,0,0);
          if (d >= today) bkts[Math.floor(d.getHours() / 3)] += s.minutes;
        }
      });
      return { labels: lbls, buckets: bkts };
    }
    
    if (period === 'weekly') {
      const lbls = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
      const bkts = new Array(7).fill(0);
      const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
      studyStats.forEach(s => {
        const d = new Date(s.dateStr || (s.timestamp?.toDate ? s.timestamp.toDate() : s.timestamp));
        if (d >= weekAgo) {
          const day = d.getDay(); // 0=Sun
          bkts[day === 0 ? 6 : day - 1] += s.minutes;
        }
      });
      return { labels: lbls, buckets: bkts };
    }
    
    if (period === 'monthly') {
      const lbls = ['Wk 1','Wk 2','Wk 3','Wk 4','Wk 5'];
      const bkts = new Array(5).fill(0);
      studyStats.forEach(s => {
        const d = new Date(s.dateStr || (s.timestamp?.toDate ? s.timestamp.toDate() : s.timestamp));
        if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
          bkts[Math.min(4, Math.floor((d.getDate() - 1) / 7))] += s.minutes;
        }
      });
      return { labels: lbls, buckets: bkts };
    }
    
    // yearly
    const lbls = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const bkts = new Array(12).fill(0);
    studyStats.forEach(s => {
      const d = new Date(s.dateStr || (s.timestamp?.toDate ? s.timestamp.toDate() : s.timestamp));
      if (d.getFullYear() === now.getFullYear()) bkts[d.getMonth()] += s.minutes;
    });
    return { labels: lbls, buckets: bkts };
  }, [studyStats, period]);

  const maxVal = Math.max(...buckets, 1);

  return (
    <div style={styles.chartWrapper}>
       {labels.map((label, i) => {
         const pct = Math.max(4, (buckets[i] / maxVal) * 100);
         const hasData = buckets[i] > 0;
         return (
           <div key={label + i} style={styles.chartCol}>
              <div
                title={`${label}: ${Math.floor(buckets[i]/60)}h ${buckets[i]%60}m`}
                style={{ 
                  width: '70%', 
                  height: `${pct}%`, 
                  minHeight: '4px',
                  background: hasData 
                    ? 'linear-gradient(to top, rgba(187, 134, 252, 0.5), var(--accent-color))'
                    : 'rgba(255,255,255,0.04)',
                  borderRadius: '6px 6px 0 0',
                  boxShadow: hasData ? '0 4px 12px rgba(187,134,252,0.2)' : 'none',
                  transition: 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                }} 
                className="hover-grow" 
              />
              <span style={styles.chartLabel}>{label}</span>
           </div>
         );
       })}
       <div style={styles.chartBaseLine} />
    </div>
  );
};

// --- Utilities ---

const calculateStreak = (sessions: any[]) => {
    if (!sessions || sessions.length === 0) return 0;
    const dates = sessions
      .map(s => s.dateStr || s.timestamp?.toDate?.().toISOString().split('T')[0])
      .filter(Boolean);
    
    const uniqueDates = Array.from(new Set(dates)).sort().reverse();
    if (uniqueDates.length === 0) return 0;
    
    let streak = 0;
    let checkDate = new Date();
    checkDate.setHours(0,0,0,0);
    
    // Check if user studied today or yesterday to continue streak
    const latestSession = new Date(uniqueDates[0] as string);
    latestSession.setHours(0,0,0,0);
    const diffToToday = Math.floor((checkDate.getTime() - latestSession.getTime()) / (24 * 60 * 60 * 1000));
    
    if (diffToToday > 1) return 0; // Streak broken

    for (let i = 0; i < uniqueDates.length; i++) {
        const sessionDate = new Date(uniqueDates[i] as string);
        sessionDate.setHours(0,0,0,0);
        
        // Expected date for current streak position
        const expectedDate = new Date(latestSession);
        expectedDate.setDate(latestSession.getDate() - i);
        
        if (sessionDate.getTime() === expectedDate.getTime()) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
};

// --- Styles ---

const styles = {
  root: { display: 'flex', flexDirection: 'column' as const, width: '100%', height: '100%', gap: '1.5rem', overflow: 'hidden' },
  loadingContainer: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' as const },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 },
  title: { fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.5px', margin: 0 },
  subtitle: { color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0 0 0' },
  periodSelector: (isMobile: boolean) => ({ display: 'flex', background: 'rgba(0,0,0,0.4)', padding: '0.4rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)', overflowX: isMobile ? 'auto' : 'visible' }),
  periodBtn: { padding: '0.5rem 1.25rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, textTransform: 'capitalize' as const, transition: 'all 0.3s', whiteSpace: 'nowrap' as const },
  scrollArea: { flex: 1, overflowY: 'auto' as const, display: 'flex', flexDirection: 'column' as const, gap: '1.5rem', paddingBottom: '2rem', paddingRight: '0.5rem' },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' },
  statCard: { padding: '1.5rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '1.25rem', border: '1px solid rgba(255,255,255,0.05)' },
  statIconBox: { width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statLabel: { fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '1px', margin: 0 },
  statValue: { fontSize: '1.5rem', fontWeight: 900, color: '#fff' },
  statSubtext: { fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 },
  mainGrid: (isMobile: boolean) => ({ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.6fr 1fr', gap: '1.5rem' }),
  panel: { padding: 'clamp(1rem, 3vw, 1.75rem)', borderRadius: '24px', display: 'flex', flexDirection: 'column' as const, gap: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', boxSizing: 'border-box' as const },
  panelTitle: { fontSize: '1.1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fff' },
  subjectRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' },
  progressBarBg: { height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' },
  heatmapGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' },
  heatmapDayLabel: { textAlign: 'center' as const, fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 800, marginBottom: '6px' },
  chartWrapper: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', width: '100%', gap: '6px', paddingBottom: '1.5rem', position: 'relative' as const },
  chartCol: { flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '10px', height: '100%', justifyContent: 'flex-end' },
  chartLabel: { fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 800 },
  chartBaseLine: { position: 'absolute' as const, left: 0, bottom: '28px', width: '100%', height: '1px', background: 'rgba(255,255,255,0.08)' }
};
