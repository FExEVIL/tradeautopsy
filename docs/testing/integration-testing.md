# Integration Testing Guide

## Overview

Integration tests verify that multiple parts of the system work together correctly, particularly API routes and database operations.

## Tools

- **Vitest:** Test runner (node environment)
- **Next.js Test Utils:** API route testing

## Testing API Routes

### Basic API Test

```typescript
import { POST } from '@/app/api/trades/manual/route'
import { testAuthenticatedEndpoint } from '@/__tests__/utils/api-utils'

describe('POST /api/trades/manual', () => {
  it('creates a trade', async () => {
    const response = await testAuthenticatedEndpoint(
      POST,
      'POST',
      { symbol: 'RELIANCE', quantity: 100 }
    )
    
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.trade).toBeDefined()
  })
})
```

### Testing Authentication

```typescript
it('returns 401 when not authenticated', async () => {
  const response = await testUnauthenticatedEndpoint(
    POST,
    'POST',
    { symbol: 'RELIANCE' }
  )
  
  expect(response.status).toBe(401)
})
```

### Testing Validation

```typescript
it('returns 400 for invalid data', async () => {
  const response = await testAuthenticatedEndpoint(
    POST,
    'POST',
    { symbol: '', quantity: -1 } // Invalid data
  )
  
  expect(response.status).toBe(400)
  const data = await response.json()
  expect(data.error).toBeDefined()
})
```

## Testing Database Operations

### Using Test Database

```typescript
import { createTestClient, seedTestData, cleanupTestData } from '@/__tests__/utils/db-utils'

describe('Database Operations', () => {
  beforeEach(async () => {
    await seedTestData('trades', [testTrade])
  })
  
  afterEach(async () => {
    await cleanupTestData('trades', testUser.id)
  })
  
  it('queries trades', async () => {
    const client = createTestClient()
    const { data, error } = await client
      .from('trades')
      .select('*')
      .eq('user_id', testUser.id)
    
    expect(error).toBeNull()
    expect(data).toHaveLength(1)
  })
})
```

## Testing RLS Policies

### Testing Row-Level Security

```typescript
it('prevents users from accessing other users data', async () => {
  const user1Client = createTestClient({ userId: user1.id })
  const user2Client = createTestClient({ userId: user2.id })
  
  // User 1 creates a trade
  await user1Client.from('trades').insert(testTrade)
  
  // User 2 tries to access it
  const { data } = await user2Client
    .from('trades')
    .select('*')
    .eq('id', testTrade.id)
  
  expect(data).toHaveLength(0) // Should be empty due to RLS
})
```

## Best Practices

1. **Use Test Database:** Never test against production data
2. **Clean Up:** Always clean up test data after tests
3. **Isolate Tests:** Each test should be independent
4. **Mock External Services:** Mock WorkOS, OpenAI, etc.
5. **Test Error Cases:** Include tests for error scenarios

## Common Patterns

### Testing Form Submissions

```typescript
it('handles form submission end-to-end', async () => {
  const formData = {
    symbol: 'RELIANCE',
    quantity: 100,
    entry_price: 2500,
  }
  
  const response = await testAuthenticatedEndpoint(
    POST,
    'POST',
    formData
  )
  
  expect(response.status).toBe(200)
  
  // Verify data was saved
  const client = createTestClient()
  const { data } = await client
    .from('trades')
    .select('*')
    .eq('symbol', 'RELIANCE')
    .single()
  
  expect(data).toBeDefined()
  expect(data.quantity).toBe(100)
})
```

### Testing Rate Limiting

```typescript
it('enforces rate limits', async () => {
  // Make multiple requests quickly
  const requests = Array(10).fill(null).map(() =>
    testAuthenticatedEndpoint(GET, 'GET')
  )
  
  const responses = await Promise.all(requests)
  const rateLimited = responses.filter(r => r.status === 429)
  
  expect(rateLimited.length).toBeGreaterThan(0)
})
```

