# Mock Trading Data Seeding Guide

This guide explains how to generate and seed comprehensive mock trading data for testing all TradeAutopsy features.

## 🎯 Purpose

The seed data generator creates realistic trading data with intentional behavioral patterns to test:

- ✅ Predictive Alerts (tilt warnings, time-based alerts)
- ✅ Pattern Detection (revenge trading, overtrading, FOMO)
- ✅ AI Coach Insights
- ✅ Risk Management Metrics
- ✅ Dashboard Visualizations
- ✅ Trading Rules Engine
- ✅ All Analytics Features

## 📋 Prerequisites

1. **Supabase Credentials**
   - `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`
   - `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`

2. **Node.js Dependencies**
   ```bash
   npm install dotenv
   npm install -D tsx
   ```

## 🚀 Quick Start

### Option 1: Automated Seeding (Recommended)

```bash
# Install dependencies if needed
npm install dotenv
npm install -D tsx

# Run seed script (generates 300 trades by default)
npx tsx scripts/seed-bogus-data.ts

# Or specify custom count
npx tsx scripts/seed-bogus-data.ts 500
```

### Option 2: Manual Import via API

1. Generate data:
   ```bash
   npx tsx scripts/seed-bogus-data.ts
   ```

2. Use exported JSON:
   - File: `seed-data/seed-data.json`
   - Import via `/dashboard/import` or API endpoint

### Option 3: Direct SQL Import

1. Generate data (creates SQL file)
2. Copy `seed-data/seed-data.sql`
3. Paste into Supabase SQL Editor
4. Run the SQL

## 📊 Generated Data Characteristics

### Trade Distribution
- **Total Trades**: 300 (configurable)
- **Time Period**: 6 months (June 2024 - December 2024)
- **Win Rate**: ~55% (realistic for decent trader)
- **Net P&L**: Positive (₹25,000 - ₹40,000 range)

### Patterns Included

1. **Revenge Trading**
   - 2-3 consecutive losses
   - Doubled position size
   - Quick succession trades (< 30 mins)
   - Usually results in more losses

2. **Overtrading**
   - 8-12 trades on specific days
   - Lower quality setups
   - Reduced win rate on these days

3. **Time-Based Patterns**
   - **Morning (9:30-11 AM)**: 70% win rate
   - **Afternoon (2-3 PM)**: 40% win rate (triggers "avoid trading" alerts)
   - **Late (3-3:30 PM)**: 35% win rate

4. **Win Streak Overconfidence**
   - 4+ consecutive wins
   - Increased position size
   - Followed by significant loss

5. **FOMO Trading**
   - Trades during high volatility
   - Large position sizes
   - Emotional tags attached

### Symbols Used
- NIFTY (indices)
- BANKNIFTY (indices)
- RELIANCE, TCS, INFY, HDFCBANK, ICICIBANK, SBIN, WIPRO, LT (stocks)

### Journal Data
- 65% of trades are journaled
- Realistic notes and tags
- Execution ratings (3-5 stars)
- Setup types and mistakes
- Emotional states

## 🧪 Testing Checklist

After seeding, verify these features work:

### Predictive Alerts
- [ ] Tilt warnings appear after consecutive losses
- [ ] "Avoid trading now" alerts for 2-3 PM
- [ ] "Best trading time" shows morning hours
- [ ] "Take a break" alerts on overtrading days

### Pattern Library
- [ ] Revenge trading pattern detected
- [ ] Overtrading days identified
- [ ] Time-based patterns visible
- [ ] Win streak overconfidence shown

### Dashboard
- [ ] Cumulative P&L chart renders
- [ ] Calendar shows winning/losing days
- [ ] Win rate calculations correct
- [ ] All KPI cards display data

### AI Coach
- [ ] Insights generated based on patterns
- [ ] Behavioral analysis works
- [ ] Recommendations appear

### Risk Management
- [ ] Sharpe Ratio calculated
- [ ] Max Drawdown shown
- [ ] Kelly Criterion computed
- [ ] Risk recommendations appear

### Journal
- [ ] Journaled trades show notes
- [ ] Tags are searchable
- [ ] Filters work correctly
- [ ] Progress tracking accurate

## 📁 Output Files

After running the seed script, you'll get:

1. **seed-data.json**
   - Full trade data in JSON format
   - Ready for API import
   - Includes all fields

2. **seed-data.csv**
   - CSV format for manual import
   - Compatible with import UI
   - Can be opened in Excel

3. **seed-data.sql**
   - Direct SQL INSERT statements
   - Can run in Supabase SQL Editor
   - Includes all data

## 🔧 Customization

### Change Trade Count
```bash
npx tsx scripts/seed-bogus-data.ts 500  # Generate 500 trades
```

### Modify Patterns
Edit `lib/seed-data-generator.ts`:
- Adjust win rates
- Change pattern frequencies
- Modify time distributions
- Add new symbols

### Change Seed for Reproducibility
```typescript
const generator = new TradingDataGenerator(12345) // Fixed seed
```

## 🐛 Troubleshooting

### "Missing Supabase credentials"
- Ensure `.env.local` exists
- Add `NEXT_PUBLIC_SUPABASE_URL`
- Add `SUPABASE_SERVICE_ROLE_KEY`

### "User already exists"
- The script will try to sign in first
- If password is wrong, delete user in Supabase Auth
- Or modify script to use existing user ID

### "Error inserting trades"
- Check database schema matches
- Verify RLS policies allow inserts
- Check for duplicate `trade_id` conflicts

### No alerts appearing
- Ensure you have 5+ trades
- Check alert preferences are enabled
- Manually trigger: `POST /api/alerts/generate`

## 📈 Expected Statistics

After seeding 300 trades, you should see:

- **Total Trades**: 300
- **Win Rate**: 52-58%
- **Net P&L**: ₹20,000 - ₹45,000
- **Revenge Trades**: 8-15 instances
- **Overtrading Days**: 3-8 days
- **Journaled Trades**: ~195 (65%)

## 🎓 Next Steps

1. **Login** with test credentials
2. **Explore Dashboard** - See all your trades
3. **Check Patterns** - Visit `/dashboard/patterns`
4. **Test Alerts** - Generate alerts and see them appear
5. **Review Analytics** - Check all metrics and charts
6. **Test Features** - Try every feature with real data

---

**Happy Testing!** 🚀

