/**
 * Test Utilities
 * Custom render function and test helpers
 */

import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from '@/components/ThemeProvider'
import { ToastProvider } from '@/app/dashboard/components/Toast'

// ============================================
// CUSTOM RENDER WITH PROVIDERS
// ============================================

interface AllTheProvidersProps {
  children: React.ReactNode
}

function AllTheProviders({ children }: AllTheProvidersProps) {
  return (
    <ThemeProvider>
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// ============================================
// MOCK SUPABASE CLIENT
// ============================================

export const mockSupabaseClient = {
  auth: {
    getUser: jest.fn().mockResolvedValue({
      data: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
        },
      },
      error: null,
    }),
    signIn: jest.fn(),
    signOut: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
  })),
}

// ============================================
// TEST FIXTURES
// ============================================

export const mockTrade: any = {
  id: 'trade-1',
  user_id: 'test-user-id',
  profile_id: null,
  trade_date: '2025-01-01',
  symbol: 'RELIANCE',
  side: 'LONG',
  quantity: 10,
  entry_price: 2500,
  exit_price: 2550,
  pnl: 500,
  strategy: 'Breakout',
  created_at: '2025-01-01T10:00:00Z',
  updated_at: '2025-01-01T10:00:00Z',
  deleted_at: null,
}

export const mockProfile: any = {
  id: 'profile-1',
  user_id: 'test-user-id',
  name: 'Test Profile',
  type: 'equity',
  color: '#10B981',
  icon: 'default',
  is_default: true,
  created_at: '2025-01-01T10:00:00Z',
  updated_at: '2025-01-01T10:00:00Z',
  deleted_at: null,
}

export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: '2025-01-01T10:00:00Z',
}

// ============================================
// EXPORTS
// ============================================

export * from '@testing-library/react'
export { customRender as render }
export { mockSupabaseClient, mockTrade, mockProfile, mockUser }

