# E2E Test Execution Time Estimates

## Current Configuration

### Test Files
- `e2e/auth.spec.ts` - Authentication flow tests (~5-7 tests)
- `e2e/dashboard.spec.ts` - Dashboard tests (~3-4 tests)

### Browser Projects (playwright.config.ts)
- **Chromium** (Desktop Chrome)
- **Firefox** (Desktop Firefox)
- **Webkit** (Desktop Safari)
- **Mobile Chrome** (Pixel 5)
- **Mobile Safari** (iPhone 12)

**Total:** 5 browser projects × ~8-11 tests = **40-55 test runs**

---

## Time Estimates

### Full Test Run (All Browsers)
- **Estimated Time:** 2-5 minutes
- **Breakdown:**
  - Dev server startup: ~10-15 seconds
  - Test execution: ~90-240 seconds (depending on network/performance)
  - Cleanup: ~5-10 seconds

### Factors Affecting Time

1. **Dev Server Startup** (~10-15s)
   - Next.js dev server needs to start
   - First run may be slower (cold start)

2. **Parallel Execution**
   - Tests run in parallel by default
   - 5 browsers × parallel workers = faster execution
   - **Current config:** `workers: process.env.CI ? 1 : undefined` (unlimited locally)

3. **Network/API Calls**
   - Authentication tests make API calls
   - Network latency affects timing
   - Mock responses can speed up tests

4. **Browser Startup**
   - First browser: ~2-3 seconds
   - Subsequent browsers: ~1-2 seconds each
   - Total browser startup: ~5-10 seconds

---

## Quick Test Options

### Run Single Browser (Faster)
```bash
# Chromium only (~30-60 seconds)
npx playwright test --project=chromium

# Firefox only (~30-60 seconds)
npx playwright test --project=firefox
```

### Run Specific Test File
```bash
# Auth tests only (~20-40 seconds)
npx playwright test e2e/auth.spec.ts

# Dashboard tests only (~15-30 seconds)
npx playwright test e2e/dashboard.spec.ts
```

### Run with UI (Interactive)
```bash
# Opens Playwright UI - allows selective test running
npm run test:e2e:ui
```

---

## Typical Execution Times

| Scenario | Time | Notes |
|----------|------|-------|
| **Full suite (all browsers)** | 2-5 min | All tests, all browsers |
| **Single browser** | 30-60 sec | One browser, all tests |
| **Single test file** | 20-40 sec | One file, all browsers |
| **Single test** | 5-15 sec | One test, one browser |
| **CI/CD (serial)** | 5-10 min | Serial execution, slower |

---

## Optimization Tips

### 1. Run Tests in Parallel (Default)
```bash
# Already configured - tests run in parallel
npm run test:e2e
```

### 2. Skip Slow Browsers During Development
```bash
# Skip Webkit during development
npx playwright test --project=chromium --project=firefox
```

### 3. Use Test Sharding (For Large Suites)
```bash
# Split tests across multiple machines
npx playwright test --shard=1/3  # Run 1/3 of tests
npx playwright test --shard=2/3  # Run 2/3 of tests
npx playwright test --shard=3/3  # Run 3/3 of tests
```

### 4. Run Only Changed Tests
```bash
# Use Playwright's test filtering
npx playwright test --grep "authentication"
```

---

## CI/CD Timing

In GitHub Actions (`.github/workflows/test.yml`):
- **Serial execution:** `workers: 1` (CI mode)
- **Estimated time:** 5-10 minutes
- **Includes:** Browser installation, test execution, artifact upload

---

## Monitoring Test Performance

### Check Test Timing
```bash
# Run with timing info
npx playwright test --reporter=list

# Generate HTML report with timing
npx playwright test --reporter=html
npx playwright show-report
```

### Identify Slow Tests
```bash
# Run with detailed timing
npx playwright test --reporter=json > test-results.json
# Analyze JSON for slow tests
```

---

## Recommendations

### For Development
- ✅ Run single browser: `npx playwright test --project=chromium`
- ✅ Run specific test: `npx playwright test --grep "login"`
- ✅ Use UI mode: `npm run test:e2e:ui`

### For Pre-Commit
- ✅ Run all browsers: `npm run test:e2e` (2-5 min acceptable)

### For CI/CD
- ✅ Full suite with retries: Already configured
- ✅ Acceptable time: 5-10 minutes

---

**Note:** Actual times may vary based on:
- System performance
- Network speed
- Dev server startup time
- Number of tests
- Browser performance

