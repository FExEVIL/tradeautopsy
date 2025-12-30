# 🚀 TradeAutopsy - Full Context for New Chat

**Last Updated:** December 2024  
**Project Status:** Production-ready, ~95% complete  
**Domain:** https://www.tradeautopsy.in

---

## 📋 **PROJECT OVERVIEW**

**TradeAutopsy** is a comprehensive, AI-powered trading analytics platform that transforms raw trading data into actionable insights, predictive analytics, and personalized coaching. It's a Next.js application with dual authentication (Supabase + WorkOS), multi-profile support, and extensive trading analytics features.

### **Core Purpose:**
- Trading journal and performance tracking
- AI-powered coaching and insights
- Behavioral pattern detection
- Risk management and analytics
- Multi-broker integration (Zerodha, Upstox, Angel One)
- Predictive alerts and market analysis

---

## 🛠️ **TECH STACK**

### **Frontend:**
- **Next.js 15.5.6** (App Router with Server Components)
- **React 19.2.0** (Server & Client Components)
- **TypeScript 5** (strict mode)
- **Tailwind CSS 4** (styling)
- **Framer Motion** (animations)
- **Recharts** (data visualization)
- **Zustand** (client state management)
- **SWR** (data fetching)

### **Backend:**
- **Supabase** (PostgreSQL database, Auth, RLS policies)
- **WorkOS** (Enterprise SSO, OAuth, Password auth)
- **OpenAI GPT-4o-mini** (AI coaching, insights)
- **Upstash Redis** (rate limiting, caching)
- **Vercel** (hosting & deployment)

### **Key Libraries:**
- `@workos-inc/node` - WorkOS authentication
- `@supabase/ssr` - Supabase server-side rendering
- `date-fns` - Date manipulation
- `zod` - Schema validation
- `papaparse` - CSV parsing
- `recharts` - Charts and graphs

---

## 🔐 **AUTHENTICATION SYSTEM (RECENTLY UPDATED)**

### **Dual Authentication Support:**
The app supports **both Supabase and WorkOS** authentication methods:

1. **Supabase Auth** (Email/Password, OTP)
2. **WorkOS Auth** (OAuth, Password, Magic Link)

### **Authentication Routes:**

#### **Login Options:**
- **Magic Link (OTP)** - `/api/auth/send-otp` → `/verify`
- **Password Login** - `/api/auth/login-password` (WorkOS)
- **Google SSO** - `/api/auth/oauth/authorize` → `/api/auth/callback`
- **GitHub SSO** - Same OAuth flow
- **Other OAuth** - Microsoft, Apple (configured)

#### **Signup Options:**
- **Email/Password** - `/api/auth/signup-password` (WorkOS)
- **OAuth Signup** - Via `/api/auth/workos/authorize`

#### **Key Files:**
- `app/login/page.tsx` - Login page with all auth methods
- `app/signup/email/page.tsx` - Password signup
- `app/api/auth/oauth/authorize/route.ts` - OAuth authorization
- `app/api/auth/callback/route.ts` - OAuth callback handler
- `app/api/auth/login-password/route.ts` - Password login
- `app/api/auth/signup-password/route.ts` - Password signup
- `lib/auth/workos-optimized.ts` - WorkOS helper functions
- `lib/workos.ts` - WorkOS client initialization

### **Session Management:**
- **Supabase users:** Standard Supabase session cookies
- **WorkOS users:** Custom cookies:
  - `workos_user_id`
  - `workos_access_token`
  - `workos_profile_id`
  - `active_profile_id`

### **Important Notes:**
- All dashboard pages check for **both** auth methods
- Use `effectiveUserId` pattern: `user?.id || workosProfileId`
- OAuth redirect URI: `/api/auth/callback` (not `/auth/callback/workos`)
- Response structure: API routes use `successResponse()` which wraps data in `{ success: true, data: {...} }`

---

## 📁 **KEY FILE STRUCTURE**

