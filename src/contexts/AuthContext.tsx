import React, { createContext, useContext, useState, useEffect } from 'react';

type User = {
  uid: string;
  email: string;
  displayName: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (name: string) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for mock session
    const storedUser = localStorage.getItem('studyfm_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string) => {
    // Mock login delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    const mockUser = {
      uid: Math.random().toString(36).substring(7),
      email,
      displayName: email.split('@')[0],
    };
    setUser(mockUser);
    localStorage.setItem('studyfm_user', JSON.stringify(mockUser));
  };

  const logout = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
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

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
