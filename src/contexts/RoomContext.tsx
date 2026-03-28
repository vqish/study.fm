import { createContext, useContext, useState } from 'react';
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
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  sendMessage: (text: string) => void;
};

const RoomContext = createContext<RoomContextType | null>(null);

const MOCK_ROOMS: Room[] = [
  { id: '1', name: 'Late Night Coding', subject: 'Computer Science', creator: 'admin', activeUsers: ['admin', 'guest1'] },
  { id: '2', name: 'Finals Prep', subject: 'Mathematics', creator: 'math_whiz', activeUsers: ['math_whiz'] },
];

export const RoomProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const createRoom = (name: string, subject: string) => {
    if (!user) return;
    const newRoom: Room = {
      id: Math.random().toString(36).substring(7),
      name,
      subject,
      creator: user.displayName,
      activeUsers: [user.displayName],
    };
    setRooms([...rooms, newRoom]);
    setCurrentRoom(newRoom);
    setMessages([{ id: 'msg0', text: `Welcome to ${name}!`, sender: 'System', timestamp: Date.now() }]);
  };

  const joinRoom = (roomId: string) => {
    if (!user) return;
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      const updatedRooms = rooms.map(r => 
        r.id === roomId && !r.activeUsers.includes(user.displayName)
          ? { ...r, activeUsers: [...r.activeUsers, user.displayName] } 
          : r
      );
      setRooms(updatedRooms);
      setCurrentRoom(updatedRooms.find(r => r.id === roomId) || null);
      
      const newMsg = {
        id: Math.random().toString(36).substring(7),
        text: `${user.displayName} joined the room.`,
        sender: 'System',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, newMsg]);
    }
  };

  const leaveRoom = () => {
    if (!user || !currentRoom) return;
    const updatedRooms = rooms.map(r => 
      r.id === currentRoom.id 
        ? { ...r, activeUsers: r.activeUsers.filter(u => u !== user.displayName) }
        : r
    );
    setRooms(updatedRooms);
    setCurrentRoom(null);
    setMessages([]);
  };

  const sendMessage = (text: string) => {
    if (!user || !currentRoom) return;
    const newMsg: Message = {
      id: Math.random().toString(36).substring(7),
      text,
      sender: user.displayName,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, newMsg]);
  };

  return (
    <RoomContext.Provider value={{ rooms, currentRoom, messages, createRoom, joinRoom, leaveRoom, sendMessage }}>
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) throw new Error('useRoom must be used within a RoomProvider');
  return context;
};
