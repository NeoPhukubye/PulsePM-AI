import { useState } from 'react'
import { reportsAPI } from '../services/api'

export default function Reports() {
  const [reports] = useState([
    { id: 1, type: 'Executive', title: 'Weekly Portfolio Summary', date: '2024-01-15', status: 'green' },
    { id: 2, type: 'Sprint', title: 'Sprint 7 Review - Project Alpha', date: '2024-01-14', status: 'green' },
    { id: 3, type: 'Risk', title: 'Risk Assessment - Project Gamma', date: '2024-01-13', status: 'red' },
    { id: 4, type: 'Standup', title: 'Daily Standup Summary', date: '2024-01-15', status: 'green' },
  ])

  const [showModal, setShowModal] = useState(false)
  const [reportType, setReportType] = useState('executive')
  const [includeManagers, setIncludeManagers] = useState(true)
  const [includeStakeholders, setIncludeStakeholders] = useState(true)
  const [customEmails, setCustomEmails] = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)

  const handleGenerateAndEmail = async () => {
    setSending(true)
    setResult(null)
    try {
      const recipients = customEmails
        .split(',')
        .map(e => e.trim())
        .filter(e => e.length > 0)

      const res = await reportsAPI.generateAndEmail({
        report_type: reportType,
        recipients,
        include_managers: includeManagers,
        include_stakeholders: includeStakeholders,
        custom_message: customMessage || null,
      })
      setResult(res.data)
    } catch (err) {
      setResult({ error: 'Failed to generate and send report' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Reports</h2>
        <button
          onClick={() => { setShowModal(true); setResult(null) }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Generate & Email Report
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left p-4 text-slate-400 text-sm">Type</th>
              <th className="text-left p-4 text-slate-400 text-sm">Title</th>
              <th className="text-left p-4 text-slate-400 text-sm">Date</th>
              <th className="text-left p-4 text-slate-400 text-sm">Status</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(report => (
              <tr key={report.id} className="border-b border-slate-700 hover:bg-slate-750">
                <td className="p-4 text-white">{report.type}</td>
                <td className="p-4 text-white">{report.title}</td>
                <td className="p-4 text-slate-300">{report.date}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${report.status === 'green' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                    {report.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Generate & Email Report</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Report Type</label>
                <select
                  value={reportType}
                  onChange={e => setReportType(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="executive">Executive Summary</option>
                  <option value="sprint">Sprint Review</option>
                  <option value="risk">Risk Assessment</option>
                  <option value="standup">Standup Summary</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Recipients</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-slate-300">
                    <input
                      type="checkbox"
                      checked={includeManagers}
                      onChange={e => setIncludeManagers(e.target.checked)}
                      className="rounded bg-slate-700 border-slate-600"
                    />
                    Project Managers
                  </label>
                  <label className="flex items-center gap-2 text-slate-300">
                    <input
                      type="checkbox"
                      checked={includeStakeholders}
                      onChange={e => setIncludeStakeholders(e.target.checked)}
                      className="rounded bg-slate-700 border-slate-600"
                    />
                    Stakeholders & Executives
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Additional Recipients (comma-separated)</label>
                <input
                  type="text"
                  value={customEmails}
                  onChange={e => setCustomEmails(e.target.value)}
                  placeholder="email@example.com, another@example.com"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Custom Message (optional)</label>
                <textarea
                  value={customMessage}
                  onChange={e => setCustomMessage(e.target.value)}
                  placeholder="Add a note to include in the email..."
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 resize-none"
                />
              </div>

              {result && !result.error && (
                <div className="bg-green-900/30 border border-green-700 rounded-lg p-3">
                  <p className="text-green-300 text-sm font-medium">Report sent successfully!</p>
                  <p className="text-green-400 text-xs mt-1">
                    Emailed to {result.sent_count} recipient{result.sent_count !== 1 ? 's' : ''}: {result.email_sent_to?.join(', ')}
                  </p>
                </div>
              )}

              {result?.error && (
                <div className="bg-red-900/30 border border-red-700 rounded-lg p-3">
                  <p className="text-red-300 text-sm">{result.error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateAndEmail}
                  disabled={sending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Generating...
                    </>
                  ) : (
                    'Generate & Send'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
