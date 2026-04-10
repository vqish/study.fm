import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { db as firestore } from '../firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../utils/db';

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
  joinRoom: (roomId: string) => Promise<boolean>;
  leaveRoom: () => void;
  sendMessage: (text: string) => void;
  roomError: string | null;
  clearRoomError: () => void;
};

const RoomContext = createContext<RoomContextType | null>(null);

export const RoomProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [roomError, setRoomError] = useState<string | null>(null);

  // Subscribe to all rooms
  useEffect(() => {
    const q = query(collection(firestore, 'rooms'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomList: Room[] = [];
      snapshot.forEach((doc) => {
        roomList.push({ id: doc.id, ...doc.data() } as Room);
      });
      setRooms(roomList);
      
      // Update current room if it exists in the new list
      if (currentRoom) {
        const updated = roomList.find(r => r.id === currentRoom.id);
        if (updated) setCurrentRoom(updated);
      }
    });
    return () => unsubscribe();
  }, [currentRoom?.id]);

  // Subscribe to messages if in a room
  useEffect(() => {
    if (!currentRoom) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(firestore, `rooms/${currentRoom.id}/messages`), 
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgList: Message[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        msgList.push({ 
          id: doc.id, 
          text: data.text, 
          sender: data.sender, 
          timestamp: data.timestamp?.toMillis() || Date.now() 
        });
      });
      // Firestore desc order for performance, but we want asc for UI
      setMessages(msgList.reverse());
    });

    return () => unsubscribe();
  }, [currentRoom?.id]);

  const clearRoomError = () => setRoomError(null);

  const createRoom = async (name: string, subject: string) => {
    if (!user) return;
    try {
      const roomId = await db.createRoom({
        name,
        subject,
        creator: user.displayName,
        activeUsers: [user.displayName]
      });
      // Snapshot will trigger UI update, but let's set local state for immediate feedback
      // joinRoom will handle the specific selection
      await joinRoom(roomId);
    } catch (err) {
      setRoomError("Failed to create room. Please try again.");
    }
  };

  const joinRoom = async (roomId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const success = await db.joinRoom(roomId, user.displayName);
      if (success) {
        // Find room in our locally synced list
        const room = rooms.find(r => r.id === roomId);
        if (room) setCurrentRoom(room);
        setRoomError(null);
        return true;
      } else {
        setRoomError("Room not found or no longer available.");
        return false;
      }
    } catch (err) {
      setRoomError("Could not join room. Connection error.");
      return false;
    }
  };

  const leaveRoom = async () => {
    if (!user || !currentRoom) return;
    try {
      await db.leaveRoom(currentRoom.id, user.displayName);
      setCurrentRoom(null);
      setMessages([]);
    } catch (err) {
      console.error("Error leaving room:", err);
    }
  };

  const sendMessage = async (text: string) => {
    if (!user || !currentRoom) return;
    try {
      await db.sendMessage(currentRoom.id, {
        text,
        sender: user.displayName
      });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

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
