# Testing Troubleshooting Guide

## Common Issues and Solutions

### Issue: Playwright Browser Installation Fails

**Error:** `Failed to download Webkit` or similar browser download errors

**Solutions:**

#### Option 1: Install Browsers Individually (Recommended)

```bash
# Install only Chromium and Firefox (most reliable)
npm run test:e2e:install

# Or install manually
npx playwright install chromium
npx playwright install firefox
```

#### Option 2: Skip Webkit (Safari)

Webkit installation can fail on some systems. The Playwright config has been updated to skip Webkit by default. If you need Safari testing:

```bash
# Try installing Webkit separately
npx playwright install webkit

# If it fails, you can still run tests with Chromium and Firefox
npm run test:e2e
```

#### Option 3: Install with System Dependencies

```bash
# Install browsers with all system dependencies
npm run test:e2e:install:all

# Or manually
npx playwright install --with-deps
```

#### Option 4: Use Docker (For CI/CD)

If browser installation continues to fail, consider using Docker for E2E tests:

```yaml
# In GitHub Actions, use Playwright Docker image
- uses: microsoft/playwright-github-action@v1
```

### Issue: Tests Fail with "Cannot find module"

**Error:** Module resolution errors in tests

**Solution:**
```bash
# Clear Jest cache
npm test -- --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: E2E Tests Timeout

**Error:** Tests timeout waiting for elements

**Solution:**
1. Increase timeout in `playwright.config.ts`:
```typescript
use: {
  actionTimeout: 30000, // 30 seconds
  navigationTimeout: 60000, // 60 seconds
}
```

2. Check if dev server is running:
```bash
# Make sure dev server starts before tests
npm run dev
# In another terminal
npm run test:e2e
```

### Issue: Mock Not Working in Tests

**Error:** Mocks not being applied

**Solution:**
1. Ensure mocks are in `jest.setup.js` or imported in test file
2. Clear Jest cache: `npm test -- --clearCache`
3. Check mock order - mocks must be defined before imports

### Issue: "Cannot use import statement outside a module"

**Error:** ES module import errors

**Solution:**
- Jest should handle this automatically with Next.js config
- If issues persist, check `jest.config.js` has proper Next.js setup

### Issue: Coverage Report Not Generated

**Solution:**
```bash
# Run with coverage flag
npm run test:coverage

# Check coverage directory
ls coverage/
```

### Issue: GitHub Actions Tests Fail

**Common Causes:**
1. Missing environment variables
2. Browser installation timeout
3. Port conflicts

**Solution:**
- Check `.github/workflows/test.yml` for proper environment setup
- Ensure all required env vars are set in GitHub Secrets
- Increase timeout for browser installation step

---

## Browser Installation Commands

### Install All Browsers
```bash
npx playwright install --with-deps
```

### Install Specific Browsers
```bash
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit
```

### Install Only Chromium (Fastest)
```bash
npx playwright install chromium
```

### Check Installed Browsers
```bash
npx playwright --version
```

---

## Test Environment Setup

### Required Environment Variables

For tests to run properly, set these in your `.env.test` or test environment:

```env
NODE_ENV=test
WORKOS_COOKIE_PASSWORD=test-cookie-password-minimum-32-characters-long
NEXT_PUBLIC_SUPABASE_URL=https://test.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key
```

### CI/CD Environment

GitHub Actions automatically sets these. For local CI simulation:

```bash
CI=true NODE_ENV=test npm run test:ci
```

---

## Performance Tips

### Speed Up Tests

1. **Run tests in parallel:**
```bash
npm test -- --maxWorkers=4
```

2. **Skip slow tests during development:**
```typescript
test.skip('slow test', () => {
  // This test will be skipped
})
```

3. **Use test.only for debugging:**
```typescript
test.only('debug this test', () => {
  // Only this test will run
})
```

### Reduce E2E Test Time

1. **Run only Chromium:**
```bash
npx playwright test --project=chromium
```

2. **Skip mobile tests:**
```bash
npx playwright test --project=chromium --project=firefox
```

---

## Getting Help

1. Check `TESTING_GUIDE.md` for detailed documentation
2. Review test output for specific error messages
3. Check Playwright documentation: https://playwright.dev/docs/intro
4. Check Jest documentation: https://jestjs.io/docs/getting-started

---

**Last Updated:** December 2024

