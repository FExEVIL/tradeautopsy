import { BaseBrokerConnector, BrokerCredentials, ConnectionResult, ConnectionStatus } from './base-connector'
import { Trade } from '@/types/trade'
import { format } from 'date-fns'

export class ZerodhaConnector extends BaseBrokerConnector {
  name = 'Zerodha'
  type = 'zerodha'
  private baseUrl = 'https://kite.zerodha.com'

  async connect(credentials: BrokerCredentials): Promise<ConnectionResult> {
    try {
      // Validate credentials
      if (!credentials.apiKey || !credentials.apiSecret) {
        return {
          success: false,
          error: 'API key and secret are required'
        }
      }

      this.setCredentials(credentials)

      // If access token is provided, validate it
      if (credentials.accessToken) {
        const status = await this.getConnectionStatus()
        if (status.connected) {
          return {
            success: true,
            accessToken: credentials.accessToken,
            refreshToken: credentials.refreshToken,
            expiresAt: credentials.tokenExpiresAt ? new Date(credentials.tokenExpiresAt) : undefined
          }
        }
      }

      // Otherwise, need OAuth flow (handled separately in UI)
      return {
        success: false,
        error: 'OAuth authentication required. Please use the connect button in settings.'
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to connect to Zerodha'
      }
    }
  }

  async disconnect(): Promise<void> {
    this.clearCredentials()
  }

  async getConnectionStatus(): Promise<ConnectionStatus> {
    if (!this.credentials?.accessToken || !this.credentials?.apiKey) {
      return {
        connected: false,
        status: 'disconnected',
        error: 'Missing credentials'
      }
    }

    try {
      // Test connection by fetching user profile
      const response = await fetch(`${this.baseUrl}/oms/user/profile`, {
        headers: {
          'Authorization': `token ${this.credentials.apiKey}:${this.credentials.accessToken}`
        }
      })

      if (response.ok) {
        return {
          connected: true,
          status: 'connected'
        }
      } else if (response.status === 401 || response.status === 403) {
        return {
          connected: false,
          status: 'error',
          error: 'Invalid or expired access token. Please reconnect.'
        }
      } else {
        return {
          connected: false,
          status: 'error',
          error: `API error: ${response.status} ${response.statusText}`
        }
      }
    } catch (error: any) {
      return {
        connected: false,
        status: 'error',
        error: error.message || 'Connection check failed'
      }
    }
  }

  async refreshToken(): Promise<ConnectionResult> {
    // Zerodha tokens don't typically expire, but if refresh is needed:
    return {
      success: false,
      error: 'Token refresh not supported. Please reconnect.'
    }
  }

  async fetchTrades(fromDate: Date, toDate: Date): Promise<Trade[]> {
    if (!this.credentials?.accessToken || !this.credentials?.apiKey) {
      throw new Error('Not connected to Zerodha. Missing API credentials.')
    }

    try {
      // Fetch orders/trades from Zerodha API
      const fromDateStr = format(fromDate, 'yyyy-MM-dd')
      const toDateStr = format(toDate, 'yyyy-MM-dd')

      const response = await fetch(
        `${this.baseUrl}/oms/orders?from=${fromDateStr}&to=${toDateStr}`,
        {
          headers: {
            'Authorization': `token ${this.credentials.apiKey}:${this.credentials.accessToken}`
          }
        }
      )

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Authentication failed. Please reconnect your Zerodha account.')
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.')
        } else {
          const errorText = await response.text().catch(() => response.statusText)
          throw new Error(`Zerodha API error (${response.status}): ${errorText}`)
        }
      }

      const data = await response.json()
      const orders = data.data || []

      if (!Array.isArray(orders)) {
        throw new Error('Invalid response format from Zerodha API')
      }

      // Transform to TradeAutopsy format
      return orders.map((order: any) => this.normalizeTrade(order))
    } catch (error: any) {
      throw new Error(`Failed to fetch trades: ${error.message}`)
    }
  }

  async fetchLatestTrades(limit: number = 50): Promise<Trade[]> {
    const toDate = new Date()
    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - 30) // Last 30 days

    const trades = await this.fetchTrades(fromDate, toDate)
    return trades.slice(0, limit)
  }

  normalizeTrade(rawTrade: any): Trade {
    // Transform Zerodha order format to TradeAutopsy Trade format
    const transactionType = rawTrade.transaction_type || rawTrade.side || 'BUY'
    return {
      id: rawTrade.order_id || rawTrade.trade_id || '',
      tradingsymbol: rawTrade.tradingsymbol || rawTrade.instrument_token || '',
      transaction_type: transactionType,
      side: transactionType, // Map transaction_type to side
      quantity: rawTrade.quantity || rawTrade.filled_quantity || 0,
      average_price: rawTrade.average_price || rawTrade.price || 0,
      entry_price: rawTrade.average_price || rawTrade.price || 0,
      exit_price: rawTrade.exit_price || null,
      trade_date: rawTrade.order_timestamp || rawTrade.timestamp || new Date().toISOString(),
      pnl: rawTrade.pnl || null,
      status: rawTrade.status || 'COMPLETE',
      product: rawTrade.product || 'MIS',
      trade_id: rawTrade.order_id || rawTrade.trade_id || null
    }
  }
}
