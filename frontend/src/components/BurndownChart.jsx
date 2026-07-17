import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

export default function BurndownChart({ data }) {
  const defaultData = [
    { day: 'Day 1', ideal: 100, actual: 100 },
    { day: 'Day 2', ideal: 86, actual: 92 },
    { day: 'Day 3', ideal: 72, actual: 85 },
    { day: 'Day 4', ideal: 58, actual: 76 },
    { day: 'Day 5', ideal: 44, actual: 68 },
    { day: 'Day 6', ideal: 30, actual: 55 },
    { day: 'Day 7', ideal: 16, actual: 42 },
    { day: 'Day 8', ideal: 0, actual: 30 },
  ]

  const chartData = data || defaultData

  return (
    <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
      <h3 className="text-lg font-semibold text-white mb-4">Burndown Chart</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
          <Line type="monotone" dataKey="ideal" stroke="#6366f1" strokeDasharray="5 5" strokeWidth={2} dot={false} name="Ideal" />
          <Line type="monotone" dataKey="actual" stroke="#22d3ee" strokeWidth={2} dot={{ fill: '#22d3ee', r: 3 }} name="Actual" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
