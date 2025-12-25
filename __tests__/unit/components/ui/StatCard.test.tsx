/**
 * Unit Tests: StatCard Component
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatCard } from '@/components/ui/StatCard'

describe('StatCard', () => {
  it('should render label and value', () => {
    render(<StatCard label="Total PnL" value="₹10,000" />)
    expect(screen.getByText('Total PnL')).toBeInTheDocument()
    expect(screen.getByText('₹10,000')).toBeInTheDocument()
  })

  it('should render subtitle when provided', () => {
    render(
      <StatCard
        label="Win Rate"
        value="65%"
        subtitle="Above average"
      />
    )
    expect(screen.getByText('Above average')).toBeInTheDocument()
  })

  it('should render icon when provided', () => {
    render(
      <StatCard
        label="Trades"
        value="100"
        icon="target"
      />
    )
    // Icon should be rendered (check for icon container)
    const iconContainer = screen.getByText('Trades').parentElement?.querySelector('.p-2')
    expect(iconContainer).toBeInTheDocument()
  })

  it('should apply correct value color for positive number', () => {
    render(<StatCard label="PnL" value={1000} />)
    const valueElement = screen.getByText('1000')
    expect(valueElement).toHaveClass('text-green-400')
  })

  it('should apply correct value color for negative number', () => {
    render(<StatCard label="PnL" value={-1000} />)
    const valueElement = screen.getByText('-1000')
    expect(valueElement).toHaveClass('text-red-400')
  })

  it('should use custom value color when provided', () => {
    render(
      <StatCard
        label="Status"
        value="Active"
        valueColor="white"
      />
    )
    const valueElement = screen.getByText('Active')
    expect(valueElement).toHaveClass('text-white')
  })

  it('should render ReactNode as value', () => {
    render(
      <StatCard
        label="Custom"
        value={<span data-testid="custom-value">Custom Value</span>}
      />
    )
    expect(screen.getByTestId('custom-value')).toBeInTheDocument()
  })
})

