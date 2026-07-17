import { useState } from 'react'

export default function Reports() {
  const [reports] = useState([
    { id: 1, type: 'Executive', title: 'Weekly Portfolio Summary', date: '2024-01-15', status: 'green' },
    { id: 2, type: 'Sprint', title: 'Sprint 7 Review - Project Alpha', date: '2024-01-14', status: 'green' },
    { id: 3, type: 'Risk', title: 'Risk Assessment - Project Gamma', date: '2024-01-13', status: 'red' },
    { id: 4, type: 'Standup', title: 'Daily Standup Summary', date: '2024-01-15', status: 'green' },
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Reports</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Generate Report</button>
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
    </div>
  )
}
