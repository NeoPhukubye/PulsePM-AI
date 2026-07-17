import { useState } from 'react'
import TeamCard from '../components/TeamCard'

export default function Teams() {
  const [teams] = useState([
    { id: 1, name: 'Backend Team', lead: 'John Smith', member_count: 8, velocity: 42, workload: 85 },
    { id: 2, name: 'Frontend Team', lead: 'Sarah Johnson', member_count: 6, velocity: 38, workload: 72 },
    { id: 3, name: 'DevOps Team', lead: 'Mike Chen', member_count: 4, velocity: 28, workload: 90 },
    { id: 4, name: 'QA Team', lead: 'Lisa Park', member_count: 5, velocity: 35, workload: 68 },
    { id: 5, name: 'Mobile Team', lead: 'Alex Rivera', member_count: 7, velocity: 40, workload: 78 },
    { id: 6, name: 'Data Team', lead: 'Emma Wilson', member_count: 4, velocity: 30, workload: 55 },
  ])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Teams</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map(team => <TeamCard key={team.id} team={team} />)}
      </div>
    </div>
  )
}
