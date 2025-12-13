# Phase 1: Feature Planning & Data Model Design

**Date:** December 9, 2024  
**Status:** Design complete, ready for implementation

---

## 🎯 Implementation Order

### Group 1: P0 Safety & Correctness (Week 1)
1. **Delete Trade Functionality** - Fix settings page delete
2. **Performance Fixes** - Sidebar/navigation rendering

### Group 2: Data Model & Structure (Week 2)
3. **Multi-Profile Structure**
4. **Multi-Broker Support**
5. **Auto Trade Fetch**
6. **Universal CSV Import**

### Group 3: UX & Utility (Week 3)
7. **Taskbar Hide/Show**
8. **Live Market Status**
9. **Economic Calendar**
10. **Critical News Notifications**
11. **Morning Brief**

### Group 4: Advanced UX + AI (Week 4)
12. **Journal Audio → AI Summary**
13. **ML Personalization Pipeline**

### Group 5: Integration (Week 5)
14. **Browser Extension API**

---

## 📊 Data Model Design

### 1. Profiles Table

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "F&O Trading", "Equity Long-term"
  description TEXT,
  color TEXT DEFAULT '#3b82f6', -- UI color for profile
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

CREATE INDEX idx_profiles_user ON profiles(user_id, created_at DESC);
```

**Usage:**
- Trades, rules, analytics scoped by `profile_id`
- User can switch profiles in UI
- Default profile created on signup

---

### 2. Brokers Table

```sql
CREATE TABLE brokers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- "Zerodha", "Upstox", "Angel One", etc.
  broker_type TEXT NOT NULL, -- 'zerodha', 'upstox', 'angel_one', 'custom'
  api_key TEXT, -- Encrypted
  api_secret TEXT, -- Encrypted
  access_token TEXT, -- Encrypted (for OAuth-based)
  refresh_token TEXT, -- Encrypted
  token_expires_at TIMESTAMPTZ,
  connection_status TEXT DEFAULT 'disconnected', -- 'connected', 'disconnected', 'error'
  last_sync_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}', -- Broker-specific config
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_brokers_user ON brokers(user_id, created_at DESC);
CREATE INDEX idx_brokers_status ON brokers(user_id, connection_status);
```

**Usage:**
- Store broker credentials securely
- Track connection status
- Support multiple brokers per user

---

### 3. Broker-Profile Association

```sql
CREATE TABLE broker_profiles (
  broker_id UUID REFERENCES brokers(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (broker_id, profile_id)
);

CREATE INDEX idx_broker_profiles_broker ON broker_profiles(broker_id);
CREATE INDEX idx_broker_profiles_profile ON broker_profiles(profile_id);
```

**Usage:**
- Link brokers to profiles
- Trades from a broker can be assigned to specific profiles

---

### 4. Trades Table Updates

```sql
-- Add profile_id and broker_id to trades
ALTER TABLE trades 
  ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS broker_id UUID REFERENCES brokers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ; -- Soft delete

CREATE INDEX idx_trades_profile ON trades(user_id, profile_id, trade_date DESC);
CREATE INDEX idx_trades_broker ON trades(user_id, broker_id, trade_date DESC);
CREATE INDEX idx_trades_deleted ON trades(user_id, deleted_at) WHERE deleted_at IS NULL;
```

**Usage:**
- Scope trades by profile
- Track which broker trade came from
- Soft delete support

---

### 5. ML Insights Table

```sql
CREATE TABLE ml_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  insight_type TEXT NOT NULL, -- 'time_optimization', 'strategy_recommendation', 'risk_adjustment', etc.
  insight_text TEXT NOT NULL,
  confidence_score NUMERIC(3,2), -- 0.00 to 1.00
  metadata JSONB DEFAULT '{}', -- Supporting data, features used
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Optional expiration
  acknowledged BOOLEAN DEFAULT false
);

CREATE INDEX idx_ml_insights_user ON ml_insights(user_id, created_at DESC);
CREATE INDEX idx_ml_insights_profile ON ml_insights(user_id, profile_id, created_at DESC);
CREATE INDEX idx_ml_insights_unacknowledged ON ml_insights(user_id, acknowledged) WHERE acknowledged = false;
```

---

### 6. Economic Events Cache

```sql
CREATE TABLE economic_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_date DATE NOT NULL,
  event_time TIMESTAMPTZ,
  title TEXT NOT NULL,
  country TEXT, -- 'IN', 'US', etc.
  impact TEXT, -- 'high', 'medium', 'low'
  category TEXT, -- 'inflation', 'interest_rate', 'gdp', etc.
  actual_value TEXT,
  forecast_value TEXT,
  previous_value TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_date, title, country)
);

