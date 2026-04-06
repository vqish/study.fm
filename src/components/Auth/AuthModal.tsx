import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Headphones, X, Mail, Loader2 } from 'lucide-react';

export const AuthModal = ({ onClose }: { onClose: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const { login, loginWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError('');
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google login failed.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div className="glass-panel" style={styles.modal} onClick={e => e.stopPropagation()}>
        
        <button onClick={onClose} style={styles.closeBtn} title="Close">
          <X size={20} />
        </button>

        <div style={styles.header}>
          <Headphones size={36} color="var(--accent-color)" />
          <h2 style={{ marginTop: '0.75rem', fontSize: '1.8rem', fontWeight: 700 }}>study.fm</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
            {isLogin ? 'Sign in to join rooms & collaborate' : 'Create your study account'}
          </p>
        </div>

        {/* Google Login */}
        <button 
          onClick={handleGoogleLogin} 
          disabled={isGoogleLoading}
          style={styles.googleBtn}
          onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.95)')}
          onMouseOut={e => (e.currentTarget.style.background = '#fff')}
        >
          {isGoogleLoading ? (
            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          <span style={{ color: '#333', fontWeight: 600, fontSize: '0.95rem' }}>
            Continue with Google
          </span>
        </button>

        <div style={styles.divider}>
          <span style={{ background: 'var(--surface-color)', padding: '0 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>or</span>
        </div>

        {/* Email Login */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputWrapper}>
            <Mail size={18} style={{ color: 'var(--text-secondary)', position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ ...styles.input, paddingLeft: '1rem' }}
            required
            minLength={6}
          />

          {error && (
            <p style={{ color: 'var(--danger-color)', fontSize: '0.85rem', textAlign: 'center' }}>{error}</p>
          )}
          
          <button type="submit" className="primary-btn" disabled={isLoading} style={styles.submitBtn}>
            {isLoading ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : (isLogin ? 'Log In' : 'Create Account')}
          </button>
        </form>

        <p style={styles.toggleText}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span 
            style={{ color: 'var(--accent-color)', cursor: 'pointer', fontWeight: 600 }}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </span>
        </p>

        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes modalSlideIn { from { opacity: 0; transform: scale(0.92) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        `}</style>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modal: {
    position: 'relative' as const,
    padding: '2.5rem',
    width: '100%',
    maxWidth: '420px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.6)',
    animation: 'modalSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
  },
  closeBtn: {
    position: 'absolute' as const,
    top: '1rem',
    right: '1rem',
    background: 'rgba(255,255,255,0.05)',
    border: 'none',
    color: 'var(--text-secondary)',
    borderRadius: '8px',
    padding: '0.5rem',
    cursor: 'pointer',
    display: 'flex',
  },
  header: {
    textAlign: 'center' as const,
    width: '100%',
    marginBottom: '1.5rem',
  },
  googleBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    width: '100%',
    padding: '0.85rem',
    borderRadius: '10px',
    background: '#fff',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  divider: {
    width: '100%',
    textAlign: 'center' as const,
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    lineHeight: '0.1em',
    margin: '1.5rem 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    width: '100%',
    gap: '0.85rem',
  },
  inputWrapper: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: '0.95rem 1rem 0.95rem 2.75rem',
    borderRadius: '10px',
    background: 'rgba(0, 0, 0, 0.25)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    transition: 'border-color 0.2s',
    outline: 'none',
  },
  submitBtn: {
    padding: '0.95rem',
    fontSize: '1rem',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 14px 0 rgba(187, 134, 252, 0.3)',
  },
  toggleText: {
    marginTop: '1.5rem',
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
  }
};
