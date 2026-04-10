import React, { useState } from 'react';
import { Plus, CheckCircle, Circle, Upload, ChevronRight, ChevronDown, Trash2, Play, Pause } from 'lucide-react';
import { useAnalytics } from '../../contexts/AnalyticsContext';

type SubSubtopic = { id: string, title: string, completed: boolean };
type Subtopic = { id: string, title: string, completed: boolean, children: SubSubtopic[] };
type Topic = { id: string, title: string, completed: boolean, subtopics: Subtopic[] };
type Subject = { id: string, name: string, topics: Topic[] };

const uid = () => Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);

export const Syllabus = () => {
  const { activeTopic, startStudying, stopStudying } = useAnalytics();
  const [subjects, setSubjects] = useState<Subject[]>([
    { 
      id: '1', 
      name: 'Computer Science 101', 
      topics: [
        { 
          id: 't1', title: 'Data Structures', completed: false,
          subtopics: [
            { id: 'st1', title: 'Arrays & Strings', completed: true, children: [] }, 
            { id: 'st2', title: 'Linked Lists', completed: false, children: [
              { id: 'sst1', title: 'Singly Linked', completed: false },
              { id: 'sst2', title: 'Doubly Linked', completed: false },
            ]}
          ]
        }
      ] 
    }
  ]);
  const [newSubj, setNewSubj] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [showJsonInput, setShowJsonInput] = useState(false);

  // --- Mutators ---
  const update = (fn: (draft: Subject[]) => Subject[]) => setSubjects(prev => fn(prev));

  const addSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubj.trim()) return;
    update(s => [...s, { id: uid(), name: newSubj, topics: [] }]);
    setNewSubj('');
  };

  const deleteSubject = (subjId: string) => {
    if (!confirm('Delete this entire subject and all its topics?')) return;
    update(s => s.filter(x => x.id !== subjId));
  };

  const addTopic = (subjId: string, title: string) => {
    update(s => s.map(x => x.id === subjId ? { ...x, topics: [...x.topics, { id: uid(), title, completed: false, subtopics: [] }] } : x));
  };

  const deleteTopic = (subjId: string, topicId: string) => {
    update(s => s.map(x => x.id === subjId ? { ...x, topics: x.topics.filter(t => t.id !== topicId) } : x));
  };

  const addSubtopic = (subjId: string, topicId: string, title: string) => {
    update(s => s.map(x => x.id === subjId ? {
      ...x, topics: x.topics.map(t => t.id === topicId ? { ...t, subtopics: [...t.subtopics, { id: uid(), title, completed: false, children: [] }] } : t)
    } : x));
  };

  const deleteSubtopic = (subjId: string, topicId: string, subId: string) => {
    update(s => s.map(x => x.id === subjId ? {
      ...x, topics: x.topics.map(t => t.id === topicId ? { ...t, subtopics: t.subtopics.filter(st => st.id !== subId) } : t)
    } : x));
  };

  const addSubSubtopic = (subjId: string, topicId: string, subId: string, title: string) => {
    update(s => s.map(x => x.id === subjId ? {
      ...x, topics: x.topics.map(t => t.id === topicId ? {
        ...t, subtopics: t.subtopics.map(st => st.id === subId ? { ...st, children: [...st.children, { id: uid(), title, completed: false }] } : st)
      } : t)
    } : x));
  };

  const deleteSubSubtopic = (subjId: string, topicId: string, subId: string, ssubId: string) => {
    update(s => s.map(x => x.id === subjId ? {
      ...x, topics: x.topics.map(t => t.id === topicId ? {
        ...t, subtopics: t.subtopics.map(st => st.id === subId ? { ...st, children: st.children.filter(c => c.id !== ssubId) } : st)
      } : t)
    } : x));
  };

  const toggleTopic = (subjId: string, topicId: string) => {
    update(s => s.map(x => x.id === subjId ? {
      ...x, topics: x.topics.map(t => t.id === topicId ? {
        ...t, completed: !t.completed,
        subtopics: t.subtopics.map(st => ({
          ...st, completed: !t.completed,
          children: st.children.map(c => ({ ...c, completed: !t.completed }))
        }))
      } : t)
    } : x));
  };

  const toggleSubtopic = (subjId: string, topicId: string, subId: string) => {
    update(s => s.map(x => x.id === subjId ? {
      ...x, topics: x.topics.map(t => {
        if (t.id !== topicId) return t;
        const updatedSubs = t.subtopics.map(st => {
          if (st.id !== subId) return st;
          const newCompleted = !st.completed;
          return { ...st, completed: newCompleted, children: st.children.map(c => ({ ...c, completed: newCompleted })) };
        });
        const allDone = updatedSubs.length > 0 && updatedSubs.every(st => st.completed);
        return { ...t, subtopics: updatedSubs, completed: updatedSubs.length > 0 ? allDone : t.completed };
      })
    } : x));
  };

  const toggleSubSubtopic = (subjId: string, topicId: string, subId: string, ssubId: string) => {
    update(s => s.map(x => x.id === subjId ? {
      ...x, topics: x.topics.map(t => {
        if (t.id !== topicId) return t;
        const updatedSubs = t.subtopics.map(st => {
          if (st.id !== subId) return st;
          const updatedChildren = st.children.map(c => c.id === ssubId ? { ...c, completed: !c.completed } : c);
          const allChildrenDone = updatedChildren.length > 0 && updatedChildren.every(c => c.completed);
          return { ...st, children: updatedChildren, completed: updatedChildren.length > 0 ? allChildrenDone : st.completed };
        });
        const allSubsDone = updatedSubs.length > 0 && updatedSubs.every(st => st.completed);
        return { ...t, subtopics: updatedSubs, completed: updatedSubs.length > 0 ? allSubsDone : t.completed };
      })
    } : x));
  };

  // --- Progress ---
  const calcLeafCount = (subjects: Subject[]) => {
    let total = 0, comp = 0;
    subjects.forEach(s => s.topics.forEach(t => {
      if (t.subtopics.length === 0) { total++; comp += t.completed ? 1 : 0; return; }
      t.subtopics.forEach(st => {
        if (st.children.length === 0) { total++; comp += st.completed ? 1 : 0; return; }
        st.children.forEach(c => { total++; comp += c.completed ? 1 : 0; });
      });
    }));
    return { total, comp };
  };

  const { total, comp } = calcLeafCount(subjects);
  const overallProgress = total === 0 ? 0 : Math.round((comp / total) * 100);

  // --- JSON Import ---
  const handleJsonImport = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (Array.isArray(parsed) && parsed[0]?.name) {
        const cleaned: Subject[] = parsed.map((s: any) => ({
          ...s, id: s.id || uid(),
          topics: (s.topics || []).map((t: any) => ({
            ...t, id: t.id || uid(),
            subtopics: Array.isArray(t.subtopics) ? t.subtopics.map((st: any) => ({
              ...st, id: st.id || uid(),
              children: Array.isArray(st.children) ? st.children.map((c: any) => ({ ...c, id: c.id || uid() })) : []
            })) : []
          }))
        }));
        setSubjects([...subjects, ...cleaned]);
        setJsonInput('');
        setShowJsonInput(false);
      } else {
        alert('Invalid format. JSON must be an array of Subjects.');
      }
    } catch {
      alert('Parse Error: Invalid JSON format.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', gap: '2rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>Syllabus & Planner</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Track your studies with deep hierarchy.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Overall Progress</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-color)' }}>{overallProgress}%</span>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: `conic-gradient(var(--accent-color) ${overallProgress}%, transparent 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                "Convert my syllabus into structured JSON. Return an array of Subject objects. Each Subject has 'name' and 'topics'. Each Topic has 'title', 'completed', and 'subtopics'. Each Subtopic has 'title', 'completed', and 'children' (sub-sub-topics array). Each child has 'title' and 'completed'."
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

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignContent: 'flex-start', paddingBottom: '2rem' }}>
        {subjects.map(subj => {
          const leaf = calcLeafCount([subj]);
          const progress = leaf.total === 0 ? 0 : Math.round((leaf.comp / leaf.total) * 100);

          return (
            <div key={subj.id} className="glass-panel" style={{ width: 'calc(50% - 0.75rem)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '300px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                   <PlayButton 
                    isActive={activeTopic?.id === subj.id} 
                    onClick={() => activeTopic?.id === subj.id ? stopStudying() : startStudying({ id: subj.id, name: subj.name, subjectName: subj.name })} 
                   />
                   <h3 style={{ fontSize: '1.3rem', fontWeight: 600 }}>{subj.name}</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem', color: progress === 100 ? 'var(--success-color)' : 'var(--text-secondary)', fontWeight: 600 }}>{progress}%</span>
                  <button onClick={() => deleteSubject(subj.id)} title="Delete subject" style={delBtnStyle} onMouseEnter={e => (e.currentTarget.style.color = '#ff6b6b')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: progress === 100 ? 'var(--success-color)' : 'var(--accent-color)', transition: 'width 0.4s ease' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem', flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
                {subj.topics.map(topic => (
                  <TopicNode 
                    key={topic.id} 
                    topic={topic} 
                    subjName={subj.name}
                    onToggle={() => toggleTopic(subj.id, topic.id)} 
                    onToggleSub={(subId) => toggleSubtopic(subj.id, topic.id, subId)}
                    onToggleSubSub={(subId, ssubId) => toggleSubSubtopic(subj.id, topic.id, subId, ssubId)}
                    onAddSub={(title) => addSubtopic(subj.id, topic.id, title)}
                    onAddSubSub={(subId, title) => addSubSubtopic(subj.id, topic.id, subId, title)}
                    onDeleteTopic={() => deleteTopic(subj.id, topic.id)}
                    onDeleteSub={(subId) => deleteSubtopic(subj.id, topic.id, subId)}
                    onDeleteSubSub={(subId, ssubId) => deleteSubSubtopic(subj.id, topic.id, subId, ssubId)}
                  />
                ))}
              </div>

              <GenericInput placeholder="Add main topic..." onAdd={(title) => addTopic(subj.id, title)} />
            </div>
          );
        })}

        <div style={{ width: 'calc(50% - 0.75rem)', minHeight: '300px', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '16px', background: 'rgba(0,0,0,0.2)' }}>
          <form onSubmit={addSubject} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '280px' }}>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 500 }}>Create New Subject Domain</p>
            <input type="text" placeholder="E.g. Quantum Physics" value={newSubj} onChange={e => setNewSubj(e.target.value)} style={{ padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none' }} onFocus={e => e.target.style.borderColor = 'var(--accent-color)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            <button type="submit" className="primary-btn" style={{ padding: '0.85rem' }}>Add Domain</button>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- Topic Node (Level 2) ---
const TopicNode = ({ topic, subjName, onToggle, onToggleSub, onToggleSubSub, onAddSub, onAddSubSub, onDeleteTopic, onDeleteSub, onDeleteSubSub }: {
  topic: Topic, subjName: string,
  onToggle: () => void, onToggleSub: (id: string) => void, onToggleSubSub: (subId: string, ssubId: string) => void,
  onAddSub: (title: string) => void, onAddSubSub: (subId: string, title: string) => void,
  onDeleteTopic: () => void, onDeleteSub: (id: string) => void, onDeleteSubSub: (subId: string, ssubId: string) => void
}) => {
  const { activeTopic, startStudying, stopStudying } = useAnalytics();
  const [expanded, setExpanded] = useState(false);
  const hasSubs = topic.subtopics.length > 0;
  const isStudying = activeTopic?.id === topic.id;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', background: isStudying ? 'rgba(187,134,252,0.1)' : 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '10px', border: isStudying ? '1px solid var(--accent-color)' : '1px solid rgba(255,255,255,0.03)', transition: 'all 0.3s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <button onClick={() => setExpanded(!expanded)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.15rem', display: 'flex', opacity: hasSubs ? 1 : 0.3 }}>
           {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>
        <PlayButton 
          isActive={isStudying} 
          onClick={(e) => { e.stopPropagation(); isStudying ? stopStudying() : startStudying({ id: topic.id, name: topic.title, subjectName: subjName }); }} 
          size={14}
        />
        <div onClick={onToggle} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', opacity: topic.completed ? 0.5 : 1 }}>
          {topic.completed ? <CheckCircle size={18} color="var(--success-color)" /> : <Circle size={18} color="var(--text-secondary)" />}
          <span style={{ textDecoration: topic.completed ? 'line-through' : 'none', fontWeight: 500, fontSize: '1rem' }}>{topic.title}</span>
        </div>
        <button onClick={onDeleteTopic} title="Delete topic" style={delBtnStyle} onMouseEnter={e => (e.currentTarget.style.color = '#ff6b6b')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
          <Trash2 size={14} />
        </button>
      </div>

      {expanded && (
        <div style={{ paddingLeft: '2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.2rem', borderLeft: '1px dashed rgba(255,255,255,0.1)', marginLeft: '0.65rem' }}>
          {topic.subtopics.map(st => (
            <SubtopicNode 
              key={st.id} st={st} subjName={subjName}
              onToggle={() => onToggleSub(st.id)}
              onToggleChild={(ssubId) => onToggleSubSub(st.id, ssubId)}
              onAddChild={(title) => onAddSubSub(st.id, title)}
              onDelete={() => onDeleteSub(st.id)}
              onDeleteChild={(ssubId) => onDeleteSubSub(st.id, ssubId)}
            />
          ))}
          <GenericInput placeholder="Add subtopic..." onAdd={onAddSub} compact />
        </div>
      )}
    </div>
  );
};

// --- Subtopic Node (Level 3) ---
const SubtopicNode = ({ st, subjName, onToggle, onToggleChild, onAddChild, onDelete, onDeleteChild }: {
  st: Subtopic, subjName: string,
  onToggle: () => void, onToggleChild: (id: string) => void, onAddChild: (title: string) => void,
  onDelete: () => void, onDeleteChild: (id: string) => void
}) => {
  const { activeTopic, startStudying, stopStudying } = useAnalytics();
  const [expanded, setExpanded] = useState(false);
  const hasChildren = st.children.length > 0;
  const isStudying = activeTopic?.id === st.id;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', background: isStudying ? 'rgba(187,134,252,0.05)' : 'transparent', borderRadius: '8px', padding: isStudying ? '0.25rem 0.5rem' : '0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.2rem 0' }}>
        <button onClick={() => setExpanded(!expanded)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.1rem', display: 'flex', opacity: hasChildren ? 0.8 : 0.2, flexShrink: 0 }}>
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <PlayButton 
          isActive={isStudying} 
          onClick={() => isStudying ? stopStudying() : startStudying({ id: st.id, name: st.title, subjectName: subjName })} 
          size={12}
        />
        <div onClick={onToggle} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', opacity: st.completed ? 0.5 : 1 }}>
          {st.completed ? <CheckCircle size={16} color="var(--success-color)" /> : <Circle size={16} color="var(--text-secondary)" />}
          <span style={{ textDecoration: st.completed ? 'line-through' : 'none', fontSize: '0.9rem' }}>{st.title}</span>
          {hasChildren && <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', opacity: 0.5 }}>({st.children.filter(c => c.completed).length}/{st.children.length})</span>}
        </div>
        <button onClick={onDelete} title="Delete subtopic" style={{ ...delBtnStyle, opacity: 0.4 }} onMouseEnter={e => { e.currentTarget.style.color = '#ff6b6b'; e.currentTarget.style.opacity = '1'; }} onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.opacity = '0.4'; }}>
          <Trash2 size={12} />
        </button>
      </div>

      {expanded && (
        <div style={{ paddingLeft: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderLeft: '1px dotted rgba(255,255,255,0.08)', marginLeft: '0.5rem' }}>
          {st.children.map(child => (
            <DetailNode 
              key={child.id} 
              child={child} 
              subjName={subjName} 
              onToggle={() => onToggleChild(child.id)} 
              onDelete={() => onDeleteChild(child.id)} 
            />
          ))}
          <GenericInput placeholder="Add detail..." onAdd={onAddChild} compact />
        </div>
      )}
    </div>
  );
};

// --- Detail Node (Level 4 - NEW PLAYABLE) ---
const DetailNode = ({ child, subjName, onToggle, onDelete }: { child: SubSubtopic, subjName: string, onToggle: () => void, onDelete: () => void }) => {
  const { activeTopic, startStudying, stopStudying } = useAnalytics();
  const isStudying = activeTopic?.id === child.id;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.15rem 0.5rem', borderRadius: '6px', background: isStudying ? 'rgba(187,134,252,0.03)' : 'transparent' }}>
      <PlayButton 
        isActive={isStudying} 
        onClick={() => isStudying ? stopStudying() : startStudying({ id: child.id, name: child.title, subjectName: subjName })} 
        size={10}
      />
      <div onClick={onToggle} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', opacity: child.completed ? 0.45 : 1 }}>
        {child.completed ? <CheckCircle size={14} color="var(--success-color)" /> : <Circle size={14} color="var(--text-secondary)" />}
        <span style={{ textDecoration: child.completed ? 'line-through' : 'none', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: isStudying ? 600 : 400 }}>{child.title}</span>
      </div>
      <button onClick={onDelete} style={{ ...delBtnStyle, opacity: 0.3, padding: '0.1rem' }} onMouseEnter={e => { e.currentTarget.style.color = '#ff6b6b'; e.currentTarget.style.opacity = '1'; }} onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.opacity = '0.3'; }}>
        <Trash2 size={10} />
      </button>
    </div>
  );
};

// --- Helper Components ---
const PlayButton = ({ isActive, onClick, size = 18 }: { isActive: boolean, onClick: (e: any) => void, size?: number }) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onClick(e); }}
    style={{ 
      background: isActive ? 'var(--accent-color)' : 'rgba(255,255,255,0.08)', 
      border: 'none', 
      color: '#fff', 
      borderRadius: '50%', 
      width: size + 10 + 'px', 
      height: size + 10 + 'px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      cursor: 'pointer',
      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      boxShadow: isActive ? '0 0 15px var(--accent-color)' : 'none',
      flexShrink: 0,
    }}
    onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.background = isActive ? 'var(--accent-color)' : 'rgba(255,255,255,0.15)' }}
    onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = isActive ? 'var(--accent-color)' : 'rgba(255,255,255,0.08)' }}
  >
    {isActive ? <Pause size={size} fill="currentColor" /> : <Play size={size} fill="currentColor" style={{ marginLeft: '1px' }} />}
  </button>
);

const GenericInput = ({ onAdd, placeholder, compact = false }: { onAdd: (title: string) => void, placeholder: string, compact?: boolean }) => {
  const [val, setVal] = useState('');
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if(val.trim()){ onAdd(val); setVal(''); }
  };
  return (
    <form onSubmit={submit} style={{ display: 'flex', marginTop: compact ? '0.2rem' : 'auto', paddingTop: compact ? 0 : '0.75rem' }}>
      <input 
        type="text" 
        placeholder={placeholder} 
        value={val} 
        onChange={e=>setVal(e.target.value)} 
        style={{ flex: 1, padding: compact ? '0.35rem 0.5rem' : '0.6rem 0.85rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px 0 0 8px', color: '#fff', fontSize: compact ? '0.8rem' : '0.9rem', outline: 'none' }} 
        onFocus={e => e.target.style.borderColor = 'var(--accent-color)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
      />
      <button type="submit" style={{ background: 'var(--accent-color)', color: '#fff', border: 'none', padding: compact ? '0 0.6rem' : '0 1rem', borderRadius: '0 8px 8px 0', cursor: 'pointer' }}>
        <Plus size={compact ? 12 : 18} />
      </button>
    </form>
  );
};

const delBtnStyle: React.CSSProperties = { background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.2rem', display: 'flex', alignItems: 'center', borderRadius: '4px', transition: 'color 0.2s', opacity: 0.6, flexShrink: 0 };
