import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/import-repos" element={<ImportRepos />} />
        <Route path="/auth/:provider/callback" element={<OAuthCallback />} />
        <Route path="/*" element={
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
                </Routes>
              </main>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  )
}
