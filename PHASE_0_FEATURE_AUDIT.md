# Phase 0: Feature Audit - TradeAutopsy

**Date:** December 9, 2024  
**Status:** Read-only audit complete

---

## 📋 Current State Summary

### Trade Data Model
- **Table:** `trades` (primary table)
- **Key Fields:** `id`, `user_id`, `tradingsymbol`, `transaction_type`, `quantity`, `average_price`, `entry_price`, `exit_price`, `trade_date`, `pnl`, `status`, `product`, `journal_note`, `journal_tags`, `screenshot_url`, `trade_id` (broker trade ID)
- **No soft-delete:** Currently uses hard delete (`.delete()`)
- **No `deleted_at` column:** Would need migration to add

### Trade Deletion Current State
1. **Trade Detail Page** (`app/dashboard/trades/[id]/TradeDetailClient.tsx`):
   - ✅ Has delete button with confirmation
   - ✅ Uses hard delete: `supabase.from('trades').delete().eq('id', trade.id)`
   - ✅ Redirects to `/dashboard/trades` after deletion

2. **Settings Page** (`app/dashboard/settings/components/DataPrivacySettings.tsx`):
   - ⚠️ Has "Delete All Trades" button
   - ⚠️ References `/api/trades/delete-all` endpoint
   - ❌ **Endpoint does NOT exist** - needs to be created

3. **API Routes:**
   - ✅ `app/api/trades/[id]/route.ts` - Only has PATCH (update), no DELETE
   - ❌ No `/api/trades/delete-all` endpoint
   - ❌ No bulk delete endpoint

**Gap:** Settings page delete functionality is incomplete.

---

### CSV Import Current State

1. **Import Client** (`app/dashboard/import/ImportClient.tsx`):
   - ✅ Uses PapaParse for CSV parsing
   - ✅ Has column mapping UI
   - ✅ Auto-detects common column names (symbol, quantity, price, date, etc.)
   - ✅ Supports manual column mapping
   - ✅ Validates required columns
   - ✅ Sends to `/api/trades/import` endpoint

2. **CSV Import Component** (`app/dashboard/components/CSVImport.tsx`):
   - ⚠️ Simple, hardcoded format parser
   - ⚠️ Assumes specific CSV format: `symbol,side,entry_date,entry_price,exit_date,exit_price,quantity`
   - ❌ Not flexible for different brokers

3. **Import API** (`app/api/trades/import/route.ts`):
   - ✅ Accepts array of trades
   - ✅ Applies automation (tagging, categorization)
   - ✅ Validates against trading rules
   - ✅ Handles batch inserts (100 per batch)
   - ✅ Logs violations
   - ✅ Updates adherence stats

**Gap:** CSV import works but is not broker-agnostic. Needs:
- Broker-specific presets (Zerodha, Upstox, etc.)
- Better normalization (timezones, instrument types)
- Preview before import

---

### Multi-Profile / Multi-Broker Current State

**Current State:**
- ❌ **No profiles table** - All trades are user-scoped only
- ❌ **No brokers table** - Only `zerodha_tokens` table exists
- ⚠️ **Zerodha integration exists:**
  - `app/api/zerodha/auth/route.ts` - OAuth flow
  - `app/api/zerodha/callback/route.ts` - OAuth callback
  - `app/api/zerodha/import-trades/route.ts` - Import from Zerodha API
  - `app/api/zerodha/disconnect/route.ts` - Disconnect
  - `lib/zerodha.ts` - Zerodha client utilities
  - `zerodha_tokens` table - Stores access tokens

**Gap:** 
- No multi-profile support
- No multi-broker abstraction
- Only Zerodha supported (hardcoded)
- No broker connector interface

---

### Sidebar / Navigation Current State

1. **Layout** (`app/dashboard/layout.tsx`):
   - ✅ Uses `CollapsibleSidebar` component
   - ✅ Simple flex layout

2. **CollapsibleSidebar** (`app/dashboard/components/CollapsibleSidebar.tsx`):
   - ✅ Client component with state
   - ✅ Has collapse/expand functionality
   - ⚠️ No persistence (state resets on refresh)
   - ⚠️ No hide/show toggle in UI
   - ⚠️ Uses `useState` for collapse state

3. **Performance Observations:**
   - ⚠️ No `useTransition` or `Suspense` boundaries
   - ⚠️ No memoization of heavy components
   - ⚠️ Sidebar re-renders on every navigation

**Gap:** 
- No taskbar hide/show preference
- No performance optimizations (Suspense, memoization)
- Potential rendering delays not addressed

---

### AI Integration Points

1. **AI Coach** (`lib/ai-coach.ts`, `app/api/ai/chat/route.ts`):
   - ✅ OpenAI GPT-4 integration (with fallback)
   - ✅ Rule-based responses as fallback
   - ✅ Pattern detection

