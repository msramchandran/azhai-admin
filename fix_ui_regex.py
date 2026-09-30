import re

with open('src/pages/AutoClickerManagement.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

pattern = r'(<h1.*?AutoClicker Users Management</h1>\s*</div>)\s*<button\s*onClick=\{fetchUsers\}'

replace = r'''\1
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

text = re.sub(pattern, replace, text, flags=re.DOTALL)

pattern_end = r'(<RefreshCw.*?>\s*Refresh\s*</button>)\s*</div>\s*<div className="bg-white'
replace_end = r'''\1
          </div>
        </div>
        <div className="bg-white'''

text = re.sub(pattern_end, replace_end, text, flags=re.DOTALL)

with open('src/pages/AutoClickerManagement.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
