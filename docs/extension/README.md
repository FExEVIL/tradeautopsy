# TradeAutopsy Browser Extension

## Overview

The TradeAutopsy browser extension provides real-time rule validation while trading on broker websites. It intercepts trade forms, validates them against your trading rules, and shows warnings before you execute trades.

## Architecture

### Backend API Endpoints

1. **GET `/api/extension/rules`**
   - Returns active trading rules for the authenticated user
   - Lightweight response (no sensitive data)
   - Used by extension to know which rules to check

2. **GET `/api/extension/stats`**
   - Returns today's trading statistics
   - Trade count, P&L, violation count
   - Used to check daily limits

3. **POST `/api/extension/validate`**
   - Validates a prospective trade against rules
   - Returns violations and warnings
   - Used when user attempts to place a trade

### Authentication

The extension uses JWT tokens stored after user login:
1. User logs into TradeAutopsy web app
2. Extension stores auth token securely
3. Extension includes token in API requests
4. Backend validates token and returns user-scoped data

### Extension Structure

```
extension/
  manifest.json          # Extension configuration
  background.js          # Background service worker
  content-script.js      # Injected into broker pages
  popup.html            # Extension popup UI
  popup.js              # Popup logic
  options.html           # Extension settings
  options.js             # Settings logic
```

## Implementation Guide

### Step 1: Content Script

The content script runs on broker websites and:
- Detects trade form elements
- Intercepts form submission
- Calls `/api/extension/validate` with trade data
- Shows warning modal if violations found
- Allows user to proceed or cancel

**Example (content-script.js):**

```javascript
// Detect trade form (broker-specific selectors)
const tradeForm = document.querySelector('#trade-form')

if (tradeForm) {
  tradeForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    // Extract trade data from form
    const tradeData = {
      symbol: document.querySelector('#symbol').value,
      side: document.querySelector('#side').value,
      quantity: parseInt(document.querySelector('#quantity').value),
      price: parseFloat(document.querySelector('#price').value),
      timestamp: new Date().toISOString()
    }
    
    // Validate with TradeAutopsy API
    const token = await getStoredToken()
    const response = await fetch('https://yourapp.com/api/extension/validate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tradeData)
    })
    
    const result = await response.json()
    
    if (!result.allowed) {
      // Show blocking warning
      showWarningModal(result.violations.blocking, true)
      return // Prevent trade
    } else if (result.violations.warnings.length > 0) {
      // Show warning but allow proceed
      const proceed = await showWarningModal(result.violations.warnings, false)
      if (!proceed) return
    }
    
    // Proceed with trade
    tradeForm.submit()
  })
}
```

### Step 2: Background Service

The background service:
- Manages authentication
- Caches rules and stats
- Handles token refresh
- Communicates between content script and popup

### Step 3: Popup UI

The popup shows:
- Connection status
- Today's stats
- Quick rule overview
- Settings link

## Security Considerations

1. **Token Storage**: Use `chrome.storage.local` (encrypted) or `chrome.storage.sync`
2. **HTTPS Only**: All API calls must use HTTPS
3. **CORS**: Backend must allow extension origin
4. **Rate Limiting**: Implement rate limiting on extension endpoints
5. **Token Expiry**: Handle token refresh gracefully

## Broker Support

### Zerodha
- Form selector: `#kite-trade-form`
- Symbol field: `#symbol`
- Side field: `#side`
- Quantity field: `#quantity`
- Price field: `#price`

### Upstox (Future)
- Form selector: TBD
- Field mappings: TBD

### Generic
- Extension can be configured for any broker
- User provides CSS selectors in options

## Testing

1. Install extension in Chrome/Edge
2. Login to TradeAutopsy web app
3. Navigate to broker website
4. Attempt to place a trade
5. Verify rule validation works
6. Test blocking and warning scenarios

## Future Enhancements

- Real-time rule updates via WebSocket
- Trade auto-logging after execution
- Position tracking
- Risk calculator overlay
- Trade journal quick-add

## Notes

- Extension is optional - web app works without it
- Extension requires user to be logged into TradeAutopsy
- Rules are cached locally for offline validation
- Extension respects user's privacy settings
