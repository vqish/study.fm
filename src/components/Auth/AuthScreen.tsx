import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Headphones } from 'lucide-react';

export const AuthScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    try {
      await login(email);
      navigate('/');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container" style={styles.container}>
      <div className="glass-panel" style={styles.card}>
        <div style={styles.header}>
          <Headphones size={48} color="var(--accent-color)" />
          <h1 style={{ marginTop: '1rem', fontSize: '2.5rem', fontWeight: 700 }}>study.fm</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>
            {isLogin ? 'Welcome back, student.' : 'Join the global study room.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
            minLength={6}
          />
          
          <button type="submit" className="primary-btn" disabled={isLoading} style={styles.submitBtn}>
            {isLoading ? 'Loading...' : (isLogin ? 'Log In' : 'Start Studying')}
          </button>
        </form>

        <p style={styles.toggleText}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span 
            style={{ color: 'var(--accent-color)', cursor: 'pointer', fontWeight: 600, transition: 'color 0.2s' }}
            onClick={() => setIsLogin(!isLogin)}
            onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-color-hover)'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--accent-color)'}
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </span>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    padding: '1rem',
    background: 'radial-gradient(circle at center, rgba(187, 134, 252, 0.15) 0%, transparent 60%)',
  },
  card: {
    padding: '3rem',
    width: '100%',
    maxWidth: '460px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  },
  header: {
    textAlign: 'center' as const,
    width: '100%',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    width: '100%',
    gap: '1.25rem',
  },
  input: {
    padding: '1.25rem',
    borderRadius: '12px',
    background: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: 'var(--text-primary)',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
  },
  submitBtn: {
    marginTop: '0.5rem',
    padding: '1.25rem',
    fontSize: '1.1rem',
    borderRadius: '12px',
    boxShadow: '0 4px 14px 0 rgba(187, 134, 252, 0.39)',
  },
  toggleText: {
    marginTop: '2.5rem',
    color: 'var(--text-secondary)',
    fontSize: '1rem',
  }
};
