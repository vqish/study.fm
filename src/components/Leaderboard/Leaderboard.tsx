import { useState, useEffect } from 'react';
import { Trophy, Medal, Star, Clock, Users, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { type LeaderboardEntry, markUserActive } from '../Timer/Timer';

const LEADERBOARD_KEY = 'studyfm_leaderboard';

// Seed some demo users so the leaderboard isn't empty for new installs
const SEED_USERS: LeaderboardEntry[] = [
  { uid: 'seed_1', name: 'Alice_Study', email: 'alice@study.fm', focusMinutes: 420, sessions: 16, lastActive: Date.now() - 120000 },
  { uid: 'seed_2', name: 'CodeNinja', email: 'ninja@study.fm', focusMinutes: 375, sessions: 15, lastActive: Date.now() - 60000 },
  { uid: 'seed_3', name: 'Math_Pro', email: 'math@study.fm', focusMinutes: 310, sessions: 12, lastActive: Date.now() - 3600000 },
  { uid: 'seed_4', name: 'ScienceGal', email: 'sci@study.fm', focusMinutes: 195, sessions: 8, lastActive: Date.now() - 7200000 },
  { uid: 'seed_5', name: 'HistoryBuff', email: 'hist@study.fm', focusMinutes: 150, sessions: 6, lastActive: Date.now() - 86400000 },
];

function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const stored = localStorage.getItem(LEADERBOARD_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  // First time — seed with demo users
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(SEED_USERS));
  return SEED_USERS;
}

function getTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 60000) return 'Online';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hr ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function formatStudyTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

export const Leaderboard = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = () => {
    setRefreshing(true);
    // Mark current user as active
    if (user) {
      markUserActive(user.uid, user.displayName, user.email);
    }
    const data = loadLeaderboard();
    // Sort by focus minutes descending
    data.sort((a, b) => b.focusMinutes - a.focusMinutes);
    setEntries(data);
    setTimeout(() => setRefreshing(false), 400);
  };

  useEffect(() => {
    refresh();
    // Auto-refresh every 10 seconds
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const currentUserRank = user ? entries.findIndex(e => e.uid === user.uid) + 1 : 0;
  const currentUserEntry = user ? entries.find(e => e.uid === user.uid) : null;

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return 'var(--text-secondary)';
  };

  const getAvatarGradient = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const h1 = Math.abs(hash % 360);
    const h2 = (h1 + 40) % 360;
    return `linear-gradient(135deg, hsl(${h1}, 70%, 55%), hsl(${h2}, 70%, 40%))`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Study Leaderboard</h2>
          <p style={{ color: 'var(--text-secondary)' }}>All study.fm users ranked by focus time.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={refresh} className="secondary-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '10px' }}>
            <RefreshCw size={16} style={{ animation: refreshing ? 'spin 0.5s linear' : 'none' }} /> Refresh
          </button>
          <div className="glass-panel" style={{ background: 'rgba(255,193,7,0.1)', color: '#FFC107', padding: '0.6rem 1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, border: '1px solid rgba(255,193,7,0.3)', fontSize: '0.9rem' }}>
            <Users size={16} /> {entries.length} students
          </div>
        </div>
      </div>

      {/* Current User Stats Card */}
      {user && currentUserEntry && (
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.25rem 1.5rem', borderRadius: '14px', background: 'rgba(187,134,252,0.08)', border: '1px solid rgba(187,134,252,0.2)' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: getAvatarGradient(user.displayName), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>
            {user.displayName.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>Your Stats</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
              Rank #{currentUserRank} • {currentUserEntry.sessions} sessions completed
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-color)' }}>{formatStudyTime(currentUserEntry.focusMinutes)}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Focus</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: getRankColor(currentUserRank) }}>#{currentUserRank}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rank</p>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="glass-panel" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderRadius: '16px' }}>
        <div style={{ display: 'flex', padding: '0.75rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          <div style={{ width: '70px' }}>Rank</div>
          <div style={{ flex: 1 }}>Student</div>
          <div style={{ width: '120px', textAlign: 'right' }}>Focus Time</div>
          <div style={{ width: '90px', textAlign: 'right' }}>Sessions</div>
          <div style={{ width: '100px', textAlign: 'right' }}>Status</div>
        </div>

        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            <Clock size={36} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p>No study data yet. Start a focus session to appear here!</p>
          </div>
        ) : entries.map((entry, i) => {
          const rank = i + 1;
          const isCurrentUser = user && entry.uid === user.uid;
          const statusText = getTimeAgo(entry.lastActive);
          const isOnline = statusText === 'Online';

          return (
            <div key={entry.uid} style={{ 
              display: 'flex', padding: '1rem 1.5rem', alignItems: 'center', 
              background: isCurrentUser ? 'rgba(187,134,252,0.08)' : rank <= 3 ? 'rgba(255,255,255,0.03)' : 'transparent', 
              borderRadius: '12px', 
              border: isCurrentUser ? '1px solid rgba(187,134,252,0.25)' : rank <= 3 ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
              transition: 'all 0.2s',
              cursor: 'default'
            }} onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateX(4px)'; }} onMouseOut={e => { e.currentTarget.style.background = isCurrentUser ? 'rgba(187,134,252,0.08)' : rank <= 3 ? 'rgba(255,255,255,0.03)' : 'transparent'; e.currentTarget.style.transform = 'translateX(0)'; }}>
              
              <div style={{ width: '70px', display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: '1.1rem', color: getRankColor(rank) }}>
                {rank <= 3 ? <Medal size={24} style={{ marginRight: '6px' }} /> : `#${rank}`}
              </div>
              
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: getAvatarGradient(entry.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 600, color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', flexShrink: 0 }}>
                  {entry.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span style={{ fontWeight: 600, fontSize: '1rem' }}>{entry.name}</span>
                  {isCurrentUser && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', color: 'var(--accent-color)', background: 'rgba(187,134,252,0.15)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>YOU</span>}
                </div>
              </div>
              
              <div style={{ width: '120px', textAlign: 'right', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem', color: 'var(--accent-color)', fontSize: '1rem' }}>
                {formatStudyTime(entry.focusMinutes)} <Star size={16} fill="currentColor" />
              </div>
              
              <div style={{ width: '90px', textAlign: 'right', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {entry.sessions}
              </div>

              <div style={{ width: '100px', textAlign: 'right', fontSize: '0.8rem', color: isOnline ? 'var(--success-color)' : 'var(--text-secondary)', fontWeight: isOnline ? 600 : 400, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                {isOnline && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success-color)' }} />}
                {statusText}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
