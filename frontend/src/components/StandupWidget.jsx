import { useState, useEffect } from 'react'
import { standupsAPI } from '../services/api'

export default function StandupWidget() {
  const [standup, setStandup] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    standupsAPI.getToday()
      .then(res => setStandup(res.data))
      .catch(() => setStandup(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="bg-slate-800 rounded-lg p-5 border border-slate-700 animate-pulse h-48" />

  return (
    <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
      <h3 className="text-lg font-semibold text-white mb-4">Today's Standup</h3>
      {standup?.standup ? (
        <div className="space-y-3 text-sm">
          <div>
            <h4 className="text-yellow-400 font-medium mb-1">Yesterday</h4>
            <ul className="text-slate-300 space-y-1">
              {standup.standup.yesterday.map((item, i) => (
                <li key={i}>• {item.title}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-blue-400 font-medium mb-1">Today's Focus</h4>
            <ul className="text-slate-300 space-y-1">
              {standup.standup.today_focus.map((item, i) => (
                <li key={i}>• {item.title}</li>
              ))}
            </ul>
          </div>
          {standup.standup.blockers.length > 0 && (
            <div>
              <h4 className="text-red-400 font-medium mb-1">Blockers</h4>
              <ul className="text-slate-300 space-y-1">
                {standup.standup.blockers.map((item, i) => (
                  <li key={i}>• {item.title}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p className="text-slate-400 text-sm">No standup generated yet today</p>
      )}
    </div>
  )
}
