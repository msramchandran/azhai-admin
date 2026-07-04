import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DriverManagement from './pages/DriverManagement';
import LiveMap from './pages/LiveMap';
import RideHistory from './pages/RideHistory';
import CustomerManagement from './pages/CustomerManagement';

function App() {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/drivers" element={<DriverManagement />} />
            <Route path="/map" element={<LiveMap />} />
            <Route path="/rides" element={<RideHistory />} />
            <Route path="/customers" element={<CustomerManagement />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;