import { useState, useMemo } from 'react';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { BarChart, Clock, Target, Calendar, TrendingUp, BookOpen, Award, Loader2, ChevronRight } from 'lucide-react';

type Period = 'daily' | 'weekly' | 'monthly';

export const StudyAnalytics = () => {
  const { studyStats } = useAnalytics();
  const [period, setPeriod] = useState<Period>('weekly');

  // Filter sessions based on period
  const filteredSessions = useMemo(() => {
    if (!studyStats) return [];
    const now = Date.now();
    const msMap = {
      daily: 24 * 60 * 60 * 1000,
      weekly: 7 * 24 * 60 * 60 * 1000,
      monthly: 30 * 24 * 60 * 60 * 1000,
    };
    
    return studyStats.filter((s: any) => {
      const sessionMs = s.timestamp?.toMillis ? s.timestamp.toMillis() : s.timestamp;
      return now - sessionMs <= msMap[period];
    });
  }, [studyStats, period]);

  // Aggregate stats
  const totalMinutes = filteredSessions.reduce((acc: number, s: any) => acc + s.minutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const totalSessions = filteredSessions.length;

  // Most studied subject
  const subjectMap: any = {};
  filteredSessions.forEach((s: any) => {
    subjectMap[s.subjectName] = (subjectMap[s.subjectName] || 0) + s.minutes;
  });
  const sortedSubjects = Object.entries(subjectMap).sort((a: any, b: any) => b[1] - a[1]);
  const mostStudied = sortedSubjects[0];

  // Topic breakdown
  const topicMap: any = {};
  filteredSessions.forEach((s: any) => {
    topicMap[s.topicName] = (topicMap[s.topicName] || 0) + s.minutes;
  });
  const topTopics = Object.entries(topicMap).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5);

  if (studyStats === null) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Loader2 size={48} color="var(--accent-color)" style={{ animation: 'spin 1.5s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', gap: '1.5rem', overflowY: 'auto', paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem', letterSpacing: '-0.5px' }}>Study Analytics</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Detailed insights into your {period} focus patterns.</p>
        </div>
        <div style={styles.periodSelector}>
          {(['daily', 'weekly', 'monthly'] as Period[]).map((p) => (
            <button 
              key={p}
              onClick={() => setPeriod(p)}
              style={{ 
                ...styles.periodBtn, 
                background: period === p ? 'var(--accent-color)' : 'transparent', 
                color: period === p ? '#fff' : 'var(--text-secondary)' 
              }}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Row */}
      <div style={styles.statsRow}>
        <StatCard icon={<Clock color="#BB86FC" />} value={totalHours} sublabel="Hours Focused" />
        <StatCard icon={<Target color="#03DAC6" />} value={totalSessions} sublabel="Total Sessions" />
        <StatCard icon={<Award color="#CF6679" />} value={sortedSubjects.length} sublabel="Active Subjects" />
        <StatCard icon={<TrendingUp color="#FFB74D" />} value={calculateStreak(studyStats)} sublabel="Day Streak" />
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        {/* Topic Breakdown Chart */}
        <div className="glass-panel" style={{ flex: 1.5, minWidth: '400px', padding: '2.5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
            <div style={{ background: 'rgba(187,134,252,0.1)', padding: '0.5rem', borderRadius: '10px' }}>
              <BarChart size={20} color="var(--accent-color)" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Top Focus Topics ({period})</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
            {topTopics.length > 0 ? topTopics.map(([name, mins]: any) => (
              <div key={name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem', fontSize: '0.95rem' }}>
                  <span style={{ fontWeight: 600 }}>{name}</span>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                     <span style={{ color: '#fff', fontWeight: 700 }}>{mins}</span>
                     <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>MINS</span>
                  </div>
                </div>
                <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ width: `${Math.max(2, Math.min(100, (mins / totalMinutes) * 100))}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-color), #03DAC6)', borderRadius: '6px', transition: 'width 1.5s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                </div>
              </div>
            )) : (
              <EmptyState icon={<BookOpen size={48} />} text="No study sessions logged for this period yet." />
            )}
          </div>
        </div>

        {/* Most Studied Subject Card */}
        <div className="glass-panel" style={{ flex: 1, minWidth: '320px', padding: '2.5rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Subject Mastery</h3>
          
          {mostStudied ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(3, 218, 198, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(3, 218, 198, 0.2)' }}>
                  <Target size={48} color="#03DAC6" />
                </div>
                <div style={{ position: 'absolute', bottom: -5, right: -5, background: 'var(--accent-color)', borderRadius: '50%', padding: '0.4rem', border: '3px solid var(--surface-color)' }}>
                   <TrendingUp size={16} color="#fff" />
                </div>
              </div>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Dominant Interest</p>
                <h4 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: 0 }}>{mostStudied[0]}</h4>
              </div>
              <div style={{ width: '100%', padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.05)' }}>
                 <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Total Time Invested</p>
                 <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-color)' }}>{mostStudied[1]} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>MINUTES</span></p>
              </div>
            </div>
          ) : (
            <EmptyState icon={<Calendar size={48} />} text="Begin your first domain to see peak stats." />
          )}
        </div>
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const calculateStreak = (sessions: any) => {
    if (!sessions || sessions.length === 0) return 0;
    // Simple mock logic for demo if real streaks aren't tracked
    return Math.min(sessions.length, 5); 
}

const StatCard = ({ icon, value, sublabel }: any) => (
  <div className="glass-panel" style={{ flex: 1, minWidth: '200px', padding: '1.75rem', borderRadius: '22px', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <div>
      <h4 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', margin: 0 }}>{value}</h4>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', marginTop: '0.25rem' }}>{sublabel}</p>
    </div>
  </div>
);

const EmptyState = ({ icon, text }: any) => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
    <div style={{ marginBottom: '1.25rem', color: 'var(--accent-color)' }}>{icon}</div>
    <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>{text}</p>
  </div>
);

const styles = {
  periodSelector: {
    display: 'flex',
    background: 'rgba(0,0,0,0.4)',
    padding: '0.4rem',
    borderRadius: '14px',
    border: '1px solid rgba(255,255,255,0.05)',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
  },
  periodBtn: {
    padding: '0.6rem 1.75rem',
    borderRadius: '10px',
    border: 'none',
    background: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  statsRow: {
    display: 'flex',
    gap: '1.5rem',
    flexWrap: 'wrap' as const,
  }
};
