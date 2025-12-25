/**
 * Unit Tests: OTPVerification Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OTPVerification from '@/components/auth/OTPVerification'

// Mock next/navigation
const mockPush = vi.fn()
const mockRefresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue('test@example.com'),
  }),
}))

// Mock fetch
global.fetch = vi.fn()

describe('OTPVerification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    })
  })

  it('should render 6 OTP input fields', () => {
    render(<OTPVerification />)
    const inputs = screen.getAllByRole('textbox')
    expect(inputs).toHaveLength(6)
  })

  it('should auto-advance to next input on digit entry', async () => {
    const user = userEvent.setup()
    render(<OTPVerification />)
    const inputs = screen.getAllByRole('textbox')

    await user.type(inputs[0], '1')
    expect(inputs[1]).toHaveFocus()
  })

  it('should handle paste of 6-digit code', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response)

    render(<OTPVerification />)
    const inputs = screen.getAllByRole('textbox')

    await user.click(inputs[0])
    await user.paste('123456')

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', code: '123456' }),
      })
    })
  })

  it('should display error on invalid OTP', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid code' }),
    } as Response)

    render(<OTPVerification />)
    const inputs = screen.getAllByRole('textbox')

    await user.type(inputs[0], '1')
    await user.type(inputs[1], '2')
    await user.type(inputs[2], '3')
    await user.type(inputs[3], '4')
    await user.type(inputs[4], '5')
    await user.type(inputs[5], '6')

    await waitFor(() => {
      expect(screen.getByText(/invalid code/i)).toBeInTheDocument()
    })
  })

  it('should redirect to dashboard on successful verification', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response)

    render(<OTPVerification />)
    const inputs = screen.getAllByRole('textbox')

    await user.type(inputs[0], '1')
    await user.type(inputs[1], '2')
    await user.type(inputs[2], '3')
    await user.type(inputs[3], '4')
    await user.type(inputs[4], '5')
    await user.type(inputs[5], '6')

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })
})

