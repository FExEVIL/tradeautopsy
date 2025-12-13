# Quick Start: Seeding Mock Trading Data

## 🚀 Fastest Way to Get Started

### Step 1: Install Dependencies

```bash
npm install -D tsx
```

### Step 2: Set Environment Variables

Ensure `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 3: Run Seed Script

```bash
# Generate 300 trades (default)
npm run seed

# Or generate 500 trades
npm run seed:500

# Or use tsx directly
npx tsx scripts/seed-bogus-data.ts 400
```

### Step 4: Login and Test

1. **Login** with:
   - Email: `test.trader@tradeautopsy.com`
   - Password: `Test@12345`

2. **Visit Dashboard** - See all your trades!

3. **Test Features**:
   - `/dashboard` - View trades and alerts
   - `/dashboard/patterns` - See detected patterns
   - `/dashboard/coach` - AI insights
   - `/dashboard/risk` - Risk metrics
   - `/dashboard/goals` - Set goals
   - `/dashboard/reports` - Generate reports

## 📊 What Gets Generated

- **300 trades** (configurable)
- **6 months** of data (June - December 2024)
- **Realistic patterns**:
  - Revenge trading (after losses)
  - Overtrading days (8+ trades)
  - Time-based patterns (morning winners, afternoon losers)
  - Win streak overconfidence
  - FOMO trading

- **Journal data**:
  - 65% of trades journaled
  - Notes, tags, ratings, emotions
  - Setup types and mistakes

## 🎯 Patterns That Trigger Features

✅ **Predictive Alerts**:
- Tilt warnings (consecutive losses + increased size)
- Avoid trading alerts (2-3 PM poor performance)
- Best time alerts (9-11 AM good performance)
- Take a break alerts (overtrading days)

✅ **Pattern Detection**:
- Revenge trading detected
- Overtrading identified
- Time-based patterns visible
- Win streak overconfidence

✅ **All Analytics**:
- Dashboard charts render
- Risk metrics calculate
- Performance analytics work
- Calendar visualizations show data

## 📁 Output Files

After running, check `seed-data/` folder:
- `seed-data.json` - For API import
- `seed-data.csv` - For CSV import
- `seed-data.sql` - For direct SQL import

## 🔧 Troubleshooting

**"Missing Supabase credentials"**
- Check `.env.local` exists
- Verify credentials are correct

**"User already exists"**
- Script will try to sign in
- If fails, delete user in Supabase Auth dashboard
- Or modify script to use your existing user ID

**"Error inserting trades"**
- Check database schema matches
- Verify RLS policies allow inserts
- Check for duplicate `trade_id` conflicts

## 📈 Expected Results

After seeding 300 trades:
- Win Rate: ~55%
- Net P&L: ₹20,000 - ₹45,000
- Revenge Trades: 8-15 instances
- Overtrading Days: 3-8 days
- Journaled: ~195 trades (65%)

---

**Ready to test!** Run `npm run seed` and start exploring! 🎉

