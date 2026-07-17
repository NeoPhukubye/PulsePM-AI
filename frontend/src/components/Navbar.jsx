import { Bell, Search, LogIn, UserPlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  const logout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUser(null)
    navigate('/login')
  }

  return (
    <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search projects, tasks..."
            className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <button className="relative p-2 text-slate-300 hover:text-white">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white">3</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-medium text-white">
                {user.name?.charAt(0) || 'U'}
              </div>
              <span className="text-sm text-slate-300">{user.name}</span>
              <button onClick={logout} className="text-xs text-slate-400 hover:text-white ml-2">Logout</button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-300 hover:text-white text-sm transition"
            >
              <LogIn size={16} /> Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
            >
              <UserPlus size={16} /> Register
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
