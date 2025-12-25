# Testing Guide for TradeAutopsy

## Overview

TradeAutopsy uses a comprehensive testing strategy covering unit tests, integration tests, E2E tests, performance tests, and security tests.

## Testing Stack

- **Unit/Integration Tests:** Vitest + React Testing Library
- **E2E Tests:** Playwright
- **Performance Tests:** Lighthouse CI
- **Load Tests:** k6
- **Security Tests:** Custom test suite

## Quick Start

### Run All Tests

```bash
npm run test:all
```

### Run Specific Test Types

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Security tests
npm run test:security

# Performance tests
npm run test:performance
```

### Watch Mode

```bash
npm run test:watch
```

### Coverage

```bash
npm run test:coverage
```

## Test Structure

```
__tests__/
├── unit/              # Unit tests for components, hooks, utils
├── integration/       # Integration tests for API routes
├── security/          # Security tests
├── performance/       # Performance tests
├── fixtures/          # Test data fixtures
├── factories/         # Test data factories
├── mocks/             # Mock implementations
└── utils/             # Test utilities

e2e/
├── auth.spec.ts       # Authentication E2E tests
├── dashboard.spec.ts  # Dashboard E2E tests
└── ...
```

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/auth/Button'

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
```

### Integration Test Example

```typescript
import { describe, it, expect } from 'vitest'
import { POST } from '@/app/api/trades/manual/route'
import { testAuthenticatedEndpoint } from '@/__tests__/utils/api-utils'

describe('POST /api/trades/manual', () => {
  it('should create a trade', async () => {
    const response = await testAuthenticatedEndpoint(
      POST,
      'POST',
      { symbol: 'RELIANCE', quantity: 100 }
    )
    expect(response.status).toBe(200)
  })
})
```

## Test Utilities

### Custom Render

```typescript
import { render } from '@/__tests__/utils/test-utils'

// Automatically includes all providers
render(<MyComponent />)
```

### Test Fixtures

```typescript
import { testUser, testTrade } from '@/__tests__/fixtures'

// Use pre-defined test data
const user = testUser
const trade = testTrade
```

### Test Factories

```typescript
import { createTestUser, createTestTrade } from '@/__tests__/factories'

// Generate test data dynamically
const user = createTestUser({ email: 'custom@example.com' })
const trade = createTestTrade({ symbol: 'NIFTY' })
```

## Best Practices

1. **Test One Thing:** Each test should verify one behavior
2. **Use Descriptive Names:** Test names should clearly describe what they test
3. **Arrange-Act-Assert:** Structure tests with clear sections
4. **Mock External Dependencies:** Don't make real API calls in unit tests
5. **Clean Up:** Reset mocks and clean up after each test
6. **Test Edge Cases:** Include tests for error states and boundary conditions

## Coverage Goals

- **Unit Tests:** 80%+ coverage
- **Integration Tests:** All API routes covered
- **E2E Tests:** All user journeys covered

## CI/CD

Tests run automatically on:
- Push to main/develop branches
- Pull requests
- Scheduled runs (performance, security)

## Troubleshooting

See [TROUBLESHOOTING.md](./troubleshooting.md) for common issues and solutions.

## Additional Resources

- [Unit Testing Guide](./unit-testing.md)
- [Integration Testing Guide](./integration-testing.md)
- [E2E Testing Guide](./e2e-testing.md)
- [Performance Testing Guide](./performance-testing.md)

