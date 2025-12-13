# Phase 2 & Phase 3 Setup Guide

This guide will help you set up the new AI Coach, Pattern Detection, Risk Management, Goals, and Reports features.

## 📋 Prerequisites

- Supabase project configured
- Database access to run migrations
- Node.js and npm installed
- All existing dependencies installed (`npm install`)

## 🗄️ Step 1: Run Database Migration

The migration file creates 4 new tables:
- `ai_insights` - Stores AI-generated insights
- `detected_patterns` - Tracks behavioral patterns
- `action_plans` - Weekly action plans
- `goals` - User goals and milestones

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file: `supabase/migrations/20251203000000_add_ai_coach_tables.sql`
4. Copy the entire SQL content
5. Paste it into the SQL Editor
6. Click **Run** to execute the migration

### Option B: Using Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push
```

### Verify Migration

After running the migration, verify the tables were created:

```sql
-- Run this in Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('ai_insights', 'detected_patterns', 'action_plans', 'goals');
```

You should see all 4 tables listed.

## 🔧 Step 2: Environment Variables (Optional)

For the background cron job to generate insights automatically, add this to your `.env.local`:

```env
CRON_SECRET=your-secret-key-here
```

**Note:** This is optional. The cron job can be called manually or set up later via Vercel Cron or external service.

## ✅ Step 3: Verify Implementation

### 1. Check Dashboard Integration

- Navigate to `/dashboard`
- You should see the **AI Trading Coach** card on the dashboard
- It will show "No new insights" initially (until patterns are detected)

### 2. Test Pattern Detection

Patterns are automatically detected when:
- You have at least 5 trades
- Trades are imported or added
- The system analyzes recent trading behavior

To manually trigger pattern detection (for testing):

```bash
# Call the insights generation endpoint
curl -X GET http://localhost:3000/api/cron/generate-insights \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Or visit the endpoint in your browser (if CRON_SECRET is not set, it will still work but log a warning).

### 3. Test New Pages

Navigate to these new pages:

- **Pattern Library**: `/dashboard/patterns`
  - Shows detected behavioral patterns
  - Displays frequency, cost, and fix guidance

- **AI Coach**: `/dashboard/coach`
  - Chat interface for asking questions
  - Shows recent insights

- **Risk Management**: `/dashboard/risk`
  - Comprehensive risk metrics
  - Sharpe Ratio, Max Drawdown, Kelly Criterion, etc.

- **Goals & Milestones**: `/dashboard/goals`
  - Create and track trading goals
  - Progress visualization

- **Custom Reports**: `/dashboard/reports`
  - Generate PDF reports
  - Export CSV files

## 🧪 Step 4: Test with Sample Data

1. **Import some trades** (if you haven't already)
   - Go to `/dashboard/import`
   - Upload a CSV or connect Zerodha

2. **Create a goal**
   - Go to `/dashboard/goals`
   - Click "New Goal"
   - Set a profit target or win rate goal

3. **Check for patterns**
   - After importing trades, patterns will be detected automatically
   - Or manually trigger via the cron endpoint

4. **Generate a report**
   - Go to `/dashboard/reports`
   - Select date range
   - Click "Generate PDF Report" or "Generate CSV Report"

## 🔄 Step 5: Set Up Background Job (Optional)

To automatically generate insights daily:

### Option A: Vercel Cron

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/generate-insights",
      "schedule": "0 2 * * *"
    }
  ]
}
```

Set `CRON_SECRET` in Vercel environment variables.

### Option B: External Cron Service

Use a service like:
- cron-job.org
- EasyCron
- GitHub Actions (scheduled workflows)

Configure to call:
```
GET https://your-domain.com/api/cron/generate-insights
Authorization: Bearer YOUR_CRON_SECRET
```

Schedule: Daily at 2 AM (or your preferred time)

## 📝 Features Overview

### ✅ Implemented Features

1. **AI Trading Coach**
   - Pattern detection (revenge trading, overtrading, FOMO, overconfidence)
   - Insight generation based on trading behavior
   - Dashboard widget showing recent insights
   - Chat interface for questions

2. **Pattern Library**
   - Visual cards showing detected patterns
   - Frequency and cost tracking
   - Fix guidance for each pattern
   - Progress overview

3. **Risk Management Dashboard**
   - Max Drawdown calculation
   - Sharpe Ratio & Sortino Ratio
   - Kelly Criterion for position sizing
   - Recovery Factor
   - Value at Risk (VaR)
   - Streak analysis

4. **Goals & Milestones**
   - Create goals (profit, win rate, consistency, etc.)
   - Automatic progress tracking
   - Visual progress bars
   - Goal completion tracking

5. **Custom Reports**
   - PDF generation with summary statistics
   - CSV export for Excel analysis
   - Customizable date ranges
   - Optional notes and tags inclusion

## 🐛 Troubleshooting

### Migration Errors

If you see errors about existing tables:
- The migration uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run multiple times
- If tables already exist with different schemas, you may need to drop them first

### No Insights Showing

- Ensure you have at least 5 trades
- Check that the cron job has run (or trigger it manually)
- Verify the `ai_insights` table has data:
  ```sql
  SELECT * FROM ai_insights WHERE user_id = 'your-user-id';
  ```

### Pattern Detection Not Working

- Patterns are detected when trades are analyzed
- Ensure trades have valid `trade_date` and `pnl` fields
- Check the `detected_patterns` table:
  ```sql
  SELECT * FROM detected_patterns WHERE user_id = 'your-user-id';
  ```

## 🚀 Next Steps

1. ✅ Run the database migration
2. ✅ Test the new features
3. ✅ Set up background job (optional)
4. ⏳ **OpenAI Integration** (when you're ready - we'll add this later)

## 📚 API Endpoints

### Generate Insights (Manual Trigger)
```
GET /api/cron/generate-insights
Authorization: Bearer YOUR_CRON_SECRET
```

### AI Chat
```
POST /api/ai/chat
Body: { message: "your question", context: {...} }
```

### Generate PDF Report
```
POST /api/reports/pdf
Body: { startDate: "2024-01-01", endDate: "2024-12-31", includeNotes: true }
```

### Generate CSV Report
```
POST /api/reports/csv
Body: { startDate: "2024-01-01", endDate: "2024-12-31" }
```

---

**All features are ready to use!** The OpenAI integration can be added later when you're ready.

