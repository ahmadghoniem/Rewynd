import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  Clock,
  Calendar,
  DollarSign,
  Target,
  AlertTriangle,
  TrendingDown
} from "lucide-react"

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
    const parsedTrades = trades.map((trade) => {
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

    // Calculate statistics
    const winningTrades = parsedTrades.filter((t) => t.isWin)
    const losingTrades = parsedTrades.filter((t) => t.isLoss)

    const averageRR =
      parsedTrades.reduce((sum, t) => sum + t.maxRR, 0) / parsedTrades.length
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

    // Calculate trades per day
    const uniqueDays = new Set(parsedTrades.map((t) => t.date.toDateString()))
      .size
    const tradesPerDay = uniqueDays > 0 ? parsedTrades.length / uniqueDays : 0

    // Calculate max daily loss
    const dailyLosses = {}
    parsedTrades.forEach((trade) => {
      const dateKey = trade.date.toDateString()
      if (trade.isLoss) {
        dailyLosses[dateKey] =
          (dailyLosses[dateKey] || 0) + Math.abs(trade.realized)
      }
    })
    const maxDailyLoss =
      Object.values(dailyLosses).length > 0
        ? Math.max(...Object.values(dailyLosses))
        : 0

    // Calculate average duration
    const averageDuration =
      parsedTrades.reduce((sum, t) => sum + t.duration, 0) / parsedTrades.length

    // Calculate profit factor
    const totalProfit = winningTrades.reduce((sum, t) => sum + t.realized, 0)
    const totalLoss = Math.abs(
      losingTrades.reduce((sum, t) => sum + t.realized, 0)
    )
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : 0

    // Calculate Sharpe ratio
    const returns = parsedTrades.map((t) => t.realized)
    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
    const variance =
      returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) /
      returns.length
    const standardDeviation = Math.sqrt(variance)
    const sharpeRatio =
      standardDeviation > 0 ? meanReturn / standardDeviation : 0

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
      winRate:
        parsedTrades.length > 0
          ? (winningTrades.length / parsedTrades.length) * 100
          : 0,
      profitFactor: profitFactor || 0,
      sharpeRatio: sharpeRatio || 0
    })
  }

  const parseDuration = (durationStr) => {
    if (!durationStr) return 0

    // Parse duration strings like "25m", "1h 30m", "2h", etc.
    const match = durationStr.match(/(?:(\d+)h\s*)?(?:(\d+)m)?/)
    if (match) {
      const hours = parseInt(match[1] || "0")
      const minutes = parseInt(match[2] || "0")
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
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2
    }).format(amount)
  }

  const getStatusColor = (value) => {
    if (value > 0) return "text-success"
    if (value < 0) return "text-danger"
    return "text-muted-foreground"
  }

  const getStatusBadge = (value) => {
    if (value > 0) return "default"
    if (value < 0) return "destructive"
    return "secondary"
  }

  const getBadgeVariant = (metric, value) => {
    switch (metric) {
      case "averageRR":
        return value >= 1 ? "default" : "secondary"
      case "averageProfit":
        return value > 0 ? "default" : "secondary"
      case "averageLoss":
        return value < 0 ? "destructive" : "secondary"
      case "bestWin":
        return value > 0 ? "default" : "secondary"
      case "tradesPerDay":
        return value > 0 ? "outline" : "secondary"
      case "maxDailyLoss":
        return value > 0 ? "destructive" : "secondary"
      case "profitFactor":
        return value >= 1 ? "default" : "secondary"
      case "sharpeRatio":
        return value >= 0 ? "default" : "secondary"
      case "winRate":
        return value >= 50 ? "default" : "destructive"
      default:
        return "secondary"
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
        <div className="w-full">
          <div className="flex flex-col gap-6 items-stretch w-full">
            {/* <div className="flex flex-col items-center justify-center bg-gradient-to-br from-red-100 to-green-100 dark:from-red-900/20 dark:to-green-900/20 rounded-lg p-6 w-full md:w-48 max-w-xs mx-auto md:mx-0 min-w-[180px]">
              <div className="relative flex items-center justify-center w-full">
                <svg width="120" height="60" viewBox="0 0 120 60" className="block mx-auto">
                 
                  <path d="M20,60 A40,40 0 0,1 100,60" fill="none" stroke="#ef4444" strokeWidth="10" strokeDasharray="62.8 62.8" strokeDashoffset="0" />
                  <path d="M20,60 A40,40 0 0,1 100,60" fill="none" stroke="#22c55e" strokeWidth="10" strokeDasharray="62.8 62.8" strokeDashoffset="62.8" />
                </svg>
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 text-4xl font-bold text-foreground dark:text-white text-center pointer-events-none">
                  {stats.totalTrades}
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">Trades</div>
            </div>  */}

            {/* Wins Section */}
            <div className=" min-w-0 bg-background/50 dark:bg-gray-800/40 rounded-lg p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-3 w-3 rounded-full bg-green-500 inline-block"></span>
                <span className="font-semibold text-success">
                  Wins
                </span>
              </div>
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex justify-between">
                  <span>Total Wins</span>
                  <span>{stats.winningTrades}</span>
                </div>
                <div className="flex justify-between">
                  <span>Best Win</span>
                  <span className="text-success">
                    {formatCurrency(stats.bestWin)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Average Win</span>
                  <span className="text-success">
                    {formatCurrency(stats.averageProfit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Average RR</span>
                  <span className="text-success">
                    {stats.averageRR.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Win Rate</span>
                  <span>{stats.winRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Sharpe Ratio</span>
                  <span>{stats.sharpeRatio.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Profit Factor</span>
                  <span>{stats.profitFactor.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Win Duration</span>
                  <span>{formatDuration(stats.averageDuration)}</span>
                </div>
              </div>
            </div>

            {/* Losses Section */}
            <div className=" min-w-0 bg-background/50 dark:bg-gray-800/40 rounded-lg p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-3 w-3 rounded-full bg-red-500 inline-block"></span>
                <span className="font-semibold text-danger">
                  Losses
                </span>
              </div>
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex justify-between">
                  <span>Total Losses</span>
                  <span>{stats.losingTrades}</span>
                </div>
                <div className="flex justify-between">
                  <span>Worst Loss</span>
                  <span className="text-danger">
                    {formatCurrency(stats.averageLoss)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Average Loss</span>
                  <span className="text-danger">
                    {formatCurrency(stats.averageLoss)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Max Daily Loss</span>
                  <span>{formatCurrency(stats.maxDailyLoss)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Loss Duration</span>
                  <span>{formatDuration(stats.averageDuration)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default TradingStatsTable
