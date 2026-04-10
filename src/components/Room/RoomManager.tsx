import { useState, useEffect, useRef } from 'react';
import { useRoom } from '../../contexts/RoomContext';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Plus, LogOut, Video, Mic, MicOff, VideoOff, Link as LinkIcon, Check, AlertCircle, X, Loader2 } from 'lucide-react';

export const RoomManager = () => {
  const { rooms, currentRoom, joinRoom, createRoom, leaveRoom, roomError, clearRoomError } = useRoom();
  const { user, requireAuth } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomSubject, setNewRoomSubject] = useState('');
  const [copied, setCopied] = useState(false);
  const [joinLoading, setJoinLoading] = useState<string | null>(null);

  const [videoEnabled, setVideoEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Auto-join from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get('room');
    if (roomId && !currentRoom && user) {
      joinRoom(roomId);
      // Clean URL after joining
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [user]);

  useEffect(() => {
    if (!currentRoom && stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
      setVideoEnabled(false);
      setAudioEnabled(false);
    }
  }, [currentRoom, stream]);

  const toggleMedia = async (type: 'video' | 'audio') => {
    try {
      let currentStream = stream;
      if (!currentStream && (type === 'video' ? !videoEnabled : !audioEnabled)) {
         currentStream = await navigator.mediaDevices.getUserMedia({ 
           video: type === 'video' ? true : videoEnabled,
           audio: type === 'audio' ? true : audioEnabled
         });
         setStream(currentStream);
         if (videoRef.current) videoRef.current.srcObject = currentStream;
         if (type === 'video') setVideoEnabled(true);
         if (type === 'audio') setAudioEnabled(true);
         return;
      }
      if (currentStream) {
        if (type === 'video') {
          const vTrack = currentStream.getVideoTracks()[0];
          if (vTrack) { vTrack.enabled = !videoEnabled; setVideoEnabled(!videoEnabled); }
          else if (!videoEnabled) {
            const newStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: audioEnabled });
            setStream(newStream);
            if (videoRef.current) videoRef.current.srcObject = newStream;
            setVideoEnabled(true);
          }
        }
        if (type === 'audio') {
          const aTrack = currentStream.getAudioTracks()[0];
          if (aTrack) { aTrack.enabled = !audioEnabled; setAudioEnabled(!audioEnabled); }
          else if (!audioEnabled) {
            const newStream = await navigator.mediaDevices.getUserMedia({ video: videoEnabled, audio: true });
            setStream(newStream);
            if (videoRef.current) videoRef.current.srcObject = newStream;
            setAudioEnabled(true);
          }
        }
      }
    } catch {
      alert("Microphone/Camera permission denied or device not found.");
    }
  };

  const copyLink = () => {
    if (!currentRoom) return;
    const url = `${window.location.origin}${window.location.pathname}?room=${currentRoom.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName || !newRoomSubject) return;
    requireAuth(() => {
      createRoom(newRoomName, newRoomSubject);
      setIsCreating(false);
      setNewRoomName('');
      setNewRoomSubject('');
    });
  };

  const handleJoin = (roomId: string) => {
    requireAuth(async () => {
      setJoinLoading(roomId);
      try {
        const success = await joinRoom(roomId);
        if (!success) {
           // Success false but no error? maybe just didn't work.
        }
      } finally {
        setJoinLoading(null);
      }
    });
  };

  // Room Error Toast
  const ErrorToast = roomError ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', marginBottom: '1rem', animation: 'slideUp 0.3s ease' }}>
      <AlertCircle size={20} color="var(--danger-color)" />
      <span style={{ flex: 1, color: 'var(--danger-color)', fontSize: '0.9rem' }}>{roomError}</span>
      <button onClick={clearRoomError} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={16} /></button>
    </div>
  ) : null;

  if (currentRoom) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 600 }}>{currentRoom.name}</h3>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--accent-color)', background: 'rgba(187, 134, 252, 0.15)', padding: '0.25rem 0.75rem', borderRadius: '6px', fontWeight: 600 }}>
                {currentRoom.subject}
              </span>
              <button onClick={copyLink} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', padding: '0.25rem 0.5rem', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {copied ? <><Check size={14} color="var(--success-color)" /> Copied!</> : <><LinkIcon size={14} /> Share Link</>}
              </button>
            </div>
          </div>
          <button onClick={leaveRoom} className="secondary-btn" style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--danger-color)', background: 'rgba(239,68,68,0.05)' }} title="Leave Room">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><LogOut size={16} /> Leave</span>
          </button>
        </div>

        <div style={{ width: '100%', aspectRatio: '16/9', background: 'rgba(0,0,0,0.6)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', position: 'relative', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: videoEnabled ? 1 : 0, transition: 'opacity 0.3s' }} />
          {!videoEnabled && (
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <VideoOff size={48} style={{ opacity: 0.3 }} />
              <span>Camera is turned off</span>
            </div>
          )}
          <div style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '1rem', background: 'rgba(0,0,0,0.5)', padding: '0.5rem 1rem', borderRadius: '20px', backdropFilter: 'blur(10px)' }}>
            <button onClick={() => toggleMedia('audio')} style={{ background: audioEnabled ? 'rgba(255,255,255,0.1)' : 'rgba(239,68,68,0.2)', color: audioEnabled ? '#fff' : 'var(--danger-color)', border: 'none', padding: '0.75rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', transition: 'all 0.2s' }}>
              {audioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            <button onClick={() => toggleMedia('video')} style={{ background: videoEnabled ? 'rgba(255,255,255,0.1)' : 'rgba(239,68,68,0.2)', color: videoEnabled ? '#fff' : 'var(--danger-color)', border: 'none', padding: '0.75rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', transition: 'all 0.2s' }}>
              {videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
            </button>
          </div>
        </div>

        <div style={{ marginTop: '1rem', flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: 500 }}>
            <Users size={16} />
            <span>Active Participants ({currentRoom.activeUsers.length})</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {currentRoom.activeUsers.map(u => (
              <div key={u} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '24px', fontSize: '0.9rem', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success-color)' }} />
                {u}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>
      {ErrorToast}
      
      {isCreating ? (
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Start Study Room</h3>
          <input type="text" placeholder="Room Name (e.g. Finals Prep)" value={newRoomName} onChange={e => setNewRoomName(e.target.value)} style={inputStyle} required />
          <input type="text" placeholder="Subject/Topic" value={newRoomSubject} onChange={e => setNewRoomSubject(e.target.value)} style={inputStyle} required />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsCreating(false)} className="secondary-btn" style={{ flex: 1, padding: '0.75rem' }}>Cancel</button>
            <button type="submit" className="primary-btn" style={{ flex: 1, padding: '0.75rem' }}>Launch Room</button>
          </div>
        </form>
      ) : (
        <>
          {!user && (
            <div style={{ padding: '1rem', background: 'rgba(187,134,252,0.1)', border: '1px solid rgba(187,134,252,0.2)', borderRadius: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
              🔒 Sign in to create or join study rooms
            </div>
          )}
          <button onClick={() => { requireAuth(() => setIsCreating(true)); }} className="primary-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', borderRadius: '12px', boxShadow: '0 8px 24px rgba(187,134,252,0.3)' }}>
            <Plus size={20} /> Create New Room
          </button>
          
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', flex: 1 }}>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Live Study Sessions:</p>
            {rooms.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.5, border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '12px' }}>No active rooms. Start one!</div>
            ) : rooms.map(room => (
              <div key={room.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.2s', cursor: 'default' }} onMouseOver={e=>e.currentTarget.style.transform='translateX(4px)'} onMouseOut={e=>e.currentTarget.style.transform='translateX(0)'}>
                <div>
                  <h4 style={{ fontWeight: 600, margin: 0, fontSize: '1.1rem' }}>{room.name}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.4rem 0 0 0' }}>{room.subject} • {room.activeUsers.length} online</p>
                </div>
                <button 
                  onClick={() => handleJoin(room.id)} 
                  className="secondary-btn" 
                  style={{ padding: '0.6rem 1.25rem', fontSize: '0.95rem', width: '90px', display: 'flex', justifyContent: 'center' }}
                  disabled={joinLoading === room.id}
                >
                  {joinLoading === room.id ? <Loader2 size={16} style={{ animation: 'spin 1.5s linear infinite' }} /> : 'Join'}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const inputStyle = {
  padding: '0.85rem 1rem',
  borderRadius: '10px',
  background: 'rgba(0,0,0,0.3)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: 'var(--text-primary)',
  fontSize: '0.95rem'
};
