import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RoomProvider } from './contexts/RoomContext';
import { AuthScreen } from './components/Auth/AuthScreen';
import { AppLayout } from './components/Layout/AppLayout';
import type { SlideId } from './components/Layout/AppLayout';
import { Dashboard } from './components/Dashboard/Dashboard';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null; // Or a spinner
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function MainApp() {
  const [activeSlide, setActiveSlide] = useState<SlideId>('timer');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('room')) {
      setActiveSlide('rooms');
    }
  }, []);

  return (
    <RoomProvider>
      <AppLayout activeSlide={activeSlide} setActiveSlide={setActiveSlide}>
        <Dashboard activeSlide={activeSlide} setActiveSlide={setActiveSlide} />
      </AppLayout>
    </RoomProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthScreen />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <MainApp />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
