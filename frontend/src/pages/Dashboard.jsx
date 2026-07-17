import { useState, useEffect } from 'react'
import { projectsAPI, alertsAPI } from '../services/api'
import ProjectCard from '../components/ProjectCard'
import Alerts from '../components/Alerts'
import StandupWidget from '../components/StandupWidget'
import AIChat from '../components/AIChat'

export default function Dashboard() {
  const [projects, setProjects] = useState([])
  const [alerts, setAlerts] = useState([])
  const [stats] = useState({
    activeProjects: 18,
    overallHealth: 87,
    teams: 6,
    developers: 42,
    highRisks: 3,
    criticalBugs: 7,
    blockedTasks: 12,
  })

  useEffect(() => {
    projectsAPI.getAll().then(res => setProjects(res.data)).catch(() => {})
    alertsAPI.getAll().then(res => setAlerts(res.data)).catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Dashboard</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {[
          { label: 'Active Projects', value: stats.activeProjects, color: 'blue' },
          { label: 'Overall Health', value: `${stats.overallHealth}%`, color: 'green' },
          { label: 'Teams', value: stats.teams, color: 'purple' },
          { label: 'Developers', value: stats.developers, color: 'cyan' },
          { label: 'High Risks', value: stats.highRisks, color: 'red' },
          { label: 'Critical Bugs', value: stats.criticalBugs, color: 'orange' },
          { label: 'Blocked Tasks', value: stats.blockedTasks, color: 'yellow' },
        ].map(stat => (
          <div key={stat.label} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-xs">{stat.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Projects & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-white">Projects</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.length > 0 ? (
              projects.map(p => <ProjectCard key={p.id} project={p} />)
            ) : (
              <>
                <ProjectCard project={{ name: 'Project Alpha', health_score: 92, completion: 92, status: 'active' }} />
                <ProjectCard project={{ name: 'Project Beta', health_score: 65, completion: 65, status: 'warning' }} />
                <ProjectCard project={{ name: 'Project Gamma', health_score: 41, completion: 41, status: 'critical' }} />
                <ProjectCard project={{ name: 'Project Delta', health_score: 81, completion: 81, status: 'active' }} />
              </>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <Alerts alerts={alerts} />
          <StandupWidget />
        </div>
      </div>

      {/* AI Chat */}
      <AIChat />
    </div>
  )
}
