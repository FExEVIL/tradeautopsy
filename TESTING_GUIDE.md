# TradeAutopsy Test Data Guide

## 📋 Overview

This guide explains how to use the generated test CSV file (`test-trades-1year.csv`) to comprehensively test all TradeAutopsy features.

## 🎯 Generated Test Data

The CSV file contains **400-500 realistic trades** spanning **1 year** with:

- ✅ All 8 behavioral patterns injected
- ✅ All rule violations present
- ✅ Strategy performance variance
- ✅ Time-based performance patterns
- ✅ Day-of-week patterns
- ✅ Realistic Indian market data

## 📊 What's Included

### Patterns Injected

1. **Revenge Trading** (20 instances)
   - Trades within 30 minutes of losses
   - 2x+ position sizing
   - 75% loss rate

2. **FOMO Trading** (15 instances)
   - Large positions during high volatility
   - Entered at peak prices
   - 65% loss rate

3. **Overtrading** (25 days)
   - 8-12 trades per day
   - Lower win rate (45%)

4. **Win Streak Overconfidence** (10 instances)
   - Increased position size after 4+ wins
   - Followed by losses

5. **Loss Aversion** (30 instances)
   - Small winners cut early
   - Big losers held too long

6. **Weekend Warrior** (15 instances)
   - Heavy Friday afternoon trading
   - Poor performance (40% win rate)

7. **Revenge Sizing** (18 instances)
   - Increased size after losses

8. **News Trading** (12 instances)
   - Trading during high-impact events
   - 45% win rate

### Rule Violations

- **Time Violations**: 30+ trades after 2:30 PM
- **Trade Count Violations**: 25+ days with >5 trades
- **Loss Limit Violations**: 15+ days exceeding ₹5,000 loss

### Strategy Distribution

- **Scalping** (40%): 58% win rate, ₹450 avg winner
- **Intraday** (30%): 52% win rate, ₹850 avg winner
- **Swing** (20%): 48% win rate, ₹3,200 avg winner
- **Options** (10%): 45% win rate, ₹5,500 avg winner

### Performance Metrics

- **Net P&L**: ₹45,000 - ₹65,000 (slightly profitable)
- **Win Rate**: 50-55%
- **Total Trades**: 400-500
- **Date Range**: Last 12 months

## 🚀 How to Use

### Step 1: Generate the CSV

```bash
# Install dependencies if needed
npm install

# Run the generator
npx tsx scripts/generate-test-csv.ts
```

This creates:
- `test-trades-1year.csv` - The main CSV file
- `test-data-summary.json` - Statistics summary

### Step 2: Import into TradeAutopsy

1. Log into TradeAutopsy dashboard
2. Navigate to **Import** page (`/dashboard/import`)
3. Upload `test-trades-1year.csv`
4. Map columns:
   - `Tradingsymbol` → Symbol
   - `Transaction Type` → Transaction Type
   - `Quantity` → Quantity
   - `Price` → Average Price
   - `Trade Date` → Trade Date
   - `Product` → Product
   - `Order ID` → Trade ID (optional)
5. Click **Import**

### Step 3: Verify Import

After import, check:
- ✅ Total trades count matches summary
- ✅ Net P&L matches expected range
- ✅ All strategies are present
- ✅ Date range is correct

## 🧪 Testing Features

### 1. Pattern Detection

**Location**: `/dashboard/patterns`

**What to Test**:
- ✅ Revenge trading pattern appears
- ✅ FOMO pattern detected
- ✅ Overtrading days highlighted
- ✅ Win streak overconfidence flagged
- ✅ Loss aversion patterns visible

**Expected Results**:
- Pattern library shows all 8 patterns
- Pattern frequency matches summary
- Pattern costs are calculated correctly

### 2. Trading Rules

**Location**: `/dashboard/rules`

**What to Test**:
- ✅ Time restriction violations logged
- ✅ Trade count violations detected
- ✅ Loss limit violations recorded
- ✅ Rule adherence stats updated

**Expected Results**:
- Violations table shows all violations
- Adherence score calculated
- Streak tracking works

### 3. AI Coach Insights

**Location**: `/dashboard/coach`

**What to Test**:
- ✅ Insights generated for patterns
- ✅ Action plans created
- ✅ Weekly goals set
- ✅ Chat responses work

**Expected Results**:
- Multiple insights appear
- Action plans are relevant
- Chat provides helpful advice

### 4. Risk Metrics

