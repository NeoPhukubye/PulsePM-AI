import { useState, useEffect } from 'react'
import { Bell, Mail, AlertTriangle, FileText, Calendar } from 'lucide-react'

export default function Settings() {
  const [notifications, setNotifications] = useState({
    notify_project_behind: true,
    notify_risk_critical: true,
    notify_daily_standup: false,
    notify_weekly_report: true,
  })
  const [saved, setSaved] = useState(false)
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleToggle = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
    setSaved(false)
  }

  const savePreferences = async () => {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    try {
      await fetch(`${API_BASE}/api/auth/notifications/${user.id || 1}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notifications),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {}
  }

  const notificationOptions = [
    { key: 'notify_project_behind', label: 'Project Behind Schedule', desc: 'Get alerted when any subscribed project falls behind its timeline', icon: AlertTriangle, color: 'text-yellow-400' },
    { key: 'notify_risk_critical', label: 'Critical Risk Alerts', desc: 'Immediate notification when AI detects critical risks', icon: AlertTriangle, color: 'text-red-400' },
    { key: 'notify_daily_standup', label: 'Daily Standup Summary', desc: 'Receive AI-generated standup every morning at 9 AM', icon: Calendar, color: 'text-blue-400' },
    { key: 'notify_weekly_report', label: 'Weekly Portfolio Report', desc: 'Executive summary of all projects every Monday', icon: FileText, color: 'text-purple-400' },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Settings</h2>

      {/* Email Notifications */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <Bell size={20} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Email Notifications</h3>
            <p className="text-sm text-slate-400">Choose which alerts you receive via email</p>
          </div>
        </div>

        <div className="space-y-4">
          {notificationOptions.map(opt => (
            <div key={opt.key} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <opt.icon size={18} className={opt.color} />
                <div>
                  <p className="text-white font-medium">{opt.label}</p>
                  <p className="text-xs text-slate-400">{opt.desc}</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle(opt.key)}
                className={`w-12 h-6 rounded-full transition-colors ${notifications[opt.key] ? 'bg-blue-600' : 'bg-slate-600'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${notifications[opt.key] ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={savePreferences}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Save Preferences
          </button>
          {saved && <span className="text-green-400 text-sm">Saved successfully!</span>}
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Account</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
            <div>
              <p className="text-white">{user.name || 'Demo User'}</p>
              <p className="text-xs text-slate-400">{user.email || 'demo@projectpulse.ai'}</p>
            </div>
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
              {user.role || 'Admin'}
            </span>
          </div>
        </div>
      </div>

      {/* Integrations */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Integrations</h3>
        <div className="space-y-3">
          {['Jira', 'GitHub', 'Slack', 'SendGrid (Email)'].map(service => (
            <div key={service} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
              <span className="text-white">{service}</span>
              <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition">
                Configure
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* AI Configuration */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">AI Configuration</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
            <span className="text-white">OpenAI API Key</span>
            <input type="password" placeholder="sk-..." className="bg-slate-600 border border-slate-500 rounded-lg px-3 py-1.5 text-white text-sm w-64" />
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
            <span className="text-white">Risk scan interval</span>
            <select className="bg-slate-600 border border-slate-500 rounded-lg px-3 py-1.5 text-white text-sm">
              <option>Every 4 hours</option>
              <option>Every hour</option>
              <option>Daily</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
