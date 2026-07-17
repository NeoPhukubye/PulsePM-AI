import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function VelocityChart({ data }) {
  const defaultData = [
    { sprint: 'S1', velocity: 24, planned: 28 },
    { sprint: 'S2', velocity: 30, planned: 28 },
    { sprint: 'S3', velocity: 27, planned: 30 },
    { sprint: 'S4', velocity: 32, planned: 30 },
    { sprint: 'S5', velocity: 28, planned: 32 },
    { sprint: 'S6', velocity: 35, planned: 32 },
  ]

  const chartData = data || defaultData

  return (
    <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
      <h3 className="text-lg font-semibold text-white mb-4">Velocity Chart</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="sprint" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
          <Bar dataKey="planned" fill="#6366f1" radius={[4, 4, 0, 0]} name="Planned" />
          <Bar dataKey="velocity" fill="#22d3ee" radius={[4, 4, 0, 0]} name="Actual" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
