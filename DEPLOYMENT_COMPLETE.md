# 🚀 TradeAutopsy Deployment Guide

Complete deployment instructions for TradeAutopsy to Vercel with all configurations.

---

## 📋 Pre-Deployment Checklist

- [ ] All code committed to GitHub
- [ ] Supabase project created (production)
- [ ] WorkOS account configured
- [ ] Environment variables documented
- [ ] Database migrations ready
- [ ] Build succeeds locally (`npm run build`)
- [ ] No secrets in Git history

---

## 🔧 Step 1: Vercel Deployment

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub
2. **Click "Add New" → "Project"**
3. **Import Repository**: `https://github.com/FExEVIL/tradeautopsy.git`
4. **Configure Project**:
   - **Project Name**: `tradeautopsy`
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)
   - **Node Version**: 20.x (recommended)

5. **Add Environment Variables** (see Step 2 below)
6. **Click "Deploy"**

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

---

## 🔐 Step 2: Environment Variables

Add these environment variables in **Vercel Dashboard → Project Settings → Environment Variables**:

### Required Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# WorkOS
WORKOS_API_KEY=your_workos_api_key
WORKOS_CLIENT_ID=your_workos_client_id
NEXT_PUBLIC_WORKOS_REDIRECT_URI=https://your-domain.vercel.app/auth/callback/workos

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

# OpenAI (for TAI features)
OPENAI_API_KEY=your_openai_api_key

# Upstash Redis (optional, for rate limiting)
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

### Environment-Specific Variables

Set variables for:
- **Production**: All environments
- **Preview**: All environments (for PR previews)
- **Development**: Local development only

---

## 🗄️ Step 3: Database Setup

### 3.1 Run Migrations

```bash
# Using Supabase CLI
npx supabase db push

# Or manually in Supabase Dashboard:
# 1. Go to SQL Editor
# 2. Run migrations in order:
#    - supabase/migrations/20250101_performance_indexes.sql
#    - supabase/migrations/20250102_enterprise_performance_optimization.sql
```

### 3.2 Verify Tables

Ensure these tables exist:
- `profiles`
- `trades`
- `sessions`
- `goals`
- `tai_insights`
- `journal_entries`
- `audio_journal_entries`

---

## 🔗 Step 4: WorkOS Configuration

### 4.1 Update WorkOS Dashboard

