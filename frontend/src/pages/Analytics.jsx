import BurndownChart from '../components/BurndownChart'
import VelocityChart from '../components/VelocityChart'

export default function Analytics() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Analytics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VelocityChart />
        <BurndownChart />
      </div>
    </div>
  )
}
