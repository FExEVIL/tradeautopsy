# Fix: CSP WebSocket Error

## ✅ FIXED

The Content Security Policy has been updated to allow WebSocket connections to Supabase.

## Issue

```
wss://wspbzmhdtwukswramqco.supabase.co blocked by CSP
```

Supabase Realtime uses WebSocket connections (`wss://`) which were blocked by the CSP.

## Changes Made

### File: `next.config.js`

**Line 192:** Updated `connect-src` directive:

**Before:**
```javascript
connect-src 'self' https://*.supabase.co https://api.anthropic.com https://api.workos.com https://va.vercel-scripts.com;
```

**After:**
```javascript
connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com https://api.workos.com https://va.vercel-scripts.com;
```

## Testing

After restarting the dev server:

```bash
npm run dev
```

**Check browser console:**
- ✅ No CSP violations for WebSocket connections
- ✅ Realtime subscriptions work
- ✅ No errors like "blocked by CSP"

## What This Enables

- ✅ Supabase Realtime subscriptions
- ✅ Live data updates
- ✅ WebSocket-based features

## Security Note

The `wss://*.supabase.co` pattern only allows WebSocket connections to Supabase domains, maintaining security while enabling required functionality.

