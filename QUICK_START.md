# Quick Start - Phase 2 & 3 Features

## 🚀 Immediate Next Steps

### 1. Run Database Migration (5 minutes)

**Option 1: Supabase Dashboard (Easiest)**
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/20251203000000_add_ai_coach_tables.sql`
3. Paste and Run

**Option 2: Supabase CLI**
```bash
supabase db push
```

### 2. Verify Tables Created

Run this in Supabase SQL Editor:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('ai_insights', 'detected_patterns', 'action_plans', 'goals');
```

Should return 4 rows.

### 3. Test the Features

#### ✅ Dashboard
- Visit `/dashboard`
- Should see "AI Trading Coach" card (may show "No new insights" initially)

#### ✅ Pattern Library
- Visit `/dashboard/patterns`
- Should load (empty if no patterns detected yet)

#### ✅ AI Coach Chat
- Visit `/dashboard/coach`
- Try asking: "How can I improve my win rate?"

#### ✅ Risk Management
- Visit `/dashboard/risk`
- Should show risk metrics (requires trades)

#### ✅ Goals
- Visit `/dashboard/goals`
- Click "New Goal" to create one

#### ✅ Reports
- Visit `/dashboard/reports`
- Select date range and generate PDF/CSV

### 4. Trigger Pattern Detection (Optional)

After importing trades, manually trigger insights:

```bash
# In browser or curl
GET http://localhost:3000/api/cron/generate-insights
```

Or wait for automatic detection when you have 5+ trades.

## ✅ Checklist

- [ ] Database migration run successfully
- [ ] All 4 tables created (verified in SQL Editor)
- [ ] Dashboard shows AI Coach card
- [ ] Can navigate to all new pages
- [ ] Can create a goal
- [ ] Can generate a report
- [ ] Pattern detection works (after importing trades)

## 🎯 What's Working Now

✅ **Pattern Detection** - Automatically detects:
- Revenge trading
- Overtrading
- FOMO patterns
- Win streak overconfidence

✅ **AI Insights** - Generates contextual suggestions based on:
- Win rate
- Average trade performance
- Detected patterns

✅ **Risk Metrics** - Calculates:
- Max Drawdown
- Sharpe Ratio
- Sortino Ratio
- Kelly Criterion
- Recovery Factor
- Value at Risk

✅ **Goals Tracking** - Track:
- Profit targets
- Win rate goals
- Consistency goals
- Custom goals

✅ **Reports** - Generate:
- PDF reports with charts
- CSV exports for Excel

## 📝 Notes

- **OpenAI Integration**: Skipped for now (as requested)
- **Cron Job**: Optional - can be set up later
- **Pattern Detection**: Works automatically when trades are analyzed
- **AI Chat**: Uses keyword-based responses (ready for OpenAI upgrade later)

## 🐛 If Something Doesn't Work

1. **Check migration ran**: Verify tables exist in Supabase
2. **Check console**: Look for errors in browser console
3. **Check network**: Verify API calls are working
4. **Check data**: Ensure you have trades imported

---

**Everything is ready!** Just run the migration and start testing. 🎉

