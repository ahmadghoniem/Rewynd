import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingUp, DollarSign, Activity, AlertCircle, RefreshCw } from "lucide-react"

const AnalyticsView = ({ config, onBack, accountData }) => {
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

  const handleRefresh = () => {
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
    getStorageData().then(data => {
      setStorageData(data)
      console.log('Data refreshed from storage:', data)
    })
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
      isAtRisk: realizedPnL < -maxDrawdown * 0.8 // Warning at 80% of max drawdown
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
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          Challenge Analytics
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="h-8 w-8 p-0"
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Live Account Status */}
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Account Balance:</span>
            </div>
            <span className="text-lg font-bold text-blue-600">
              {formatCurrency(displayData.balance)}
            </span>
          </div>

          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Initial Capital:</span>
            </div>
            <span className="text-lg font-bold text-green-600">
              {formatCurrency(displayData.capital)}
            </span>
          </div>

          {/* Realized P&L Section */}
          <div className="flex justify-center">
            <div className="flex flex-col items-center p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-1 mb-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-xs text-green-600">Realized P&L</span>
              </div>
              <span className={`text-sm font-bold ${getStatusColor(displayData.realizedPnL || 0)}`}>
                {formatCurrency(displayData.realizedPnL || 0)}
              </span>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">Performance:</span>
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
          {drawdownStatus.isAtRisk && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-600 font-medium">
                Approaching max drawdown limit!
              </span>
            </div>
          )}
        </div>

        {/* Challenge Configuration */}
        <div className="space-y-3 border-t pt-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Challenge Type:</span>
            <Badge variant="secondary">{config.phases} Phase{config.phases > 1 ? 's' : ''}</Badge>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium">Profit Targets:</span>
            {Object.entries(config.profitTargets).map(([phase, target]) => (
              <div key={phase} className="space-y-1">
                <div className="flex justify-between items-center pl-4">
                  <span className="text-sm text-gray-600">
                    {phase.charAt(0).toUpperCase() + phase.slice(1).replace(/(\d)/, " $1")}:
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{target}%</Badge>
                    <span className="text-sm text-green-600 font-medium">
                      {formatCurrency(targetAmounts[phase])}
                    </span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="pl-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, targetProgress[phase])}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {targetProgress[phase].toFixed(1)}% complete
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Max Drawdown:</span>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">{config.maxDrawdown}%</Badge>
                <span className="text-sm text-red-600 font-medium">
                  {formatCurrency(maxDrawdownAmount)}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Daily Drawdown:</span>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">{config.dailyDrawdown}%</Badge>
                <span className="text-sm text-red-600 font-medium">
                  {formatCurrency(dailyDrawdownAmount)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Drawdown Type:</span>
            <Badge variant="outline">
              {config.isTrailing ? "Trailing" : "Static"}
            </Badge>
          </div>
        </div>

        {/* Data Status */}
        <div className="text-xs text-gray-500 text-center border-t pt-2">
          <div>Data last updated: {formatLastUpdated(displayData.lastUpdated)}</div>
          <div className="mt-1">
            Initial Capital: {formatCurrency(displayData.capital)}
          </div>
        </div>

                <Button onClick={onBack} variant="outline" className="w-full">
          Modify Configuration
        </Button>
      </CardContent>
    </Card>
  )
}

export default AnalyticsView