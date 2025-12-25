# 🚀 TradeAutopsy Deployment Checklist

**Date:** December 2024  
**Status:** ✅ Production Ready

---

## ✅ Pre-Deployment Verification

Run the pre-deployment check script:

```bash
chmod +x scripts/pre-deploy-check.sh
./scripts/pre-deploy-check.sh
```

Or manually verify:

- [ ] Node.js 18+ installed
- [ ] `npm run build` succeeds locally
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] All critical fixes applied (see PRODUCTION_FIXES_COMPLETE.md)

---

## 🔐 Environment Variables Setup

### Required for Production (Vercel Dashboard → Settings → Environment Variables)

**Critical Variables:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # ⚠️ CRITICAL - Get from Supabase Dashboard
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

**Optional but Recommended:**
```env
# WorkOS (for authentication)
WORKOS_API_KEY=your_workos_key
WORKOS_CLIENT_ID=your_workos_client_id
NEXT_PUBLIC_WORKOS_REDIRECT_URI=https://your-domain.vercel.app/auth/callback/workos

# OpenAI (for AI features)
OPENAI_API_KEY=your_openai_key

# Zerodha (for broker integration)
ZERODHA_API_KEY=your_zerodha_key
ZERODHA_API_SECRET=your_zerodha_secret
```

**Where to Get Values:**

1. **Supabase Service Role Key:**
   - Go to Supabase Dashboard → Project Settings → API
   - Copy `service_role` key (NOT the anon key)
   - ⚠️ Keep this secret - never commit to git

2. **WorkOS:**
   - WorkOS Dashboard → Configuration → API Keys
   - Add redirect URI in Configuration → Redirect URIs

3. **OpenAI:**
   - OpenAI Platform → API Keys

---

## 📋 Deployment Steps

### Option 1: Deploy to Vercel (Recommended)

**1. Push to GitHub:**
```bash
git add .
git commit -m "Production ready - all fixes applied"
git push origin main
```

**2. Deploy via Vercel Dashboard:**
- Go to https://vercel.com
- Click "Import Project"
- Connect GitHub repository
- Select TradeAutopsy repo
- Click "Deploy"

**3. Add Environment Variables:**
- Go to Project Settings → Environment Variables
- Add all required variables (see above)
- Set scope to: Production, Preview, Development

**4. Redeploy:**
- After adding env variables, click "Redeploy"
- Wait for build to complete

**5. Verify Deployment:**
- Visit your production URL
- Test authentication flow
- Test dashboard functionality
- Check browser console for errors

---

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login
vercel login

# Deploy to production
vercel --prod

# Follow prompts to:
# - Link to existing project or create new
# - Set up environment variables
```

---

## ✅ Post-Deployment Testing

### Critical User Flows

**1. Authentication:**
- [ ] Signup form works
- [ ] Email verification works
- [ ] OTP code verification works
- [ ] Profile creation succeeds (no RLS errors)
- [ ] Login works
- [ ] Logout works

**2. Dashboard:**
- [ ] Dashboard loads without errors
- [ ] Header displays correctly (ProfileSwitcher, MarketStatus, etc.)
- [ ] Sidebar navigation works
- [ ] Profile switcher works
- [ ] Theme toggle works
- [ ] All features accessible

**3. Core Features:**
- [ ] Can import trades
- [ ] Can view analytics
- [ ] Can use filters
- [ ] Can export data
- [ ] All main features functional

**4. Performance:**
- [ ] Pages load quickly (<3 seconds)
- [ ] No console errors
- [ ] Smooth animations
- [ ] Fast navigation

**5. Browser Compatibility:**
- [ ] Chrome/Edge works
- [ ] Firefox works
- [ ] Safari works
- [ ] Mobile browsers work

---

## 🐛 Common Issues & Quick Fixes

### Issue: "Profile creation fails"

**Cause:** `SUPABASE_SERVICE_ROLE_KEY` not set or incorrect

**Fix:**
1. Verify key in Vercel environment variables
2. Get fresh key from Supabase Dashboard
3. Update in Vercel → Redeploy

---

### Issue: "Cannot connect to Supabase"

**Cause:** Environment variables not set in production

**Fix:**
1. Check all `NEXT_PUBLIC_*` variables are set
2. Ensure no typos in variable names
3. Redeploy after adding variables

---

### Issue: "404 on API routes"

**Cause:** Build issue or routing problem

**Fix:**
1. Check `app/api/` folder structure
2. Ensure `route.ts` files exist
3. Rebuild and redeploy

---

### Issue: "Webpack errors in production"

**Status:** ✅ **FIXED** - DashboardHeader fully inlined

If you see webpack errors:
1. Clear Vercel build cache
2. Redeploy
3. Check PRODUCTION_FIXES_COMPLETE.md

---

### Issue: "Font 404 errors"

**Status:** ✅ **FIXED** - Font configuration simplified

If you see font errors:
1. Clear browser cache
2. Check network tab
3. Verify build completed successfully

---

## 🔒 Security Checklist

- [ ] `SUPABASE_SERVICE_ROLE_KEY` NOT in client code ✅ (only in API routes)
- [ ] `.env.local` in `.gitignore` ✅
- [ ] No secrets committed to git ✅
- [ ] Environment variables set in deployment platform ✅
- [ ] RLS policies configured (or bypassed with service role) ✅

---

## 📊 Monitoring Setup

### Vercel Analytics (Built-in)
- Automatic performance tracking
- Web Vitals monitoring
- Real-time metrics

### Error Tracking (Optional)
Consider adding Sentry:
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

---

## 🎯 Success Criteria

After deployment, verify:

- ✅ Production build succeeds
- ✅ No runtime errors
- ✅ Authentication works end-to-end
- ✅ Dashboard loads and functions correctly
- ✅ All features accessible
- ✅ Performance is good (<3s page load)
- ✅ Mobile responsive

---

## 📝 Deployment Log

**Date:** _______________

**Deployed by:** _______________

**Deployment URL:** _______________

**Environment Variables Set:**
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] NEXT_PUBLIC_APP_URL
- [ ] Other variables (list): _______________

**Post-Deployment Tests:**
- [ ] Authentication flow tested
- [ ] Dashboard tested
- [ ] Core features tested
- [ ] Performance verified
- [ ] No errors in console

**Issues Found:** _______________

**Resolution:** _______________

---

## 🚀 Quick Deploy Command

```bash
# 1. Verify build works
npm run build

# 2. Commit changes
git add .
git commit -m "Ready for production deployment"
git push origin main

# 3. Deploy (if using Vercel CLI)
vercel --prod

# 4. Verify deployment
# Visit production URL and test
```

---

## 📞 Support Resources

**Vercel:**
- Docs: https://vercel.com/docs
- Discord: https://vercel.com/discord

**Supabase:**
- Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com

**Next.js:**
- Docs: https://nextjs.org/docs
- Discord: https://nextjs.org/discord

---

## ✅ Final Checklist

Before marking deployment as complete:

- [ ] All environment variables set
- [ ] Production build successful
- [ ] All critical user flows tested
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Monitoring set up
- [ ] Documentation updated

---

**Status:** 🚀 **READY TO DEPLOY**

**Last Updated:** December 2024

