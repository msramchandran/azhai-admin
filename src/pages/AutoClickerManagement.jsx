import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, RefreshCw, Ban, CheckCircle, Clock, Smartphone, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AutoClickerManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTrips, setEditingTrips] = useState(null);
  const [tripValue, setTripValue] = useState(0);
  const [filter, setFilter] = useState('ALL');
  const [targetVersion, setTargetVersion] = useState('1.0.0');
  const [savingVersion, setSavingVersion] = useState(false);
  const navigate = useNavigate();

  const fetchVersion = async () => {
    try {
      const res = await axios.get('/api/clicker-version');
      if (res.data && res.data.latestVersion) {
        setTargetVersion(res.data.latestVersion);
      }
    } catch (err) {
      console.error('Error fetching clicker version', err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/clicker-users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching clicker users', error);
      alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchVersion();
  }, []);

  const handleSaveVersion = async () => {
    if (!targetVersion.trim()) {
      alert('Please enter a valid version (e.g. 1.0.1)');
      return;
    }
    if (!window.confirm(`AutoClicker Target Version-ஐ v${targetVersion} என மாற்றவா? பழைய பதிப்பு வைத்திருக்கும் பயனர்களுக்கு Update Dialog தோன்றும்.`)) return;
    setSavingVersion(true);
    try {
      await axios.post('/api/admin/clicker-version', {
        versionName: targetVersion.trim(),
        apkUrl: 'https://playstore-website-one.vercel.app/autoclicker.apk'
      });
      alert(`✅ Target Version v${targetVersion.trim()} என அமைக்கப்பட்டது! Vercel Download URL உடன் update broadcast செய்யப்பட்டுள்ளது.`);
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
      fetchUsers();
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
      fetchUsers();
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
      fetchUsers();
    } catch (error) {
      console.error('Error updating trips', error);
      alert('Failed to update trips');
    }
  };

  const toggleBlock = async (driverId) => {
    try {
      await axios.post(`/api/admin/clicker-users/${driverId}/toggle-block`);
      fetchUsers();
    } catch (error) {
      console.error('Error toggling block', error);
      alert('Failed to update block status');
    }
  };

  const filteredUsers = users.filter(user => {
    if (filter === 'ONLINE') return user.isOnline;
    if (filter === 'OFFLINE') return !user.isOnline;
    if (filter === 'PAID') return user.hasPaidForClicker;
    if (filter === 'BLOCKED') return user.isBlocked;
    return true; // 'ALL'
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/drivers')} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">AutoClicker Users Management</h1>
            <p className="text-xs text-gray-500">Manage free trial, app versions, daily limits & block status</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors cursor-pointer text-sm"
          >
            <option value="ALL">All Drivers</option>
            <option value="ONLINE">Online Drivers</option>
            <option value="OFFLINE">Offline Drivers</option>
            <option value="PAID">Paid Drivers</option>
            <option value="BLOCKED">Blocked Drivers</option>
          </select>
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg text-xs">
            <Smartphone className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-blue-900">Live Version:</span>
            <input
              type="text"
              value={targetVersion}
              onChange={(e) => setTargetVersion(e.target.value)}
              placeholder="1.0.0"
              className="w-16 px-2 py-0.5 border border-blue-300 rounded text-center font-bold text-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            />
            <button
              onClick={handleSaveVersion}
              disabled={savingVersion}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded font-medium transition-colors"
            >
              {savingVersion ? 'Saving...' : 'Set & Broadcast'}
            </button>
          </div>
          <button
            onClick={forceUpdateAll}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
            title="Broadcast force update to all clicker users"
          >
            <AlertTriangle className="w-4 h-4 text-red-600" />
            Force Update All
          </button>
          <button 
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-4 font-semibold text-gray-600">Driver Name</th>
                <th className="p-4 font-semibold text-gray-600">Clicker ID</th>
                <th className="p-4 font-semibold text-gray-600 text-center">App Version</th>
                <th className="p-4 font-semibold text-gray-600">Online Status</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Accepted Trips</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Today's Limit</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Payment Status</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">No AutoClicker users found</td>
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
                        <span className="inline-flex items-center gap-1 text-[11px] text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded-full mt-1">
                          <Clock className="w-3 h-3" /> 12hr Block Active
                        </span>
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
      </div>
    </div>
  );
};

export default AutoClickerManagement;
