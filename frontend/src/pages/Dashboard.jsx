import { useState, useEffect, useRef } from 'react'
import { projectsAPI, alertsAPI, aiAPI } from '../services/api'
import ProjectCard from '../components/ProjectCard'
import Alerts from '../components/Alerts'
import StandupWidget from '../components/StandupWidget'
import AIChat from '../components/AIChat'
import RiskPanel from '../components/RiskPanel'
import { Activity, AlertTriangle, CheckCircle2, Users, FolderKanban, Bug, Shield, TrendingUp } from 'lucide-react'

function HealthGauge({ value, label }) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const progress = ((100 - value) / 100) * circumference
  const color = value >= 80 ? '#22c55e' : value >= 60 ? '#eab308' : '#ef4444'

  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="100" className="transform -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#334155" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={radius} fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute mt-7 text-center">
        <span className="text-2xl font-bold text-white">{value}%</span>
      </div>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </div>
  )
}

function AnimatedStat({ label, value, icon: Icon, color, trend }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const numVal = typeof value === 'string' ? parseInt(value) : value
    if (isNaN(numVal)) { setDisplayValue(value); return }
    let start = 0
    const duration = 1000
    const increment = numVal / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= numVal) { setDisplayValue(numVal); clearInterval(timer) }
      else setDisplayValue(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [value])

  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/5 border-green-500/30',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/30',
    cyan: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/30',
    red: 'from-red-500/20 to-red-600/5 border-red-500/30',
    orange: 'from-orange-500/20 to-orange-600/5 border-orange-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/5 border-yellow-500/30',
  }

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-4 border backdrop-blur-sm hover:scale-105 transition-transform duration-200`}>
      <div className="flex items-center justify-between mb-2">
        <Icon size={18} className="text-slate-400" />
        {trend && (
          <span className={`text-xs px-1.5 py-0.5 rounded ${trend > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white">{typeof displayValue === 'number' ? displayValue : value}{typeof value === 'string' && value.includes('%') ? '%' : ''}</p>
      <p className="text-slate-400 text-xs mt-1">{label}</p>
    </div>
  )
}

export default function Dashboard() {
  const [projects, setProjects] = useState([])
  const [alerts, setAlerts] = useState([])
  const [wsAlerts, setWsAlerts] = useState([])
  const wsRef = useRef(null)

  const stats = {
    activeProjects: 6,
    overallHealth: 87,
    teams: 6,
    developers: 42,
    highRisks: 3,
    criticalBugs: 7,
    blockedTasks: 12,
  }

  useEffect(() => {
    projectsAPI.getAll().then(res => setProjects(res.data)).catch(() => {
      setProjects([
        { id: 1, name: 'Project Alpha', health_score: 92, completion: 78, status: 'active' },
        { id: 2, name: 'Project Beta', health_score: 65, completion: 52, status: 'warning' },
        { id: 3, name: 'Project Gamma', health_score: 41, completion: 33, status: 'critical' },
        { id: 4, name: 'Project Delta', health_score: 81, completion: 67, status: 'active' },
        { id: 5, name: 'Project Epsilon', health_score: 88, completion: 85, status: 'active' },
        { id: 6, name: 'Project Zeta', health_score: 58, completion: 44, status: 'warning' },
      ])
    })
    alertsAPI.getAll().then(res => setAlerts(res.data)).catch(() => {})

    // WebSocket for live alerts
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:8000/ws`
    try {
      const ws = new WebSocket(wsUrl)
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'alert') {
          setWsAlerts(prev => [...data.data, ...prev].slice(0, 10))
        }
      }
      wsRef.current = ws
    } catch {}

    return () => { wsRef.current?.close() }
  }, [])

  const allAlerts = [...wsAlerts, ...alerts]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard</h2>
          <p className="text-slate-400 text-sm">AI-powered portfolio overview</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-green-400">6 AI Agents Active</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <AnimatedStat label="Active Projects" value={stats.activeProjects} icon={FolderKanban} color="blue" trend={2} />
        <AnimatedStat label="Overall Health" value={`${stats.overallHealth}%`} icon={Activity} color="green" trend={5} />
        <AnimatedStat label="Teams" value={stats.teams} icon={Users} color="purple" />
        <AnimatedStat label="Developers" value={stats.developers} icon={Users} color="cyan" />
        <AnimatedStat label="High Risks" value={stats.highRisks} icon={AlertTriangle} color="red" trend={-1} />
        <AnimatedStat label="Critical Bugs" value={stats.criticalBugs} icon={Bug} color="orange" trend={-3} />
        <AnimatedStat label="Blocked Tasks" value={stats.blockedTasks} icon={Shield} color="yellow" trend={2} />
      </div>

      {/* Health Gauges */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Portfolio Health</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {(projects.length > 0 ? projects : [
            { name: 'Alpha', health_score: 92 }, { name: 'Beta', health_score: 65 },
            { name: 'Gamma', health_score: 41 }, { name: 'Delta', health_score: 81 },
            { name: 'Epsilon', health_score: 88 }, { name: 'Zeta', health_score: 58 },
          ]).map((p, i) => (
            <div key={i} className="relative flex flex-col items-center">
              <HealthGauge value={p.health_score} label={p.name} />
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Projects + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Projects */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Projects Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(projects.length > 0 ? projects : [
                { id: 1, name: 'Project Alpha', health_score: 92, completion: 78, status: 'active' },
                { id: 2, name: 'Project Beta', health_score: 65, completion: 52, status: 'warning' },
                { id: 3, name: 'Project Gamma', health_score: 41, completion: 33, status: 'critical' },
                { id: 4, name: 'Project Delta', health_score: 81, completion: 67, status: 'active' },
                { id: 5, name: 'Project Epsilon', health_score: 88, completion: 85, status: 'active' },
                { id: 6, name: 'Project Zeta', health_score: 58, completion: 44, status: 'warning' },
              ]).map(p => <ProjectCard key={p.id} project={p} />)}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Alerts alerts={allAlerts} />
          <StandupWidget />
          <RiskPanel />
        </div>
      </div>

      {/* AI Chat */}
      <AIChat />
    </div>
  )
}
