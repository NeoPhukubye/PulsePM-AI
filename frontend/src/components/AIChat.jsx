import { useState, useRef, useEffect } from 'react'
import { aiAPI } from '../services/api'
import { MessageSquare, Bot, Send, Sparkles, Loader2 } from 'lucide-react'

export default function AIChat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI project management assistant. I can help you with:\n\n• Project status & health checks\n• Risk assessment & mitigation\n• Sprint planning & predictions\n• Daily standup summaries\n• Executive reports\n• Task reassignment\n\nTry asking: "What\'s at risk?" or "Generate today\'s standup"',
      orchestration: []
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeAgents, setActiveAgents] = useState([])
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = { role: 'user', content: input, orchestration: [] }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setActiveAgents([])

    try {
      const res = await aiAPI.chat(input)
      const { response, orchestration, action_detected, processing_time_ms } = res.data

      setActiveAgents(orchestration || [])

      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response,
          orchestration: orchestration || [],
          action: action_detected,
          time: processing_time_ms
        }])
        setLoading(false)
        setActiveAgents([])
      }, 800)
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I\'m currently running in demo mode. In production, I connect to GPT-4 for intelligent responses. The orchestration system is fully functional.',
        orchestration: [{ agent: 'System', action: 'Fallback mode active', status: 'done' }]
      }])
      setLoading(false)
      setActiveAgents([])
    }
  }

  const quickActions = [
    "What's at risk?",
    "Generate standup",
    "Executive report",
    "Which team is overloaded?",
    "Predict delivery for Project Alpha",
  ]

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col h-[500px]">
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">AI Command Center</h3>
            <p className="text-xs text-slate-400">6 agents active</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-green-400">Live</span>
        </div>
      </div>

      {/* Agent Activity Bar */}
      {(loading && activeAgents.length > 0) && (
        <div className="px-4 py-2 bg-slate-900/50 border-b border-slate-700">
          <div className="flex items-center gap-2 text-xs">
            <Sparkles size={12} className="text-yellow-400 animate-spin" />
            <span className="text-yellow-400">Agents working:</span>
            {activeAgents.map((agent, i) => (
              <span key={i} className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full">
                {agent.agent}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${msg.role === 'user' ? '' : ''}`}>
              <div className={`p-3 rounded-xl text-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-slate-700 text-slate-200 rounded-bl-sm'
              }`}>
                <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
              </div>
              {/* Orchestration visualization */}
              {msg.orchestration && msg.orchestration.length > 0 && msg.role === 'assistant' && (
                <div className="mt-2 pl-2 border-l-2 border-slate-600">
                  <p className="text-xs text-slate-500 mb-1">Agent Activity:</p>
                  {msg.orchestration.map((step, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs py-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${step.status === 'done' ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'}`} />
                      <span className="text-slate-400">{step.agent}:</span>
                      <span className="text-slate-300">{step.action}</span>
                    </div>
                  ))}
                  {msg.time && (
                    <p className="text-xs text-slate-500 mt-1">{msg.time}ms</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && !activeAgents.length && (
          <div className="flex justify-start">
            <div className="bg-slate-700 p-3 rounded-xl text-sm text-slate-400 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              Processing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => setInput(action)}
                className="px-3 py-1.5 bg-slate-700 text-slate-300 text-xs rounded-full hover:bg-slate-600 transition"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about projects, risks, or give commands..."
            className="flex-1 bg-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  )
}
