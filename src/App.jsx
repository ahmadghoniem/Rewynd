import React, { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import AnalyticsView from "./analytics"
import { ThemeProvider, useTheme } from "./ThemeContext"
import useAppStore from "./store/useAppStore"
import sampleTrades from "./sampleTrades.json"
import HeaderCard from "./components/cards/HeaderCard"

const AppContent = () => {
  const config = useAppStore((state) => state.config)
  const setConfig = useAppStore((state) => state.setConfig)
  const accountData = useAppStore((state) => state.accountData)
  const setAccountData = useAppStore((state) => state.setAccountData)
  const loadAccountData = useAppStore((state) => state.loadAccountData)
  const loadChallengeConfig = useAppStore((state) => state.loadChallengeConfig)
  const saveChallengeConfig = useAppStore((state) => state.saveChallengeConfig)
  const loadTradeData = useAppStore((state) => state.loadTradeData)
  const extractedTrades = useAppStore((state) => state.extractedTrades)
  const setExtractedTrades = useAppStore((state) => state.setExtractedTrades)
  const analyticsRef = React.useRef(null)

  const { isDark, toggleTheme } = useTheme()

  // Load saved configuration and account data on mount
  useEffect(() => {
    // Store auto-initializes data on creation, no need to load manually

    // Set up event listener for real-time updates from website
    const handleAccountUpdate = (event) => {
      const newData = event.detail
      console.log("Event-triggered account update:", newData)
      setAccountData(newData)
    }

    // Set up storage event listener for cross-tab updates
    const handleStorageChange = (event) => {
      if (event.key === "tradeAnalytics_accountData") {
        console.log("Storage change detected, reloading account data")
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

  const handleSaveConfig = async () => {
    try {
      console.log("Attempting to save config:", config)
      const success = await saveChallengeConfig(config)
      console.log("Save result:", success)
      if (success) {
        return true
      } else {
        console.warn(
          "Failed to save challenge config - Chrome extension may not be available"
        )
        // Don't show alert, just return false and let the dialog handle it
        return false
      }
    } catch (error) {
      console.error("Error saving config:", error)
      return false
    }
  }

  // Handler for refreshing all data
  const handleRefreshData = async () => {
    if (window.chrome && chrome.tabs) {
      // Find any tab that contains the FxReplay chart URL pattern
      chrome.tabs.query(
        { url: "https://app.fxreplay.com/en-US/auth/chart/*" },
        function (tabs) {
          if (tabs && tabs.length > 0) {
            const fxReplayTab = tabs[0] // Use the first FxReplay tab found
            // Trigger extraction of all data (account + trades)
            chrome.tabs.sendMessage(
              fxReplayTab.id,
              { type: "EXTRACT_ALL_DATA" },
              async (response) => {
                if (response && response.success) {
                  // Refresh both account and trade data from storage
                  await loadAccountData()
                  await loadTradeData()
                  alert("Data refreshed successfully!")
                } else {
                  alert(
                    "Failed to refresh data. Make sure you have a FxReplay tab open."
                  )
                }
              }
            )
          } else {
            alert("Please open a FxReplay tab to refresh data.")
          }
        }
      )
    } else {
      alert("Chrome extension messaging not available.")
    }
  }

  // --- Handler to add provided sample data ---
  const handleAddSampleData = () => {
    setExtractedTrades(sampleTrades)
    // Set a sample accountData object for testing
    setAccountData({
      capital: 10000,
      realizedPnL: 66.56, // sum of realized values (as an example)
      balance: 10066.56, // capital + realizedPnL
      lastUpdated: Date.now()
    })
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen mx-auto bg-background transition-colors duration-200">
        {/* Header */}
        <HeaderCard
          onRefreshData={handleRefreshData}
          onAddSampleData={handleAddSampleData}
          onSaveConfig={handleSaveConfig}
        />
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
