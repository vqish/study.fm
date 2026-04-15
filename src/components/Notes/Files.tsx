import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Download, Eye, Trash2, X, Search, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { saveFile, getAllFiles, deleteFile, downloadFile, formatFileSize, type StoredFile } from '../../utils/fileStorage';

export const Files = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<StoredFile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadFiles = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getAllFiles(user.uid);
      setFiles(data.sort((a, b) => b.uploadDate - a.uploadDate));
    } catch (err) {
      console.error("Load files failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [user]);

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
      alert("Upload failed. Ensure Firebase Storage is configured correctly.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (f: StoredFile) => {
    if (!user || !confirm('Delete file permanently?')) return;
    await deleteFile(f, user.uid);
    await loadFiles();
    if (previewFile?.id === f.id) setPreviewFile(null);
  };

  const filtered = files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', gap: '1.5rem', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div>
           <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>My Storage</h2>
           <p style={{ color: 'var(--text-secondary)' }}>Manage your documents and study materials.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
           <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Search files..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={styles.searchBar}
              />
           </div>
           <label style={styles.uploadBtn}>
              <Upload size={18} /> {isUploading ? 'Uploading...' : 'Upload'}
              <input ref={fileInputRef} type="file" multiple onChange={handleUpload} style={{ display: 'none' }} />
           </label>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
             <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} color="var(--accent-color)" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={styles.empty}>
             <FileText size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
             <p>{searchQuery ? 'No matching files found.' : 'Your cloud drive is empty.'}</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {filtered.map(f => (
              <div 
                key={f.id} 
                className="glass-panel hover-grow" 
                style={styles.fileCard}
                onClick={() => {
                   if (f.type === 'application/x-studyfm-note') {
                      window.dispatchEvent(new CustomEvent('open-note', { detail: { id: f.id } }));
                   }
                }}
              >
                 <div style={styles.iconBox}>
                    {f.type.startsWith('image/') ? (
                      <img src={f.url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                    ) : f.type === 'application/x-studyfm-note' ? (
                      <FileText size={24} color="#03DAC6" />
                    ) : (
                      <FileText size={24} color="var(--accent-color)" />
                    )}
                 </div>
                 <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {f.type === 'application/x-studyfm-note' ? 'Note' : formatFileSize(f.size)} • {new Date(f.uploadDate).toLocaleDateString()}
                    </p>
                 </div>
                 <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {f.type !== 'application/x-studyfm-note' && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); setPreviewFile(f); }} style={styles.actionBtn} title="View"><Eye size={16} /></button>
                        <button onClick={(e) => { e.stopPropagation(); downloadFile(f); }} style={styles.actionBtn} title="Download"><Download size={16} /></button>
                      </>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(f); }} style={{ ...styles.actionBtn, color: 'var(--danger-color)' }} title="Delete"><Trash2 size={16} /></button>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {previewFile && (
        <div style={styles.modal}>
           <div style={styles.modalHeader}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>{previewFile.name}</h3>
              <button onClick={() => setPreviewFile(null)} style={styles.closeBtn}><X size={20} /></button>
           </div>
           <div style={styles.modalContent}>
              {previewFile.type.startsWith('image/') ? (
                 <img src={previewFile.url} alt={previewFile.name} style={{ maxWidth: '100%', maxHeight: '75vh', borderRadius: '12px' }} />
              ) : previewFile.type === 'application/pdf' ? (
                 <iframe src={previewFile.url} style={{ width: '100%', height: '70vh', border: 'none', borderRadius: '12px', background: '#fff' }} />
              ) : (
                 <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <FileText size={64} color="var(--accent-color)" />
                    <p style={{ marginTop: '1rem' }}>Preview not available for this file type.</p>
                    <button className="primary-btn" onClick={() => downloadFile(previewFile)} style={{ marginTop: '1rem' }}>Download File</button>
                 </div>
              )}
           </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const styles = {
  searchBar: { background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.65rem 1rem 0.65rem 2.5rem', color: '#fff', fontSize: '0.9rem', outline: 'none', width: '240px' },
  uploadBtn: { display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 1.25rem', borderRadius: '12px', background: 'var(--accent-color)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', alignContent: 'flex-start' },
  fileCard: { padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' },
  iconBox: { width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' },
  actionBtn: { background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-secondary)', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  empty: { textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)' },
  modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', zIndex: 5000, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '2rem' },
  modalHeader: { width: '100%', maxWidth: '900px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  closeBtn: { background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' },
  modalContent: { width: '100%', maxWidth: '900px', display: 'flex', justifyContent: 'center' }
};
