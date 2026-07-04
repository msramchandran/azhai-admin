import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Map, History, LogOut, UserCircle } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/drivers', icon: Users, label: 'Driver Management' },
    { path: '/customers', icon: UserCircle, label: 'Customer Management' },
    { path: '/map', icon: Map, label: 'Live Map' },
    { path: '/rides', icon: History, label: 'Ride History' },
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">🚗</div>
          AutoRide Admin
        </h1>
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
        <button className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg w-full transition-colors">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}