import { useState, useEffect } from 'react';
import { Quote, Edit3, Shuffle, EyeOff, Eye } from 'lucide-react';

const PREDEFINED_QUOTES = [
  "The secret to getting ahead is getting started.",
  "It always seems impossible until it is done.",
  "Focus on being productive instead of busy.",
  "Don't stop until you're proud.",
  "Your future is created by what you do today.",
  "Small daily improvements are the key to staggering long-term results.",
  "Starve your distractions, feed your focus."
];

export const Quotes = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Custom or predefined
  const [quoteType, setQuoteType] = useState<'predefined' | 'custom'>('predefined');
  
  // Content states
  const [currentPredefined, setCurrentPredefined] = useState(PREDEFINED_QUOTES[0]);
  const [customQuote, setCustomQuote] = useState("");

  useEffect(() => {
    const savedCustom = localStorage.getItem('studyfm_custom_quote');
    if (savedCustom) {
      setCustomQuote(savedCustom);
      setQuoteType('custom');
    }
  }, []);

  const handleSaveCustom = () => {
    localStorage.setItem('studyfm_custom_quote', customQuote);
    setIsEditing(false);
    setQuoteType('custom');
  };

  const nextRandomQuote = () => {
    setQuoteType('predefined');
    const currentIndex = PREDEFINED_QUOTES.indexOf(currentPredefined);
    let nextIndex = Math.floor(Math.random() * PREDEFINED_QUOTES.length);
    while (nextIndex === currentIndex) {
      nextIndex = Math.floor(Math.random() * PREDEFINED_QUOTES.length);
    }
    setCurrentPredefined(PREDEFINED_QUOTES[nextIndex]);
  };

  if (!isVisible) {
    return (
      <button 
        onClick={() => setIsVisible(true)}
        style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s' }}
        onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'}
        onMouseOut={e=>e.currentTarget.style.background='rgba(255,255,255,0.05)'}
      >
        <Eye size={16} /> Show Quotes
      </button>
    );
  }

  return (
    <div style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '1.5rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h3 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
          <Quote size={14} /> Inspiration
        </h3>
        <button onClick={() => setIsVisible(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <EyeOff size={16} />
        </button>
      </div>

      {isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <textarea 
            value={customQuote}
            onChange={e => setCustomQuote(e.target.value)}
            placeholder="Write your personal mantra here..."
            style={{ width: '100%', height: '80px', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '12px', resize: 'none', outline: 'none', fontFamily: 'inherit', fontSize: '1rem' }}
            autoFocus
          />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleSaveCustom} className="primary-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', flex: 1, borderRadius: '8px' }}>Save Quote</button>
            <button onClick={() => setIsEditing(false)} className="secondary-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', borderRadius: '8px' }}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <p style={{ fontSize: '1.25rem', lineHeight: 1.5, fontWeight: 500, color: 'var(--text-primary)', fontStyle: 'italic', position: 'relative' }}>
            "{quoteType === 'custom' && customQuote ? customQuote : currentPredefined}"
          </p>
          
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button onClick={nextRandomQuote} style={styles.actionBtn}>
              <Shuffle size={14} /> Random
            </button>
            <button onClick={() => setIsEditing(true)} style={styles.actionBtn}>
              <Edit3 size={14} /> Custom
            </button>
          </div>
        </>
      )}

    </div>
  );
};

const styles = {
  actionBtn: {
    display: 'flex', 
    alignItems: 'center', 
    gap: '0.4rem', 
    padding: '0.4rem 0.8rem', 
    background: 'rgba(255,255,255,0.08)', 
    border: 'none', 
    borderRadius: '8px', 
    color: 'var(--text-secondary)', 
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'background 0.2s',
  }
};
