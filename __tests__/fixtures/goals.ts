/**
 * Goal Test Fixtures
 * 
 * Pre-defined goal data for testing
 */

import { testUser } from './users'

export const testGoal = {
  id: '00000000-0000-0000-0000-000000000030',
  user_id: testUser.id,
  profile_id: '00000000-0000-0000-0000-000000000020',
  title: 'Achieve 70% Win Rate',
  description: 'Maintain a win rate of 70% or higher',
  target_value: 70,
  current_value: 65,
  unit: 'percentage',
  deadline: new Date('2024-12-31').toISOString(),
  status: 'active',
  created_at: new Date('2024-01-01').toISOString(),
  updated_at: new Date('2024-01-01').toISOString(),
}

export const completedGoal = {
  ...testGoal,
  id: '00000000-0000-0000-0000-000000000031',
  title: 'Reach ₹1L Monthly Profit',
  target_value: 100000,
  current_value: 120000,
  unit: 'currency',
  status: 'completed',
  completed_at: new Date('2024-06-15').toISOString(),
}

export const expiredGoal = {
  ...testGoal,
  id: '00000000-0000-0000-0000-000000000032',
  title: 'Learn Options Trading',
  deadline: new Date('2024-01-01').toISOString(),
  status: 'expired',
}

