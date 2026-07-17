import { useState, useEffect } from 'react'
import { projectsAPI } from '../services/api'
import ProjectCard from '../components/ProjectCard'

export default function Projects() {
  const [projects, setProjects] = useState([
    { id: 1, name: 'Project Alpha', health_score: 92, completion: 92, status: 'active', description: 'Main platform development' },
    { id: 2, name: 'Project Beta', health_score: 65, completion: 65, status: 'warning', description: 'Mobile app v2' },
    { id: 3, name: 'Project Gamma', health_score: 41, completion: 41, status: 'critical', description: 'Data migration' },
    { id: 4, name: 'Project Delta', health_score: 81, completion: 81, status: 'active', description: 'API redesign' },
  ])

  useEffect(() => {
    projectsAPI.getAll().then(res => { if (res.data.length) setProjects(res.data) }).catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Projects</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">New Project</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(p => <ProjectCard key={p.id} project={p} />)}
      </div>
    </div>
  )
}
