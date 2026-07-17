export default function Settings() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Settings</h2>
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Integrations</h3>
          <div className="space-y-3">
            {['Jira', 'GitHub', 'Slack'].map(service => (
              <div key={service} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                <span className="text-white">{service}</span>
                <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">Configure</button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">AI Configuration</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
              <span className="text-white">OpenAI API Key</span>
              <input type="password" placeholder="sk-..." className="bg-slate-600 border border-slate-500 rounded px-3 py-1 text-white text-sm w-64" />
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
              <span className="text-white">Auto-generate standups</span>
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
              <span className="text-white">Risk scan interval</span>
              <select className="bg-slate-600 border border-slate-500 rounded px-3 py-1 text-white text-sm">
                <option>Every 4 hours</option>
                <option>Every hour</option>
                <option>Daily</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
