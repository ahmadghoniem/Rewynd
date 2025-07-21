// background.js - Background script for Chrome extension
// Acts as a bridge between content script and popup

console.log('Background script loaded')

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message)
  
  if (message.type === 'ACCOUNT_DATA_UPDATE') {
    // Store the account data in extension storage
    chrome.storage.local.set({ 
      'tradeAnalytics_accountData': message.data 
    }, () => {
      console.log('Account data stored in extension storage:', message.data)
      
      // Broadcast to all popup windows
      chrome.runtime.sendMessage({
        type: 'ACCOUNT_DATA_UPDATED',
        data: message.data
      }).catch(() => {
        // Popup might not be open, that's okay
        console.log('Popup not open, data stored for later')
      })
    })
    
    sendResponse({ success: true })
  }
  
  if (message.type === 'GET_ACCOUNT_DATA') {
    // Retrieve account data from extension storage
    chrome.storage.local.get(['tradeAnalytics_accountData'], (result) => {
      console.log('Retrieved account data from storage:', result.tradeAnalytics_accountData)
      sendResponse({ data: result.tradeAnalytics_accountData })
    })
    return true // Keep the message channel open for async response
  }
  
  if (message.type === 'OPEN_EXTENSION_TAB') {
    console.log('Opening extension tab...')
    
    // Open the extension in a new tab
    chrome.tabs.create({
      url: chrome.runtime.getURL('dist/index.html')
    }, (tab) => {
      if (chrome.runtime.lastError) {
        console.error('Error opening tab:', chrome.runtime.lastError)
        sendResponse({ success: false, error: chrome.runtime.lastError.message })
      } else {
        console.log('Extension opened in new tab:', tab.id)
        sendResponse({ success: true, tabId: tab.id })
      }
    })
    return true // Keep the message channel open for async response
  }
  
  if (message.type === 'TRADE_DATA_UPDATE') {
    // Store the trade data in extension storage
    chrome.storage.local.set({ 
      'fxreplay_trade_data': message.data 
    }, () => {
      console.log('Trade data stored in extension storage:', message.data)
      
      // Broadcast to all popup windows
      chrome.runtime.sendMessage({
        type: 'TRADE_DATA_UPDATED',
        data: message.data
      }).catch(() => {
        // Popup might not be open, that's okay
        console.log('Popup not open, trade data stored for later')
      })
    })
    
    sendResponse({ success: true })
  }
  
  if (message.type === 'GET_TRADE_DATA') {
    // Retrieve trade data from extension storage
    chrome.storage.local.get(['fxreplay_trade_data'], (result) => {
      console.log('Retrieved trade data from storage:', result.fxreplay_trade_data)
      sendResponse({ data: result.fxreplay_trade_data })
    })
    return true // Keep the message channel open for async response
  }
})

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed/updated')
}) 