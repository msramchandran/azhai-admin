import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Map, History, LogOut, UserCircle, Shield, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();
  const [timeLeft, setTimeLeft] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  // Close mobile drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Show countdown timer (10 min session)
  useEffect(() => {
    const updateTimer = () => {
      const sessionTime = sessionStorage.getItem('admin_session_time');
      if (!sessionTime) return;
      const elapsed = Date.now() - parseInt(sessionTime, 10);
      const remaining = Math.max(0, 10 * 60 * 1000 - elapsed);
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/drivers', icon: Users, label: 'Driver Management' },
    { path: '/customers', icon: UserCircle, label: 'Customer Management' },
    { path: '/map', icon: Map, label: 'Live Map' },
    { path: '/rides', icon: History, label: 'Ride History' },
  ];

  const handleLogout = () => {
    if (window.confirm('Logout பண்றீங்களா?')) {
      logout();
    }
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <div className="md:hidden fixed top-3 right-3 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-gray-900 text-white rounded-lg shadow-lg hover:bg-gray-800 transition-colors border border-gray-700 flex items-center gap-1.5 text-xs font-semibold"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X size={18} /> : <Menu size={18} />}
          <span>{isOpen ? 'Close' : 'Menu'}</span>
        </button>
      </div>

      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <div className={`w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white h-screen fixed left-0 top-0 flex flex-col z-50 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">🚗</div>
          AutoRide Admin
        </h1>
        {/* Session timer */}
        {timeLeft && (
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
            <Shield size={12} className="text-blue-400" />
            <span>Session: <span className={`font-mono font-bold ${timeLeft.startsWith('0:') || timeLeft.startsWith('1:') ? 'text-red-400' : 'text-green-400'}`}>{timeLeft}</span></span>
          </div>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive(path)
                ? 'bg-primary text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-red-700/40 hover:text-red-300 rounded-lg w-full transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  </>
);
}