export default function Timeline({ milestones = [] }) {
  const defaultMilestones = [
    { date: 'Sprint 5', label: 'Auth Module Complete', status: 'done' },
    { date: 'Sprint 6', label: 'Dashboard MVP', status: 'in_progress' },
    { date: 'Sprint 7', label: 'API Integration', status: 'upcoming' },
    { date: 'Sprint 8', label: 'Testing & QA', status: 'upcoming' },
    { date: 'Sprint 9', label: 'Launch', status: 'upcoming' },
  ]

  const items = milestones.length > 0 ? milestones : defaultMilestones

  const statusStyles = {
    done: 'bg-green-500',
    in_progress: 'bg-blue-500 animate-pulse',
    upcoming: 'bg-slate-600',
  }

  return (
    <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
      <h3 className="text-lg font-semibold text-white mb-4">Timeline</h3>
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full ${statusStyles[item.status]}`} />
              {i < items.length - 1 && <div className="w-0.5 h-8 bg-slate-700" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{item.label}</p>
              <p className="text-xs text-slate-400">{item.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
