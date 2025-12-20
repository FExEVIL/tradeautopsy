# ⚡ Quick Deployment Guide

## 🚀 One-Command Deploy

```bash
./deploy.sh
```

Or manually:

```bash
# 1. Install Vercel CLI (if not installed)
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod
```

---

## 📋 Required Environment Variables

Add these in **Vercel Dashboard → Settings → Environment Variables**:

### Minimum Required:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

### For Authentication:
```bash
WORKOS_API_KEY=sk_test_your_key
WORKOS_CLIENT_ID=client_your_id
NEXT_PUBLIC_WORKOS_REDIRECT_URI=https://your-project.vercel.app/auth/callback/workos
```

### For AI Features:
```bash
OPENAI_API_KEY=sk-proj-your_key
```

---

## ✅ Post-Deployment Checklist

1. ✅ Set all environment variables in Vercel
2. ✅ Run database migrations in Supabase
3. ✅ Update WorkOS redirect URI
4. ✅ Update Supabase redirect URLs
5. ✅ Test login flow
6. ✅ Test OAuth providers
7. ✅ Verify API routes work

---

## 🔗 Quick Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://app.supabase.com
- **WorkOS Dashboard**: https://dashboard.workos.com

---

**Full deployment guide**: See `DEPLOYMENT_COMPLETE.md`

