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

  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem('studyfm_quote_pos');
    return saved ? JSON.parse(saved) : { x: 40, y: 150 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const onMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newPos = {
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        };
        setPosition(newPos);
      }
    };
    const onMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        localStorage.setItem('studyfm_quote_pos', JSON.stringify(position));
      }
    };
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, dragOffset, position]);

  if (!isVisible) {
    return (
      <button 
        onClick={() => setIsVisible(true)}
        style={{ position: 'absolute', left: '2rem', bottom: '2rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', zIndex: 100 }}
      >
        <Eye size={16} /> Show Quotes
      </button>
    );
  }

  return (
    <div 
      onMouseDown={onMouseDown}
      style={{ 
        position: 'fixed', 
        left: position.x, 
        top: position.y, 
        zIndex: 100, 
        width: '320px', 
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        background: 'rgba(0,0,0,0.4)', 
        backdropFilter: 'blur(24px)', 
        border: '1px solid rgba(255,255,255,0.1)', 
        borderRadius: '24px', 
        padding: '1.5rem', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1rem',
        boxShadow: isDragging ? '0 20px 50px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.3)',
        transition: isDragging ? 'none' : 'box-shadow 0.2s, transform 0.2s',
        transform: isDragging ? 'scale(1.02)' : 'scale(1)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
        <h3 style={{ fontSize: '0.8rem', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '0.4rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800 }}>
          <Quote size={12} /> Inspiration
        </h3>
        <button onMouseDown={e => e.stopPropagation()} onClick={() => setIsVisible(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <EyeOff size={16} />
        </button>
      </div>

      {isEditing ? (
        <div onMouseDown={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
            <button onMouseDown={e=>e.stopPropagation()} onClick={nextRandomQuote} style={{ ...styles.actionBtn, padding: '0.35rem 0.75rem' }}>
              <Shuffle size={12} /> Shuffle
            </button>
            <button onMouseDown={e=>e.stopPropagation()} onClick={() => setIsEditing(true)} style={{ ...styles.actionBtn, padding: '0.35rem 0.75rem' }}>
              <Edit3 size={12} /> Custom
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
