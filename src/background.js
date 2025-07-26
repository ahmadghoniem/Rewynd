// background.js - Background script for Chrome extension
// Acts as a bridge between content script and popup

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "ACCOUNT_DATA_UPDATE") {
    // Store the account data in extension storage
    chrome.storage.local.set(
      {
        tradeAnalytics_accountData: message.data
      },
      () => {
        // Broadcast to all popup windows
        chrome.runtime
          .sendMessage({
            type: "ACCOUNT_DATA_UPDATED",
            data: message.data
          })
          .catch(() => {
            // Popup might not be open, that's okay
          })
      }
    )

    sendResponse({ success: true })
  }

  if (message.type === "GET_ACCOUNT_DATA") {
    // Retrieve account data from extension storage
    chrome.storage.local.get(["tradeAnalytics_accountData"], (result) => {
      sendResponse({ data: result.tradeAnalytics_accountData })
    })
    return true // Keep the message channel open for async response
  }

  if (message.type === "TRADE_DATA_UPDATE") {
    // Store the trade data in extension storage
    chrome.storage.local.set(
      {
        fxreplay_trade_data: message.data
      },
      () => {
        // Broadcast to all popup windows
        chrome.runtime
          .sendMessage({
            type: "TRADE_DATA_UPDATED",
            data: message.data
          })
          .catch(() => {
            // Popup might not be open, that's okay
          })
      }
    )

    sendResponse({ success: true })
  }

  if (message.type === "GET_TRADE_DATA") {
    // Retrieve trade data from extension storage
    chrome.storage.local.get(["fxreplay_trade_data"], (result) => {
      sendResponse({ data: result.fxreplay_trade_data })
    })
    return true // Keep the message channel open for async response
  }

  if (message.type === "SET_CHALLENGE_CONFIG") {
    chrome.storage.local.set({ challengeConfig: message.data }, () => {
      sendResponse({ success: true })
    })
    return true // Keep the message channel open for async response
  }

  if (message.type === "GET_CHALLENGE_CONFIG") {
    chrome.storage.local.get(["challengeConfig"], (result) => {
      sendResponse({ data: result.challengeConfig })
    })
    return true // Keep the message channel open for async response
  }
})
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("dist/index.html") })
})
