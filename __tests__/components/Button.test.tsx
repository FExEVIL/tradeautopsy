/**
 * Button Component Tests
 * Example React component testing
 */

import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Example button component test
// Replace with actual Button component from your codebase
describe('Button Component', () => {
  it('should render button with text', () => {
    render(<button>Click me</button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<button onClick={handleClick}>Click me</button>)
    
    await user.click(screen.getByRole('button'))
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<button disabled>Disabled</button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})

