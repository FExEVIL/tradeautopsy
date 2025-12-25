/**
 * User Test Fixtures
 * 
 * Pre-defined user data for testing
 */

export const testUser = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'test@example.com',
  workosUserId: 'user_test123',
  firstName: 'Test',
  lastName: 'User',
  emailVerified: true,
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-01').toISOString(),
}

export const testUser2 = {
  id: '00000000-0000-0000-0000-000000000002',
  email: 'test2@example.com',
  workosUserId: 'user_test456',
  firstName: 'Test',
  lastName: 'User2',
  emailVerified: true,
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-01').toISOString(),
}

export const unverifiedUser = {
  id: '00000000-0000-0000-0000-000000000003',
  email: 'unverified@example.com',
  workosUserId: 'user_unverified',
  firstName: 'Unverified',
  lastName: 'User',
  emailVerified: false,
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-01').toISOString(),
}

export const adminUser = {
  id: '00000000-0000-0000-0000-000000000004',
  email: 'admin@example.com',
  workosUserId: 'user_admin',
  firstName: 'Admin',
  lastName: 'User',
  emailVerified: true,
  role: 'admin',
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-01').toISOString(),
}

