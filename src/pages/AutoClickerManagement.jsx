import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, RefreshCw, Ban, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AutoClickerManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Use your backend base URL, assuming it's configured in axios or you can hardcode the dev URL if needed.
      // Usually it's process.env.VITE_API_URL, we'll assume relative or http://43.205.135.3:3000
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

  const toggleBlock = async (driverId) => {
    try {
      await axios.post(\http://43.205.135.3:3000/api/admin/clicker-users/\ + driverId + \/toggle-block\);
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
          <RefreshCw className={\w-4 h-4 \\} />
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
                      <span className={\inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium \\}>
                        <span className={\w-2 h-2 rounded-full \\}></span>
                        {user.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg font-semibold">
                        {user.acceptedTrips}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => toggleBlock(user.id)}
                        className={\inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors \\}
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
