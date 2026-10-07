import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

// SHA-256 hash of the password — plain text password is NOT stored here
const CORRECT_USERNAME = 'msramachandran';
const CORRECT_PASSWORD_HASH = 'a11884f9ff34291a4fdf2e053f680f300ea47a51a0fe77cf1449457d28de2dd0';
const SESSION_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
const SESSION_KEY = 'admin_session';
const SESSION_TIME_KEY = 'admin_session_time';

// Hash function using Web Crypto API (built-in browser API — no library needed)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState('');

  // Logout function
  const logout = useCallback((reason = '') => {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_TIME_KEY);
    setIsAuthenticated(false);
    if (reason) {
      sessionStorage.setItem('logout_reason', reason);
    }
  }, []);

  // Check if session is still valid (within 10 min)
  const isSessionValid = useCallback(() => {
    const sessionFlag = sessionStorage.getItem(SESSION_KEY);
    const sessionTime = sessionStorage.getItem(SESSION_TIME_KEY);
    if (!sessionFlag || !sessionTime) return false;
    const elapsed = Date.now() - parseInt(sessionTime, 10);
    return elapsed < SESSION_TIMEOUT_MS;
  }, []);

  // On app load — check existing session
  useEffect(() => {
    if (isSessionValid()) {
      setIsAuthenticated(true);
    } else {
      logout();
    }
    setLoading(false);
  }, [isSessionValid, logout]);

  // Auto-logout timer — checks every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      if (!isSessionValid()) {
        logout('timeout');
      }
    }, 30 * 1000); // check every 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, isSessionValid, logout]);

  // Login function
  const login = async (username, password) => {
    setLoginError('');
    try {
      const hashedInput = await hashPassword(password);
      if (
        username.trim() === CORRECT_USERNAME &&
        hashedInput === CORRECT_PASSWORD_HASH
      ) {
        sessionStorage.setItem(SESSION_KEY, 'true');
        sessionStorage.setItem(SESSION_TIME_KEY, Date.now().toString());
        sessionStorage.removeItem('logout_reason');
        setIsAuthenticated(true);
        return true;
      } else {
        setLoginError('Username அல்லது Password தவறாக உள்ளது!');
        return false;
      }
    } catch {
      setLoginError('Login பண்ண முடியவில்லை. மீண்டும் try பண்ணுங்க.');
      return false;
    }
  };

  // Refresh session timer on user activity
  const refreshSession = useCallback(() => {
    if (isAuthenticated) {
      sessionStorage.setItem(SESSION_TIME_KEY, Date.now().toString());
    }
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout, loginError, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
