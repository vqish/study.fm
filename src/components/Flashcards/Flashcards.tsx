import { useState } from 'react';
import { Plus, Edit2, Trash2, ArrowLeft, ArrowRight, RotateCcw, Play, Check } from 'lucide-react';

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
    setViewMode('list'); 
  };

  const deleteCard = (id: string) => {
    if (confirm('Delete this card?')) {
      setCards(cards.filter(c => c.id !== id));
    }
  };

  const startReview = () => {
    if (cards.length === 0) return;
    setCurrentIndex(0);
    setIsFlipped(false);
    setViewMode('review');
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex(prev => (prev + 1) % cards.length), 200);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex(prev => (prev - 1 + cards.length) % cards.length), 200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
      
      {/* 1. Header Area - Fixed Height */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Flashcards</h2>
          <p style={styles.subtitle}>Card set: {cards.length} items</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {viewMode === 'review' ? (
            <button className="secondary-btn" onClick={() => setViewMode('list')} style={styles.headerBtn}>
              Back to List
            </button>
          ) : (
            <button className="primary-btn" onClick={startReview} disabled={cards.length === 0} style={{ ...styles.headerBtn, opacity: cards.length === 0 ? 0.5 : 1 }}>
              <Play size={16} fill="white" /> Start Review
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Content Area - Expands to fill available height & Scrolls internally */}
      <div className="module-scroll-area" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {viewMode === 'list' ? (
          <div style={styles.listContainer}>
            
            {/* Create/Edit Form */}
            <div className="glass-panel" style={styles.formPanel}>
              <h3 style={styles.formTitle}>{editingId ? 'Modify Concept' : 'Add New Concept'}</h3>
              <div style={styles.formRow}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Concept / Question</label>
                  <textarea value={frontText} onChange={e => setFrontText(e.target.value)} style={styles.textarea} placeholder="e.g. Mitochondria" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Definition / Answer</label>
                  <textarea value={backText} onChange={e => setBackText(e.target.value)} style={styles.textarea} placeholder="e.g. Powerhouse of the cell" />
                </div>
              </div>
              <div style={styles.formActions}>
                {editingId && <button onClick={() => setEditingId(null)} className="secondary-btn" style={styles.formBtn}>Cancel</button>}
                <button onClick={handleSave} className="primary-btn" disabled={!frontText || !backText} style={styles.formBtn}>
                  {editingId ? <Check size={18} /> : <Plus size={18} />} {editingId ? 'Save Edits' : 'Add Card'}
                </button>
              </div>
            </div>

            {/* Grid List */}
            <div style={styles.grid}>
              {cards.map(card => (
                <FlashcardItem key={card.id} card={card} onEdit={() => startEdit(card)} onDelete={() => deleteCard(card.id)} />
              ))}
              {cards.length === 0 && (
                <div style={styles.emptyState}>No cards yet. Start by adding one above.</div>
              )}
            </div>
          </div>
        ) : (
          /* Review Mode - Centered Card System */
          <div style={styles.reviewContainer}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
              
              <div style={styles.progressText}>Card {currentIndex + 1} of {cards.length}</div>
              
              {/* Card Container - Responsive with clamp */}
              <div style={styles.cardContainer}>
                <div 
                  style={{ 
                    ...styles.cardInner,
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                  }}
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  {/* Front */}
                  <div className="glass-panel" style={styles.cardFace}>
                    <div style={styles.faceLabel}>CONCEPT</div>
                    <div style={styles.cardText}>{cards[currentIndex].front}</div>
                    <div style={styles.flipNotice}><RotateCcw size={14} /> Click to reveal answer</div>
                  </div>

                  {/* Back */}
                  <div className="glass-panel" style={{ ...styles.cardFace, ...styles.cardBack }}>
                    <div style={styles.faceLabel}>DEFINITION</div>
                    <div style={styles.cardText}>{cards[currentIndex].back}</div>
                    <div style={styles.flipNotice}><RotateCcw size={14} /> Click to hide answer</div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div style={styles.reviewControls}>
                <button onClick={prevCard} className="secondary-btn" style={styles.navBtn}><ArrowLeft size={24} /></button>
                <div style={{ width: '40px' }} />
                <button onClick={nextCard} className="secondary-btn" style={styles.navBtn}><ArrowRight size={24} /></button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FlashcardItem = ({ card, onEdit, onDelete }: { card: Flashcard, onEdit: () => void, onDelete: () => void }) => {
  const [showBack, setShowBack] = useState(false);
  return (
    <div className="glass-panel" style={styles.item} onClick={() => setShowBack(!showBack)}>
       <div style={styles.itemActions}>
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }} style={styles.miniBtn}><Edit2 size={14} /></button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} style={{ ...styles.miniBtn, color: 'var(--danger-color)' }}><Trash2 size={14} /></button>
       </div>
       <div style={{ flex: 1, minWidth: 0 }}>
          <p style={styles.itemLabel}>FRONT</p>
          <h4 style={styles.itemTitle}>{card.front}</h4>
          {showBack && (
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', animation: 'fadeIn 0.2s' }}>
               <p style={styles.itemLabel}>BACK</p>
               <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{card.back}</p>
            </div>
          )}
       </div>
    </div>
  );
};

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.5rem', flexShrink: 0 },
  title: { fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.5px' },
  subtitle: { color: 'var(--text-secondary)', fontSize: '0.85rem' },
  headerBtn: { padding: '0.65rem 1.25rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' },
  listContainer: { display: 'flex', flexDirection: 'column' as const, gap: '1.5rem', paddingBottom: '2rem' },
  formPanel: { padding: '1.75rem', borderRadius: '24px', display: 'flex', flexDirection: 'column' as const, gap: '1.25rem' },
  formTitle: { fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-color)' },
  formRow: { display: 'flex', gap: '1.5rem', flexWrap: 'wrap' as const },
  label: { display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' as const, letterSpacing: '1px' },
  textarea: { width: '100%', height: '80px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '1rem', fontSize: '0.95rem', outline: 'none', resize: 'none' as const },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' },
  formBtn: { padding: '0.65rem 1.5rem', borderRadius: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' },
  item: { padding: '1.5rem', borderRadius: '20px', position: 'relative' as const, cursor: 'pointer', transition: 'all 0.2s', display: 'flex' },
  itemActions: { position: 'absolute' as const, top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' },
  miniBtn: { padding: '0.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' },
  itemLabel: { fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent-color)', marginBottom: '0.25rem', letterSpacing: '1px' },
  itemTitle: { fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.4 },
  emptyState: { gridColumn: '1 / -1', textAlign: 'center' as const, padding: '4rem', opacity: 0.3, border: '2px dashed #fff', borderRadius: '24px' },
  reviewContainer: { flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center' },
  progressText: { fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', padding: '0.4rem 1rem', borderRadius: '20px', marginBottom: '2rem' },
  cardContainer: { width: 'min(90%, 600px)', height: 'min(60vh, 380px)', perspective: '1200px' },
  cardInner: { width: '100%', height: '100%', position: 'relative' as const, transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)', transformStyle: 'preserve-3d' as const, cursor: 'pointer' },
  cardFace: { position: 'absolute' as const, width: '100%', height: '100%', backfaceVisibility: 'hidden' as const, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '3rem', textAlign: 'center' as const, borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' },
  cardBack: { transform: 'rotateY(180deg)', background: 'rgba(187, 134, 252, 0.05)' },
  faceLabel: { position: 'absolute' as const, top: '2.5rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent-color)', letterSpacing: '3px' },
  cardText: { fontSize: 'max(1.5rem, 4vw)', fontWeight: 700, lineHeight: 1.3 },
  flipNotice: { position: 'absolute' as const, bottom: '2.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' },
  reviewControls: { display: 'flex', alignItems: 'center', marginTop: '3rem' },
  navBtn: { width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }
};