CREATE INDEX idx_economic_events_date ON economic_events(event_date DESC, impact);
CREATE INDEX idx_economic_events_impact ON economic_events(event_date, impact) WHERE impact = 'high';
```

---

### 7. Notifications Table

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'economic_event', 'rule_violation', 'goal_achieved', 'pattern_detected', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'normal', -- 'critical', 'high', 'normal', 'low'
  read BOOLEAN DEFAULT false,
  action_url TEXT, -- Optional link
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read) WHERE read = false;
CREATE INDEX idx_notifications_priority ON notifications(user_id, priority, created_at DESC) WHERE read = false;
```

---

### 8. Audio Journal Entries

```sql
CREATE TABLE audio_journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  trade_id UUID REFERENCES trades(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  audio_url TEXT NOT NULL, -- Supabase storage path
  transcript TEXT, -- Speech-to-text result
  ai_summary TEXT, -- AI-generated summary
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audio_journal_user ON audio_journal_entries(user_id, created_at DESC);
CREATE INDEX idx_audio_journal_trade ON audio_journal_entries(trade_id);
```

---

### 9. User Preferences Updates

```sql
-- Add new preferences
ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS sidebar_collapsed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS taskbar_visible BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS default_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS market_status_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS morning_brief_enabled BOOLEAN DEFAULT true;
```

---

## 🏗️ Architecture Design

### Broker Connector Abstraction

**File:** `lib/brokers/base-connector.ts`

```typescript
export interface BrokerConnector {
  name: string
  type: string
  
  // Connection
  connect(credentials: BrokerCredentials): Promise<ConnectionResult>
  disconnect(): Promise<void>
  getConnectionStatus(): Promise<ConnectionStatus>
  
  // Trade fetching
  fetchTrades(fromDate: Date, toDate: Date): Promise<Trade[]>
  fetchLatestTrades(limit?: number): Promise<Trade[]>
  
  // Normalization
  normalizeTrade(rawTrade: any): Trade
}

export interface BrokerCredentials {
  apiKey?: string
  apiSecret?: string
  accessToken?: string
  refreshToken?: string
  [key: string]: any
}
```

**Implementations:**
- `lib/brokers/zerodha-connector.ts` - Zerodha Kite Connect
- `lib/brokers/upstox-connector.ts` - Upstox (future)
- `lib/brokers/angel-one-connector.ts` - Angel One (future)
- `lib/brokers/csv-connector.ts` - CSV import connector

---

### CSV Import Pipeline

**File:** `lib/csv-import/pipeline.ts`

```typescript
export interface CSVImportPipeline {
  // Step 1: Detect/Configure mapping
  detectColumns(headers: string[], broker?: string): ColumnMapping
  configureMapping(headers: string[], preset?: BrokerPreset): ColumnMapping
  
  // Step 2: Validate & Normalize
  validateRows(rows: any[], mapping: ColumnMapping): ValidationResult
  normalizeTrades(rows: any[], mapping: ColumnMapping, timezone?: string): Trade[]
  
  // Step 3: Preview
  generatePreview(trades: Trade[], limit?: number): ImportPreview
}

export interface BrokerPreset {
  name: string
  broker: string
  columnMapping: Record<string, string>
  timezone: string
  dateFormat: string
}
```

**Presets:**
- Zerodha Tradebook CSV
- Upstox Tradebook CSV
- Angel One CSV
- Generic (manual mapping)

---

### ML Personalization Pipeline

**File:** `lib/ml/personalization.ts`

