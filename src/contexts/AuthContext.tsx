import React, { createContext, useContext, useState, useEffect } from 'react';

export type User = {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (name: string) => void;
  requireAuth: (callback: () => void) => void;
  showAuthModal: boolean;
  setShowAuthModal: (v: boolean) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('studyfm_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch { /* ignore corrupt data */ }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, _password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const mockUser: User = {
      uid: 'u_' + Math.random().toString(36).substring(2, 10),
      email,
      displayName: email.split('@')[0],
    };
    setUser(mockUser);
    localStorage.setItem('studyfm_user', JSON.stringify(mockUser));
    setShowAuthModal(false);
  };

  const loginWithGoogle = async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    // Mock Google login — generates a realistic-looking profile
    const names = ['Alex Chen', 'Jordan Lee', 'Sam Patel', 'Riley Kim', 'Morgan Yu'];
    const name = names[Math.floor(Math.random() * names.length)];
    const mockUser: User = {
      uid: 'g_' + Math.random().toString(36).substring(2, 10),
      email: name.toLowerCase().replace(' ', '.') + '@gmail.com',
      displayName: name,
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    };
    setUser(mockUser);
    localStorage.setItem('studyfm_user', JSON.stringify(mockUser));
    setShowAuthModal(false);
  };

  const logout = async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    setUser(null);
    localStorage.removeItem('studyfm_user');
  };

  const updateProfile = (name: string) => {
    if (user) {
      const updatedUser = { ...user, displayName: name };
      setUser(updatedUser);
      localStorage.setItem('studyfm_user', JSON.stringify(updatedUser));
    }
  };

  // Gate function: calls callback if logged in, shows auth modal if not
  const requireAuth = (callback: () => void) => {
    if (user) {
      callback();
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, logout, updateProfile, requireAuth, showAuthModal, setShowAuthModal }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
