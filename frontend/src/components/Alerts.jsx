import { useState, useEffect } from 'react'
import { alertsAPI } from '../services/api'
import { AlertTriangle, Bell, Wifi } from 'lucide-react'

export default function Alerts({ alerts: propAlerts }) {
  const [alerts, setAlerts] = useState([])
  const [newAlert, setNewAlert] = useState(false)

  useEffect(() => {
    if (propAlerts && propAlerts.length > 0) {
      setAlerts(propAlerts)
      return
    }
    alertsAPI.getAll()
      .then(res => setAlerts(res.data || []))
      .catch(() => setAlerts([
        { type: 'critical', project: 'Project Gamma', message: 'Data migration blocked - 3 tasks waiting on schema fix' },
        { type: 'warning', project: 'Project Beta', message: 'Sprint velocity dropped 22% from average' },
        { type: 'warning', project: 'Project Zeta', message: 'Budget utilization above 90%' },
        { type: 'critical', project: 'Project Gamma', message: 'Health score critical: 41%' },
        { type: 'warning', project: 'DevOps Team', message: 'Team workload at 90% - risk of burnout' },
      ]))
  }, [propAlerts])

  useEffect(() => {
    if (alerts.length > 0) {
      setNewAlert(true)
      const timer = setTimeout(() => setNewAlert(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [alerts.length])

  const typeStyles = {
    critical: { bg: 'bg-red-500/10', border: 'border-red-500/30', icon: 'text-red-400', badge: 'bg-red-500' },
    warning: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: 'text-yellow-400', badge: 'bg-yellow-500' },
  }

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-white" />
          <h3 className="text-lg font-semibold text-white">Live Alerts</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 rounded-full">
            <Wifi size={10} className="text-green-400" />
            <span className="text-[10px] text-green-400">LIVE</span>
          </div>
          <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full font-medium">
            {alerts.length} active
          </span>
        </div>
      </div>
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {alerts.slice(0, 8).map((alert, i) => {
          const style = typeStyles[alert.type] || typeStyles.warning
          return (
            <div
              key={i}
              className={`flex items-start gap-3 p-3 rounded-lg ${style.bg} border ${style.border} ${i === 0 && newAlert ? 'animate-pulse' : ''} transition-all duration-300`}
            >
              <AlertTriangle size={14} className={`${style.icon} mt-0.5 flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white leading-tight">{alert.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-400">{alert.project}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${style.badge} text-white uppercase font-medium`}>
                    {alert.type}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
        {alerts.length === 0 && (
          <div className="text-center py-6">
            <CheckCircle2 size={24} className="text-green-400 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">All clear - no active alerts</p>
          </div>
        )}
      </div>
    </div>
  )
}

function CheckCircle2Icon(props) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
}
