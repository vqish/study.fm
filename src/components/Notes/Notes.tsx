import React, { useRef, useState, useEffect } from 'react';
import { Bold, Italic, Underline, Link as LinkIcon, Image as ImageIcon, Video, Mic, PenTool, CheckSquare, Trash2, Eraser, Upload, FileText, Download, Eye, FolderOpen, X } from 'lucide-react';
import { saveFile, getAllFiles, deleteFile, downloadFile, formatFileSize, type StoredFile } from '../../utils/fileStorage';

export const Notes = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const savedSelection = useRef<Range | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<StoredFile[]>([]);
  const [previewFile, setPreviewFile] = useState<StoredFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [strokeColor, setStrokeColor] = useState('#bb86fc');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Load notes content
  useEffect(() => {
    if (editorRef.current) {
      const saved = localStorage.getItem('studyfm_notes_data');
      if (saved) {
        editorRef.current.innerHTML = saved;
      }
    }
    loadFiles();
  }, []);

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

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('text')) return '📃';
    if (type.includes('spreadsheet') || type.includes('excel')) return '📊';
    if (type.includes('presentation') || type.includes('powerpoint')) return '📽️';
    return '📎';
  };

  const saveToLocal = () => {
    if (editorRef.current) {
      localStorage.setItem('studyfm_notes_data', editorRef.current.innerHTML);
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

  const openDrawer = () => {
    saveSelection();
    setDrawingMode(true);
  };

  const clearCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const startDrawing = (e: React.MouseEvent) => {
    if (!drawingMode || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || !drawingMode || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
      ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      ctx.strokeStyle = isEraser ? 'rgba(0,0,0,1)' : strokeColor;
      ctx.lineWidth = isEraser ? strokeWidth * 3 : strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!drawingMode) return;
    setIsDrawing(false);
  };

  const saveDrawing = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL();
      const htmlSnippet = `&nbsp;<span style="display:inline-block; resize:both; overflow:hidden; border:1px solid rgba(255,255,255,0.2); padding:4px; max-width:100%; min-width:100px; min-height:100px;"><img src="${dataUrl}" style="width:100%; height:100%; pointer-events:none;" /></span>&nbsp;`;
      formatDoc('insertHTML', htmlSnippet, true);
      setDrawingMode(false);
      clearCanvas();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Rich Notes</h2>
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

      {/* Uploaded Files Panel */}
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
                  <span style={{ fontSize: '1.5rem' }}>{getFileIcon(file.type)}</span>
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

      {/* Image Preview Modal */}
      {previewFile && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }} onClick={() => setPreviewFile(null)}>
          <div style={{ maxWidth: '90vw', maxHeight: '90vh', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setPreviewFile(null)} style={{ position: 'absolute', top: '-2.5rem', right: 0, background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={24} /></button>
            <img src={previewFile.preview} alt={previewFile.name} style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }} />
            <p style={{ textAlign: 'center', marginTop: '0.75rem', color: 'var(--text-secondary)' }}>{previewFile.name}</p>
          </div>
        </div>
      )}

      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', padding: 0, borderRadius: '16px' }}>
        
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.3)', flexWrap: 'wrap', alignItems: 'center' }}>
          <select onChange={e => formatDoc('fontSize', e.target.value)} style={toolbarStyles.toolbarSelect} defaultValue="3">
            <option value="1">Small</option>
            <option value="3">Normal</option>
            <option value="5">Large</option>
            <option value="7">Huge</option>
          </select>
          
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', height: '20px', margin: '0 0.5rem' }} />

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
            title="Record Audio"
          >
            <Mic size={18} /> {isRecording ? 'Stop' : ''}
          </button>

          <button 
            onClick={openDrawer}
            style={{ ...toolbarStyles.toolbarBtn, background: drawingMode ? 'var(--accent-color)' : 'transparent', color: drawingMode ? '#fff' : 'inherit' }} 
            title="Sketch"
          >
            <PenTool size={18} />
          </button>
        </div>

        {/* Editor Area */}
        <div style={{ flex: 1, position: 'relative', background: 'transparent', overflowY: 'auto' }}>
          {!drawingMode ? (
             <div 
               ref={editorRef}
               contentEditable 
               style={{ width: '100%', minHeight: '100%', padding: '2rem 3rem', outline: 'none', color: 'var(--text-primary)', lineHeight: 1.7, fontSize: '1.05rem', wordWrap: 'break-word', userSelect: 'text', WebkitUserSelect: 'text', cursor: 'text' }}
               suppressContentEditableWarning={true}
               onInput={saveToLocal}
               onBlur={saveSelection}
             >
               <h2>My Study Notes</h2>
               <div>Start typing your rich notes here...</div>
             </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
              
              <div style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'var(--surface-color)', borderRadius: '12px', marginBottom: '1rem', alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)', flexWrap: 'wrap', justifyContent: 'center' }}>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginRight: '1rem' }}>
                  {['#000', '#3b82f6', '#ef4444', '#22c55e', '#eab308'].map(c => (
                    <button key={c} onClick={() => {setStrokeColor(c); setIsEraser(false)}} style={{ width: '24px', height: '24px', borderRadius: '50%', background: c, border: strokeColor===c && !isEraser ? '2px solid #fff' : '2px solid transparent' }} />
                  ))}
                  <input type="color" value={strokeColor} onChange={e => {setStrokeColor(e.target.value); setIsEraser(false)}} style={{ width: '30px', height: '30px', border: 'none', background: 'transparent', cursor: 'pointer' }} />
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)', padding: '0 1rem', alignItems: 'center' }}>
                   <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Size:</span>
                   {[{v:2,l:'S'},{v:6,l:'M'},{v:12,l:'L'}].map(s => (
                     <button key={s.v} onClick={() => setStrokeWidth(s.v)} style={{ width: '30px', height: '30px', borderRadius: '8px', background: strokeWidth===s.v ? 'rgba(255,255,255,0.1)' : 'transparent', color: '#fff' }}>{s.l}</button>
                   ))}
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <button onClick={() => setIsEraser(true)} style={{ ...toolbarStyles.toolbarBtn, background: isEraser ? 'var(--accent-color)' : 'transparent', color: isEraser ? '#fff' : 'var(--text-primary)' }} title="Eraser">
                    <Eraser size={18} />
                  </button>
                  <button onClick={clearCanvas} style={{ ...toolbarStyles.toolbarBtn, color: 'var(--danger-color)' }} title="Clear Canvas">
                    <Trash2 size={18} />
                  </button>
                </div>

                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <button className="primary-btn" onClick={saveDrawing} style={{ padding: '0.6rem 1.25rem' }}>Insert into Note</button>
                  <button className="secondary-btn" onClick={() => setDrawingMode(false)} style={{ padding: '0.6rem 1.25rem' }}>Cancel</button>
                </div>
              </div>

              <canvas 
                ref={canvasRef}
                width={800}
                height={500}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                style={{ background: '#ecf0f1', borderRadius: '12px', cursor: isEraser ? 'cell' : 'crosshair', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const iconBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: 'none',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  padding: '0.4rem',
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  transition: 'all 0.2s',
};

const toolbarStyles = {
  toolbarBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.6rem',
    borderRadius: '8px',
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    color: 'var(--text-primary)',
    transition: 'all 0.2s',
  },
  toolbarSelect: {
    background: 'rgba(0,0,0,0.2)',
    color: 'var(--text-primary)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '0.4rem 0.8rem',
    outline: 'none',
    fontSize: '0.9rem',
  }
};
