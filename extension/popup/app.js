// popup/app.js
// TradeAutopsy Chrome Extension - Popup Script
// NO INLINE SCRIPTS - All event handlers use addEventListener

// ============================================
// Configuration
// ============================================
const CONFIG = {
  API_BASE: 'https://www.tradeautopsy.in/api/extension',
  // For development:
  // API_BASE: 'http://localhost:3000/api/extension',
};

// ============================================
// DOM Elements (initialized after DOMContentLoaded)
// ============================================
let elements = {};

// ============================================
// State
// ============================================
let state = {
  token: null,
  stats: null,
  rules: [],
  goals: [],
  lastUpdated: null,
};

// ============================================
// Initialize DOM Elements
// ============================================
function initializeElements() {
  elements = {
    // States
    loadingState: document.getElementById('loading-state'),
    errorState: document.getElementById('error-state'),
    loginState: document.getElementById('login-state'),
    mainContent: document.getElementById('main-content'),
    
    // Header
    header: document.getElementById('header'),
    statusBadge: document.getElementById('status-badge'),
    statusDot: document.getElementById('status-dot'),
    statusText: document.getElementById('status-text'),
    refreshBtn: document.getElementById('refresh-btn'),
    settingsBtn: document.getElementById('settings-btn'),
    
    // Error
    errorMessage: document.getElementById('error-message'),
    retryBtn: document.getElementById('retry-btn'),
    
    // Login
    loginBtn: document.getElementById('login-btn'),
    signupLink: document.getElementById('signup-link'),
    
    // Stop Banner
    stopBanner: document.getElementById('stop-banner'),
    
    // Stats
    pnlCard: document.getElementById('pnl-card'),
    pnlValue: document.getElementById('pnl-value'),
    tradesCard: document.getElementById('trades-card'),
    tradesValue: document.getElementById('trades-value'),
    tradesSubtext: document.getElementById('trades-subtext'),
    winrateValue: document.getElementById('winrate-value'),
    lossCard: document.getElementById('loss-card'),
    lossValue: document.getElementById('loss-value'),
    
    // Sections
    rulesSection: document.getElementById('rules-section'),
    rulesList: document.getElementById('rules-list'),
    goalsSection: document.getElementById('goals-section'),
    goalsList: document.getElementById('goals-list'),
    warningsSection: document.getElementById('warnings-section'),
    warningsList: document.getElementById('warnings-list'),
    
    // Actions
    openDashboardBtn: document.getElementById('open-dashboard-btn'),
    refreshDataBtn: document.getElementById('refresh-data-btn'),
    
    // Footer
    dashboardLink: document.getElementById('dashboard-link'),
    settingsLink: document.getElementById('settings-link'),
    helpLink: document.getElementById('help-link'),
    lastUpdated: document.getElementById('last-updated'),
  };
}

// ============================================
// Utility Functions
// ============================================
function showState(stateName) {
  // Hide all states
  if (elements.loadingState) elements.loadingState.classList.add('hidden');
  if (elements.errorState) elements.errorState.classList.add('hidden');
  if (elements.loginState) elements.loginState.classList.add('hidden');
  if (elements.mainContent) elements.mainContent.classList.add('hidden');
  
  // Show requested state
  switch (stateName) {
    case 'loading':
      if (elements.loadingState) elements.loadingState.classList.remove('hidden');
      break;
    case 'error':
      if (elements.errorState) elements.errorState.classList.remove('hidden');
      break;
    case 'login':
      if (elements.loginState) elements.loginState.classList.remove('hidden');
      break;
    case 'main':
      if (elements.mainContent) elements.mainContent.classList.remove('hidden');
      break;
  }
}

function formatCurrency(amount) {
  const num = Number(amount) || 0;
  const prefix = num >= 0 ? '+' : '';
  return `${prefix}₹${Math.abs(num).toLocaleString('en-IN')}`;
}

