import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  updateProfile as firebaseUpdateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db as firestore, googleProvider } from '../firebase';

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
  isInitial?: boolean; // True if it's the default 'Earth'/'General Studies'
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
        // Fetch extended profile from Firestore
        const docRef = doc(firestore, 'users', firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Guest',
            photoURL: firebaseUser.photoURL || undefined,
            country: data.country,
            major: data.major,
            totalStudyMinutes: data.studyTime || 0,
            sessions: data.sessions || 0,
            joinDate: data.joinDate || new Date().toISOString(),
            isInitial: data.country === 'Earth' || data.major === 'General Studies'
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
            isInitial: true
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
    await signInWithEmailAndPassword(auth, email, password);
    setShowAuthModal(false);
  };

  const signup = async (data: { name: string, email: string, password: string, country: string, major: string }) => {
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
      lastActive: Date.now()
    };

    await setDoc(doc(firestore, 'users', cred.user.uid), userProfile);
    setShowAuthModal(false);
  };

  const loginWithGoogle = async () => {
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
        lastActive: Date.now()
      });
    }
    setShowAuthModal(false);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const syncProfile = async (data: Partial<User>) => {
    if (auth.currentUser) {
      const docRef = doc(firestore, 'users', auth.currentUser.uid);
      const updateData: any = {};
      
      if (data.displayName) {
        await firebaseUpdateProfile(auth.currentUser, { displayName: data.displayName });
        updateData.displayName = data.displayName;
      }
      if (data.country) updateData.country = data.country;
      if (data.major) updateData.major = data.major;
      updateData.lastActive = Date.now();

      await updateDoc(docRef, updateData);
      setUser(prev => prev ? { 
        ...prev, 
        ...updateData,
        isInitial: (updateData.country || prev.country) === 'Earth' || (updateData.major || prev.major) === 'General Studies'
      } : null);
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
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, logout, syncProfile, requireAuth, showAuthModal, setShowAuthModal }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
