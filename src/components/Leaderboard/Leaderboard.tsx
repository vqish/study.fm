import { Trophy, Medal, Star } from 'lucide-react';

export const Leaderboard = () => {
  const users = [
    { rank: 1, name: 'Alice_Study', hours: 42, lastActive: '2 mins ago' },
    { rank: 2, name: 'CodeNinja', hours: 38, lastActive: 'Online' },
    { rank: 3, name: 'Math_Pro', hours: 35, lastActive: '1 hr ago' },
    { rank: 4, name: 'guest_user2', hours: 21, lastActive: 'Online' },
    { rank: 5, name: 'ScienceGuy', hours: 19, lastActive: '5 mins ago' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Weekly Leaderboard</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Compete with the community. Rank is based on focus hours this week.</p>
        </div>
        <div className="glass-panel" style={{ background: 'rgba(255,193,7,0.1)', color: '#FFC107', padding: '0.75rem 1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600, border: '1px solid rgba(255,193,7,0.3)' }}>
          <Trophy size={20} /> Season ends in 2 days
        </div>
      </div>

      <div className="glass-panel" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderRadius: '16px' }}>
        <div style={{ display: 'flex', padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          <div style={{ width: '80px' }}>Rank</div>
          <div style={{ flex: 1 }}>Student Profile</div>
          <div style={{ width: '140px', textAlign: 'right' }}>Focus Time</div>
          <div style={{ width: '120px', textAlign: 'right' }}>Status</div>
        </div>

        {users.map((u, i) => (
          <div key={i} style={{ 
            display: 'flex', padding: '1.25rem 1.5rem', alignItems: 'center', 
            background: u.rank <= 3 ? 'rgba(255,255,255,0.05)' : 'transparent', 
            borderRadius: '12px', border: u.rank <= 3 ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
            transition: 'background 0.2s, transform 0.2s',
            cursor: 'default'
          }} onMouseOver={e=>{e.currentTarget.style.background='rgba(255,255,255,0.08)'; e.currentTarget.style.transform='translateX(4px)'}} onMouseOut={e=>{e.currentTarget.style.background=u.rank<=3?'rgba(255,255,255,0.05)':'transparent'; e.currentTarget.style.transform='translateX(0)'}}>
            <div style={{ width: '80px', display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: '1.2rem', color: u.rank === 1 ? '#FFD700' : u.rank === 2 ? '#C0C0C0' : u.rank === 3 ? '#CD7F32' : 'var(--text-secondary)' }}>
              {u.rank <= 3 ? <Medal size={28} style={{ marginRight: '8px' }} /> : `#${u.rank}`}
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: `linear-gradient(135deg, hsl(${Math.random() * 360}, 70%, 60%), hsl(${Math.random() * 360}, 70%, 40%))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 600, color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                {u.name.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{u.name}</span>
            </div>
            <div style={{ width: '140px', textAlign: 'right', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', color: 'var(--accent-color)', fontSize: '1.1rem' }}>
              {u.hours} hrs <Star size={18} fill="currentColor" />
            </div>
            <div style={{ width: '120px', textAlign: 'right', fontSize: '0.85rem', color: u.lastActive === 'Online' ? 'var(--success-color)' : 'var(--text-secondary)', fontWeight: u.lastActive === 'Online' ? 600 : 400 }}>
              {u.lastActive}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
