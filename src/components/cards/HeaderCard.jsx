import React from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, Database, Settings, Sun, Moon } from "lucide-react"
import { useTheme } from "../../ThemeContext"
import ConfigurationDialog from "../ConfigurationDialog"
import useAppStore from "../../store/useAppStore"
import sampleTrades from "../../sampleTrades.json"

const HeaderCard = () => {
  const { isDark, toggleTheme } = useTheme()
  const setExtractedTrades = useAppStore((state) => state.setExtractedTrades)
  const setAccountData = useAppStore((state) => state.setAccountData)
  const loadAccountData = useAppStore((state) => state.loadAccountData)

  // Handler for refreshing all data with automatic tab switching
  const handleRefreshData = async () => {
    if (window.chrome && chrome.tabs) {
      // Get current active tab to return to later
      chrome.tabs.query(
        { active: true, currentWindow: true },
        async (currentTabs) => {
          const currentTab = currentTabs[0]

          // Find any tab that contains the FxReplay chart URL pattern
          chrome.tabs.query(
            { url: "https://app.fxreplay.com/en-US/auth/chart/*" },
            async function (tabs) {
              if (tabs && tabs.length > 0) {
                const fxReplayTab = tabs[0] // Use the first FxReplay tab found

                try {
                  // Switch to FxReplay tab for faster extraction
                  await chrome.tabs.update(fxReplayTab.id, { active: true })

                  // Trigger extraction of all data (account + trades)
                  chrome.tabs.sendMessage(
                    fxReplayTab.id,
                    {
                      type: "EXTRACT_TRADES",
                      forceRefresh: true
                    },
                    async (response) => {
                      if (response && response.success) {
                        // Refresh both account and trade data from storage
                        await loadAccountData()
                        await loadTradeData()

                        // Switch back to the original tab
                        if (currentTab && currentTab.id !== fxReplayTab.id) {
                          await chrome.tabs.update(currentTab.id, {
                            active: true
                          })
                        }

                        alert("Data refreshed successfully!")
                      } else {
                        // Switch back to the original tab even if extraction failed
                        if (currentTab && currentTab.id !== fxReplayTab.id) {
                          await chrome.tabs.update(currentTab.id, {
                            active: true
                          })
                        }

                        alert(
                          "Failed to refresh data. Make sure you have a FxReplay tab open."
                        )
                      }
                    }
                  )
                } catch (error) {
                  console.error("Error during tab switching:", error)
                  // Switch back to the original tab on error
                  if (currentTab && currentTab.id !== fxReplayTab.id) {
                    await chrome.tabs.update(currentTab.id, { active: true })
                  }
                  alert("Error during data refresh. Please try again.")
                }
              } else {
                alert("Please open a FxReplay tab to refresh data.")
              }
            }
          )
        }
      )
    } else {
      alert("Chrome extension messaging not available.")
    }
  }

  // --- Handler to add provided sample data ---
  const handleAddSampleData = () => {
    // Extract trades array from the new sample data structure
    const trades = sampleTrades.trades
    setExtractedTrades(trades)

    // Set account data from the new structure
    const accountData = sampleTrades.accountData
    setAccountData(accountData)
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

            <ConfigurationDialog />
          </div>
        </div>
      </div>
    </header>
  )
}

export default HeaderCard
