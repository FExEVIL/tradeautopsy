'use client'

import { useState, useEffect } from 'react'
import { 
  Puzzle, 
  Key, 
  Copy, 
  RefreshCw, 
  Trash2, 
  Check, 
  Eye, 
  EyeOff,
  ExternalLink,
  Download,
  Chrome,
  Shield,
  Bell,
  Clock
} from 'lucide-react'

export function ExtensionSettingsClient() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [showToken, setShowToken] = useState(false)
  const [copied, setCopied] = useState(false)
  const [tokenCreatedAt, setTokenCreatedAt] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Fetch current token on load
  useEffect(() => {
    fetchToken()
  }, [])

  const fetchToken = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/extension/token')
      const data = await response.json()
      
      if (data.success && data.data) {
        setToken(data.data.token || null)
        setTokenCreatedAt(data.data.created_at || null)
      } else {
        setError(data.error || 'Failed to load extension token')
      }
    } catch (err) {
      console.error('Error fetching token:', err)
      setError('Failed to load extension token')
    } finally {
      setIsLoading(false)
    }
  }

  const generateToken = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(null)
    
    try {
      const response = await fetch('/api/extension/token', {
        method: 'POST',
      })
      const data = await response.json()
      
      if (data.success && data.data) {
        setToken(data.data.token)
        setTokenCreatedAt(data.data.created_at)
        setShowToken(true)
        setSuccess('New API token generated successfully! Copy it now - it won\'t be shown again.')
      } else {
        throw new Error(data.error || 'Failed to generate token')
      }
    } catch (err: any) {
      console.error('Error generating token:', err)
      setError(err.message || 'Failed to generate token')
    } finally {
      setIsSaving(false)
    }
  }

  const revokeToken = async () => {
    if (!confirm('Are you sure you want to revoke this token? Your extension will stop working until you generate a new one.')) {
      return
    }
    
    setIsSaving(true)
    setError(null)
    setSuccess(null)
    
    try {
      const response = await fetch('/api/extension/token', {
        method: 'DELETE',
      })
      const data = await response.json()
      
      if (data.success) {
        setToken(null)
        setTokenCreatedAt(null)
        setShowToken(false)
        setSuccess('Token revoked successfully')
      } else {
        throw new Error(data.error || 'Failed to revoke token')
      }
    } catch (err: any) {
      console.error('Error revoking token:', err)
      setError(err.message || 'Failed to revoke token')
    } finally {
      setIsSaving(false)
    }
  }

  const copyToken = async () => {
    if (!token) return
    
    try {
      await navigator.clipboard.writeText(token)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const maskedToken = token ? `${token.slice(0, 8)}${'•'.repeat(24)}${token.slice(-8)}` : null

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Puzzle className="w-6 h-6 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">Browser Extension</h1>
        </div>
        <p className="text-gray-400">
          Connect the TradeAutopsy browser extension to track your trading rules and goals in real-time.
        </p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
          {success}
        </div>
      )}

      {/* Download Extension Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-500/10 rounded-lg">
            <Chrome className="w-8 h-8 text-blue-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white mb-1">Get the Extension</h2>
            <p className="text-gray-400 text-sm mb-4">
              Install the TradeAutopsy extension to see your trading status right in your browser.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://chrome.google.com/webstore/detail/tradeautopsy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                Chrome Web Store
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-gray-500 text-sm self-center">
                Coming soon: Firefox, Edge
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* API Token Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Key className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg font-semibold text-white">API Token</h2>
        </div>
        
        <p className="text-gray-400 text-sm mb-4">
          Generate an API token to connect your browser extension. Keep this token secure and don't share it with anyone.
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 text-gray-500 animate-spin" />
          </div>
        ) : token ? (
          <div className="space-y-4">
            {/* Token Display */}
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 font-mono text-sm text-gray-300">
                {showToken ? token : maskedToken}
              </div>
              <button
                onClick={() => setShowToken(!showToken)}
                className="p-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors"
                title={showToken ? 'Hide token' : 'Show token'}
              >
                {showToken ? (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400" />
                )}
              </button>
              <button
                onClick={copyToken}
                className="p-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors"
                title="Copy token"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>

            {/* Token Info */}
            {tokenCreatedAt && (
              <p className="text-gray-500 text-sm">
                Created: {formatDate(tokenCreatedAt)}
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={generateToken}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
                Regenerate Token
              </button>
              <button
                onClick={revokeToken}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Revoke Token
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-400 mb-4">No API token generated yet.</p>
            <button
              onClick={generateToken}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Key className="w-5 h-5" />
              )}
              Generate API Token
            </button>
          </div>
        )}
      </div>

      {/* How to Connect Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">How to Connect</h2>
        
        <ol className="space-y-4">
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center font-semibold text-sm">
              1
            </span>
            <div>
              <p className="text-white font-medium">Install the extension</p>
              <p className="text-gray-400 text-sm">Download from Chrome Web Store and add to your browser.</p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center font-semibold text-sm">
              2
            </span>
            <div>
              <p className="text-white font-medium">Generate an API token</p>
              <p className="text-gray-400 text-sm">Click the button above to generate your unique token.</p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center font-semibold text-sm">
              3
            </span>
            <div>
              <p className="text-white font-medium">Paste token in extension</p>
              <p className="text-gray-400 text-sm">Open the extension, go to settings, and paste your token.</p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center font-semibold text-sm">
              4
            </span>
            <div>
              <p className="text-white font-medium">Start trading!</p>
              <p className="text-gray-400 text-sm">The extension will show your real-time trading status.</p>
            </div>
          </li>
        </ol>
      </div>

      {/* Extension Features Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Extension Features</h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 bg-gray-800/50 rounded-lg">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Shield className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-white font-medium">Rule Tracking</p>
              <p className="text-gray-400 text-sm">See which rules you're following or breaking in real-time.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 bg-gray-800/50 rounded-lg">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Bell className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-medium">Instant Alerts</p>
              <p className="text-gray-400 text-sm">Get desktop notifications when you violate a rule.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 bg-gray-800/50 rounded-lg">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-white font-medium">Real-time P&L</p>
              <p className="text-gray-400 text-sm">Track your daily P&L and trade count at a glance.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 bg-gray-800/50 rounded-lg">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Puzzle className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-white font-medium">Goal Progress</p>
              <p className="text-gray-400 text-sm">Monitor your daily, weekly, and monthly goal progress.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
