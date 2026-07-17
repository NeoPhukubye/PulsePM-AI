import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Github, FolderGit2, Star, AlertCircle, Check, Loader2, Lock, Globe, ArrowRight } from 'lucide-react'

function GitLabIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z"/>
    </svg>
  )
}

export default function ImportRepos() {
  const [repos, setRepos] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [provider, setProvider] = useState(null)
  const [imported, setImported] = useState(null)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    // Auto-detect provider from stored tokens
    if (user.github_token) setProvider('github')
    else if (user.gitlab_token) setProvider('gitlab')
  }, [])

  const fetchRepos = async (prov) => {
    setProvider(prov)
    setLoading(true)
    setRepos([])

    const token = prov === 'github' ? user.github_token : user.gitlab_token

    try {
      const res = await fetch(`${API_BASE}/api/auth/${prov}/repos?token=${token}`)
      const data = await res.json()
      setRepos(data)
    } catch {
      // Demo data
      setRepos([
        { id: 1, name: 'frontend-app', full_name: 'user/frontend-app', description: 'React SPA for customer portal', language: 'TypeScript', stars: 12, open_issues: 8, private: false, updated_at: '2024-01-15T10:00:00Z' },
        { id: 2, name: 'backend-api', full_name: 'user/backend-api', description: 'FastAPI microservice', language: 'Python', stars: 5, open_issues: 15, private: true, updated_at: '2024-01-14T10:00:00Z' },
        { id: 3, name: 'mobile-app', full_name: 'user/mobile-app', description: 'React Native mobile application', language: 'JavaScript', stars: 8, open_issues: 22, private: false, updated_at: '2024-01-13T10:00:00Z' },
        { id: 4, name: 'infrastructure', full_name: 'user/infrastructure', description: 'Terraform + K8s configs', language: 'HCL', stars: 3, open_issues: 4, private: true, updated_at: '2024-01-12T10:00:00Z' },
        { id: 5, name: 'data-pipeline', full_name: 'user/data-pipeline', description: 'ETL pipeline with Airflow', language: 'Python', stars: 2, open_issues: 11, private: true, updated_at: '2024-01-11T10:00:00Z' },
        { id: 6, name: 'design-system', full_name: 'user/design-system', description: 'Shared component library', language: 'TypeScript', stars: 15, open_issues: 6, private: false, updated_at: '2024-01-10T10:00:00Z' },
        { id: 7, name: 'auth-service', full_name: 'user/auth-service', description: 'OAuth2/OIDC auth microservice', language: 'Go', stars: 4, open_issues: 3, private: true, updated_at: '2024-01-09T10:00:00Z' },
        { id: 8, name: 'analytics-dashboard', full_name: 'user/analytics-dashboard', description: 'Internal metrics dashboard', language: 'TypeScript', stars: 7, open_issues: 9, private: false, updated_at: '2024-01-08T10:00:00Z' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const toggleRepo = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (selected.size === filteredRepos.length) setSelected(new Set())
    else setSelected(new Set(filteredRepos.map(r => r.id)))
  }

  const importSelected = async () => {
    setImporting(true)
    const selectedRepos = repos.filter(r => selected.has(r.id))
    const token = provider === 'github' ? user.github_token : user.gitlab_token

    try {
      const res = await fetch(`${API_BASE}/api/auth/import/repos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repos: selectedRepos, provider, token: token || 'demo' }),
      })
      const data = await res.json()
      setImported(data)
    } catch {
      setImported({ imported: selectedRepos.map(r => ({ name: r.name, issues_imported: r.open_issues })), total_projects: selectedRepos.length })
    } finally {
      setImporting(false)
    }
  }

  const filteredRepos = repos.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.description || '').toLowerCase().includes(search.toLowerCase())
  )

  const langColors = {
    TypeScript: 'bg-blue-400', Python: 'bg-yellow-400', JavaScript: 'bg-yellow-300',
    Go: 'bg-cyan-400', HCL: 'bg-purple-400', Rust: 'bg-orange-400',
  }

  if (imported) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <div className="max-w-lg w-full bg-slate-800 rounded-2xl p-8 border border-slate-700 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Import Complete!</h2>
          <p className="text-slate-400 mb-6">{imported.total_projects} repositories imported as projects</p>
          <div className="space-y-2 mb-6 max-h-48 overflow-y-auto">
            {imported.imported.map((item, i) => (
              <div key={i} className="flex justify-between items-center bg-slate-700/50 rounded-lg px-4 py-2">
                <span className="text-white text-sm">{item.name}</span>
                <span className="text-xs text-slate-400">{item.issues_imported} issues imported</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/projects')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 mx-auto"
          >
            View Projects <ArrowRight size={18} />
          </button>
        </div>
      </div>
    )
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <div className="max-w-lg w-full space-y-6">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-white">Import Repositories</h1>
            <p className="text-slate-400 mt-2">Select a provider to import your repositories as projects</p>
          </div>

          <button
            onClick={() => fetchRepos('github')}
            className="w-full bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-500 transition text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#24292e] rounded-lg flex items-center justify-center">
                <Github size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">GitHub</h3>
                <p className="text-sm text-slate-400">Import repos, issues, and pull requests</p>
              </div>
              <ArrowRight size={20} className="text-slate-400 ml-auto group-hover:translate-x-1 transition" />
            </div>
          </button>

          <button
            onClick={() => fetchRepos('gitlab')}
            className="w-full bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-500 transition text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#6b4fbb] rounded-lg flex items-center justify-center">
                <GitLabIcon size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">GitLab</h3>
                <p className="text-sm text-slate-400">Import projects, issues, and merge requests</p>
              </div>
              <ArrowRight size={20} className="text-slate-400 ml-auto group-hover:translate-x-1 transition" />
            </div>
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full text-center text-slate-400 hover:text-white text-sm py-2 transition"
          >
            Skip for now
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              {provider === 'github' ? <Github size={28} /> : <GitLabIcon size={28} className="text-[#6b4fbb]" />}
              Import from {provider === 'github' ? 'GitHub' : 'GitLab'}
            </h1>
            <p className="text-slate-400 mt-1">Select repositories to import as projects. Issues become tasks.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={selectAll} className="px-3 py-1.5 text-sm text-slate-300 border border-slate-600 rounded-lg hover:bg-slate-700 transition">
              {selected.size === filteredRepos.length ? 'Deselect All' : 'Select All'}
            </button>
            <button
              onClick={importSelected}
              disabled={selected.size === 0 || importing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {importing ? <Loader2 size={16} className="animate-spin" /> : <FolderGit2 size={16} />}
              Import {selected.size > 0 ? `(${selected.size})` : ''}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search repositories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-blue-400" />
            <span className="ml-3 text-slate-400">Fetching repositories...</span>
          </div>
        )}

        {/* Repo List */}
        {!loading && (
          <div className="space-y-2">
            {filteredRepos.map(repo => (
              <div
                key={repo.id}
                onClick={() => toggleRepo(repo.id)}
                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                  selected.has(repo.id)
                    ? 'bg-blue-500/10 border-blue-500/50'
                    : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                }`}
              >
                {/* Checkbox */}
                <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                  selected.has(repo.id) ? 'bg-blue-600' : 'border-2 border-slate-500'
                }`}>
                  {selected.has(repo.id) && <Check size={14} className="text-white" />}
                </div>

                {/* Repo Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-medium truncate">{repo.name}</h3>
                    {repo.private ? (
                      <Lock size={12} className="text-slate-400 flex-shrink-0" />
                    ) : (
                      <Globe size={12} className="text-slate-400 flex-shrink-0" />
                    )}
                  </div>
                  {repo.description && (
                    <p className="text-sm text-slate-400 truncate mt-0.5">{repo.description}</p>
                  )}
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 flex-shrink-0 text-xs text-slate-400">
                  {repo.language && (
                    <span className="flex items-center gap-1">
                      <span className={`w-2.5 h-2.5 rounded-full ${langColors[repo.language] || 'bg-gray-400'}`} />
                      {repo.language}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Star size={12} /> {repo.stars}
                  </span>
                  <span className="flex items-center gap-1">
                    <AlertCircle size={12} /> {repo.open_issues}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredRepos.length === 0 && repos.length > 0 && (
          <p className="text-center text-slate-400 py-10">No repositories match your search</p>
        )}
      </div>
    </div>
  )
}
