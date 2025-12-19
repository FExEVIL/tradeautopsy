'use client'

import { useState } from 'react'
import { clientFetch, getBaseUrl } from '@/lib/utils/fetch'

export default function TestAPIPage() {
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const testAPI = async (endpoint: string) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await clientFetch(endpoint)
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold mb-6">API Test Page</h1>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="font-semibold mb-4">Base URL</h2>
          <code className="text-green-400">{getBaseUrl()}</code>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => testAPI('/api/backtesting/results?limit=5')}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            disabled={loading}
          >
            Test: Get Backtest Results
          </button>

          <button
            onClick={() => testAPI('/api/backtesting/templates')}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
            disabled={loading}
          >
            Test: Get Strategy Templates
          </button>
        </div>

        {loading && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-blue-400">Loading...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
            <h3 className="font-semibold text-red-400 mb-2">Error</h3>
            <pre className="text-sm text-gray-300 overflow-auto whitespace-pre-wrap">{error}</pre>
          </div>
        )}

        {result && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
            <h3 className="font-semibold text-green-400 mb-2">Success</h3>
            <pre className="text-sm text-gray-300 overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
