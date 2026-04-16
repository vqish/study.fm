import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Bold, Italic, Underline, Link as LinkIcon, Image as ImageIcon, Video, Trash2, FileText, X, Cloud, Loader2, Plus, ChevronRight, ChevronLeft, Save, FolderOpen, Upload, Download, Eye, Search } from 'lucide-react';
import { saveFile, getAllFiles, deleteFile, downloadFile, formatFileSize, type StoredFile } from '../../utils/fileStorage';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../utils/db';

type Note = {
  id: string;
  title: string;
  content: string;
  lastSaved: number;
};

export const Notes = () => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const { user } = useAuth();
  const editorRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<any>(null);

  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [showMobileList, setShowMobileList] = useState(true);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'saved' | 'offline'>('idle');
  
  const [showFiles, setShowFiles] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<StoredFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load all notes from Firestore
  const loadNotes = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const fetchedNotes = await db.getNotes(user.uid);
      const sorted = fetchedNotes.sort((a: Note, b: Note) => b.lastSaved - a.lastSaved);
      setNotes(sorted);
      if (sorted.length > 0 && !activeNote) {
        setActiveNote(sorted[0]);
      }
    } catch (err) {
      console.error("Failed to load notes:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load files
  const loadFiles = useCallback(async () => {
    if (!user) return;
    try {
      const files = await getAllFiles(user.uid);
      setUploadedFiles(files.sort((a, b) => b.uploadDate - a.uploadDate));
    } catch (err) {
      console.error('Failed to load files:', err);
    }
  }, [user]);

  useEffect(() => {
    loadNotes();
    if (user) loadFiles();
  }, [user]);

  // Sync editor content when active note changes
  useEffect(() => {
    if (activeNote && editorRef.current) {
      if (editorRef.current.innerHTML !== activeNote.content) {
        editorRef.current.innerHTML = activeNote.content || '';
      }
    }
  }, [activeNote?.id]);

  // Listen for open-note events from Files drawer
  useEffect(() => {
    const handleOpenNote = (e: any) => {
      const noteId = e.detail?.id;
      if (!noteId || !user) return;

      const inList = notes.find(n => n.id === noteId);
      if (inList) {
        setActiveNote(inList);
        setShowFiles(false);
      } else {
        db.getNote(user.uid, noteId).then(n => {
          if (n) {
            setNotes(prev => [n, ...prev.filter(x => x.id !== n.id)]);
            setActiveNote(n);
            setShowFiles(false);
          }
        });
      }
    };
    window.addEventListener('open-note', handleOpenNote);
    return () => window.removeEventListener('open-note', handleOpenNote);
  }, [user, notes]);

  const createNewNote = () => {
    const newNote: Note = {
      id: `note_${Date.now()}`,
      title: 'Untitled Note',
      content: '<h2>New Note</h2><p>Start writing...</p>',
      lastSaved: Date.now()
    };
    setNotes(prev => [newNote, ...prev]);
    setActiveNote(newNote);
    setShowMobileList(false);
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = newNote.content;
        editorRef.current.focus();
      }
    }, 50);
  };

  const syncToCloud = () => {
    if (!user || !activeNote || !editorRef.current) return;
    
    setSyncStatus('syncing');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const updatedContent = editorRef.current?.innerHTML || '';
        const updatedNote = { ...activeNote, content: updatedContent, lastSaved: Date.now() };
        await db.saveNote(user.uid, updatedNote);
        setNotes(prev => prev.map(n => n.id === activeNote.id ? { ...n, content: updatedContent, lastSaved: Date.now() } : n));
        setSyncStatus('saved');
        setTimeout(() => setSyncStatus('idle'), 2000);
      } catch (err) {
        setSyncStatus('offline');
      }
    }, 1500); 
  };

  const manualSave = async () => {
    if (!user || !activeNote || !editorRef.current) return;
    setSyncStatus('syncing');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    try {
      const content = editorRef.current.innerHTML || '';
      const updated = { ...activeNote, content, lastSaved: Date.now() };
      await db.saveNote(user.uid, updated);
      setNotes(prev => prev.map(n => n.id === activeNote.id ? updated : n));
      setSyncStatus('saved');
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch {
      setSyncStatus('offline');
    }
  };

  const updateTitle = async (newTitle: string) => {
    if (!activeNote || !user) return;
    const updated = { ...activeNote, title: newTitle };
    setActiveNote(updated);
    setNotes(prev => prev.map(n => n.id === activeNote.id ? { ...n, title: newTitle } : n));
    // Debounce title save
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      await db.saveNote(user.uid, { ...updated, content: editorRef.current?.innerHTML || updated.content });
    }, 800);
  };

  const deleteActiveNote = async () => {
    if (!activeNote || !user || !confirm('Delete this note?')) return;
    await db.deleteNote(user.uid, activeNote.id);
    const remaining = notes.filter(n => n.id !== activeNote.id);
    setNotes(remaining);
    const next = remaining.length > 0 ? remaining[0] : null;
    setActiveNote(next);
    if (editorRef.current) editorRef.current.innerHTML = next?.content || '';
  };

  // File upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0 || !user) return;
    setIsUploading(true);
    try {
      for (const f of Array.from(selected)) {
        await saveFile(f, user.uid);
      }
      await loadFiles();
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Editor Commands
  const formatDoc = (cmd: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
    syncToCloud();
  };

  // Not logged in
  if (!user && !loading) {
    return (
      <div style={styles.noActive}>
        <FileText size={48} style={{ opacity: 0.15, marginBottom: '1rem' }} />
        <h3>Sign in to use Notes</h3>
        <p>Your notes are saved securely to the cloud.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', width: '100%', height: '100%', gap: '1.5rem', overflow: 'hidden', position: 'relative' }}>
      
      {/* 1. Sidebar — All Notes */}
      <div className="glass-panel" style={{ ...styles.sidebar(isMobile), display: isMobile && !showMobileList ? 'none' : 'flex' }}>
        <div style={styles.sidebarHeader}>
          <h3 style={styles.sidebarTitle}>All Notes</h3>
          <button onClick={createNewNote} style={styles.addBtn} title="New Note"><Plus size={18} /></button>
        </div>
        
        <div className="module-scroll-area" style={{ flex: 1 }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.85rem' }}>Loading notes...</p>
            </div>
          ) : notes.length === 0 ? (
            <div style={styles.emptySidebar}>
              <FileText size={32} style={{ opacity: 0.2, marginBottom: '0.75rem' }} />
              <p style={{ fontSize: '0.85rem' }}>No notes yet.</p>
              <button onClick={createNewNote} style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--accent-color)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                + Create first note
              </button>
            </div>
          ) : (
            notes.map(note => (
              <div 
                key={note.id} 
                onClick={() => {
                  setActiveNote(note);
                  setShowMobileList(false);
                  if (editorRef.current) editorRef.current.innerHTML = note.content || '';
                }}
                style={{ 
                  ...styles.noteItem, 
                  background: activeNote?.id === note.id ? 'rgba(187, 134, 252, 0.12)' : 'transparent',
                  borderLeft: activeNote?.id === note.id ? '3px solid var(--accent-color)' : '3px solid transparent'
                }}
              >
                <div style={styles.noteItemInfo}>
                  <p style={{ fontWeight: activeNote?.id === note.id ? 700 : 500, fontSize: '0.9rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{note.title || 'Untitled'}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{new Date(note.lastSaved).toLocaleDateString()}</p>
                </div>
                <ChevronRight size={14} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. Main Editor Area */}
      <div style={{ display: isMobile && showMobileList ? 'none' : 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', gap: '1rem' }}>
        
        {activeNote ? (
          <>
            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0, gap: '1rem' }}>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {isMobile && (
                  <button onClick={() => setShowMobileList(true)} style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', padding: '0.2rem' }}>
                    <ChevronLeft size={28} />
                  </button>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <input 
                    type="text" 
                    value={activeNote.title} 
                    onChange={e => updateTitle(e.target.value)}
                    style={styles.titleInput}
                    placeholder="Note Title..."
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem' }}>
                  <div style={{ ...styles.syncBadge, color: syncStatus === 'offline' ? 'var(--danger-color)' : syncStatus === 'saved' ? '#03DAC6' : 'var(--text-secondary)' }}>
                    {syncStatus === 'syncing' ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> : 
                     syncStatus === 'saved' ? <Cloud size={11} /> : <Save size={11} />}
                    {syncStatus === 'idle' ? 'Auto-save enabled' : syncStatus.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, flexWrap: 'wrap' }}>
                <button onClick={manualSave} className="secondary-btn mobile-hide" style={styles.metaBtn} title="Save now">
                  <Save size={16} /> Save
                </button>
                <button className="secondary-btn" onClick={() => { setShowFiles(!showFiles); loadFiles(); }} style={styles.metaBtn}>
                  <FolderOpen size={16} />
                </button>
                <button className="secondary-btn" onClick={deleteActiveNote} style={{ ...styles.metaBtn, color: 'var(--danger-color)' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Editor panel */}
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', padding: 0 }}>
              {/* Toolbar */}
              <div style={styles.toolbar}>
                <ToolBtn icon={<Bold size={15} />} onClick={() => formatDoc('bold')} title="Bold" />
                <ToolBtn icon={<Italic size={15} />} onClick={() => formatDoc('italic')} title="Italic" />
                <ToolBtn icon={<Underline size={15} />} onClick={() => formatDoc('underline')} title="Underline" />
                <div style={styles.vDivider} />
                <ToolBtn icon={<span style={{ fontSize: '0.75rem', fontWeight: 800 }}>H1</span>} onClick={() => formatDoc('formatBlock', 'h1')} title="Heading 1" />
                <ToolBtn icon={<span style={{ fontSize: '0.75rem', fontWeight: 800 }}>H2</span>} onClick={() => formatDoc('formatBlock', 'h2')} title="Heading 2" />
                <ToolBtn icon={<span style={{ fontSize: '0.75rem' }}>¶</span>} onClick={() => formatDoc('formatBlock', 'p')} title="Paragraph" />
                <div style={styles.vDivider} />
                <ToolBtn icon={<LinkIcon size={15} />} onClick={() => { const url = prompt('Link URL:'); if (url) formatDoc('createLink', url); }} title="Insert Link" />
                <ToolBtn icon={<ImageIcon size={15} />} onClick={() => { const url = prompt('Image URL:'); if (url) formatDoc('insertImage', url); }} title="Insert Image" />
                <ToolBtn icon={<Video size={15} />} onClick={() => {
                   const url = prompt('YouTube Embed URL:');
                   if (url) {
                     const ytId = url.includes('watch?v=') ? new URL(url).searchParams.get('v') : url.split('/').pop();
                     editorRef.current?.focus();
                     document.execCommand('insertHTML', false, `<iframe width="100%" height="280" src="https://www.youtube.com/embed/${ytId}" frameborder="0" allowfullscreen style="border-radius:12px;margin:1rem 0;"></iframe>`);
                     syncToCloud();
                   }
                }} title="Embed YouTube" />
              </div>

              {/* Editor */}
              <div 
                ref={editorRef}
                contentEditable 
                suppressContentEditableWarning
                className="module-scroll-area"
                onInput={syncToCloud}
                data-placeholder="Start writing your note here..."
                style={styles.editor}
              />
            </div>
          </>
        ) : (
          <div style={styles.noActive}>
            <FileText size={56} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Note Selected</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '300px', lineHeight: 1.6 }}>
              {loading ? 'Loading your notes...' : 'Select a note from the sidebar or create a new one.'}
            </p>
            {!loading && (
              <button onClick={createNewNote} className="primary-btn" style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={18} /> Create First Note
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. Files Drawer (slides in from right or bottom on mobile) */}
      {showFiles && (
        <FilesDrawer 
          isMobile={isMobile}
          files={uploadedFiles}
          isUploading={isUploading}
          fileInputRef={fileInputRef}
          onUpload={handleUpload}
          onClose={() => setShowFiles(false)}
          onInsertImage={(url) => {
            editorRef.current?.focus();
            document.execCommand('insertImage', false, url);
            syncToCloud();
            setShowFiles(false);
          }}
          onDeleteFile={async (f) => {
            if (!user || !confirm('Delete file?')) return;
            await deleteFile(f, user.uid);
            await loadFiles();
          }}
          onOpenNote={(id) => {
            window.dispatchEvent(new CustomEvent('open-note', { detail: { id } }));
          }}
        />
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
        [contenteditable]:empty:before { content: attr(data-placeholder); color: rgba(255,255,255,0.2); pointer-events: none; }
        [contenteditable] h1 { font-size: 2rem; font-weight: 800; margin: 1rem 0 0.5rem; }
        [contenteditable] h2 { font-size: 1.5rem; font-weight: 700; margin: 0.75rem 0 0.4rem; }
        [contenteditable] p { margin: 0.25rem 0; }
        [contenteditable] a { color: var(--accent-color); }
        [contenteditable] img { max-width: 100%; border-radius: 12px; margin: 0.5rem 0; }
      `}</style>
    </div>
  );
};

// Toolbar button
const ToolBtn = ({ icon, onClick, title }: { icon: any, onClick: () => void, title?: string }) => (
  <button onClick={onClick} style={styles.toolBtn} title={title}>{icon}</button>
);

// Files drawer component
const FilesDrawer = ({ 
  isMobile, files, isUploading, fileInputRef, onUpload, onClose, onInsertImage, onDeleteFile, onOpenNote
}: {
  isMobile: boolean;
  files: StoredFile[];
  isUploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
  onInsertImage: (url: string) => void;
  onDeleteFile: (f: StoredFile) => void;
  onOpenNote: (id: string) => void;
}) => {
  const [search, setSearch] = useState('');
  const [previewFile, setPreviewFile] = useState<StoredFile | null>(null);
  const filtered = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="glass-panel" style={styles.drawer(isMobile)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexShrink: 0 }}>
          <h4 style={{ fontWeight: 800, fontSize: '1rem' }}>Files & Materials</h4>
          <button onClick={onClose} style={{ color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.35rem' }}><X size={16} /></button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '0.75rem', flexShrink: 0 }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search files..."
            style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.5rem 0.75rem 0.5rem 2.25rem', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
          />
        </div>

        {/* Upload */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.75rem', borderRadius: '10px', background: 'rgba(187,134,252,0.12)', border: '1px dashed rgba(187,134,252,0.3)', color: 'var(--accent-color)', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem', flexShrink: 0 }}>
          {isUploading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={15} />}
          {isUploading ? 'Uploading...' : 'Upload File'}
          <input ref={fileInputRef} type="file" multiple onChange={onUpload} style={{ display: 'none' }} />
        </label>

        {/* File list */}
        <div className="module-scroll-area" style={{ flex: 1 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', opacity: 0.5 }}>
              <FileText size={32} style={{ marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.85rem' }}>{search ? 'No matching files' : 'No files yet'}</p>
            </div>
          ) : filtered.map(f => (
            <div key={f.id} style={styles.drawerItem}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                {f.type.startsWith('image/') ? (
                  <img src={f.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <FileText size={16} color={f.type === 'application/x-studyfm-note' ? '#03DAC6' : 'var(--accent-color)'} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  {f.type === 'application/x-studyfm-note' ? '📝 Note' : formatFileSize(f.size)}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {f.type === 'application/x-studyfm-note' ? (
                  <button onClick={() => onOpenNote(f.id)} style={styles.drawerAction} title="Open Note"><Eye size={13} /></button>
                ) : f.type.startsWith('image/') ? (
                  <button onClick={() => onInsertImage(f.url)} style={styles.drawerAction} title="Insert into note"><Plus size={13} /></button>
                ) : (
                  <button onClick={() => setPreviewFile(f)} style={styles.drawerAction} title="Preview"><Eye size={13} /></button>
                )}
                {f.type !== 'application/x-studyfm-note' && (
                  <button onClick={() => downloadFile(f)} style={styles.drawerAction} title="Download"><Download size={13} /></button>
                )}
                <button onClick={() => onDeleteFile(f)} style={{ ...styles.drawerAction, color: 'var(--danger-color)' }} title="Delete"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', zIndex: 9000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ width: '100%', maxWidth: '900px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>{previewFile.name}</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => downloadFile(previewFile)} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '0.5rem 1rem', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}><Download size={14} /> Download</button>
                <button onClick={() => setPreviewFile(null)} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '0.5rem', borderRadius: '10px', cursor: 'pointer' }}><X size={18} /></button>
              </div>
            </div>
            {previewFile.type.startsWith('image/') ? (
              <img src={previewFile.url} alt={previewFile.name} style={{ maxWidth: '100%', maxHeight: '75vh', borderRadius: '12px' }} />
            ) : previewFile.type === 'application/pdf' ? (
              <iframe src={previewFile.url} style={{ width: '100%', height: '70vh', border: 'none', borderRadius: '12px', background: '#fff' }} />
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <FileText size={64} color="var(--accent-color)" />
                <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Preview not available for this file type.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  sidebar: (isMobile: boolean) => ({ width: isMobile ? '100%' : '240px', borderRadius: '20px', display: 'flex', flexDirection: 'column' as const, overflow: 'hidden', background: 'rgba(0,0,0,0.2)', flexShrink: 0 }),
  sidebarHeader: { padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  sidebarTitle: { fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' as const, letterSpacing: '1.5px' },
  addBtn: { width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent-color)', borderRadius: '8px', color: '#fff', flexShrink: 0 },
  emptySidebar: { textAlign: 'center' as const, padding: '3rem 1rem', color: 'var(--text-secondary)' },
  noteItem: { display: 'flex', alignItems: 'center', padding: '0.85rem 1.25rem', cursor: 'pointer', transition: 'all 0.2s', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.03)' },
  noteItemInfo: { flex: 1, minWidth: 0 },
  titleInput: { width: '100%', background: 'transparent', border: 'none', color: '#fff', fontSize: 'clamp(1.2rem, 4vw, 1.7rem)', fontWeight: 800, padding: 0, outline: 'none', letterSpacing: '-0.5px' },
  syncBadge: { display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' as const },
  metaBtn: { padding: '0.45rem 0.85rem', borderRadius: '10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 },
  toolbar: { display: 'flex', gap: '0.2rem', padding: '0.6rem 0.75rem', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap' as const },
  toolBtn: { padding: '0.4rem 0.5rem', borderRadius: '6px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', transition: 'background 0.15s, color 0.15s' },
  vDivider: { width: '1px', background: 'rgba(255,255,255,0.08)', margin: '0 0.4rem', alignSelf: 'stretch' },
  editor: { flex: 1, padding: 'clamp(1rem, 3vw, 2rem)', outline: 'none', fontSize: '1rem', lineHeight: 1.75, background: 'transparent', color: '#f0f0f0', minHeight: 0 },
  noActive: { flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', textAlign: 'center' as const, padding: 'clamp(1rem, 5vw, 4rem)' },
  drawer: (isMobile: boolean) => ({ width: isMobile ? '100%' : '280px', position: isMobile ? 'absolute' : 'relative', right: 0, top: 0, bottom: 0, zIndex: 100, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden', padding: '1.25rem', animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)', flexShrink: 0, background: 'rgba(25, 25, 30, 0.95)' }),
  drawerItem: { display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.5rem', borderRadius: '10px', marginBottom: '0.4rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' },
  drawerAction: { background: 'rgba(255,255,255,0.06)', border: 'none', color: 'var(--text-secondary)', padding: '0.35rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }
};
