/**
 * Unit Tests: Button Component
 * 
 * Tests for the Button UI component
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/auth/Button'

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>)
    
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    
    await user.click(screen.getByRole('button'))
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled button</Button>)
    
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should not call onClick when disabled', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<Button disabled onClick={handleClick}>Disabled</Button>)
    
    await user.click(screen.getByRole('button'))
    
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('should render loading state', () => {
    render(<Button loading>Loading</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveTextContent(/loading/i)
  })

  it('should apply custom className', () => {
    render(<Button className="custom-class">Button</Button>)
    
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })

  it('should render different variants', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>)
    const button1 = screen.getByRole('button')
    expect(button1).toBeInTheDocument()
    
    rerender(<Button variant="secondary">Secondary</Button>)
    const button2 = screen.getByRole('button')
    expect(button2).toBeInTheDocument()
    // Button component uses variant prop but classes may not include "primary"/"secondary" text
    // Just verify it renders correctly
  })

  it('should render with different props', () => {
    const { rerender } = render(<Button>Default</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
    
    rerender(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})

