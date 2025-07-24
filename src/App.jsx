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

  // --- Add this state to hold a reference to AnalyticsView's setExtractedTrades ---
  const analyticsRef = React.useRef(null)

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

  // Handler for fetching all trades from all pages
  const handleFetchAllTrades = () => {
    if (window.chrome && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const fxReplayTab = tabs[0]
        if (
          fxReplayTab &&
          fxReplayTab.url &&
          fxReplayTab.url.includes("fxreplay.com")
        ) {
          chrome.tabs.sendMessage(
            fxReplayTab.id,
            { type: "EXTRACT_TRADES" },
            (response) => {
              console.log("Fetch All Trades response:", response)
              if (response && response.success) {
                alert("All trades fetched and saved!")
              } else {
                alert(
                  "Failed to fetch trades. Make sure you are on the FxReplay site."
                )
              }
            }
          )
        } else {
          alert(
            "Please open this extension while on fxreplay.com to fetch trades."
          )
        }
      })
    } else {
      alert("Chrome extension messaging not available.")
    }
  }

  // --- Handler to add provided sample data ---
  const handleAddSampleData = () => {
    const sampleData = {
      lastUpdated: 1753146078097,
      trades: [
        {
          asset: "BTCUSD",
          closeAvg: "102901.91000",
          commission: "$0.00",
          dateEnd: "6/06/25, 5:08 AM",
          dateStart: "6/06/25, 2:03 AM",
          entry: "101802.91000",
          initialSL: "101080.29",
          maxRR: "1.52",
          maxTP: "102901.89",
          page: 1,
          realized: "$32.97",
          rowIndex: 0,
          side: "buy",
          size: "0.03 lot"
        },
        {
          asset: "BTCUSD",
          closeAvg: "104806.45500",
          commission: "$0.00",
          dateEnd: "6/05/25, 5:40 AM",
          dateStart: "6/05/25, 5:16 AM",
          entry: "105054.08000",
          initialSL: "104806.41",
          maxRR: "Loss",
          maxTP: "",
          page: 1,
          realized: "-$19.81",
          rowIndex: 1,
          side: "buy",
          size: "0.08 lot"
        },
        {
          asset: "BTCUSD",
          closeAvg: "104726.06333",
          commission: "$0.00",
          dateEnd: "6/04/25, 8:15 PM",
          dateStart: "6/04/25, 5:50 PM",
          entry: "105039.23000",
          initialSL: "104726.1",
          maxRR: "Loss",
          maxTP: "",
          page: 1,
          realized: "-$18.79",
          rowIndex: 2,
          side: "buy",
          size: "0.06 lot"
        },
        {
          asset: "BTCUSD",
          closeAvg: "105098.99000",
          commission: "$0.00",
          dateEnd: "6/04/25, 3:06 PM",
          dateStart: "6/04/25, 2:20 PM",
          entry: "104594.99000",
          initialSL: "104281.86",
          maxRR: "1.61",
          maxTP: "105099.05",
          page: 1,
          realized: "$30.24",
          rowIndex: 3,
          side: "buy",
          size: "0.06 lot"
        },
        {
          asset: "BTCUSD",
          closeAvg: "105159.44273",
          commission: "$0.00",
          dateEnd: "6/04/25, 1:20 PM",
          dateStart: "6/04/25, 1:09 PM",
          entry: "104967.17000",
          initialSL: "104792.21",
          maxRR: "1.1",
          maxTP: "105159.44",
          page: 1,
          realized: "$21.15",
          rowIndex: 4,
          side: "buy",
          size: "0.11 lot"
        },
        {
          asset: "BTCUSD",
          closeAvg: "105075.36000",
          commission: "$0.00",
          dateEnd: "6/04/25, 12:00 PM",
          dateStart: "6/04/25, 11:35 AM",
          entry: "105250.36000",
          initialSL: "105075.4",
          maxRR: "Loss",
          maxTP: "",
          page: 1,
          realized: "-$19.25",
          rowIndex: 5,
          side: "buy",
          size: "0.11 lot"
        },
        {
          asset: "BTCUSD",
          closeAvg: "105201.27000",
          commission: "$0.00",
          dateEnd: "6/04/25, 12:40 AM",
          dateStart: "6/03/25, 9:56 PM",
          entry: "105529.77000",
          initialSL: "105201.23",
          maxRR: "Loss",
          maxTP: "",
          page: 1,
          realized: "-$19.71",
          rowIndex: 6,
          side: "buy",
          size: "0.06 lot"
        },
        {
          asset: "BTCUSD",
          closeAvg: "105617.77000",
          commission: "$0.00",
          dateEnd: "6/03/25, 8:30 PM",
          dateStart: "6/03/25, 8:21 PM",
          entry: "105946.27000",
          initialSL: "105617.73",
          maxRR: "Loss",
          maxTP: "",
          page: 1,
          realized: "-$19.71",
          rowIndex: 7,
          side: "buy",
          size: "0.06 lot"
        },
        {
          asset: "BTCUSD",
          closeAvg: "105630.73000",
          commission: "$0.00",
          dateEnd: "6/03/25, 6:18 PM",
          dateStart: "6/03/25, 4:42 PM",
          entry: "106266.03000",
          initialSL: "105630.73",
          maxRR: "Loss",
          maxTP: "",
          page: 1,
          realized: "-$63.53",
          rowIndex: 8,
          side: "buy",
          size: "0.1 lot"
        },
        {
          asset: "BTCUSD",
          closeAvg: "106391.38000",
          commission: "$0.00",
          dateEnd: "6/03/25, 4:26 PM",
          dateStart: "6/03/25, 3:33 PM",
          entry: "106649.86000",
          initialSL: "106391.37",
          maxRR: "Loss",
          maxTP: "",
          page: 1,
          realized: "-$64.62",
          rowIndex: 9,
          side: "buy",
          size: "0.25 lot"
        },
        {
          asset: "BTCUSD",
          closeAvg: "105760.27222",
          commission: "$0.00",
          dateEnd: "6/03/25, 2:20 PM",
          dateStart: "6/03/25, 10:39 AM",
          entry: "105393.05000",
          initialSL: "105760.25",
          maxRR: "Loss",
          maxTP: "",
          page: 2,
          realized: "-$66.10",
          rowIndex: 0,
          side: "sell",
          size: "0.18 lot"
        },
        {
          asset: "BTCUSD",
          closeAvg: "105369.21333",
          commission: "$0.00",
          dateEnd: "6/03/25, 4:10 AM",
          dateStart: "6/03/25, 3:06 AM",
          entry: "105570.88000",
          initialSL: "105369.2",
          maxRR: "Loss",
          maxTP: "",
          page: 2,
          realized: "-$66.55",
          rowIndex: 1,
          side: "buy",
          size: "0.33 lot"
        },
        {
          asset: "BTCUSD",
          closeAvg: "104711.75789",
          commission: "$0.00",
          dateEnd: "6/02/25, 9:34 PM",
          dateStart: "6/02/25, 9:11 PM",
          entry: "105049.60000",
          initialSL: "104711.76",
          maxRR: "Loss",
          maxTP: "",
          page: 2,
          realized: "-$64.19",
          rowIndex: 2,
          side: "buy",
          size: "0.19 lot"
        },
        {
          asset: "BTCUSD",
          closeAvg: "105025.30000",
          commission: "$0.00",
          dateEnd: "6/02/25, 9:02 PM",
          dateStart: "6/02/25, 8:20 PM",
          entry: "104812.30000",
          initialSL: "104652.72",
          maxRR: "1.33",
          maxTP: "105025.3",
          page: 2,
          realized: "$225.78",
          rowIndex: 3,
          side: "buy",
          size: "1.06 lots"
        },
        {
          asset: "BTCUSD",
          closeAvg: "104228.84593",
          commission: "$0.00",
          dateEnd: "6/02/25, 7:40 PM",
          dateStart: "6/02/25, 6:36 PM",
          entry: "104388.43000",
          initialSL: "104228.85",
          maxRR: "Loss",
          maxTP: "",
          page: 2,
          realized: "-$180.33",
          rowIndex: 4,
          side: "buy",
          size: "1.13 lots"
        },
        {
          asset: "BTCUSD",
          closeAvg: "104228.84593",
          commission: "$0.00",
          dateEnd: "6/02/25, 7:40 PM",
          dateStart: "6/02/25, 6:36 PM",
          entry: "104388.43000",
          initialSL: "104228.85",
          maxRR: "Loss",
          maxTP: "",
          page: 2,
          realized: "-$180.33",
          rowIndex: 5,
          side: "buy",
          size: "1.13 lots"
        },
        {
          asset: "BTCUSD",
          closeAvg: "104396.53558",
          commission: "$0.00",
          dateEnd: "6/02/25, 6:35 PM",
          dateStart: "6/02/25, 6:32 PM",
          entry: "104556.12000",
          initialSL: "104396.54",
          maxRR: "Loss",
          maxTP: "",
          page: 2,
          realized: "-$122.88",
          rowIndex: 6,
          side: "buy",
          size: "0.77 lot"
        },
        {
          asset: "BTCUSD",
          closeAvg: "104730.13941",
          commission: "$0.00",
          dateEnd: "6/02/25, 6:26 PM",
          dateStart: "6/02/25, 3:03 PM",
          entry: "104031.61000",
          initialSL: "103679.84",
          maxRR: "1.99",
          maxTP: "104730.15",
          page: 2,
          realized: "$237.50",
          rowIndex: 7,
          side: "buy",
          size: "0.34 lot"
        },
        {
          asset: "BTCUSD",
          closeAvg: "104069.43625",
          commission: "$0.00",
          dateEnd: "6/02/25, 2:49 PM",
          dateStart: "6/02/25, 2:30 PM",
          entry: "104448.03000",
          initialSL: "104069.45",
          maxRR: "Loss",
          maxTP: "",
          page: 2,
          realized: "-$121.15",
          rowIndex: 8,
          side: "buy",
          size: "0.32 lot"
        },
        {
          asset: "BTCUSD",
          closeAvg: "104519.01613",
          commission: "$0.00",
          dateEnd: "6/02/25, 2:26 PM",
          dateStart: "6/02/25, 2:02 PM",
          entry: "103856.50000",
          initialSL: "103477.92",
          maxRR: "1.75",
          maxTP: "104519",
          page: 2,
          realized: "$205.38",
          rowIndex: 9,
          side: "buy",
          size: "0.31 lot"
        },
        {
          asset: "BTCUSD",
          closeAvg: "103872.26935",
          commission: "$0.00",
          dateEnd: "6/02/25, 1:50 PM",
          dateStart: "6/02/25, 12:44 PM",
          entry: "104250.85000",
          initialSL: "103872.27",
          maxRR: "Loss",
          maxTP: "",
          page: 3,
          realized: "-$117.36",
          rowIndex: 0,
          side: "buy",
          size: "0.31 lot"
        },
        {
          asset: "BTCUSD",
          closeAvg: "104332.41000",
          commission: "$0.00",
          dateEnd: "6/02/25, 10:32 AM",
          dateStart: "6/02/25, 9:32 AM",
          entry: "104864.41000",
          initialSL: "105343.19",
          maxRR: "1.11",
          maxTP: "104332.42",
          page: 3,
          realized: "$127.68",
          rowIndex: 1,
          side: "sell",
          size: "0.24 lot"
        },
        {
          asset: "BTCUSD",
          closeAvg: "105831.77214",
          commission: "$0.00",
          dateEnd: "6/02/25, 8:27 AM",
          dateStart: "6/02/25, 8:15 AM",
          entry: "105524.29000",
          initialSL: "105322.36",
          maxRR: "1.52",
          maxTP: "105831.78",
          page: 3,
          realized: "$172.19",
          rowIndex: 2,
          side: "buy",
          size: "0.56 lot"
        },
        {
          asset: "BTCUSD",
          closeAvg: "105464.98597",
          commission: "$0.00",
          dateEnd: "6/02/25, 7:45 AM",
          dateStart: "6/02/25, 6:46 AM",
          entry: "105143.18000",
          initialSL: "104982.28",
          maxRR: "2",
          maxTP: "105464.99",
          page: 3,
          realized: "$215.61",
          rowIndex: 3,
          side: "buy",
          size: "0.67 lot"
        },
        {
          asset: "BTCUSD",
          closeAvg: "104778.69145",
          commission: "$0.00",
          dateEnd: "6/02/25, 4:52 AM",
          dateStart: "6/02/25, 4:25 AM",
          entry: "104939.59000",
          initialSL: "104778.69",
          maxRR: "Loss",
          maxTP: "",
          page: 3,
          realized: "-$111.02",
          rowIndex: 4,
          side: "buy",
          size: "0.69 lot"
        },
        {
          asset: "BTCUSD",
          closeAvg: "104877.21000",
          commission: "$0.00",
          dateEnd: "6/02/25, 3:10 AM",
          dateStart: "6/02/25, 3:00 AM",
          entry: "105038.11000",
          initialSL: "104877.21",
          maxRR: "Loss",
          maxTP: "",
          page: 3,
          realized: "-$112.63",
          rowIndex: 5,
          side: "buy",
          size: "0.7 lot"
        },
        {
          asset: "BTCUSD",
          closeAvg: "104265.83583",
          commission: "$0.00",
          dateEnd: "6/01/25, 8:50 AM",
          dateStart: "6/01/25, 8:49 AM",
          entry: "104010.94000",
          initialSL: "103779.34",
          maxRR: "1.1",
          maxTP: "104265.84",
          page: 3,
          realized: "$122.35",
          rowIndex: 6,
          side: "buy",
          size: "0.48 lot"
        },
        {
          asset: "BTCUSD",
          closeAvg: "104227.52924",
          commission: "$0.00",
          dateEnd: "6/01/25, 8:33 AM",
          dateStart: "6/01/25, 8:32 AM",
          entry: "103757.69000",
          initialSL: "103741.03",
          maxRR: "28.2",
          maxTP: "104227.53",
          page: 3,
          realized: "$1,987.42",
          rowIndex: 7,
          side: "buy",
          size: "4.23 lots"
        },
        {
          asset: "BTCUSD",
          closeAvg: "104280.85074",
          commission: "$0.00",
          dateEnd: "6/01/25, 8:21 AM",
          dateStart: "6/01/25, 8:20 AM",
          entry: "103811.01000",
          initialSL: "103794.35",
          maxRR: "28.2",
          maxTP: "104280.85",
          page: 3,
          realized: "$1,268.57",
          rowIndex: 8,
          side: "buy",
          size: "2.7 lots"
        },
        {
          asset: "BTCUSD",
          closeAvg: "104217.35667",
          commission: "$0.00",
          dateEnd: "6/01/25, 8:07 AM",
          dateStart: "6/01/25, 8:06 AM",
          entry: "103823.34000",
          initialSL: "103756.15",
          maxRR: "5.86",
          maxTP: "104217.36",
          page: 3,
          realized: "$236.41",
          rowIndex: 9,
          side: "buy",
          size: "0.6 lot"
        }
      ],
      url: "https://app.fxreplay.com/en-US/auth/chart/5e95c1ca-5db8-435d-a8b7-1e38494293b1"
    }
    if (analyticsRef.current && analyticsRef.current.addExampleTrades) {
      analyticsRef.current.addExampleTrades(sampleData)
    }
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      {/* Header */}
      <header className="bg-card border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-foreground ">
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
                  {/* Add Sample Data Button */}
                  <Button
                    variant="secondary"
                    onClick={handleAddSampleData}
                    className="flex items-center gap-2"
                  >
                    Sample Data
                  </Button>
                  <span className="text-lg font-bold text-foreground ">
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
            ref={analyticsRef}
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
