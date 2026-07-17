export default function SprintHealth({ sprint }) {
  const completion = sprint ? (sprint.completed_points / sprint.planned_points * 100) : 0

  return (
    <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
      <h3 className="text-lg font-semibold text-white mb-4">Sprint Health</h3>
      {sprint ? (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{Math.round(completion)}%</div>
            <div className="text-sm text-slate-400">Sprint Completion</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-slate-700 rounded">
              <div className="text-lg font-bold text-blue-400">{sprint.velocity}</div>
              <div className="text-xs text-slate-400">Velocity</div>
            </div>
            <div className="text-center p-2 bg-slate-700 rounded">
              <div className="text-lg font-bold text-green-400">{sprint.completed_points}</div>
              <div className="text-xs text-slate-400">Completed</div>
            </div>
            <div className="text-center p-2 bg-slate-700 rounded">
              <div className="text-lg font-bold text-yellow-400">{sprint.planned_points}</div>
              <div className="text-xs text-slate-400">Planned</div>
            </div>
            <div className="text-center p-2 bg-slate-700 rounded">
              <div className="text-lg font-bold text-slate-300">{sprint.number}</div>
              <div className="text-xs text-slate-400">Sprint #</div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-slate-400">No active sprint</p>
      )}
    </div>
  )
}
