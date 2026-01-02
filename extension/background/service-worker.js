// background/service-worker.js
// TradeAutopsy Extension - Background Service Worker
// NO INLINE SCRIPTS - Manifest V3 compliant

// ============================================
// Configuration
// ============================================
const CONFIG = {
  API_BASE: 'https://www.tradeautopsy.in/api/extension',
  REFRESH_INTERVAL_MINUTES: 1,
};

// ============================================
// Alarm Setup
// ============================================
chrome.alarms.create('checkRules', { periodInMinutes: CONFIG.REFRESH_INTERVAL_MINUTES });
chrome.alarms.create('refreshData', { periodInMinutes: 5 });

// ============================================
// Alarm Handlers
// ============================================
chrome.alarms.onAlarm.addListener(function(alarm) {
  if (alarm.name === 'checkRules') {
    checkRulesAndNotify();
  } else if (alarm.name === 'refreshData') {
    refreshAllData();
  }
});

// ============================================
// Installation Handler
// ============================================
chrome.runtime.onInstalled.addListener(function() {
  console.log('TradeAutopsy extension installed/updated');
  checkRulesAndNotify();
});

// ============================================
// Startup Handler
// ============================================
chrome.runtime.onStartup.addListener(function() {
  console.log('TradeAutopsy extension started');
  checkRulesAndNotify();
});

// ============================================
// Check Rules and Send Notifications
// ============================================
async function checkRulesAndNotify() {
  try {
    const result = await chrome.storage.local.get(['authToken', 'notificationsEnabled', 'lastViolations']);
    
    if (!result.authToken) {
      chrome.action.setBadgeText({ text: '' });
      return;
    }
    
    const notificationsEnabled = result.notificationsEnabled !== false;
    
    const response = await fetch(CONFIG.API_BASE + '/rules', {
      headers: {
        'Authorization': 'Bearer ' + result.authToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      chrome.action.setBadgeText({ text: '!' });
      chrome.action.setBadgeBackgroundColor({ color: '#6b7280' });
      return;
    }

    const data = await response.json();
    const rules = data.rules || [];
    
    const violatedRules = rules.filter(function(r) { return r.status === 'violated'; });
    const warningRules = rules.filter(function(r) { return r.status === 'warning'; });
    
    // Update badge based on status
    if (violatedRules.length > 0) {
      chrome.action.setBadgeText({ text: '!' });
      chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
    } else if (warningRules.length > 0) {
      chrome.action.setBadgeText({ text: '⚠' });
      chrome.action.setBadgeBackgroundColor({ color: '#f59e0b' });
    } else {
      chrome.action.setBadgeText({ text: '' });
      chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
    }

    // Send notifications for new violations
    if (notificationsEnabled && violatedRules.length > 0) {
      const lastViolations = result.lastViolations || [];
      const newViolations = violatedRules.filter(function(v) {
        return lastViolations.indexOf(v.id) === -1;
      });
      
      for (var i = 0; i < newViolations.length; i++) {
        var violation = newViolations[i];
        chrome.notifications.create('violation-' + violation.id, {
          type: 'basic',
          iconUrl: 'assets/icon-128.png',
          title: '🛑 TradeAutopsy - Rule Violated!',
          message: violation.name + ': ' + (violation.statusText || 'Limit exceeded'),
          priority: 2,
          requireInteraction: true,
        });
      }
      
      // Store current violations
      chrome.storage.local.set({ 
        lastViolations: violatedRules.map(function(v) { return v.id; })
      });
    }

    // Send notifications for new warnings
    if (notificationsEnabled && warningRules.length > 0) {
      const warningResult = await chrome.storage.local.get(['lastWarnings']);
      const lastWarnings = warningResult.lastWarnings || [];
      const newWarnings = warningRules.filter(function(w) {
        return lastWarnings.indexOf(w.id) === -1;
      });
      
      // Only first warning to avoid spam
      if (newWarnings.length > 0) {
        var warning = newWarnings[0];
        chrome.notifications.create('warning-' + warning.id, {
          type: 'basic',
          iconUrl: 'assets/icon-128.png',
          title: '⚠️ TradeAutopsy - Warning',
          message: warning.name + ': ' + (warning.statusText || 'Approaching limit'),
          priority: 1,
        });
      }
      
      // Store current warnings
      chrome.storage.local.set({ 
        lastWarnings: warningRules.map(function(w) { return w.id; })
      });
    }
    
  } catch (error) {
    console.error('Error checking rules:', error);
    chrome.action.setBadgeText({ text: '?' });
    chrome.action.setBadgeBackgroundColor({ color: '#6b7280' });
  }
}

// ============================================
// Refresh All Cached Data
// ============================================
async function refreshAllData() {
  try {
    const result = await chrome.storage.local.get(['authToken']);
    
    if (!result.authToken) {
      return;
    }

    const headers = {
      'Authorization': 'Bearer ' + result.authToken,
      'Content-Type': 'application/json',
    };

    const responses = await Promise.all([
      fetch(CONFIG.API_BASE + '/stats', { headers: headers }),
      fetch(CONFIG.API_BASE + '/rules', { headers: headers }),
      fetch(CONFIG.API_BASE + '/goals', { headers: headers }),
    ]);

    if (responses[0].ok && responses[1].ok && responses[2].ok) {
      const data = await Promise.all([
        responses[0].json(),
        responses[1].json(),
        responses[2].json(),
      ]);

      await chrome.storage.local.set({
        cachedData: { stats: data[0], rules: data[1], goals: data[2] },
        lastCacheTime: Date.now(),
      });
    }
  } catch (error) {
    console.error('Error refreshing data:', error);
  }
}

// ============================================
// Message Handlers
// ============================================
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'refresh') {
    checkRulesAndNotify().then(function() {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'setToken') {
    chrome.storage.local.set({ authToken: request.token }).then(function() {
      checkRulesAndNotify();
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'clearToken') {
    chrome.storage.local.remove(['authToken', 'cachedData', 'lastViolations', 'lastWarnings']).then(function() {
      chrome.action.setBadgeText({ text: '' });
      sendResponse({ success: true });
    });
    return true;
  }
  
  return false;
});

// ============================================
// Notification Click Handlers
// ============================================
chrome.notifications.onClicked.addListener(function(notificationId) {
  chrome.tabs.create({ url: 'https://www.tradeautopsy.in/dashboard/rules' });
  chrome.notifications.clear(notificationId);
});

chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex) {
  if (buttonIndex === 0) {
    chrome.tabs.create({ url: 'https://www.tradeautopsy.in/dashboard' });
  }
  chrome.notifications.clear(notificationId);
});
