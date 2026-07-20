import { useEffect, useState, useRef } from 'react';
import { Search, Ban, CheckCircle, Ticket, Send, ChevronDown, ChevronUp, RefreshCw, X, MapPin } from 'lucide-react';
import api from '../services/api';

// ─── Status helpers ──────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  open:        { label: 'Open',        color: 'bg-red-100 text-red-700 border-red-200' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  resolved:    { label: 'Resolved',    color: 'bg-green-100 text-green-700 border-green-200' },
  closed:      { label: 'Closed',      color: 'bg-gray-100 text-gray-600 border-gray-200' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.open;
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
};

// ─── Ticket Card Component ────────────────────────────────────────────────────
function TicketCard({ ticket, onStatusChange, onSendReply }) {
  const [expanded, setExpanded] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [localStatus, setLocalStatus] = useState(ticket.status);
  const textareaRef = useRef(null);

  const handleSend = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    await onSendReply(ticket.ticketId, replyText.trim(), localStatus);
    setReplyText('');
    setSending(false);
  };

  const handleStatusChange = async (newStatus) => {
    setLocalStatus(newStatus);
    await onStatusChange(ticket.ticketId, newStatus);
  };

  const createdAt = ticket.createdAt
    ? new Date(ticket.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'N/A';

  return (
    <div className={`bg-white rounded-xl border ${expanded ? 'border-blue-300 shadow-md' : 'border-gray-200'} overflow-hidden transition-all duration-200`}>
      {/* Header */}
      <button
        className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <StatusBadge status={localStatus} />
              {ticket.adminReplies?.length > 0 && (
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full border border-blue-200 font-medium">
                  💬 {ticket.adminReplies.length} {ticket.adminReplies.length === 1 ? 'reply' : 'replies'}
                </span>
              )}
              <span className="text-xs text-gray-400">{createdAt}</span>
            </div>
            <p className="font-semibold text-gray-900 truncate">{ticket.subReason}</p>
            <p className="text-sm text-gray-500 mt-0.5">
              <span className="font-medium text-gray-700">{ticket.customerName}</span>
              {ticket.customerPhone && <span className="ml-1.5 text-gray-400">· {ticket.customerPhone}</span>}
              <span className="ml-1.5 text-gray-400">· {ticket.category}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-gray-400 hidden sm:block font-mono">{ticket.ticketId}</span>
            {expanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
          </div>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-gray-100 p-4 space-y-4 bg-gray-50">
          {/* Ticket details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ticket.description && (
              <div className="bg-white rounded-lg p-3 border border-gray-200 sm:col-span-2">
                <p className="text-xs text-gray-400 font-medium mb-1">Customer Description</p>
                <p className="text-sm text-gray-700">{ticket.description}</p>
              </div>
            )}
            {ticket.rideDetails?.pickup && (
              <div className="bg-white rounded-lg p-3 border border-gray-200 sm:col-span-2">
                <p className="text-xs text-gray-400 font-medium mb-3">🚗 Linked Trip Details</p>

                {/* Route */}
                <div className="space-y-1 mb-3">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0"></div>
                    <p className="text-sm text-gray-700 truncate">{ticket.rideDetails.pickup}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                    <p className="text-sm text-gray-700 truncate">{ticket.rideDetails.drop}</p>
                  </div>
                </div>

                {/* Trip meta — fare + date */}
                <div className="flex gap-2 flex-wrap mb-3">
                  {ticket.rideDetails.fare && (
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded font-semibold border border-green-200">
                      💰 {ticket.rideDetails.fare}
                    </span>
                  )}
                  {ticket.rideDetails.date && (
                    <span className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded border border-gray-200">
                      📅 {ticket.rideDetails.date}
                    </span>
                  )}
                </div>

                {/* Driver Details Card */}
                {(ticket.rideDetails.driverName || ticket.rideDetails.vehicleNumber || ticket.rideDetails.driverPhone) && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-orange-700 mb-2">👤 Driver Details</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {ticket.rideDetails.driverName && (
                        <div className="flex items-center gap-2">
                          <span className="text-orange-400">🪪</span>
                          <div>
                            <p className="text-xs text-gray-400">Name</p>
                            <p className="text-sm font-semibold text-gray-800">{ticket.rideDetails.driverName}</p>
                          </div>
                        </div>
                      )}
                      {ticket.rideDetails.vehicleNumber && (
                        <div className="flex items-center gap-2">
                          <span className="text-orange-400">🏍️</span>
                          <div>
                            <p className="text-xs text-gray-400">Vehicle No.</p>
                            <p className="text-sm font-semibold text-gray-800 font-mono">{ticket.rideDetails.vehicleNumber}</p>
                          </div>
                        </div>
                      )}
                      {ticket.rideDetails.driverPhone && (
                        <div className="flex items-center gap-2">
                          <span className="text-orange-400">📞</span>
                          <div>
                            <p className="text-xs text-gray-400">Mobile</p>
                            <a
                              href={`tel:${ticket.rideDetails.driverPhone}`}
                              className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {ticket.rideDetails.driverPhone}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Status update */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 shrink-0">Update Status:</label>
            <select
              value={localStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="open">🔴 Open</option>
              <option value="in_progress">🟡 In Progress</option>
              <option value="resolved">🟢 Resolved</option>
              <option value="closed">⚫ Closed</option>
            </select>
          </div>

          {/* Admin replies history */}
          {ticket.adminReplies?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Previous Replies</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {ticket.adminReplies.map((reply, idx) => {
                  const sentAt = reply.sentAt
                    ? new Date(reply.sentAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                    : '';
                  return (
                    <div key={idx} className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-blue-700">👤 {reply.adminName || 'Admin'}</span>
                        <span className="text-xs text-gray-400">{sentAt}</span>
                      </div>
                      <p className="text-sm text-gray-800">{reply.message}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Send reply */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Send Message to Customer</p>
            <div className="flex gap-2">
              <textarea
                ref={textareaRef}
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) handleSend(); }}
                placeholder="Type your reply here... (Ctrl+Enter to send)"
                className="flex-1 text-sm border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900 bg-white"
              />
              <button
                onClick={handleSend}
                disabled={sending || !replyText.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex flex-col items-center gap-1 shrink-0"
                title="Send Reply (Ctrl+Enter)"
              >
                {sending ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Send size={16} />
                )}
                <span className="text-xs">{sending ? '...' : 'Send'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Support Tickets Tab ─────────────────────────────────────────────────────
function SupportTicketsTab() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, in_progress: 0, resolved: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTickets = async () => {
    try {
      const params = filterStatus ? `?status=${filterStatus}` : '';
      const [ticketsRes, statsRes] = await Promise.all([
        api.get(`/api/admin/support-tickets${params}`),
        api.get('/api/admin/support-tickets/stats'),
      ]);
      setTickets(ticketsRes.data.tickets || []);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchTickets, 30000);
    return () => clearInterval(interval);
  }, [filterStatus]);

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await api.patch(`/api/admin/support-tickets/${ticketId}/status`, { status: newStatus });
      setTickets(prev => prev.map(t => t.ticketId === ticketId ? { ...t, status: newStatus } : t));
      // Refresh stats
      const statsRes = await api.get('/api/admin/support-tickets/stats');
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to update ticket status:', err);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleSendReply = async (ticketId, message, status) => {
    try {
      const res = await api.post(`/api/admin/support-tickets/${ticketId}/reply`, {
        message,
        adminName: 'Admin',
        status,
      });
      // Update ticket in state with new reply
      const updatedTicket = res.data.ticket;
      setTickets(prev => prev.map(t => t.ticketId === ticketId ? updatedTicket : t));
    } catch (err) {
      console.error('Failed to send reply:', err);
      alert('Failed to send message. Please try again.');
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      ticket.customerName?.toLowerCase().includes(q) ||
      ticket.customerPhone?.toLowerCase().includes(q) ||
      ticket.subReason?.toLowerCase().includes(q) ||
      ticket.category?.toLowerCase().includes(q) ||
      ticket.ticketId?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'text-gray-900' },
          { label: 'Open', value: stats.open, color: 'text-red-600' },
          { label: 'In Progress', value: stats.in_progress, color: 'text-yellow-600' },
          { label: 'Resolved', value: stats.resolved, color: 'text-green-600' },
          { label: 'Closed', value: stats.closed, color: 'text-gray-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-500 text-xs font-medium">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by name, phone, issue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 bg-white"
          />
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setLoading(true); }}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
        >
          <option value="">All Status</option>
          <option value="open">🔴 Open</option>
          <option value="in_progress">🟡 In Progress</option>
          <option value="resolved">🟢 Resolved</option>
          <option value="closed">⚫ Closed</option>
        </select>
        <button
          onClick={() => { setLoading(true); fetchTickets(); }}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Ticket list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Ticket size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No tickets found</p>
          <p className="text-gray-400 text-sm mt-1">
            {filterStatus ? 'Try changing the filter' : 'No support tickets raised yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map(ticket => (
            <TicketCard
              key={ticket.ticketId}
              ticket={ticket}
              onStatusChange={handleStatusChange}
              onSendReply={handleSendReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main CustomerManagement Component ───────────────────────────────────────
export default function CustomerManagement() {
  const [activeTab, setActiveTab] = useState('customers');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Trip history modal state
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedCustomerHistory, setSelectedCustomerHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/api/admin/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleBlock = async (customerId) => {
    if (!window.confirm('Are you sure you want to block this customer?')) return;
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
    if (!window.confirm('Are you sure you want to unblock this customer?')) return;
    try {
      await api.post(`/api/admin/customers/${customerId}/unblock`);
      setCustomers(customers.map(c => c.id === customerId ? { ...c, isDeleted: false } : c));
      alert('Customer unblocked successfully');
    } catch (error) {
      console.error('Failed to unblock customer:', error);
      alert('Failed to unblock customer');
    }
  };

  const handleTripHistoryClick = async (customerId, customerName) => {
    setHistoryModalOpen(true);
    setHistoryLoading(true);
    setSelectedCustomerHistory({ name: customerName, trips: [] });
    try {
      const res = await api.get(`/customer/${customerId}/history`);
      setSelectedCustomerHistory({ name: customerName, trips: res.data.tripHistory || [] });
    } catch (err) {
      console.error('Failed to fetch history:', err);
      alert('Failed to load history');
      setHistoryModalOpen(false);
    } finally {
      setHistoryLoading(false);
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

  return (
    <div className="ml-64 p-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
        <p className="text-gray-600 mt-1">Manage customers and support tickets</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit mb-6">
        <button
          onClick={() => setActiveTab('customers')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === 'customers'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <CheckCircle size={16} />
          Customers
          <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${activeTab === 'customers' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'}`}>
            {customers.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('tickets')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === 'tickets'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Ticket size={16} />
          Support Tickets
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'customers' ? (
        <>
          {/* Customer stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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

          {/* Search */}
          <div className="mb-4 flex justify-end">
            <div className="relative w-full md:w-80">
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

          {/* Customer table */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
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
                            <button
                              onClick={() => handleTripHistoryClick(customer.id, customer.name)}
                              className="font-medium text-blue-600 hover:text-blue-800 hover:underline px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                              title="View Trip History"
                            >
                              {customer.tripCount}
                            </button>
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
          )}
        </>
      ) : (
        <SupportTicketsTab />
      )}

      {/* Trip History Modal */}
      {historyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Trip History
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedCustomerHistory?.name || 'Customer'}
                </p>
              </div>
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 bg-gray-50">
              {historyLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : selectedCustomerHistory?.trips?.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No completed trips found for this customer.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedCustomerHistory?.trips.map((trip, idx) => (
                    <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative">
                      <div className="absolute top-4 right-4 text-right">
                        <p className="text-sm font-bold text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200 inline-block">
                          {trip.fare}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {trip.completedAt ? new Date(trip.completedAt).toLocaleDateString() : ''}
                        </p>
                      </div>

                      <div className="pr-20">
                        <div className="flex items-start gap-3 mb-3">
                          <MapPin size={16} className="text-gray-400 mt-0.5" />
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs text-gray-400">Pickup</p>
                              <p className="text-sm text-gray-800 line-clamp-1">{trip.pickup}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Drop</p>
                              <p className="text-sm text-gray-800 line-clamp-1">{trip.drop}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 pt-3 border-t border-gray-100 mt-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                              {trip.autoType || 'Auto'}
                            </span>
                            <span className="text-xs text-gray-500 font-medium">
                              {trip.distance}
                            </span>
                          </div>
                          {(trip.driverName || trip.vehicleNumber) && (
                            <div className="text-xs text-gray-500 flex items-center gap-1.5 border-l border-gray-200 pl-4">
                              <span>👤 {trip.driverName}</span>
                              <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                                {trip.vehicleNumber}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
