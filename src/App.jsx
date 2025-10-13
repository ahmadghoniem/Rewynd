import React, { useEffect } from "react"
import AnalyticsView from "./analytics"
import { ThemeProvider } from "./ThemeContext"
import useAppStore from "./store/useAppStore"

/* eslint-disable no-undef */

const AppContent = () => {
  const loadSessionData = useAppStore((state) => state.loadSessionData)
  const loadTradeData = useAppStore((state) => state.loadTradeData)

  // Load saved configuration and account data on mount
  useEffect(() => {
    // Set up event listener for real-time updates from website

    // Set up storage event listener for cross-tab updates
    const handleStorageChange = (event) => {
      if (event.key === "tradeAnalytics_sessionData") {
        // console.log("Storage change detected, reloading session data")
        loadSessionData()
      }
    }

    // Set up Chrome extension message listener
    // eslint-disable-next-line no-unused-vars
    const handleExtensionMessage = (message, sender, sendResponse) => {
      if (message.type === "SESSION_DATA_UPDATED") {
        loadSessionData()
      }
      if (message.type === "TRADE_DATA_UPDATED") {
        loadTradeData()
      }
    }

    // Add event listeners
    window.addEventListener("storage", handleStorageChange)

    // Add Chrome extension message listener if available
    if (chrome && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener(handleExtensionMessage)
    }

    // Cleanup
    return () => {
      window.removeEventListener("storage", handleStorageChange)

      // Remove Chrome extension message listener if available
      if (chrome && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.removeListener(handleExtensionMessage)
      }
    }
  }, [])

  return (
    <ThemeProvider>
      <div className="min-h-screen mx-auto bg-background transition-colors duration-200">
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <AnalyticsView />
        </main>
      </div>
    </ThemeProvider>
  )
}

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App
