# 🚀 Quick Deploy Reference

**One-page reference for deploying TradeAutopsy to production**

---

## ⚡ 5-Minute Deploy

### Step 1: Verify Build
```bash
npm run build
```

### Step 2: Push to GitHub
```bash
git add .
git commit -m "Production ready"
git push origin main
```

### Step 3: Deploy to Vercel
1. Go to https://vercel.com
2. Import GitHub repository
3. Add environment variables (see below)
4. Click "Deploy"

### Step 4: Add Environment Variables
In Vercel Dashboard → Settings → Environment Variables:

**Required:**
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  ⚠️ CRITICAL
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Optional:**
```
WORKOS_API_KEY=your_key
WORKOS_CLIENT_ID=your_id
OPENAI_API_KEY=your_key
```

### Step 5: Redeploy
After adding env variables → Click "Redeploy"

---

## 🔑 Get Service Role Key

1. Supabase Dashboard → Project Settings → API
2. Copy `service_role` key (NOT anon key)
3. Add to Vercel as `SUPABASE_SERVICE_ROLE_KEY`

---

## ✅ Quick Verification

After deployment, test:
- [ ] Signup works
- [ ] Dashboard loads
- [ ] No console errors
- [ ] Profile creation works

---

## 🐛 Quick Fixes

**Profile creation fails?**
→ Check `SUPABASE_SERVICE_ROLE_KEY` is set

**Can't connect to Supabase?**
→ Verify all `NEXT_PUBLIC_*` variables are set

**Webpack errors?**
→ Already fixed! Clear cache and redeploy

---

## 📚 Full Documentation

- **Deployment Guide:** `DEPLOYMENT_CHECKLIST.md`
- **Production Fixes:** `PRODUCTION_FIXES_COMPLETE.md`
- **Pre-Deploy Check:** `./scripts/pre-deploy-check.sh`

---

**Status:** ✅ Ready to Deploy

