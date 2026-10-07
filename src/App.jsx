import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DriverManagement from './pages/DriverManagement';
import LiveMap from './pages/LiveMap';
import RideHistory from './pages/RideHistory';
import CustomerManagement from './pages/CustomerManagement';
import AutoClickerManagement from './pages/AutoClickerManagement';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public route — Login page */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes — Login இல்லாம access கிடையாது */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="flex">
                  <Sidebar />
                  <div className="flex-1">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/drivers" element={<DriverManagement />} />
                      <Route path="/map" element={<LiveMap />} />
                      <Route path="/rides" element={<RideHistory />} />
                      <Route path="/customers" element={<CustomerManagement />} />
                      <Route path="/auto-clicker-management" element={<AutoClickerManagement />} />
                      {/* Any unknown path → Dashboard */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

