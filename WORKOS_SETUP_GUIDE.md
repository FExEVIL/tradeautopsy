# WorkOS Password Auth - Quick Setup Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Add Environment Variable

Add to your `.env.local`:

```bash
# Generate a secure cookie password (min 32 characters)
openssl rand -base64 32
```

Then add to `.env.local`:
```env
WORKOS_COOKIE_PASSWORD=<paste-generated-password-here>
```

### Step 2: Verify WorkOS Configuration

Ensure these are already set:
```env
WORKOS_API_KEY=sk_test_xxxxx
WORKOS_CLIENT_ID=client_xxxxx
```

### Step 3: Test It!

1. **Start dev server**: `npm run dev`
2. **Go to**: `http://localhost:3000/signup/email`
3. **Create account**: Fill in name, email, password
4. **Check email**: Verify your account
5. **Login**: Go to `/login`, use password mode
6. **Success!** 🎉

---

## 📋 What's New?

### Login Page (`/login`)
- **Password Mode**: Email + password login
- **Email Code Mode**: OTP/magic link (existing)
- **OAuth**: Google, GitHub (existing)
- Toggle between modes with the switch

### Signup Page (`/signup/email`)
- Enhanced with password strength indicator
- Real-time validation
- Email verification flow

### API Routes
- `POST /api/auth/login` - Password login
- `POST /api/auth/signup` - Create account
- `POST /api/auth/logout` - Logout

---

## 🔧 WorkOS Dashboard Configuration

### 1. Enable Email/Password Auth
- Go to WorkOS Dashboard → Authentication → Settings
- Enable "Email/Password" authentication
- Save changes

### 2. Configure Email Templates (Optional)
- Go to Authentication → Email Templates
- Customize verification email with TradeAutopsy branding
- Set verification link redirect to: `http://localhost:3000/auth/verify`

### 3. Set Redirect URIs
- Go to Authentication → Redirect URIs
- Add: `http://localhost:3000/auth/verify`
- Add: `http://localhost:3000/auth/callback/workos` (for OAuth)

---

## 🧪 Testing Checklist

- [ ] Signup with email/password works
- [ ] Email verification received
- [ ] Login with password works
- [ ] Session persists on refresh
- [ ] Logout clears session
- [ ] Protected routes redirect to login
- [ ] OTP login still works
- [ ] OAuth login still works

---

## 🐛 Troubleshooting

### "WORKOS_COOKIE_PASSWORD must be at least 32 characters"
- Generate a new password: `openssl rand -base64 32`
- Add to `.env.local`
- Restart dev server

### "Authentication service not configured"
- Check `WORKOS_API_KEY` and `WORKOS_CLIENT_ID` in `.env.local`
- Verify values in WorkOS dashboard

### "Invalid email or password"
- Check email is verified (if required)
- Verify password is correct
- Check WorkOS dashboard for user status

### Session not persisting
- Check `WORKOS_COOKIE_PASSWORD` is set correctly
- Clear browser cookies and try again
- Check browser console for errors

---

## 📚 Next Steps

1. **Configure WorkOS**: Enable email/password in dashboard
2. **Customize Emails**: Update email templates
3. **Test Flow**: Complete signup → verify → login flow
4. **Production**: Update redirect URIs for production domain

---

## ✅ Done!

Your app now supports:
- ✅ Email/password authentication
- ✅ Beautiful custom UI (preserved)
- ✅ WorkOS secure backend
- ✅ Email verification
- ✅ Session management
- ✅ All existing auth methods still work

**Questions?** Check `WORKOS_PASSWORD_AUTH_COMPLETE.md` for full documentation.

