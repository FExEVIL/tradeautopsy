# Fix: Enable Leaked Password Protection

## Issue

Supabase Auth's leaked password protection is currently disabled. This feature prevents users from using passwords that have been compromised in data breaches (checked against HaveIBeenPwned.org).

## Why This Matters

- **Security**: Prevents users from using known compromised passwords
- **Best Practice**: Industry standard security feature
- **Compliance**: Helps meet security compliance requirements

## How to Enable

### Option 1: Supabase Dashboard (Recommended)

1. Go to **Supabase Dashboard** → **Authentication** → **Settings**
2. Scroll to **Password** section
3. Find **"Leaked password protection"** toggle
4. **Enable** the toggle
5. Click **Save**

### Option 2: Supabase CLI

```bash
# Update auth settings via CLI
supabase projects update --project-ref YOUR_PROJECT_REF \
  --enable-leaked-password-protection
```

### Option 3: API (Programmatic)

```bash
curl -X PATCH 'https://api.supabase.com/v1/projects/{project_ref}/config/auth' \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ENABLE_SIGNUP": true,
    "ENABLE_LEAKED_PASSWORD_PROTECTION": true
  }'
```

## What Happens After Enabling

- ✅ New signups with compromised passwords will be rejected
- ✅ Password resets with compromised passwords will be rejected
- ✅ Existing users are not affected (only new/changed passwords)
- ✅ Passwords are checked against HaveIBeenPwned.org database

## Testing

After enabling:

1. Try to sign up with a known compromised password (e.g., "password123")
2. Should see error: "Password has been found in a data breach"
3. Try with a strong, unique password - should work

## Documentation

- [Supabase Auth Password Security](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
- [HaveIBeenPwned](https://haveibeenpwned.com/)

## Notes

- This feature uses the HaveIBeenPwned API (k-anonymity method)
- No actual passwords are sent to the service
- Only password hashes (first 5 characters) are checked
- Free and safe to use

---

**After enabling, run Supabase Security Advisor again to verify the warning is gone.**

