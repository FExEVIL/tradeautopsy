# 🧪 Feature Testing Guide

Complete guide to test and verify all 14 implemented features.

---

## 📋 Prerequisites

1. **Run All Migrations** (in order):
   ```sql
   -- Run these in Supabase SQL Editor or via migration tool
   1. 20251209000000_add_soft_delete_and_profiles.sql
   2. 20251209000001_add_brokers_tables.sql
   3. 20251209000002_add_economic_events_and_notifications.sql
   4. 20251209000003_add_user_preferences_fields.sql
   5. 20251209000004_add_audio_journal_and_ml_insights.sql
   ```

2. **Verify Tables Exist**:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN (
     'profiles', 'brokers', 'broker_profiles', 
     'notifications', 'economic_events',
     'audio_journal_entries', 'ml_insights'
   );
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

---

## ✅ Feature Testing Checklist

### Group 1: P0 Safety & Correctness

#### 1. Delete Trade Functionality ✅

**Where to Test:**
- Settings → Data Privacy → "Delete All Trades"
- Individual trade detail page → Delete button

**Steps:**
1. Go to `/dashboard/settings` → Data Privacy section
2. Click "Delete All Trades" → Confirm
3. Verify trades are soft-deleted (check `deleted_at` column in DB)
4. Go to `/dashboard/trades/[id]` for any trade
5. Click Delete button → Confirm
6. Verify trade disappears from list

**Expected Result:**
- Trades marked with `deleted_at` timestamp
- Deleted trades don't appear in dashboard/trades list
- Can be restored from database if needed

**Database Check:**
```sql
SELECT id, deleted_at FROM trades WHERE deleted_at IS NOT NULL;
```

---

#### 2. Performance Fixes ✅

**Where to Test:**
- Sidebar navigation
- Page transitions

**Steps:**
1. Navigate between dashboard sections using sidebar
2. Check browser console for smooth transitions
3. Verify no lag when switching pages

**Expected Result:**
- Smooth navigation without delays
- No console errors
- Fast page loads

---

### Group 2: Data Model & Structure

#### 3. Multi-Profile Structure ✅

**Where to Test:**
- Dashboard header (top right)
- Profile switcher dropdown

**Steps:**
1. Look at dashboard header - should see profile switcher
2. Click profile switcher dropdown
3. Should see at least one "Default" profile
4. Create new profile (if UI exists) or via SQL:
   ```sql
   INSERT INTO profiles (user_id, name, description, color, is_default)
   VALUES (
     'your-user-id',
     'F&O Trading',
     'Futures and Options profile',
     '#10b981',
     false
   );
   ```
5. Switch between profiles
6. Verify profile persists in localStorage

**Expected Result:**
- Profile switcher visible in header
- Can switch between profiles
- Profile ID stored in localStorage

**Database Check:**
```sql
SELECT * FROM profiles WHERE user_id = 'your-user-id';
```

**UI Location:**
- Top header bar (next to theme toggle)

---

#### 4. Multi-Broker Support ✅

**Where to Test:**
- Settings → Brokers (or `/dashboard/settings/brokers`)

**Steps:**
1. Navigate to `/dashboard/settings/brokers`
2. Should see "Available Brokers" section
3. Click "Connect" on Zerodha
4. Complete OAuth flow (if configured)
5. Verify broker appears in "Connected Brokers" section
6. Check broker status (connected/disconnected)

**Expected Result:**
- Broker management page loads
- Can see available brokers (Zerodha, Upstox, Angel One)
- Can connect/disconnect brokers

**Database Check:**
```sql
SELECT * FROM brokers WHERE user_id = 'your-user-id';
```

**UI Location:**
- `/dashboard/settings/brokers`

---

#### 5. Auto Trade Fetch ✅

**Where to Test:**
- Settings → Brokers → Connected broker card

**Steps:**
1. Go to `/dashboard/settings/brokers`
2. Find a connected broker
3. Click "Fetch Trades" button
4. Wait for import to complete
5. Check dashboard for new trades

**Expected Result:**
- Loading state during fetch
- Success message with trade count
- Trades appear in dashboard
- `last_sync_at` updated in brokers table

**Database Check:**
```sql
SELECT last_sync_at FROM brokers WHERE user_id = 'your-user-id';
```

---

#### 6. Universal CSV Import ✅

**Where to Test:**
- `/dashboard/import`

**Steps:**
1. Go to `/dashboard/import`
2. Upload a CSV file (Zerodha, Upstox, or generic)
3. Verify broker preset auto-detected (if applicable)
4. Check column mapping
5. Review preview (if shown)
6. Click "Import"
7. Verify trades imported

**Expected Result:**
- CSV parsed correctly
- Column mapping detected/configured
- Trades imported successfully
- Success message shown

