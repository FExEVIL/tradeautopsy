// popup/settings.js
// TradeAutopsy Chrome Extension - Settings Page
// NO INLINE SCRIPTS - All event handlers use addEventListener

// ============================================
// Configuration
// ============================================
const CONFIG = {
  API_BASE: 'https://www.tradeautopsy.in',
};

// ============================================
// DOM Elements
// ============================================
let elements = {};

// ============================================
// Initialize DOM Elements
// ============================================
function initializeElements() {
  elements = {
    backBtn: document.getElementById('back-btn'),
    tokenInput: document.getElementById('tokenInput'),
    saveTokenBtn: document.getElementById('save-token-btn'),
    tokenStatus: document.getElementById('tokenStatus'),
    getTokenLink: document.getElementById('get-token-link'),
    notificationsEnabled: document.getElementById('notificationsEnabled'),
    violationAlerts: document.getElementById('violationAlerts'),
    goalAlerts: document.getElementById('goalAlerts'),
    refreshInterval: document.getElementById('refreshInterval'),
    logoutBtn: document.getElementById('logout-btn'),
    visitLink: document.getElementById('visit-link'),
    helpLink: document.getElementById('help-link'),
    privacyLink: document.getElementById('privacy-link'),
  };
}

// ============================================
// UI Functions
// ============================================
function updateTokenStatus(isConnected) {
  if (!elements.tokenStatus) return;
  
  if (isConnected) {
    elements.tokenStatus.className = 'token-status connected';
    elements.tokenStatus.innerHTML = '<span class="token-status-dot"></span><span>Connected to TradeAutopsy</span>';
  } else {
    elements.tokenStatus.className = 'token-status disconnected';
    elements.tokenStatus.innerHTML = '<span class="token-status-dot"></span><span>Not connected</span>';
  }
}

function showAlert(message) {
  // Simple alert - could be replaced with custom UI
  alert(message);
}

function showConfirm(message) {
  return confirm(message);
}

// ============================================
// Settings Functions
// ============================================
async function loadSettings() {
  try {
    const result = await chrome.storage.local.get(['authToken', 'settings']);
    
    // Update token status
    updateTokenStatus(!!result.authToken);
    
    // Load settings
    const settings = result.settings || {};
    
    if (elements.notificationsEnabled) {
      elements.notificationsEnabled.checked = settings.notificationsEnabled !== false;
    }
    if (elements.violationAlerts) {
      elements.violationAlerts.checked = settings.violationAlerts !== false;
    }
    if (elements.goalAlerts) {
      elements.goalAlerts.checked = settings.goalAlerts !== false;
    }
    if (elements.refreshInterval) {
      elements.refreshInterval.value = settings.refreshInterval || '60';
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

async function saveSettings() {
  try {
    const settings = {
      notificationsEnabled: elements.notificationsEnabled ? elements.notificationsEnabled.checked : true,
      violationAlerts: elements.violationAlerts ? elements.violationAlerts.checked : true,
      goalAlerts: elements.goalAlerts ? elements.goalAlerts.checked : true,
      refreshInterval: elements.refreshInterval ? elements.refreshInterval.value : '60',
    };
    
    await chrome.storage.local.set({ settings: settings });
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

async function saveToken() {
  if (!elements.tokenInput) return;
  
  const token = elements.tokenInput.value.trim();
  if (!token) {
    showAlert('Please enter a valid token');
    return;
  }
  
  try {
    // Test the token
    const response = await fetch(CONFIG.API_BASE + '/api/extension/stats', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (response.ok) {
      await chrome.storage.local.set({ authToken: token });
      updateTokenStatus(true);
      elements.tokenInput.value = '';
      showAlert('Connected successfully!');
    } else {
      showAlert('Invalid token. Please check and try again.');
    }
  } catch (error) {
    console.error('Error saving token:', error);
    showAlert('Connection failed. Please check your internet connection.');
  }
}

async function logout() {
  if (!showConfirm('Are you sure you want to disconnect?')) {
    return;
  }
  
  try {
    await chrome.storage.local.remove(['authToken', 'cachedData', 'lastViolations', 'lastWarnings']);
    updateTokenStatus(false);
    window.close();
  } catch (error) {
    console.error('Error during logout:', error);
  }
}

function goBack() {
  window.location.href = 'index.html';
}

function openUrl(url) {
  chrome.tabs.create({ url: url });
}

// ============================================
// Event Listeners Setup
// ============================================
function setupEventListeners() {
  // Back button
  if (elements.backBtn) {
    elements.backBtn.addEventListener('click', goBack);
  }
  
  // Save token button
  if (elements.saveTokenBtn) {
    elements.saveTokenBtn.addEventListener('click', saveToken);
  }
  
  // Token input - save on Enter key
  if (elements.tokenInput) {
    elements.tokenInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        saveToken();
      }
    });
  }
  
  // Get token link
  if (elements.getTokenLink) {
    elements.getTokenLink.addEventListener('click', function(e) {
      e.preventDefault();
      openUrl(CONFIG.API_BASE + '/dashboard/settings/extension');
    });
  }
  
  // Settings checkboxes and select
  if (elements.notificationsEnabled) {
    elements.notificationsEnabled.addEventListener('change', saveSettings);
  }
  if (elements.violationAlerts) {
    elements.violationAlerts.addEventListener('change', saveSettings);
  }
  if (elements.goalAlerts) {
    elements.goalAlerts.addEventListener('change', saveSettings);
  }
  if (elements.refreshInterval) {
    elements.refreshInterval.addEventListener('change', saveSettings);
  }
  
  // Logout button
  if (elements.logoutBtn) {
    elements.logoutBtn.addEventListener('click', logout);
  }
  
  // Footer links
  if (elements.visitLink) {
    elements.visitLink.addEventListener('click', function(e) {
      e.preventDefault();
      openUrl(CONFIG.API_BASE);
    });
  }
  if (elements.helpLink) {
    elements.helpLink.addEventListener('click', function(e) {
      e.preventDefault();
      openUrl(CONFIG.API_BASE + '/help');
    });
  }
  if (elements.privacyLink) {
    elements.privacyLink.addEventListener('click', function(e) {
      e.preventDefault();
      openUrl(CONFIG.API_BASE + '/privacy');
    });
  }
}

// ============================================
// Initialize
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  initializeElements();
  setupEventListeners();
  loadSettings();
});

