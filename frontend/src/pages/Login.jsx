import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, LogIn, Github } from 'lucide-react'

function GitLabIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z"/>
    </svg>
  )
}

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Login failed')

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify({
        id: data.user_id, name: data.name, email: data.email, role: data.role,
        github_token: data.github_token, gitlab_token: data.gitlab_token,
      }))
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth = async (provider) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/${provider}/login`)
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      // Demo mode: simulate OAuth login
      const demoUser = {
        id: 1, name: `Demo ${provider} User`, email: `demo@${provider}.com`,
        role: 'member', [`${provider}_token`]: 'demo_token',
      }
      localStorage.setItem('token', 'demo_token')
      localStorage.setItem('user', JSON.stringify(demoUser))
      navigate('/import-repos')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-slate-400 mt-2">Sign in to ProjectPulse AI</p>
        </div>

        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 space-y-5">
          {/* OAuth Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => handleOAuth('github')}
              className="w-full flex items-center justify-center gap-3 py-3 bg-[#24292e] text-white rounded-lg hover:bg-[#2f363d] transition font-medium"
            >
              <Github size={20} />
              Continue with GitHub
            </button>
            <button
              onClick={() => handleOAuth('gitlab')}
              className="w-full flex items-center justify-center gap-3 py-3 bg-[#6b4fbb] text-white rounded-lg hover:bg-[#7c5fc7] transition font-medium"
            >
              <GitLabIcon size={20} />
              Continue with GitLab
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-600" />
            <span className="text-xs text-slate-400">or sign in with email</span>
            <div className="flex-1 h-px bg-slate-600" />
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email" required placeholder="Email address"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password" required placeholder="Password"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              <LogIn size={18} />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm">
            Don't have an account?{' '}
            <button onClick={() => navigate('/register')} className="text-blue-400 hover:text-blue-300">
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
