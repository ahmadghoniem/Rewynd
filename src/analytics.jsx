import React, { useState, useEffect } from "react"
import { Activity, Loader2 } from "lucide-react"
import { useTheme } from "./ThemeContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Import utility functions
import {
  getTargetAmounts,
  calculatePerformance,
  calculateTargetProgress,
  calculateDrawdownMetrics
} from "@/lib/utils"

// Import the new analytics section components
import {
  DailyRecapSection,
  EquityCurveSection,
  TradingPerformanceSection,
  TradeHistorySection
} from "./components/analytics"

import PerformanceSection from "@/components/analytics/PerformanceSection.jsx"

const AnalyticsView = React.forwardRef(({ config, accountData }, ref) => {
  const { isDark, toggleTheme } = useTheme()
  // Read data directly from Chrome extension storage or localStorage
  const getStorageData = () => {
    return new Promise((resolve) => {
      try {
        // Try Chrome extension storage first
        if (
          typeof chrome !== "undefined" &&
          chrome.runtime &&
          chrome.runtime.sendMessage
        ) {
          chrome.runtime.sendMessage(
            { type: "GET_ACCOUNT_DATA" },
            (response) => {
              if (response && response.data) {
                console.log("Analytics: Extension storage data:", response.data)
                resolve(response.data)
              } else {
                console.log(
                  "Analytics: No extension storage data, trying localStorage"
                )
                // Fallback to localStorage
                try {
                  const stored = localStorage.getItem(
                    "tradeAnalytics_accountData"
                  )
                  console.log("Analytics: Raw localStorage data:", stored)
                  if (stored) {
                    const parsed = JSON.parse(stored)
                    console.log("Analytics: Parsed localStorage data:", parsed)
                    resolve(parsed)
                  } else {
                    resolve(null)
                  }
                } catch (error) {
                  console.error("Analytics: Error reading localStorage:", error)
                  resolve(null)
                }
              }
            }
          )
        } else {
          // Fallback to localStorage if not in extension context
          try {
            const stored = localStorage.getItem("tradeAnalytics_accountData")
            console.log("Analytics: Raw localStorage data:", stored)
            if (stored) {
              const parsed = JSON.parse(stored)
              console.log("Analytics: Parsed localStorage data:", parsed)
              resolve(parsed)
            } else {
              resolve(null)
            }
          } catch (error) {
            console.error("Analytics: Error reading localStorage:", error)
            resolve(null)
          }
        }
      } catch (error) {
        console.error("Analytics: Error in getStorageData:", error)
        resolve(null)
      }
    })
  }

  // State for storage data
  const [storageData, setStorageData] = useState(null)
  const [extractedTrades, setExtractedTrades] = useState([])

  // Expose addExampleTrades via ref
  React.useImperativeHandle(ref, () => ({
    addExampleTrades: (data) => {
      if (data && Array.isArray(data.trades)) {
        setExtractedTrades(data.trades)
      }
    }
  }))

  // Load storage data on component mount
  useEffect(() => {
    getStorageData().then((data) => {
      setStorageData(data)
    })
    // Load trades from chrome.storage.local (main source of truth)
    if (
      typeof chrome !== "undefined" &&
      chrome.storage &&
      chrome.storage.local
    ) {
      chrome.storage.local.get("fxreplay_trade_data", (result) => {
        if (
          result &&
          result.fxreplay_trade_data &&
          Array.isArray(result.fxreplay_trade_data.trades)
        ) {
          setExtractedTrades(result.fxreplay_trade_data.trades)
        } else {
          setExtractedTrades([])
        }
      })
    }
    // Set up Chrome extension message listener for trade data
    const handleTradeDataUpdate = (message, sender, sendResponse) => {
      if (message.type === "TRADE_DATA_UPDATED") {
        console.log("Trade data updated via extension:", message.data)
        if (
          typeof chrome !== "undefined" &&
          chrome.storage &&
          chrome.storage.local
        ) {
          chrome.storage.local.get("fxreplay_trade_data", (result) => {
            if (
              result &&
              result.fxreplay_trade_data &&
              Array.isArray(result.fxreplay_trade_data.trades)
            ) {
              setExtractedTrades(result.fxreplay_trade_data.trades)
            } else {
              setExtractedTrades([])
            }
          })
        }
      }
    }
    if (
      typeof chrome !== "undefined" &&
      chrome.runtime &&
      chrome.runtime.onMessage
    ) {
      chrome.runtime.onMessage.addListener(handleTradeDataUpdate)
    }

    return () => {
      try {
        if (
          typeof chrome !== "undefined" &&
          chrome.runtime &&
          chrome.runtime.onMessage
        ) {
          chrome.runtime.onMessage.removeListener(handleTradeDataUpdate)
        }
      } catch (error) {
        console.error("Error during cleanup:", error)
      }
    }
  }, [])

  // Use storage data if available, otherwise fall back to props
  const displayData = storageData || accountData

  const targetAmounts = getTargetAmounts(
    config?.profitTargets || { phase1: 10 },
    displayData.capital
  )

  // Calculate performance metrics using tracked data
  const { percentage: performancePercentage, initialCapital } =
    calculatePerformance(displayData)

  // Calculate progress towards targets
  const targetProgress = calculateTargetProgress(
    config?.profitTargets || { phase1: 10 },
    displayData.capital,
    displayData.realizedPnL
  )

  const maxDrawdown = config.maxDrawdown || 5
  const dailyDrawdown = config.dailyDrawdown || 2

  // Calculate drawdown metrics using utility function
  const {
    maxDrawdownProgress,
    dailyDrawdownProgress,
    profitableDays,
    tradingDays
  } = calculateDrawdownMetrics(
    extractedTrades,
    initialCapital,
    maxDrawdown,
    dailyDrawdown
  )

  // Helper for formatting currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2
    }).format(amount)
  }

  // Calculate stats using useMemo for efficiency
  const stats = React.useMemo(() => {
    if (!extractedTrades || extractedTrades.length === 0)
      return {
        averageRR: 0,
        averageProfit: 0,
        averageLoss: 0,
        worstLoss: 0,
        bestWin: 0,
        tradesPerDay: 0,
        averageDuration: 0,
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        profitFactor: 0,
        sharpeRatio: 0,
        maxConsecutiveWins: 0,
        maxConsecutiveLosses: 0
      }
    const trades = extractedTrades.map((trade) => {
      const realized = parseFloat(trade.realized?.replace(/[$,]/g, "") || "0")
      const maxRR = parseFloat(trade.maxRR || "0")
      const duration = parseDuration(trade.duration)
      const date = new Date(trade.dateStart)
      return {
        realized,
        maxRR,
        duration,
        date,
        isWin: realized > 0,
        isLoss: realized < 0
      }
    })
    const winningTrades = trades.filter((t) => t.isWin)
    const losingTrades = trades.filter((t) => t.isLoss)
    const averageRR =
      trades.reduce((sum, t) => sum + t.maxRR, 0) / trades.length
    const averageProfit =
      winningTrades.length > 0
        ? winningTrades.reduce((sum, t) => sum + t.realized, 0) /
          winningTrades.length
        : 0
    const averageLoss =
      losingTrades.length > 0
        ? losingTrades.reduce((sum, t) => sum + t.realized, 0) /
          losingTrades.length
        : 0
    const bestWin =
      winningTrades.length > 0
        ? Math.max(...winningTrades.map((t) => t.realized))
        : 0
    const worstLoss =
      losingTrades.length > 0
        ? Math.min(...losingTrades.map((t) => t.realized))
        : 0
    const uniqueDays = new Set(trades.map((t) => t.date.toDateString())).size
    const tradesPerDay = uniqueDays > 0 ? trades.length / uniqueDays : 0
    const averageDuration =
      trades.reduce((sum, t) => sum + t.duration, 0) / trades.length
    const totalProfit = winningTrades.reduce((sum, t) => sum + t.realized, 0)
    const totalLoss = Math.abs(
      losingTrades.reduce((sum, t) => sum + t.realized, 0)
    )
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : 0
    const returns = trades.map((t) => t.realized)
    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
    const variance =
      returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) /
      returns.length
    const standardDeviation = Math.sqrt(variance)
    const sharpeRatio =
      standardDeviation > 0 ? meanReturn / standardDeviation : 0
    let maxConsecutiveWins = 0
    let maxConsecutiveLosses = 0
    let currentWins = 0
    let currentLosses = 0
    const sortedByDate = [...trades].sort((a, b) => a.date - b.date)
    for (let i = 0; i < sortedByDate.length; i++) {
      if (sortedByDate[i].isWin) {
        currentWins++
        currentLosses = 0
      } else if (sortedByDate[i].isLoss) {
        currentLosses++
        currentWins = 0
      } else {
        currentWins = 0
        currentLosses = 0
      }
      if (currentWins > maxConsecutiveWins) maxConsecutiveWins = currentWins
      if (currentLosses > maxConsecutiveLosses)
        maxConsecutiveLosses = currentLosses
    }
    return {
      averageRR: averageRR || 0,
      averageProfit: averageProfit || 0,
      averageLoss: averageLoss || 0,
      worstLoss: worstLoss || 0,
      bestWin: bestWin || 0,
      tradesPerDay: tradesPerDay || 0,
      averageDuration: averageDuration || 0,
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate:
        trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0,
      profitFactor: profitFactor || 0,
      sharpeRatio: sharpeRatio || 0,
      maxConsecutiveWins,
      maxConsecutiveLosses
    }
  }, [extractedTrades])

  function parseDuration(durationStr) {
    if (!durationStr) return 0
    const match = durationStr.match(/(?:(\d+)h\s*)?(?:(\d+)m)?/)
    if (match) {
      const hours = parseInt(match[1] || "0")
      const minutes = parseInt(match[2] || "0")
      return hours * 60 + minutes
    }
    return 0
  }

  // Show loading state if data is not ready
  if (!displayData || !displayData.capital) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="dark:text-primary mb-4">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">
              No Trading Data Available
            </h3>
            <p className="text-sm">
              Please ensure you're on the FxReplay website and have trading data
              loaded.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-8">
      <div className="grid grid-cols-1 gap-4 lg:[grid-template-columns:75%_25%]">
        <div className="flex flex-col gap-4">
          {/* will be stats */}
          <PerformanceSection
            displayData={displayData}
            extractedTrades={extractedTrades}
            stats={stats}
            formatCurrency={formatCurrency}
          />
          <EquityCurveSection
            displayData={displayData}
            extractedTrades={extractedTrades}
          />
          <TradeHistorySection
            extractedTrades={extractedTrades}
            displayData={displayData}
          />
        </div>
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>objectives</CardHeader>
          </Card>
          <TradingPerformanceSection
            extractedTrades={extractedTrades}
            displayData={displayData}
            config={config}
          />
          <DailyRecapSection extractedTrades={extractedTrades} />
        </div>
      </div>
    </div>
  )
})

export default AnalyticsView
{
  /* <WinsSummaryCard stats={stats} formatCurrency={formatCurrency} />
<LossesSummaryCard stats={stats} formatCurrency={formatCurrency} /> */
}
