# Quick Test Guide - Predictive Alerts

## ✅ Pre-Flight Checklist

1. **Migration Applied?**
   - [ ] Run `supabase/migrations/20251204000000_add_predictive_alerts.sql` in Supabase SQL Editor
   - [ ] Verify tables exist (use `test-predictive-alerts.sql`)

2. **Dev Server Running?**
   ```bash
   npm run dev
   ```

3. **Logged In?**
   - Make sure you're authenticated in the app

## 🧪 Quick Tests

### Test 1: Check Dashboard
1. Visit `http://localhost:3000/dashboard`
2. **Expected:** PredictiveAlerts component loads (may be empty if no alerts)
3. **Check:** No console errors

### Test 2: Check Preferences Page
1. Visit `http://localhost:3000/dashboard/settings/alerts`
2. **Expected:** Preferences page loads
3. **Action:** Toggle some settings, click Save
4. **Expected:** Settings save successfully

### Test 3: Generate Alerts (API)
Open browser console on dashboard page and run:

```javascript
// Generate alerts
fetch('/api/alerts/generate', { method: 'POST' })
  .then(r => r.json())
  .then(data => {
    console.log('Generated:', data);
    // Refresh page to see alerts
    window.location.reload();
  });
```

**Expected:** Returns `{ generated: X, total: Y, ... }`

### Test 4: Fetch Alerts (API)
```javascript
fetch('/api/alerts?dismissed=false&limit=10')
  .then(r => r.json())
  .then(data => console.log('Alerts:', data));
```

**Expected:** Returns `{ alerts: [...] }`

### Test 5: Dismiss Alert
If you have alerts showing:
1. Click the X button on an alert
2. **Expected:** Alert disappears
3. Check database: `dismissed = true`

## 🐛 Common Issues

**No alerts showing?**
- Need at least 5 trades
- Check alert preferences (may be disabled)
- Check if alerts were generated (see Test 3)

**Migration errors?**
- Tables might already exist (safe to re-run)
- Check RLS policies aren't conflicting

**API errors?**
- Check authentication
- Check Supabase connection
- Check browser console for details

## 📊 Database Verification

Run in Supabase SQL Editor:

```sql
-- Check your alerts
SELECT * FROM predictive_alerts 
WHERE user_id = (SELECT id FROM auth.users LIMIT 1)
ORDER BY created_at DESC
LIMIT 10;

-- Check your preferences
SELECT * FROM alert_preferences 
WHERE user_id = (SELECT id FROM auth.users LIMIT 1);
```

---

**All tests passing?** ✅ Feature is working!

