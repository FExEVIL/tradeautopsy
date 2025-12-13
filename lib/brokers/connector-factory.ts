import { BrokerConnector } from './base-connector'
import { ZerodhaConnector } from './zerodha-connector'

export type BrokerType = 'zerodha' | 'upstox' | 'angel_one' | 'custom'

/**
 * Factory to create broker connectors
 */
export class BrokerConnectorFactory {
  static create(type: BrokerType): BrokerConnector {
    switch (type) {
      case 'zerodha':
        return new ZerodhaConnector()
      case 'upstox':
        // TODO: Implement UpstoxConnector
        throw new Error('Upstox connector not yet implemented')
      case 'angel_one':
        // TODO: Implement AngelOneConnector
        throw new Error('Angel One connector not yet implemented')
      case 'custom':
        // TODO: Implement CustomConnector for CSV/manual
        throw new Error('Custom connector not yet implemented')
      default:
        throw new Error(`Unknown broker type: ${type}`)
    }
  }

  static getSupportedBrokers(): Array<{ type: BrokerType; name: string; available: boolean }> {
    return [
      { type: 'zerodha', name: 'Zerodha', available: true },
      { type: 'upstox', name: 'Upstox', available: false },
      { type: 'angel_one', name: 'Angel One', available: false },
      { type: 'custom', name: 'Custom/CSV', available: false }
    ]
  }
}
