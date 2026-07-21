import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Teams from './pages/Teams'
import Reports from './pages/Reports'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import Register from './pages/Register'
import Login from './pages/Login'
import ImportRepos from './pages/ImportRepos'
import OAuthCallback from './pages/OAuthCallback'
import Planning from './pages/Planning'
import SprintPlanner from './pages/SprintPlanner'
import Risks from './pages/Risks'
import Standups from './pages/Standups'
import AIAssistant from './pages/AIAssistant'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/:provider/callback" element={<OAuthCallback />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <div className="flex h-screen bg-slate-900">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/teams" element={<Teams />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/planning" element={<Planning />} />
                    <Route path="/sprint-planner" element={<SprintPlanner />} />
                    <Route path="/risks" element={<Risks />} />
                    <Route path="/standups" element={<Standups />} />
                    <Route path="/ai-assistant" element={<AIAssistant />} />
                    <Route path="/import-repos" element={<ImportRepos />} />
                  </Routes>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  )
}
