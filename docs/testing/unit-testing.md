# Unit Testing Guide

## Overview

Unit tests verify individual components, functions, and utilities in isolation.

## Tools

- **Vitest:** Test runner
- **React Testing Library:** Component testing
- **@testing-library/user-event:** User interaction simulation

## Testing Components

### Basic Component Test

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/auth/Button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })
})
```

### Testing User Interactions

```typescript
import userEvent from '@testing-library/user-event'

it('calls onClick when clicked', async () => {
  const handleClick = vi.fn()
  const user = userEvent.setup()
  
  render(<Button onClick={handleClick}>Click</Button>)
  await user.click(screen.getByRole('button'))
  
  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

### Testing Async Components

```typescript
import { waitFor } from '@testing-library/react'

it('loads and displays data', async () => {
  render(<DataComponent />)
  
  await waitFor(() => {
    expect(screen.getByText('Loaded data')).toBeInTheDocument()
  })
})
```

## Testing Hooks

### Custom Hook Test

```typescript
import { renderHook, act } from '@testing-library/react'
import { useCounter } from '@/hooks/useCounter'

describe('useCounter', () => {
  it('increments count', () => {
    const { result } = renderHook(() => useCounter())
    
    act(() => {
      result.current.increment()
    })
    
    expect(result.current.count).toBe(1)
  })
})
```

## Testing Utilities

### Pure Function Test

```typescript
import { formatCurrency } from '@/lib/utils/currency'

describe('formatCurrency', () => {
  it('formats positive numbers', () => {
    expect(formatCurrency(1000)).toBe('₹1,000')
  })
  
  it('formats negative numbers', () => {
    expect(formatCurrency(-1000)).toBe('-₹1,000')
  })
})
```

## Mocking

### Mock External Dependencies

```typescript
import { vi } from 'vitest'

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
  })),
}))
```

## Best Practices

1. **Test Behavior, Not Implementation:** Focus on what the component does, not how
2. **Use Semantic Queries:** Prefer `getByRole`, `getByLabelText` over `getByTestId`
3. **Test User Interactions:** Simulate real user behavior
4. **Keep Tests Simple:** One assertion per test when possible
5. **Use Descriptive Names:** Test names should be clear and specific

## Common Patterns

### Testing Forms

```typescript
it('submits form with valid data', async () => {
  const onSubmit = vi.fn()
  const user = userEvent.setup()
  
  render(<Form onSubmit={onSubmit} />)
  
  await user.type(screen.getByLabelText(/email/i), 'test@example.com')
  await user.click(screen.getByRole('button', { name: /submit/i }))
  
  expect(onSubmit).toHaveBeenCalledWith({ email: 'test@example.com' })
})
```

### Testing Error States

```typescript
it('displays error message', () => {
  render(<Component error="Something went wrong" />)
  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
})
```

### Testing Loading States

```typescript
it('shows loading indicator', () => {
  render(<Component loading />)
  expect(screen.getByRole('status')).toBeInTheDocument()
})
```

