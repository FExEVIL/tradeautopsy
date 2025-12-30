# Tradeautopsy - Complete File Structure

## Root Directory
```
tradeautopsy/
├── app/                          # Next.js App Router
├── components/                   # Reusable React components
├── lib/                          # Core libraries and utilities
├── utils/                        # Utility functions
├── types/                        # TypeScript type definitions
├── hooks/                        # Custom React hooks
├── contexts/                     # React context providers
├── public/                       # Static assets
├── supabase/                     # Supabase migrations
├── scripts/                      # Build and utility scripts
├── docs/                         # Documentation
├── __tests__/                    # Test files
├── test-data/                    # Test data files
├── node_modules/                 # Dependencies
├── middleware.ts                 # Next.js middleware
├── next.config.js                # Next.js configuration
├── next.config.ts                # Next.js TypeScript config
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── package.json                  # Node.js dependencies
└── [various .md files]          # Documentation files
```

## App Directory (`app/`)

### Main Routes
```
app/
├── page.tsx                      # Home/Landing page
├── layout.tsx                    # Root layout
├── globals.css                   # Global styles
├── favicon.ico                   # Site favicon
│
├── login/                        # Login page
│   └── page.tsx
├── signup/                       # Signup pages
│   ├── page.tsx
│   └── email/
│       └── page.tsx
├── verify/                       # Email verification
│   └── page.tsx
├── verify-otp/                   # OTP verification
│   └── page.tsx
├── onboarding/                  # User onboarding
│   ├── page.tsx
│   └── welcome/
│       └── page.tsx
│
├── auth/                         # Authentication routes
│   ├── callback/
│   │   └── workos/
│   │       └── route.ts
│   ├── magic-link-sent/
│   │   └── page.tsx
│   ├── mfa/
│   │   └── setup/
│   │       └── page.tsx
│   ├── passkey/
│   │   └── create/
│   │       └── page.tsx
│   ├── reset-password/
│   │   └── page.tsx
│   └── signout/
│       └── route.ts
│
└── (with-sidebar)/              # Layout group with sidebar
    ├── dashboard/               # Main dashboard
    ├── calendar/                # Calendar view
    ├── trades/                  # Trades management
    ├── performance/             # Performance analytics
    └── goals/                   # Goals tracking
```

### Dashboard (`app/dashboard/`)
```
dashboard/
├── page.tsx                      # Main dashboard page
├── layout.tsx                    # Dashboard layout
├── DashboardClient.tsx           # Client-side dashboard logic
│
├── components/                   # Dashboard-specific components (61 files)
│   ├── CumulativePnLChart.tsx
│   ├── DailyPnLChart.tsx
│   ├── ImprovedEquityCurve.tsx
│   ├── MonthlyPnLChart.tsx
│   ├── DateRangeFilter.tsx
│   ├── TimeGranularityFilter.tsx
│   ├── DashboardMetricsSkeleton.tsx
│   ├── BenchmarkCard.tsx
│   ├── AnimatedProgressBar.tsx
│   ├── AICoachCard.tsx
│   ├── PredictiveAlerts.tsx
│   ├── MorningBrief.tsx
│   └── [48 more component files]
│
├── calendar/                     # Calendar view
│   ├── page.tsx
│   ├── CalendarClient.tsx
│   ├── [date]/                  # Dynamic date routes
│   │   ├── page.tsx
│   │   └── components/
│   │       ├── DailyTradesList.tsx
│   │       └── [3 more files]
│   └── components/
│       ├── DailyPerformanceReport.tsx
│       └── [1 more file]
│
├── trades/                       # Trades management
│   └── [5 files]
│
├── journal/                      # Trading journal
│   ├── page.tsx
│   ├── JournalClient.tsx
│   └── components/              # 14 journal components
│
├── performance/                  # Performance analytics
│   ├── page.tsx
│   └── PerformanceClient.tsx
│
├── charts/                       # Charts view
│   ├── page.tsx
│   ├── ChartsClient.tsx
│   └── ChartsWrapper.tsx
│
├── goals/                        # Goals management
│   ├── page.tsx
│   ├── GoalsClient.tsx
│   └── components/
│
├── settings/                     # Settings pages
│   ├── page.tsx
│   ├── SettingsClient.tsx
│   ├── alerts/                  # Alert settings (4 files)
│   ├── automation/              # Automation settings (2 files)
│   ├── brokers/                 # Broker settings (2 files)
│   ├── components/              # Settings components (7 files)
│   └── ml-insights/             # ML insights settings (2 files)
│
├── import/                       # Trade import
│   ├── page.tsx
│   └── ImportClient.tsx
│
├── manual/                       # Manual trade entry
│   └── page.tsx
│
├── intelligence/                 # AI Intelligence dashboard
│   ├── page.tsx
│   └── IntelligenceDashboard.tsx
│
├── morning-brief/               # Morning brief
│   ├── page.tsx
│   └── MorningBriefPageClient.tsx
│
├── behavioral/                   # Behavioral analysis
│   ├── page.tsx
│   ├── BehavioralClient.tsx
│   └── components/              # 2 files
│
├── behavioral-analysis/         # Behavioral analysis page
│   └── page.tsx
│
├── emotional/                    # Emotional patterns
│   ├── page.tsx
│   └── EmotionalClient.tsx
│
├── patterns/                     # Trading patterns
│   ├── page.tsx
│   └── components/              # 2 files
│
├── risk/                         # Risk management
│   ├── page.tsx
│   ├── RiskClient.tsx
│   └── components/
│
├── rules/                        # Trading rules
│   ├── page.tsx
│   └── RulesClient.tsx
│
├── strategy-analysis/           # Strategy analysis
│   ├── page.tsx
│   └── StrategyAnalysisClient.tsx
│
├── reports/                      # Reports
│   ├── page.tsx
│   └── ReportsClient.tsx
│
├── brokers/                      # Brokers management
│   └── page.tsx
│
├── profiles/                     # Profile management
│   └── page.tsx
│
├── comparisons/                  # Trade comparisons
│   ├── page.tsx
│   └── ComparisonsClient.tsx
│
├── economic-calendar/            # Economic calendar
│   ├── page.tsx
│   └── EconomicCalendarClient.tsx
│
└── tilt/                         # Tilt assessment (2 files)
```

