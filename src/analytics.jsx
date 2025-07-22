import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Activity, RefreshCw,  Loader2,  } from "lucide-react"
import { useTheme } from "./ThemeContext"

// Import utility functions
import {
  getTargetAmounts,
  calculatePerformance,
  calculateTargetProgress,
  calculateDrawdownMetrics
} from "@/lib/utils"

// Import the new analytics section components
import {
  ObjectivesSection,
  TradeDataSection,
  DailyAnalysisSection,
  EquityCurveSection,
  TradingPerformanceSection
} from "./components/analytics"

import TradingActivityCard from "./components/cards/TradingActivityCard"


const AnalyticsView = React.forwardRef(({ config, accountData }, ref) => {
  const { isDark, toggleTheme } = useTheme()
  // Read data directly from Chrome extension storage or localStorage
  const getStorageData = () => {
    return new Promise((resolve) => {
      try {
        // Try Chrome extension storage first
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage({ type: 'GET_ACCOUNT_DATA' }, (response) => {
            if (response && response.data) {
              console.log('Analytics: Extension storage data:', response.data)
              resolve(response.data)
            } else {
              console.log('Analytics: No extension storage data, trying localStorage')
              // Fallback to localStorage
              try {
                const stored = localStorage.getItem('tradeAnalytics_accountData')
                console.log('Analytics: Raw localStorage data:', stored)
                if (stored) {
                  const parsed = JSON.parse(stored)
                  console.log('Analytics: Parsed localStorage data:', parsed)
                  resolve(parsed)
                } else {
                  resolve(null)
                }
              } catch (error) {
                console.error('Analytics: Error reading localStorage:', error)
                resolve(null)
              }
            }
          })
        } else {
          // Fallback to localStorage if not in extension context
          try {
            const stored = localStorage.getItem('tradeAnalytics_accountData')
            console.log('Analytics: Raw localStorage data:', stored)
            if (stored) {
              const parsed = JSON.parse(stored)
              console.log('Analytics: Parsed localStorage data:', parsed)
              resolve(parsed)
            } else {
              resolve(null)
            }
          } catch (error) {
            console.error('Analytics: Error reading localStorage:', error)
            resolve(null)
          }
        }
      } catch (error) {
        console.error('Analytics: Error in getStorageData:', error)
        resolve(null)
      }
    })
  }

  // State for storage data
  const [storageData, setStorageData] = useState(null)
  const [loading, setLoading] = useState(false)
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
    getStorageData().then(data => {
      setStorageData(data)
    })
    // Load trades from chrome.storage.local (main source of truth)
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get('fxreplay_trade_data', (result) => {
        if (result && result.fxreplay_trade_data && Array.isArray(result.fxreplay_trade_data.trades)) {
          setExtractedTrades(result.fxreplay_trade_data.trades)
        } else {
          setExtractedTrades([])
        }
      })
    }
    // Set up Chrome extension message listener for trade data
    const handleTradeDataUpdate = (message, sender, sendResponse) => {
      if (message.type === 'TRADE_DATA_UPDATED') {
        console.log('Trade data updated via extension:', message.data)
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.get('fxreplay_trade_data', (result) => {
            if (result && result.fxreplay_trade_data && Array.isArray(result.fxreplay_trade_data.trades)) {
              setExtractedTrades(result.fxreplay_trade_data.trades)
            } else {
              setExtractedTrades([])
            }
          })
        }
      }
    }
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener(handleTradeDataUpdate)
    }

    return () => {
      try {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
          chrome.runtime.onMessage.removeListener(handleTradeDataUpdate)
        }
      } catch (error) {
        console.error('Error during cleanup:', error)
      }
    }
  }, [])
  
  // Use storage data if available, otherwise fall back to props
  const displayData = storageData || accountData
  
  console.log('Analytics: Using display data:', displayData)
  console.log('Analytics: Props accountData:', accountData)


  const targetAmounts = getTargetAmounts(config?.profitTargets || { phase1: 10 }, displayData.capital)

  // Calculate performance metrics using tracked data
  const { percentage: performancePercentage, initialCapital } = calculatePerformance(displayData)

  // Calculate progress towards targets
  const targetProgress = calculateTargetProgress(config?.profitTargets || { phase1: 10 }, displayData.capital, displayData.realizedPnL)

  const maxDrawdown = config.maxDrawdown || 5
  const dailyDrawdown = config.dailyDrawdown || 2

  // Calculate drawdown metrics using utility function
  const {
    maxDrawdownProgress,
    dailyDrawdownProgress,
    profitableDays,
    tradingDays
  } = calculateDrawdownMetrics(extractedTrades, initialCapital, maxDrawdown, dailyDrawdown)

  // Show loading state if data is not ready
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-gray-600 dark:text-gray-400">Loading analytics data...</span>
        </div>
      </div>
    )
  }

  // Show message if no data is available
  if (!displayData || !displayData.capital) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="text-gray-600 dark:text-gray-400 mb-4">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Trading Data Available</h3>
            <p className="text-sm">Please ensure you're on the FxReplay website and have trading data loaded.</p>
          </div>
        </div>
      </div>
    )
  }



  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2/3: Objectives + Equity Curve + Trade History */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <ObjectivesSection
            config={config || { profitTargets: { phase1: 10 }, maxDrawdown: 5, dailyDrawdown: 2 }}
            targetAmounts={targetAmounts}
            targetProgress={targetProgress}
            dailyDrawdown={dailyDrawdown}
            dailyDrawdownProgress={dailyDrawdownProgress}
            maxDrawdown={maxDrawdown}
            maxDrawdownProgress={maxDrawdownProgress}
            tradingDays={tradingDays}
            profitableDays={profitableDays}
          />
          <EquityCurveSection displayData={displayData} extractedTrades={extractedTrades} />
          <TradeDataSection extractedTrades={extractedTrades} displayData={displayData} />
        </div>
        {/* Right 1/3: Trading Activity on top, then Trading Performance Metrics, then Daily Analysis */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <TradingActivityCard
            minTradingDays={config.minTradingDays || 0}
            tradingDays={tradingDays}
            minProfitableDays={config.requireProfitableDays || 0}
            profitableDays={profitableDays}
          />
          <TradingPerformanceSection extractedTrades={extractedTrades} displayData={displayData} config={config} />
          <DailyAnalysisSection extractedTrades={extractedTrades} />
        </div>
      </div>
    </div>
  )
})

export default AnalyticsView