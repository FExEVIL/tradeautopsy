# Server/Client Component Boundary Fix ✅

**Date:** December 13, 2025  
**Status:** ✅ **FIXED**

---

## 📋 Issue

Next.js 15 error: "Only plain objects can be passed to Client Components from Server Components. Classes or other objects with methods are not supported."

**Root Cause:**  
Passing Lucide React icon components (which are functions/classes) from Server Components to Client Components is not allowed in Next.js 15.

---

## ✅ Solution

Updated `StatCard` and `PageLayout` components to accept icon names as **strings** instead of icon components, and resolve them internally within the Client Component.

---

## 🔧 Changes Made

### 1. StatCard Component ✅

**File:** `components/ui/StatCard.tsx`

**Before:**
```typescript
interface StatCardProps {
  icon?: LucideIcon  // ❌ Can't pass from Server Component
}

<StatCard icon={Target} />  // ❌ Error
```

**After:**
```typescript
interface StatCardProps {
  icon?: string  // ✅ String name instead
}

<StatCard icon="target" />  // ✅ Works!
```

**Icon Mapping:**
- `trendingUp` → TrendingUp
- `trendingDown` → TrendingDown
- `target` → Target
- `dollarSign` → DollarSign
- `barChart3` → BarChart3
- `activity` → Activity
- `calendar` → Calendar
- `fileText` → FileText
- `mic` → Mic
- `shield` → Shield
- `alertTriangle` → AlertTriangle
- `trophy` → Trophy
- `award` → Award
- `clock` → Clock
- `brain` → Brain
- `library` → Library
- `bookOpen` → BookOpen
- `settings` → Settings

---

### 2. PageLayout Component ✅

**File:** `components/layouts/PageLayout.tsx`

**Before:**
```typescript
interface PageLayoutProps {
  icon?: LucideIcon  // ❌ Can't pass from Server Component
}

<PageLayout icon={BarChart3} />  // ❌ Error
```

**After:**
```typescript
'use client'  // ✅ Now a Client Component

interface PageLayoutProps {
  icon?: string  // ✅ String name instead
}

<PageLayout icon="barChart3" />  // ✅ Works!
```

---

### 3. Updated All Usages ✅

**Files Updated:**
- `app/dashboard/page.tsx` - All StatCard and PageLayout usages
- `app/dashboard/journal/page.tsx` - All StatCard and PageLayout usages
- `app/dashboard/behavioral/page.tsx` - PageLayout usage
- `app/dashboard/calendar/page.tsx` - PageLayout usage
- `app/dashboard/settings/page.tsx` - PageLayout usage
- `app/dashboard/components/AnalyticsCards.tsx` - All StatCard usages
- `app/dashboard/components/StatsCards.tsx` - All StatCard usages
- `app/dashboard/rules/RulesClient.tsx` - All StatCard usages

**Example Changes:**
```typescript
// Before ❌
<StatCard icon={Target} />
<PageLayout icon={BarChart3} />

// After ✅
<StatCard icon="target" />
<PageLayout icon="barChart3" />
```

---

## 📝 Icon Name Reference

### Common Icons
- `trendingUp` - TrendingUp
- `trendingDown` - TrendingDown
- `target` - Target
- `dollarSign` - DollarSign
- `barChart3` - BarChart3
- `activity` - Activity
- `calendar` - Calendar
- `fileText` - FileText
- `shield` - Shield
- `alertTriangle` - AlertTriangle
- `trophy` - Trophy
- `award` - Award
- `clock` - Clock
- `brain` - Brain
- `bookOpen` - BookOpen
- `settings` - Settings

---

## ✅ Validation

All errors resolved:
- ✅ No more "Only plain objects can be passed" errors
- ✅ No more "Functions cannot be passed directly" errors
- ✅ All icons render correctly
- ✅ Server/Client Component boundary respected

---

## 🎯 Best Practice

**For Future Components:**

When creating components that accept icons:
1. **If component is Client Component:** Accept icon names as strings
2. **If component is Server Component:** Accept icon names as strings and resolve in a child Client Component
3. **Never:** Pass icon components directly from Server to Client Components

---

**Status:** ✅ **FIXED**

All Server/Client Component boundary errors have been resolved. The application now correctly handles icon passing using string-based icon names.
