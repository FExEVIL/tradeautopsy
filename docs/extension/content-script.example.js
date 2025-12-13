/**
 * TradeAutopsy Browser Extension - Content Script
 * 
 * This script runs on broker websites and validates trades in real-time
 * 
 * NOTE: This is an example implementation. Actual selectors will vary by broker.
 */

// Configuration
const TRADEAUTOPSY_API_URL = 'https://yourapp.com/api/extension'

// Get stored auth token
async function getStoredToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['tradeautopsy_token'], (result) => {
      resolve(result.tradeautopsy_token)
    })
  })
}

// Show warning modal
function showWarningModal(violations, isBlocking) {
  return new Promise((resolve) => {
    const modal = document.createElement('div')
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `
    
    const content = document.createElement('div')
    content.style.cssText = `
      background: #1a1a1a;
      border: 2px solid ${isBlocking ? '#ef4444' : '#f59e0b'};
      border-radius: 12px;
      padding: 24px;
      max-width: 500px;
      color: white;
    `
    
    content.innerHTML = `
      <h2 style="color: ${isBlocking ? '#ef4444' : '#f59e0b'}; margin-bottom: 16px;">
        ${isBlocking ? '⚠️ Trade Blocked' : '⚠️ Trade Warning'}
      </h2>
      <div style="margin-bottom: 16px;">
        ${violations.map(v => `
          <div style="margin-bottom: 8px;">
            <strong>${v.ruleTitle}:</strong> ${v.message}
          </div>
        `).join('')}
      </div>
      <div style="display: flex; gap: 8px;">
        ${isBlocking ? '' : `
          <button id="proceed-btn" style="flex: 1; padding: 12px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
            Proceed Anyway
          </button>
        `}
        <button id="cancel-btn" style="flex: 1; padding: 12px; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer;">
          Cancel
        </button>
      </div>
    `
    
    modal.appendChild(content)
    document.body.appendChild(modal)
    
    document.getElementById('proceed-btn')?.addEventListener('click', () => {
      document.body.removeChild(modal)
      resolve(true)
    })
    
    document.getElementById('cancel-btn').addEventListener('click', () => {
      document.body.removeChild(modal)
      resolve(false)
    })
  })
}

// Validate trade
async function validateTrade(tradeData) {
  const token = await getStoredToken()
  if (!token) {
    console.warn('TradeAutopsy: No auth token found')
    return { allowed: true, violations: { blocking: [], warnings: [] } }
  }
  
  try {
    const response = await fetch(`${TRADEAUTOPSY_API_URL}/validate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tradeData)
    })
    
    if (!response.ok) {
      console.error('TradeAutopsy: Validation failed', response.statusText)
      return { allowed: true, violations: { blocking: [], warnings: [] } }
    }
    
    return await response.json()
  } catch (error) {
    console.error('TradeAutopsy: Validation error', error)
    return { allowed: true, violations: { blocking: [], warnings: [] } }
  }
}

// Main: Intercept trade form submission
(function() {
  'use strict'
  
  // Wait for page to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
  
  function init() {
    // Zerodha-specific selectors (example)
    const tradeForm = document.querySelector('#kite-trade-form') || 
                     document.querySelector('form[action*="order"]')
    
    if (!tradeForm) {
      console.log('TradeAutopsy: Trade form not found on this page')
      return
    }
    
    console.log('TradeAutopsy: Extension active, monitoring trade form')
    
    tradeForm.addEventListener('submit', async (e) => {
      e.preventDefault()
      e.stopPropagation()
      
      // Extract trade data (broker-specific)
      const symbolInput = document.querySelector('#symbol') || 
                         document.querySelector('input[name="symbol"]')
      const sideInput = document.querySelector('#side') || 
                       document.querySelector('select[name="side"]')
      const quantityInput = document.querySelector('#quantity') || 
                           document.querySelector('input[name="quantity"]')
      const priceInput = document.querySelector('#price') || 
                        document.querySelector('input[name="price"]')
      
      if (!symbolInput || !quantityInput) {
        console.warn('TradeAutopsy: Could not extract trade data')
        tradeForm.submit() // Proceed without validation
        return
      }
      
      const tradeData = {
        symbol: symbolInput.value,
        side: sideInput?.value || 'BUY',
        quantity: parseInt(quantityInput.value),
        price: priceInput ? parseFloat(priceInput.value) : 0,
        timestamp: new Date().toISOString()
      }
      
      // Validate
      const validation = await validateTrade(tradeData)
      
      if (!validation.allowed && validation.violations.blocking.length > 0) {
        // Block trade
        const proceed = await showWarningModal(validation.violations.blocking, true)
        if (!proceed) {
          return // Cancel trade
        }
      } else if (validation.violations.warnings.length > 0) {
        // Show warning
        const proceed = await showWarningModal(validation.violations.warnings, false)
        if (!proceed) {
          return // Cancel trade
        }
      }
      
      // Proceed with trade
      tradeForm.submit()
    })
  }
})()
