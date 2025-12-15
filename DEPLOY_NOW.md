# 🚀 Deploy TradeAutopsy to Vercel - Quick Guide

## ⚡ Quick Deploy (5 Minutes)

### Step 1: Commit All Changes

```bash
cd /Users/bishnu/Tradeautopsy1/Untitled/tradeautopsy

# Add all changes
git add .

# Commit
git commit -m "Complete auth system, theme standardization, and feature integrations"

# Push to GitHub
git push origin main
```

### Step 2: Deploy via Vercel Dashboard

1. **Go to [vercel.com/new](https://vercel.com/new)**
2. **Click "Import Git Repository"**
3. **Select your TradeAutopsy repository**
4. **Click "Import"**

### Step 3: Configure Project

- **Framework Preset:** Next.js (auto-detected) ✅
- **Root Directory:** `./` (or `tradeautopsy` if repo root is one level up)
- **Build Command:** `npm run build` ✅
- **Output Directory:** `.next` ✅
- **Install Command:** `npm install` ✅

### Step 4: Add Environment Variables

Go to **Settings** → **Environment Variables** and add:

#### ✅ Required Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# App URL (Update after first deploy)
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

#### 🔧 Optional Variables (Add if using these features)

```bash
# OpenAI (For AI Coach & Audio Transcription)
OPENAI_API_KEY=sk-proj-your_key_here

# WorkOS (For SSO - Google/Apple/Microsoft login)
WORKOS_API_KEY=sk_live_your_key_here
WORKOS_CLIENT_ID=client_your_id_here
WORKOS_WEBHOOK_SECRET=wh_secret_your_secret_here
NEXT_PUBLIC_WORKOS_REDIRECT_URI=https://your-project.vercel.app/auth/callback/workos

# Zerodha Integration
ZERODHA_API_KEY=your_zerodha_api_key
ZERODHA_API_SECRET=your_zerodha_api_secret

# Razorpay (For payments)
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (~2-3 minutes)
3. Your app will be live at `https://your-project.vercel.app`

---

## 🔄 Alternative: Deploy via CLI

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login
vercel login

# Navigate to project
cd /Users/bishnu/Tradeautopsy1/Untitled/tradeautopsy

# Deploy (preview)
vercel

# Deploy to production
vercel --prod
```

---

## ✅ Post-Deployment Checklist

### 1. Update Environment Variables
After first deploy, update:
- `NEXT_PUBLIC_APP_URL` with your actual Vercel URL
- `NEXT_PUBLIC_WORKOS_REDIRECT_URI` with production URL

### 2. Run Database Migrations
Go to **Supabase Dashboard** → **SQL Editor** and run:

```sql
-- Run these migrations in order:
-- 1. 20251213000010_add_workos_auth.sql
-- 2. 20251213000011_add_auth_features.sql
-- 3. 20251213000008_add_mistakes_table_and_audio_enhancements.sql
-- 4. Any other pending migrations
```

### 3. Update Supabase Auth Settings
- Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
- Add your Vercel URL to:
  - **Site URL:** `https://your-project.vercel.app`
  - **Redirect URLs:** 
    - `https://your-project.vercel.app/auth/callback/workos`
    - `https://your-project.vercel.app/dashboard`

### 4. Update WorkOS Settings
- Go to **WorkOS Dashboard** → **Configuration** → **Redirect URIs**
- Add: `https://your-project.vercel.app/auth/callback/workos`

### 5. Test the Deployment
- ✅ Visit your Vercel URL
- ✅ Test login/signup
- ✅ Test SSO (Google/Apple)
- ✅ Test dashboard
- ✅ Test trade import
- ✅ Test all major features

---

## 📊 Usage & Limits

**Note:** I don't have direct access to your Vercel account usage. To check:

1. **Vercel Dashboard:**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click on your project
   - Go to **Settings** → **Usage**
   - View:
     - Bandwidth usage
     - Function execution time
     - Build minutes
     - Edge requests

2. **Vercel Free Tier Limits:**
   - 100GB bandwidth/month
   - 100GB-hours function execution
   - Unlimited builds (with fair use)
   - 100 Edge requests/second

3. **Supabase Free Tier:**
   - 500MB database
   - 2GB bandwidth
   - 50,000 monthly active users

---

## 🎯 Current Configuration

Your `vercel.json` is already configured:
- ✅ Framework: Next.js
- ✅ Build Command: `npm run build`
- ✅ Region: `bom1` (Mumbai, India)

---

## 🚨 Common Issues & Fixes

### Build Fails
- Check all required environment variables are set
- Verify `NEXT_PUBLIC_APP_URL` is set
- Check build logs in Vercel dashboard

### Authentication Not Working
- Verify Supabase URLs are correct
- Check redirect URIs match in Supabase
- Ensure WorkOS redirect URI matches production URL

### Database Errors
- Run all migrations in Supabase
- Check RLS policies are enabled
- Verify service role key is set

---

## 🎉 Success!

Once deployed, your app will be live at:
**`https://your-project.vercel.app`**

For custom domain setup:
1. Go to **Settings** → **Domains**
2. Add your domain (e.g., `tradeautopsy.in`)
3. Follow DNS configuration instructions

---

**Ready to deploy? Run the commands in Step 1, then follow Steps 2-5!**
