import re

with open('src/pages/AutoClickerManagement.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add filter state
state_search = "const [tripValue, setTripValue] = useState(0);"
state_replace = "const [tripValue, setTripValue] = useState(0);\n  const [filter, setFilter] = useState('ALL');"
text = text.replace(state_search, state_replace)

# 2. Add computed filteredUsers array before return
return_search = "  return ("
computed_users = '''  const filteredUsers = users.filter(user => {
    if (filter === 'ONLINE') return user.isOnline;
    if (filter === 'OFFLINE') return !user.isOnline;
    if (filter === 'PAID') return user.hasPaidForClicker;
    if (filter === 'BLOCKED') return user.isBlocked;
    return true; // 'ALL'
  });

  return ('''
text = text.replace(return_search, computed_users)

# 3. Add dropdown UI next to Refresh button
refresh_search = '''        <div className="flex items-center justify-between mb-6">
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
            onClick={fetchUsers}'''

dropdown_ui = '''        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/drivers')} 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">AutoClicker Users Management</h1>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors cursor-pointer"
            >
              <option value="ALL">All Drivers</option>
              <option value="ONLINE">Online Drivers</option>
              <option value="OFFLINE">Offline Drivers</option>
              <option value="PAID">Paid Drivers</option>
              <option value="BLOCKED">Blocked Drivers</option>
            </select>
            <button 
              onClick={fetchUsers}'''
text = text.replace(refresh_search, dropdown_ui)

# 4. Use filteredUsers for rendering
text = text.replace('users.length === 0', 'filteredUsers.length === 0')
text = text.replace('users.map((user)', 'filteredUsers.map((user)')

with open('src/pages/AutoClickerManagement.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
