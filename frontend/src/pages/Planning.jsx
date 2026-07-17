import { useState } from 'react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'

export default function Planning() {
  const [description, setDescription] = useState('')
  const [plan, setPlan] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleGeneratePlan = async () => {
    setIsLoading(true)
    setError(null)
    setPlan('')
    try {
      const response = await axios.post('http://localhost:8000/api/planning/generate', { description })
      setPlan(response.data.plan)
    } catch (err) {
      setError('Failed to generate plan. Please try again.')
      console.error(err)
    }
    setIsLoading(false)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-white">Planning (ForgeMind AI)</h1>
      <p className="text-slate-400 mb-6">
        Enter a description of your project, and ForgeMind AI will generate a complete project plan for you.
      </p>

      <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
        <textarea
          className="w-full h-32 p-3 bg-slate-700 text-white rounded-md border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Build an AI-powered food delivery platform."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button
          className="mt-4 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-slate-500 transition-colors"
          onClick={handleGeneratePlan}
          disabled={isLoading || !description}
        >
          {isLoading ? 'Generating Plan...' : 'Generate Plan'}
        </button>
      </div>

      {error && <div className="mt-6 text-red-500 bg-red-900 p-4 rounded-md">{error}</div>}

      {plan && (
        <div className="mt-8 bg-slate-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-white">Generated Project Plan</h2>
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown>{plan}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}
