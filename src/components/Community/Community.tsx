import { useState } from 'react';
import { Search, MapPin, UserCheck, Users } from 'lucide-react';

export const Community = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const allUsers = [
    { name: 'Alex_Codes', role: 'Computer Science', location: 'New York', online: true },
    { name: 'Sarah_Med', role: 'Medical Student', location: 'London', online: true },
    { name: 'David.J', role: 'Engineering', location: 'Toronto', online: false },
    { name: 'Elena_Arts', role: 'Design', location: 'Berlin', online: true },
    { name: 'Marcus', role: 'High School', location: 'Sydney', online: false },
    { name: 'Jenny_Studiesss', role: 'Nursing', location: 'Chicago', online: true },
    { name: 'Rob_Data', role: 'Data Science', location: 'San Francisco', online: false },
    { name: 'Kimberly', role: 'Psychology', location: 'Seoul', online: false },
  ];

  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Community</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Connect with focused students around the globe.</p>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Find study buddies..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ padding: '0.8rem 1rem 0.8rem 2.8rem', borderRadius: '24px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', width: '300px', outline: 'none', transition: 'width 0.3s' }} 
            onFocus={e => e.currentTarget.style.width='350px'} 
            onBlur={e => e.currentTarget.style.width='300px'} 
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', overflowY: 'auto', paddingBottom: '2rem', flex: 1, alignContent: 'flex-start' }}>
        {filteredUsers.length > 0 ? filteredUsers.map((u, i) => (
          <div key={i} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', width: '14px', height: '14px', borderRadius: '50%', background: u.online ? 'var(--success-color)' : 'var(--text-secondary)', boxShadow: u.online ? '0 0 10px var(--success-color)' : 'none' }} title={u.online ? 'Online' : 'Offline'} />
            
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: `linear-gradient(135deg, hsl(${Math.random()*360}, 70%, 60%), hsl(${Math.random()*360}, 70%, 40%))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 600, color: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
              {u.name.charAt(0)}
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{u.name}</h3>
              <p style={{ color: 'var(--accent-color)', fontSize: '0.95rem', marginTop: '0.35rem', fontWeight: 500 }}>{u.role}</p>
            </div>

            <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.08)', margin: '0.5rem 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}><MapPin size={16} /> {u.location}</span>
              <button style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.4rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s', fontWeight: 500 }} onMouseOver={e=>e.currentTarget.style.background='var(--accent-color)'} onMouseOut={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'}>
                <UserCheck size={16} /> Add
              </button>
            </div>
          </div>
        )) : (
          <div style={{ gridColumn: '1 / -1', padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <Users size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 500 }}>User does not exist</h3>
            <p style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>We couldn't find anyone matching "{searchQuery}" in the community.</p>
          </div>
        )}
      </div>
    </div>
  );
};
