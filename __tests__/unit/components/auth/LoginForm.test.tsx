/**
 * Unit Tests: LoginForm Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginForm from '@/components/auth/LoginForm'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
}))

// Mock fetch
global.fetch = vi.fn()

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render email input field', () => {
    render(<LoginForm />)
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
  })

  it('should show error message from URL params', () => {
    const mockGet = vi.fn().mockReturnValue('Invalid credentials')
    vi.mocked(require('next/navigation').useSearchParams).mockReturnValue({
      get: mockGet,
    } as any)

    render(<LoginForm />)
    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
  })

  it('should submit email and move to OTP step', async () => {
    const user = userEvent.setup()
    const mockPush = vi.fn()
    vi.mocked(require('next/navigation').useRouter).mockReturnValue({
      push: mockPush,
    } as any)

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response)

    render(<LoginForm />)
    const emailInput = screen.getByPlaceholderText(/email/i)
    const submitButton = screen.getByRole('button', { name: /continue/i })

    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' }),
      })
    })
  })

  it('should display error on failed email submission', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid email' }),
    } as Response)

    render(<LoginForm />)
    const emailInput = screen.getByPlaceholderText(/email/i)
    const submitButton = screen.getByRole('button', { name: /continue/i })

    await user.type(emailInput, 'invalid')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
    })
  })
})

