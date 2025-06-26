import { useState, useEffect } from 'react';
import { ThemeName, themes } from '@/lib/theme';
import { useAuth } from '@/context/auth-context';
import { getUserThemePreference, saveUserThemePreference } from '@/lib/firebase-config';

export const useTheme = () => {
  const { user } = useAuth();
  const [theme, setTheme] = useState<ThemeName>('blue-smoke');
  const [previousLightTheme, setPreviousLightTheme] = useState<ThemeName>('blue-smoke');
  const [isLoading, setIsLoading] = useState(true);

  // Load theme on mount
  useEffect(() => {
    const loadTheme = async () => {
      if (user?.uid) {
        const savedTheme = await getUserThemePreference(user.uid);
        if (savedTheme) {
          setTheme(savedTheme);
          if (savedTheme !== 'dark') {
            setPreviousLightTheme(savedTheme);
          }
        }
      }
      setIsLoading(false);
    };
    loadTheme();
  }, [user?.uid]);

  const handleThemeChange = async (newTheme: ThemeName) => {
    // Update local state
    if (theme !== 'dark') {
      setPreviousLightTheme(newTheme);
    }
    setTheme(newTheme);
    
    // Save to Firebase if user is logged in
    if (user?.uid) {
      await saveUserThemePreference(user.uid, newTheme);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? previousLightTheme : 'dark';
    await handleThemeChange(newTheme);
  };

  return {
    theme,
    previousLightTheme,
    isLoading,
    setTheme: handleThemeChange,
    toggleTheme,
  };
};