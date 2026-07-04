import { useEffect, useState } from 'react';
import { ClipboardList, CheckCircle2, XCircle, Search, Edit2 } from 'lucide-react';
import api from '../services/api';

export default function RideHistory() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingRideId, setEditingRideId] = useState(null);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const response = await api.get('/api/admin/rides');
        setRides(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch rides:', error);
        setLoading(false);
      }
    };

    fetchRides();
  }, []);

  const handleStatusChange = async (rideId, newStatus) => {
    try {
      // Optimistic update
      setRides(rides.map(r => r.id === rideId ? { ...r, status: newStatus } : r));
      setEditingRideId(null);
      await api.put(`/api/admin/rides/${rideId}/status`, { status: newStatus });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  // Filter logic: Status Filter & Search Filter combined
  const filteredRides = rides.filter((ride) => {
    // 1. Status Filter
    const normalizedStatus = ride.status === 'Completed' ? 'finished' : (ride.status === 'Cancelled' ? 'canceled' : ride.status);
    if (statusFilter !== 'All' && normalizedStatus !== statusFilter) {
      return false;
    }
    // 2. Search Query Filter
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const customer = (ride.customerName || '').toLowerCase();
    const customerPhone = (ride.customerPhone || '').toLowerCase();
    const driver = (ride.driverName || '').toLowerCase();
    const driverPhone = (ride.driverPhone || '').toLowerCase();
    const pickup = (ride.pickup || '').toLowerCase();
    const drop = (ride.drop || '').toLowerCase();
    const id = (ride.id || '').toString().toLowerCase();
    
    return (
      customer.includes(query) || 
      customerPhone.includes(query) ||
      driver.includes(query) || 
      driverPhone.includes(query) ||
      pickup.includes(query) || 
      drop.includes(query) || 
      id.includes(query)
    );
  });

  const getStatusBadge = (ride) => {
    const normalizedStatus = ride.status === 'Completed' ? 'finished' : (ride.status === 'Cancelled' ? 'canceled' : ride.status);
    const statusColors = {
      requested: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      accepted: 'bg-blue-100 text-blue-800 border-blue-200',
      started: 'bg-purple-100 text-purple-800 border-purple-200',
      finished: 'bg-green-100 text-green-800 border-green-200',
      canceled: 'bg-red-100 text-red-800 border-red-200',
      timeout: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    const statusDisplay = {
      requested: 'Requested',
      accepted: 'Accepted',
      started: 'Started',
      finished: 'Finished',
      canceled: 'Canceled',
      timeout: 'Timeout'
    };

    const colorClass = statusColors[normalizedStatus] || 'bg-gray-100 text-gray-800 border-gray-200';

    if (editingRideId === ride.id) {
      return (
        <select
          autoFocus
          value={normalizedStatus}
          onChange={(e) => handleStatusChange(ride.id, e.target.value)}
          onBlur={() => setEditingRideId(null)}
          className={`px-3 py-1 rounded-full text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none ${colorClass}`}
          style={{ textAlign: 'center' }}
        >
          <option value="requested">Requested</option>
          <option value="accepted">Accepted (On the way)</option>
          <option value="started">Started</option>
          <option value="finished">Finished</option>
          <option value="canceled">Canceled</option>
          <option value="timeout">Timeout</option>
        </select>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colorClass}`}>
          {statusDisplay[normalizedStatus] || ride.status}
        </span>
        <button 
          onClick={() => setEditingRideId(ride.id)}
          className="text-gray-400 hover:text-blue-500 transition-colors"
          title="Force update status"
        >
          <Edit2 size={14} />
        </button>
      </div>
    );
  };

  // Derive counts
  const totalCount = rides.length;
  const completedCount = rides.filter(r => r.status === 'finished' || r.status === 'Completed').length;
  const cancelledCount = rides.filter(r => r.status === 'canceled' || r.status === 'Cancelled').length;

  if (loading) {
    return (
      <div className="ml-64 p-8 flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading ride history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-64 p-8 bg-gray-50 min-h-screen">
      {/* Title Header with Search Bar */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Ride History Logs</h1>
          <p className="text-gray-600 mt-1">Audit log of all platform ride requests, completions, and cancellations</p>
        </div>
        <div className="w-full md:w-80">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by customer, driver, route..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-white shadow-sm"
            />
            <div className="absolute left-3 top-3 text-gray-400">
              <Search size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Rapido-style Interactive Metric Filter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <button
          onClick={() => setStatusFilter('All')}
          className={`p-5 rounded-xl border text-left transition-all hover:shadow-md flex items-center justify-between ${
            statusFilter === 'All'
              ? 'border-blue-500 bg-blue-50/50 shadow-sm ring-1 ring-blue-500'
              : 'border-gray-200 bg-white hover:bg-gray-50'
          }`}
        >
          <div>
            <p className="text-sm font-semibold text-gray-500">Total Rides Logged</p>
            <p className="text-3xl font-extrabold text-gray-950 mt-1">{totalCount}</p>
          </div>
          <div className={`p-3 rounded-lg ${statusFilter === 'All' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
            <ClipboardList className="w-6 h-6" />
          </div>
        </button>

        <button
          onClick={() => setStatusFilter('finished')}
          className={`p-5 rounded-xl border text-left transition-all hover:shadow-md flex items-center justify-between ${
            statusFilter === 'finished'
              ? 'border-green-500 bg-green-50/50 shadow-sm ring-1 ring-green-500'
              : 'border-gray-200 bg-white hover:bg-gray-50'
          }`}
        >
          <div>
            <p className="text-sm font-semibold text-green-600">Completed Trips</p>
            <p className="text-3xl font-extrabold text-green-950 mt-1">{completedCount}</p>
          </div>
          <div className={`p-3 rounded-lg ${statusFilter === 'finished' ? 'bg-green-500 text-white' : 'bg-gray-100 text-green-500'}`}>
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </button>

        <button
          onClick={() => setStatusFilter('canceled')}
          className={`p-5 rounded-xl border text-left transition-all hover:shadow-md flex items-center justify-between ${
            statusFilter === 'canceled'
              ? 'border-red-500 bg-red-50/50 shadow-sm ring-1 ring-red-500'
              : 'border-gray-200 bg-white hover:bg-gray-50'
          }`}
        >
          <div>
            <p className="text-sm font-semibold text-red-600">Cancelled Trips</p>
            <p className="text-3xl font-extrabold text-red-950 mt-1">{cancelledCount}</p>
          </div>
          <div className={`p-3 rounded-lg ${statusFilter === 'canceled' ? 'bg-red-500 text-white' : 'bg-gray-100 text-red-500'}`}>
            <XCircle className="w-6 h-6" />
          </div>
        </button>
      </div>

      {/* Rides Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Auto Variant</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Pickup</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Drop</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fare</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRides.map((ride) => (
                <tr key={ride.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{ride.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{ride.customerName}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{ride.driverName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{ride.autoVariant}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 line-clamp-1 max-w-[200px]" title={ride.pickup}>{ride.pickup}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 line-clamp-1 max-w-[200px]" title={ride.drop}>{ride.drop}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{ride.fare}</td>
                  <td className="px-6 py-4">{getStatusBadge(ride)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRides.length === 0 && (
          <div className="text-center py-16 bg-gray-50/50">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-700 font-semibold">No rides found</p>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or search keywords.</p>
          </div>
        )}
      </div>
    </div>
  );
}