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
})

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed/updated')
}) 