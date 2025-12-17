# 🚀 TradeAutopsy Deployment Commands

## Quick Deploy (Copy & Paste)

```bash
# 1. Check current status
git status

# 2. Add all changes
git add -A

# 3. Commit changes
git commit -m "deploy: latest updates"

# 4. Push to main branch (triggers Vercel deployment)
git push origin main
```

---

## Complete Deployment Workflow

### Step 1: Pre-Deployment Checks

```bash
# Navigate to project directory
cd /Users/bishnu/Tradeautopsy1/Untitled/tradeautopsy

# Check git status
git status

# Verify no uncommitted changes
git diff

# Check current branch
git branch
```

### Step 2: Build Test (Optional but Recommended)

```bash
# Clean build cache
rm -rf .next

# Run production build
npm run build

# Verify build succeeds
# Look for: "✓ Compiled successfully"
```

### Step 3: Commit Changes

```bash
# Stage all changes
git add -A

# Check what will be committed
git status

# Commit with descriptive message
git commit -m "deploy: [describe your changes]"
```

### Step 4: Deploy to Production

```bash
# Push to main branch (triggers Vercel auto-deployment)
git push origin main

# Or push to specific branch
git push origin main:main
```

---

## Vercel Deployment (If Not Auto-Connected)

### Option A: Vercel CLI

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Or deploy preview
vercel
```

### Option B: Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project
3. Click "Deployments" tab
4. Click "Redeploy" on latest deployment
5. Or push to GitHub (if connected)

---

## Environment Variables Check

Before deploying, ensure these are set in Vercel:

```bash
# Required Environment Variables:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
WORKOS_API_KEY=your_workos_api_key
WORKOS_CLIENT_ID=your_workos_client_id
OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_APP_URL=your_app_url
```

**Set in Vercel Dashboard:**
1. Go to Project Settings → Environment Variables
2. Add all required variables
3. Redeploy after adding

---

## Database Migrations (Before/After Deployment)

### Run Migrations in Supabase:

```sql
-- Execute these in Supabase SQL Editor:

-- 1. Performance indexes
-- File: supabase/migrations/20251215000000_performance_indexes.sql

-- 2. Web Vitals table
-- File: supabase/migrations/20251216000000_add_web_vitals_table.sql

-- 3. Performance stored procedures
-- File: supabase/migrations/20251216000001_performance_stored_procedures.sql

-- After running migrations, refresh materialized view:
REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_metrics_mv;
```

---

## Post-Deployment Verification

### 1. Check Deployment Status

```bash
# View Vercel deployments
vercel ls

# Or check Vercel Dashboard
# https://vercel.com/dashboard
```

### 2. Test Application

```bash
# Test production URL
curl https://your-app.vercel.app/api/health

# Or open in browser
open https://your-app.vercel.app
```

### 3. Verify Features

- [ ] OTP authentication works
- [ ] Dashboard loads correctly
- [ ] Favicon appears in browser tab
- [ ] Speed Insights tracking active
- [ ] No console errors

---

## Rollback (If Needed)

```bash
# View deployment history
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]

# Or via Vercel Dashboard:
# Deployments → Select deployment → "Promote to Production"
```

---

## One-Line Deploy

```bash
git add -A && git commit -m "deploy: latest updates" && git push origin main
```

---

## Troubleshooting

### Build Fails

```bash
# Clean and rebuild
rm -rf .next node_modules/.cache
npm install
npm run build
```

### Deployment Stuck

```bash
# Cancel and redeploy
# Go to Vercel Dashboard → Cancel deployment → Redeploy
```

### Environment Variables Missing

```bash
# Check Vercel Dashboard → Settings → Environment Variables
# Ensure all required vars are set for Production environment
```

---

## Current Deployment Status

**Last Commit:** Check with `git log --oneline -1`
**Branch:** `main`
**Remote:** `origin/main`
**Status:** Up to date

---

## Quick Reference

```bash
# Status check
git status

# Deploy
git add -A && git commit -m "deploy" && git push origin main

# Build test
npm run build

# Clean build
rm -rf .next && npm run build
```
