import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, refreshSession } = useAuth();

  // Refresh session timer on any user click/keypress (activity detection)
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'];
    const handleActivity = () => refreshSession();

    events.forEach(event => window.addEventListener(event, handleActivity, { passive: true }));
    return () => events.forEach(event => window.removeEventListener(event, handleActivity));
  }, [isAuthenticated, refreshSession]);

  // Show nothing while checking session on load
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <svg className="animate-spin w-10 h-10 mx-auto mb-3 text-blue-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-blue-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated → send to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
