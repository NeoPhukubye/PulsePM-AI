export default function ProjectCard({ project }) {
  const statusColors = {
    active: 'bg-green-500',
    warning: 'bg-yellow-500',
    critical: 'bg-red-500',
    completed: 'bg-blue-500',
  }

  return (
    <div className="bg-slate-800 rounded-lg p-5 border border-slate-700 hover:border-slate-600 transition">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-white">{project.name}</h3>
        <span className={`px-2 py-1 rounded text-xs font-medium text-white ${statusColors[project.status] || 'bg-gray-500'}`}>
          {project.status}
        </span>
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm text-slate-400 mb-1">
            <span>Completion</span>
            <span>{project.completion}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${project.completion >= 80 ? 'bg-green-500' : project.completion >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${project.completion}%` }}
            />
          </div>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Health</span>
          <span className={`font-medium ${project.health_score >= 80 ? 'text-green-400' : project.health_score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
            {project.health_score}%
          </span>
        </div>
      </div>
    </div>
  )
}
