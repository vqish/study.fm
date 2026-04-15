import { useState, useEffect } from 'react';
import { Quote, Edit3, Shuffle, EyeOff, Eye } from 'lucide-react';
import { DraggableWidget } from '../Shared/DraggableWidget';

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
        style={{ position: 'absolute', bottom: '2rem', right: '2rem', padding: '0.8rem 1.2rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '30px', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', zIndex: 100, transition: 'all 0.3s', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', fontWeight: 600, fontSize: '0.9rem' }}
        className="hover-grow"
      >
        <span style={{ fontSize: '1.2rem', lineHeight: '1rem', fontWeight: 300 }}>+</span> Quotes
      </button>
    );
  }

  return (
    <DraggableWidget id="quotes-widget" initialPos={{ x: 40, y: 150 }}>
      <div 
        style={{ 
          width: '320px', 
          background: 'rgba(0,0,0,0.4)', 
          backdropFilter: 'blur(24px)', 
          border: '1px solid rgba(255,255,255,0.1)', 
          borderRadius: '24px', 
          padding: '1.5rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        }}
      >
        <div className="drag-handle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem', cursor: 'grab' }}>
          <h3 style={{ fontSize: '0.8rem', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '0.4rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800 }}>
            <Quote size={12} /> Inspiration
          </h3>
          <button onClick={(e) => { e.stopPropagation(); setIsVisible(false); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <EyeOff size={16} />
          </button>
        </div>

        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <textarea 
              value={customQuote}
              onChange={e => setCustomQuote(e.target.value)}
              placeholder="Write your personal mantra here..."
              style={{ width: '100%', height: '80px', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px', resize: 'none', outline: 'none', fontSize: '0.95rem' }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleSaveCustom} className="primary-btn" style={{ padding: '0.6rem', fontSize: '0.85rem', flex: 1, borderRadius: '8px' }}>Save</button>
              <button onClick={() => setIsEditing(false)} className="secondary-btn" style={{ padding: '0.6rem', fontSize: '0.85rem', borderRadius: '8px' }}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '1.1rem', lineHeight: 1.6, fontWeight: 500, color: 'var(--text-primary)', fontStyle: 'italic' }}>
              "{quoteType === 'custom' && customQuote ? customQuote : currentPredefined}"
            </p>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={nextRandomQuote} style={{ ...styles.actionBtn, padding: '0.35rem 0.75rem' }}>
                <Shuffle size={12} /> Shuffle
              </button>
              <button onClick={() => setIsEditing(true)} style={{ ...styles.actionBtn, padding: '0.35rem 0.75rem' }}>
                <Edit3 size={12} /> Custom
              </button>
            </div>
          </>
        )}
      </div>
    </DraggableWidget>
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
