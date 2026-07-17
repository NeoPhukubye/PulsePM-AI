import { useState } from 'react'
import BurndownChart from '../components/BurndownChart'
import VelocityChart from '../components/VelocityChart'
import SprintHealth from '../components/SprintHealth'
import Timeline from '../components/Timeline'
import { TrendingUp, Target, Zap, Clock } from 'lucide-react'

export default function Analytics() {
  const [selectedProject] = useState('all')

  const metrics = [
    { label: 'Avg Velocity', value: '34 pts', change: '+8%', icon: Zap, color: 'text-blue-400' },
    { label: 'Sprint Completion', value: '78%', change: '+5%', icon: Target, color: 'text-green-400' },
    { label: 'Delivery Accuracy', value: '85%', change: '+3%', icon: TrendingUp, color: 'text-purple-400' },
    { label: 'Avg Cycle Time', value: '4.2 days', change: '-12%', icon: Clock, color: 'text-cyan-400' },
  ]

  const sprint = { velocity: 35, completed_points: 22, planned_points: 32, number: 7 }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics</h2>
          <p className="text-sm text-slate-400">Performance insights across all projects</p>
        </div>
        <select className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-2">
          <option value="all">All Projects</option>
          <option value="1">Project Alpha</option>
          <option value="2">Project Beta</option>
          <option value="3">Project Gamma</option>
          <option value="4">Project Delta</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <m.icon size={20} className={m.color} />
              <span className={`text-xs px-2 py-0.5 rounded-full ${m.change.startsWith('+') ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                {m.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">{m.value}</p>
            <p className="text-xs text-slate-400 mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VelocityChart />
        <BurndownChart />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SprintHealth sprint={sprint} />
        <Timeline />
        {/* Risk Heatmap */}
        <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Risk Heatmap</h3>
          <div className="grid grid-cols-5 gap-1">
            {[
              { project: 'Alpha', categories: [15, 10, 5, 20, 8] },
              { project: 'Beta', categories: [30, 25, 15, 10, 40] },
              { project: 'Gamma', categories: [80, 90, 75, 60, 85] },
              { project: 'Delta', categories: [20, 15, 10, 25, 12] },
              { project: 'Zeta', categories: [45, 55, 35, 40, 60] },
            ].map((row, i) => (
              row.categories.map((val, j) => {
                const color = val >= 70 ? 'bg-red-500' : val >= 40 ? 'bg-yellow-500' : val >= 20 ? 'bg-green-500' : 'bg-green-700'
                const opacity = val >= 70 ? 'opacity-90' : val >= 40 ? 'opacity-70' : 'opacity-50'
                return (
                  <div
                    key={`${i}-${j}`}
                    className={`aspect-square rounded ${color} ${opacity} flex items-center justify-center`}
                    title={`${row.project}: ${val}%`}
                  >
                    <span className="text-[8px] text-white font-bold">{val}</span>
                  </div>
                )
              })
            ))}
          </div>
          <div className="flex justify-between mt-3 text-[10px] text-slate-400">
            <span>Schedule</span>
            <span>Budget</span>
            <span>Technical</span>
            <span>Resource</span>
            <span>Scope</span>
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-slate-500">
            {['Alpha', 'Beta', 'Gamma', 'Delta', 'Zeta'].map(p => (
              <span key={p}>{p}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
