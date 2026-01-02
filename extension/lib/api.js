// API utilities for TradeAutopsy extension
const API_BASE_URL = 'https://www.tradeautopsy.in';

/**
 * Get the stored auth token
 */
export async function getAuthToken() {
  const result = await chrome.storage.local.get(['authToken']);
  return result.authToken;
}

/**
 * Store auth token
 */
export async function setAuthToken(token) {
  await chrome.storage.local.set({ authToken: token });
  // Notify background service worker
  chrome.runtime.sendMessage({ action: 'setToken', token });
}

/**
 * Clear auth token and cached data
 */
export async function clearAuthToken() {
  await chrome.storage.local.remove(['authToken', 'cachedData', 'lastViolations', 'lastWarnings']);
  chrome.runtime.sendMessage({ action: 'clearToken' });
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const token = await getAuthToken();
  return !!token;
}

/**
 * Make an authenticated API request
 */
export async function apiRequest(endpoint, options = {}) {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error('Unauthorized');
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (response.status === 401) {
    await clearAuthToken();
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch today's trading stats
 */
export async function fetchStats() {
  return apiRequest('/api/extension/stats');
}

/**
 * Fetch trading rules status
 */
export async function fetchRules() {
  return apiRequest('/api/extension/rules');
}

/**
 * Fetch goals progress
 */
export async function fetchGoals() {
  return apiRequest('/api/extension/goals');
}

/**
 * Get cached data
 */
export async function getCachedData() {
  const result = await chrome.storage.local.get(['cachedData', 'lastCacheTime']);
  return {
    data: result.cachedData,
    cacheTime: result.lastCacheTime,
    isStale: result.lastCacheTime && (Date.now() - result.lastCacheTime) > 5 * 60 * 1000, // 5 minutes
  };
}

/**
 * Store settings
 */
export async function saveSettings(settings) {
  await chrome.storage.local.set({ settings });
}

/**
 * Get settings
 */
export async function getSettings() {
  const result = await chrome.storage.local.get(['settings']);
  return result.settings || {
    notificationsEnabled: true,
    soundEnabled: false,
    refreshInterval: 60, // seconds
  };
}
