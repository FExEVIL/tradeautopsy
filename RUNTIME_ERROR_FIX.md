# Runtime Error Fix: ENOENT lucide-react.js

## Problem
```
ENOENT: no such file or directory, open '.next/server/vendor-chunks/lucide-react.js'
```

## Root Cause
This is a Next.js build cache corruption issue. The `.next` directory contains stale or corrupted build artifacts.

## Solution

**Option 1: Delete .next and rebuild (Recommended)**
```bash
rm -rf .next
npm run build
# or for dev
npm run dev
```

**Option 2: Clean install**
```bash
rm -rf .next node_modules
npm install
npm run build
```

## Why This Happens
- Build cache gets corrupted during development
- Hot module replacement (HMR) can leave stale chunks
- Switching between dev and production builds
- File system issues

## Prevention
- Regularly clean `.next` during development
- Use `npm run build` before deploying
- Don't manually edit files in `.next`

## Status
✅ Fixed by:
1. Re-adding `BrainCircuit` import (was removed but still used)
2. Clearing `.next` cache
3. Rebuilding

**The error should be resolved after clearing the cache and rebuilding.**
