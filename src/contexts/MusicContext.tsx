import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export type Track = {
  id: string;
  type: 'youtube' | 'spotify' | 'applemusic' | 'ambient';
  url: string;
  name: string;
  author: string;
};

type MusicContextType = {
  activeTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  playTrack: (track: Track) => void;
  stopMusic: () => void;
  togglePlay: () => void;
  setVolume: (v: number) => void;
  setIsPlaying: (v: boolean) => void;
  isMinimized: boolean;
  setIsMinimized: (v: boolean) => void;
};

const MusicContext = createContext<MusicContextType | null>(null);

export const MusicProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, updateSettings } = useAuth();
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMinimized, setIsMinimized] = useState(false);

  // Load last track from user settings if available
  useEffect(() => {
    if (user?.settings?.playlists?.[0]) {
       // Just as an example, we could parse the first item
       // For now, let's just keep it simple
    }
  }, [user]);

  const playTrack = (track: Track) => {
    setActiveTrack(track);
    setIsPlaying(true);
    
    // Save to user settings for persistence
    if (user) {
      const currentPlaylists = user.settings?.playlists || [];
      if (!currentPlaylists.includes(track.url)) {
        updateSettings({ playlists: [track.url, ...currentPlaylists].slice(0, 10) });
      }
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const stopMusic = () => {
    setActiveTrack(null);
    setIsPlaying(false);
  };

  return (
    <MusicContext.Provider value={{ 
      activeTrack, isPlaying, volume, playTrack, stopMusic, togglePlay,
      setVolume, setIsPlaying, isMinimized, setIsMinimized 
    }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) throw new Error('useMusic must be used within a MusicProvider');
  return context;
};