**Test Files:**
- Use Zerodha tradebook CSV
- Use Upstox CSV (if available)
- Use generic CSV with manual mapping

**UI Location:**
- `/dashboard/import`

---

### Group 3: UX & Utility

#### 7. Taskbar Hide/Show ✅

**Where to Test:**
- Sidebar bottom section

**Steps:**
1. Look at sidebar bottom
2. Click "Hide" button (if sidebar expanded)
3. Verify sidebar disappears, small button appears on left edge
4. Click the button to show sidebar again
5. Check localStorage: `taskbar_hidden` should be set

**Expected Result:**
- Sidebar can be hidden/shown
- Preference persists across page reloads
- Smooth animation

**Browser Check:**
```javascript
// In browser console
localStorage.getItem('taskbar_hidden')
```

**UI Location:**
- Sidebar bottom (below "Collapse" button)

---

#### 8. Live Market Status ✅

**Where to Test:**
- Dashboard header (top right)

**Steps:**
1. Look at dashboard header
2. Find market status indicator (green/yellow/gray badge)
3. Verify it shows "Market Open" or "Market Closed"
4. Check time until next open/close (if shown)
5. Wait 1 minute - status should update

**Expected Result:**
- Market status visible in header
- Shows correct status (open/closed/pre-market/post-market)
- Updates every minute
- Color-coded (green=open, yellow=pre/post, gray=closed)

**UI Location:**
- Dashboard header (between profile switcher and notifications)

---

#### 9. Economic Calendar ✅

**Where to Test:**
- `/dashboard/economic-calendar`

**Steps:**
1. Navigate to `/dashboard/economic-calendar`
2. Should see calendar view with events
3. Test filters:
   - Impact level (high/medium/low)
   - Country filter
4. Verify events grouped by date
5. Check event details (title, time, impact)

**Expected Result:**
- Calendar page loads
- Events displayed (if data exists)
- Filters work
- Events grouped by date

**Note:** Events need to be populated (via API or manual insert)

**Add Test Data:**
```sql
INSERT INTO economic_events (event_date, event_time, title, country, impact, category)
VALUES 
  (CURRENT_DATE, CURRENT_TIMESTAMP, 'GDP Release', 'IN', 'high', 'gdp'),
  (CURRENT_DATE + INTERVAL '1 day', CURRENT_TIMESTAMP, 'CPI Data', 'US', 'high', 'inflation');
```

**UI Location:**
- `/dashboard/economic-calendar`
- Also in sidebar navigation

---

#### 10. Critical News Notifications ✅

**Where to Test:**
- Dashboard header → Notification bell icon

**Steps:**
1. Look at dashboard header
2. Find notification bell icon (🔔)
3. Check for badge count (if unread notifications)
4. Click bell to open dropdown
5. View notifications list
6. Click checkmark to mark as read
7. Click "Mark all read" (if available)

**Expected Result:**
- Notification bell visible
- Badge shows unread count
- Dropdown shows notifications
- Can mark as read
- Real-time updates (if configured)

**Add Test Notification:**
```sql
INSERT INTO notifications (user_id, type, title, message, priority)
VALUES (
  'your-user-id',
  'economic_event',
  'High Impact Event Today',
  'GDP data release scheduled for 2:30 PM',
  'high'
);
```

**UI Location:**
- Dashboard header (next to market status)

---

#### 11. Morning Brief ✅

**Where to Test:**
- Dashboard main page (top of page)

**Steps:**
1. Go to `/dashboard`
2. Look for "Morning Brief" card at top
3. Should show:
   - Yesterday's P&L
   - Win rate
   - Rules violated
   - Focus points
   - Today's events
4. Click X to dismiss
5. Refresh page - should not show again (marked as read)

**Expected Result:**
- Brief card appears on dashboard
- Shows summary data
- Can be dismissed
- Doesn't reappear after dismissal

**Note:** Requires trades data to show meaningful brief

**UI Location:**
- `/dashboard` (top of page, below header)

---

### Group 4: Advanced UX + AI

#### 12. Journal Audio → AI Summary ✅

**Where to Test:**
- `/dashboard/journal` → Trade card → Notes section

**Steps:**
1. Go to `/dashboard/journal`
2. Open a trade card
3. Scroll to "Notes" section
4. Find "Audio Recorder" component
5. Click "Start Recording"
6. Record a short audio note
7. Click "Stop Recording"
8. Wait for processing
9. Verify transcript and AI summary appear

**Expected Result:**
- Audio recorder visible in journal
- Can record audio
- Shows processing state
- Displays transcript and summary
- Summary saved to trade notes

**Note:** Requires:
- Microphone permissions
- OpenAI API key for summarization
- Supabase Storage bucket `audio-journal`