2. **Automation** (`lib/automation.ts`):
   - ✅ Auto-tagging
   - ✅ Auto-categorization
   - ✅ Pattern detection

3. **Rule Engine** (`lib/rule-engine.ts`):
   - ✅ Trade validation
   - ✅ Violation logging
   - ✅ Adherence tracking

**Gap:**
- No audio transcription
- No voice journaling
- No ML personalization layer

---

### Performance Issues

**Potential Issues Identified:**
1. **No Suspense boundaries** - Pages may block on data fetching
2. **No memoization** - Heavy components may re-render unnecessarily
3. **No useTransition** - Navigation may feel laggy
4. **Client-side heavy computations** - Strategy analysis, comparisons done in `useMemo` on client
5. **No pagination** - Some pages load ALL trades

**Files with Heavy Client-Side Work:**
- `app/dashboard/strategy-analysis/StrategyAnalysisClient.tsx` - Uses `useMemo` for analysis
- `app/dashboard/comparisons/ComparisonsClient.tsx` - Uses `useMemo` for comparisons
- `app/dashboard/trades/TradesPageClient.tsx` - Filters/sorts all trades client-side

---

## 📁 Key Files Identified

### Trade Management
- `app/dashboard/trades/[id]/TradeDetailClient.tsx` - Trade detail with delete
- `app/api/trades/[id]/route.ts` - Trade update API (no DELETE)
- `app/api/trades/import/route.ts` - Import API
- `app/api/trades/manual/route.ts` - Manual trade creation

### CSV Import
- `app/dashboard/import/ImportClient.tsx` - Main import UI
- `app/dashboard/components/CSVImport.tsx` - Simple CSV component
- `app/api/trades/import/route.ts` - Import endpoint

### Broker Integration
- `app/api/zerodha/*` - Zerodha-specific routes
- `lib/zerodha.ts` - Zerodha utilities
- `zerodha_tokens` table - Token storage

### Settings
- `app/dashboard/settings/components/DataPrivacySettings.tsx` - Delete trades UI
- `app/dashboard/settings/page.tsx` - Settings page

### Navigation
- `app/dashboard/layout.tsx` - Dashboard layout
- `app/dashboard/components/CollapsibleSidebar.tsx` - Sidebar component

### AI/ML
- `lib/ai-coach.ts` - AI coach logic
- `lib/automation.ts` - Automation logic
- `lib/rule-engine.ts` - Rule validation

---

## 🎯 Gaps Summary

### Critical Gaps (P0)
1. ❌ **Delete trades from settings** - Endpoint missing
2. ❌ **Multi-profile support** - No data model
3. ❌ **Multi-broker abstraction** - Only Zerodha hardcoded
4. ❌ **Performance optimizations** - No Suspense/memoization

### Important Gaps (P1)
1. ⚠️ **Universal CSV import** - Works but not broker-agnostic
2. ⚠️ **Auto trade fetch** - Only Zerodha stub exists
3. ⚠️ **Taskbar hide/show** - No UI control
4. ⚠️ **Live market status** - Not implemented
5. ⚠️ **Economic calendar** - Not implemented
6. ⚠️ **Notifications** - Not implemented
7. ⚠️ **Morning brief** - Not implemented
8. ⚠️ **Audio journaling** - Not implemented
9. ⚠️ **Browser extension API** - Not implemented
10. ⚠️ **ML personalization** - Not implemented

---

## 📊 Database Schema Current State

### Existing Tables
- `trades` - Main trade table
- `user_preferences` - User settings
- `automation_preferences` - Automation settings
- `trading_rules` - Trading rules
- `rule_violations` - Rule violations log
- `rule_adherence_stats` - Adherence statistics
- `zerodha_tokens` - Zerodha OAuth tokens
- `scheduled_reports` - Report scheduling
- `report_history` - Generated reports
- `ai_insights` - AI insights
- `detected_patterns` - Behavioral patterns
- `action_plans` - Weekly action plans
- `goals` - User goals
- `predictive_alerts` - Predictive alerts
- `alert_preferences` - Alert settings

### Missing Tables (for new features)
- `profiles` - User profiles
- `brokers` - Broker connections
- `broker_connections` - User-broker associations
- `ml_insights` - ML personalization insights
- `economic_events` - Economic calendar cache
- `notifications` - User notifications
- `audio_journal_entries` - Audio journal metadata

---

## ✅ Ready for Phase 1

**Audit complete. Ready to proceed with feature planning and data model design.**

**Key Findings:**
- Trade deletion partially implemented (detail page works, settings page broken)
- CSV import works but needs broker-agnostic improvements
- No multi-profile/multi-broker support
- Performance optimizations needed
- Many new features need to be built from scratch

**Next Step:** Phase 1 - Feature planning & data model design
