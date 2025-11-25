// background.js - Background script for Chrome extension
// Acts as a bridge between content script and popup

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SESSION_DATA_UPDATE") {
    // Store the session data in extension storage
    chrome.storage.local.set(
      {
        rewynd_sessionData: message.data
      }
    )

    sendResponse({ success: true })
  }

  if (message.type === "GET_SESSION_DATA") {
    // Retrieve session data from extension storage
    chrome.storage.local.get(["rewynd_sessionData"], (result) => {
      sendResponse({ data: result.rewynd_sessionData })
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
        { rewynd_tradeData: { trades, lastUpdated: Date.now(), url } },
      )
      sendResponse({ success: true })
      return true
    } else {
      // Append with duplicate detection
      chrome.storage.local.get(["rewynd_tradeData"], (result) => {
        const existingTrades = result.rewynd_tradeData?.trades || []
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
        chrome.storage.local.set({ rewynd_tradeData: updatedData })

        sendResponse({ success: true })
      })
      return true
    }
  }

  if (message.type === "GET_TRADE_DATA") {
    // Retrieve trade data from extension storage
    chrome.storage.local.get(["rewynd_tradeData"], (result) => {
      sendResponse({ data: result.rewynd_tradeData })
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
    chrome.storage.local.set({ rewynd_notesData: message.data }, () => {
      sendResponse({ success: true })
    })
    return true // Keep the message channel open for async response
  }

  if (message.type === "GET_NOTES") {
    chrome.storage.local.get(["rewynd_notesData"], (result) => {
      sendResponse({ data: result.rewynd_notesData })
    })
    return true // Keep the message channel open for async response
  }

  if (message.type === "RESET_SESSION") {
    // Clear all session-related data: trades, notes, session data, and sync status
    chrome.storage.local.remove(
      [
        "rewynd_tradeData",
        "rewynd_notesData",
        "rewynd_sessionData",
        "isInSync"
      ],
      () => {
        sendResponse({ success: true })
      }
    )
    return true // Keep the message channel open for async response
  }

  // Clear notes handler (kept for potential note sharing toggle across sessions)
  if (message.type === "CLEAR_NOTES") {
    chrome.storage.local.remove(["rewynd_notesData"], () => {
      sendResponse({ success: true })
    })
    return true // Keep the message channel open for async response
  }

  if (message.type === "SYNC_STATUS_UPDATE") {
    chrome.storage.local.set({ isInSync: message.data }, () => {
      sendResponse({ success: true })
    })
    return true // Keep the message channel open for async response
  }

  if (message.type === "GET_SYNC_STATUS") {
    chrome.storage.local.get(["isInSync"], (result) => {
      sendResponse({ data: result.isInSync ?? false })
    })
    return true // Keep the message channel open for async response
  }

  if (message.type === "STOP_OBSERVER") {
    // Forward the message to the content script to stop the observer
    chrome.tabs.query({ url: "https://app.fxreplay.com/*/auth/testing/chart/*" }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "STOP_OBSERVER" }, () => {
          // Update sync status to false when observer is stopped
          chrome.storage.local.set({ isInSync: false }, () => {
            sendResponse({ success: true })
          })
        })
      } else {
        sendResponse({ success: true })
      }
    })
    return true // Keep the message channel open for async response
  }
})

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("index.html") })
})
