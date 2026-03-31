import React, { useState } from 'react';
import { Plus, CheckCircle, Circle, Upload, ChevronRight, ChevronDown, Trash2 } from 'lucide-react';

type Subtopic = { id: string, title: string, completed: boolean };
type Topic = { id: string, title: string, completed: boolean, subtopics: Subtopic[] };
type Subject = { id: string, name: string, topics: Topic[] };

export const Syllabus = () => {
  const [subjects, setSubjects] = useState<Subject[]>([
    { 
      id: '1', 
      name: 'Computer Science 101', 
      topics: [
        { 
          id: 't1', title: 'Data Structures', completed: false,
          subtopics: [{ id: 'st1', title: 'Arrays & Strings', completed: true }, { id: 'st2', title: 'Linked Lists', completed: false }]
        }
      ] 
    }
  ]);
  const [newSubj, setNewSubj] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [showJsonInput, setShowJsonInput] = useState(false);

  const addSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubj.trim()) return;
    setSubjects([...subjects, { id: Date.now().toString(), name: newSubj, topics: [] }]);
    setNewSubj('');
  };

  const deleteSubject = (subjId: string) => {
    if (!confirm('Delete this entire subject and all its topics?')) return;
    setSubjects(subjects.filter(s => s.id !== subjId));
  };

  const deleteTopic = (subjId: string, topicId: string) => {
    setSubjects(subjects.map(s =>
      s.id === subjId ? { ...s, topics: s.topics.filter(t => t.id !== topicId) } : s
    ));
  };

  const deleteSubtopic = (subjId: string, topicId: string, subId: string) => {
    setSubjects(subjects.map(s =>
      s.id === subjId ? {
        ...s, topics: s.topics.map(t =>
          t.id === topicId ? { ...t, subtopics: t.subtopics.filter(st => st.id !== subId) } : t
        )
      } : s
    ));
  };

  const addTopic = (subjId: string, topicTitle: string) => {
    setSubjects(subjects.map(s => 
      s.id === subjId ? { ...s, topics: [...s.topics, { id: Date.now().toString(), title: topicTitle, completed: false, subtopics: [] }] } : s
    ));
  };

  const addSubtopic = (subjId: string, topicId: string, subTitle: string) => {
    setSubjects(subjects.map(s => 
      s.id === subjId ? {
        ...s, topics: s.topics.map(t => 
          t.id === topicId ? { ...t, subtopics: [...t.subtopics, { id: Date.now().toString(), title: subTitle, completed: false }] } : t
        )
      } : s
    ));
  };

  const toggleTopic = (subjId: string, topicId: string) => {
    setSubjects(subjects.map(s => 
      s.id === subjId ? { ...s, topics: s.topics.map(t => t.id === topicId ? { ...t, completed: !t.completed, subtopics: t.subtopics.map(st => ({...st, completed: !t.completed})) } : t) } : s
    ));
  };

  const toggleSubtopic = (subjId: string, topicId: string, subId: string) => {
    setSubjects(subjects.map(s => 
      s.id === subjId ? {
        ...s, topics: s.topics.map(t => {
          if (t.id === topicId) {
            const updatedSubs = t.subtopics.map(st => st.id === subId ? { ...st, completed: !st.completed } : st);
            const allSubsCompleted = updatedSubs.every(st => st.completed);
            return { ...t, subtopics: updatedSubs, completed: updatedSubs.length > 0 ? allSubsCompleted : t.completed };
          }
          return t;
        })
      } : s
    ));
  };

  const calculateProgress = () => {
    let total = 0;
    let comp = 0;
    subjects.forEach(s => {
      s.topics.forEach(t => {
        if (t.subtopics.length > 0) {
          total += t.subtopics.length;
          comp += t.subtopics.filter(st => st.completed).length;
        } else {
          total += 1;
          comp += t.completed ? 1 : 0;
        }
      });
    });
    return total === 0 ? 0 : Math.round((comp / total) * 100);
  };

  const handleJsonImport = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      // Basic validation
      if (Array.isArray(parsed) && parsed[0]?.name) {
        // Enforce subtopics array exists recursively for safety
        const cleaned = parsed.map(s => ({
          ...s, id: s.id || Date.now().toString() + Math.random(),
          topics: (s.topics || []).map((t: any) => ({
            ...t, id: t.id || Date.now().toString() + Math.random(),
            subtopics: Array.isArray(t.subtopics) ? t.subtopics.map((st: any) => ({ ...st, id: st.id || (Date.now().toString() + Math.random()) })) : []
          }))
        }));
        setSubjects([...subjects, ...cleaned]);
        setJsonInput('');
        setShowJsonInput(false);
      } else {
        alert('Invalid format. JSON must be an array of Subjects.');
      }
    } catch (err) {
      alert('Parse Error: Invalid JSON format.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', gap: '2rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>Syllabus & Planner</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Track your studies hierarchically.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Overall Progress</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-color)' }}>{calculateProgress()}%</span>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: `conic-gradient(var(--accent-color) ${calculateProgress()}%, transparent 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '40px', height: '40px', background: 'var(--surface-color)', borderRadius: '50%' }}></div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button className="secondary-btn" onClick={() => setShowJsonInput(!showJsonInput)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: 'fit-content' }}>
          <Upload size={18} /> {showJsonInput ? 'Hide Smart Importer' : 'Smart JSON Importer'}
        </button>
        {showJsonInput && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(0,0,0,0.4)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(187,134,252,0.2)', animation: 'fadeIn 0.3s' }}>
            <div>
              <p style={{ fontWeight: 500, color: 'var(--accent-color)', marginBottom: '0.5rem' }}>AI Prompt Generator</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '0.8rem', borderRadius: '8px', userSelect: 'all' }}>
                "Convert my syllabus into structured JSON format with subjects, topics, and subtopics. Return ONLY a JSON array of Subject objects. Each Subject has 'name' and 'topics' (array). Each Topic has 'title', 'completed' (boolean), and 'subtopics' (array). Each Subtopic has 'title' and 'completed' (boolean)."
              </p>
            </div>
            
            <textarea 
              value={jsonInput} 
              onChange={e => setJsonInput(e.target.value)}
              placeholder="Paste the generated JSON array here..."
              style={{ width: '100%', height: '140px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace' }}
            />
            <button className="primary-btn" onClick={handleJsonImport} style={{ alignSelf: 'flex-end', padding: '0.6rem 1.5rem' }}>Inject Data</button>
          </div>
        )}
      </div>

      {/* Main Subjects Grid */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignContent: 'flex-start', paddingBottom: '2rem' }}>
        
        {subjects.map(subj => {
          
          let totalItems = 0;
          let compItems = 0;
          subj.topics.forEach(t => {
            if(t.subtopics.length > 0) { totalItems += t.subtopics.length; compItems += t.subtopics.filter(st=>st.completed).length; }
            else { totalItems += 1; compItems += t.completed ? 1 : 0; }
          });
          const progress = totalItems === 0 ? 0 : Math.round((compItems / totalItems) * 100);

          return (
            <div key={subj.id} className="glass-panel" style={{ width: 'calc(50% - 0.75rem)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '300px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 600 }}>{subj.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem', color: progress === 100 ? 'var(--success-color)' : 'var(--text-secondary)', fontWeight: 600 }}>{progress}%</span>
                  <button onClick={() => deleteSubject(subj.id)} title="Delete subject" style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem', borderRadius: '6px', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = '#ff6b6b')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: progress === 100 ? 'var(--success-color)' : 'var(--accent-color)', transition: 'width 0.4s ease' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem', flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
                {subj.topics.map(topic => (
                  <TreeView 
                    key={topic.id} 
                    topic={topic} 
                    onToggle={() => toggleTopic(subj.id, topic.id)} 
                    onToggleSub={(subId) => toggleSubtopic(subj.id, topic.id, subId)}
                    onAddSub={(title) => addSubtopic(subj.id, topic.id, title)}
                    onDeleteTopic={() => deleteTopic(subj.id, topic.id)}
                    onDeleteSub={(subId) => deleteSubtopic(subj.id, topic.id, subId)}
                  />
                ))}
              </div>

              <GenericInput placeholder="Add main topic..." onAdd={(title) => addTopic(subj.id, title)} />
            </div>
          );
        })}

        {/* Add Subject Node */}
        <div style={{ width: 'calc(50% - 0.75rem)', minHeight: '300px', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '16px', background: 'rgba(0,0,0,0.2)' }}>
          <form onSubmit={addSubject} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '280px' }}>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 500 }}>Create New Subject Domain</p>
            <input 
              type="text" 
              placeholder="E.g. Quantum Physics" 
              value={newSubj} 
              onChange={e => setNewSubj(e.target.value)}
              style={{ padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }}
            />
            <button type="submit" className="primary-btn" style={{ padding: '0.85rem' }}>Add Domain</button>
          </form>
        </div>

      </div>
    </div>
  );
};

const TreeView = ({ topic, onToggle, onToggleSub, onAddSub, onDeleteTopic, onDeleteSub }: { topic: any, onToggle: () => void, onToggleSub: (id: string) => void, onAddSub: (title: string) => void, onDeleteTopic: () => void, onDeleteSub: (id: string) => void }) => {
  const [expanded, setExpanded] = useState(false);
  const hasSubs = topic.subtopics && topic.subtopics.length > 0;

  const deleteIconStyle: React.CSSProperties = { background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.2rem', display: 'flex', alignItems: 'center', borderRadius: '4px', transition: 'color 0.2s', opacity: 0.6, flexShrink: 0 };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.03)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button onClick={() => setExpanded(!expanded)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.2rem', display: 'flex', opacity: hasSubs ? 1 : 0.2 }}>
           {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>
        <div onClick={onToggle} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', opacity: topic.completed ? 0.5 : 1 }}>
          {topic.completed ? <CheckCircle size={18} color="var(--success-color)" /> : <Circle size={18} color="var(--text-secondary)" />}
          <span style={{ textDecoration: topic.completed ? 'line-through' : 'none', fontWeight: 500, fontSize: '1rem' }}>{topic.title}</span>
        </div>
        <button onClick={onDeleteTopic} title="Delete topic" style={deleteIconStyle} onMouseEnter={e => (e.currentTarget.style.color = '#ff6b6b')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
          <Trash2 size={14} />
        </button>
      </div>

      {expanded && (
        <div style={{ paddingLeft: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem', borderLeft: '1px dashed rgba(255,255,255,0.1)', marginLeft: '0.75rem' }}>
          {topic.subtopics.map((st: any) => (
            <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.25rem 0' }}>
              <div onClick={() => onToggleSub(st.id)} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', opacity: st.completed ? 0.5 : 1 }}>
                {st.completed ? <CheckCircle size={16} color="var(--success-color)" /> : <Circle size={16} color="var(--text-secondary)" />}
                <span style={{ textDecoration: st.completed ? 'line-through' : 'none', fontSize: '0.9rem' }}>{st.title}</span>
              </div>
              <button onClick={() => onDeleteSub(st.id)} title="Delete subtopic" style={{ ...deleteIconStyle, opacity: 0.4 }} onMouseEnter={e => { e.currentTarget.style.color = '#ff6b6b'; e.currentTarget.style.opacity = '1'; }} onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.opacity = '0.4'; }}>
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          <GenericInput placeholder="Add subtopic..." onAdd={onAddSub} compact />
        </div>
      )}
    </div>
  );
};

const GenericInput = ({ onAdd, placeholder, compact = false }: { onAdd: (title: string) => void, placeholder: string, compact?: boolean }) => {
  const [val, setVal] = useState('');
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if(val.trim()){ onAdd(val); setVal(''); }
  };
  return (
    <form onSubmit={submit} style={{ display: 'flex', marginTop: compact ? '0.25rem' : 'auto', paddingTop: compact ? 0 : '1rem' }}>
      <input 
        type="text" 
        placeholder={placeholder} 
        value={val} 
        onChange={e=>setVal(e.target.value)} 
        style={{ flex: 1, padding: compact ? '0.4rem 0.6rem' : '0.6rem 0.85rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px 0 0 8px', color: '#fff', fontSize: compact ? '0.85rem' : '0.9rem' }} 
      />
      <button type="submit" style={{ background: 'var(--accent-color)', color: '#fff', border: 'none', padding: compact ? '0 0.75rem' : '0 1rem', borderRadius: '0 8px 8px 0', cursor: 'pointer' }}>
        <Plus size={compact ? 14 : 18} />
      </button>
    </form>
  );
};
