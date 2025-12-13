import { Trade } from '@/types/trade'

export interface BrokerCredentials {
  apiKey?: string
  apiSecret?: string
  accessToken?: string
  refreshToken?: string
  [key: string]: any
}

export interface ConnectionResult {
  success: boolean
  accessToken?: string
  refreshToken?: string
  expiresAt?: Date
  error?: string
}

export interface ConnectionStatus {
  connected: boolean
  status: 'connected' | 'disconnected' | 'error'
  lastSync?: Date
  error?: string
}

export interface BrokerConnector {
  name: string
  type: string
  
  // Connection
  connect(credentials: BrokerCredentials): Promise<ConnectionResult>
  disconnect(): Promise<void>
  getConnectionStatus(): Promise<ConnectionStatus>
  refreshToken(): Promise<ConnectionResult>
  
  // Trade fetching
  fetchTrades(fromDate: Date, toDate: Date): Promise<Trade[]>
  fetchLatestTrades(limit?: number): Promise<Trade[]>
  
  // Normalization
  normalizeTrade(rawTrade: any): Trade
}

/**
 * Base connector with common functionality
 */
export abstract class BaseBrokerConnector implements BrokerConnector {
  abstract name: string
  abstract type: string
  protected credentials: BrokerCredentials | null = null

  abstract connect(credentials: BrokerCredentials): Promise<ConnectionResult>
  abstract disconnect(): Promise<void>
  abstract getConnectionStatus(): Promise<ConnectionStatus>
  abstract refreshToken(): Promise<ConnectionResult>
  abstract fetchTrades(fromDate: Date, toDate: Date): Promise<Trade[]>
  abstract fetchLatestTrades(limit?: number): Promise<Trade[]>
  abstract normalizeTrade(rawTrade: any): Trade

  protected setCredentials(credentials: BrokerCredentials) {
    this.credentials = credentials
  }

  protected clearCredentials() {
    this.credentials = null
  }
}
