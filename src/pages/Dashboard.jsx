import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  IndianRupee, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Navigation, 
  Car, 
  Search, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  Users
} from 'lucide-react';
import api from '../services/api';

const mockChartData = [
  { day: 'Mon', earnings: 5400 },
  { day: 'Tue', earnings: 3210 },
  { day: 'Wed', earnings: 2000 },
  { day: 'Thu', earnings: 2780 },
  { day: 'Fri', earnings: 1890 },
  { day: 'Sat', earnings: 2390 },
  { day: 'Sun', earnings: 3490 },
];

export default function Dashboard() {
  const [data, setData] = useState({
    totalEarnings: 0,
    completedRides: 0,
    pendingApprovals: 0,
  });
  const [liveRides, setLiveRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchDashboardData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    try {
      // Fetch both endpoints concurrently
      const [statsRes, liveRes] = await Promise.all([
        api.get('/api/admin/dashboard'),
        api.get('/api/admin/live-rides')
      ]);
      setData(statsRes.data);
      setLiveRides(liveRes.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Poll every 4 seconds for real-time Rapido-style updates
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'requested':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 animate-pulse border border-amber-300">
            <span className="w-1.5 h-1.5 bg-amber-600 rounded-full"></span>
            Searching Driver
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-ping"></span>
            Driver Assigned
          </span>
        );
      case 'started':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
            <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
            Trip Started
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const getStatusCardStyle = (status) => {
    switch (status) {
      case 'requested':
        return 'border-l-4 border-amber-500 bg-amber-50/50';
      case 'accepted':
        return 'border-l-4 border-blue-500 bg-blue-50/50';
      case 'started':
        return 'border-l-4 border-green-500 bg-green-50/50';
      default:
        return 'border-l-4 border-gray-300';
    }
  };

  // Stats derivation
  const activeCount = liveRides.length;
  const searchingCount = liveRides.filter(r => r.status === 'requested').length;
  const assignedCount = liveRides.filter(r => r.status === 'accepted').length;
  const inProgressCount = liveRides.filter(r => r.status === 'started').length;

  if (loading) {
    return (
      <div className="ml-64 p-8 flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading live dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-64 p-8 bg-gray-50 min-h-screen">
      {/* Title Header with Last Updated Indicator */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Live Operations Room</h1>
          <p className="text-gray-600 mt-1">Real-time status tracking of all active auto-rickshaw rides</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-xs text-gray-500">
          {refreshing ? (
            <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
          ) : (
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          )}
          <span>Live updates enabled • Last sync: {lastUpdated.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Main Core Platform Stats (Rapido Professional Layout) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500">Active Live Rides</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-2">{activeCount}</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Navigation className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-600">Searching Driver</p>
            <p className="text-3xl font-extrabold text-amber-700 mt-2">{searchingCount}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Search className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">Driver Assigned</p>
            <p className="text-3xl font-extrabold text-blue-700 mt-2">{assignedCount}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Car className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-green-600">Trip In Progress</p>
            <p className="text-3xl font-extrabold text-green-700 mt-2">{inProgressCount}</p>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid: Live Ride Tracking Board (Left) & General Stats Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2/3: Live Tracking Board */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                📡 Live Monitoring Board 
                <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full font-bold">
                  {liveRides.length} Active
                </span>
              </h2>
            </div>

            {liveRides.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-700 font-semibold text-base">No active rides right now</p>
                <p className="text-gray-500 text-sm mt-1">Waiting for incoming customer booking requests...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {liveRides.map((ride) => (
                  <div 
                    key={ride.id} 
                    className={`rounded-xl border border-gray-200 p-5 transition-all hover:shadow-md ${getStatusCardStyle(ride.status)}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4 border-b border-gray-100 pb-3">
                      <div>
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ride ID</span>
                        <p className="text-sm font-bold text-gray-900">{ride.id}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-bold text-primary">{ride.fare}</p>
                        {getStatusBadge(ride.status)}
                      </div>
                    </div>

                    {/* Timeline Address Flow */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-start gap-2.5">
                        <MapPin size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-xs font-medium text-gray-400 block">PICKUP LOCATION</span>
                          <p className="text-sm font-medium text-gray-800 line-clamp-1">{ride.pickup}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2.5">
                        <MapPin size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-xs font-medium text-gray-400 block">DROP LOCATION</span>
                          <p className="text-sm font-medium text-gray-800 line-clamp-1">{ride.drop}</p>
                        </div>
                      </div>
                    </div>

                    {/* Customer & Driver Info */}
                    <div className="bg-gray-50 rounded-lg p-3.5 flex flex-wrap gap-4 items-center justify-between text-sm">
                      <div>
                        <span className="text-xs text-gray-400 block">CUSTOMER</span>
                        <p className="font-semibold text-gray-800">{ride.customerName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{ride.customerPhone}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <ArrowRight className="text-gray-400 w-4 h-4 hidden sm:block" />
                        <div>
                          <span className="text-xs text-gray-400 block">ASSIGNED PARTNER</span>
                          {ride.status === 'requested' ? (
                            <p className="font-semibold text-amber-600 animate-pulse">Assigning Driver...</p>
                          ) : (
                            <>
                              <p className="font-semibold text-gray-800">{ride.driverName}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{ride.vehicleNumber}</p>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-gray-400 block">DISTANCE</span>
                        <p className="font-bold text-gray-800 mt-0.5">{ride.distance}</p>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1/3: High Level Overview & Weekly Chart */}
        <div className="space-y-6">
          {/* Earnings & Approvals Cards */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Platform Summary</h2>
            
            <div className="flex items-center gap-4 p-4 rounded-xl bg-green-50 border border-green-100">
              <div className="p-3 bg-green-500 text-white rounded-lg">
                <IndianRupee size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wider">Gross Platform Revenue</p>
                <p className="text-2xl font-extrabold text-green-900 mt-0.5">₹{data.totalEarnings.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
              <div className="p-3 bg-blue-500 text-white rounded-lg">
                <CheckCircle size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Completed Deliveries</p>
                <p className="text-2xl font-extrabold text-blue-900 mt-0.5">{data.completedRides}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-orange-50 border border-orange-100">
              <div className="p-3 bg-orange-500 text-white rounded-lg">
                <Clock size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-orange-700 uppercase tracking-wider">Pending Registrations</p>
                <p className="text-2xl font-extrabold text-orange-900 mt-0.5">{data.pendingApprovals}</p>
              </div>
            </div>
          </div>

          {/* Earnings Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Earnings History</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                    formatter={(value) => `₹${value}`}
                  />
                  <Bar dataKey="earnings" fill="#4F46E5" name="Earnings" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}