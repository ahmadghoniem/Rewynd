import React, { useEffect } from "react"
import AnalyticsView from "./analytics"
import { ThemeProvider, useTheme } from "./ThemeContext"
import useAppStore from "./store/useAppStore"
import HeaderCard from "./components/cards/HeaderCard"

const AppContent = () => {
  const setAccountData = useAppStore((state) => state.setAccountData)
  const loadAccountData = useAppStore((state) => state.loadAccountData)

  const loadTradeData = useAppStore((state) => state.loadTradeData)
  const analyticsRef = React.useRef(null)

  const { isDark, toggleTheme } = useTheme()

  // Load saved configuration and account data on mount
  useEffect(() => {
    // Set up event listener for real-time updates from website
    const handleAccountUpdate = (event) => {
      const newData = event.detail
      // console.log("Event-triggered account update:", newData)
      setAccountData(newData)
    }

    // Set up storage event listener for cross-tab updates
    const handleStorageChange = (event) => {
      if (event.key === "tradeAnalytics_accountData") {
        // console.log("Storage change detected, reloading account data")
        loadAccountData()
      }
    }

    // Set up Chrome extension message listener
    const handleExtensionMessage = (message, sender, sendResponse) => {
      if (message.type === "ACCOUNT_DATA_UPDATED") {
        loadAccountData()
      }
      if (message.type === "TRADE_DATA_UPDATED") {
        loadTradeData()
      }
    }

    // Add event listeners
    window.addEventListener("accountDataUpdated", handleAccountUpdate)
    window.addEventListener("storage", handleStorageChange)

    // Add Chrome extension message listener if available
    if (chrome && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener(handleExtensionMessage)
    }

    // Cleanup
    return () => {
      window.removeEventListener("accountDataUpdated", handleAccountUpdate)
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
        {/* Header */}
        <HeaderCard />
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <AnalyticsView ref={analyticsRef} />
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
