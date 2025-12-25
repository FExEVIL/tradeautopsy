# Fix: /api/user/me Route - Dashboard 500 Errors

## ✅ FIXED

The `/api/user/me` route has been improved with better error handling and validation.

## Changes Made

### File: `app/api/user/me/route.ts`

**Improvements:**
1. ✅ Better error handling for Supabase admin client creation
2. ✅ Validates session has required fields (`workosUserId` or `userId`)
3. ✅ Handles both `workos_user_id` and `user_id` queries
4. ✅ Better error messages for different failure scenarios
5. ✅ Proper handling of PGRST116 (no rows found) vs actual errors

## Testing

After restarting the dev server:

```bash
npm run dev
```

**Test the endpoint:**
1. Login to the application
2. Navigate to `/dashboard`
3. Check browser console - should see user data loaded
4. Check Network tab - `/api/user/me` should return 200 status

## Expected Behavior

- ✅ Returns 401 if not authenticated
- ✅ Returns 404 if user profile doesn't exist (with helpful message)
- ✅ Returns 500 only for actual server errors (with details in dev mode)
- ✅ Returns 200 with user data when successful

## If Still Broken

1. **Check session cookie:**
   ```javascript
   // Browser console
   document.cookie
   // Should see: tradeautopsy_session=...
   ```

2. **Check environment variables:**
   ```bash
   # Should be set:
   WORKOS_COOKIE_PASSWORD (at least 32 chars)
   SUPABASE_SERVICE_ROLE_KEY
   NEXT_PUBLIC_SUPABASE_URL
   ```

3. **Check Supabase connection:**
   - Verify `profiles` table exists
   - Verify `workos_user_id` or `user_id` column exists
   - Check RLS policies allow service role access

## Related Files

- `lib/auth/session.ts` - Session management
- `lib/supabase/admin.ts` - Admin client creation

