import React, { useRef, useState, useEffect } from 'react';
import { Bold, Italic, Underline, Link as LinkIcon, Image as ImageIcon, Video, Mic, PenTool, CheckSquare, Trash2, Eraser, Upload, FileText, Download, Eye, FolderOpen, X, Cloud, CloudOff, Loader2 } from 'lucide-react';
import { saveFile, getAllFiles, deleteFile, downloadFile, formatFileSize, type StoredFile } from '../../utils/fileStorage';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../utils/db';

export const Notes = () => {
  const { user } = useAuth();
  const editorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const savedSelection = useRef<Range | null>(null);
  const saveTimeoutRef = useRef<any>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<StoredFile[]>([]);
  const [previewFile, setPreviewFile] = useState<StoredFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'saved' | 'offline'>('idle');
  
  const [strokeColor, setStrokeColor] = useState('#bb86fc');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Load notes content
  useEffect(() => {
    const loadContent = async () => {
      if (user) {
        setSyncStatus('syncing');
        try {
          const cloudContent = await db.getNotes(user.uid);
          if (cloudContent && editorRef.current) {
            editorRef.current.innerHTML = cloudContent;
            setSyncStatus('saved');
          } else {
             // Fallback to local if no cloud data
             const saved = localStorage.getItem('studyfm_notes_data');
             if (saved && editorRef.current) {
               editorRef.current.innerHTML = saved;
             }
             setSyncStatus('idle');
          }
        } catch (err) {
          setSyncStatus('offline');
        }
      } else {
        const saved = localStorage.getItem('studyfm_notes_data');
        if (saved && editorRef.current) {
          editorRef.current.innerHTML = saved;
        }
      }
    };

    loadContent();
    loadFiles();
  }, [user]);

  const loadFiles = async () => {
    try {
      const files = await getAllFiles();
      setUploadedFiles(files.sort((a, b) => b.uploadDate - a.uploadDate));
    } catch (err) {
      console.error('Failed to load files:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 50 * 1024 * 1024) {
          alert(`File "${file.name}" is too large. Max 50MB.`);
          continue;
        }
        await saveFile(file);
      }
      await loadFiles();
    } catch (err) {
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteFile = async (id: string) => {
    if (!confirm('Delete this file?')) return;
    await deleteFile(id);
    await loadFiles();
    if (previewFile?.id === id) setPreviewFile(null);
  };

  const syncToCloud = () => {
    if (!user || !editorRef.current) return;
    
    setSyncStatus('syncing');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const content = editorRef.current?.innerHTML || '';
        await db.saveNotes(user.uid, content);
        setSyncStatus('saved');
        localStorage.setItem('studyfm_notes_data', content);
      } catch (err) {
        setSyncStatus('offline');
      }
    }, 2000); // 2 second throttle for cloud syncing
  };

  const saveToLocal = () => {
    if (editorRef.current) {
      localStorage.setItem('studyfm_notes_data', editorRef.current.innerHTML);
      if (user) syncToCloud();
    }
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelection.current = sel.getRangeAt(0);
    }
  };

  const restoreSelection = () => {
    if (savedSelection.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelection.current);
      }
    } else {
      editorRef.current?.focus();
    }
  };

  const formatDoc = (cmd: string, value?: string, requiresRestore = false) => {
    if (requiresRestore) restoreSelection();
    else editorRef.current?.focus();
    document.execCommand(cmd, false, value);
    saveToLocal();
  };

  const insertLink = () => {
    saveSelection();
    setTimeout(() => {
      const url = prompt('Enter link URL:');
      if (url) formatDoc('createLink', url, true);
    }, 50);
  };

  const insertImage = () => {
    saveSelection();
    setTimeout(() => {
      const url = prompt('Enter image URL:');
      if (url) formatDoc('insertImage', url, true);
    }, 50);
  };

  const insertVideo = () => {
    saveSelection();
    setTimeout(() => {
      const url = prompt('Enter YouTube embed URL (e.g. https://www.youtube.com/embed/...):');
      if (url) {
        const iframe = `<br/><iframe width="560" height="315" src="${url}" frameborder="0" allowfullscreen style="border-radius:12px; margin: 10px 0;"></iframe><br/>`;
        formatDoc('insertHTML', iframe, true);
      }
    }, 50);
  };

  const insertCheckbox = () => {
    const checkbox = `<input type="checkbox" style="width: 18px; height: 18px; margin-right: 8px; vertical-align: middle;" />`;
    formatDoc('insertHTML', checkbox);
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        saveSelection();
        const chunks: BlobPart[] = [];
        mediaRecorder.ondataavailable = e => chunks.push(e.data);
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
          const audioUrl = URL.createObjectURL(blob);
          const audioHtml = `<br/><audio controls src="${audioUrl}" style="height: 40px; margin: 10px 0; border-radius: 20px; outline: none;"></audio><br/>`;
          formatDoc('insertHTML', audioHtml, true);
          stream.getTracks().forEach(t => t.stop());
        };
        mediaRecorder.start();
        setIsRecording(true);
      } catch {
        alert("Microphone access denied or unavailable.");
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <h2 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Rich Notes</h2>
             {user && (
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: syncStatus === 'offline' ? 'var(--danger-color)' : 'var(--text-secondary)' }}>
                 {syncStatus === 'syncing' ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : 
                  syncStatus === 'saved' ? <Cloud size={14} color="var(--success-color)" /> : 
                  syncStatus === 'offline' ? <CloudOff size={14} /> : null}
                 {syncStatus === 'syncing' ? 'Syncing...' : syncStatus === 'saved' ? 'Cloud Synced' : syncStatus === 'offline' ? 'Sync Failed' : ''}
               </div>
             )}
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Format, embed, draw, record, and upload files.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            className="secondary-btn" 
            onClick={() => setShowFiles(!showFiles)} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '10px' }}
          >
            <FolderOpen size={18} />
            My Files {uploadedFiles.length > 0 && <span style={{ background: 'var(--accent-color)', color: '#fff', borderRadius: '12px', padding: '0.1rem 0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>{uploadedFiles.length}</span>}
          </button>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '10px', cursor: 'pointer', background: 'var(--accent-color)', color: '#fff', fontWeight: 500, fontSize: '0.9rem', transition: 'all 0.2s' }}>
            <Upload size={18} />
            {isUploading ? 'Uploading...' : 'Upload File'}
            <input 
              ref={fileInputRef}
              type="file" 
              multiple 
              onChange={handleFileUpload} 
              style={{ display: 'none' }}
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.xlsx,.pptx,.csv"
            />
          </label>
        </div>
      </div>

      {/* Uploaded Files Panel & Preview Modal remain same */}
      {showFiles && (
        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '14px', animation: 'slideUp 0.3s ease', maxHeight: '300px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>📁 My Files</h3>
            <button onClick={() => setShowFiles(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={18} /></button>
          </div>
          {uploadedFiles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', opacity: 0.6 }}>
              <FileText size={32} style={{ marginBottom: '0.5rem' }} />
              <p>No files uploaded yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {uploadedFiles.map(file => (
                <div key={file.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '1.5rem' }}>📎</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 500, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {formatFileSize(file.size)} • {new Date(file.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {file.preview && (
                      <button onClick={() => setPreviewFile(file)} style={iconBtnStyle} title="Preview"><Eye size={16} /></button>
                    )}
                    <button onClick={() => downloadFile(file)} style={iconBtnStyle} title="Download"><Download size={16} /></button>
                    <button onClick={() => handleDeleteFile(file.id)} style={{ ...iconBtnStyle, color: 'var(--danger-color)' }} title="Delete"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Editor & Drawing Canvas */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', padding: 0, borderRadius: '16px' }}>
        <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.3)', flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={() => formatDoc('bold')} style={toolbarStyles.toolbarBtn} title="Bold"><Bold size={18} /></button>
          <button onClick={() => formatDoc('italic')} style={toolbarStyles.toolbarBtn} title="Italic"><Italic size={18} /></button>
          <button onClick={() => formatDoc('underline')} style={toolbarStyles.toolbarBtn} title="Underline"><Underline size={18} /></button>
          <button onClick={insertCheckbox} style={toolbarStyles.toolbarBtn} title="Checkbox"><CheckSquare size={18} /></button>
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', height: '20px', margin: '0 0.5rem' }} />
          <button onClick={insertLink} style={toolbarStyles.toolbarBtn} title="Link"><LinkIcon size={18} /></button>
          <button onClick={insertImage} style={toolbarStyles.toolbarBtn} title="Image"><ImageIcon size={18} /></button>
          <button onClick={insertVideo} style={toolbarStyles.toolbarBtn} title="Video"><Video size={18} /></button>
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', height: '20px', margin: '0 0.5rem' }} />
          <button 
            onClick={toggleRecording} 
            style={{ ...toolbarStyles.toolbarBtn, color: isRecording ? 'var(--danger-color)' : 'inherit', background: isRecording ? 'rgba(239, 68, 68, 0.15)' : 'transparent' }} 
          >
            <Mic size={18} />
          </button>
        </div>

        <div style={{ flex: 1, position: 'relative', background: 'transparent', overflowY: 'auto' }}>
          <div 
            ref={editorRef}
            contentEditable 
            style={{ width: '100%', minHeight: '100%', padding: '2rem 3rem', outline: 'none', color: 'var(--text-primary)', lineHeight: 1.7, fontSize: '1.05rem' }}
            onInput={saveToLocal}
            onBlur={saveSelection}
          >
            <h2>My Study Notes</h2>
            <div>Start typing your rich notes here... they will be synced to your cloud account automatically.</div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const iconBtnStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px', display: 'flex', alignItems: 'center' };
const toolbarStyles = {
  toolbarBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.6rem', borderRadius: '8px', cursor: 'pointer', border: 'none', background: 'transparent', color: 'var(--text-primary)' },
};
