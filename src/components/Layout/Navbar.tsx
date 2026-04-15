import { useAuth } from '../../contexts/AuthContext';
import { LogIn, User, ChevronDown, Bell, Search, Settings, LogOut, Check, Trash2, X } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

type Notification = {
  id: string;
  type: 'info' | 'achievement' | 'reminder' | 'social';
  title: string;
  body: string;
  time: string;
  read: boolean;
};

// Sample notifications — in a real app these come from Firestore
const SAMPLE_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'achievement', title: '🔥 Study Streak!', body: "You've studied 3 days in a row. Keep it up!", time: '2m ago', read: false },
  { id: 'n2', type: 'reminder', title: '⏰ Session Reminder', body: 'Your scheduled Physics session starts in 10 minutes.', time: '8m ago', read: false },
  { id: 'n3', type: 'info', title: '✨ New Feature', body: 'Video Mode is now available in the Mini Player. Try it out!', time: '1h ago', read: true },
  { id: 'n4', type: 'social', title: '👥 Room Invite', body: 'Alex invited you to join "Chemistry Study Room".', time: '3h ago', read: true },
];

export const Navbar = () => {
  const { user, setShowAuthModal, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(SAMPLE_NOTIFICATIONS);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const dismissAll = () => setNotifications([]);
  const dismissOne = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const notifColor: Record<string, string> = {
    achievement: '#FFB74D',
    reminder: '#03DAC6',
    social: 'var(--accent-color)',
    info: '#64B5F6'
  };

  return (
    <header style={styles.navbar} className="glass-panel">
      <div style={styles.left}>
        <div style={styles.searchBox}>
          <Search size={18} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Search subjects, topics or rooms..." 
            style={styles.searchInput}
          />
        </div>
      </div>

      <div style={styles.right}>
        {/* Notifications Bell */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button 
            style={{ ...styles.iconBtn, position: 'relative' }} 
            onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
            title="Notifications"
          >
            <Bell size={20} color={showNotifications ? 'var(--accent-color)' : 'var(--text-secondary)'} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '2px', right: '2px',
                width: '18px', height: '18px', borderRadius: '50%',
                background: 'var(--accent-color)', color: '#fff',
                fontSize: '0.65rem', fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid var(--surface-color)'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="glass-panel" style={styles.notifPanel}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                  Notifications {unreadCount > 0 && <span style={{ color: 'var(--accent-color)', fontSize: '0.8rem' }}>({unreadCount} new)</span>}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} style={styles.notifAction} title="Mark all read">
                      <Check size={14} /> All read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button onClick={dismissAll} style={{ ...styles.notifAction, color: 'var(--danger-color)' }} title="Clear all">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Notification list */}
              <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '0.5rem' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <Bell size={36} style={{ opacity: 0.2, marginBottom: '0.75rem' }} />
                    <p style={{ fontSize: '0.9rem' }}>All caught up!</p>
                    <p style={{ fontSize: '0.8rem', marginTop: '0.25rem', opacity: 0.6 }}>No new notifications</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                        padding: '0.85rem 0.75rem', borderRadius: '12px',
                        background: n.read ? 'transparent' : 'rgba(187,134,252,0.06)',
                        border: n.read ? '1px solid transparent' : '1px solid rgba(187,134,252,0.12)',
                        marginBottom: '0.35rem', cursor: 'pointer',
                        transition: 'all 0.2s', position: 'relative'
                      }}
                    >
                      {/* Unread dot */}
                      {!n.read && (
                        <div style={{ position: 'absolute', top: '0.75rem', left: '0.5rem', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-color)', flexShrink: 0 }} />
                      )}
                      {/* Type indicator bar */}
                      <div style={{ width: '3px', borderRadius: '4px', background: notifColor[n.type] || 'var(--accent-color)', alignSelf: 'stretch', flexShrink: 0, minHeight: '36px' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: n.read ? 500 : 700, color: '#fff', marginBottom: '0.2rem' }}>{n.title}</p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{n.body}</p>
                        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.3rem' }}>{n.time}</p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); dismissOne(n.id); }}
                        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', padding: '0.2rem', borderRadius: '6px', flexShrink: 0 }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div style={styles.divider} />

        {user ? (
          <div ref={profileRef} style={{ position: 'relative' }}>
            <button 
              onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
              style={styles.profileBtn}
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} style={styles.avatar} />
              ) : (
                <div style={styles.avatarPlaceholder}>{user.displayName.charAt(0).toUpperCase()}</div>
              )}
              <div style={styles.userInfo}>
                <span style={styles.userName}>{user.displayName}</span>
                <span style={styles.userMajor}>{user.major || 'Student'}</span>
              </div>
              <ChevronDown size={16} color="var(--text-secondary)" style={{ transform: showProfileMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {showProfileMenu && (
              <div style={styles.dropdown} className="glass-panel">
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '0.5rem' }}>
                  <p style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff' }}>{user.displayName}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.email}</p>
                </div>
                <button style={styles.dropdownItem}><User size={16} /> My Profile</button>
                <button style={styles.dropdownItem}><Settings size={16} /> Preferences</button>
                <div style={styles.dropdownDivider} />
                <button 
                  onClick={() => { logout(); setShowProfileMenu(false); }}
                  style={{ ...styles.dropdownItem, color: 'var(--danger-color)' }}
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={() => setShowAuthModal(true)}
            style={styles.authBtn}
            className="primary-btn"
          >
            <LogIn size={18} />
            <span>Login / Sign Up</span>
          </button>
        )}
      </div>
    </header>
  );
};

