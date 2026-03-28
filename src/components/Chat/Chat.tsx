import React, { useState, useRef, useEffect } from 'react';
import { useRoom } from '../../contexts/RoomContext';
import { useAuth } from '../../contexts/AuthContext';
import { Send, Heart } from 'lucide-react';

export const Chat = () => {
  const { currentRoom, messages, sendMessage } = useRoom();
  const { user } = useAuth();
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!currentRoom) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
        Join a room to start chatting with other students.
      </div>
    );
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(text);
    setText('');
  };

  const sendMotivation = () => {
    sendMessage("You got this! Keep going! 🚀");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Room Chat</h3>
      </div>
      
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.75rem', 
        paddingRight: '0.5rem',
        marginBottom: '1rem',
        maxHeight: '400px'
      }}>
        {messages.map((msg) => {
          const isSystem = msg.sender === 'System';
          const isMe = msg.sender === user?.displayName;
          
          if (isSystem) {
            return (
              <div key={msg.id} style={{ textAlign: 'center', margin: '0.5rem 0' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.8rem', borderRadius: '12px' }}>
                  {msg.text}
                </span>
              </div>
            );
          }
          
          return (
            <div key={msg.id} style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: isMe ? 'flex-end' : 'flex-start' 
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', marginLeft: '0.2rem', marginRight: '0.2rem' }}>
                {isMe ? 'You' : msg.sender}
              </span>
              <div style={{ 
                background: isMe ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)', 
                color: isMe ? '#fff' : 'var(--text-primary)',
                padding: '0.75rem 1rem', 
                borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                maxWidth: '85%',
                wordBreak: 'break-word',
                fontSize: '0.95rem',
                border: isMe ? 'none' : '1px solid rgba(255,255,255,0.05)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: 'auto' }}>
        <button 
          onClick={sendMotivation} 
          style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', 
            background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', 
            border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.6rem', borderRadius: '10px',
            fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
        >
          <Heart size={14} fill="currentColor" /> Send Motivation
        </button>
        
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text" 
            placeholder="Type a message..." 
            value={text} 
            onChange={e => setText(e.target.value)}
            style={{ 
              flex: 1, padding: '0.75rem 1rem', borderRadius: '24px', 
              background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text-primary)', outline: 'none'
            }} 
          />
          <button type="submit" className="primary-btn" style={{ padding: '0.75rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '46px', height: '46px', border: 'none' }}>
            <Send size={18} style={{ marginLeft: '2px' }} />
          </button>
        </form>
      </div>
    </div>
  );
};
