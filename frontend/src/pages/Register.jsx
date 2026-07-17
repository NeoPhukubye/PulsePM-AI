import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, User, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react'

export default function Register() {
  const [mode, setMode] = useState('choose') // choose, company, individual
  const [form, setForm] = useState({ company_name: '', name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const endpoint = mode === 'company' ? '/api/auth/register/company' : '/api/auth/register'
      const body = mode === 'company'
        ? { company_name: form.company_name, admin_name: form.name, admin_email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password }

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Registration failed')

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify({ id: data.user_id, name: form.name, email: form.email }))
      setSuccess(true)
      setTimeout(() => navigate('/'), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 text-center max-w-md">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Registration Successful!</h2>
          <p className="text-slate-400">You'll receive email notifications when projects fall behind schedule.</p>
          <p className="text-slate-500 text-sm mt-4">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  if (mode === 'choose') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <div className="max-w-lg w-full space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Join ProjectPulse AI</h1>
            <p className="text-slate-400 mt-2">Get AI-powered alerts when your projects need attention</p>
          </div>

          <button
            onClick={() => setMode('company')}
            className="w-full bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition">
                <Building2 size={24} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Register Company</h3>
                <p className="text-sm text-slate-400">Set up your organization and invite your team</p>
              </div>
              <ArrowRight size={20} className="text-slate-400 ml-auto" />
            </div>
          </button>

          <button
            onClick={() => setMode('individual')}
            className="w-full bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-purple-500 transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition">
                <User size={24} className="text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Individual Signup</h3>
                <p className="text-sm text-slate-400">Join as a project manager or team member</p>
              </div>
              <ArrowRight size={20} className="text-slate-400 ml-auto" />
            </div>
          </button>

          <p className="text-center text-slate-400 text-sm">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="text-blue-400 hover:text-blue-300">
              Sign in
            </button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">
            {mode === 'company' ? 'Register Your Company' : 'Create Account'}
          </h1>
          <p className="text-slate-400 mt-2">Get notified when projects fall behind</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-2xl p-8 border border-slate-700 space-y-5">
          {mode === 'company' && (
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Company Name</label>
              <div className="relative">
                <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text" required placeholder="Acme Corp"
                  value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Full Name</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text" required placeholder="John Smith"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email" required placeholder="john@company.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password" required placeholder="Min 6 characters"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password" required placeholder="Repeat password"
                value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Notification preferences */}
          <div className="bg-slate-700/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-white mb-2">Email Notifications</p>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" defaultChecked className="rounded" />
              Project behind schedule alerts
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" defaultChecked className="rounded" />
              Critical risk notifications
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" defaultChecked className="rounded" />
              Weekly portfolio report
            </label>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? 'Creating account...' : mode === 'company' ? 'Register Company' : 'Create Account'}
          </button>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setMode('choose')} className="text-sm text-slate-400 hover:text-white">
              &larr; Back
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
