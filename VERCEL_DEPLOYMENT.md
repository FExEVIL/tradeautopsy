# 🚀 Vercel Deployment Guide for TradeAutopsy

## Quick Deploy Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import to Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select your TradeAutopsy repository
   - Click "Import"

3. **Configure Project:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (or `tradeautopsy` if repo root is one level up)
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install`

4. **Add Environment Variables** (see below)

5. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live!

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (from project root)
cd /Users/bishnu/Tradeautopsy1/Untitled/tradeautopsy
vercel

# Follow prompts, then deploy to production:
vercel --prod
```

---

## 📋 Environment Variables

Add these in **Vercel Dashboard → Project Settings → Environment Variables**

### ✅ Required Variables

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# App URL (Required for callbacks)
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

### 🔧 Optional Variables (Add if using these features)

```bash
# OpenAI (For AI Coach & Audio Transcription)
OPENAI_API_KEY=sk-proj-your_key_here

# WorkOS (For SSO - Google/Microsoft login)
WORKOS_API_KEY=sk_test_your_key_here
WORKOS_CLIENT_ID=client_your_id_here
WORKOS_WEBHOOK_SECRET=wh_secret_your_secret_here
NEXT_PUBLIC_WORKOS_REDIRECT_URI=https://your-project.vercel.app/auth/callback/workos

# Zerodha Integration
ZERODHA_API_KEY=your_zerodha_api_key
ZERODHA_API_SECRET=your_zerodha_api_secret

# Razorpay (For payments)
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Email Service (For scheduled reports)
EMAIL_SERVICE_PROVIDER=resend  # or 'sendgrid' or 'none'
RESEND_API_KEY=your_resend_key  # if using Resend
SENDGRID_API_KEY=your_sendgrid_key  # if using SendGrid
EMAIL_FROM=TradeAutopsy <reports@yourdomain.com>
```

---

## 🔍 Where to Find Environment Variable Values

### Supabase
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### WorkOS
1. Go to [WorkOS Dashboard](https://dashboard.workos.com)
2. Go to **Configuration** → **API Keys**
3. Copy **API Key** and **Client ID**
4. Go to **Configuration** → **Redirect URIs**
5. Add: `https://your-project.vercel.app/auth/callback/workos`

### OpenAI
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Go to **API Keys**
3. Create new key or copy existing

---

## ⚙️ Vercel Configuration

### Build Settings

Vercel should auto-detect Next.js, but verify:

- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`
- **Node.js Version:** 20.x (or latest LTS)

### Environment Variables Scope

Set variables for:
- ✅ **Production** (required)
- ✅ **Preview** (recommended)
- ✅ **Development** (optional)

---

## 🗄️ Database Migrations

**IMPORTANT:** Run all migrations in Supabase before/after deployment:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run migrations in order:
   ```
   20251213000000_add_profile_dashboards_and_features.sql
   20251213000001_fix_profiles_unique_constraint.sql
   20251213000002_add_trade_pnl_columns.sql
   20251213000003_add_instrument_type_column.sql
   20251213000004_add_all_missing_trade_columns.sql
   20251213000005_add_audio_journal.sql
   20251213000006_fix_audio_journal_summary_column.sql
   20251213000007_fix_audio_journal_unique_constraint.sql
   20251213000008_add_execution_rating.sql
   20251213000009_performance_indexes.sql
   20251213000010_add_workos_auth.sql
   ```

Or use the combined migration:
- `COMBINED_ALL_TABLES.sql` (if available)

---

## ✅ Post-Deployment Checklist

### 1. Test Authentication
- [ ] Login with email/password (Supabase)
- [ ] Sign up new user
- [ ] Test WorkOS SSO (if configured)
- [ ] Test logout

### 2. Test Core Features
- [ ] Dashboard loads
- [ ] Trades list displays
- [ ] Import trades (CSV/JSON)
- [ ] Journal page works
- [ ] Audio journaling (if OpenAI key set)

### 3. Test Database
- [ ] Verify Supabase connection
- [ ] Check RLS policies work
- [ ] Test data insertion

### 4. Test API Routes
- [ ] `/api/health` returns 200
- [ ] Trade import works
- [ ] Audio transcription (if OpenAI key set)

### 5. Update WorkOS Redirect URI
- [ ] Update WorkOS dashboard with production URL
- [ ] Test SSO login in production

---

## 🐛 Troubleshooting

### Build Fails

**Error: "Module not found"**
- Check all dependencies are in `package.json`
- Run `npm install` locally to verify

**Error: "Environment variable missing"**
- Add all required variables in Vercel dashboard
- Redeploy after adding variables

### Runtime Errors

**Error: "Supabase connection failed"**
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Check Supabase project is active

**Error: "WorkOS not configured"**
- Add WorkOS environment variables
- Or remove WorkOS features if not needed

**Error: "Database column not found"**
- Run missing migrations in Supabase
- Check migration order

### Performance Issues

**Slow page loads:**
- Check database indexes are created (migration `20251213000009_performance_indexes.sql`)
- Verify pagination is working (should load 25 items, not 2000+)

---

## 🔒 Security Checklist

- [ ] All sensitive keys are in environment variables (not in code)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set (for WorkOS user creation)
- [ ] WorkOS webhook secret is set (if using webhooks)
- [ ] RLS policies are enabled in Supabase
- [ ] CORS is configured correctly
- [ ] HTTPS is enabled (automatic on Vercel)

---

## 📊 Monitoring

### Health Check Endpoint

Your app has a health check at `/api/health`:
- Returns 200 if healthy
- Returns 500 if issues detected
- Use for monitoring (UptimeRobot, etc.)

### Vercel Analytics

Enable in Vercel Dashboard:
- **Analytics** → Enable
- **Speed Insights** → Enable
- **Web Vitals** → Monitor performance

---

## 🚀 Custom Domain

1. Go to **Vercel Dashboard** → **Project Settings** → **Domains**
2. Add your domain (e.g., `tradeautopsy.in`)
3. Update DNS records as instructed
4. Update environment variables:
   - `NEXT_PUBLIC_APP_URL=https://tradeautopsy.in`
   - `NEXT_PUBLIC_WORKOS_REDIRECT_URI=https://tradeautopsy.in/auth/callback/workos`
5. Update WorkOS dashboard with new redirect URI
6. Redeploy

---

## 📝 Deployment Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# View environment variables
vercel env ls

# Add environment variable
vercel env add VARIABLE_NAME production
```

---

## ✅ Success!

Once deployed, your TradeAutopsy app will be live at:
- **Preview:** `your-project-git-branch.vercel.app`
- **Production:** `your-project.vercel.app` or your custom domain

**Next Steps:**
1. Test all features
2. Set up custom domain (optional)
3. Enable monitoring
4. Share with users! 🎉
