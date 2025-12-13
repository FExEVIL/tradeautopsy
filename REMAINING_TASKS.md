# Remaining Tasks for v1 Launch

**Generated:** December 7, 2024  
**Based on:** Phase 0 Audit + COMPLETE_ACHIEVEMENT_SUMMARY.md

---

## 🚨 Launch-Critical (P0) - Must Fix Before Launch

### SEC-001: Integrate Rule Validation into Trade Creation
**Area:** Launch-Critical / Security  
**Files:**
- `app/api/trades/import/route.ts`
- `app/dashboard/manual/page.tsx`
- `app/api/trades/[id]/route.ts` (if it allows creation)

**Issue:** Rules engine exists but is never called. Users can create rules but they don't actually block trades.

**Fix:**
1. Import `validateTradeAgainstRules` from `@/lib/rule-engine`
2. Call before inserting trades
3. Return violations to client
4. Block trade creation if blocking violations exist
5. Log violations to `rule_violations` table

**Effort:** M (2-3 hours)  
**Priority:** P0

---

### ERR-001: Add Error Handling to New Pages
**Area:** Launch-Critical / Error Handling  
**Files:**
- `app/dashboard/strategy-analysis/page.tsx`
- `app/dashboard/comparisons/page.tsx`
- `app/dashboard/settings/automation/page.tsx`
- `app/dashboard/rules/page.tsx` (has try/catch but no ErrorState)

**Issue:** Pages will crash on Supabase errors instead of showing user-friendly messages.

**Fix:**
1. Wrap Supabase calls in try/catch
2. Use ErrorState component for error display
3. Handle table-not-exists errors gracefully
4. Add retry functionality

**Effort:** S (1-2 hours)  
**Priority:** P0

---

### SEC-002: Fix Manual Trade Page Security
**Area:** Launch-Critical / Security  
**Files:**
- `app/dashboard/manual/page.tsx`

**Issue:** Uses `createBrowserClient` directly, bypassing server-side security.

**Fix:**
1. Convert to server action or API route
2. Use `createClient` from `@/utils/supabase/server`
3. Add rule validation
4. Add proper error handling

**Effort:** M (2-3 hours)  
**Priority:** P0

---

### VAL-001: Add Input Validation to Rule Creation
**Area:** Launch-Critical / Data Integrity  
**Files:**
- `app/dashboard/rules/RulesClient.tsx`

**Issue:** Rule config values not validated before saving. Could create invalid rules.

**Fix:**
1. Validate `max_trades_per_day` is positive integer
2. Validate `max_daily_loss` is positive number
3. Validate `after_hour`/`before_hour` are 0-23
4. Validate `schedule_day` for weekly/monthly
5. Show validation errors in UI

**Effort:** S (1 hour)  
**Priority:** P0

---

### RLS-001: Verify All Queries Filter by user_id
**Area:** Launch-Critical / Security  
**Files:**
- All files in `app/api/`
- All files in `app/dashboard/*/page.tsx`

**Issue:** Need to verify every Supabase query filters by `user_id` to prevent data leakage.

**Fix:**
1. Audit all `.from()` queries
2. Ensure `.eq('user_id', user.id)` is present
3. Verify RLS policies are enabled on all tables
4. Test with multiple users to ensure isolation

**Effort:** M (2-3 hours)  
**Priority:** P0

---

## 🎨 UX Polish (P1) - Should Fix Before Launch

### UX-001: Consistent Loading States
**Area:** UX / Consistency  
**Files:**
- `app/dashboard/strategy-analysis/StrategyAnalysisClient.tsx`
- `app/dashboard/comparisons/ComparisonsClient.tsx`
- `app/dashboard/rules/RulesClient.tsx`
- `app/dashboard/settings/automation/AutomationSettingsClient.tsx`

**Issue:** Some async operations don't show loading indicators.

**Fix:**
1. Add `loading` state to all async operations
2. Use `Loader2` component consistently
3. Disable buttons during loading
4. Show skeleton loaders for data fetching

**Effort:** S (1-2 hours)  
**Priority:** P1

---