```typescript
export interface MLPipeline {
  // Feature extraction
  extractFeatures(trades: Trade[], userId: string): FeatureMatrix
  
  // Model interface
  generateInsights(features: FeatureMatrix, userId: string): Promise<MLInsight[]>
  
  // Storage
  saveInsights(insights: MLInsight[]): Promise<void>
}

export interface FeatureMatrix {
  userId: string
  profileId?: string
  features: {
    timeOfDay: Record<string, number>
    dayOfWeek: Record<string, number>
    strategy: Record<string, number>
    symbol: Record<string, number>
    winRate: number
    profitFactor: number
    avgRR: number
    maxDrawdown: number
    patternFrequencies: Record<string, number>
    ruleViolationRate: number
  }
  labels: {
    profit: number
    riskAdjustedReturn: number
  }
}
```

**Implementation Options:**
1. **Heuristic-based** (Phase 1) - Simple rule-based insights
2. **LLM-based** (Phase 1) - Use OpenAI to analyze patterns
3. **ML Model** (Phase 2) - Train actual ML model

---

## 🎨 UI/UX Design

### Profile Switcher
- Location: Top bar (next to user menu)
- Component: `app/dashboard/components/ProfileSwitcher.tsx`
- Shows: Current profile name, color indicator
- Action: Dropdown to switch/create profiles

### Broker Management
- Location: Settings → Brokers
- Component: `app/dashboard/settings/brokers/page.tsx`
- Shows: List of connected brokers, connection status
- Actions: Connect, Disconnect, Fetch Trades, Test Connection

### Taskbar Toggle
- Location: Top bar (gear icon or hamburger)
- Action: Toggle sidebar visibility
- Persistence: `user_preferences.taskbar_visible`

### Market Status Indicator
- Location: Top bar (right side)
- Component: `app/dashboard/components/MarketStatus.tsx`
- Shows: "Market Open" / "Market Closed" with color
- Updates: Every minute during market hours

### Economic Calendar
- Location: New route `/dashboard/economic-calendar`
- Component: `app/dashboard/economic-calendar/page.tsx`
- Shows: Upcoming events, filtered by impact
- Updates: Daily from external API

### Notifications Bell
- Location: Top bar (next to market status)
- Component: `app/dashboard/components/NotificationBell.tsx`
- Shows: Badge with unread count
- Action: Dropdown with notification list

### Morning Brief
- Location: Dashboard (top card, shown once per day)
- Component: `app/dashboard/components/MorningBrief.tsx`
- Shows: Yesterday's summary, today's focus, key events
- Action: "Mark as read" to dismiss

### Audio Journal Button
- Location: Journal page, trade detail drawer
- Component: `app/dashboard/journal/components/AudioRecorder.tsx`
- Action: Record → Transcribe → AI Summarize → Save

---

## 🔌 Browser Extension API Design

### Backend Endpoints

**File:** `app/api/extension/rules/route.ts`
```typescript
GET /api/extension/rules
// Returns active rules for user (lightweight, no sensitive data)

POST /api/extension/validate
// Validates prospective trade against rules
// Body: { symbol, side, quantity, price, timestamp }
// Returns: { allowed, violations, warnings }
```

**File:** `app/api/extension/stats/route.ts`
```typescript
GET /api/extension/stats
// Returns today's stats: trade count, P&L, rule violations
```

### Extension Structure (Docs Only)

**Folder:** `docs/extension/`

```
extension/
  manifest.json
  content-script.js
  background.js
  popup.html
  README.md
```

**Content Script:**
- Detects trade form on broker website
- Intercepts form submission
- Calls TradeAutopsy API to validate
- Shows warning if rule violated

---

## 📝 Implementation Notes

### Soft Delete Strategy
- Add `deleted_at` column to `trades`
- Update all queries to filter `WHERE deleted_at IS NULL`
- Settings delete: Set `deleted_at = NOW()` instead of hard delete
- Add "Restore" option in settings

### Performance Optimizations
- Wrap page components in `Suspense` boundaries
- Use `useTransition` for navigation
- Memoize heavy components (`React.memo`, `useMemo`)
- Move heavy computations to server actions
- Add pagination to trade lists

### Security Considerations
- Encrypt broker credentials (use Supabase Vault or similar)
- Rate limit extension API endpoints
- Validate all extension requests (JWT token)
- Sanitize CSV input data

### Testing Strategy
- Unit tests for broker connectors
- Integration tests for CSV import pipeline
- E2E tests for critical flows (delete, import, profile switch)
- Load tests for performance optimizations

---

## ✅ Ready for Phase 2

**Design complete. Ready to begin implementation starting with Group 1 (P0 Safety & Correctness).**
