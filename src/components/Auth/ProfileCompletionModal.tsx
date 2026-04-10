import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Globe, GraduationCap, Loader2, Save } from 'lucide-react';

export const ProfileCompletionModal = () => {
  const { user, syncProfile } = useAuth();
  const [country, setCountry] = useState(user?.country === 'Earth' ? '' : user?.country || '');
  const [major, setMajor] = useState(user?.major === 'General Studies' ? '' : user?.major || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!country || !major) return;
    setIsSaving(true);
    try {
      await syncProfile({ country, major });
    } catch (err) {
      alert("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div className="glass-panel" style={styles.modal}>
        <div style={styles.header}>
          <div style={styles.iconCircle}>
            <Globe size={32} color="var(--accent-color)" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '1rem', letterSpacing: '-0.5px' }}>One last thing!</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.5 }}>
            To connect you with the right study buddies, please tell us where you're from and what you're studying.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputWrapper}>
             <Globe size={18} style={styles.inputIcon} />
             <input
               type="text"
               placeholder="Country (e.g. Canada, Germany)"
               value={country}
               onChange={e => setCountry(e.target.value)}
               style={styles.input}
               required
             />
          </div>

          <div style={styles.inputWrapper}>
             <GraduationCap size={18} style={styles.inputIcon} />
             <input
               type="text"
               placeholder="Major / Field of Study"
               value={major}
               onChange={e => setMajor(e.target.value)}
               style={styles.input}
               required
             />
          </div>

          <button type="submit" disabled={isSaving} className="primary-btn" style={styles.submitBtn}>
            {isSaving ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <><Save size={20} /> Complete My Profile</>}
          </button>
        </form>
      </div>
      <style>{`
        @keyframes modalEnter { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(20px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3000,
    padding: '1.5rem',
  },
  modal: {
    width: '100%',
    maxWidth: '420px',
    padding: '2.5rem',
    borderRadius: '32px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    textAlign: 'center' as const,
    boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
    border: '1px solid rgba(187,134,252,0.2)',
    animation: 'modalEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    background: 'rgba(15, 15, 20, 0.9)',
  },
  header: { marginBottom: '2rem' },
  iconCircle: {
     width: '70px',
     height: '70px',
     borderRadius: '24px',
     background: 'rgba(187,134,252,0.1)',
     display: 'flex',
     alignItems: 'center',
     justifyContent: 'center',
     margin: '0 auto',
     border: '1px solid rgba(187,134,252,0.2)',
  },
  form: { width: '100%', display: 'flex', flexDirection: 'column' as const, gap: '1rem' },
  inputWrapper: { position: 'relative' as const, display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute' as const, left: '1rem', color: 'var(--text-secondary)', opacity: 0.7 },
  input: {
    width: '100%',
    padding: '1rem 1rem 1rem 3rem',
    borderRadius: '14px',
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    fontSize: '1rem',
    outline: 'none',
  },
  submitBtn: {
    padding: '1rem',
    borderRadius: '14px',
    fontSize: '1rem',
    fontWeight: 700,
    marginTop: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
  }
};
