import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: '📊 Dashboard' },
  { to: '/projects', label: '📁 Projects' },
  { to: '/planning', label: '🏗 Planning (ForgeMind AI)' },
  { to: '/sprint-planner', label: '📅 Sprint Planner' },
  { to: '/teams', label: '👥 Teams' },
  { to: '/analytics', label: '📈 Analytics' },
  { to: '/risks', label: '⚠ Risks' },
  { to: '/standups', label: '📝 Standups' },
  { to: '/reports', label: '📄 Reports' },
  { to: '/ai-assistant', label: '🤖 AI Assistant' },
  { to: '/settings', label: '⚙ Settings' },
]

export default function Sidebar() {
  return (
    <aside className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white">🚀 Workspace</h1>
      </div>
      <nav className="flex-1 px-4">
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
              }`
            }
          >
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
