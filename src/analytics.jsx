import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingUp, DollarSign, Activity, RefreshCw, Sun, Moon, Loader2, Target, Calendar } from "lucide-react"
import { useTheme } from "./ThemeContext"
import TradingStatsTable from "./components/TradingStatsTable"

import TradeDataTable from "./components/TradeDataTable"
import EquityCurve from "./components/EquityCurve"
import DailyAnalysis from "./components/DailyAnalysis"

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
  const [extractedTrades, setExtractedTrades] = useState([])
  const [sessions, setSessions] = useState([])
  const [selectedSessionId, setSelectedSessionId] = useState(null)
  const [currentSessionId, setCurrentSessionId] = useState(null)
  
  // Get current session ID from localStorage
  const getCurrentSessionId = () => {
    try {
      const sessionId = localStorage.getItem('lastSelectedSessionID')
      console.log('Current session ID from localStorage:', sessionId)
      return sessionId
    } catch (error) {
      console.error('Error getting current session ID:', error)
      return null
    }
  }

  // Get all available sessions from localStorage
  const getAvailableSessions = () => {
    try {
      const sessions = []
      console.log('Scanning localStorage for sessions...')
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        
        if (key && key.startsWith('tradeAnalytics_session_')) {
          const sessionId = key.replace('tradeAnalytics_session_', '')
          
          const sessionData = localStorage.getItem(key)
          if (sessionData) {
            try {
              const parsed = JSON.parse(sessionData)
              
              // Create a better session name
              let sessionName = `Session ${sessionId}`
              if (parsed.lastUpdated) {
                const date = new Date(parsed.lastUpdated)
                sessionName = `Session ${sessionId} (${date.toLocaleDateString()})`
              }
              
              sessions.push({
                id: sessionId,
                name: sessionName,
                data: parsed,
                lastUpdated: parsed.lastUpdated || Date.now(),
                url: parsed.url || '',
                trades: parsed.trades || []
              })
              console.log(`Added session: ${sessionId} with ${parsed.trades?.length || 0} trades`)
            } catch (e) {
              console.error('Error parsing session data:', e)
            }
          }
        }
      }
      
      console.log('Total sessions found:', sessions.length)
      
      return sessions.sort((a, b) => b.lastUpdated - a.lastUpdated)
    } catch (error) {
      console.error('Error getting available sessions:', error)
      return []
    }
  }

  // Load storage data on component mount
  useEffect(() => {
    // Get current session ID
    const currentId = getCurrentSessionId()
    setCurrentSessionId(currentId)
    
    // Get available sessions
    const availableSessions = getAvailableSessions()
    setSessions(availableSessions)
    
    // Set selected session to current session
    setSelectedSessionId(currentId)
    
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
    
    if (chrome && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener(handleTradeDataUpdate)
    }
    
    return () => {
      if (chrome && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.removeListener(handleTradeDataUpdate)
      }
    }
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

  // Load data for a specific session
  const loadSessionData = (sessionId) => {
    try {
      const sessionKey = `tradeAnalytics_session_${sessionId}`
      const sessionData = localStorage.getItem(sessionKey)
      if (sessionData) {
        const parsed = JSON.parse(sessionData)
        setStorageData(parsed)
        setExtractedTrades(parsed.trades || [])
        setSelectedSessionId(sessionId)
        console.log(`Loaded session data for ${sessionId}:`, parsed)
      }
    } catch (error) {
      console.error('Error loading session data:', error)
    }
  }

  // Handle session selection
  const handleSessionSelect = (sessionId) => {
    loadSessionData(sessionId)
  }

  // Check if viewing historical session
  const isViewingHistoricalSession = selectedSessionId && selectedSessionId !== currentSessionId

  // Save current session data
  const saveCurrentSessionData = (data) => {
    if (!currentSessionId) {
      console.log('No current session ID, creating default session')
      // Create a default session ID if none exists
      const defaultSessionId = `session_${Date.now()}`
      localStorage.setItem('lastSelectedSessionID', defaultSessionId)
      setCurrentSessionId(defaultSessionId)
      setSelectedSessionId(defaultSessionId)
    }
    
    const sessionIdToUse = currentSessionId || `session_${Date.now()}`
    
    try {
      const sessionKey = `tradeAnalytics_session_${sessionIdToUse}`
      const sessionData = {
        ...data,
        lastUpdated: Date.now(),
        sessionId: sessionIdToUse
      }
      localStorage.setItem(sessionKey, JSON.stringify(sessionData))
      console.log(`Saved session data for ${sessionIdToUse}`)
    } catch (error) {
      console.error('Error saving session data:', error)
    }
  }

  // Save session data when storage data changes
  useEffect(() => {
    if (storageData && currentSessionId) {
      saveCurrentSessionData(storageData)
    }
  }, [storageData, currentSessionId])

  const getStatusBadge = (value) => {
    if (value > 0) return 'default'
    if (value < 0) return 'destructive'
    return 'secondary'
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Configuration
          </Button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Funded Trading Challenge Dashboard
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={toggleTheme}
            className="flex items-center gap-2"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {isDark ? "Light" : "Dark"}
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              setLoading(true)
              await handleRefresh()
              setLoading(false)
            }}
            className="flex items-center gap-2"
            title="Refresh data"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
        </div>
      </div>

      {/* Session Selector */}
      {sessions.length > 0 && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Trading Session
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isViewingHistoricalSession ? 'Viewing historical session' : 'Current active session'}
                  {sessions.length > 1 && ` • ${sessions.length} sessions available`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedSessionId || ''}
                  onChange={(e) => handleSessionSelect(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.name} {session.id === currentSessionId ? '(Current)' : ''}
                    </option>
                  ))}
                </select>
                {isViewingHistoricalSession && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSessionSelect(currentSessionId)}
                    className="text-xs"
                  >
                    Back to Current
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Challenge Summary Banner - FTMO Style */}
      <Card className={`bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800 border-slate-200 dark:border-slate-700 ${isViewingHistoricalSession ? 'border-orange-300 dark:border-orange-600' : ''}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Funded Trading Challenge
                </h3>
                {isViewingHistoricalSession && (
                  <Badge variant="outline" className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-600">
                    Historical Session
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {config.phases} Phase{config.phases > 1 ? 's' : ''} • {Object.values(config.profitTargets).reduce((sum, target) => sum + target, 0)}% Total Target
                {isViewingHistoricalSession && ` • Session ${selectedSessionId}`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Progress</p>
              <p className={`text-2xl font-bold ${performancePercentage >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {performancePercentage >= 0 ? "+" : ""}{performancePercentage.toFixed(2)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Overview Section - FTMO Style */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Account Size */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Account Size</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {formatCurrency(displayData.capital)}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Balance */}
        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Current Balance</p>
                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                  {formatCurrency(displayData.balance)}
                </p>
              </div>
              <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-800 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Realized P&L */}
        <Card className={`bg-gradient-to-br ${displayData.realizedPnL >= 0 ? 'from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-800' : 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-800'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Realized P&L</p>
                <p className={`text-2xl font-bold ${getStatusColor(displayData.realizedPnL || 0)}`}>
                  {formatCurrency(displayData.realizedPnL || 0)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {performancePercentage >= 0 ? "+" : ""}{performancePercentage.toFixed(2)}%
                </p>
              </div>
              <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${displayData.realizedPnL >= 0 ? 'bg-emerald-100 dark:bg-emerald-800' : 'bg-red-100 dark:bg-red-800'}`}>
                <TrendingUp className={`h-6 w-6 ${displayData.realizedPnL >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'} ${displayData.realizedPnL < 0 ? 'transform rotate-180' : ''}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Stage */}
        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Account Stage</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  Phase {config.phases > 1 ? '1' : '1'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {config.phases > 1 ? `${config.phases} Phase Challenge` : 'Single Phase'}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Objectives Section - FTMO Style */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Objectives</h3>
          <Badge variant="outline" className="text-sm">
            {Object.values(config.profitTargets).reduce((sum, target) => sum + target, 0)}% Total Target
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profit Targets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Profit Targets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(config.profitTargets).map(([phase, target]) => (
                <div key={phase} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {phase.charAt(0).toUpperCase() + phase.slice(1).replace(/(\d)/, " $1")}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Target: {target}% ({formatCurrency(targetAmounts[phase])})
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-1">{target}%</Badge>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {targetProgress[phase].toFixed(1)}% complete
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-green-500 h-4 rounded-full transition-all duration-300 shadow-sm"
                        style={{ width: `${Math.min(100, targetProgress[phase])}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Challenge Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Challenge Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Challenge Type:</span>
                  <Badge variant="secondary">{config.phases} Phase{config.phases > 1 ? 's' : ''}</Badge>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Profit Target:</span>
                  <Badge variant="outline">
                    {Object.values(config.profitTargets).reduce((sum, target) => sum + target, 0)}%
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Current Progress:</span>
                  <Badge variant={performancePercentage >= 0 ? 'default' : 'destructive'}>
                    {performancePercentage >= 0 ? "+" : ""}{performancePercentage.toFixed(2)}%
                  </Badge>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2 border-t border-gray-200 dark:border-gray-700">
                <div>Last updated: {formatLastUpdated(displayData.lastUpdated)}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Trading Performance Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Trading Performance
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TradingStatsTable tradesData={extractedTrades} />
        </div>
        
        {/* Trade Data Table */}
                        <TradeDataTable tradesData={extractedTrades} accountSize={displayData?.capital || 0} />
      </div>

      {/* Equity Curve Analysis */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Equity Curve & Performance Tracking
        </h3>
        <EquityCurve tradesData={extractedTrades} />
      </div>

      {/* Daily Analysis */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Daily Trading Analysis
        </h3>
        <DailyAnalysis tradesData={extractedTrades} />
      </div>
    </div>
  )
}

export default AnalyticsView