### API Routes (`app/api/`)
```
api/
├── auth/                         # Authentication endpoints
│   ├── callback/
│   ├── logout/
│   ├── oauth/
│   ├── onboarding/
│   ├── reset-password/
│   ├── send-code/
│   ├── send-otp/
│   ├── signup/
│   ├── verify-code/
│   ├── verify-otp/
│   └── workos/                   # WorkOS integration (2 files)
│
├── trades/                       # Trade management APIs
│   ├── route.ts
│   ├── [id]/                    # Individual trade (2 files)
│   ├── calculate-pnl/
│   ├── delete-all/
│   ├── import/
│   ├── manual/
│   └── recent/
│
├── dashboard/                    # Dashboard APIs
│   ├── route.ts
│   └── metrics/
│
├── profile/                      # Profile management APIs
│   ├── apply-template/
│   ├── dashboard/
│   ├── features/
│   └── set-active/
│
├── journal/                      # Journal APIs (via journal-utils)
│
├── audio-journal/                # Audio journal APIs
│   ├── analyze/
│   ├── delete/
│   ├── process/
│   ├── save/
│   └── transcribe/
│
├── intelligence/                 # AI Intelligence APIs
│   ├── chat/
│   ├── dashboard/
│   ├── insights/
│   └── trades/
│
├── ai/                           # AI services
│   └── chat/
│
├── alerts/                       # Alert management
│   ├── route.ts
│   └── generate/
│
├── predictive-alerts/            # Predictive alerts
│
├── morning-brief/                # Morning brief APIs
│   ├── route.ts
│   └── read/
│
├── backtesting/                  # Backtesting APIs
│   ├── route.ts
│   ├── run/
│   ├── results/                 # 2 files
│   └── templates/
│
├── benchmark/                    # Benchmark APIs
│   └── route.ts
│
├── brokers/                      # Broker APIs
│   └── [id]/                     # 2 files
│
├── zerodha/                      # Zerodha integration
│   ├── auth/
│   ├── callback/
│   ├── disconnect/
│   └── import-trades/
│
├── reports/                      # Report generation
│   ├── csv/
│   ├── pdf/
│   ├── history/
│   └── scheduled/               # 2 files
│
├── mistakes/                     # Mistakes tracking
│   ├── route.ts
│   └── [id]/
│
├── cron/                         # Cron jobs
│   ├── generate-insights/
│   └── refresh-metrics/
│
├── extension/                    # Browser extension APIs
│   ├── rules/
│   ├── stats/
│   └── validate/
│
├── ml/                           # Machine learning
│   └── insights/
│
├── analytics/                    # Analytics
│   └── vitals/
│
├── economic-calendar/            # Economic calendar
│   └── fetch/
│
└── health/                       # Health check
    └── route.ts
```

