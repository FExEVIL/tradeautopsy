# 🎯 Quick Feature Tour

A visual guide to find and test all features in the TradeAutopsy UI.

---

## 🗺️ Navigation Map

### Main Dashboard (`/dashboard`)
**Features visible here:**
1. **Morning Brief** - Top of page (dismissible card)
2. **Profile Switcher** - Top header (left side)
3. **Market Status** - Top header (right side, green/yellow badge)
4. **Notification Bell** - Top header (right side, 🔔 icon)
5. **Sidebar Hide/Show** - Sidebar bottom (Hide button)

---

### Settings (`/dashboard/settings`)
**Features:**
- **Data Privacy** → Delete All Trades button
- **General Settings** → Profile preferences

---

### Brokers (`/dashboard/settings/brokers`)
**Features:**
1. **Broker Management** - Connect/disconnect brokers
2. **Auto Fetch** - "Fetch Trades" button per broker
3. **Broker Status** - Connection status indicators

---

### Import (`/dashboard/import`)
**Features:**
1. **Universal CSV Import** - Upload any broker CSV
2. **Broker Preset Selector** - Auto-detect or manual
3. **Column Mapping** - Preview and configure

---

### Journal (`/dashboard/journal`)
**Features:**
1. **Audio Recorder** - In trade card notes section
2. **Record Button** - Start/stop recording
3. **AI Summary** - Auto-generated from audio

---

### Economic Calendar (`/dashboard/economic-calendar`)
**Features:**
1. **Event List** - Grouped by date
2. **Filters** - Impact level, country
3. **Event Details** - Time, impact, values

---

### ML Insights (`/dashboard/settings/ml-insights`)
**Features:**
1. **Generate Button** - Create insights
2. **Insight Cards** - Time, strategy, risk insights
3. **Acknowledge** - Mark insights as read

---

### Trades (`/dashboard/trades`)
**Features:**
1. **Delete Button** - Per trade (soft delete)
2. **Profile Filtering** - (when implemented)

---

## 🎨 Visual Indicators

### Profile Switcher
- **Location:** Top header, left side
- **Looks like:** Colored dot + profile name + dropdown arrow
- **Color:** Blue dot (default profile)

### Market Status
- **Location:** Top header, right side
- **Looks like:** Green/yellow/gray badge with icon
- **States:**
  - 🟢 Green = Market Open
  - 🟡 Yellow = Pre/Post Market
  - ⚪ Gray = Market Closed

### Notification Bell
- **Location:** Top header, right side
- **Looks like:** Bell icon with red badge (if unread)
- **Badge:** Shows unread count

### Morning Brief
- **Location:** Dashboard top
- **Looks like:** Gradient card with 4 sections
- **Sections:** P&L, Rules, Focus, Events

### Sidebar Hide
- **Location:** Sidebar bottom
- **Looks like:** "Hide" button (when expanded)
- **After hide:** Small button on left edge

---

## 🔍 Quick Test Path

**5-Minute Tour:**
1. Open dashboard → See Morning Brief
2. Click profile switcher → See profiles
3. Click notification bell → See notifications
4. Check market status → See current status
5. Go to Settings → Brokers → See broker management
6. Go to Import → Upload CSV → See presets
7. Go to Journal → Open trade → See audio recorder
8. Go to Economic Calendar → See events
9. Go to Settings → ML Insights → Generate insights

---

## 📱 Mobile View

Most features work on mobile:
- Profile switcher (responsive)
- Market status (responsive)
- Notifications (responsive)
- Sidebar (becomes mobile menu)

---

## 🎯 Feature Status Indicators

**Green Checkmark (✅)** = Feature fully working  
**Yellow Warning (⚠️)** = Feature needs setup (API keys, migrations)  
**Red X (❌)** = Feature not yet implemented

---

**Start exploring! 🚀**
