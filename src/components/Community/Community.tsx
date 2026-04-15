import { useState, useEffect } from 'react';
import { Search, MapPin, UserPlus, Users, MessageCircle, Clock, Loader2, UserCheck, UserMinus } from 'lucide-react';
import { db } from '../../utils/db';
import type { UserProfile } from '../../utils/db';
import { useAuth } from '../../contexts/AuthContext';

export const Community = () => {
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const data = await db.getUsers();
      // Don't show current user in community list
      setUsers(data.filter(u => u.uid !== currentUser?.uid));
    } catch (err) {
      console.error("Failed to load community:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // Refresh every 60s
    const interval = setInterval(fetchUsers, 60000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const filteredUsers = users.filter(u => 
    u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.major.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Community</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Connect with real people studying around the globe.</p>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Find study buddies by major or country..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ padding: '0.9rem 1rem 0.9rem 3rem', borderRadius: '16px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', width: '320px', outline: 'none', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }} 
            onFocus={e => { e.currentTarget.style.width='420px'; e.currentTarget.style.borderColor='var(--accent-color)'; }} 
            onBlur={e => { e.currentTarget.style.width='320px'; e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; }} 
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem', overflowY: 'auto', paddingBottom: '2.5rem', flex: 1, alignContent: 'flex-start' }}>
        {loading ? (
          <div style={{ gridColumn: '1 / -1', padding: '5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 size={40} color="var(--accent-color)" style={{ animation: 'spin 1.5s linear infinite' }} />
          </div>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map((u) => (
            <UserCard key={u.uid} userProfile={u} />
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', padding: '5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <Users size={64} style={{ opacity: 0.3, marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-primary)' }}>No students found</h3>
            <p style={{ marginTop: '0.5rem', fontSize: '1rem', textAlign: 'center' }}>We couldn't find anyone matching "{searchQuery}" in the community.</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const UserCard = ({ userProfile }: { userProfile: UserProfile }) => {
  const { user: currentUser, syncProfile } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const isOnline = Date.now() - userProfile.lastActive < 1000 * 60 * 10;
  const isFriend = currentUser?.friends?.includes(userProfile.uid);

  const handleFriendAction = async () => {
    if (!currentUser) return;
    setIsProcessing(true);
    try {
      if (isFriend) {
        await db.removeFriend(currentUser.uid, userProfile.uid);
        const updatedFriends = currentUser.friends.filter(id => id !== userProfile.uid);
        syncProfile({ friends: updatedFriends });
      } else {
        await db.addFriend(currentUser.uid, userProfile.uid);
        const updatedFriends = [...(currentUser.friends || []), userProfile.uid];
        syncProfile({ friends: updatedFriends });
      }
    } catch (err) {
      console.error("Friend action failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', overflow: 'hidden', borderRadius: '24px', transition: 'transform 0.3s' }} onMouseOver={e => e.currentTarget.style.transform='translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform='translateY(0)'}>
      <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isOnline ? 'var(--success-color)' : 'rgba(255,255,255,0.2)', boxShadow: isOnline ? '0 0 10px var(--success-color)' : 'none' }} />
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isOnline ? 'var(--success-color)' : 'var(--text-secondary)', textTransform: 'uppercase' }}>
          {isOnline ? 'Active' : 'Offline'}
        </span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {userProfile.photoURL ? (
          <img src={userProfile.photoURL} alt={userProfile.displayName} style={{ width: '70px', height: '70px', borderRadius: '20px', objectFit: 'cover', border: '2px solid rgba(187,134,252,0.3)' }} />
        ) : (
          <div style={{ width: '70px', height: '70px', borderRadius: '20px', background: 'linear-gradient(135deg, var(--accent-color), #03DAC6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 800, color: '#fff', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}>
            {userProfile.displayName.charAt(0)}
          </div>
        )}
        
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{userProfile.displayName}</h3>
          <p style={{ color: 'var(--accent-color)', fontSize: '0.9rem', marginTop: '0.2rem', fontWeight: 600 }}>{userProfile.major}</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <MapPin size={16} color="var(--accent-color)" />
            <span style={{ fontWeight: 500 }}>{userProfile.country}</span>
         </div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                <Clock size={14} color="var(--text-secondary)" />
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>{Math.floor((userProfile.studyTime || 0) / 60)}h</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                <MessageCircle size={14} color="var(--text-secondary)" />
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>{userProfile.sessions || 0}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Sessions</span>
            </div>
         </div>
      </div>

      <button 
        onClick={handleFriendAction}
        disabled={isProcessing || !currentUser}
        style={{ width: '100%', background: isFriend ? 'rgba(239, 68, 68, 0.1)' : 'rgba(187, 134, 252, 0.1)', border: `1px solid ${isFriend ? 'rgba(239, 68, 68, 0.3)' : 'rgba(187, 134, 252, 0.3)'}`, color: isFriend ? 'var(--danger-color)' : 'var(--accent-color)', padding: '0.85rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', transition: 'all 0.2s', fontWeight: 600 }} 
        onMouseOver={e => { if(!isFriend) { e.currentTarget.style.background = 'var(--accent-color)'; e.currentTarget.style.color = '#fff'; } }} 
        onMouseOut={e => { e.currentTarget.style.background = isFriend ? 'rgba(239, 68, 68, 0.1)' : 'rgba(187, 134, 252, 0.1)'; e.currentTarget.style.color = isFriend ? 'var(--danger-color)' : 'var(--accent-color)'; }}
      >
        {isProcessing ? (
          <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
        ) : isFriend ? (
          <><UserMinus size={18} /> Remove Buddy</>
        ) : (
          <><UserPlus size={18} /> Add Study Buddy</>
        )}
      </button>
    </div>
  );
};