### Other App Routes
```
app/
├── backtesting/                  # Backtesting module
│   ├── layout.tsx
│   ├── page.tsx
│   ├── historical/
│   │   └── page.tsx
│   ├── option-chain/
│   │   └── page.tsx
│   ├── results/
│   │   └── [id]/
│   │       └── page.tsx
│   └── strategy-builder/
│       └── page.tsx
│
├── behavioral-analysis/          # Behavioral analysis
│   ├── layout.tsx
│   ├── page.tsx
│   └── BehavioralAnalysisClient.tsx
│
├── emotional-patterns/           # Emotional patterns
│   ├── layout.tsx
│   ├── page.tsx
│   └── EmotionalPatternsClient.tsx
│
├── risk-management/             # Risk management
│   ├── layout.tsx
│   ├── page.tsx
│   └── RiskManagementClient.tsx
│
├── tilt-assessment/             # Tilt assessment
│   ├── layout.tsx
│   ├── page.tsx
│   └── TiltAssessmentClient.tsx
│
├── goals/                        # Goals (standalone)
│   ├── layout.tsx
│   ├── page.tsx
│   └── GoalsClient.tsx
│
├── tai/                          # TAI (Trading AI)
│   ├── layout.tsx
│   └── insights/
│       └── page.tsx
│
├── blog/                         # Blog
│   └── page.tsx
│
├── features/                      # Features page
│   └── page.tsx
│
├── faq/                          # FAQ
│   └── page.tsx
│
└── test-api/                     # API testing
    └── page.tsx
```

## Components Directory (`components/`)
```
components/
├── AudioPlayer.tsx               # Audio playback component
├── AudioRecorder.tsx             # Audio recording component
├── FeatureGate.tsx               # Feature flag component
├── Icons.tsx                     # Icon components
├── KeyboardShortcuts.tsx         # Keyboard shortcuts
├── MarketStatusIndicator.tsx     # Market status display
├── MarketStatusIndicatorMobile.tsx
├── Navbar.tsx                    # Navigation bar
├── OnboardingWidget.tsx          # Onboarding widget
├── PerformanceMonitor.tsx        # Performance monitoring
├── PnLIndicator.tsx              # P&L display component
├── ThemeProvider.tsx             # Theme context provider
├── ThemeToggle.tsx               # Theme switcher
│
├── auth/                         # Authentication components
│   ├── AuthLayout.tsx
│   ├── Button.tsx
│   ├── Divider.tsx
│   ├── ExpandableOptions.tsx
│   ├── Input.tsx
│   ├── LoginForm.tsx
│   ├── OTPInput.tsx
│   ├── OTPVerification.tsx
│   └── SSOButton.tsx
│
├── backtesting/                  # Backtesting components
│   ├── GreeksCalculator.tsx
│   ├── LegalDisclaimers.tsx
│   ├── PayoffDiagram.tsx
│   ├── StrategyBuilder.tsx
│   └── StrategyClassifier.tsx
│
├── charts/                       # Chart components
│   └── DarkTooltip.tsx
│
├── layouts/                      # Layout components
│   └── PageLayout.tsx
│
├── lazy/                         # Lazy-loaded components
│   └── index.ts
│
├── optimized/                    # Optimized components
│   └── PerformanceChart.tsx
│
├── SEO/                          # SEO components
│   ├── InternalLink.tsx
│   ├── PageSEO.tsx
│   └── StructuredData.tsx
│
└── ui/                           # UI primitives
    ├── Card.tsx
    ├── ChartCard.tsx
    ├── error-boundary.tsx
    ├── ListCard.tsx
    ├── Logo.tsx
    ├── MetricCard.tsx
    ├── PageHeader.tsx
    ├── PageShell.tsx
    ├── skeleton.tsx
    ├── StatCard.tsx
    └── tabs.tsx
```

