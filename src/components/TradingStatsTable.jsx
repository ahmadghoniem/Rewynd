import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Clock, Calendar, DollarSign, Target, AlertTriangle } from "lucide-react"

const TradingStatsTable = ({ tradesData = [] }) => {
  const [stats, setStats] = useState({
    averageRR: 0,
    averageProfit: 0,
    averageLoss: 0,
    bestWin: 0,
    tradesPerDay: 0,
    maxDailyLoss: 0,
    averageDuration: 0,
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    winRate: 0,
    profitFactor: 0,
    sharpeRatio: 0
  })

  useEffect(() => {
    if (tradesData && tradesData.length > 0) {
      calculateStats(tradesData)
    }
  }, [tradesData])

  const calculateStats = (trades) => {
    if (!trades || trades.length === 0) return

    // Parse trade data and calculate statistics
    const parsedTrades = trades.map(trade => {
      const realized = parseFloat(trade.realized?.replace(/[$,]/g, '') || '0')
      const maxRR = parseFloat(trade.maxRR || '0')
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

    // Calculate statistics
    const winningTrades = parsedTrades.filter(t => t.isWin)
    const losingTrades = parsedTrades.filter(t => t.isLoss)
    
    const averageRR = parsedTrades.reduce((sum, t) => sum + t.maxRR, 0) / parsedTrades.length
    const averageProfit = winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + t.realized, 0) / winningTrades.length : 0
    const averageLoss = losingTrades.length > 0 ? losingTrades.reduce((sum, t) => sum + t.realized, 0) / losingTrades.length : 0
    const bestWin = winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.realized)) : 0
    
    // Calculate trades per day
    const uniqueDays = new Set(parsedTrades.map(t => t.date.toDateString())).size
    const tradesPerDay = uniqueDays > 0 ? parsedTrades.length / uniqueDays : 0
    
    // Calculate max daily loss
    const dailyLosses = {}
    parsedTrades.forEach(trade => {
      const dateKey = trade.date.toDateString()
      if (trade.isLoss) {
        dailyLosses[dateKey] = (dailyLosses[dateKey] || 0) + Math.abs(trade.realized)
      }
    })
    const maxDailyLoss = Object.values(dailyLosses).length > 0 ? Math.max(...Object.values(dailyLosses)) : 0
    
    // Calculate average duration
    const averageDuration = parsedTrades.reduce((sum, t) => sum + t.duration, 0) / parsedTrades.length

    // Calculate profit factor
    const totalProfit = winningTrades.reduce((sum, t) => sum + t.realized, 0)
    const totalLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.realized, 0))
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : 0

    // Calculate Sharpe ratio
    const returns = parsedTrades.map(t => t.realized)
    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length
    const standardDeviation = Math.sqrt(variance)
    const sharpeRatio = standardDeviation > 0 ? meanReturn / standardDeviation : 0

    setStats({
      averageRR: averageRR || 0,
      averageProfit: averageProfit || 0,
      averageLoss: averageLoss || 0,
      bestWin: bestWin || 0,
      tradesPerDay: tradesPerDay || 0,
      maxDailyLoss: maxDailyLoss || 0,
      averageDuration: averageDuration || 0,
      totalTrades: parsedTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: parsedTrades.length > 0 ? (winningTrades.length / parsedTrades.length) * 100 : 0,
      profitFactor: profitFactor || 0,
      sharpeRatio: sharpeRatio || 0
    })
  }

  const parseDuration = (durationStr) => {
    if (!durationStr) return 0
    
    // Parse duration strings like "25m", "1h 30m", "2h", etc.
    const match = durationStr.match(/(?:(\d+)h\s*)?(?:(\d+)m)?/)
    if (match) {
      const hours = parseInt(match[1] || '0')
      const minutes = parseInt(match[2] || '0')
      return hours * 60 + minutes
    }
    return 0
  }

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const getStatusColor = (value) => {
    if (value > 0) return 'text-green-600 dark:text-green-400'
    if (value < 0) return 'text-red-600 dark:text-red-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const getStatusBadge = (value) => {
    if (value > 0) return 'default'
    if (value < 0) return 'destructive'
    return 'secondary'
  }

  const getBadgeVariant = (metric, value) => {
    switch (metric) {
      case 'averageRR':
        return value >= 1 ? 'default' : 'secondary'
      case 'averageProfit':
        return value > 0 ? 'default' : 'secondary'
      case 'averageLoss':
        return value < 0 ? 'destructive' : 'secondary'
      case 'bestWin':
        return value > 0 ? 'default' : 'secondary'
      case 'tradesPerDay':
        return value > 0 ? 'outline' : 'secondary'
      case 'maxDailyLoss':
        return value > 0 ? 'destructive' : 'secondary'
      case 'profitFactor':
        return value >= 1 ? 'default' : 'secondary'
      case 'sharpeRatio':
        return value >= 0 ? 'default' : 'secondary'
      case 'winRate':
        return value >= 50 ? 'default' : 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Trading Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300">Metric</th>
                <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300">Value</th>
                <th className="text-left p-3 text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="p-3 text-sm text-gray-600 dark:text-gray-400">Average RR</td>
                <td className="p-3 text-sm font-medium text-gray-900 dark:text-white">
                  {stats.averageRR.toFixed(2)}
                </td>
                <td className="p-3">
                  <Badge variant={stats.averageRR >= 1 ? 'default' : 'secondary'}>
                    {stats.averageRR >= 1 ? 'Good' : 'Low'}
                  </Badge>
                </td>
              </tr>
              
              <tr>
                <td className="p-3 text-sm text-gray-600 dark:text-gray-400">Average Profit</td>
                <td className={`p-3 text-sm font-medium ${getStatusColor(stats.averageProfit)}`}>
                  {formatCurrency(stats.averageProfit)}
                </td>
                <td className="p-3">
                  <Badge variant={getStatusBadge(stats.averageProfit)}>
                    {stats.averageProfit > 0 ? 'Positive' : 'Zero'}
                  </Badge>
                </td>
              </tr>
              
              <tr>
                <td className="p-3 text-sm text-gray-600 dark:text-gray-400">Average Loss</td>
                <td className={`p-3 text-sm font-medium ${getStatusColor(stats.averageLoss)}`}>
                  {formatCurrency(stats.averageLoss)}
                </td>
                <td className="p-3">
                  <Badge variant={getStatusBadge(stats.averageLoss)}>
                    {stats.averageLoss < 0 ? 'Loss' : 'Zero'}
                  </Badge>
                </td>
              </tr>
              
              <tr>
                <td className="p-3 text-sm text-gray-600 dark:text-gray-400">Best Win</td>
                <td className={`p-3 text-sm font-medium ${getStatusColor(stats.bestWin)}`}>
                  {formatCurrency(stats.bestWin)}
                </td>
                <td className="p-3">
                  <Badge variant={stats.bestWin > 0 ? 'default' : 'secondary'}>
                    {stats.bestWin > 0 ? 'Record' : 'None'}
                  </Badge>
                </td>
              </tr>
              
              <tr>
                <td className="p-3 text-sm text-gray-600 dark:text-gray-400">Trades per Day</td>
                <td className="p-3 text-sm font-medium text-gray-900 dark:text-white">
                  {stats.tradesPerDay.toFixed(1)}
                </td>
                <td className="p-3">
                  <Badge variant={stats.tradesPerDay > 0 ? 'outline' : 'secondary'}>
                    {stats.tradesPerDay > 0 ? 'Active' : 'None'}
                  </Badge>
                </td>
              </tr>
              
              <tr>
                <td className="p-3 text-sm text-gray-600 dark:text-gray-400">Max Daily Loss</td>
                <td className={`p-3 text-sm font-medium ${getStatusColor(-stats.maxDailyLoss)}`}>
                  {formatCurrency(stats.maxDailyLoss)}
                </td>
                <td className="p-3">
                  <Badge variant={stats.maxDailyLoss > 0 ? 'destructive' : 'secondary'}>
                    {stats.maxDailyLoss > 0 ? 'Risk' : 'Safe'}
                  </Badge>
                </td>
              </tr>
              
              <tr>
                <td className="p-3 text-sm text-gray-600 dark:text-gray-400">Avg Hold Time</td>
                <td className="p-3 text-sm font-medium text-gray-900 dark:text-white">
                  {formatDuration(stats.averageDuration)}
                </td>
                <td className="p-3">
                  <Badge variant="outline">
                    {stats.averageDuration < 30 ? 'Quick' : 'Long'}
                  </Badge>
                </td>
              </tr>
              
              <tr>
                <td className="p-3 text-sm text-gray-600 dark:text-gray-400">Profit Factor</td>
                <td className="p-3 text-sm font-medium text-gray-900 dark:text-white">
                  {stats.profitFactor.toFixed(2)}
                </td>
                <td className="p-3">
                  <Badge variant={stats.profitFactor >= 1 ? 'default' : 'secondary'}>
                    {stats.profitFactor >= 1 ? 'Good' : 'Low'}
                  </Badge>
                </td>
              </tr>
              
              <tr>
                <td className="p-3 text-sm text-gray-600 dark:text-gray-400">Sharpe Ratio</td>
                <td className="p-3 text-sm font-medium text-gray-900 dark:text-white">
                  {stats.sharpeRatio.toFixed(2)}
                </td>
                <td className="p-3">
                  <Badge variant={stats.sharpeRatio >= 0 ? 'default' : 'secondary'}>
                    {stats.sharpeRatio >= 0 ? 'Good' : 'Low'}
                  </Badge>
                </td>
              </tr>
              
              <tr className="bg-gray-50 dark:bg-gray-800">
                <td className="p-3 text-sm font-medium text-gray-700 dark:text-gray-300">Win Rate</td>
                <td className="p-3 text-sm font-medium text-gray-900 dark:text-white">
                  {stats.winRate.toFixed(1)}% ({stats.winningTrades}/{stats.totalTrades})
                </td>
                <td className="p-3">
                  <Badge variant={stats.winRate >= 50 ? 'default' : 'destructive'}>
                    {stats.winRate >= 50 ? 'Good' : 'Poor'}
                  </Badge>
                </td>
              </tr>


            </tbody>
          </table>
        </div>
        
        {stats.totalTrades === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No trading data available</p>
            <p className="text-sm">Trading statistics will appear here once trades are detected</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default TradingStatsTable 