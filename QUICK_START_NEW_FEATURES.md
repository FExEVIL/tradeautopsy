# 🚀 Quick Start Guide - New Features

## **Step 1: Run Database Migration**

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of: `supabase/migrations/20251205000000_add_automation_and_rules_tables.sql`
3. Paste and execute
4. Verify 4 tables are created:
   - `automation_preferences`
   - `trading_rules`
   - `rule_violations`
   - `rule_adherence_stats`

---

## **Step 2: Test New Features**

### **1. Strategy Analysis** 📊
**Route:** `/dashboard/strategy-analysis`

**What to test:**
- View strategy comparison table
- Check time-based performance chart
- Review top performing symbols
- Analyze setup performance

**Expected:** Charts and tables display correctly with trade data

---

### **2. Comparisons** 📈
**Route:** `/dashboard/comparisons`

**What to test:**
- View percentile ranking
- Compare time periods (This Month vs Last Month)
- Compare strategies (select two strategies)
- Check visual charts

**Expected:** All comparisons display with accurate data

---

### **3. Automation Settings** ⚙️
**Route:** `/dashboard/settings/automation`

**What to test:**
- Toggle auto-tagging on/off
- Toggle auto-categorization
- Toggle pattern detection
- Save preferences

**Expected:** Preferences save and persist

---

### **4. Trading Rules** 🛡️
**Route:** `/dashboard/rules`

**What to test:**
- Create a time restriction rule (e.g., "No trading after 2 PM")
- Create a trade limit rule (e.g., "Max 5 trades per day")
- Create a loss limit rule (e.g., "Stop after ₹5000 loss")
- Toggle rule enabled/disabled
- View adherence statistics

**Expected:** Rules create successfully, stats display

---

### **5. Test Automation** 🤖
**Route:** `/dashboard/import`

**What to test:**
1. Enable automation in Settings
2. Import new trades
3. Check if trades are auto-tagged
4. Verify strategy auto-categorization

**Expected:** New trades automatically tagged and categorized

---

## **Step 3: Verify Integration**

### **Check Sidebar Navigation:**
- ✅ Strategy Analysis link appears
- ✅ Comparisons link appears
- ✅ Trading Rules link appears

### **Check Existing Features:**
- ✅ AI Coach shows action plans
- ✅ Goals show celebrations
- ✅ Risk Dashboard shows calculators
- ✅ Pattern Library shows all 8 patterns

---

## **Troubleshooting**

### **Error: "Table does not exist"**
**Solution:** Run the database migration

### **Error: "Cannot read properties of undefined"**
**Solution:** Clear browser cache and refresh

### **Features not showing:**
**Solution:** 
1. Check database migration ran successfully
2. Verify user is logged in
3. Check browser console for errors

---

## **Need Help?**

- Check `FEATURES_COMPLETED.md` for detailed documentation
- Review migration file for database setup
- Check browser console for specific errors

---

**All features are ready to use!** 🎉