## Lib Directory (`lib/`)
```
lib/
├── action-plans.ts               # Action plan generation
├── ai-coach.ts                   # AI coach logic
├── automation.ts                 # Automation rules
├── behavioral-analyzer.ts       # Behavioral analysis
├── benchmark-utils.ts            # Benchmark calculations
├── calculations.ts               # Core calculations (PnL, etc.)
├── calendar-utils.ts             # Calendar utilities
├── chartTheme.ts                 # Chart theming
├── comparison-utils.ts           # Trade comparisons
├── constants.ts                  # App constants
├── csv-auto-detector.ts          # CSV format detection
├── dashboard-stats.ts            # Dashboard statistics
├── dynamicImports.ts             # Dynamic imports (legacy)
├── dynamicImports.tsx            # Dynamic imports (current)
├── economic-calendar.ts          # Economic calendar logic
├── email-service.ts              # Email service
├── encryption.ts                 # Encryption utilities
├── feature-flags.ts              # Feature flag system
├── formatters.ts                 # Data formatters
├── icons.ts                      # Icon utilities
├── image-compression.ts          # Image compression
├── journal-utils.ts              # Journal utilities (client)
├── journal-utils-server.ts       # Journal utilities (server)
├── market-status.ts              # Market status logic
├── morning-brief.ts             # Morning brief generation
├── pdf-generator.ts              # PDF report generation
├── pnl-calculator.ts             # P&L calculations
├── predictive-alerts.ts         # Predictive alerts
├── profile-templates.ts          # Profile templates
├── profile-utils.ts              # Profile utilities
├── profit-calendar-utils.ts      # Profit calendar
├── risk-calculations.ts          # Risk calculations
├── rule-engine.ts                # Trading rule engine
├── seed-data-generator.ts        # Test data generation
├── strategy-analysis.ts          # Strategy analysis
├── strategy-classifier.ts        # Strategy classification
├── supabase-client.ts            # Supabase client (legacy)
├── supabase-server.ts            # Supabase server (legacy)
├── supabase.ts                   # Supabase utilities
├── test-utils.tsx                # Test utilities
├── theme.ts                      # Theme configuration
├── useDebounce.ts                # Debounce hook
├── vitals.ts                     # Web vitals tracking
├── workos.ts                     # WorkOS integration
├── zerodha.ts                    # Zerodha integration
│
├── api/                          # API utilities
│   └── middleware.ts
│
├── auth/                         # Authentication utilities
│   └── workos-optimized.ts
│
├── backtesting/                  # Backtesting engine
│   ├── backtest-engine.ts
│   ├── greeks.ts
│   ├── payoff.ts
│   └── strategy-classifier.ts
│
├── behavioral/                  # Behavioral analysis
│   ├── types.ts
│   └── utils.ts
│
├── brokers/                      # Broker integrations
│   ├── base-connector.ts
│   ├── connector-factory.ts
│   └── zerodha-connector.ts
│
├── cache/                        # Caching utilities
│   ├── query-cache.ts
│   └── redis.ts
│
├── contexts/                     # React contexts
│   ├── ProfileContext.tsx
│   └── ProfileDashboardContext.tsx
│
├── csv-import/                   # CSV import utilities
│   └── presets.ts
│
├── db/                           # Database utilities
│   └── optimized-queries.ts
│
├── emotional-engine/             # Emotional analysis engine
│   └── calculator.ts
│
├── hooks/                        # Custom hooks
│   ├── useFeatureEnabled.ts
│   ├── useMarketStatus.ts
│   └── useTradeData.ts
│
├── intelligence/                 # AI Intelligence system
│   ├── __tests__/                # Intelligence tests
│   │   ├── engine-dashboard.test.ts
│   │   ├── insight-generator.test.ts
│   │   ├── metrics-calculator.test.ts
│   │   ├── pattern-detector.test.ts
│   │   └── trade-predictor.test.ts
│   ├── analytics/                # Analytics
│   │   ├── feature-extractor.ts
│   │   ├── insight-generator.ts
│   │   └── metrics-calculator.ts
│   ├── auto-goals.ts             # Auto goal generation
│   ├── auto-processor.ts         # Auto processing
│   ├── auto-tagger.ts            # Auto tagging
│   ├── coach/                    # AI coach
│   │   └── ai-coach.ts
│   ├── core/                     # Core engine
│   │   ├── engine.ts
│   │   └── types.ts
│   ├── detection/                # Pattern detection
│   │   ├── anomaly-detector.ts
│   │   ├── pattern-detector.ts
│   │   └── regime-detector.ts
│   ├── gamification/             # Gamification
│   │   ├── achievements.ts
│   │   └── challenges.ts
│   ├── mistake-detector.ts       # Mistake detection
│   └── prediction/               # Predictions
│       ├── position-sizer.ts
│       └── trade-predictor.ts
│
├── ml/                           # Machine learning
│   └── personalization.ts
│
├── queries/                      # Database queries
│   └── optimized.ts
│
├── store/                        # State management
│   └── useAppStore.ts
│
├── supabase/                     # Supabase utilities
│   ├── client-optimized.ts
│   └── client.ts
│
├── theme/                        # Theme utilities
│   └── colors.ts
│
├── types/                        # Type definitions
│   └── index.ts
│
└── utils/                        # Utility functions
    ├── currency.ts
    ├── error-handler.ts
    ├── errors.ts
    ├── fetch.ts
    └── logger.ts
```

