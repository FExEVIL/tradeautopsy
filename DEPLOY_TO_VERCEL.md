# 🚀 Deploy TradeAutopsy to Vercel

## Quick Deploy (5 Minutes)

### Step 1: Push to GitHub

```bash
cd /Users/bishnu/Tradeautopsy1/Untitled/tradeautopsy
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Deploy via Vercel Dashboard

1. **Go to [vercel.com/new](https://vercel.com/new)**
2. **Import your GitHub repository**
3. **Configure project:**
   - Framework: Next.js (auto-detected)
   - Root Directory: `./` (or `tradeautopsy` if repo root is one level up)
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Step 3: Add Environment Variables

In Vercel Dashboard → **Settings** → **Environment Variables**, add:

#### Required:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

#### Optional (if using these features):
```bash
# OpenAI (for AI Coach & Audio Transcription)
OPENAI_API_KEY=sk-proj-your_key

# WorkOS (for SSO)
WORKOS_API_KEY=sk_test_your_key
WORKOS_CLIENT_ID=client_your_id
NEXT_PUBLIC_WORKOS_REDIRECT_URI=https://your-project.vercel.app/auth/callback/workos

# Zerodha
ZERODHA_API_KEY=your_key
ZERODHA_API_SECRET=your_secret

# Razorpay
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
```

### Step 4: Deploy

Click **"Deploy"** and wait for build to complete!

---

## Alternative: Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd /Users/bishnu/Tradeautopsy1/Untitled/tradeautopsy
vercel

# Follow prompts, then:
vercel --prod
```

---

## ✅ Post-Deployment

1. **Run Database Migrations** in Supabase SQL Editor
2. **Update WorkOS Redirect URI** to production URL
3. **Test the app** at your Vercel URL
4. **Set up custom domain** (optional)

---

## 📋 Complete Environment Variables List

See `VERCEL_DEPLOYMENT.md` for full list and where to find each value.

---

## 🎉 Done!

Your app will be live at: `https://your-project.vercel.app`
