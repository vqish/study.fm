import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, Paintbrush } from 'lucide-react';

export const Settings = () => {
  const { user, logout, updateProfile } = useAuth();
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.displayName || '');

  const handleSaveProfile = () => {
    if (editName.trim()) {
      updateProfile(editName);
    }
    setIsEditing(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Profile & Settings</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your account preferences and application layout.</p>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flex: 1, overflowY: 'auto', flexWrap: 'wrap' }}>
        
        {/* Profile Card */}
        <div className="glass-panel" style={{ flex: 1, minWidth: '300px', padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', borderRadius: '16px' }}>
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--accent-color), var(--success-color))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 700, color: '#fff', boxShadow: '0 8px 32px rgba(187, 134, 252, 0.3)' }}>
            {user?.displayName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div style={{ textAlign: 'center', width: '100%' }}>
            {isEditing ? (
              <input 
                type="text" 
                value={editName}
                onChange={e => setEditName(e.target.value)}
                style={{ fontSize: '1.4rem', fontWeight: 600, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '8px', padding: '0.5rem', textAlign: 'center', width: '100%', marginBottom: '0.5rem' }}
                autoFocus
              />
            ) : (
              <h3 style={{ fontSize: '1.6rem', fontWeight: 600 }}>{user?.displayName || 'Student'}</h3>
            )}
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem', fontSize: '1.05rem' }}>{user?.email || 'student@study.fm'}</p>
          </div>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
            {isEditing ? (
              <button className="primary-btn" onClick={handleSaveProfile} style={{ width: '100%', padding: '0.85rem', borderRadius: '12px' }}>Save Changes</button>
            ) : (
              <button className="secondary-btn" onClick={() => setIsEditing(true)} style={{ width: '100%', padding: '0.85rem', borderRadius: '12px' }}>Edit Profile</button>
            )}
            <button className="primary-btn" onClick={logout} style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>Sign Out</button>
          </div>
        </div>

        {/* Settings Toggles */}
        <div className="glass-panel" style={{ flex: 2, minWidth: '400px', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem', borderRadius: '16px' }}>
          
          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', marginBottom: '1.25rem', color: 'var(--accent-color)', fontWeight: 600 }}><Paintbrush size={22} /> Appearance</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <p style={{ fontWeight: 500, fontSize: '1.05rem' }}>Global Base Theme</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Choose structural visual brightness</p>
              </div>
              <select value={theme} onChange={e=>setTheme(e.target.value)} style={{ padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '10px', outline: 'none', cursor: 'pointer', fontSize: '0.95rem' }}>
                <option value="dark">Dark UI</option>
                <option value="light">Light UI (Beta)</option>
              </select>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.75rem', paddingLeft: '0.5rem', fontStyle: 'italic' }}>* Use the main navigation header to switch your actual aesthetic live background.</p>
          </div>

          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', marginBottom: '1.25rem', color: 'var(--accent-color)', fontWeight: 600 }}><Bell size={22} /> Notifications</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
               <div>
                <p style={{ fontWeight: 500, fontSize: '1.05rem' }}>Push Notifications</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Timer alerts and chat mention sounds</p>
              </div>
              <button onClick={() => setNotifications(!notifications)} style={{ width: '56px', height: '30px', borderRadius: '15px', background: notifications ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)', position: 'relative', border: 'none', cursor: 'pointer', transition: 'background 0.3s' }}>
                <div style={{ width: '24px', height: '24px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: notifications ? '29px' : '3px', transition: 'left 0.3s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }} />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
