import { useState, useEffect } from 'react'
import { alertsAPI } from '../services/api'

export default function RiskPanel() {
  const [risks, setRisks] = useState([])

  useEffect(() => {
    alertsAPI.getAll()
      .then(res => setRisks(res.data || []))
      .catch(() => setRisks([]))
  }, [])

  const severityColors = {
    critical: 'border-red-500 bg-red-500/10',
    warning: 'border-yellow-500 bg-yellow-500/10',
    info: 'border-blue-500 bg-blue-500/10',
  }

  return (
    <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
      <h3 className="text-lg font-semibold text-white mb-4">Risk Monitor</h3>
      {risks.length > 0 ? (
        <div className="space-y-3">
          {risks.slice(0, 5).map((risk, i) => (
            <div key={i} className={`p-3 rounded border-l-4 ${severityColors[risk.type] || severityColors.info}`}>
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-white">{risk.project}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${risk.type === 'critical' ? 'bg-red-500' : 'bg-yellow-500'} text-white`}>
                  {risk.type}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">{risk.message}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-400 text-sm">No active risks detected</p>
      )}
    </div>
  )
}
