import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import ConfigurationView from "./configuration"
import AnalyticsView from "./analytics"
import { ThemeProvider, useTheme } from "./ThemeContext"

const AppContent = () => {
  const [view, setView] = useState("analytics") // "config" or "analytics"
  const [challengeConfig, setChallengeConfig] = useState({
    phases: 1,
    profitTargets: { phase1: 10 }
  })

  const [accountData, setAccountData] = useState({
    balance: 5000, // Default fallback
    realizedPnL: 0,
    capital: 5000, // Default fallback
    lastUpdated: null
  })

  const { isDark, toggleTheme } = useTheme()

  // Function to load and update account data
  const loadAndUpdateAccountData = () => {
    try {
      // Try to get data from Chrome extension storage first
      if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ type: "GET_ACCOUNT_DATA" }, (response) => {
          if (response && response.data) {
            console.log(
              "Loading/updating account data from extension storage:",
              response.data
            )
            setAccountData(response.data)
          } else {
            console.log(
              "No account data found in extension storage, trying localStorage"
            )
            // Fallback to localStorage
            const stored = localStorage.getItem("tradeAnalytics_accountData")
            if (stored) {
              const parsedData = JSON.parse(stored)
              console.log(
                "Loading/updating account data from localStorage:",
                parsedData
              )
              setAccountData(parsedData)
            } else {
              console.log("No account data found anywhere")
            }
          }
        })
      } else {
        // Fallback to localStorage if not in extension context
        const stored = localStorage.getItem("tradeAnalytics_accountData")
        console.log("Raw localStorage data:", stored)

        if (stored) {
          const parsedData = JSON.parse(stored)
          console.log(
            "Loading/updating account data from localStorage:",
            parsedData
          )
          setAccountData(parsedData)
        } else {
          console.log("No account data found in localStorage")
        }
      }
    } catch (error) {
      console.error("Error loading account data:", error)
    }
  }

  // Load saved configuration and account data on mount
  useEffect(() => {
    // Load challenge configuration
    const savedConfig = localStorage.getItem("challengeConfig")
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig)
        setChallengeConfig(parsed)
      } catch (error) {
        console.error("Error loading saved config:", error)
      }
    }

    // Initial load
    loadAndUpdateAccountData()

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
        loadAndUpdateAccountData()
      }
    }

    // Set up manual refresh event listener
    const handleManualRefresh = () => {
      console.log("Manual refresh triggered")
      loadAndUpdateAccountData()
    }

    // Set up Chrome extension message listener
    const handleExtensionMessage = (message, sender, sendResponse) => {
      console.log("Extension message received:", message)
      if (message.type === "ACCOUNT_DATA_UPDATED") {
        console.log("Account data updated via extension:", message.data)
        setAccountData(message.data)
      }
      if (message.type === "TRADE_DATA_UPDATED") {
        console.log("Trade data updated via extension:", message.data)
        // This will be handled by the analytics component
      }
    }

    // Add event listeners
    window.addEventListener("accountDataUpdated", handleAccountUpdate)
    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("manualRefresh", handleManualRefresh)

    // Add Chrome extension message listener if available
    if (chrome && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener(handleExtensionMessage)
    }

    // Cleanup
    return () => {
      window.removeEventListener("accountDataUpdated", handleAccountUpdate)
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("manualRefresh", handleManualRefresh)

      // Remove Chrome extension message listener if available
      if (chrome && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.removeListener(handleExtensionMessage)
      }
    }
  }, [])

  const handleSave = () => {
    try {
      localStorage.setItem("challengeConfig", JSON.stringify(challengeConfig))
      setView("analytics")
    } catch (error) {
      console.error("Error saving config:", error)
    }
  }

  const handleBack = () => {
    setView("config")
  }

  // Add a refresh handler that works globally
  const handleRefresh = () => {
    // If in analytics view, trigger refresh on the analytics page
    if (view === "analytics") {
      // Use a custom event to trigger refresh in analytics
      window.dispatchEvent(new CustomEvent("analyticsRefresh"))
    }
  }

  // Handler for fetching all trades from all pages
  const handleFetchAllTrades = () => {
    if (window.chrome && chrome.tabs) {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const fxReplayTab = tabs[0];
        if (fxReplayTab && fxReplayTab.url && fxReplayTab.url.includes('fxreplay.com')) {
          chrome.tabs.sendMessage(
            fxReplayTab.id,
            { type: 'EXTRACT_TRADES' },
            (response) => {
              console.log('Fetch All Trades response:', response);
              if (response && response.success) {
                alert('All trades fetched and saved!');
              } else {
                alert('Failed to fetch trades. Make sure you are on the FxReplay site.');
              }
            }
          );
        } else {
          alert('Please open this extension while on fxreplay.com to fetch trades.');
        }
      });
    } else {
      alert('Chrome extension messaging not available.');
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      {/* Header */}
      <header className="bg-card border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-foreground dark:text-white">
                📊 FxReplay Funded Analytics
              </h1>
              {view === "analytics" && (
                <div className="flex items-center gap-4 ml-4">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    variant="default"
                    onClick={handleFetchAllTrades}
                    className="flex items-center gap-2"
                  >
                    Fetch All Trades
                  </Button>
                  <span className="text-lg font-bold text-foreground dark:text-white">
                    Analytics Dashboard
                  </span>
                </div>
              )}
              {view === "analytics" && (
                <select
                  className="ml-4 px-3 py-2 rounded bg-background text-muted-foreground"
                  disabled
                >
                  <option value="" disabled>
                    Select Challenge
                  </option>
                </select>
              )}
              {/* Real Refresh and Theme Toggle Buttons */}
              <button
                className="ml-4 px-3 py-2 rounded bg-background text-muted-foreground hover:bg-muted"
                onClick={handleRefresh}
                title="Refresh"
              >
                &#x21bb; Refresh
              </button>
              <button
                className="ml-2 px-3 py-2 rounded bg-background text-muted-foreground hover:bg-muted"
                onClick={toggleTheme}
                title="Toggle Dark/Light"
              >
                {isDark ? "🌙" : "☀️"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === "config" ? (
          <div className="max-w-2xl mx-auto">
            <ConfigurationView
              config={challengeConfig}
              onSave={handleSave}
              onConfigChange={setChallengeConfig}
              accountData={accountData}
            />
          </div>
        ) : (
          <AnalyticsView
            config={challengeConfig}
            onBack={handleBack}
            accountData={accountData}
          />
        )}
      </main>
    </div>
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
