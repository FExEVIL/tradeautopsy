/**
 * Trade Factory
 * 
 * Factory for creating test trade data
 */

import { faker } from '@faker-js/faker'

export interface TradeFactoryOptions {
  id?: string
  user_id?: string
  profile_id?: string
  symbol?: string
  quantity?: number
  entry_price?: number
  exit_price?: number
  pnl?: number
  strategy?: 'SCALPING' | 'INTRADAY' | 'SWING' | 'OPTIONS'
  side?: 'BUY' | 'SELL'
  rating?: number
}

/**
 * Create a test trade with optional overrides
 */
export const createTestTrade = (overrides: TradeFactoryOptions = {}) => {
  const entryPrice = overrides.entry_price || faker.number.float({ min: 100, max: 10000, fractionDigits: 2 })
  const exitPrice = overrides.exit_price || (entryPrice * faker.number.float({ min: 0.95, max: 1.05, fractionDigits: 2 }))
  const quantity = overrides.quantity || faker.number.int({ min: 1, max: 1000 })
  const pnl = overrides.pnl ?? ((exitPrice - entryPrice) * quantity)
  
  return {
    id: overrides.id || faker.string.uuid(),
    user_id: overrides.user_id || faker.string.uuid(),
    profile_id: overrides.profile_id || faker.string.uuid(),
    symbol: overrides.symbol || faker.string.alpha({ length: 5, casing: 'upper' }),
    quantity,
    entry_price: entryPrice,
    exit_price: exitPrice,
    entry_time: faker.date.past().toISOString(),
    exit_time: faker.date.recent().toISOString(),
    side: overrides.side || (faker.datatype.boolean() ? 'BUY' : 'SELL'),
    strategy: overrides.strategy || faker.helpers.arrayElement(['SCALPING', 'INTRADAY', 'SWING', 'OPTIONS']),
    pnl,
    pnl_percentage: (pnl / (entryPrice * quantity)) * 100,
    fees: faker.number.float({ min: 10, max: 100, fractionDigits: 2 }),
    notes: faker.lorem.sentence(),
    tags: faker.helpers.arrayElements(['test', 'intraday', 'swing', 'options'], { min: 0, max: 3 }),
    emotion: faker.helpers.arrayElement(['confident', 'anxious', 'frustrated', 'excited', 'calm']),
    rating: overrides.rating || faker.number.int({ min: 1, max: 5 }),
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.recent().toISOString(),
  }
}

/**
 * Create a profitable trade
 */
export const createProfitableTrade = (overrides: TradeFactoryOptions = {}) => {
  const entryPrice = overrides.entry_price || faker.number.float({ min: 100, max: 10000, fractionDigits: 2 })
  const exitPrice = entryPrice * faker.number.float({ min: 1.01, max: 1.10, fractionDigits: 2 })
  const quantity = overrides.quantity || faker.number.int({ min: 1, max: 1000 })
  
  return createTestTrade({
    ...overrides,
    entry_price: entryPrice,
    exit_price: exitPrice,
    pnl: (exitPrice - entryPrice) * quantity,
    rating: 4,
    emotion: 'confident',
  })
}

/**
 * Create a losing trade
 */
export const createLosingTrade = (overrides: TradeFactoryOptions = {}) => {
  const entryPrice = overrides.entry_price || faker.number.float({ min: 100, max: 10000, fractionDigits: 2 })
  const exitPrice = entryPrice * faker.number.float({ min: 0.90, max: 0.99, fractionDigits: 2 })
  const quantity = overrides.quantity || faker.number.int({ min: 1, max: 1000 })
  
  return createTestTrade({
    ...overrides,
    entry_price: entryPrice,
    exit_price: exitPrice,
    pnl: (exitPrice - entryPrice) * quantity,
    rating: 2,
    emotion: 'frustrated',
  })
}

/**
 * Create multiple test trades
 */
export const createTestTrades = (count: number, overrides: TradeFactoryOptions = {}) => {
  return Array.from({ length: count }, () => createTestTrade(overrides))
}

