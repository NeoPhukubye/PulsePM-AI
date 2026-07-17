import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, useParams } from 'react-router-dom'
import { Loader2, CheckCircle } from 'lucide-react'

export default function OAuthCallback() {
  const [status, setStatus] = useState('processing')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { provider } = useParams()

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  useEffect(() => {
    const code = searchParams.get('code')
    if (!code) {
      setStatus('error')
      return
    }

    const authenticate = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/${provider}/callback?code=${code}`, {
          method: 'POST',
        })
        const data = await res.json()

        if (!res.ok) throw new Error(data.detail || 'Authentication failed')

        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify({
          id: data.user_id, name: data.name, email: data.email,
          [`${provider}_token`]: data[`${provider}_token`],
          avatar_url: data.avatar_url,
        }))

        setStatus('success')
        setTimeout(() => navigate('/import-repos'), 1500)
      } catch {
        setStatus('error')
        setTimeout(() => navigate('/login'), 3000)
      }
    }

    authenticate()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center">
        {status === 'processing' && (
          <>
            <Loader2 size={40} className="animate-spin text-blue-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white">Authenticating with {provider}...</h2>
            <p className="text-slate-400 mt-2">Please wait while we verify your account</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle size={40} className="text-green-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white">Authentication Successful!</h2>
            <p className="text-slate-400 mt-2">Redirecting to import your repositories...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-400 text-xl">!</span>
            </div>
            <h2 className="text-xl font-semibold text-white">Authentication Failed</h2>
            <p className="text-slate-400 mt-2">Redirecting to login...</p>
          </>
        )}
      </div>
    </div>
  )
}
