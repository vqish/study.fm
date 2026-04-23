import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';

import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db as firestore, googleProvider } from '../firebase';
import { db, type UserSettings } from '../utils/db';


export type User = {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  country?: string;
  major?: string;
  totalStudyMinutes: number;
  sessions: number;
  joinDate: string;
  isInitial?: boolean;
  friends: string[];
  settings?: UserSettings;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { name: string, email: string, password: string, country: string, major: string }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  syncProfile: (data: Partial<User>) => Promise<void>;
  requireAuth: (callback: () => void) => void;
  showAuthModal: boolean;
  setShowAuthModal: (v: boolean) => void;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Sync Firebase Auth with app User state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch extended profile AND settings from Firestore
        const docRef = doc(firestore, 'users', firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        const settings = await db.getUserSettings(firebaseUser.uid);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: data.displayName || firebaseUser.displayName || 'Student',
            photoURL: firebaseUser.photoURL || undefined,
            country: data.country || 'Earth',
            major: data.major || 'General Studies',
            totalStudyMinutes: data.studyTime || 0,
            sessions: data.sessions || 0,
            joinDate: data.joinDate || new Date().toISOString(),
            isInitial: !data.country || data.country === 'Earth',
            friends: data.friends || [],
            settings: settings || { playlists: [], theme: 'default', lastModified: Date.now() }
          });
        } else {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Guest',
            photoURL: firebaseUser.photoURL || undefined,
            totalStudyMinutes: 0,
            sessions: 0,
            joinDate: new Date().toISOString(),
            isInitial: true,
            friends: [],
            settings: settings || { playlists: [], theme: 'default', lastModified: Date.now() }
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setShowAuthModal(false);
    } catch (error: any) {
      console.error("Login failed:", error);
      throw error;
    }
  };


  const signup = async (data: { name: string, email: string, password: string, country: string, major: string }) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await firebaseUpdateProfile(cred.user, { displayName: data.name });

      const userProfile = {
        uid: cred.user.uid,
        email: data.email,
        displayName: data.name,
        country: data.country,
        major: data.major,
        studyTime: 0,
        sessions: 0,
        joinDate: new Date().toISOString(),
        lastActive: Date.now(),
        friends: []
      };

      await setDoc(doc(firestore, 'users', cred.user.uid), userProfile);
      // Initialize default settings
      await db.saveUserSettings(cred.user.uid, { playlists: [], theme: 'default' });
      
      setShowAuthModal(false);
    } catch (error: any) {
      console.error("Signup failed:", error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const docRef = doc(firestore, 'users', cred.user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cred.user.displayName,
          photoURL: cred.user.photoURL,
          country: 'Earth',
          major: 'General Studies',
          studyTime: 0,
          sessions: 0,
          joinDate: new Date().toISOString(),
          lastActive: Date.now(),
          friends: []
        });
        await db.saveUserSettings(cred.user.uid, { playlists: [], theme: 'default' });
      }
      setShowAuthModal(false);
    } catch (error: any) {
      console.error("Google login failed:", error);
      throw error;
    }
  };


  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error("Logout failed:", error);
    }
  };

  const syncProfile = async (data: Partial<User>) => {
    if (auth.currentUser) {
      try {
        const docRef = doc(firestore, 'users', auth.currentUser.uid);
        const updateData: any = { ...data };
        delete updateData.uid; // don't update UID
        delete updateData.settings; // handle settings separately
        
        if (data.displayName) {
          await firebaseUpdateProfile(auth.currentUser, { displayName: data.displayName });
        }
        updateData.lastActive = Date.now();

        await updateDoc(docRef, updateData);
        
        // Update local state
        setUser(prev => prev ? { ...prev, ...updateData } : null);
      } catch (error: any) {
        console.error("Profile sync failed:", error);
        throw error;
      }
    }
  };

  const updateSettings = async (settings: Partial<UserSettings>) => {
    if (user) {
      try {
        await db.saveUserSettings(user.uid, settings);
        setUser(prev => prev ? { 
          ...prev, 
          settings: { ...prev.settings!, ...settings, lastModified: Date.now() } 
        } : null);
      } catch (error: any) {
        console.error("Settings update failed:", error);
      }
    }
  };

  const requireAuth = (callback: () => void) => {
    if (user) {
      callback();
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, loading, login, signup, loginWithGoogle, logout, 
      syncProfile, updateSettings, requireAuth, showAuthModal, setShowAuthModal 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
