/**
 * Trade Test Fixtures
 * 
 * Pre-defined trade data for testing
 */

import { testUser } from './users'

export const testTrade = {
  id: '00000000-0000-0000-0000-000000000010',
  user_id: testUser.id,
  profile_id: '00000000-0000-0000-0000-000000000020',
  symbol: 'RELIANCE',
  quantity: 100,
  entry_price: 2500,
  exit_price: 2550,
  entry_time: new Date('2024-01-15T10:00:00Z').toISOString(),
  exit_time: new Date('2024-01-15T15:30:00Z').toISOString(),
  side: 'BUY',
  strategy: 'INTRADAY',
  pnl: 5000,
  pnl_percentage: 2.0,
  fees: 50,
  notes: 'Test trade',
  tags: ['test', 'intraday'],
  emotion: 'confident',
  rating: 4,
  created_at: new Date('2024-01-15T10:00:00Z').toISOString(),
  updated_at: new Date('2024-01-15T15:30:00Z').toISOString(),
}

export const profitableTrade = {
  ...testTrade,
  id: '00000000-0000-0000-0000-000000000011',
  exit_price: 2600,
  pnl: 10000,
  pnl_percentage: 4.0,
  rating: 5,
}

export const losingTrade = {
  ...testTrade,
  id: '00000000-0000-0000-0000-000000000012',
  exit_price: 2450,
  pnl: -5000,
  pnl_percentage: -2.0,
  rating: 2,
  emotion: 'frustrated',
}

export const optionsTrade = {
  ...testTrade,
  id: '00000000-0000-0000-0000-000000000013',
  symbol: 'NIFTY24000CE',
  strategy: 'OPTIONS',
  option_type: 'CE',
  strike_price: 24000,
  expiry_date: new Date('2024-01-25').toISOString(),
  premium: 150,
  quantity: 50,
}

export const swingTrade = {
  ...testTrade,
  id: '00000000-0000-0000-0000-000000000014',
  strategy: 'SWING',
  entry_time: new Date('2024-01-10T10:00:00Z').toISOString(),
  exit_time: new Date('2024-01-20T15:30:00Z').toISOString(),
  tags: ['swing', 'hold'],
}

export const multipleTrades = [
  testTrade,
  profitableTrade,
  losingTrade,
  optionsTrade,
  swingTrade,
]

