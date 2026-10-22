import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, RefreshCw, Play, CheckCircle, XCircle, Clock, Users, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdWatchManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [lastRefresh, setLastRefresh] = useState(null);
  const navigate = useNavigate();

  const fetchAdLogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/ad-watch-log');
      setUsers(response.data || []);
      setLastRefresh(new Date().toLocaleTimeString('ta-IN'));
    } catch (error) {
      console.error('Error fetching AD watch log', error);
      alert('AD watch log load ஆகவில்லை: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdLogs();
    const interval = setInterval(fetchAdLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  const totalUsers = users.length;
  const canUseCount = users.filter((u) => u.canUse).length;
  const needAdCount = users.filter((u) => !u.canUse).length;
  const neverWatchedCount = users.filter((u) => !u.lastAdWatchedAt).length;
  const totalAdWatches = users.reduce((sum, u) => sum + (u.adWatchCount || 0), 0);

  const filteredUsers = users.filter((user) => {
    if (filter === 'CAN_USE') return user.canUse;
    if (filter === 'NEED_AD') return !user.canUse;
    if (filter === 'NEVER') return !user.lastAdWatchedAt;
    if (filter === 'WATCHED_TODAY') {
      if (!user.lastAdWatchedAt) return false;
      const today = new Date().toDateString();
      return new Date(user.lastAdWatchedAt).toDateString() === today;
    }
    return true;
  });

  const formatTime = (dateStr) => {
    if (!dateStr) return 'Never';
    const d = new Date(dateStr);
    return d.toLocaleString('ta-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatMinutesAgo = (minutes) => {
    if (minutes === null || minutes === undefined) return 'Never';
    if (minutes < 1) return 'இப்போதுதான்';
    if (minutes < 60) return `${minutes} நிமிடம் முன்`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours < 24) return `${hours} மணி ${mins} நிமிடம் முன்`;
    const days = Math.floor(hours / 24);
    return `${days} நாள் முன்`;
  };

  return (
    <div className="md:ml-64 p-3 sm:p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/auto-clicker-management')}
            className="p-2 hover:bg-gray-200 bg-white shadow-sm border rounded-full transition-colors shrink-0"
            title="Back to AutoClicker Management"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Play className="w-6 h-6 text-green-600 fill-green-600" />
              AD Watch Management
            </h1>
            <p className="text-xs text-gray-500">
              Rewarded AD பார்த்த பயனர்கள் (AutoClicker 6-Hour Pass Tracking)
              {lastRefresh && <span className="ml-2 text-blue-500">Last refresh: {lastRefresh}</span>}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-xs sm:text-sm font-medium cursor-pointer"
          >
            <option value="ALL">All Drivers ({totalUsers})</option>
            <option value="CAN_USE">✅ Valid Pass ({canUseCount})</option>
            <option value="NEED_AD">⚠️ Need AD ({needAdCount})</option>
            <option value="NEVER">🚫 Never Watched ({neverWatchedCount})</option>
            <option value="WATCHED_TODAY">📅 Watched Today</option>
          </select>
          <button
            onClick={fetchAdLogs}
            className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-xs sm:text-sm font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Drivers</p>
              <p className="text-2xl font-bold text-gray-800">{totalUsers}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500 opacity-60" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">✅ 6hr Pass Valid</p>
              <p className="text-2xl font-bold text-green-600">{canUseCount}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500 opacity-60" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">⚠️ AD Required (Expired)</p>
              <p className="text-2xl font-bold text-orange-500">{needAdCount}</p>
            </div>
            <XCircle className="w-8 h-8 text-orange-500 opacity-60" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total AD Impressions</p>
              <p className="text-2xl font-bold text-purple-600">{totalAdWatches}</p>
            </div>
            <Eye className="w-8 h-8 text-purple-500 opacity-60" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="min-w-[800px] w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-4 font-semibold text-gray-600">Driver</th>
                <th className="p-4 font-semibold text-gray-600">Clicker ID</th>
                <th className="p-4 font-semibold text-gray-600 text-center">AD Watch Count</th>
                <th className="p-4 font-semibold text-gray-600">Last AD Watched</th>
                <th className="p-4 font-semibold text-gray-600">When</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Can Use AutoClicker?</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Validity Remaining</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-green-500" />
                    Loading AD watch logs...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">
                    No drivers found for selected filter
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-gray-800">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.phone}</div>
                    </td>
                    <td className="p-4 text-gray-600 font-mono text-sm">{user.clickerId}</td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                        <Eye className="w-3 h-3" />
                        {user.adWatchCount || 0}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {user.lastAdWatchedAt ? (
                        formatTime(user.lastAdWatchedAt)
                      ) : (
                        <span className="text-red-400 font-medium">Never watched</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {formatMinutesAgo(user.minutesAgo)}
                    </td>
                    <td className="p-4 text-center">
                      {user.canUse ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                          <CheckCircle className="w-3 h-3" />
                          Yes (Active)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-semibold">
                          <XCircle className="w-3 h-3" />
                          No (AD Required)
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {user.canUse && user.hoursRemaining > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded text-xs font-semibold">
                          <Clock className="w-3 h-3" />
                          {user.hoursRemaining}h remaining
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-600 border border-orange-200 rounded text-xs font-semibold">
                          <Clock className="w-3 h-3" />
                          Expired / Needs AD
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdWatchManagement;