### UX-002: Consistent Empty States
**Area:** UX / Consistency  
**Files:**
- `app/dashboard/strategy-analysis/StrategyAnalysisClient.tsx` (has empty state ✅)
- `app/dashboard/comparisons/ComparisonsClient.tsx` (has empty state ✅)
- `app/dashboard/rules/RulesClient.tsx` (check if has empty state)
- `app/dashboard/settings/automation/AutomationSettingsClient.tsx` (check if has empty state)

**Issue:** Need to verify all pages handle empty data gracefully.

**Fix:**
1. Check each page for empty state handling
2. Add consistent empty state component if missing
3. Include helpful CTAs (e.g., "Import your first trade")

**Effort:** S (1 hour)  
**Priority:** P1

---

### UX-003: Mobile Responsiveness Audit
**Area:** UX / Responsive Design  
**Files:**
- All new dashboard pages

**Issue:** Need to verify all new pages work on mobile devices.

**Fix:**
1. Test each page on mobile viewport (375px width)
2. Fix any layout issues
3. Ensure touch targets are 44x44px minimum
4. Test on actual mobile device if possible

**Effort:** M (2-3 hours)  
**Priority:** P1

---

### UX-004: Consistent Typography & Spacing
**Area:** UX / Visual Consistency  
**Files:**
- All new dashboard pages

**Issue:** Need to ensure typography and spacing match main dashboard style.

**Fix:**
1. Audit heading sizes (h1, h2, h3)
2. Ensure consistent padding/margins
3. Match color scheme
4. Use consistent button styles

**Effort:** S (1 hour)  
**Priority:** P1

---

## ⚡ Performance (P1) - Should Fix Before Launch

### PERF-001: Add Pagination to Trade-Loading Pages
**Area:** Performance / Scalability  
**Files:**
- `app/dashboard/strategy-analysis/page.tsx`
- `app/dashboard/comparisons/page.tsx`
- `app/dashboard/rules/page.tsx` (if it loads many trades)

**Issue:** Loading ALL trades will be slow with 1000+ trades.

**Fix:**
1. Add pagination (limit/offset)
2. Or add date range filtering
3. Or load only last N trades (e.g., last 1000)
4. Add "Load More" button if needed

**Effort:** M (2-3 hours)  
**Priority:** P1

---

### PERF-002: Move Heavy Computations to Server
**Area:** Performance / Client-Side  
**Files:**
- `app/dashboard/strategy-analysis/StrategyAnalysisClient.tsx`
- `app/dashboard/comparisons/ComparisonsClient.tsx`

**Issue:** Strategy analysis and comparisons done in `useMemo` on client. Should be server-side for large datasets.

**Fix:**
1. Move `analyzeByStrategy`, `analyzeByTime`, etc. to server component
2. Pass pre-computed results to client
3. Keep client-side only for interactivity (filters, selections)

**Effort:** M (2-3 hours)  
**Priority:** P1

---

### PERF-003: Add Database Indexes
**Area:** Performance / Database  
**Files:**
- `supabase/migrations/20251205000000_add_automation_and_rules_tables.sql`
- `supabase/migrations/20251207000000_add_scheduled_reports.sql`

**Issue:** Need to verify indexes exist for common query patterns.

**Fix:**
1. Review all queries in new features
2. Add indexes for:
   - `trading_rules(user_id, enabled)` ✅ (exists)
   - `rule_violations(user_id, violation_time)` ✅ (exists)
   - `scheduled_reports(user_id, enabled, next_send_at)` ✅ (exists)
   - `report_history(user_id, generated_at)` ✅ (exists)
3. Add composite indexes if needed

**Effort:** S (1 hour)  
**Priority:** P1

---

## 🧪 Testing (P1) - Should Add Before Launch

### TEST-001: Unit Tests for Core Logic
**Area:** Testing / Unit Tests  
**Files:**
- `lib/action-plans.ts`
- `lib/strategy-analysis.ts`
- `lib/comparison-utils.ts`
- `lib/automation.ts`
- `lib/rule-engine.ts`
- `lib/risk-calculations.ts`

