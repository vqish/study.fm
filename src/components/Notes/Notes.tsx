import React, { useRef, useState, useEffect } from 'react';
import { Bold, Italic, Underline, Link as LinkIcon, Image as ImageIcon, Video, Mic, PenTool, CheckSquare, Trash2, Eraser } from 'lucide-react';

export const Notes = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const savedSelection = useRef<Range | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState(false);
  
  // Canvas tools
  const [strokeColor, setStrokeColor] = useState('#bb86fc');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Load persistence
  useEffect(() => {
    if (editorRef.current) {
      const saved = localStorage.getItem('studyfm_notes_data');
      if (saved) {
        editorRef.current.innerHTML = saved;
      }
    }
  }, []);

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

  // Audio Recording (Basic abstraction supporting modern MediaRecorder API)
  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        
        saveSelection(); // save before starting mic
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
      } catch (err) {
        alert("Microphone access denied or unavailable.");
      }
    }
  };

  // Canvas Drawing Logic
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
      // Embed within resizable span
      const htmlSnippet = `&nbsp;<span style="display:inline-block; resize:both; overflow:hidden; border:1px solid rgba(255,255,255,0.2); padding:4px; max-width:100%; min-width:100px; min-height:100px;"><img src="${dataUrl}" style="width:100%; height:100%; pointer-events:none;" /></span>&nbsp;`;
      formatDoc('insertHTML', htmlSnippet, true);
      setDrawingMode(false);
      clearCanvas();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Rich Notes</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Format, embed, draw, and record your study notes directly.</p>
        </div>
      </div>

      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', padding: 0, borderRadius: '16px' }}>
        
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.3)', flexWrap: 'wrap', alignItems: 'center' }}>
          <select onChange={e => formatDoc('fontSize', e.target.value)} style={styles.toolbarSelect} defaultValue="3">
            <option value="1">Small</option>
            <option value="3">Normal</option>
            <option value="5">Large</option>
            <option value="7">Huge</option>
          </select>
          
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', height: '20px', margin: '0 0.5rem' }} />

          <button onClick={() => formatDoc('bold')} style={styles.toolbarBtn} title="Bold"><Bold size={18} /></button>
          <button onClick={() => formatDoc('italic')} style={styles.toolbarBtn} title="Italic"><Italic size={18} /></button>
          <button onClick={() => formatDoc('underline')} style={styles.toolbarBtn} title="Underline"><Underline size={18} /></button>
          <button onClick={insertCheckbox} style={styles.toolbarBtn} title="Checkbox"><CheckSquare size={18} /></button>
          
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', height: '20px', margin: '0 0.5rem' }} />

          <button onClick={insertLink} style={styles.toolbarBtn} title="Link"><LinkIcon size={18} /></button>
          <button onClick={insertImage} style={styles.toolbarBtn} title="Image"><ImageIcon size={18} /></button>
          <button onClick={insertVideo} style={styles.toolbarBtn} title="Video"><Video size={18} /></button>
          
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', height: '20px', margin: '0 0.5rem' }} />

          <button 
            onClick={toggleRecording} 
            style={{ ...styles.toolbarBtn, color: isRecording ? 'var(--danger-color)' : 'inherit', background: isRecording ? 'rgba(239, 68, 68, 0.15)' : 'transparent' }} 
            title="Record Audio"
          >
            <Mic size={18} /> {isRecording ? 'Stop' : ''}
          </button>

          <button 
            onClick={openDrawer}
            style={{ ...styles.toolbarBtn, background: drawingMode ? 'var(--accent-color)' : 'transparent', color: drawingMode ? '#fff' : 'inherit' }} 
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
                  <button onClick={() => {setStrokeColor('#000'); setIsEraser(false)}} style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#000', border: strokeColor==='#000' && !isEraser ? '2px solid #fff' : '2px solid transparent' }} />
                  <button onClick={() => {setStrokeColor('#3b82f6'); setIsEraser(false)}} style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#3b82f6', border: strokeColor==='#3b82f6' && !isEraser ? '2px solid #fff' : '2px solid transparent' }} />
                  <button onClick={() => {setStrokeColor('#ef4444'); setIsEraser(false)}} style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#ef4444', border: strokeColor==='#ef4444' && !isEraser ? '2px solid #fff' : '2px solid transparent' }} />
                  <button onClick={() => {setStrokeColor('#22c55e'); setIsEraser(false)}} style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#22c55e', border: strokeColor==='#22c55e' && !isEraser ? '2px solid #fff' : '2px solid transparent' }} />
                  <button onClick={() => {setStrokeColor('#eab308'); setIsEraser(false)}} style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#eab308', border: strokeColor==='#eab308' && !isEraser ? '2px solid #fff' : '2px solid transparent' }} />
                  <input type="color" value={strokeColor} onChange={e => {setStrokeColor(e.target.value); setIsEraser(false)}} style={{ width: '30px', height: '30px', border: 'none', background: 'transparent', cursor: 'pointer' }} />
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)', padding: '0 1rem', alignItems: 'center' }}>
                   <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Size:</span>
                   <button onClick={() => setStrokeWidth(2)} style={{ width: '30px', height: '30px', borderRadius: '8px', background: strokeWidth===2 ? 'rgba(255,255,255,0.1)' : 'transparent', color: '#fff' }}>S</button>
                   <button onClick={() => setStrokeWidth(6)} style={{ width: '30px', height: '30px', borderRadius: '8px', background: strokeWidth===6 ? 'rgba(255,255,255,0.1)' : 'transparent', color: '#fff' }}>M</button>
                   <button onClick={() => setStrokeWidth(12)} style={{ width: '30px', height: '30px', borderRadius: '8px', background: strokeWidth===12 ? 'rgba(255,255,255,0.1)' : 'transparent', color: '#fff' }}>L</button>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <button onClick={() => setIsEraser(true)} style={{ ...styles.toolbarBtn, background: isEraser ? 'var(--accent-color)' : 'transparent', color: isEraser ? '#fff' : 'var(--text-primary)' }} title="Eraser">
                    <Eraser size={18} />
                  </button>
                  <button onClick={clearCanvas} style={{ ...styles.toolbarBtn, color: 'var(--danger-color)' }} title="Clear Canvas">
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

const styles = {
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
