# Browser Extension Installation Guide

## Prerequisites

1. Google Chrome browser (or Chromium-based browser)
2. TradeAutopsy account
3. Extension files in the `extension/` folder

## Installation Steps

### 1. Prepare Extension Files

Make sure you have:
- ✅ `manifest.json`
- ✅ `popup/` folder with HTML, CSS, and JS files
- ✅ `background/` folder with service worker
- ✅ `assets/` folder with icons (16x16, 48x48, 128x128 PNG files)

### 2. Update API URL

Before loading, update the API URL in these files:
- `popup/app.js` - Line 2: `const API_BASE_URL = 'https://tradeautopsy.com'`
- `background/service-worker.js` - Line 2: `const API_BASE_URL = 'https://tradeautopsy.com'`

For local development, use:
- `const API_BASE_URL = 'http://localhost:3000'`

### 3. Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **"Load unpacked"** button
4. Select the `extension` folder (not individual files)
5. The extension should appear in your extensions list

### 4. Authenticate

1. Click the TradeAutopsy extension icon in your toolbar
2. If not logged in, click **"Login"**
3. You'll be redirected to TradeAutopsy login page
4. After login, you'll be redirected back with an auth token
5. The extension will store the token and start loading data

### 5. Verify Installation

- Extension icon appears in toolbar
- Clicking icon opens popup with stats
- Badge shows status (green/yellow/red)
- Background service worker is running

## Troubleshooting

### Extension Not Loading

- **Error: "Manifest file is missing or unreadable"**
  - Make sure you selected the `extension` folder, not a subfolder
  - Check that `manifest.json` exists in the root of the extension folder

- **Error: "Service worker registration failed"**
  - Check browser console for errors
  - Verify `background/service-worker.js` exists
  - Make sure manifest.json references the correct file path

### API Errors

- **"Unauthorized" errors**
  - Make sure you're logged into TradeAutopsy
  - Check that auth token is stored in extension storage
  - Try logging out and logging back in

- **"Failed to fetch" errors**
  - Check API_BASE_URL is correct
  - Verify API endpoints are deployed and accessible
  - Check CORS settings if using localhost

### Icons Not Showing

- **Missing icons**
  - Create placeholder PNG files in `assets/` folder
  - Use any image editor to create 16x16, 48x48, 128x128 PNG files
  - Icons can be simple colored squares for testing

### Popup Not Opening

- **Clicking icon does nothing**
  - Check browser console for errors
  - Verify `popup/index.html` exists
  - Check that `popup/app.js` is loading correctly
  - Look for JavaScript errors in popup console (right-click popup → Inspect)

## Development Mode

For development:

1. Make changes to extension files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the TradeAutopsy extension card
4. Test changes

## Testing Checklist

- [ ] Extension loads without errors
- [ ] Popup opens when clicking icon
- [ ] Login flow works
- [ ] Stats display correctly
- [ ] Rules status shows
- [ ] Goals progress displays
- [ ] Badge updates based on status
- [ ] Notifications work for rule violations
- [ ] Refresh button works
- [ ] "Open Dashboard" button works
- [ ] Auto-refresh works (wait 5 minutes)

## Publishing (Future)

When ready to publish to Chrome Web Store:

1. Create proper icons (see `assets/README.md`)
2. Update version in `manifest.json`
3. Create a ZIP file of the extension folder
4. Submit to Chrome Web Store Developer Dashboard
5. Fill out store listing information
6. Wait for review

## Support

For issues or questions:
- Check API endpoints are working: `/api/extension/stats`, `/api/extension/rules`, `/api/extension/goals`
- Verify authentication is working
- Check browser console for errors
- Review extension service worker logs

