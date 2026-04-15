import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'default' | 'light' | 'rain' | 'night' | 'library' | 'calm';

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('study-fm-theme');
    return (saved as Theme) || 'default';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('study-fm-theme', newTheme);
  };

  useEffect(() => {
    // Apply the theme to the document element
    document.documentElement.setAttribute('data-theme', theme);
    
    // Add light-theme class to body if light mode is active for legacy support or body-specific styles
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