**Issue:** No tests exist. Critical business logic could break silently.

**Fix:**
1. Set up Jest/Vitest
2. Write tests for:
   - Action plan generation logic
   - Strategy analysis calculations
   - Rule validation logic
   - Risk calculations
3. Aim for 70%+ coverage on critical paths

**Effort:** L (4-6 hours)  
**Priority:** P1

---

### TEST-002: Integration Tests for API Routes
**Area:** Testing / Integration Tests  
**Files:**
- `app/api/trades/import/route.ts`
- `app/api/reports/scheduled/route.ts`
- `app/api/reports/scheduled/[id]/route.ts`
- `app/api/rules/route.ts` (if exists)

**Issue:** No integration tests. API changes could break without notice.

**Fix:**
1. Set up test database
2. Write tests for:
   - Trade import with automation
   - Rule validation on import
   - Scheduled report creation
   - Rule CRUD operations
3. Test error cases (unauthorized, invalid data)

**Effort:** L (4-6 hours)  
**Priority:** P1

---

## 🚀 Deployment & Ops (P1) - Should Add Before Launch

### OPS-001: Health Check Endpoint
**Area:** Ops / Monitoring  
**Files:**
- `app/api/health/route.ts` (new)

**Issue:** No way to monitor app health in production.

**Fix:**
1. Create `/api/health` endpoint
2. Check:
   - Supabase connection
   - Database tables exist
   - Environment variables set
3. Return 200 if healthy, 500 if not
4. Add to monitoring (UptimeRobot, etc.)

**Effort:** S (1 hour)  
**Priority:** P1

---

### OPS-002: Environment Variable Documentation
**Area:** Ops / Documentation  
**Files:**
- `README.md` or `ENV_VARIABLES.md` (new)

**Issue:** No clear documentation of required/optional env variables.

**Fix:**
1. Document all env variables:
   - Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Optional: `OPENAI_API_KEY`, `ZERODHA_API_KEY`, `ZERODHA_API_SECRET`, `EMAIL_SERVICE_PROVIDER`, etc.
2. Include descriptions and example values
3. Add to deployment guide

**Effort:** S (1 hour)  
**Priority:** P1

---

### OPS-003: Migration Execution Guide
**Area:** Ops / Database  
**Files:**
- `MIGRATION_GUIDE.md` (new or update existing)

**Issue:** Need clear instructions for running migrations in production.

**Fix:**
1. Document migration execution order
2. Include rollback instructions (if possible)
3. Add verification queries
4. Include troubleshooting section

**Effort:** S (1 hour)  
**Priority:** P1

---

### OPS-004: Logging Strategy
**Area:** Ops / Monitoring  
**Files:**
- All API routes and server components

**Issue:** 200+ console.log statements. Need proper logging.

**Fix:**
1. Replace console.log with structured logging
2. Use different log levels (info, warn, error)
3. Log to external service (Sentry, LogRocket, etc.) in production
4. Remove sensitive data from logs

**Effort:** M (2-3 hours)  
**Priority:** P1

---

## 📋 Task Summary

| Priority | Count | Total Effort |
|----------|-------|--------------|
| P0 (Critical) | 5 | ~10-14 hours |
| P1 (Important) | 10 | ~18-26 hours |
| **Total** | **15** | **~28-40 hours** |

---

## 🎯 Implementation Order

### Week 1: Launch-Critical (P0)
1. SEC-001: Integrate rule validation
2. ERR-001: Add error handling
3. SEC-002: Fix manual trade page
4. VAL-001: Add input validation
5. RLS-001: Verify user_id filters

### Week 2: Polish & Performance (P1)
6. UX-001: Loading states
7. UX-002: Empty states
8. PERF-001: Pagination
9. PERF-002: Server-side computations
10. UX-003: Mobile responsiveness

### Week 3: Testing & Ops (P1)
11. TEST-001: Unit tests
12. TEST-002: Integration tests
13. OPS-001: Health check
14. OPS-002: Env docs
15. OPS-004: Logging strategy

---

**Status:** Ready for Phase 2 implementation