function formatTime(date) {
  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now - d) / 1000);
  
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function updateStatusIndicator(status, shouldStopTrading = false) {
  if (!elements.statusDot || !elements.statusText || !elements.header) return;
  
  elements.statusDot.className = 'status-dot';
  elements.header.className = 'header';
  
  if (shouldStopTrading) {
    elements.statusDot.classList.add('red');
    elements.statusText.textContent = 'Stop Trading';
    elements.header.classList.add('danger');
  } else if (status === 'warning') {
    elements.statusDot.classList.add('yellow');
    elements.statusText.textContent = 'Warning';
    elements.header.classList.add('warning');
  } else {
    elements.statusDot.classList.add('green');
    elements.statusText.textContent = 'All Good';
  }
}

// ============================================
// Storage Functions
// ============================================
async function getToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['authToken'], (result) => {
      resolve(result.authToken || null);
    });
  });
}

async function getCachedData() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['cachedData'], (result) => {
      resolve(result.cachedData || null);
    });
  });
}

async function setCachedData(data) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ cachedData: data }, resolve);
  });
}

// ============================================
// API Functions
// ============================================
async function fetchWithAuth(endpoint) {
  const token = await getToken();
  
  if (!token) {
    throw new Error('No token');
  }
  
  const response = await fetch(`${CONFIG.API_BASE}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (response.status === 401) {
    throw new Error('Unauthorized');
  }
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
}

async function fetchStats() {
  return fetchWithAuth('/stats');
}

async function fetchRules() {
  return fetchWithAuth('/rules');
}

async function fetchGoals() {
  return fetchWithAuth('/goals');
}

// ============================================
// Render Functions
// ============================================
function renderStats(stats) {
  if (!stats) return;
  
  // P&L
  const pnl = stats.totalPnL || 0;
  if (elements.pnlValue) {
    elements.pnlValue.textContent = formatCurrency(pnl);
    elements.pnlValue.className = `stat-value ${pnl >= 0 ? 'positive' : 'negative'}`;
  }
  
  // P&L Card warning state
  if (elements.pnlCard) {
    elements.pnlCard.className = 'stat-card';
    if (stats.shouldStopTrading) {
      elements.pnlCard.classList.add('danger');
    } else if (stats.currentLoss && stats.maxLoss && stats.currentLoss >= stats.maxLoss * 0.8) {
      elements.pnlCard.classList.add('warning');
    }
  }
  
  // Trades
  const trades = stats.totalTrades || 0;
  const maxTrades = stats.maxTrades;
  if (elements.tradesValue) {
    elements.tradesValue.textContent = maxTrades ? `${trades}/${maxTrades}` : `${trades}`;
  }
  if (elements.tradesSubtext && maxTrades) {
    elements.tradesSubtext.textContent = `${Math.round((trades / maxTrades) * 100)}% used`;
  }
  if (elements.tradesCard && maxTrades) {
    elements.tradesCard.className = 'stat-card';
    if (trades >= maxTrades * 0.9) {
      elements.tradesCard.classList.add('warning');
    }
  }
  
  // Win Rate
  const winRate = stats.winRate || 0;
  if (elements.winrateValue) {
    elements.winrateValue.textContent = `${winRate}%`;
    elements.winrateValue.className = `stat-value ${winRate >= 50 ? 'positive' : winRate > 0 ? 'warning' : ''}`;
  }
  
  // Loss Limit
  const currentLoss = Math.abs(stats.currentLoss || 0);
  const maxLoss = stats.maxLoss || 0;
  if (elements.lossValue) {
    elements.lossValue.textContent = maxLoss ? `₹${currentLoss.toLocaleString()}/${maxLoss.toLocaleString()}` : `₹${currentLoss.toLocaleString()}`;
    elements.lossValue.className = `stat-value ${currentLoss >= maxLoss ? 'negative' : ''}`;
  }
  if (elements.lossCard) {
    elements.lossCard.className = 'stat-card';
    if (stats.shouldStopTrading) {
      elements.lossCard.classList.add('danger');
    } else if (currentLoss >= maxLoss * 0.8) {
      elements.lossCard.classList.add('warning');
    }
  }
  
  // Stop Banner
  if (elements.stopBanner) {
    if (stats.shouldStopTrading) {
      elements.stopBanner.classList.remove('hidden');
    } else {
      elements.stopBanner.classList.add('hidden');
    }
  }
  
  // Update status
  const hasViolations = stats.rulesViolated > 0 || stats.shouldStopTrading;
  const hasWarnings = stats.warnings && stats.warnings.length > 0;
  updateStatusIndicator(hasWarnings ? 'warning' : 'green', hasViolations);
}

function renderRules(rulesData) {
  const rules = rulesData.rules || [];
  
  if (!elements.rulesSection || !elements.rulesList) return;
  
  if (rules.length === 0) {
    elements.rulesSection.classList.add('hidden');
    return;
  }
  
  elements.rulesSection.classList.remove('hidden');
  
  elements.rulesList.innerHTML = rules.map(rule => {
    let statusIcon = '✅';
    let statusClass = 'ok';
    
    if (rule.status === 'warning') {
      statusIcon = '⚠️';
      statusClass = 'warning';
    } else if (rule.status === 'violated') {
      statusIcon = '❌';
      statusClass = 'violated';
    }
    
    const statusText = rule.current !== undefined && rule.limit !== undefined 
      ? `${rule.current}/${rule.limit}`
      : rule.statusText || '';
    
    return `
      <div class="rule-item ${statusClass}">
        <div class="rule-name">
          <span class="rule-icon ${statusClass}">${rule.status === 'ok' ? '✓' : rule.status === 'warning' ? '!' : '✕'}</span>
          <span>${escapeHtml(rule.name)}</span>
        </div>
        <span class="rule-status ${statusClass}">
          ${statusIcon} ${escapeHtml(statusText)}
        </span>
      </div>
    `;
  }).join('');
}

function renderGoals(goalsData) {
  const goals = goalsData.goals || [];
  
  if (!elements.goalsSection || !elements.goalsList) return;
  
  if (goals.length === 0) {
    elements.goalsSection.classList.add('hidden');
    return;
  }
  
  elements.goalsSection.classList.remove('hidden');
  
  elements.goalsList.innerHTML = goals.map(goal => {
    const progress = goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0;
    const progressClass = progress >= 50 ? '' : 'warning';
    
    return `
      <div class="goal-item">
        <div class="goal-header">
          <span class="goal-name">${escapeHtml(goal.name)}</span>
          <span class="goal-progress-text ${progress >= 50 ? 'on-track' : 'behind'}">${progress}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${progressClass}" style="width: ${Math.min(progress, 100)}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderWarnings(stats) {
  if (!elements.warningsSection || !elements.warningsList) return;
  
  const warnings = stats.warnings || [];
  const hasViolations = stats.rulesViolated > 0;
  
  if (warnings.length === 0 && !hasViolations) {
    elements.warningsSection.classList.add('hidden');
    return;
  }
  
  elements.warningsSection.classList.remove('hidden');
  
  let warningsHtml = '';
  
  if (hasViolations) {
    warningsHtml += `
      <div class="warning-item">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        ${stats.rulesViolated} rule(s) violated - Stop trading immediately!
      </div>
    `;
  }
  
  warningsHtml += warnings.map(warning => `
    <div class="warning-item yellow">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      ${escapeHtml(warning)}
    </div>
  `).join('');
  
  elements.warningsList.innerHTML = warningsHtml;
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// Main Functions
// ============================================
async function loadData() {
  showState('loading');
  
  try {
    const token = await getToken();
    
    if (!token) {
      showState('login');
      return;
    }
    
    // Show cached data first if available
    const cached = await getCachedData();
    if (cached) {
      renderStats(cached.stats);
      renderRules(cached.rules || { rules: [] });
      renderGoals(cached.goals || { goals: [] });
      renderWarnings(cached.stats || {});
    }
    
    // Fetch fresh data in parallel
    const [statsData, rulesData, goalsData] = await Promise.all([
      fetchStats().catch(() => null),
      fetchRules().catch(() => ({ rules: [] })),
      fetchGoals().catch(() => ({ goals: [] })),
    ]);
    
    if (!statsData) {
      if (!cached) {
        throw new Error('Failed to load stats');
      }
      // Show cached data with warning
      showState('main');
      return;
    }
    
    // Update state
    state.stats = statsData;
    state.rules = rulesData.rules || [];
    state.goals = goalsData.goals || [];
    state.lastUpdated = new Date();
    
    // Cache the data
    await setCachedData({ stats: statsData, rules: rulesData, goals: goalsData });
    
    // Render UI
    renderStats(state.stats);
    renderRules(rulesData);
    renderGoals(goalsData);
    renderWarnings(state.stats);
    
    // Update last updated time
    if (elements.lastUpdated) {
      elements.lastUpdated.textContent = `Updated ${formatTime(state.lastUpdated)}`;
    }
    
    showState('main');
    
  } catch (error) {
    console.error('Error loading data:', error);
    
    if (error.message === 'No token' || error.message === 'Unauthorized') {
      showState('login');
    } else {
      if (elements.errorMessage) {
        elements.errorMessage.textContent = error.message;
      }
      showState('error');
    }
  }
}

function openDashboard() {
  chrome.tabs.create({ url: `${CONFIG.API_BASE.replace('/api/extension', '')}/dashboard` });
}

function openSettings() {
  chrome.tabs.create({ url: `${CONFIG.API_BASE.replace('/api/extension', '')}/dashboard/settings/extension` });
}

function openLogin() {
  chrome.tabs.create({ url: `${CONFIG.API_BASE.replace('/api/extension', '')}/login` });
}

function openSignup() {
  chrome.tabs.create({ url: `${CONFIG.API_BASE.replace('/api/extension', '')}/signup` });
}

function openHelp() {
  chrome.tabs.create({ url: `${CONFIG.API_BASE.replace('/api/extension', '')}/help` });
}

// ============================================
// Event Listeners Setup (NO INLINE HANDLERS!)
// ============================================
function setupEventListeners() {
  // Header buttons
  if (elements.refreshBtn) {
    elements.refreshBtn.addEventListener('click', loadData);
  }
  if (elements.settingsBtn) {
    elements.settingsBtn.addEventListener('click', openSettings);
  }
  
  // Login state
  if (elements.loginBtn) {
    elements.loginBtn.addEventListener('click', openLogin);
  }
  if (elements.signupLink) {
    elements.signupLink.addEventListener('click', (e) => {
      e.preventDefault();
      openSignup();
    });
  }
  
  // Error state
  if (elements.retryBtn) {
    elements.retryBtn.addEventListener('click', loadData);
  }
  
  // Main content actions
  if (elements.openDashboardBtn) {
    elements.openDashboardBtn.addEventListener('click', openDashboard);
  }
  if (elements.refreshDataBtn) {
    elements.refreshDataBtn.addEventListener('click', loadData);
  }
  
  // Footer links
  if (elements.dashboardLink) {
    elements.dashboardLink.addEventListener('click', (e) => {
      e.preventDefault();
      openDashboard();
    });
  }
  if (elements.settingsLink) {
    elements.settingsLink.addEventListener('click', (e) => {
      e.preventDefault();
      openSettings();
    });
  }
  if (elements.helpLink) {
    elements.helpLink.addEventListener('click', (e) => {
      e.preventDefault();
      openHelp();
    });
  }
}

// ============================================
// Initialize
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize DOM elements
  initializeElements();
  
  // Setup event listeners
  setupEventListeners();
  
  // Load data
  loadData();
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TOKEN_UPDATED' || message.type === 'REFRESH_DATA') {
    loadData();
  }
  sendResponse({ received: true });
  return true;
});
