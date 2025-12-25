# Test Performance Analysis & Optimization

## Current Performance Issues Identified

### 1. Jest Setup - Undici Module Loading ⚠️
**Issue:** `jest.setup.js` tries to `require('undici')` which may not exist, causing delays
```javascript
// Line 182 in jest.setup.js
const { Request, Response, Headers } = require('undici')
```
**Impact:** Module resolution attempts can add 1-3 seconds per test run

### 2. Playwright E2E Tests - Long Timeouts ⚠️
**Issue:** E2E tests have explicit long timeouts
- `timeout: 10000` (10 seconds) for dashboard redirect
- `timeout: 5000` (5 seconds) for error messages
- `timeout: 2000` (2 seconds) for validation

**Impact:** Tests wait unnecessarily long even when elements appear quickly

### 3. Playwright WebServer Timeout ⚠️
**Issue:** Dev server startup timeout is 120 seconds
```typescript
timeout: 120 * 1000, // 120 seconds
```
**Impact:** If dev server is slow to start, tests wait up to 2 minutes

### 4. Multiple Browser Projects
**Issue:** 5 browser projects run in parallel
- Chromium, Firefox, Webkit, Mobile Chrome, Mobile Safari
**Impact:** Resource-intensive, especially on slower machines

### 5. Video/Screenshot Collection
**Issue:** Video and screenshots collected on failure
```typescript
video: 'retain-on-failure',
screenshot: 'only-on-failure',
```
**Impact:** Adds overhead to failed tests

---

## Performance Optimizations

### ✅ Quick Fixes (Apply Immediately)

#### 1. Fix Undici Loading in jest.setup.js
```javascript
// Remove the try/catch that attempts to load undici
// Use built-in polyfill instead
```

#### 2. Reduce E2E Test Timeouts
```typescript
// Reduce from 10000ms to 5000ms
await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 })
```

#### 3. Optimize Playwright Config
```typescript
// Reduce webServer timeout
timeout: 60 * 1000, // 60 seconds instead of 120

// Disable video in development
video: process.env.CI ? 'retain-on-failure' : 'off',
```

#### 4. Add Jest Performance Settings
```javascript
// In jest.config.js
maxWorkers: '50%', // Use 50% of CPU cores
testTimeout: 10000, // 10 second timeout per test
```

---

## Recommended Optimizations

### For Development (Fast Feedback)

#### Option 1: Single Browser Testing
```bash
# Run only Chromium (fastest)
npx playwright test --project=chromium
```

#### Option 2: Disable Video/Screenshots
```typescript
// In playwright.config.ts
use: {
  video: 'off',
  screenshot: 'off',
  trace: 'off',
}
```

#### Option 3: Reduce Workers
```typescript
// In playwright.config.ts
workers: 1, // Run tests serially (slower but less resource-intensive)
```

### For CI/CD (Comprehensive)

Keep current settings but optimize:
- Use `workers: 1` for stability
- Keep video/screenshots for debugging
- Use reasonable timeouts

---

## Performance Benchmarks

### Current (Estimated)
- **Unit Tests (Jest):** 1-2 seconds ✅
- **E2E Tests (Full Suite):** 2-5 minutes ⚠️
- **E2E Tests (Single Browser):** 30-60 seconds ✅

### After Optimizations (Expected)
- **Unit Tests (Jest):** 1-2 seconds ✅
- **E2E Tests (Full Suite):** 1-3 minutes ✅
- **E2E Tests (Single Browser):** 20-40 seconds ✅

---

## Action Items

1. ✅ Fix undici loading in jest.setup.js
2. ✅ Reduce E2E test timeouts
3. ✅ Optimize Playwright webServer timeout
4. ✅ Add Jest performance settings
5. ⚠️ Consider disabling video/screenshots in development

---

## Monitoring

### Check Test Performance
```bash
# Time unit tests
time npm test

# Time E2E tests
time npm run test:e2e

# Time single browser
time npx playwright test --project=chromium
```

### Identify Slow Tests
```bash
# Jest with timing
npm test -- --verbose

# Playwright with timing
npx playwright test --reporter=list
```

---

**Next Steps:** Apply the quick fixes above to improve test performance.