**Location**: `/dashboard/risk`

**What to Test**:
- ✅ Drawdown calculated
- ✅ Sharpe ratio computed
- ✅ Win rate accurate
- ✅ Risk-adjusted returns

**Expected Results**:
- All metrics display correctly
- Charts render properly
- Historical data shows trends

### 5. Strategy Analysis

**Location**: `/dashboard/strategy-analysis`

**What to Test**:
- ✅ All 4 strategies analyzed
- ✅ Performance comparison works
- ✅ Strategy recommendations appear

**Expected Results**:
- Each strategy shows correct stats
- Best/worst strategies identified
- Recommendations are relevant

### 6. Performance Dashboard

**Location**: `/dashboard`

**What to Test**:
- ✅ Total P&L correct
- ✅ Win rate accurate
- ✅ Charts display properly
- ✅ Recent trades shown

**Expected Results**:
- Dashboard metrics match summary
- Charts are interactive
- Data loads quickly

### 7. Morning Brief

**Location**: `/dashboard/morning-brief`

**What to Test**:
- ✅ Yesterday's performance shown
- ✅ Rule violations listed
- ✅ Focus points generated
- ✅ Economic events displayed

**Expected Results**:
- Brief generates correctly
- All sections populated
- Dismissal works

### 8. Benchmark Comparison

**Location**: `/dashboard` (Benchmark card)

**What to Test**:
- ✅ Portfolio vs Nifty 50
- ✅ Portfolio vs Sensex
- ✅ Alpha calculation
- ✅ Chart comparison

**Expected Results**:
- Benchmarks load (if Zerodha connected)
- Charts show comparison
- Alpha calculated correctly

### 9. Reports

**Location**: `/dashboard/reports`

**What to Test**:
- ✅ PDF generation
- ✅ CSV export
- ✅ Scheduled reports
- ✅ Report history

**Expected Results**:
- Reports generate correctly
- All data included
- Formats are correct

### 10. ML Insights

**Location**: `/dashboard/settings/ml-insights`

**What to Test**:
- ✅ Personalized insights generated
- ✅ Confidence scores shown
- ✅ Recommendations appear

**Expected Results**:
- Insights are relevant
- Scores are reasonable
- Recommendations actionable

## 📈 Expected Statistics

After import, you should see:

```
Total Trades: 400-500
Net P&L: ₹45,000 - ₹65,000
Win Rate: 50-55%
Total Winners: ~250-275
Total Losers: ~150-225
```

### By Strategy

- **Scalping**: ~160 trades, 58% win rate
- **Intraday**: ~120 trades, 52% win rate
- **Swing**: ~80 trades, 48% win rate
- **Options**: ~40 trades, 45% win rate

### Patterns

- Revenge Trading: 20 instances
- FOMO: 15 instances
- Overtrading: 25 days
- Overconfidence: 10 instances
- Loss Aversion: 30 instances
- Weekend Warrior: 15 instances
- Revenge Sizing: 18 instances
- News Trading: 12 instances

## 🔍 Verification Checklist

After importing, verify:

- [ ] Total trade count matches
- [ ] Net P&L is in expected range
- [ ] All patterns are detected
- [ ] All rule violations logged
- [ ] Strategy analysis works
- [ ] Risk metrics calculated
- [ ] AI insights generated
- [ ] Charts render correctly
- [ ] Reports generate properly
- [ ] Morning brief works
- [ ] Benchmark comparison loads
- [ ] ML insights appear

## 🐛 Troubleshooting

### Import Fails

- Check CSV format matches expected columns
- Verify date format is YYYY-MM-DD
- Ensure all required columns are mapped

### Patterns Not Detected

- Wait for background job to run (pattern detection is async)
- Check automation preferences are enabled
- Verify pattern detection is enabled in settings

### Metrics Don't Match

- Check if trades are filtered by profile
- Verify date range filters
- Check for soft-deleted trades

## 📝 Notes

- The CSV uses **Indian market symbols** (NIFTY, BANKNIFTY, stocks)
- Dates are in **IST timezone**
- Prices are **realistic** based on current market levels
- P&L is calculated with **fees and commissions** included
- All trades are **completed** status

## 🎯 Next Steps

1. Import the CSV
2. Review dashboard metrics
3. Check pattern detection
4. Test all features
5. Verify rule violations
6. Generate reports
7. Test AI coach
8. Review ML insights

---

**Happy Testing! 🚀**

For issues or questions, check the main README or open an issue.
