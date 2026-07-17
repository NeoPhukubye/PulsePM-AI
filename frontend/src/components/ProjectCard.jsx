import { Activity, TrendingUp, TrendingDown } from 'lucide-react'

export default function ProjectCard({ project }) {
  const statusConfig = {
    active: { color: 'bg-green-500', glow: 'shadow-green-500/20', text: 'text-green-400', label: 'Healthy' },
    warning: { color: 'bg-yellow-500', glow: 'shadow-yellow-500/20', text: 'text-yellow-400', label: 'Warning' },
    critical: { color: 'bg-red-500', glow: 'shadow-red-500/20', text: 'text-red-400', label: 'Critical' },
    completed: { color: 'bg-blue-500', glow: 'shadow-blue-500/20', text: 'text-blue-400', label: 'Complete' },
  }

  const config = statusConfig[project.status] || statusConfig.active
  const isHealthy = project.health_score >= 70

  return (
    <div className={`bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-slate-500 transition-all duration-200 hover:shadow-lg ${config.glow}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{project.name}</h3>
          {project.description && (
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{project.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${config.color} ${project.status === 'critical' ? 'animate-pulse' : ''}`} />
          <span className={`text-xs font-medium ${config.text}`}>{config.label}</span>
        </div>
      </div>

      {/* Completion bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm text-slate-400 mb-1.5">
          <span>Completion</span>
          <span className="font-medium text-white">{project.completion}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${
              project.completion >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-400'
              : project.completion >= 50 ? 'bg-gradient-to-r from-yellow-500 to-amber-400'
              : 'bg-gradient-to-r from-red-500 to-rose-400'
            }`}
            style={{ width: `${project.completion}%` }}
          />
        </div>
      </div>

      {/* Health & Trend */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={14} className={config.text} />
          <span className={`text-sm font-medium ${config.text}`}>{project.health_score}% health</span>
        </div>
        <div className="flex items-center gap-1">
          {isHealthy ? (
            <TrendingUp size={14} className="text-green-400" />
          ) : (
            <TrendingDown size={14} className="text-red-400" />
          )}
          <span className={`text-xs ${isHealthy ? 'text-green-400' : 'text-red-400'}`}>
            {isHealthy ? 'On track' : 'At risk'}
          </span>
        </div>
      </div>
    </div>
  )
}