```
tradeautopsy/
├── app/
│   ├── api/                    # API routes (31+ endpoints)
│   │   ├── auth/              # Authentication endpoints
│   │   │   ├── oauth/authorize/route.ts
│   │   │   ├── callback/route.ts
│   │   │   ├── login-password/route.ts
│   │   │   ├── signup-password/route.ts
│   │   │   ├── send-otp/route.ts
│   │   │   └── verify-otp/route.ts
│   │   ├── dashboard/         # Dashboard data endpoints
│   │   ├── trades/            # Trade CRUD operations
│   │   ├── ai/chat/           # AI Coach chat
│   │   ├── morning-brief/     # Daily brief generation
│   │   └── zerodha/           # Zerodha integration
│   ├── dashboard/             # Main dashboard pages
│   │   ├── page.tsx           # Dashboard home
│   │   ├── layout.tsx         # Dashboard layout with sidebar
│   │   ├── components/        # Dashboard components
│   │   │   ├── CumulativePnLChart.tsx
│   │   │   ├── AnalyticsCards.tsx
│   │   │   ├── TradesTable.tsx
│   │   │   └── ...
│   │   ├── journal/           # Trading journal
│   │   ├── behavioral/        # Behavioral analysis
│   │   ├── calendar/          # Trading calendar
│   │   └── settings/          # User settings
│   ├── login/page.tsx         # Login page
│   ├── signup/                 # Signup pages
│   └── verify/page.tsx        # OTP verification
│
├── lib/
│   ├── auth/
│   │   └── workos-optimized.ts  # WorkOS helpers
│   ├── api/
│   │   └── middleware.ts        # API middleware (rate limiting, auth)
│   ├── contexts/
│   │   ├── ProfileContext.tsx   # Profile management
│   │   └── ProfileDashboardContext.tsx
│   ├── dynamicImports.tsx      # Dynamic component loading
│   └── workos.ts               # WorkOS client
│
├── components/
│   ├── ui/                     # UI components (Card, StatCard, etc.)
│   └── layouts/                # Layout components
│
├── utils/
│   └── supabase/               # Supabase client helpers
│       ├── server.ts            # Server-side client
│       └── client.ts             # Client-side client
│
└── types/                       # TypeScript type definitions
```

---

## 🎯 **CORE FEATURES**

### **1. Trading Journal**
- Trade import (CSV, Zerodha API)
- Trade CRUD operations
- Multi-profile support
- Trade categorization and tagging

### **2. Analytics & Performance**
- Cumulative P&L charts
- Equity curve visualization
- Win rate, Sharpe ratio, max drawdown
- Time-based granularity (day/week/month/year)
- Benchmark comparisons

### **3. AI Coach**
- Personalized coaching insights
- Weekly action plans
- Behavioral pattern analysis
- Chat interface for questions

### **4. Behavioral Analysis**
- 15+ trading patterns detection
- Emotional pattern analysis
- Risk-taking behavior
- Performance correlation

### **5. Risk Management**
- Position sizing calculator
- Risk metrics (VaR, CVaR)
- Portfolio risk analysis
- Risk alerts

### **6. Multi-Broker Support**
- Zerodha integration (OAuth)
- Upstox support (CSV)
- Angel One support (CSV)
- Universal CSV import with presets

### **7. Predictive Features**
- Morning brief (daily summary)
- Predictive alerts
- Market status indicator
- Economic calendar

### **8. Additional Features**
- Audio journaling with AI transcription
- PDF/CSV report generation
- Browser extension API
- ML personalization pipeline

---

## 🔧 **ENVIRONMENT VARIABLES**

### **Required Variables:**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# WorkOS
WORKOS_API_KEY=sk_test_...
WORKOS_CLIENT_ID=client_...
NEXT_PUBLIC_WORKOS_REDIRECT_URI=http://localhost:3000/api/auth/callback
WORKOS_COOKIE_PASSWORD=your-cookie-password

# OpenAI (for AI Coach)
OPENAI_API_KEY=sk-proj-...

# Zerodha (optional)
ZERODHA_API_KEY=your-key
ZERODHA_API_SECRET=your-secret
NEXT_PUBLIC_ZERODHA_REDIRECT_URL=http://localhost:3000/api/zerodha/callback

# Redis (optional, for rate limiting)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=your-token

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **Production URLs:**
- Redirect URI: `https://www.tradeautopsy.in/api/auth/callback`
- App URL: `https://www.tradeautopsy.in`

---

## 🗄️ **DATABASE SCHEMA (Key Tables)**

### **Core Tables:**
- `profiles` - User trading profiles (multi-profile support)
- `trades` - Individual trades
- `brokers` - Broker connections
- `goals` - Trading goals
- `notifications` - User notifications
- `audio_journal_entries` - Audio journal recordings
- `predictive_alerts` - AI-generated alerts

