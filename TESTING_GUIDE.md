# Testing Infrastructure Guide

## Overview

TradeAutopsy uses a comprehensive testing setup with:
- **Jest** for unit and integration tests
- **Playwright** for end-to-end (E2E) tests
- **React Testing Library** for component tests

---

## Quick Start

### Install Dependencies

```bash
npm install
```

### Install Playwright Browsers

```bash
# Install only Chromium and Firefox (recommended - most reliable)
npm run test:e2e:install

# Or install all browsers (may fail on some systems)
npm run test:e2e:install:all

# Or install manually
npx playwright install chromium
npx playwright install firefox
```

### Run Tests

```bash
# Unit tests
npm test

# Unit tests in watch mode
npm run test:watch

# Unit tests with coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui

# E2E tests in debug mode
npm run test:e2e:debug

# Run all tests
npm run test:all
```

---

## Unit Tests

### Structure

Unit tests are located in:
- `__tests__/` - Main test directory
- `**/*.test.ts` - Test files alongside source files
- `**/*.spec.ts` - Alternative test file naming

### Example Test

```typescript
import { formatCurrency } from '@/lib/utils/currency'

describe('formatCurrency', () => {
  it('should format positive numbers', () => {
    expect(formatCurrency(123456.78)).toBe('₹1,23,456.78')
  })
})
```

### Running Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for specific file
npm test -- currency.test.ts
```

### Coverage Thresholds

Current coverage thresholds (in `jest.config.js`):
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

---

## E2E Tests

### Structure

E2E tests are located in:
- `e2e/` - E2E test directory
- `*.spec.ts` - Test specification files

### Example E2E Test

```typescript
import { test, expect } from '@playwright/test'

test('should display login page', async ({ page }) => {
  await page.goto('/login')
  await expect(page).toHaveTitle(/TradeAutopsy/i)
})
```

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug

# Run specific test file
npx playwright test e2e/auth.spec.ts
```

### E2E Test Configuration

Configuration is in `playwright.config.ts`:
- Tests run against `http://localhost:3000` by default
- Automatically starts dev server before tests
- Supports multiple browsers (Chrome, Firefox, Safari)
- Includes mobile viewport tests

---

## Test Utilities

### Test Helpers

Located in `__tests__/utils/test-helpers.ts`:

```typescript
import { createMockSession, createMockTrade } from '@/__tests__/utils/test-helpers'

// Create mock session
const session = createMockSession({ email: 'test@example.com' })

// Create mock trade
const trade = createMockTrade({ symbol: 'NIFTY', pnl: 1000 })
```

### Available Helpers

- `createMockSession()` - Create mock session data
- `createMockTrade()` - Create mock trade object
- `createMockProfile()` - Create mock profile object
- `createMockRequest()` - Create mock Next.js request
- `createMockResponse()` - Create mock Next.js response
- `waitFor()` - Wait for async operations

---

## Writing Tests

### Unit Test Best Practices

1. **Test one thing at a time**
   ```typescript
   it('should format positive numbers', () => {
     expect(formatCurrency(1000)).toBe('₹1,000.00')
   })
   ```

2. **Use descriptive test names**
   ```typescript
   // Good
   it('should return null when session cookie is missing')
   
   // Bad
   it('should work')
   ```

3. **Test edge cases**
   ```typescript
   it('should handle null values', () => {
     expect(formatCurrency(null)).toBe('₹0')
   })
   ```

4. **Mock external dependencies**
   ```typescript
   jest.mock('@/lib/workos', () => ({
     workos: { userManagement: { authenticateWithPassword: jest.fn() } }
   }))
   ```

### Component Test Best Practices

1. **Test user interactions, not implementation**
   ```typescript
   // Good - tests user behavior
   await user.click(screen.getByRole('button', { name: /submit/i }))
   
   // Bad - tests implementation
   expect(button.props.onClick).toHaveBeenCalled()
   ```

