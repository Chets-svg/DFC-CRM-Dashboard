'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { ThemeName, themes } from '@/lib/theme';
import { useAuth } from '@/context/auth-context';
import { getUserThemePreference, saveUserThemePreference } from '@/lib/firebase-config';


type ThemeContextType = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [theme, setTheme] = useState<ThemeName>('blue-smoke');
  const [previousLightTheme, setPreviousLightTheme] = useState<ThemeName>('blue-smoke');
  const [themeLoading, setThemeLoading] = useState(true);

  // Apply theme class to HTML element
  useEffect(() => {
    document.documentElement.className = theme === 'dark' ? 'dark' : '';
  }, [theme]);

  // Load theme from Firestore when user changes
  useEffect(() => {
    const loadTheme = async () => {
      try {
        if (user?.uid) {
          const savedTheme = await getUserThemePreference(user.uid);
          console.log('Loaded theme from Firestore:', savedTheme);
          if (savedTheme) {
            setTheme(savedTheme);
            if (savedTheme !== 'dark') {
              setPreviousLightTheme(savedTheme);
            }
          }
        } else {
          // No user logged in, use default theme
          setTheme('blue-smoke');
          setPreviousLightTheme('blue-smoke');
        }
      } catch (error) {
        console.error('Error loading theme:', error);
        setTheme('blue-smoke');
        setPreviousLightTheme('blue-smoke');
      } finally {
        setThemeLoading(false);
      }
    };
    
    loadTheme();
  }, [user?.uid]);

  const handleSetTheme = async (newTheme: ThemeName) => {
    console.log('Setting theme to:', newTheme);
    setTheme(newTheme);
    if (newTheme !== 'dark') {
      setPreviousLightTheme(newTheme);
    }
    if (user?.uid) {
      try {
        await saveUserThemePreference(user.uid, newTheme);
        console.log('Theme saved to Firestore');
      } catch (error) {
        console.error('Error saving theme:', error);
        // Revert to previous theme if save fails
        setTheme(theme);
      }
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? previousLightTheme : 'dark';
    await handleSetTheme(newTheme);
  };

  if (themeLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}