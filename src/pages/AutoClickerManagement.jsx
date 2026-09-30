import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, RefreshCw, Ban, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AutoClickerManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTrips, setEditingTrips] = useState(null);
  const [tripValue, setTripValue] = useState(0);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://43.205.135.3:3000/api/admin/clicker-users');
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
  }, []);


  const togglePayment = async (driverId) => {
    try {
      await axios.post(`http://43.205.135.3:3000/api/admin/clicker-users/${driverId}/toggle-payment`);
      fetchUsers();
    } catch (error) {
      console.error('Error toggling payment', error);
      alert('Failed to update payment status');
    }
  };

  const updateTrips = async (driverId) => {
    try {
      await axios.post(`http://43.205.135.3:3000/api/admin/clicker-users/${driverId}/update-trips`, { trips: tripValue });
      setEditingTrips(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating trips', error);
      alert('Failed to update trips');
    }
  };

  const toggleBlock = async (driverId) => {
    try {
      await axios.post(`http://43.205.135.3:3000/api/admin/clicker-users/${driverId}/toggle-block`);
      fetchUsers();
    } catch (error) {
      console.error('Error toggling block', error);
      alert('Failed to update block status');
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-800">AutoClicker Users Management</h1>
        </div>
        <button 
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-4 font-semibold text-gray-600">Driver Name</th>
                <th className="p-4 font-semibold text-gray-600">Clicker ID</th>
                <th className="p-4 font-semibold text-gray-600">Status</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Accepted Trips</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Payment Status</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">No AutoClicker users found</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-gray-800">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.phone}</div>
                    </td>
                    <td className="p-4 text-gray-600">{user.clickerId}</td>
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
                          <input type="number" value={tripValue} onChange={(e) => setTripValue(Number(e.target.value))} className="w-16 p-1 border rounded" />
                          <button onClick={() => updateTrips(user.id)} className="px-2 py-1 bg-green-500 text-white rounded text-xs">Save</button>
                          <button onClick={() => setEditingTrips(null)} className="px-2 py-1 bg-gray-500 text-white rounded text-xs">X</button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg font-semibold">
                            {user.acceptedTrips}
                          </span>
                          <button onClick={() => { setEditingTrips(user.id); setTripValue(user.acceptedTrips); }} className="text-blue-500 text-xs">Edit</button>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <button
                          onClick={() => togglePayment(user.id)}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                            user.hasPaidForClicker 
                              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                              : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                          }`}
                        >
                          {user.hasPaidForClicker ? 'Paid' : 'Unpaid'}
                        </button>
                        {user.clickerPaymentScreenshot && (
                          <a href={user.clickerPaymentScreenshot} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">View Receipt</a>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => toggleBlock(user.id)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
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
