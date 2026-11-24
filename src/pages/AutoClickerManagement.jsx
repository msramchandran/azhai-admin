import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ArrowLeft, RefreshCw, Ban, CheckCircle, Clock, Smartphone, AlertTriangle, Play, Search, X, ShieldOff, Download, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AutoClickerManagement = () => {
  const LIMIT = 20;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTrips, setEditingTrips] = useState(null);
  const [tripValue, setTripValue] = useState(0);
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [targetVersion, setTargetVersion] = useState('1.0.0');
  const [apkUrl, setApkUrl] = useState('');
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [savingVersion, setSavingVersion] = useState(false);

  // 📄 Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    updated: 0,
    outdated: 0,
    online: 0,
    offline: 0,
    paid: 0,
    blocked: 0
  });
  const searchDebounceRef = useRef(null);

  const navigate = useNavigate();

  const fetchVersion = async () => {
    try {
      const res = await axios.get('/api/clicker-version');
      if (res.data) {
        if (res.data.latestVersion) setTargetVersion(res.data.latestVersion);
        if (res.data.apkUrl) setApkUrl(res.data.apkUrl);
      }
    } catch (err) {
      console.error('Error fetching clicker version', err);
    }
  };

  const fetchUsers = async (page = currentPage, currentFilter = filter, search = searchQuery) => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/clicker-users', {
        params: {
          page,
          limit: LIMIT,
          status: currentFilter,
          search
        }
      });
      const data = response.data;
      if (Array.isArray(data)) {
        setUsers(data);
        setTotalCount(data.length);
        setTotalPages(Math.ceil(data.length / LIMIT) || 1);
      } else {
        setUsers(data.users || []);
        setTotalCount(data.totalCount || 0);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.currentPage || 1);
        if (data.statusCounts) {
          setStatusCounts(data.statusCounts);
        }
      }
    } catch (error) {
      console.error('Error fetching clicker users', error);
      alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, 'ALL', '');
    fetchVersion();
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    fetchUsers(newPage, filter, searchQuery);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
    fetchUsers(1, newFilter, searchQuery);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setCurrentPage(1);
      fetchUsers(1, filter, val);
    }, 400);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
    fetchUsers(1, filter, '');
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    if (currentPage >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const handleSaveVersion = async () => {
    if (!targetVersion.trim()) {
      alert('Please enter a valid version (e.g. 1.0.3)');
      return;
    }
    if (!apkUrl.trim()) {
      alert('Please enter a valid APK Download URL (GitHub Direct APK link)');
      return;
    }
    if (!window.confirm(`AutoClicker Target Version-ஐ v${targetVersion.trim()} மற்றும் APK URL-ஐ மாற்றவா? பழைய பதிப்பு வைத்திருக்கும் பயனர்களுக்கு Real-time Update Dialog தோன்றும்.`)) return;
    setSavingVersion(true);
    try {
      await axios.post('/api/admin/clicker-version', {
        versionName: targetVersion.trim(),
        apkUrl: apkUrl.trim()
      });
      alert(`✅ Target Version v${targetVersion.trim()} & APK URL வெற்றிகரமாக மாற்றப்பட்டது! அனைத்து பயனர்களுக்கும் Real-time Update Broadcast செய்யப்பட்டுள்ளது.`);
      setShowVersionModal(false);
      fetchUsers();
    } catch (err) {
      console.error('Failed to set target version', err);
      alert('Failed to update target version: ' + err.message);
    } finally {
      setSavingVersion(false);
    }
  };

  const togglePayment = async (driverId) => {
    try {
      await axios.post(`/api/admin/clicker-users/${driverId}/toggle-payment`);
      fetchUsers(currentPage, filter, searchQuery);
    } catch (error) {
      console.error('Error toggling payment', error);
      alert('Failed to update payment status');
    }
  };

  const triggerFreeTrialEnd = async (driverId) => {
    if (!window.confirm('இந்த user-க்கு Free Trial End dialog trigger பண்ணவா? Payment QR dialog தோன்றும்.')) return;
    try {
      await axios.post(`/api/admin/clicker-users/${driverId}/trigger-free-trial-end`);
      alert('✅ Free Trial End triggered! User-க்கு payment dialog show ஆகும்.');
      fetchUsers(currentPage, filter, searchQuery);
    } catch (error) {
      console.error('Error triggering free trial end', error);
      alert('Failed to trigger free trial end');
    }
  };

  const forceUpdateAll = async () => {
    if (!window.confirm('எல்லா AutoClicker users-க்கும் Force App Update dialog அனுப்பவா?')) return;
    try {
      await axios.post('/api/admin/force-update-all-clickers');
      alert('✅ Force Update broadcasted to all connected AutoClicker users!');
    } catch (error) {
      console.error('Error broadcasting force update', error);
      alert('Failed to broadcast force update');
    }
  };

  const updateTrips = async (driverId) => {
    try {
      await axios.post(`/api/admin/clicker-users/${driverId}/update-trips`, { trips: tripValue });
      setEditingTrips(null);
      fetchUsers(currentPage, filter, searchQuery);
    } catch (error) {
      console.error('Error updating trips', error);
      alert('Failed to update trips');
    }
  };

  const removeDailyLimit = async (userId, name) => {
    if (!window.confirm(`${name || 'இந்த டிரைவர்'}-க்கு 12-hour block-ஐ நீக்கவா? ஆப் உடனடியாக அன்லாக் ஆகும்.`)) return;
    try {
      await axios.post(`/api/admin/clicker-users/${userId}/remove-daily-limit`);
      alert('✅ 12-Hour Block வெற்றிகரமாக நீக்கப்பட்டது! பயனருக்கு ஆப் அன்லாக் செய்யப்பட்டு அறிவிப்பு அனுப்பப்பட்டுள்ளது.');
      fetchUsers(currentPage, filter, searchQuery);
    } catch (error) {
      console.error('Error removing daily limit', error);
      alert('12-hour block நீக்க முடியவில்லை: ' + (error.response?.data?.error || error.message));
    }
  };

  const toggleBlock = async (driverId) => {
    try {
      await axios.post(`/api/admin/clicker-users/${driverId}/toggle-block`);
      fetchUsers(currentPage, filter, searchQuery);
    } catch (error) {
      console.error('Error toggling block', error);
      alert('Failed to update block status');
    }
  };

  // 🔒 Device Binding: Driver போன் மாற்றினால் Admin reset செய்யலாம்
  const resetDeviceId = async (driverId, name) => {
    if (!window.confirm(
      `${name || 'இந்த டிரைவர்'}-ன் Device ID-ஐ reset செய்யவா?\n\n` +
      `✅ இவர் புதிய phone-ல் login செய்ய அனுமதிக்கப்படுவார்.\n` +
      `⚠️ பழைய phone binding நீக்கப்படும்.`
    )) return;

    try {
      await axios.post(`/api/admin/clicker-users/${driverId}/reset-device-id`);
      alert('✅ Device ID வெற்றிகரமாக reset செய்யப்பட்டது!\nடிரைவர் இப்போது புதிய போனில் login செய்யலாம்.');
      fetchUsers(currentPage, filter, searchQuery);
    } catch (error) {
      console.error('Error resetting device ID', error);
      alert('Device ID reset தோல்வி: ' + (error.response?.data?.error || error.message));
    }
  };

  const filteredUsers = users;

  return (
    <div className="md:ml-64 p-3 sm:p-6 min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/drivers')} 
            className="p-2 hover:bg-gray-200 bg-white shadow-sm border rounded-full transition-colors shrink-0"
            title="Back to Drivers"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">AutoClicker Users Management</h1>
            <p className="text-xs text-gray-500">Manage free trial, app versions, daily limits & block status</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* 🔍 Search Bar for Name & Mobile Number */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search Name or Mobile..."
              className="pl-9 pr-8 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm w-44 sm:w-64"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-2.5 text-gray-400 hover:text-gray-600 p-0.5"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors cursor-pointer text-xs sm:text-sm font-medium"
          >
            <option value="ALL">All Drivers ({statusCounts.all || 0})</option>
            <option value="UPDATED">Updated Drivers ({statusCounts.updated || 0})</option>
            <option value="OUTDATED">Outdated Drivers ({statusCounts.outdated || 0})</option>
            <option value="ONLINE">Online Drivers ({statusCounts.online || 0})</option>
            <option value="OFFLINE">Offline Drivers ({statusCounts.offline || 0})</option>
            <option value="PAID">Paid Drivers ({statusCounts.paid || 0})</option>
            <option value="BLOCKED">Blocked Drivers ({statusCounts.blocked || 0})</option>
          </select>
          <div className="flex items-center gap-1.5 sm:gap-2 bg-blue-50 border border-blue-200 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs">
            <Smartphone className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-semibold text-blue-900">Target: <span className="font-bold text-blue-700">v{targetVersion}</span></span>
            <button
              onClick={() => setShowVersionModal(true)}
              className="ml-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors text-[11px] shadow-sm flex items-center gap-1"
              title="Configure Target Version and GitHub Direct APK Download Link"
            >
              <Download className="w-3 h-3" />
              <span>Update APK & Version</span>
            </button>
          </div>
          <button
            onClick={() => navigate('/ad-watch-management')}
            className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-xs sm:text-sm font-medium"
            title="View AD Watch Logs"
          >
            <Play className="w-4 h-4 text-green-600 fill-green-600 shrink-0" />
            <span>AD Watch Logs</span>
          </button>
          <button
            onClick={forceUpdateAll}
            className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-xs sm:text-sm font-medium"
            title="Broadcast force update to all clicker users"
          >
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="hidden sm:inline">Force Update All</span>
            <span className="sm:hidden">Update All</span>
          </button>
          <button 
            onClick={() => fetchUsers(currentPage, filter, searchQuery)}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs sm:text-sm font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="min-w-[1100px] w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-4 font-semibold text-gray-600">Driver Name</th>
                <th className="p-4 font-semibold text-gray-600">Clicker ID</th>
                <th className="p-4 font-semibold text-gray-600 text-center">App Version</th>
                <th className="p-4 font-semibold text-gray-600">Online Status</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Accepted Trips</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Today's Limit</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Payment Status</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Device ID</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-gray-500">No AutoClicker users found</td>
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
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        user.appVersion === targetVersion
                          ? 'bg-green-100 text-green-700 border border-green-300' 
                          : 'bg-red-50 text-red-600 border border-red-200'
                      }`}>
                        <Smartphone className="w-3 h-3 mr-1" />
                        v{user.appVersion || '1.0.0'}
                        <span className="ml-1 text-[10px] font-normal">
                          {user.appVersion === targetVersion ? '(Updated)' : '(Outdated)'}
                        </span>
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                        user.isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        {user.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {editingTrips === user.id ? (
                        <div className="flex items-center gap-2 justify-center">
                          <input type="number" value={tripValue} onChange={(e) => setTripValue(Number(e.target.value))} className="w-16 p-1 border rounded text-center" />
                          <button onClick={() => updateTrips(user.id)} className="px-2 py-1 bg-green-500 text-white rounded text-xs font-medium">Save</button>
                          <button onClick={() => setEditingTrips(null)} className="px-2 py-1 bg-gray-500 text-white rounded text-xs">X</button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg font-semibold text-sm">
                            {user.acceptedTrips}
                          </span>
                          <button onClick={() => { setEditingTrips(user.id); setTripValue(user.acceptedTrips); }} className="text-blue-500 text-xs hover:underline">Edit</button>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="text-xs font-medium text-gray-800">{user.dailyTrips || 0} trips / ₹{user.dailyEarnings || 0}</div>
                      {user.isDailyLimitActive ? (
                        <div className="flex flex-col items-center gap-1.5 mt-1">
                          <span className="inline-flex items-center gap-1 text-[11px] text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" /> 12hr Block Active
                          </span>
                          <button
                            onClick={() => removeDailyLimit(user.id, user.name)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-semibold transition-colors shadow-sm cursor-pointer"
                            title="Remove 12-Hour Block for this driver"
                          >
                            Remove 12hr Block
                          </button>
                        </div>
                      ) : (
                        <span className="inline-block text-[11px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full mt-1">
                          Available
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <button
                          onClick={() => togglePayment(user.id)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                            user.hasPaidForClicker 
                              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                              : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                          }`}
                        >
                          {user.hasPaidForClicker ? 'Paid' : 'Unpaid'}
                        </button>
                        <button
                          onClick={() => triggerFreeTrialEnd(user.clickerId || user.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-[11px] font-medium transition-colors shadow-sm"
                          title="Trigger Free Trial End Payment dialog to user"
                        >
                          End Trial
                        </button>
                        {user.clickerPaymentScreenshot && (
                          <a href={`/${user.clickerPaymentScreenshot.replace(/\\/g, '/')}`} target="_blank" rel="noreferrer" className="text-[11px] text-blue-600 underline">View Receipt</a>
                        )}
                      </div>
                    </td>
                    {/* 🔒 Device ID Column */}
                    <td className="p-4 text-center">
                      {user.deviceId ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-[11px] font-semibold">
                            ✅ Synced
                          </span>
                          <span
                            className="font-mono text-[10px] text-gray-400 max-w-[110px] truncate cursor-help"
                            title={user.deviceId}
                          >
                            {user.deviceId}
                          </span>
                          <button
                            onClick={() => resetDeviceId(user.id, user.name)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200 rounded text-[10px] font-medium transition-colors mt-0.5"
                            title="Device ID reset செய்யவும் (போன் மாற்றம்)"
                          >
                            <ShieldOff className="w-3 h-3" /> Reset Device
                          </button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-500 border border-orange-200 rounded-full text-[11px] font-medium">
                          ⏳ Not Synced
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => toggleBlock(user.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          user.isBlocked 
                            ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                        }`}
                      >
                        {user.isBlocked ? (
                          <><CheckCircle className="w-4 h-4" /> Unblock</>
                        ) : (
                          <><Ban className="w-4 h-4" /> Block</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination UI ─────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50/50">
            {/* Info text */}
            <p className="text-sm text-gray-500 order-2 sm:order-1">
              Showing{' '}
              <span className="font-semibold text-gray-700">
                {users.length > 0 ? (currentPage - 1) * LIMIT + 1 : 0}
              </span>
              {' – '}
              <span className="font-semibold text-gray-700">
                {Math.min(currentPage * LIMIT, totalCount)}
              </span>
              {' of '}
              <span className="font-semibold text-gray-700">{totalCount}</span>
              {' drivers'}
            </p>

            {/* Page buttons */}
            <div className="flex items-center gap-1 order-1 sm:order-2">
              {/* Previous */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
              >
                ← Prev
              </button>

              {/* Page numbers */}
              {getPageNumbers().map((p, idx) =>
                p === '...'
                  ? <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 text-sm select-none">…</span>
                  : <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`min-w-[36px] px-2 py-1.5 text-sm border rounded-lg font-semibold transition-colors ${
                        p === currentPage
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-400'
                      }`}
                    >
                      {p}
                    </button>
              )}

              {/* Next */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🚀 Target Version & GitHub APK URL Management Modal */}
      {showVersionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">AutoClicker Version & APK Settings</h3>
                  <p className="text-blue-100 text-xs">Configure In-App Download APK and Target Version</p>
                </div>
              </div>
              <button
                onClick={() => setShowVersionModal(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Target Version (e.g. 1.0.3)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={targetVersion}
                    onChange={(e) => setTargetVersion(e.target.value)}
                    placeholder="1.0.3"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-gray-400">versionName</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  இந்த பதிப்பை விட பழைய பதிப்பு வைத்துள்ள பயனர்களுக்கு உடனடியாக Update Dialog தோன்றும்.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  GitHub Direct APK Download URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={apkUrl}
                    onChange={(e) => setApkUrl(e.target.value)}
                    placeholder="https://github.com/.../Click.assist.pro.apk"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-mono text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  {apkUrl && (
                    <a
                      href={apkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-2.5 top-2.5 text-blue-600 hover:text-blue-800 p-0.5 rounded"
                      title="Test download link in new tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  GitHub Release-ல் உள்ள direct APK download link-ஐ இங்கு இடவும். ஆப்பில் டிரைவர்கள் இந்த லிங்க் மூலமாகவே In-App டவுன்லோட் செய்வர்.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">நிகழ்நேர அறிவிப்பு (Real-time Broadcast):</span>
                  <p className="text-amber-700 mt-0.5">
                    "Set & Broadcast" கிளிக் செய்தவுடன், தற்போது ஆப்பில் இருக்கும் பழைய டிரைவர்களுக்கு உடனடியாக In-App Download பாப்-அப் தோன்றும்.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowVersionModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-xs sm:text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveVersion}
                disabled={savingVersion}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                {savingVersion ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Set & Broadcast Update</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoClickerManagement;
