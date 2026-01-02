# TradeAutopsy Chrome Extension

Real-time trading rules and goals tracker for [TradeAutopsy](https://www.tradeautopsy.in).

## Features

- 📊 **Real-time P&L Tracking** - See your daily performance at a glance
- 🛡️ **Rule Monitoring** - Get alerts when approaching or breaking trading rules
- 🎯 **Goal Progress** - Track daily, weekly, and monthly goals
- 🔔 **Desktop Notifications** - Receive alerts for violations and achievements
- ⚡ **Quick Access** - One click to open your dashboard

## Installation

### For Users

1. Install from the [Chrome Web Store](https://chrome.google.com/webstore/detail/tradeautopsy) (link pending)
2. Log in to [TradeAutopsy](https://www.tradeautopsy.in)
3. Go to Settings > Extension
4. Generate an API token
5. Open the extension popup and enter your token

### For Development

1. Clone the repository
2. Navigate to the extension directory:
   ```bash
   cd extension
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Generate icons:
   ```bash
   npm run generate:icons
   ```
5. Load the extension in Chrome:
   - Open `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `extension` folder

## Building for Production

```bash
# Generate icons
npm run generate:icons

# Generate promotional images (optional, for store listing)
npm run generate:promo

# Verify all files are in place
npm run verify

# Create the ZIP package
npm run package
```

The packaged extension will be in `dist/tradeautopsy-extension-vX.X.X.zip`.

## Project Structure

```
extension/
├── manifest.json          # Extension manifest
├── package.json           # Node.js dependencies
├── popup/
│   ├── index.html         # Main popup UI
│   ├── styles.css         # Popup styles
│   ├── app.js             # Popup logic
│   └── settings.html      # Settings page
├── background/
│   └── service-worker.js  # Background tasks & notifications
├── lib/
│   └── api.js             # API utilities
├── assets/
│   ├── icon-16.png        # Toolbar icon
│   ├── icon-48.png        # Extension list icon
│   ├── icon-128.png       # Store icon
│   └── promo/             # Store promotional images
└── scripts/
    ├── generate-icons.js  # Icon generation script
    ├── generate-promo-images.js  # Promo image generator
    ├── package.js         # Packaging script
    └── verify.js          # Verification script
```

## API Endpoints

The extension communicates with these TradeAutopsy API endpoints:

| Endpoint | Description |
|----------|-------------|
| `/api/extension/stats` | Today's trading statistics |
| `/api/extension/rules` | Active trading rules and status |
| `/api/extension/goals` | Goal progress |
| `/api/extension/validate` | Token validation |

## Authentication

The extension uses API tokens for authentication:

1. User generates a token in TradeAutopsy settings
2. Token is stored securely in Chrome's local storage
3. All API requests include the token in Authorization header

## Permissions

- `storage` - Store authentication token and cached data
- `notifications` - Send desktop alerts for rule violations
- `alarms` - Background polling for rule checks

## Development Notes

### Testing the Extension

1. Load the unpacked extension in Chrome
2. Click the extension icon to open the popup
3. Use Chrome DevTools to debug:
   - Right-click popup > Inspect
   - Go to `chrome://extensions` > Service Worker "Inspect" link

### Updating Icons

Icons are generated programmatically using the `canvas` package:

```bash
npm run generate:icons
```

This creates emerald green icons with a white "T" letter.

### Generating Store Assets

Promotional images are generated from HTML templates using Puppeteer:

```bash
npm run generate:promo
```

## Troubleshooting

### Extension not connecting

1. Verify your API token is correct
2. Check if TradeAutopsy is accessible
3. Clear extension data and re-enter token

### Notifications not showing

1. Check Chrome notification permissions
2. Verify notifications are enabled in extension settings
3. Check if system notifications are enabled

### Data not refreshing

1. Click the refresh button in the popup
2. Check your internet connection
3. Verify the token hasn't been revoked

## License

Copyright © 2024 TradeAutopsy. All rights reserved.
