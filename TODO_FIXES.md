# Phase 0: Fast Audit - Current State

## Issue 2: Profile Switching ❌

**Current State:**
- ✅ `ProfileSwitcher` component exists in `app/dashboard/components/ProfileSwitcher.tsx`
- ✅ Stores profile ID in `localStorage` when switching
- ✅ Calls `router.refresh()` after switch
- ❌ **PROBLEM:** Server-side queries don't read from localStorage/cookies
- ❌ **PROBLEM:** Trade queries don't filter by `profile_id`
- ❌ **PROBLEM:** No API endpoint to update active profile server-side
- ❌ **PROBLEM:** `getCurrentProfileId()` utility exists but not used in queries

**Files:**
- `app/dashboard/components/ProfileSwitcher.tsx` - Client component
- `lib/profile-utils.ts` - Server utility (not used)
- `app/dashboard/page.tsx` - Dashboard (no profile filter)
- `app/dashboard/trades/page.tsx` - Trades page (no profile filter)

**Root Cause:** Profile switching only updates client state, server queries ignore it.

---

## Issue 3: Multi-Broker Page 404 ❌

**Current State:**
- ✅ Broker page exists at `/dashboard/settings/brokers`
- ❌ **PROBLEM:** User tried `/dashboard/brokers` (404)
- ❌ **PROBLEM:** No route at `/dashboard/brokers`
- ❌ **PROBLEM:** Not linked in sidebar navigation

**Files:**
- `app/dashboard/settings/brokers/page.tsx` - Exists but wrong path
- `app/dashboard/components/CollapsibleSidebar.tsx` - No broker link

**Root Cause:** Route is nested under `/settings/brokers` instead of `/dashboard/brokers`.

---

## Issue 4: Auto Trade Fetch ❌

**Current State:**
- ✅ API endpoint exists: `app/api/brokers/[id]/fetch-trades/route.ts`
- ✅ UI button exists in `BrokersClient.tsx`
- ❌ **PROBLEM:** Connector may fail (Zerodha API calls)
- ❌ **PROBLEM:** No error handling for missing credentials
- ❌ **PROBLEM:** Profile ID not read from current profile (uses default only)

**Files:**
- `app/api/brokers/[id]/fetch-trades/route.ts` - API exists
- `app/dashboard/settings/brokers/BrokersClient.tsx` - UI exists
- `lib/brokers/zerodha-connector.ts` - Connector exists

**Root Cause:** May fail due to API issues or missing profile context.

---

## Issue 7: Economic Calendar ⚠️

**Current State:**
- ✅ Page exists: `app/dashboard/economic-calendar/page.tsx`
- ✅ UI component: `EconomicCalendarClient.tsx`
- ✅ Table exists: `economic_events`
- ❌ **PROBLEM:** No external API integration
- ❌ **PROBLEM:** Table is empty (no data source)

**Files:**
- `app/dashboard/economic-calendar/page.tsx` - Page exists
- `lib/economic-calendar.ts` - Utility exists but no API integration

**Root Cause:** No data source configured.

---

## Issue 8: Morning Brief ⚠️

**Current State:**
- ✅ Component exists: `app/dashboard/components/MorningBrief.tsx`
- ✅ API exists: `app/api/morning-brief/route.ts`
- ✅ Shows on dashboard
- ❌ **PROBLEM:** No dedicated page route
- ❌ **PROBLEM:** Only visible on main dashboard

**Files:**
- `app/dashboard/components/MorningBrief.tsx` - Component
- `app/api/morning-brief/route.ts` - API

**Root Cause:** Only implemented as dashboard card, not standalone page.

---

## Issue 9: AI Transcript ❌

**Current State:**
- ✅ Component exists: `app/dashboard/journal/components/AudioRecorder.tsx`
- ✅ API exists: `app/api/audio-journal/process/route.ts`
- ✅ Uploads to Supabase Storage
- ❌ **PROBLEM:** Transcription is placeholder text
- ❌ **PROBLEM:** No actual speech-to-text service integrated
- ❌ **PROBLEM:** Storage bucket may not exist

**Files:**
- `app/dashboard/journal/components/AudioRecorder.tsx` - Component
- `app/api/audio-journal/process/route.ts` - API (placeholder transcription)

**Root Cause:** No speech-to-text service integrated (OpenAI Whisper or similar).

---

## Issue 10: ML Insights Button ❌

**Current State:**
- ✅ Page exists: `app/dashboard/settings/ml-insights/page.tsx`
- ✅ API exists: `app/api/ml/insights/route.ts`
- ✅ Component exists: `MLInsightsClient.tsx`
- ❌ **PROBLEM:** Not in sidebar navigation
- ❌ **PROBLEM:** Hidden under settings

**Files:**
- `app/dashboard/settings/ml-insights/page.tsx` - Page exists
- `app/dashboard/components/CollapsibleSidebar.tsx` - No link

**Root Cause:** Not exposed in main navigation.

---

## Issue 11: Import Button ❌

**Current State:**
- ✅ Import page exists: `app/dashboard/import/page.tsx`
- ✅ Sidebar has "Import New Trades" button
- ❌ **PROBLEM:** Need to verify link points to `/dashboard/import`

**Files:**
- `app/dashboard/components/CollapsibleSidebar.tsx` - Line 305
- `app/dashboard/import/page.tsx` - Page exists

**Root Cause:** Need to verify navigation link.

---

## Issue 12: Browser Extension ✅

**Current State:**
- ✅ API endpoints exist:
  - `app/api/extension/rules/route.ts`
  - `app/api/extension/stats/route.ts`
  - `app/api/extension/validate/route.ts`
- ✅ Documentation exists: `docs/extension/README.md`
- ✅ Example code exists: `docs/extension/content-script.example.js`

**Status:** Backend is ready, just needs verification.

---

## Summary

**Critical Issues:**
1. Profile switching doesn't filter data
2. Brokers page wrong route
3. Auto fetch may fail
4. Audio transcription placeholder
5. ML insights not in navigation
6. Import button link needs verification

**Medium Priority:**
7. Economic calendar needs API
8. Morning brief needs dedicated page

**Low Priority:**
12. Browser extension backend exists (just needs testing)
