import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, Paintbrush, LogIn, MapPin, GraduationCap, Save, X as CloseIcon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export const Settings = () => {
  const { user, logout, syncProfile, setShowAuthModal } = useAuth();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  const [profile, setProfile] = useState({
    displayName: user?.displayName || '',
    country: user?.country || '',
    major: user?.major || ''
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        displayName: user.displayName || '',
        country: user.country || '',
        major: user.major || ''
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await syncProfile({
        uid: user.uid,
        displayName: profile.displayName,
        country: profile.country,
        major: profile.major
      });
      setIsEditing(false);
    } catch (err) {
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', gap: '1.5rem', overflow: 'hidden' }}>
      <div style={{ flexShrink: 0 }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Profile & Settings</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your account preferences and study bio.</p>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flex: 1, overflowY: 'auto', flexWrap: 'wrap', alignContent: 'flex-start', paddingBottom: '1rem' }}>
        
        {/* Profile Card */}
        <div className="glass-panel" style={{ flex: 1, minWidth: '320px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderRadius: '24px', position: 'relative' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--accent-color), #03DAC6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, color: '#fff', boxShadow: '0 8px 32px rgba(187, 134, 252, 0.3)' }}>
              {profile.displayName.charAt(0).toUpperCase() || '?'}
            </div>
            
            {isEditing ? (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={styles.inputGroup}>
                   <label style={styles.label}>Full Name</label>
                   <input type="text" value={profile.displayName} onChange={e => setProfile({...profile, displayName: e.target.value})} style={styles.input} />
                </div>
                <div style={styles.inputGroup}>
                   <label style={styles.label}>Country</label>
                   <input type="text" value={profile.country} onChange={e => setProfile({...profile, country: e.target.value})} style={styles.input} />
                </div>
                <div style={styles.inputGroup}>
                   <label style={styles.label}>Major / Topic</label>
                   <input type="text" value={profile.major} onChange={e => setProfile({...profile, major: e.target.value})} style={styles.input} />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button className="primary-btn" onClick={handleSaveProfile} disabled={isSaving} style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    {isSaving ? 'Saving...' : <><Save size={18} /> Save</>}
                  </button>
                  <button className="secondary-btn" onClick={() => setIsEditing(false)} style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <CloseIcon size={18} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{user ? profile.displayName : 'Guest Student'}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>{user?.email || 'Sign in to access cloud features'}</p>
                
                {user && (
                   <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        <MapPin size={16} color="var(--accent-color)" /> {profile.country || 'Not set'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        <GraduationCap size={16} color="var(--accent-color)" /> {profile.major || 'Not set'}
                      </div>
                   </div>
                )}
              </div>
            )}
          </div>

          <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {!user ? (
               <button className="primary-btn" onClick={() => setShowAuthModal(true)} style={{ width: '100%', padding: '1rem', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
                 <LogIn size={20} /> Sign In to Study FM
               </button>
            ) : !isEditing && (
              <>
                <button className="secondary-btn" onClick={() => setIsEditing(true)} style={{ width: '100%', padding: '0.85rem', borderRadius: '12px' }}>Update Profile Details</button>
                <button className="primary-btn" onClick={logout} style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>Sign Out</button>
              </>
            )}
          </div>
        </div>

        {/* Settings Toggles */}
        <div className="glass-panel" style={{ flex: 1, minWidth: '350px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--accent-color)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}><Paintbrush size={20} /> Appearance</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: '1rem' }}>Global Theme</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Switch between dark and light interface modes.</p>
              </div>
              <select value={theme} onChange={e=>setTheme(e.target.value as any)} style={styles.select}>
                <option value="default">Focused Dark</option>
                <option value="light">Solarized Light</option>
                <option value="calm">Calm Breeze</option>
                <option value="rain">Rainy Night</option>
                <option value="night">Deep Night</option>
                <option value="library">Grand Library</option>
              </select>
            </div>
          </div>

          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--accent-color)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}><Bell size={20} /> Alerts</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
               <div>
                <p style={{ fontWeight: 700, fontSize: '1rem' }}>Study Notifications</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Timer alerts and chat mention sounds.</p>
              </div>
              <button onClick={() => setNotifications(!notifications)} style={{ ...styles.toggle, background: notifications ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)' }}>
                <div style={{ ...styles.toggleCircle, left: notifications ? '29px' : '3px' }} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const styles = {
  inputGroup: { display: 'flex', flexDirection: 'column' as const, gap: '0.4rem' },
  label: { fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '1px' },
  input: { background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px', padding: '0.85rem 1rem', outline: 'none', transition: 'border-color 0.2s' },
  select: { padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '10px', outline: 'none', cursor: 'pointer' },
  toggle: { width: '56px', height: '30px', borderRadius: '15px', position: 'relative' as const, border: 'none', cursor: 'pointer', transition: 'background 0.3s' },
  toggleCircle: { width: '24px', height: '24px', background: '#fff', borderRadius: '50%', position: 'absolute' as const, top: '3px', transition: 'left 0.3s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }
};
