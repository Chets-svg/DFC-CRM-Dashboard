import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { auth } from '../lib/firebase';
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetInactivityTimer: () => void;
  inactiveTime: number;
  showTimeoutWarning: boolean;
  setShowTimeoutWarning: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  resetInactivityTimer: () => {},
  inactiveTime: 0,
  showTimeoutWarning: false,
  setShowTimeoutWarning: () => {},
});

// Timeout values in milliseconds
const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes
const WARNING_TIMEOUT = 8 * 60 * 1000; // 8 minutes (show warning at 8 minutes)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [inactiveTime, setInactiveTime] = useState(0);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const inactivityTimer = useRef<NodeJS.Timeout>();
  const warningTimer = useRef<NodeJS.Timeout>();
  const countdownInterval = useRef<NodeJS.Timeout>();
  const lastActivity = useRef(Date.now());

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setUser(null);
      clearTimeout(inactivityTimer.current);
      clearTimeout(warningTimer.current);
      clearInterval(countdownInterval.current);
      setShowTimeoutWarning(false);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }, []);

const showWarning = useCallback(() => {
  setShowTimeoutWarning(true);
  // Set the initial countdown time (2 minutes in seconds)
  setInactiveTime(Math.floor((INACTIVITY_TIMEOUT - WARNING_TIMEOUT) / 1000));
  
  // Start counting down
  countdownInterval.current = setInterval(() => {
    setInactiveTime(prev => {
      const newTime = prev - 1;
      if (newTime <= 0) {
        clearInterval(countdownInterval.current);
        logout();
        return 0;
      }
      return newTime;
    });
  }, 1000);
}, [logout]);

const resetInactivityTimer = useCallback((ignoreWarning = false) => {
  // Don't reset if warning is showing (unless explicitly told to ignore)
  if (showTimeoutWarning && !ignoreWarning) return;

  // Update last activity time
  lastActivity.current = Date.now();
  
  // Clear existing timers
  clearTimeout(inactivityTimer.current);
  clearTimeout(warningTimer.current);
  clearInterval(countdownInterval.current);
  
  // Reset the warning state if we're not ignoring it
  if (!ignoreWarning) {
    setShowTimeoutWarning(false);
    setInactiveTime(0);
  }

  // Set warning timer (8 minutes)
  warningTimer.current = setTimeout(() => {
    showWarning();
  }, WARNING_TIMEOUT);

  // Set logout timer (10 minutes)
  inactivityTimer.current = setTimeout(() => {
    logout();
  }, INACTIVITY_TIMEOUT);
}, [logout, showWarning, showWarning]);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        resetInactivityTimer(); // Start timer on login
      }
    });

    // Set up event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      window.addEventListener(event, resetInactivityTimer);
    });

    return () => {
      unsubscribe();
      clearTimeout(inactivityTimer.current);
      clearTimeout(warningTimer.current);
      clearInterval(countdownInterval.current);
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
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout,
      resetInactivityTimer,
      inactiveTime,
      showTimeoutWarning,
      setShowTimeoutWarning
    }}>
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