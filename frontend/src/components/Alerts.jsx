import { useState, useEffect } from 'react'
import { alertsAPI } from '../services/api'

export default function Alerts() {
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    alertsAPI.getAll()
      .then(res => setAlerts(res.data || []))
      .catch(() => setAlerts([]))
  }, [])

  return (
    <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Live Alerts</h3>
        <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full">
          {alerts.length} active
        </span>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {alerts.map((alert, i) => (
          <div key={i} className="flex items-start gap-2 p-2 rounded bg-slate-700/50">
            <span className="text-yellow-400 mt-0.5">&#9888;</span>
            <div>
              <p className="text-sm text-white">{alert.message}</p>
              <p className="text-xs text-slate-400">{alert.project}</p>
            </div>
          </div>
        ))}
        {alerts.length === 0 && (
          <p className="text-slate-400 text-sm">No alerts at this time</p>
        )}
      </div>
    </div>
  )
}
