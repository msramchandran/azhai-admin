import { useEffect, useState } from 'react';
import { Search, Ban, CheckCircle } from 'lucide-react';
import api from '../services/api';

export default function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/api/admin/customers');
      setCustomers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleBlock = async (customerId) => {
    if (!window.confirm("Are you sure you want to block this customer?")) return;
    try {
      await api.post(`/api/admin/customers/${customerId}/block`);
      setCustomers(customers.map(c => c.id === customerId ? { ...c, isDeleted: true } : c));
      alert('Customer blocked successfully');
    } catch (error) {
      console.error('Failed to block customer:', error);
      alert('Failed to block customer');
    }
  };

  const handleUnblock = async (customerId) => {
    if (!window.confirm("Are you sure you want to unblock this customer?")) return;
    try {
      await api.post(`/api/admin/customers/${customerId}/unblock`);
      setCustomers(customers.map(c => c.id === customerId ? { ...c, isDeleted: false } : c));
      alert('Customer unblocked successfully');
    } catch (error) {
      console.error('Failed to unblock customer:', error);
      alert('Failed to unblock customer');
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const phone = (customer.phone || '').toLowerCase();
    const name = (customer.name || '').toLowerCase();
    const referral = (customer.referralCode || '').toLowerCase();
    return phone.includes(query) || name.includes(query) || referral.includes(query);
  });

  if (loading) {
    return (
      <div className="ml-64 p-8 flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-64 p-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600">View and manage registered customers</p>
        </div>
        <div className="w-full md:w-80">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, phone, referral..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <Search size={18} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium">Total Customers</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{customers.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium">Active Customers</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {customers.filter(c => !c.isDeleted).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium">Blocked Customers</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {customers.filter(c => c.isDeleted).length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600 uppercase tracking-wider">
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Phone</th>
                <th className="p-4 font-medium">Referral Code</th>
                <th className="p-4 font-medium text-center">Trips</th>
                <th className="p-4 font-medium text-center">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No customers found
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={customer.profileImage}
                          alt={customer.name}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{customer.name}</p>
                          <p className="text-xs text-gray-500">Joined {new Date(customer.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{customer.phone}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md border border-blue-100">
                        {customer.referralCode}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-medium text-gray-900">{customer.tripCount}</span>
                    </td>
                    <td className="p-4 text-center">
                      {customer.isDeleted ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                          Blocked
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {customer.isDeleted ? (
                          <button
                            onClick={() => handleUnblock(customer.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-1 text-sm border border-transparent hover:border-green-200"
                            title="Unblock Customer"
                          >
                            <CheckCircle size={18} />
                            <span>Unblock</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBlock(customer.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 text-sm border border-transparent hover:border-red-200"
                            title="Block Customer"
                          >
                            <Ban size={18} />
                            <span>Block</span>
                          </button>
                        )}
                      </div>
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
}
