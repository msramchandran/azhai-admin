with open('src/pages/AutoClickerManagement.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

find = '''          </div>
          <button 
            onClick={fetchUsers}'''

replace = '''          </div>
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

text = text.replace(find, replace)

find_end = '''          </button>
        </div>'''

replace_end = '''          </button>
          </div>
        </div>'''

text = text.replace(find_end, replace_end)

with open('src/pages/AutoClickerManagement.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
