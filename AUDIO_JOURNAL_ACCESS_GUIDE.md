# 🎙️ Audio Journaling Feature - Where to Find It

## 📍 Location

The **Audio Journaling** feature is available on the **Individual Trade Detail Page**.

## 🚀 How to Access

### Method 1: From Trades List Page
1. Go to **Dashboard → All Trades** (`/dashboard/trades`)
2. Click on any trade row in the table
3. A drawer will open on the right
4. Click the **"Audio Journal"** button (🎙️ icon) in the drawer header
5. This will open the full trade detail page with audio journaling

### Method 2: Direct URL
Navigate directly to:
```
/dashboard/trades/[trade-id]
```

Replace `[trade-id]` with the actual trade ID.

### Method 3: From Trade Detail Drawer
1. Click any trade in the trades table
2. In the drawer that opens, click the **"Audio Journal"** button
3. You'll be taken to the full detail page

## 🎯 What You'll See

On the trade detail page, you'll see:

1. **Trade Details Card** - Shows symbol, P&L, entry/exit prices, etc.
2. **Audio Journal Section** - This is where the voice feature is!
   - If no audio exists: "Record Audio Note" button
   - If audio exists: Audio player with transcript and AI summary
3. **Trade Notes Section** - Text notes (separate from audio)

## 🎤 Using the Feature

### To Record Audio:
1. Click **"Record Audio Note"** button
2. Allow microphone permission (first time only)
3. Red recording indicator appears with timer
4. Speak your thoughts about the trade
5. Click **"Stop Recording"**
6. Wait for AI transcription (10-30 seconds)
7. Review transcript and AI summary
8. Edit transcript if needed
9. Click **"Save Audio Journal Entry"**

### To Play Existing Audio:
1. If audio exists, you'll see an audio player
2. Click play button to listen
3. Expand transcript to see full text
4. View AI-generated summary, emotions, and tags

## 🔍 Visual Indicators

- **🎙️ Badge** - Shows "Recorded" if audio journal exists
- **Audio Player** - Appears when audio is saved
- **AI Summary** - Blue highlighted box with key insights
- **Emotions & Tags** - Color-coded chips below summary

## 📱 Mobile Support

Works on mobile browsers (iOS Safari 14.5+, Android Chrome)
- Touch-friendly buttons
- Microphone access via browser permissions
- Responsive audio player

## ⚠️ Troubleshooting

**Can't see the feature?**
- Make sure you're on the individual trade detail page (`/dashboard/trades/[id]`)
- Not the trades list page (`/dashboard/trades`)
- Click a trade row, then click "Audio Journal" button in the drawer

**Microphone not working?**
- Check browser permissions
- Ensure you're on HTTPS (required for microphone)
- Try a different browser

**No "Audio Journal" button?**
- Make sure the database migration ran successfully
- Check that the trade detail page is loading correctly

## 🎯 Quick Access Tips

1. **Bookmark a trade detail page** for quick access
2. **Use browser back button** to return to trades list
3. **Click trade symbol** in any table to open detail page
4. **Look for 🎙️ icon** - indicates audio journaling is available

---

**The audio journaling feature is located in the "Audio Journal" section on individual trade detail pages!**
