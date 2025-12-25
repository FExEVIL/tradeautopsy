/**
 * Test Utilities for React Components
 * 
 * Provides custom render function with all necessary providers
 */

import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { vi } from 'vitest'
import { ThemeProvider } from '@/components/ThemeProvider'
import { ProfileProvider } from '@/lib/contexts/ProfileContext'

/**
 * Custom render function that includes all providers
 */
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      <ProfileProvider>
        {children}
      </ProfileProvider>
    </ThemeProvider>
  )
}

/**
 * Custom render function for testing React components
 * 
 * @param ui - The component to render
 * @param options - Render options
 * @returns Render result with all queries
 * 
 * @example
 * ```tsx
 * const { getByText } = renderWithProviders(<Button>Click me</Button>)
 * expect(getByText('Click me')).toBeInTheDocument()
 * ```
 */
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything from @testing-library/react
export * from '@testing-library/react'

// Override render method
export { customRender as render }

/**
 * Wait for a condition to be true
 * 
 * @param condition - Function that returns a boolean
 * @param timeout - Maximum time to wait (default: 5000ms)
 * @param interval - Check interval (default: 100ms)
 */
export const waitForCondition = async (
  condition: () => boolean,
  timeout = 5000,
  interval = 100,
): Promise<void> => {
  const startTime = Date.now()
  
  while (Date.now() - startTime < timeout) {
    if (condition()) {
      return
    }
    await new Promise((resolve) => setTimeout(resolve, interval))
  }
  
  throw new Error(`Condition not met within ${timeout}ms`)
}

/**
 * Create a mock function that returns a promise
 */
export const createAsyncMock = <T,>(data: T, delay = 0) => {
  return vi.fn(async () => {
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
    return data
  })
}

/**
 * Create a mock function that throws an error
 */
export const createErrorMock = (error: Error) => {
  return vi.fn(async () => {
    throw error
  })
}