**Setup Storage:**
```sql
-- In Supabase Dashboard → Storage
-- Create bucket: audio-journal
-- Set public: false
-- Add RLS policies
```

**UI Location:**
- `/dashboard/journal` → Trade card → Notes section

---

#### 13. ML Personalization Pipeline ✅

**Where to Test:**
- `/dashboard/settings/ml-insights`

**Steps:**
1. Navigate to `/dashboard/settings/ml-insights`
2. Click "Generate Insights" button
3. Wait for processing
4. Verify insights appear:
   - Time optimization
   - Strategy recommendations
   - Risk adjustments
5. Click checkmark to acknowledge insight
6. Verify insight disappears

**Expected Result:**
- Insights page loads
- Can generate insights
- Insights displayed with confidence scores
- Can acknowledge insights

**Note:** Requires at least 10 trades for meaningful insights

**Database Check:**
```sql
SELECT * FROM ml_insights WHERE user_id = 'your-user-id' ORDER BY created_at DESC;
```

**UI Location:**
- `/dashboard/settings/ml-insights`

---

### Group 5: Integration

#### 14. Browser Extension API ✅

**Where to Test:**
- API endpoints (use Postman/curl/browser)

**Steps:**

**1. Get Active Rules:**
```bash
curl -X GET http://localhost:3000/api/extension/rules \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**2. Get Today's Stats:**
```bash
curl -X GET http://localhost:3000/api/extension/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**3. Validate Trade:**
```bash
curl -X POST http://localhost:3000/api/extension/validate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "RELIANCE",
    "side": "BUY",
    "quantity": 10,
    "price": 2500,
    "timestamp": "2024-12-09T10:00:00Z"
  }'
```

**Expected Result:**
- All endpoints return JSON
- Rules endpoint returns active rules
- Stats endpoint returns today's data
- Validate endpoint returns violations/warnings

**Documentation:**
- See `docs/extension/README.md` for full API docs

---

## 🎯 Quick Verification Checklist

### UI Components to Check:
- [ ] Profile switcher in header
- [ ] Market status indicator in header
- [ ] Notification bell in header
- [ ] Morning brief on dashboard
- [ ] Sidebar hide/show button
- [ ] Broker management page
- [ ] Economic calendar page
- [ ] ML insights page
- [ ] Audio recorder in journal

### API Endpoints to Test:
- [ ] `/api/morning-brief` (GET)
- [ ] `/api/morning-brief/read` (POST)
- [ ] `/api/audio-journal/process` (POST)
- [ ] `/api/ml/insights` (GET)
- [ ] `/api/extension/rules` (GET)
- [ ] `/api/extension/stats` (GET)
- [ ] `/api/extension/validate` (POST)
- [ ] `/api/brokers/[id]` (DELETE)
- [ ] `/api/brokers/[id]/fetch-trades` (POST)

### Database Tables to Verify:
- [ ] `profiles` table exists
- [ ] `brokers` table exists
- [ ] `broker_profiles` table exists
- [ ] `notifications` table exists
- [ ] `economic_events` table exists
- [ ] `audio_journal_entries` table exists
- [ ] `ml_insights` table exists
- [ ] `trades.deleted_at` column exists
- [ ] `trades.profile_id` column exists
- [ ] `trades.broker_id` column exists

---

## 🐛 Troubleshooting

### Feature Not Showing?
1. **Check migrations ran** - Verify tables exist
2. **Check browser console** - Look for errors
3. **Check network tab** - Verify API calls succeed
4. **Check localStorage** - Some features use it

### API Errors?
1. **Check authentication** - User must be logged in
2. **Check table existence** - Run migrations
3. **Check RLS policies** - Verify user can access data

### Components Not Loading?
1. **Check build** - Run `npm run build`
2. **Check imports** - Verify file paths
3. **Check TypeScript** - No type errors

---

## 📝 Test Data Setup

### Create Test Profile:
```sql
INSERT INTO profiles (user_id, name, description, color, is_default)
VALUES (
  'your-user-id',
  'Test Profile',
  'For testing',
  '#3b82f6',
  false
);
```

### Create Test Notification:
```sql
INSERT INTO notifications (user_id, type, title, message, priority)
VALUES (
  'your-user-id',
  'test',
  'Test Notification',
  'This is a test notification',
  'normal'
);
```

### Create Test Economic Event:
```sql
INSERT INTO economic_events (event_date, title, country, impact, category)
VALUES (
  CURRENT_DATE,
  'Test Event',
  'IN',
  'high',
  'test'
);
```

---

## ✅ Success Criteria

All features are working if:
- ✅ All UI components render without errors
- ✅ All API endpoints return expected responses
- ✅ Database tables exist and are accessible
- ✅ No console errors in browser
- ✅ No build errors
- ✅ Features persist data correctly

---

**Happy Testing! 🚀**
