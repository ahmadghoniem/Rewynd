import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingUp, DollarSign } from "lucide-react"

const AnalyticsView = ({ config, onBack }) => {
  const [accountData, setAccountData] = useState({
    balance: 5000, // Default fallback
    realizedPnL: 0,
    unrealizedPnL: 0,
    lastUpdated: null
  })

  useEffect(() => {
    // Load initial data from localStorage
    const loadAccountData = () => {
      try {
        const stored = localStorage.getItem('tradeAnalytics_accountData')
        if (stored) {
          const parsedData = JSON.parse(stored)
          setAccountData(parsedData)
        }
      } catch (error) {
        console.error('Error loading account data:', error)
      }
    }

    // Set up event listener for real-time updates
    const handleAccountUpdate = (event) => {
      setAccountData(event.detail)
    }

    loadAccountData()
    window.addEventListener('accountDataUpdated', handleAccountUpdate)

    // Cleanup
    return () => {
      window.removeEventListener('accountDataUpdated', handleAccountUpdate)
    }
  }, [])

  const getTotalProfitTarget = () => {
    return Object.values(config.profitTargets).reduce(
      (sum, target) => sum + target,
      0
    )
  }

  const getTargetAmounts = () => {
    const amounts = {}
    Object.entries(config.profitTargets).forEach(([phase, percentage]) => {
      amounts[phase] = (accountData.balance * percentage) / 100
    })
    return amounts
  }

  const targetAmounts = getTargetAmounts()
  const totalTargetAmount = (accountData.balance * getTotalProfitTarget()) / 100
  const maxDrawdownAmount = (accountData.balance * config.maxDrawdown) / 100
  const dailyDrawdownAmount = (accountData.balance * config.dailyDrawdown) / 100

  // Calculate performance metrics (excluding unrealized P&L)
  const initialBalance = accountData.balance - accountData.realizedPnL
  const performancePercentage = initialBalance > 0 ? (accountData.realizedPnL / initialBalance) * 100 : 0

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatLastUpdated = (timestamp) => {
    if (!timestamp) return 'Never'
    return new Date(timestamp).toLocaleString()
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Account Information */}
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Account Balance:</span>
            </div>
            <span className="text-lg font-bold text-blue-600">
              {formatCurrency(accountData.balance)}
            </span>
          </div>

          {/* P&L Information */}
          <div className="flex justify-center">
            <div className="flex flex-col items-center p-3 bg-green-50 rounded-lg min-w-[120px]">
              <div className="flex items-center gap-1 mb-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">Realized P&L</span>
              </div>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(accountData.realizedPnL)}
              </span>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">Performance:</span>
            <div className="flex items-center gap-2">
              <Badge variant={performancePercentage >= 0 ? "default" : "destructive"}>
                {performancePercentage >= 0 ? "+" : ""}{performancePercentage.toFixed(2)}%
              </Badge>
              <span className={`text-sm font-bold ${performancePercentage >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(accountData.realizedPnL)}
              </span>
            </div>
          </div>

          {/* Configuration Details */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Phases:</span>
            <Badge variant="secondary">{config.phases}</Badge>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium">Profit Targets:</span>
            {Object.entries(config.profitTargets).map(([phase, target]) => (
              <div
                key={phase}
                className="flex justify-between items-center pl-4"
              >
                <span className="text-sm text-gray-600">
                  {phase.charAt(0).toUpperCase() +
                    phase.slice(1).replace(/(\d)/, " $1")}
                  :
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{target}%</Badge>
                  <span className="text-sm text-green-600 font-medium">
                    {formatCurrency(targetAmounts[phase])}
                  </span>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center pl-4 border-t pt-2">
              <span className="text-sm font-medium">Total Target:</span>
              <div className="flex items-center gap-2">
                <Badge>{getTotalProfitTarget()}%</Badge>
                <span className="text-sm text-green-600 font-bold">
                  {formatCurrency(totalTargetAmount)}
                </span>
              </div>
            </div>
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

          {/* Last Updated */}
          <div className="text-xs text-gray-500 text-center border-t pt-2">
            Last updated: {formatLastUpdated(accountData.lastUpdated)}
          </div>
        </div>

        <Button onClick={onBack} variant="outline" className="w-full mt-6">
          Modify Configuration
        </Button>
      </CardContent>
    </Card>
  )
}

export default AnalyticsView