1. Go to [WorkOS Dashboard](https://dashboard.workos.com)
2. Navigate to **Configuration → Redirect URIs**
3. Add production callback URL:
   ```
   https://your-domain.vercel.app/auth/callback/workos
   ```
4. Save changes

### 4.2 Update Environment Variables

After deployment, update `NEXT_PUBLIC_WORKOS_REDIRECT_URI` with your actual domain.

---

## 🌐 Step 5: Supabase Configuration

### 5.1 Update Auth Settings

1. Go to **Supabase Dashboard → Authentication → URL Configuration**
2. Add to **Site URL**:
   ```
   https://your-domain.vercel.app
   ```
3. Add to **Redirect URLs**:
   ```
   https://your-domain.vercel.app/auth/callback/workos
   https://your-domain.vercel.app/dashboard
   ```

### 5.2 Update RLS Policies

Ensure RLS policies are enabled for all tables:
- `profiles`
- `trades`
- `sessions`
- `goals`
- `tai_insights`

---

## 📦 Step 6: Build Configuration

The project uses `vercel.json` for deployment configuration:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

**No changes needed** - Vercel auto-detects Next.js configuration.

---

## ✅ Step 7: Post-Deployment Verification

### 7.1 Test Authentication Flow

1. Visit `https://your-domain.vercel.app/login`
2. Enter email and request OTP
3. Check email for verification code
4. Enter code and verify login
5. Should redirect to `/dashboard`

### 7.2 Test OAuth Providers

1. Click "Continue with Google"
2. Should redirect to Google OAuth
3. Complete authentication
4. Should redirect back to dashboard

### 7.3 Verify API Routes

Test these endpoints:
- `POST /api/auth/send-otp`
- `POST /api/auth/verify-otp`
- `GET /api/dashboard`
- `GET /api/trades`

### 7.4 Check Performance

1. Open Vercel Dashboard → Analytics
2. Check Core Web Vitals:
   - FCP < 1.8s ✅
   - LCP < 2.5s ✅
   - INP < 200ms ✅
   - CLS < 0.1 ✅

---

## 🔄 Step 8: Automatic Deployments

### 8.1 GitHub Integration

Vercel automatically deploys:
- **Production**: Every push to `main` branch
- **Preview**: Every pull request

### 8.2 Configure Branch Protection

1. Go to **Vercel Dashboard → Settings → Git**
2. Set **Production Branch**: `main`
3. Enable **Automatic Deployments**

---

## 🛠️ Step 9: Custom Domain (Optional)

### 9.1 Add Custom Domain

1. Go to **Vercel Dashboard → Settings → Domains**
2. Click **Add Domain**
3. Enter your domain: `tradeautopsy.com`
4. Follow DNS configuration instructions

### 9.2 Update Environment Variables

After adding custom domain, update:
```bash
NEXT_PUBLIC_APP_URL=https://tradeautopsy.com
NEXT_PUBLIC_WORKOS_REDIRECT_URI=https://tradeautopsy.com/auth/callback/workos
```

---

## 🐛 Troubleshooting

### Build Fails

```bash
# Check build logs in Vercel Dashboard
# Common issues:
# - Missing environment variables
# - TypeScript errors
# - Missing dependencies
```

### Authentication Not Working

1. Verify WorkOS credentials are correct
2. Check callback URLs match in WorkOS dashboard
3. Verify Supabase redirect URLs are configured
4. Check browser console for errors

### Database Connection Issues

1. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Check `SUPABASE_SERVICE_ROLE_KEY` is set
3. Verify RLS policies allow access
4. Check Supabase project is active

### Environment Variables Not Working

1. Ensure variables are set for **Production** environment
2. Redeploy after adding new variables
3. Check variable names match exactly (case-sensitive)
4. Verify `NEXT_PUBLIC_` prefix for client-side variables

---

## 📊 Monitoring

### Vercel Analytics

- **Speed Insights**: Automatic (via `@vercel/speed-insights`)
- **Web Vitals**: Tracked automatically
- **Real User Monitoring**: Enabled by default

### Error Tracking

Check **Vercel Dashboard → Logs** for:
- Build errors
- Runtime errors
- API route errors

---

## 🔒 Security Checklist

- [ ] All environment variables set in Vercel (not in code)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is server-side only
- [ ] `WORKOS_API_KEY` is server-side only
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Security headers configured (in `next.config.js`)
- [ ] CORS configured correctly
- [ ] Rate limiting enabled (via Upstash)

---

## 📝 Deployment Commands

```bash
# Local build test
npm run build
npm run start

# Deploy to Vercel
vercel --prod

# Deploy preview
vercel

# View deployment logs
vercel logs

# Check deployment status
vercel inspect
```

---

## 🎯 Quick Deploy Script

Save this as `deploy.sh`:

```bash
#!/bin/bash

echo "🚀 Deploying TradeAutopsy to Vercel..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm i -g vercel
fi

# Build locally first
echo "📦 Building project..."
npm run build

# Deploy to production
echo "🚀 Deploying to production..."
vercel --prod --yes

echo "✅ Deployment complete!"
echo "🌐 Check your deployment at: https://your-project.vercel.app"
```

Make it executable:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 📞 Support

If deployment fails:
1. Check Vercel build logs
2. Verify all environment variables are set
3. Ensure database migrations are run
4. Check GitHub repository is connected
5. Review error messages in Vercel dashboard

---

## ✅ Deployment Complete!

After successful deployment:
- ✅ Application is live at `https://your-domain.vercel.app`
- ✅ Automatic deployments enabled
- ✅ Performance monitoring active
- ✅ Error tracking enabled
- ✅ SSL/HTTPS configured automatically

**Next Steps:**
1. Test all authentication flows
2. Verify database connections
3. Monitor performance metrics
4. Set up custom domain (optional)
5. Configure monitoring alerts

---

**Last Updated**: January 2025
**Version**: 1.0.0

