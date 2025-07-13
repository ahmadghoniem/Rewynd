import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingUp, DollarSign, Activity, AlertCircle, RefreshCw, Sun, Moon, Loader2 } from "lucide-react"
import { useTheme } from "./ThemeContext"

const AnalyticsView = ({ config, onBack, accountData }) => {
  const { isDark, toggleTheme } = useTheme()
  // Read data directly from Chrome extension storage or localStorage
  const getStorageData = () => {
    return new Promise((resolve) => {
      // Try Chrome extension storage first
      if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
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
    })
  }

  // State for storage data
  const [storageData, setStorageData] = useState(null)
  const [loading, setLoading] = useState(false)
  
  // Load storage data on component mount
  useEffect(() => {
    getStorageData().then(data => {
      setStorageData(data)
    })
  }, [])
  
  // Use storage data if available, otherwise fall back to props
  const displayData = storageData || accountData
  
  console.log('Analytics: Using display data:', displayData)
  console.log('Analytics: Props accountData:', accountData)

  const handleRefresh = async () => {
    console.log('Manual refresh triggered')
    
    // Force the content script to re-extract data
    if (chrome && chrome.tabs && chrome.tabs.query) {
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
  }




  const getTotalProfitTarget = () => {
    return Object.values(config.profitTargets).reduce(
      (sum, target) => sum + target,
      0
    )
  }

  const getTargetAmounts = () => {
    const amounts = {}
    Object.entries(config.profitTargets).forEach(([phase, percentage]) => {
      amounts[phase] = (displayData.capital * percentage) / 100
    })
    return amounts
  }

  const targetAmounts = getTargetAmounts()
  const totalTargetAmount = (displayData.capital * getTotalProfitTarget()) / 100
  const maxDrawdownAmount = (displayData.capital * config.maxDrawdown) / 100
  const dailyDrawdownAmount = (displayData.capital * config.dailyDrawdown) / 100

  // Calculate performance metrics using tracked data
  const calculatePerformance = () => {
    console.log('Calculating performance with displayData:', displayData)
    
    if (!displayData.capital || displayData.realizedPnL === undefined || displayData.realizedPnL === null) {
      console.log('Missing capital or P&L data')
      return { percentage: 0, initialCapital: displayData.capital || 5000 }
    }
    
    const initialCapital = displayData.capital
    const performancePercentage = initialCapital > 0 ? (displayData.realizedPnL / initialCapital) * 100 : 0
    
    console.log('Performance calculation:', {
      currentBalance: displayData.balance,
      capital: displayData.capital,
      realizedPnL: displayData.realizedPnL,
      initialCapital,
      performancePercentage
    })
    
    return { percentage: performancePercentage, initialCapital }
  }

  const { percentage: performancePercentage, initialCapital } = calculatePerformance()

  // Calculate progress towards targets
  const calculateTargetProgress = () => {
    const progress = {}
    Object.entries(config.profitTargets).forEach(([phase, target]) => {
      const targetAmount = (displayData.capital * target) / 100
      const realizedPnL = displayData.realizedPnL || 0
      const progressPercentage = targetAmount > 0 ? (realizedPnL / targetAmount) * 100 : 0
      progress[phase] = Math.min(100, Math.max(0, progressPercentage))
    })
    
    console.log('Target progress calculation:', progress)
    return progress
  }

  const targetProgress = calculateTargetProgress()

  // Calculate drawdown status
  const calculateDrawdownStatus = () => {
    const maxDrawdown = (displayData.capital * config.maxDrawdown) / 100
    const dailyDrawdown = (displayData.capital * config.dailyDrawdown) / 100
    const realizedPnL = displayData.realizedPnL || 0
    
    const status = {
      maxDrawdownRemaining: maxDrawdown + (realizedPnL < 0 ? realizedPnL : 0),
      dailyDrawdownRemaining: dailyDrawdown,
      isAtRisk: realizedPnL < -maxDrawdown * 0.8, // Warning at 80% of max drawdown
      isBreached: realizedPnL < -maxDrawdown // Breached max drawdown
    }
    
    console.log('Drawdown status:', status)
    return status
  }

  const drawdownStatus = calculateDrawdownStatus()

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatLastUpdated = (timestamp) => {
    if (!timestamp) return 'Never'
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const getStatusColor = (value) => {
    if (value > 0) return 'text-green-600'
    if (value < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getStatusBadge = (value) => {
    if (value > 0) return 'default'
    if (value < 0) return 'destructive'
    return 'secondary'
  }

  return (
    <Card className="w-full max-w-sm bg-[var(--gray-1)] dark:bg-[var(--gray-11)] border-[var(--gray-6)] dark:border-[var(--gray-8)] shadow-lg dark:shadow-[var(--gray-12)]/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between text-[var(--gray-12)] dark:text-[var(--gray-1)]">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            Challenge Analytics
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                setLoading(true)
                await handleRefresh()
                setLoading(false)
              }}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Refresh data"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-[var(--gray-12)] dark:text-[var(--gray-1)]">
        {/* Live Account Status */}
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Initial Capital:</span>
            </div>
            <span className="text-sm font-bold text-green-600 dark:text-green-400">
              {formatCurrency(displayData.capital)}
            </span>
          </div>

          <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Balance:</span>
            </div>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(displayData.balance)}
            </span>
          </div>

          {/* Realized P&L Section */}
          <div className="flex justify-center">
            <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-1 mb-1">
                {displayData.realizedPnL >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-red-500 dark:text-red-400 transform rotate-180" />
                )}
                <span className={`text-xs ${displayData.realizedPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                  Realized P&L
                </span>
              </div>
              <span className={`text-sm font-bold ${getStatusColor(displayData.realizedPnL || 0)}`}>
                {formatCurrency(displayData.realizedPnL || 0)}
              </span>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Performance:</span>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusBadge(performancePercentage)}>
                {performancePercentage >= 0 ? "+" : ""}{performancePercentage.toFixed(2)}%
              </Badge>
              <span className={`text-sm font-bold ${getStatusColor(displayData.realizedPnL || 0)}`}>
                {formatCurrency(displayData.realizedPnL || 0)}
              </span>
            </div>
          </div>

          {/* Drawdown Warning */}
          {drawdownStatus.isBreached && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
              <span className="text-sm text-red-500 dark:text-red-400 font-medium">
                Max drawdown limit breached! Evaluation failed.
              </span>
            </div>
          )}
          {drawdownStatus.isAtRisk && !drawdownStatus.isBreached && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                Approaching max drawdown limit!
              </span>
            </div>
          )}
        </div>

        {/* Challenge Configuration */}
        <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Challenge Type:</span>
            <Badge variant="secondary">{config.phases} Phase{config.phases > 1 ? 's' : ''}</Badge>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Profit Targets:</span>
            {Object.entries(config.profitTargets).map(([phase, target]) => (
              <div key={phase} className="space-y-1">
                <div className="flex justify-between items-center pl-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {phase.charAt(0).toUpperCase() + phase.slice(1).replace(/(\d)/, " $1")}:
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{target}%</Badge>
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                      {formatCurrency(targetAmounts[phase])}
                    </span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="pl-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, targetProgress[phase])}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {targetProgress[phase].toFixed(1)}% complete
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Max Drawdown:</span>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">{config.maxDrawdown}%</Badge>
                  <span className="text-sm text-red-500 dark:text-red-400 font-medium">
                    {formatCurrency(maxDrawdownAmount)}
                  </span>
                </div>
              </div>
              
              {/* Max Drawdown Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    Math.abs(displayData.realizedPnL || 0) / maxDrawdownAmount >= 1 
                      ? 'bg-red-500' 
                      : Math.abs(displayData.realizedPnL || 0) / maxDrawdownAmount >= 0.8 
                        ? 'bg-yellow-500' 
                        : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, (Math.abs(displayData.realizedPnL || 0) / maxDrawdownAmount) * 100)}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {((Math.abs(displayData.realizedPnL || 0) / maxDrawdownAmount) * 100).toFixed(1)}% used
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Daily Drawdown:</span>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">{config.dailyDrawdown}%</Badge>
                  <span className="text-sm text-red-500 dark:text-red-400 font-medium">
                    {formatCurrency(dailyDrawdownAmount)}
                  </span>
                </div>
              </div>
              
              {/* Daily Drawdown Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    Math.abs(displayData.realizedPnL || 0) / dailyDrawdownAmount >= 1 
                      ? 'bg-red-500' 
                      : Math.abs(displayData.realizedPnL || 0) / dailyDrawdownAmount >= 0.8 
                        ? 'bg-yellow-500' 
                        : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, (Math.abs(displayData.realizedPnL || 0) / dailyDrawdownAmount) * 100)}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {((Math.abs(displayData.realizedPnL || 0) / dailyDrawdownAmount) * 100).toFixed(1)}% used
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Drawdown Type:</span>
            <Badge variant="outline">
              {config.isTrailing ? "Trailing" : "Static"}
            </Badge>
          </div>
        </div>

        {/* Data Status */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center border-t border-gray-200 dark:border-gray-700 pt-2">
          <div>Data last updated: {formatLastUpdated(displayData.lastUpdated)}</div>
          <div className="mt-1">
            Initial Capital: {formatCurrency(displayData.capital)}
          </div>
        </div>

        <Button onClick={onBack} variant="outline" className="w-full hover:bg-gray-100 dark:hover:bg-gray-700">
          Modify Configuration
        </Button>
      </CardContent>
    </Card>
  )
}

export default AnalyticsView