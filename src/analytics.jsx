import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingUp, DollarSign, Activity, RefreshCw, Sun, Moon, Loader2, Target, Calendar, TrendingDown } from "lucide-react"
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
  AnalyticsOverviewSection
} from "./components/analytics"

const AnalyticsView = ({ config, accountData }) => {
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

  // Load storage data on component mount
  useEffect(() => {
    getStorageData().then(data => {
      setStorageData(data)
    })
    
    // Set up Chrome extension message listener for trade data
    const handleTradeDataUpdate = (message, sender, sendResponse) => {
      if (message.type === 'TRADE_DATA_UPDATED') {
        console.log('Trade data updated via extension:', message.data)
        setExtractedTrades(message.data.trades || [])
      }
    }
    
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener(handleTradeDataUpdate)
    }
    
    // Listen for global refresh event
    const handleGlobalRefresh = () => {
      handleRefresh()
    }
    window.addEventListener('analyticsRefresh', handleGlobalRefresh)
    return () => {
      try {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
          chrome.runtime.onMessage.removeListener(handleTradeDataUpdate)
        }
        window.removeEventListener('analyticsRefresh', handleGlobalRefresh)
      } catch (error) {
        console.error('Error during cleanup:', error)
      }
    }
  }, [])
  
  // Use storage data if available, otherwise fall back to props
  const displayData = storageData || accountData || {
    balance: 5000,
    realizedPnL: 0,
    capital: 5000,
    lastUpdated: null
  }
  
  console.log('Analytics: Using display data:', displayData)
  console.log('Analytics: Props accountData:', accountData)

  const handleRefresh = async () => {
    console.log('Manual refresh triggered')
    
    try {
      // Force the content script to re-extract data
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          if (tabs[0] && tabs[0].url && tabs[0].url.includes('fxreplay.com')) {
            chrome.tabs.sendMessage(tabs[0].id, {type: 'FORCE_REFRESH'}, function(response) {
              console.log('Force refresh sent to content script')
            })
          }
        })
      }
      
      // Also refresh data from storage
      const data = await getStorageData()
      setStorageData({...data, lastUpdated: Date.now()})
      console.log('Data refreshed from storage:', data)
    } catch (error) {
      console.error('Error during refresh:', error)
    }
  }

  const targetAmounts = getTargetAmounts(config?.profitTargets || { phase1: 10 }, displayData.capital)

  // Calculate performance metrics using tracked data
  const { percentage: performancePercentage, initialCapital } = calculatePerformance(displayData)

  // Calculate progress towards targets
  const targetProgress = calculateTargetProgress(config?.profitTargets || { phase1: 10 }, displayData.capital, displayData.realizedPnL)

  const maxDrawdown = config.maxDrawdown || 5
  const dailyDrawdown = config.dailyDrawdown || 2

  // Calculate drawdown metrics using utility function
  const {
    maxDrawdownUsed,
    dailyDrawdownUsed,
    dailyPnLMap,
    maxDrawdownProgress,
    dailyDrawdownProgress,
    profitableDays,
    profitableDaysProgress,
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
          <Button onClick={handleRefresh} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Objectives Section */}
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

      {/* Equity Curve & Trading Performance Overview */}
      <AnalyticsOverviewSection
        displayData={displayData}
        extractedTrades={extractedTrades}
      />

      {/* Trading Performance Section */}
      <TradeDataSection extractedTrades={extractedTrades} displayData={displayData} />

      {/* Daily Analysis */}
      <DailyAnalysisSection extractedTrades={extractedTrades} />
    </div>
  )
}

export default AnalyticsView