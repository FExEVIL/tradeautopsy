# Vercel Deployment Guide for TradeAutopsy

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) if you don't have one
2. **GitHub/GitLab/Bitbucket**: Your code should be in a Git repository
3. **Supabase Project**: Make sure your Supabase project is set up

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Import Project to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select your TradeAutopsy repository
   - Click "Import"

3. **Configure Project Settings**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `tradeautopsy` (if your repo root is one level up)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install`

4. **Add Environment Variables**:
   Click "Environment Variables" and add the following:

   **Required Variables:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   **Optional Variables (if using these features):**
   ```
   OPENAI_API_KEY=your_openai_api_key (for AI Coach)
   ZERODHA_API_KEY=your_zerodha_api_key (for Zerodha integration)
   ZERODHA_API_SECRET=your_zerodha_api_secret
   RAZORPAY_KEY_ID=your_razorpay_key (for payments)
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   ```

5. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live at `your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Navigate to project directory**:
   ```bash
   cd tradeautopsy
   ```

4. **Deploy**:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Link to existing project or create new
   - Confirm settings
   - Add environment variables when prompted

5. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

## Environment Variables Setup

### Required Variables

These must be set in Vercel:

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Supabase Dashboard → Settings → API |

### Optional Variables

| Variable | Description | Required For |
|----------|-------------|--------------|
| `OPENAI_API_KEY` | OpenAI API key | AI Coach features |
| `ZERODHA_API_KEY` | Zerodha API key | Zerodha integration |
| `ZERODHA_API_SECRET` | Zerodha API secret | Zerodha integration |
| `RAZORPAY_KEY_ID` | Razorpay key ID | Payment features |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret | Payment features |

## Post-Deployment Checklist

1. ✅ **Test Authentication**: Verify login/signup works
2. ✅ **Test Database Connection**: Verify Supabase connection
3. ✅ **Run Migrations**: Make sure all database migrations are applied in Supabase
4. ✅ **Test Core Features**: 
   - Trade import
   - Dashboard display
   - AI Coach (if API key is set)
   - Reports generation

## Database Migrations

After deployment, make sure to run all migrations in your Supabase project:

1. Go to Supabase Dashboard → SQL Editor
2. Run each migration file in order:
   - `20251201122639_add_trade_journal_fields.sql`
   - `20251202000000_setup_trade_screenshots_storage.sql`
   - `20251203000000_add_ai_coach_tables.sql`
   - `20251204000000_add_predictive_alerts.sql`
   - `20251205000000_add_automation_and_rules_tables.sql`
   - `20251206000000_extend_user_preferences.sql`

Or use the combined migration:
- `COMBINED_ALL_TABLES.sql`

## Troubleshooting

### Build Errors
- Check that all environment variables are set
- Verify `next.config.ts` settings
- Check build logs in Vercel dashboard

### Runtime Errors
- Check Vercel function logs
- Verify Supabase connection
- Check browser console for client-side errors

### Database Errors
- Ensure migrations are run
- Check Supabase RLS policies
- Verify environment variables are correct

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Vercel will automatically provision SSL

## Support

For issues:
- Check Vercel deployment logs
- Check Supabase logs
- Review Next.js build output

