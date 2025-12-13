'use client'

import { useState } from 'react'
import { Plus, Trash2, RefreshCw, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { BrokerConnectorFactory } from '@/lib/brokers/connector-factory'

interface Broker {
  id: string
  name: string
  broker_type: string
  connection_status: string
  last_sync_at: string | null
  created_at: string
}

interface Profile {
  id: string
  name: string
  color: string
}

interface BrokersClientProps {
  initialBrokers: Broker[]
  profiles: Profile[]
}

export default function BrokersClient({ initialBrokers, profiles }: BrokersClientProps) {
  const [brokers, setBrokers] = useState<Broker[]>(initialBrokers)
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const supabase = createClient()

  const supportedBrokers = BrokerConnectorFactory.getSupportedBrokers()

  const handleConnect = async (brokerType: string) => {
    if (brokerType === 'zerodha') {
      // Redirect to Zerodha OAuth
      window.location.href = '/api/zerodha/auth'
      return
    }

    // For other brokers, show "coming soon" message
    alert(`${brokerType} integration coming soon!`)
  }

  const handleDisconnect = async (brokerId: string) => {
    if (!confirm('Are you sure you want to disconnect this broker?')) return

    setLoading({ ...loading, [brokerId]: true })
    try {
      let response: Response
      try {
        response = await fetch(`/api/brokers/${brokerId}`, {
          method: 'DELETE',
        })
      } catch (fetchError: any) {
        if (fetchError.message?.includes('Failed to fetch') || fetchError.name === 'TypeError') {
          alert('Network error. Please check your internet connection and try again.')
          return
        }
        throw fetchError
      }

      if (response.ok) {
        setBrokers(brokers.filter(b => b.id !== brokerId))
      } else {
        let errorMessage = 'Failed to disconnect broker'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.details || errorMessage
        } catch {
          errorMessage = response.statusText || errorMessage
        }
        alert(errorMessage)
      }
    } catch (error: any) {
      console.error('Error disconnecting broker:', error)
      alert(`Error disconnecting broker: ${error.message || 'Unknown error'}`)
    } finally {
      setLoading({ ...loading, [brokerId]: false })
    }
  }

  const handleFetchTrades = async (brokerId: string) => {
    setLoading({ ...loading, [brokerId]: true })
    try {
      let response: Response
      try {
        response = await fetch(`/api/brokers/${brokerId}/fetch-trades`, {
          method: 'POST',
        })
      } catch (fetchError: any) {
        if (fetchError.message?.includes('Failed to fetch') || fetchError.name === 'TypeError') {
          alert('❌ Network error. Please check your internet connection and try again.')
          return
        }
        throw fetchError
      }

      if (response.ok) {
        const data = await response.json()
        const message = data.message || `Successfully fetched ${data.count || 0} trades`
        
        // Show success message
        if (data.count > 0) {
          alert(`✅ ${message}`)
        } else {
          alert(`ℹ️ ${message || 'No new trades found'}`)
        }
        
        // Update last_sync_at
        setBrokers(brokers.map(b => 
          b.id === brokerId 
            ? { ...b, last_sync_at: new Date().toISOString() }
            : b
        ))
        
        // Refresh page to show new trades
        window.location.reload()
      } else {
        let errorMessage = 'Failed to fetch trades'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.details || errorMessage
        } catch {
          errorMessage = response.statusText || errorMessage
        }
        alert(`❌ Error: ${errorMessage}\n\nPossible causes:\n- Broker not connected\n- Invalid API credentials\n- Network error\n- Broker API rate limit`)
      }
    } catch (error: any) {
      console.error('Error fetching trades:', error)
      alert(`❌ Network error: ${error.message || 'Failed to connect to server'}`)
    } finally {
      setLoading({ ...loading, [brokerId]: false })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Broker Connections</h1>
          <p className="text-gray-400 mt-1">Connect your trading accounts to auto-import trades</p>
        </div>
      </div>

      {/* Connected Brokers */}
      {brokers.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Connected Brokers</h2>
          {brokers.map((broker) => (
            <div
              key={broker.id}
              className="bg-[#111111] border border-gray-800 rounded-xl p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getStatusIcon(broker.connection_status)}
                  <div>
                    <h3 className="text-lg font-semibold text-white">{broker.name}</h3>
                    <p className="text-sm text-gray-400 capitalize">{broker.broker_type}</p>
                    {broker.last_sync_at && (
                      <p className="text-xs text-gray-500 mt-1">
                        Last synced: {new Date(broker.last_sync_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleFetchTrades(broker.id)}
                    disabled={loading[broker.id] || broker.connection_status !== 'connected'}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    {loading[broker.id] ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Fetching...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        Fetch Trades
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDisconnect(broker.id)}
                    disabled={loading[broker.id]}
                    className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Disconnect
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Available Brokers */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Available Brokers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {supportedBrokers.map((broker) => {
            const isConnected = brokers.some(b => b.broker_type === broker.type)
            
            return (
              <div
                key={broker.type}
                className="bg-[#111111] border border-gray-800 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{broker.name}</h3>
                  {isConnected && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                      Connected
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  {broker.available 
                    ? 'Connect your account to auto-import trades'
                    : 'Coming soon'}
                </p>
                <button
                  onClick={() => handleConnect(broker.type)}
                  disabled={!broker.available || isConnected}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {isConnected ? 'Connected' : broker.available ? 'Connect' : 'Coming Soon'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
