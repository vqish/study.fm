import { useState, useEffect } from 'react';
import { Trophy, Medal, Star, Clock, Users, RefreshCw, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db, UserProfile } from '../../utils/db';

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
  const [entries, setEntries] = useState<UserProfile[]>([]);
  const [refreshing, setRefreshing] = useState(true);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const data = await db.getUsers();
      // Sort by study time descending
      data.sort((a, b) => b.studyTime - a.studyTime);
      setEntries(data);
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    refresh();
    // Auto-refresh every 30 seconds
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, []);

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
          <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Global Leaderboard</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Compete with focused students worldwide.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={refresh} className="secondary-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', borderRadius: '12px' }}>
            <RefreshCw size={18} style={{ animation: refreshing ? 'spin 1.5s linear infinite' : 'none' }} /> Refresh
          </button>
          <div className="glass-panel" style={{ background: 'rgba(255,193,7,0.1)', color: '#FFC107', padding: '0.75rem 1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700, border: '1px solid rgba(255,193,7,0.3)', fontSize: '0.95rem' }}>
            <Users size={18} /> {entries.length} members
          </div>
        </div>
      </div>

      {user && currentUserEntry && (
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem 2rem', borderRadius: '24px', background: 'rgba(187,134,252,0.1)', border: '1px solid var(--accent-color)', boxShadow: '0 10px 40px rgba(187,134,252,0.15)' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '20px', background: getAvatarGradient(user.displayName), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
            {user.displayName.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>{user.displayName}</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.3rem', fontWeight: 600 }}>
              Rank #{currentUserRank} • {currentUserEntry.sessions} sessions completed
            </p>
          </div>
          <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-color)', margin: 0 }}>{formatStudyTime(currentUserEntry.studyTime)}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginTop: '0.25rem' }}>Total Focus</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, color: getRankColor(currentUserRank), margin: 0 }}>#{currentUserRank}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginTop: '0.25rem' }}>Global Rank</p>
            </div>
          </div>
        </div>
      )}

      <div className="glass-panel" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
          <div style={{ width: '80px' }}>Rank</div>
          <div style={{ flex: 1 }}>Student</div>
          <div style={{ width: '140px', textAlign: 'right' }}>Focus Time</div>
          <div style={{ width: '100px', textAlign: 'right' }}>Sessions</div>
          <div style={{ width: '120px', textAlign: 'right' }}>Status</div>
        </div>

        {refreshing && entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)', opacity: 0.5 }}>
            <Loader2 size={48} style={{ marginBottom: '1rem', animation: 'spin 1.5s linear infinite' }} />
            <p style={{ fontSize: '1.1rem' }}>Sourcing records from Firestore...</p>
          </div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)', opacity: 0.5 }}>
            <Clock size={48} style={{ marginBottom: '1rem' }} />
            <p style={{ fontSize: '1.1rem' }}>No study data yet. Start a focus session to appear here!</p>
          </div>
        ) : entries.map((entry, i) => {
          const rank = i + 1;
          const isCurrentUser = user && entry.uid === user.uid;
          const statusText = getTimeAgo(entry.lastActive);
          const isOnline = statusText === 'Online';

          return (
            <div key={entry.uid} className="leaderboard-item" style={{ 
              display: 'flex', padding: '1.25rem 1.5rem', alignItems: 'center', 
              background: isCurrentUser ? 'rgba(187,134,252,0.05)' : rank <= 3 ? 'rgba(255,255,255,0.02)' : 'transparent', 
              borderRadius: '16px', 
              border: isCurrentUser ? '1px solid rgba(187,134,252,0.2)' : '1px solid transparent',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              cursor: 'default',
              marginBottom: '0.25rem'
            }}>
              
              <div style={{ width: '80px', display: 'flex', alignItems: 'center', fontWeight: 800, fontSize: '1.2rem', color: getRankColor(rank) }}>
                {rank <= 3 ? <Medal size={28} style={{ marginRight: '8px' }} /> : `#${rank}`}
              </div>
              
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: getAvatarGradient(entry.displayName), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800, color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', flexShrink: 0 }}>
                  {entry.displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.05rem', color: isCurrentUser ? 'var(--accent-color)' : '#fff' }}>{entry.displayName}</span>
                    {isCurrentUser && <span style={{ fontSize: '0.65rem', color: '#fff', background: 'var(--accent-color)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 800, textTransform: 'uppercase' }}>You</span>}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>{entry.major || 'Student'}</p>
                </div>
              </div>
              
              <div style={{ width: '140px', textAlign: 'right', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', color: 'var(--accent-color)', fontSize: '1.1rem' }}>
                {formatStudyTime(entry.studyTime)} <Star size={16} fill="currentColor" />
              </div>
              
              <div style={{ width: '100px', textAlign: 'right', fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {entry.sessions}
              </div>

              <div style={{ width: '120px', textAlign: 'right', fontSize: '0.8rem', color: isOnline ? 'var(--success-color)' : 'var(--text-secondary)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                {isOnline && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success-color)', animation: 'pulse 2s infinite' }} />}
                {statusText}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
        .leaderboard-item:hover {
            background: rgba(255,255,255,0.05) !important;
            transform: scale(1.01) translateX(5px);
            border-color: rgba(255,255,255,0.1) !important;
        }
      `}</style>
    </div>
  );
};
