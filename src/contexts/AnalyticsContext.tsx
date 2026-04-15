import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { db } from '../utils/db';
import { useAuth } from './AuthContext';

type ActiveTopic = {
  id: string;
  name: string;
  subjectName: string;
};

type AnalyticsContextType = {
  activeTopic: ActiveTopic | null;
  startStudying: (topic: ActiveTopic) => void;
  stopStudying: () => Promise<void>;
  studyStats: any;
  refreshStats: () => Promise<void>;
};

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export const AnalyticsProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [activeTopic, setActiveTopic] = useState<ActiveTopic | null>(null);
  const [studyStats, setStudyStats] = useState<any>(null);
  const startTimeRef = useRef<number | null>(null);

  const refreshStats = async () => {
    if (user) {
      try {
        const sessions = await db.getUserSessions(user.uid);
        setStudyStats(sessions);
      } catch (err) {
        console.error("Failed to fetch study stats:", err);
      }
    }
  };

  // Load persistence on mount/user change
  useEffect(() => {
    if (user) {
      refreshStats();
      db.getActiveTopic(user.uid).then(data => {
        if (data && data.topic) {
          setActiveTopic(data.topic);
          startTimeRef.current = data.startTime;
        }
      });
    } else {
      setStudyStats(null);
      setActiveTopic(null);
      startTimeRef.current = null;
    }
  }, [user]);

  const startStudying = (topic: ActiveTopic) => {
    if (activeTopic) stopStudying();
    
    setActiveTopic(topic);
    startTimeRef.current = Date.now();
    if (user) {
      db.saveActiveTopic(user.uid, topic).catch(console.error);
    }
  };

  const stopStudying = async () => {
    if (activeTopic && startTimeRef.current && user) {
      const durationMs = Date.now() - startTimeRef.current;
      const minutes = Math.floor(durationMs / 60000);
      
      // Clear persistence immediately
      db.saveActiveTopic(user.uid, null).catch(console.error);

      if (durationMs > 10000) {
        try {
          await db.addSession({
            userUid: user.uid,
            topicId: activeTopic.id,
            topicName: activeTopic.name,
            subjectName: activeTopic.subjectName,
            minutes: Math.max(1, minutes)
          });
          await refreshStats();
        } catch (err) {
          console.error("Failed to save study session:", err);
        }
      }
    }
    setActiveTopic(null);
    startTimeRef.current = null;
  };

  return (
    <AnalyticsContext.Provider value={{ activeTopic, startStudying, stopStudying, studyStats, refreshStats }}>
      {children}
    </AnalyticsContext.Provider>
  );
};


export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) throw new Error('useAnalytics must be used within an AnalyticsProvider');
  return context;
};
