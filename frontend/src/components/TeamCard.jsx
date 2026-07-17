export default function TeamCard({ team }) {
  return (
    <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-white">{team.name}</h3>
        <span className="text-sm text-slate-400">{team.member_count} members</span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Lead</span>
          <span className="text-white">{team.lead || 'Unassigned'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Velocity</span>
          <span className="text-blue-400">{team.velocity} pts/sprint</span>
        </div>
        <div>
          <div className="flex justify-between text-sm text-slate-400 mb-1">
            <span>Workload</span>
            <span>{team.workload}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${team.workload > 90 ? 'bg-red-500' : team.workload > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${team.workload}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
