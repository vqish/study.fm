import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';

export type Message = {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
};

export type Room = {
  id: string;
  name: string;
  subject: string;
  creator: string;
  activeUsers: string[];
};

type RoomContextType = {
  rooms: Room[];
  currentRoom: Room | null;
  messages: Message[];
  createRoom: (name: string, subject: string) => void;
  joinRoom: (roomId: string) => boolean;
  leaveRoom: () => void;
  sendMessage: (text: string) => void;
  roomError: string | null;
  clearRoomError: () => void;
};

const RoomContext = createContext<RoomContextType | null>(null);

const ROOMS_KEY = 'studyfm_rooms';
const MESSAGES_KEY = 'studyfm_messages';
const CHANNEL_NAME = 'studyfm_room_sync';

const DEFAULT_ROOMS: Room[] = [
  { id: 'room_default_1', name: 'Late Night Coding', subject: 'Computer Science', creator: 'admin', activeUsers: ['admin', 'guest1'] },
  { id: 'room_default_2', name: 'Finals Prep', subject: 'Mathematics', creator: 'math_whiz', activeUsers: ['math_whiz'] },
];

function loadRooms(): Room[] {
  try {
    const stored = localStorage.getItem(ROOMS_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return DEFAULT_ROOMS;
}

function saveRooms(rooms: Room[]) {
  localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
}

function loadMessages(roomId: string): Message[] {
  try {
    const stored = localStorage.getItem(`${MESSAGES_KEY}_${roomId}`);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return [];
}

function saveMessages(roomId: string, messages: Message[]) {
  // Keep last 200 messages per room
  const trimmed = messages.slice(-200);
  localStorage.setItem(`${MESSAGES_KEY}_${roomId}`, JSON.stringify(trimmed));
}

export const RoomProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>(loadRooms);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [roomError, setRoomError] = useState<string | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Setup cross-tab sync via BroadcastChannel
  useEffect(() => {
    try {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channelRef.current = channel;

      channel.onmessage = (event) => {
        const { type, payload } = event.data;
        if (type === 'rooms_updated') {
          setRooms(payload);
        } else if (type === 'messages_updated' && currentRoom && payload.roomId === currentRoom.id) {
          setMessages(payload.messages);
        }
      };

      return () => channel.close();
    } catch {
      // BroadcastChannel not supported
    }
  }, [currentRoom]);

  const broadcast = useCallback((type: string, payload: any) => {
    try {
      channelRef.current?.postMessage({ type, payload });
    } catch { /* ignore */ }
  }, []);

  // Sync rooms to localStorage whenever they change
  useEffect(() => {
    saveRooms(rooms);
  }, [rooms]);

  const clearRoomError = () => setRoomError(null);

  const createRoom = useCallback((name: string, subject: string) => {
    if (!user) return;
    const newRoom: Room = {
      id: 'room_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
      name,
      subject,
      creator: user.displayName,
      activeUsers: [user.displayName],
    };
    const updatedRooms = [...rooms, newRoom];
    setRooms(updatedRooms);
    setCurrentRoom(newRoom);
    const welcomeMsg: Message[] = [{ id: 'sys_' + Date.now(), text: `Welcome to ${name}! Share the room link to invite others.`, sender: 'System', timestamp: Date.now() }];
    setMessages(welcomeMsg);
    saveMessages(newRoom.id, welcomeMsg);
    broadcast('rooms_updated', updatedRooms);
  }, [user, rooms, broadcast]);

  const joinRoom = useCallback((roomId: string): boolean => {
    if (!user) return false;

    // Re-read rooms from localStorage to get latest state (from other tabs/users)
    const freshRooms = loadRooms();
    const room = freshRooms.find(r => r.id === roomId);

    if (!room) {
      setRoomError(`Room not found. It may have been deleted or the link is invalid.`);
      return false;
    }

    // Add user to room if not already there
    const updatedRooms = freshRooms.map(r =>
      r.id === roomId && !r.activeUsers.includes(user.displayName)
        ? { ...r, activeUsers: [...r.activeUsers, user.displayName] }
        : r
    );
    setRooms(updatedRooms);
    saveRooms(updatedRooms);

    const updatedRoom = updatedRooms.find(r => r.id === roomId)!;
    setCurrentRoom(updatedRoom);

    // Load existing messages
    const existingMessages = loadMessages(roomId);
    const joinMsg: Message = {
      id: 'sys_' + Date.now(),
      text: `${user.displayName} joined the room.`,
      sender: 'System',
      timestamp: Date.now()
    };
    const allMessages = [...existingMessages, joinMsg];
    setMessages(allMessages);
    saveMessages(roomId, allMessages);

    broadcast('rooms_updated', updatedRooms);
    broadcast('messages_updated', { roomId, messages: allMessages });
    setRoomError(null);
    return true;
  }, [user, broadcast]);

  const leaveRoom = useCallback(() => {
    if (!user || !currentRoom) return;
    const updatedRooms = rooms.map(r =>
      r.id === currentRoom.id
        ? { ...r, activeUsers: r.activeUsers.filter(u => u !== user.displayName) }
        : r
    );
    setRooms(updatedRooms);
    saveRooms(updatedRooms);
    broadcast('rooms_updated', updatedRooms);
    setCurrentRoom(null);
    setMessages([]);
  }, [user, currentRoom, rooms, broadcast]);

  const sendMessage = useCallback((text: string) => {
    if (!user || !currentRoom) return;
    const newMsg: Message = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      text,
      sender: user.displayName,
      timestamp: Date.now(),
    };
    setMessages(prev => {
      const updated = [...prev, newMsg];
      saveMessages(currentRoom.id, updated);
      broadcast('messages_updated', { roomId: currentRoom.id, messages: updated });
      return updated;
    });
  }, [user, currentRoom, broadcast]);

  // Poll for message updates from other tabs (fallback for non-BroadcastChannel)
  useEffect(() => {
    if (!currentRoom) return;
    const interval = setInterval(() => {
      const freshMessages = loadMessages(currentRoom.id);
      if (freshMessages.length !== messages.length) {
        setMessages(freshMessages);
      }
      // Also refresh room data
      const freshRooms = loadRooms();
      const freshRoom = freshRooms.find(r => r.id === currentRoom.id);
      if (freshRoom) {
        setCurrentRoom(freshRoom);
        setRooms(freshRooms);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [currentRoom, messages.length]);

  return (
    <RoomContext.Provider value={{ rooms, currentRoom, messages, createRoom, joinRoom, leaveRoom, sendMessage, roomError, clearRoomError }}>
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) throw new Error('useRoom must be used within a RoomProvider');
  return context;
};