## Other Directories

### Utils (`utils/`)
```
utils/
└── supabase/
    ├── client.ts                 # Supabase client utilities
    └── server.ts                 # Supabase server utilities
```

### Types (`types/`)
```
types/
├── backtesting.ts                # Backtesting types
├── react-calendar-heatmap.d.ts  # Calendar heatmap types
└── trade.ts                      # Trade types
```

### Hooks (`hooks/`)
```
hooks/
├── use-optimized-query.ts        # Optimized query hook
└── useIntelligence.ts            # Intelligence hook
```

### Contexts (`contexts/`)
```
contexts/
└── OnboardingContext.tsx         # Onboarding context
```

### Public (`public/`)
```
public/
├── favicon.svg
├── file.svg
├── globe.svg
├── logo.svg
├── next.svg
├── robots.txt
├── site.webmanifest
├── sitemap.xml
├── vercel.svg
└── window.svg
```

### Supabase (`supabase/`)
```
supabase/
└── migrations/                    # Database migrations
    ├── [30+ migration files]
    └── COMBINED_ALL_TABLES.sql
```

### Scripts (`scripts/`)
```
scripts/
├── generate-test-csv.ts          # CSV test data generator
└── seed-bogus-data.ts           # Test data seeder
```

### Docs (`docs/`)
```
docs/
└── extension/                    # Browser extension docs
    ├── content-script.example.js
    ├── manifest.json.example
    └── README.md
```

### Tests (`__tests__/`)
```
__tests__/
└── lib/
    └── utils/
        └── currency.test.ts
```

## Configuration Files

### Root Level
```
├── middleware.ts                 # Next.js middleware
├── next.config.js                # Next.js config (JS)
├── next.config.ts                # Next.js config (TS)
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind CSS config
├── tailwind.config.backup.ts     # Tailwind backup
├── postcss.config.mjs            # PostCSS config
├── eslint.config.mjs             # ESLint config
├── jest.config.js                # Jest test config
├── jest.setup.js                 # Jest setup
├── vercel.json                   # Vercel deployment config
├── proxy.config.ts               # Proxy configuration
├── package.json                  # Node.js dependencies
├── package-lock.json             # Lock file
└── README.md                     # Project documentation
```

## Key Files Summary

### Main Application Files
- **`app/page.tsx`** - Landing/home page
- **`app/dashboard/page.tsx`** - Main dashboard
- **`app/layout.tsx`** - Root layout
- **`middleware.ts`** - Authentication middleware

### Core Libraries
- **`lib/calculations.ts`** - Core P&L and metric calculations
- **`lib/dynamicImports.tsx`** - Dynamic component loading
- **`lib/intelligence/`** - AI intelligence system
- **`lib/contexts/ProfileContext.tsx`** - Profile management context

### Components
- **`components/ui/`** - Reusable UI components
- **`components/auth/`** - Authentication components
- **`app/dashboard/components/`** - Dashboard-specific components (61 files)

### API Routes
- **`app/api/trades/`** - Trade management APIs
- **`app/api/dashboard/`** - Dashboard APIs
- **`app/api/intelligence/`** - AI intelligence APIs
- **`app/api/audio-journal/`** - Audio journal APIs

## Statistics
- **Total App Routes**: 50+ pages
- **API Endpoints**: 40+ routes
- **Dashboard Components**: 61 files
- **Database Migrations**: 30+ files
- **Lib Utilities**: 100+ files
- **Test Files**: Multiple test suites

