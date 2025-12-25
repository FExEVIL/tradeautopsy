/**
 * User Factory
 * 
 * Factory for creating test user data
 */

import { faker } from '@faker-js/faker'

export interface UserFactoryOptions {
  id?: string
  email?: string
  workosUserId?: string
  firstName?: string
  lastName?: string
  emailVerified?: boolean
  role?: string
}

/**
 * Create a test user with optional overrides
 */
export const createTestUser = (overrides: UserFactoryOptions = {}) => {
  return {
    id: overrides.id || faker.string.uuid(),
    email: overrides.email || faker.internet.email(),
    workosUserId: overrides.workosUserId || `user_${faker.string.alphanumeric(10)}`,
    firstName: overrides.firstName || faker.person.firstName(),
    lastName: overrides.lastName || faker.person.lastName(),
    emailVerified: overrides.emailVerified ?? true,
    role: overrides.role || 'user',
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
  }
}

/**
 * Create multiple test users
 */
export const createTestUsers = (count: number, overrides: UserFactoryOptions = {}) => {
  return Array.from({ length: count }, () => createTestUser(overrides))
}

