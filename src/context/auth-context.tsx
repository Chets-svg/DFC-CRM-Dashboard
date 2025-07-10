import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { auth } from '../lib/firebase';
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { toast } from 'react-hot-toast'; // or your preferred notification library

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const inactivityTimer = useRef<NodeJS.Timeout>();
  const warningTimer = useRef<NodeJS.Timeout>();

  // 10 minutes in milliseconds
  const INACTIVITY_TIMEOUT = 2 * 60 * 1000;
  // Show warning at 8 minutes (2 minutes before logout)
  const WARNING_TIME = 1 * 60 * 1000;

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setUser(null);
      clearTimeout(inactivityTimer.current);
      clearTimeout(warningTimer.current);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }, []);

  const showWarning = () => {
    toast('You will be logged out due to inactivity in 2 minutes', {
      duration: 5000,
      position: 'top-center',
      icon: '⚠️',
    });
  };

  const resetInactivityTimer = useCallback(() => {
    // Clear existing timers
    clearTimeout(inactivityTimer.current);
    clearTimeout(warningTimer.current);

    // Set warning timer (8 minutes)
    warningTimer.current = setTimeout(() => {
      showWarning();
    }, WARNING_TIME);

    // Set logout timer (10 minutes)
    inactivityTimer.current = setTimeout(() => {
      logout();
    }, INACTIVITY_TIMEOUT);
  }, [logout]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        resetInactivityTimer(); // Start timer on login
      }
    });

    // Set up event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, resetInactivityTimer);
    });

    return () => {
      unsubscribe();
      clearTimeout(inactivityTimer.current);
      clearTimeout(warningTimer.current);
      events.forEach(event => {
        window.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, [resetInactivityTimer]);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      resetInactivityTimer(); // Reset timer on successful login
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};