const styles = {
  navbar: {
    height: '70px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2rem',
    margin: '1rem 1rem 0 1rem',
    borderRadius: '20px',
    zIndex: 100,
    background: 'rgba(15, 15, 20, 0.7)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    flexShrink: 0,
  },
  left: { flex: 1, display: 'flex', alignItems: 'center' },
  searchBox: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    background: 'rgba(0,0,0,0.2)', padding: '0.6rem 1.25rem',
    borderRadius: '12px', width: '100%', maxWidth: '400px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  searchInput: { background: 'none', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '0.9rem' },
  right: { display: 'flex', alignItems: 'center', gap: '1.25rem' },
  iconBtn: {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
    cursor: 'pointer', display: 'flex', padding: '0.55rem',
    borderRadius: '12px', transition: 'all 0.2s',
  },
  divider: { width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' },
  authBtn: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.75rem 1.5rem', borderRadius: '12px',
    fontWeight: 700, fontSize: '0.9rem',
    boxShadow: '0 8px 24px rgba(187, 134, 252, 0.3)',
  },
  profileBtn: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
    cursor: 'pointer', padding: '0.4rem 0.75rem 0.4rem 0.4rem',
    borderRadius: '14px', transition: 'background 0.2s',
  },
  avatar: { width: '34px', height: '34px', borderRadius: '10px', objectFit: 'cover' as const },
  avatarPlaceholder: {
    width: '34px', height: '34px', borderRadius: '10px',
    background: 'var(--accent-color)', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem',
  },
  userInfo: { display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-start' },
  userName: { fontSize: '0.88rem', fontWeight: 700, color: '#fff', lineHeight: 1.2 },
  userMajor: { fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 500 },
  dropdown: {
    position: 'absolute' as const, top: 'calc(100% + 10px)', right: 0, width: '210px',
    padding: '0.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column' as const,
    gap: '0.15rem', boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(15,15,22,0.98)',
    animation: 'slideUp 0.2s ease-out', zIndex: 200,
  },
  dropdownItem: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.75rem 1rem', borderRadius: '10px',
    background: 'none', border: 'none', color: '#fff',
    fontSize: '0.88rem', fontWeight: 500, cursor: 'pointer',
    textAlign: 'left' as const, transition: 'background 0.2s',
  },
  dropdownDivider: { height: '1px', background: 'rgba(255,255,255,0.05)', margin: '0.25rem 0' },
  notifPanel: {
    position: 'absolute' as const, top: 'calc(100% + 12px)', right: '-60px',
    width: '360px', borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(14,14,20,0.98)',
    boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
    animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)', zIndex: 200,
    overflow: 'hidden'
  },
  notifAction: {
    display: 'flex', alignItems: 'center', gap: '0.3rem',
    background: 'rgba(255,255,255,0.06)', border: 'none',
    color: 'var(--text-secondary)', padding: '0.35rem 0.65rem',
    borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
  }
};
