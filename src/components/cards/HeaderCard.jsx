import React from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, Database, Sun, Moon } from "lucide-react"
import { useTheme } from "../../ThemeContext"
import useAppStore from "../../store/useAppStore"
import sampleTrades from "../../sampleTrades.json"

const HeaderCard = () => {
  const { isDark, toggleTheme } = useTheme()
  const setExtractedTrades = useAppStore((state) => state.setExtractedTrades)
  const setSessionData = useAppStore((state) => state.setSessionData)
  const loadSessionData = useAppStore((state) => state.loadSessionData)
  const loadTradeData = useAppStore((state) => state.loadTradeData)

  // Handler for refreshing all data with automatic tab switching
  const handleRefreshData = async () => {
    if (!window.chrome?.tabs) {
      alert("Chrome extension messaging not available.")
      return
    }

    try {
      // Get current tab and FxReplay tab
      // eslint-disable-next-line no-undef
      const [currentTab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })
      // eslint-disable-next-line no-undef
      const [fxReplayTab] = await chrome.tabs.query({
        url: "https://app.fxreplay.com/en-US/auth/chart/*"
      })

      if (!fxReplayTab) {
        alert("Please open a FxReplay tab to refresh data.")
        return
      }

      // Switch to FxReplay tab and extract data
      // eslint-disable-next-line no-undef
      await chrome.tabs.update(fxReplayTab.id, { active: true })

      // Extract both session data and trade data separately
      const [sessionResponse, tradeResponse] = await Promise.all([
        // eslint-disable-next-line no-undef
        chrome.tabs.sendMessage(fxReplayTab.id, {
          type: "EXTRACT_SESSION_DATA"
        }),
        // eslint-disable-next-line no-undef
        chrome.tabs.sendMessage(fxReplayTab.id, {
          type: "EXTRACT_TRADES",
          forceRefresh: true
        })
      ])

      if (sessionResponse?.success && tradeResponse?.success) {
        // Load both session data and trade data
        await Promise.all([loadSessionData(), loadTradeData()])

        // Trigger account data extraction using the existing mechanism
        // This will automatically update the UI through the store
        console.log(
          "✅ Data refreshed successfully! Session and trade data updated."
        )

        alert("Data refreshed successfully!")
      } else {
        const errors = []
        if (!sessionResponse?.success) {
          errors.push("Session data extraction failed")
        }
        if (!tradeResponse?.success) {
          errors.push("Trade data extraction failed")
        }
        alert(
          `Failed to refresh data: ${errors.join(
            ", "
          )}. Make sure you have a FxReplay tab open.`
        )
      }

      // Switch back to original tab
      if (currentTab?.id !== fxReplayTab.id) {
        // eslint-disable-next-line no-undef
        await chrome.tabs.update(currentTab.id, { active: true })
      }
    } catch (error) {
      console.error("Error during data refresh:", error)
      alert("Error during data refresh. Please try again.")
    }
  }

  // --- Handler to add provided sample data ---
  const handleAddSampleData = () => {
    // Extract trades array from the new sample data structure
    const trades = sampleTrades.trades
    setExtractedTrades(trades)

    // Set session data from the new structure
    const sessionData = sampleTrades.sessionData
    setSessionData(sessionData)
  }
  return (
    <header className="bg-background border-b border-border/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo on the left */}
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-foreground">
              FxReplay Funded
            </h1>
          </div>

          {/* Buttons on the right */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshData}
              className="h-9 px-3"
              title="Refresh Data"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddSampleData}
              className="h-9 px-3"
              title="Add Sample Data"
            >
              <Database className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Sample Data</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-9 px-3"
              title="Toggle Theme"
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default HeaderCard
