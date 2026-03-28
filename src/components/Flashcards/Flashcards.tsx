import { useState } from 'react';
import { Plus, Edit2, Trash2, ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';

type Flashcard = {
  id: string;
  front: string;
  back: string;
};

export const Flashcards = () => {
  const [cards, setCards] = useState<Flashcard[]>([
    { id: '1', front: 'What is the powerhouse of the cell?', back: 'Mitochondria' },
    { id: '2', front: 'What is the sum of angles in a triangle?', back: '180 degrees' }
  ]);
  const [viewMode, setViewMode] = useState<'list' | 'review'>('list');
  
  // Review State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [frontText, setFrontText] = useState('');
  const [backText, setBackText] = useState('');

  const handleSave = () => {
    if (!frontText || !backText) return;
    if (editingId) {
      setCards(cards.map(c => c.id === editingId ? { ...c, front: frontText, back: backText } : c));
    } else {
      setCards([...cards, { id: Date.now().toString(), front: frontText, back: backText }]);
    }
    setEditingId(null);
    setFrontText('');
    setBackText('');
  };

  const startEdit = (card: Flashcard) => {
    setEditingId(card.id);
    setFrontText(card.front);
    setBackText(card.back);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFrontText('');
    setBackText('');
  };

  const deleteCard = (id: string) => {
    setCards(cards.filter(c => c.id !== id));
  };

  const startReview = () => {
    if (cards.length === 0) return;
    setCurrentIndex(0);
    setIsFlipped(false);
    setViewMode('review');
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex(prev => (prev + 1) % cards.length), 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex(prev => (prev - 1 + cards.length) % cards.length), 150);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', gap: '1.5rem', position: 'relative' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Flashcards</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Master concepts through active recall.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {viewMode === 'review' ? (
            <button className="secondary-btn" onClick={() => setViewMode('list')} style={{ padding: '0.6rem 1.25rem', borderRadius: '10px' }}>Back to List</button>
          ) : (
            <button className="primary-btn" onClick={startReview} disabled={cards.length === 0} style={{ padding: '0.6rem 1.25rem', opacity: cards.length === 0 ? 0.5 : 1, display: 'flex', alignItems: 'center', borderRadius: '10px' }}>
              <PlayIcon /> Start Review ({cards.length})
            </button>
          )}
        </div>
      </div>

      {viewMode === 'list' ? (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', gap: '1.5rem', paddingRight: '0.5rem' }}>
          
          {/* Create/Edit Form */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 500 }}>{editingId ? 'Edit Flashcard' : 'Create New Flashcard'}</h3>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Front (Concept / Question)</label>
                <textarea 
                  value={frontText} onChange={e => setFrontText(e.target.value)} 
                  style={{ ...styles.input, height: '80px' }} placeholder="E.g. What is the powerhouse of the cell?"
                />
              </div>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Back (Definition / Answer)</label>
                <textarea 
                  value={backText} onChange={e => setBackText(e.target.value)} 
                  style={{ ...styles.input, height: '80px' }} placeholder="E.g. Mitochondria"
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignSelf: 'flex-end', marginTop: '0.5rem' }}>
              {editingId && <button className="secondary-btn" onClick={cancelEdit} style={{ padding: '0.6rem 1.25rem', borderRadius: '8px' }}>Cancel</button>}
              <button className="primary-btn" onClick={handleSave} disabled={!frontText || !backText} style={{ padding: '0.6rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: (!frontText || !backText) ? 0.5 : 1, borderRadius: '8px' }}>
                {editingId ? <Edit2 size={16} /> : <Plus size={16} />}
                {editingId ? 'Save Edits' : 'Add Card'}
              </button>
            </div>
          </div>

          {/* List */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {cards.map(card => (
              <FlashcardListItem key={card.id} card={card} onEdit={() => startEdit(card)} onDelete={() => deleteCard(card.id)} />
            ))}
            {cards.length === 0 && <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', gridColumn: '1 / -1', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '16px' }}>No flashcards yet. Create some to start reviewing!</div>}
          </div>

        </div>
      ) : (
        // Review Mode with 3D Flip Animation
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, animation: 'fadeIn 0.3s' }}>
          <div style={{ marginBottom: '2.5rem', fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1.5rem', borderRadius: '20px' }}>
            Card {currentIndex + 1} of {cards.length}
          </div>
          
          <div style={{ perspective: '1200px', width: '100%', maxWidth: '650px', height: '420px' }}>
            <div style={{ 
              width: '100%', height: '100%', position: 'relative', 
              transition: 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)', 
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateX(180deg)' : 'rotateX(0deg)'
            }}>
              
              {/* Card Front */}
              <div className="glass-panel" style={{ 
                ...styles.cardFace,
                backfaceVisibility: 'hidden',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '4rem', cursor: 'pointer', textAlign: 'center', background: 'var(--surface-color)'
              }} onClick={() => setIsFlipped(true)}>
                <p style={{ fontSize: '1.1rem', color: 'var(--accent-color)', marginBottom: '1.5rem', fontWeight: 600, letterSpacing: '2px' }}>FRONT</p>
                <h3 style={{ fontSize: '2.5rem', fontWeight: 500, lineHeight: 1.4 }}>{cards[currentIndex]?.front}</h3>
                <p style={{ position: 'absolute', bottom: '2.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><RotateCcw size={14} /> Click to flip over</p>
              </div>

              {/* Card Back */}
              <div className="glass-panel" style={{ 
                ...styles.cardFace,
                backfaceVisibility: 'hidden',
                transform: 'rotateX(180deg)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '4rem', cursor: 'pointer', textAlign: 'center',
                background: 'rgba(187, 134, 252, 0.1)',
                border: '1px solid rgba(187, 134, 252, 0.25)'
              }} onClick={() => setIsFlipped(false)}>
                <p style={{ fontSize: '1.1rem', color: 'var(--accent-color)', marginBottom: '1.5rem', fontWeight: 600, letterSpacing: '2px' }}>BACK</p>
                <h3 style={{ fontSize: '2.5rem', fontWeight: 500, lineHeight: 1.4 }}>{cards[currentIndex]?.back}</h3>
              </div>

            </div>
          </div>

          <div style={{ display: 'flex', gap: '2.5rem', marginTop: '3.5rem', alignItems: 'center' }}>
            <button className="secondary-btn" onClick={prevCard} style={{ padding: '1.25rem', borderRadius: '50%', display: 'flex', background: 'rgba(255,255,255,0.05)' }}><ArrowLeft size={24} /></button>
            <button onClick={() => setIsFlipped(!isFlipped)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontSize: '1.1rem', padding: '1rem', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color='var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color='var(--text-secondary)'}><RotateCcw size={20} /> Flip Card</button>
            <button className="secondary-btn" onClick={nextCard} style={{ padding: '1.25rem', borderRadius: '50%', display: 'flex', background: 'rgba(255,255,255,0.05)' }}><ArrowRight size={24} /></button>
          </div>

        </div>
      )}
    </div>
  );
};

const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

const styles = {
  input: {
    width: '100%',
    padding: '0.85rem',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '1rem',
    fontFamily: 'inherit',
    resize: 'vertical' as const
  },
  iconBtn: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '0.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    transition: 'background 0.2s'
  },
  cardFace: {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    borderRadius: '24px',
    boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
  }
};

const FlashcardListItem = ({ card, onEdit, onDelete }: { card: Flashcard, onEdit: () => void, onDelete: () => void }) => {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', position: 'relative', cursor: 'pointer', transition: 'background 0.2s, transform 0.2s' }} onClick={() => setRevealed(!revealed)} onMouseOver={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.transform='translateY(-2px)'}} onMouseOut={e=>{e.currentTarget.style.background='var(--surface-color)'; e.currentTarget.style.transform='translateY(0)'}}>
      <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button onClick={(e) => { e.stopPropagation(); onEdit(); }} style={styles.iconBtn}><Edit2 size={14} color="var(--text-secondary)" /></button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} style={styles.iconBtn}><Trash2 size={14} color="var(--danger-color)" /></button>
      </div>
      <div style={{ paddingRight: '4rem' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', letterSpacing: '1px' }}>FRONT <span style={{ textTransform: 'none', background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', marginLeft: '6px' }}>(Click to {revealed ? 'hide' : 'reveal'})</span></p>
        <p style={{ fontWeight: 500, marginBottom: revealed ? '1.25rem' : '0', lineHeight: 1.5, fontSize: '1.05rem' }}>{card.front}</p>
        
        {revealed && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '1rem' }} />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', letterSpacing: '1px' }}>BACK</p>
            <p style={{ color: 'var(--text-primary)', lineHeight: 1.5, fontSize: '1.05rem' }}>{card.back}</p>
          </div>
        )}
      </div>
    </div>
  );
};
