# E2E Tests Hanging - Fix Guide

## Problem
When running `npm run test:e2e`, the terminal shows no movement and appears to hang.

## Root Cause
Playwright's `webServer` is waiting for the dev server to be ready, but:
1. An existing dev server may already be running on port 3000
2. Playwright might not detect the server is ready correctly
3. The server might be starting but not responding to health checks

## Solutions

### Solution 1: Kill Existing Dev Server (Quick Fix)
```bash
# Find and kill the existing dev server
lsof -ti:3000 | xargs kill -9

# Then run tests
npm run test:e2e
```

### Solution 2: Run Dev Server Separately (Recommended for Development)
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run tests (will reuse existing server)
npm run test:e2e
```

### Solution 3: Use Different Port for Tests
If you want to keep your dev server running on 3000:

```bash
# Set a different port for tests
PORT=3001 npm run test:e2e
```

Then update `playwright.config.ts`:
```typescript
webServer: {
  command: 'PORT=3001 npm run dev',
  url: 'http://localhost:3001',
  // ...
}
```

### Solution 4: Add Verbose Output
To see what Playwright is waiting for:

```bash
# Run with debug output
DEBUG=pw:webserver npm run test:e2e
```

### Solution 5: Check Server Health
Verify the dev server is actually responding:

```bash
# Check if server responds
curl http://localhost:3000

# Or in browser
open http://localhost:3000
```

## Prevention

### Option A: Always Start Dev Server First
```bash
# Start dev server in background
npm run dev &

# Wait a few seconds, then run tests
sleep 5
npm run test:e2e
```

### Option B: Use Playwright's Built-in Server Management
The current config should handle this with `reuseExistingServer: true`, but if it's not working:

1. Make sure the dev server is fully started before running tests
2. Check that `http://localhost:3000` responds correctly
3. Verify no port conflicts

## Debugging Steps

1. **Check if port is in use:**
   ```bash
   lsof -ti:3000
   ```

2. **Check if server responds:**
   ```bash
   curl -I http://localhost:3000
   ```

3. **Check Playwright process:**
   ```bash
   ps aux | grep playwright
   ```

4. **Run with verbose output:**
   ```bash
   npx playwright test --reporter=list --workers=1
   ```

## Quick Fix Script

Create a helper script `scripts/test-e2e.sh`:

```bash
#!/bin/bash
# Kill existing dev server on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Wait a moment
sleep 2

# Run tests (Playwright will start its own server)
npm run test:e2e
```

Make it executable:
```bash
chmod +x scripts/test-e2e.sh
```

Then use:
```bash
./scripts/test-e2e.sh
```

---

**Most Common Fix:** Kill the existing dev server and let Playwright manage it:
```bash
lsof -ti:3000 | xargs kill -9
npm run test:e2e
```

