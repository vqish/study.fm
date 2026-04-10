import { useAuth } from '../../contexts/AuthContext';
import { LogIn, User, ChevronDown, Bell, Search, Settings, LogOut } from 'lucide-react';
import React, { useState } from 'react';

export const Navbar = () => {
  const { user, setShowAuthModal, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header style={styles.navbar} className="glass-panel">
      <div style={styles.left}>
        <div style={styles.searchBox}>
          <Search size={18} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Search subjects, topics or buddies..." 
            style={styles.searchInput}
          />
        </div>
      </div>

      <div style={styles.right}>
        <button style={styles.iconBtn} title="Notifications">
          <Bell size={20} color="var(--text-secondary)" />
        </button>

        <div style={styles.divider} />

        {user ? (
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              style={styles.profileBtn}
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} style={styles.avatar} />
              ) : (
                <div style={styles.avatarPlaceholder}>{user.displayName.charAt(0)}</div>
              )}
              <div style={styles.userInfo}>
                <span style={styles.userName}>{user.displayName}</span>
                <span style={styles.userMajor}>{user.major || 'Student'}</span>
              </div>
              <ChevronDown size={16} color="var(--text-secondary)" />
            </button>

            {showProfileMenu && (
              <div style={styles.dropdown} className="glass-panel">
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
  },
  left: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'rgba(0,0,0,0.2)',
    padding: '0.6rem 1.25rem',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '400px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  searchInput: {
    background: 'none',
    border: 'none',
    color: '#fff',
    outline: 'none',
    width: '100%',
    fontSize: '0.9rem',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    padding: '0.5rem',
    borderRadius: '10px',
    transition: 'background 0.2s',
  },
  divider: {
    width: '1px',
    height: '24px',
    background: 'rgba(255,255,255,0.1)',
  },
  authBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1.5rem',
    borderRadius: '12px',
    fontWeight: 700,
    fontSize: '0.9rem',
    boxShadow: '0 8px 24px rgba(187, 134, 252, 0.3)',
  },
  profileBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.4rem 0.6rem',
    borderRadius: '14px',
    transition: 'background 0.2s',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    objectFit: 'cover' as const,
  },
  avatarPlaceholder: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'var(--accent-color)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    marginRight: '0.5rem',
  },
  userName: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#fff',
  },
  userMajor: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    fontWeight: 500,
  },
  dropdown: {
    position: 'absolute' as const,
    top: 'calc(100% + 10px)',
    right: 0,
    width: '200px',
    padding: '0.5rem',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(20, 20, 25, 0.95)',
    animation: 'slideUp 0.2s ease-out',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: '10px',
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
    textAlign: 'left' as const,
    transition: 'background 0.2s',
  },
  dropdownDivider: {
    height: '1px',
    background: 'rgba(255,255,255,0.05)',
    margin: '0.25rem 0',
  }
};