2. **Use accessible queries**
   ```typescript
   // Good
   screen.getByRole('button', { name: /submit/i })
   screen.getByLabelText(/email/i)
   
   // Avoid
   screen.getByTestId('submit-button')
   ```

### E2E Test Best Practices

1. **Test critical user flows**
   ```typescript
   test('user can login and view dashboard', async ({ page }) => {
     await page.goto('/login')
     await page.fill('input[type="email"]', 'test@example.com')
     await page.fill('input[type="password"]', 'password')
     await page.click('button[type="submit"]')
     await expect(page).toHaveURL(/\/dashboard/)
   })
   ```

2. **Use page object pattern for complex flows**
   ```typescript
   class LoginPage {
     constructor(private page: Page) {}
     async login(email: string, password: string) {
       await this.page.fill('input[type="email"]', email)
       await this.page.fill('input[type="password"]', password)
       await this.page.click('button[type="submit"]')
     }
   }
   ```

3. **Test responsive design**
   ```typescript
   test('should be responsive on mobile', async ({ page }) => {
     await page.setViewportSize({ width: 375, height: 667 })
     // Test mobile layout
   })
   ```

---

## CI/CD Integration

### GitHub Actions

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

Workflow file: `.github/workflows/test.yml`

### Local CI Simulation

```bash
# Simulate CI environment
CI=true npm run test:ci
CI=true npm run test:e2e
```

---

## Test Coverage

### View Coverage Report

```bash
npm run test:coverage
```

Coverage report is generated in `coverage/` directory.

### Coverage Goals

- **Current Threshold:** 70% for all metrics
- **Target:** 80%+ for critical paths
- **Focus Areas:**
  - Authentication flows
  - Trade calculations
  - API routes
  - Utility functions

---

## Debugging Tests

### Unit Tests

```bash
# Run specific test
npm test -- --testNamePattern="should format currency"

# Run in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

### E2E Tests

```bash
# Debug mode (opens Playwright Inspector)
npm run test:e2e:debug

# Run with UI (interactive mode)
npm run test:e2e:ui

# Run specific test
npx playwright test e2e/auth.spec.ts --debug
```

---

## Common Issues

### Issue: Playwright Browser Installation Fails

**Error:** `Failed to download Webkit` or browser download errors

**Solution:** Install browsers individually (recommended)
```bash
# Install only Chromium and Firefox (most reliable)
npm run test:e2e:install

# Or skip Webkit and use Chromium/Firefox only
# The config has been updated to skip Webkit by default
```

See `TESTING_TROUBLESHOOTING.md` for detailed solutions.

### Issue: Tests fail with "Cannot find module"

**Solution:** Clear Jest cache
```bash
npm test -- --clearCache
```

### Issue: E2E tests timeout

**Solution:** Increase timeout in `playwright.config.ts`
```typescript
use: {
  actionTimeout: 30000, // 30 seconds
}
```

### Issue: Mock not working

**Solution:** Ensure mocks are in `jest.setup.js` or imported in test file

---

## Test Files Created

### Unit Tests
- `__tests__/lib/auth/session.test.ts` - Session management tests
- `__tests__/lib/validation/schemas.test.ts` - Validation schema tests
- `__tests__/api/auth/login.test.ts` - Login API route tests
- `__tests__/components/Button.test.tsx` - Component test example

### E2E Tests
- `e2e/auth.spec.ts` - Authentication flow tests
- `e2e/dashboard.spec.ts` - Dashboard tests

### Configuration
- `playwright.config.ts` - Playwright configuration
- `.github/workflows/test.yml` - CI/CD workflow

### Utilities
- `__tests__/utils/test-helpers.ts` - Test helper functions

---

## Next Steps

1. **Add more unit tests** for critical business logic
2. **Expand E2E tests** for key user flows
3. **Set up test data fixtures** for consistent testing
4. **Add visual regression tests** (optional)
5. **Set up performance testing** (optional)

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Last Updated:** December 2024
