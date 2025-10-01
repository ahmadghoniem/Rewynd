// background.js - Background script for Chrome extension
// Acts as a bridge between content script and popup

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SESSION_DATA_UPDATE") {
    // Store the session data in extension storage
    chrome.storage.local.set(
      {
        tradeAnalytics_sessionData: message.data
      },
      () => {
        // Broadcast to all popup windows
        chrome.runtime
          .sendMessage({
            type: "SESSION_DATA_UPDATED",
            data: message.data
          })
          .catch(() => {
            // Popup might not be open, that's okay
          })
      }
    )

    sendResponse({ success: true })
  }

  if (message.type === "GET_SESSION_DATA") {
    // Retrieve session data from extension storage
    chrome.storage.local.get(["tradeAnalytics_sessionData"], (result) => {
      sendResponse({ data: result.tradeAnalytics_sessionData })
    })
    return true // Keep the message channel open for async response
  }

  if (message.type === "TRADE_DATA_UPDATE") {
    const { trades, forceRefresh, url } = message.data

    // Validate trades data
    if (!Array.isArray(trades)) {
      console.error("Invalid trades data:", trades)
      sendResponse({ success: false, error: "Invalid trades data" })
      return
    }

    if (forceRefresh) {
      // Replace all data
      chrome.storage.local.set(
        { fxreplay_trade_data: { trades, lastUpdated: Date.now(), url } },
        () => {
          chrome.runtime
            .sendMessage({
              type: "TRADE_DATA_UPDATED",
              data: { trades, lastUpdated: Date.now(), url }
            })
            .catch(() => {})
        }
      )
      sendResponse({ success: true })
    } else {
      // Append with duplicate detection
      chrome.storage.local.get(["fxreplay_trade_data"], (result) => {
        const existingTrades = result.fxreplay_trade_data?.trades || []
        const existingIds = new Set(
          existingTrades.map((trade) => `${trade.dateStart}-${trade.dateEnd}`)
        )
        const uniqueNewTrades = trades.filter(
          (trade) => !existingIds.has(`${trade.dateStart}-${trade.dateEnd}`)
        )

        if (trades.length !== uniqueNewTrades.length) {
          console.log(
            `📊 Added ${uniqueNewTrades.length} new trades, skipped ${
              trades.length - uniqueNewTrades.length
            } duplicates`
          )
        }

        const updatedData = {
          trades: [...uniqueNewTrades, ...existingTrades],
          lastUpdated: Date.now(),
          url
        }
        chrome.storage.local.set({ fxreplay_trade_data: updatedData }, () => {
          chrome.runtime
            .sendMessage({ type: "TRADE_DATA_UPDATED", data: updatedData })
            .catch(() => {})
        })

        sendResponse({ success: true })
      })
      return true
    }
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
  if (message.type === "SAVE_NOTES") {
    chrome.storage.local.set({ fxReplayNotes: message.data }, () => {
      sendResponse({ success: true })
    })
    return true // Keep the message channel open for async response
  }

  if (message.type === "GET_NOTES") {
    chrome.storage.local.get(["fxReplayNotes"], (result) => {
      sendResponse({ data: result.fxReplayNotes })
    })
    return true // Keep the message channel open for async response
  }

  if (message.type === "CLEAR_TRADE_DATA") {
    chrome.storage.local.remove(["fxreplay_trade_data"], () => {
      sendResponse({ success: true })
    })
    return true // Keep the message channel open for async response
  }

  if (message.type === "CLEAR_NOTES") {
    chrome.storage.local.remove(["fxReplayNotes"], () => {
      sendResponse({ success: true })
    })
    return true // Keep the message channel open for async response
  }
})
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("index.html") })
})