### **Important Fields:**
- `profiles.workos_user_id` - Links WorkOS users to profiles
- `profiles.auth_provider` - 'supabase' or 'workos'
- `trades.profile_id` - Scopes trades to profiles
- `trades.deleted_at` - Soft delete support

---

## ⚠️ **CURRENT STATE & KNOWN ISSUES**

### **Recently Fixed:**
1. ✅ **Google SSO OAuth** - Fixed response parsing and redirect URI
2. ✅ **Password Authentication** - Added WorkOS password login/signup
3. ✅ **Dual Auth Support** - All pages support both Supabase and WorkOS
4. ✅ **CumulativePnLChart** - Fixed dynamic import issues

### **Active Debugging:**
- Google OAuth authorization URL generation (added extensive logging)
- Response structure handling in login page

### **Potential Issues:**
- OAuth callback route may need WorkOS dashboard configuration
- Some pages may still need `effectiveUserId` pattern updates
- Environment variables must be set correctly for OAuth to work

---

## 🚀 **DEVELOPMENT WORKFLOW**

### **Starting the Project:**
```bash
npm install
npm run dev
```

### **Key Commands:**
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run test         # Run tests
npm run seed         # Seed test data
```

### **Database Migrations:**
- Migrations are in `supabase/migrations/`
- Run via Supabase CLI or dashboard

---

## 📝 **IMPORTANT PATTERNS & CONVENTIONS**

### **1. Authentication Pattern:**
```typescript
// Always check both auth methods
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()

const cookieStore = await cookies()
const workosUserId = cookieStore.get('workos_user_id')?.value
const workosProfileId = cookieStore.get('workos_profile_id')?.value

if (!user && !workosUserId) {
  redirect('/login')
}

const effectiveUserId = user?.id || workosProfileId
// Use effectiveUserId for all database queries
```

### **2. API Response Pattern:**
```typescript
// API routes use successResponse wrapper
return successResponse({ data: 'value' }, 200)
// Returns: { success: true, data: { data: 'value' } }

// Client must parse:
const response = await fetch('/api/endpoint')
const json = await response.json()
const value = json.data?.data || json.data
```

### **3. Dynamic Imports:**
- Heavy components use `next/dynamic` in `lib/dynamicImports.tsx`
- Charts use `ssr: false` to prevent SSR issues
- Skeleton loaders for better UX

### **4. Server vs Client Components:**
- **Server Components** (default): Data fetching, no hooks
- **Client Components** (`'use client'`): Interactivity, hooks, context
- Context providers must be in Client Components

---

## 🔍 **DEBUGGING TIPS**

### **OAuth Issues:**
1. Check browser console for `[OAuth]` logs
2. Check server terminal for `[WorkOS]` logs
3. Verify redirect URI matches WorkOS dashboard
4. Check environment variables are set

### **Authentication Issues:**
1. Verify cookies are being set (check browser DevTools)
2. Check both Supabase and WorkOS auth paths
3. Use `effectiveUserId` pattern consistently
4. Check RLS policies in Supabase

### **Import/Type Errors:**
1. Clear `.next` cache: `rm -rf .next`
2. Restart dev server
3. Check TypeScript config
4. Verify all imports use correct paths

---

## 📚 **ADDITIONAL DOCUMENTATION**

- `FILE_STRUCTURE.md` - Complete file structure
- `PROJECT_STATUS_REPORT.md` - Detailed project status
- `COMPREHENSIVE_FEATURE_SUMMARY.md` - All features
- `AUTH_SYSTEM_COMPLETE.md` - Authentication details
- `DEPLOYMENT_GUIDE.md` - Deployment instructions

---

## 🎯 **QUICK REFERENCE**

### **Common Tasks:**
- **Add new auth method:** Update `app/login/page.tsx` and create API route
- **Add new dashboard page:** Create in `app/dashboard/`, add to sidebar
- **Add new API endpoint:** Create in `app/api/`, use `withMiddleware`
- **Add new chart:** Use dynamic import in `lib/dynamicImports.tsx`

### **Key URLs:**
- Login: `/login`
- Dashboard: `/dashboard`
- OAuth Callback: `/api/auth/callback`
- Verify OTP: `/verify`

---

## 📞 **SUPPORT & RESOURCES**

- **WorkOS Docs:** https://workos.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Project Domain:** https://www.tradeautopsy.in

---

**This document should provide complete context for starting a new chat session about the TradeAutopsy project.**

