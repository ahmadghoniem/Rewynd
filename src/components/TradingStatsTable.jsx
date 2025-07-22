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
  TrendingDown,
  Info
} from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

const   TradingStatsTable = ({
  tradesData = [],
  displayData = {},
  config = {}
}) => {
  const [stats, setStats] = useState({
    averageRR: 0,
    averageProfit: 0,
    averageLoss: 0,
    worstLoss: 0, // added
    bestWin: 0,
    tradesPerDay: 0,
    averageDuration: 0,
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    winRate: 0,
    profitFactor: 0,
    sharpeRatio: 0,
    maxConsecutiveWins: 0, // added
    maxConsecutiveLosses: 0 // added
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
    // Calculate worst loss (most negative realized)
    const worstLoss =
      losingTrades.length > 0
        ? Math.min(...losingTrades.map((t) => t.realized))
        : 0

    // Calculate trades per day
    const uniqueDays = new Set(parsedTrades.map((t) => t.date.toDateString()))
      .size
    const tradesPerDay = uniqueDays > 0 ? parsedTrades.length / uniqueDays : 0

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

    // Calculate max consecutive wins/losses
    let maxConsecutiveWins = 0
    let maxConsecutiveLosses = 0
    let currentWins = 0
    let currentLosses = 0
    // Sort by date ascending
    const sortedByDate = [...parsedTrades].sort((a, b) => a.date - b.date)
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
      if (currentLosses > maxConsecutiveLosses) maxConsecutiveLosses = currentLosses
    }

    setStats({
      averageRR: averageRR || 0,
      averageProfit: averageProfit || 0,
      averageLoss: averageLoss || 0,
      worstLoss: worstLoss || 0, // added
      bestWin: bestWin || 0,
      tradesPerDay: tradesPerDay || 0,
      averageDuration: averageDuration || 0,
      totalTrades: parsedTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate:
        parsedTrades.length > 0
          ? (winningTrades.length / parsedTrades.length) * 100
          : 0,
      profitFactor: profitFactor || 0,
      sharpeRatio: sharpeRatio || 0,
      maxConsecutiveWins, // added
      maxConsecutiveLosses // added
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

  // --- Summary Section Calculations ---
  const totalTrades = tradesData.length
  const buyTrades = tradesData.filter(
    (t) => t.side?.toLowerCase() === "buy"
  ).length
  const sellTrades = tradesData.filter(
    (t) => t.side?.toLowerCase() === "sell"
  ).length
  const buyPct = totalTrades > 0 ? (buyTrades / totalTrades) * 100 : 0
  const sellPct = totalTrades > 0 ? (sellTrades / totalTrades) * 100 : 0

  // Current Trading Streak Calculation
  // Streak is positive for consecutive wins, negative for consecutive losses, 0 for breakeven or no trades
  let currentStreak = 0
  if (tradesData && tradesData.length > 0) {
    // Sort trades by dateEnd (or dateStart if dateEnd is missing), newest first
    const sortedTrades = [...tradesData].sort((a, b) => {
      const dateA = new Date(a.dateEnd || a.dateStart)
      const dateB = new Date(b.dateEnd || b.dateStart)
      return dateB - dateA // descending: most recent first
    })
    for (let i = 0; i < sortedTrades.length; i++) {
      const trade = sortedTrades[i]
      const realized = parseFloat(trade.realized?.replace(/[$,]/g, "") || "0")
      if (realized > 0) {
        if (currentStreak >= 0) {
          currentStreak++
        } else {
          break
        }
      } else if (realized < 0) {
        if (currentStreak <= 0) {
          currentStreak--
        } else {
          break
        }
      } else {
        // Breakeven resets streak
        break
      }
    }
  }

  // Phase status
  let currentPhase = 1
  let funded = false
  if (
    config &&
    config.profitTargets &&
    displayData &&
    typeof displayData.realizedPnL === "number"
  ) {
    let realized = displayData.realizedPnL
    let phasePassed = 0
    for (let i = 1; i <= (config.phases || 1); i++) {
      const targetPct = config.profitTargets[`phase${i}`]
      const target = displayData.capital * (targetPct / 100)
      if (realized >= target) {
        phasePassed = i
      } else {
        break
      }
    }
    if (phasePassed === config.phases) {
      funded = true
      currentPhase = "Funded"
    } else {
      currentPhase = phasePassed + 1
      if (currentPhase > config.phases) currentPhase = config.phases
    }
  }

  // --- End Summary Section Calculations ---

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Trading Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary Section */}
        <div className="mb-4 min-w-0 bg-background/50 dark:bg-gray-800/40 rounded-lg p-4 flex flex-wrap gap-4 items-center text-sm">
          <div className="flex flex-col min-w-[120px]">
            <span className="text-muted-foreground">Account Size</span>
            <span className="font-bold">
              {formatCurrency(displayData.capital)}
            </span>
          </div>
          <div className="flex flex-col min-w-[120px]">
            <span className="text-muted-foreground">Balance</span>
            <span className="font-bold">
              {formatCurrency(displayData.balance)}
            </span>
          </div>
          <div className="flex flex-col min-w-[120px]">
            <span className="text-muted-foreground">Realized PnL</span>
            <span
              className={`font-bold ${getStatusColor(displayData.realizedPnL)}`}
            >
              {formatCurrency(displayData.realizedPnL)}
            </span>
          </div>
          <div className="flex flex-col min-w-[120px]">
            <Tooltip>
                <span className="text-muted-foreground cursor-help" style={{display: 'inline-flex', alignItems: 'center'}}>
                <TooltipTrigger asChild>
                  <span className="border-b border-dashed border-muted-foreground/50" style={{display: 'inline-block'}}>
                    Status
                  </span>
              </TooltipTrigger>
                </span>
              <TooltipContent side="top" sideOffset={0} align="center">
                Shows your current phase or funded status.
              </TooltipContent>
            </Tooltip>
            <span className={`font-bold ${funded ? "text-success" : ""}`}>
              {funded ? "Funded" : `Phase ${currentPhase}`}
            </span>
          </div>
          <div className="flex flex-col min-w-[120px]">
            <span className="text-muted-foreground">Total Trades</span>
            <span className="font-bold flex items-baseline gap-1">
              {totalTrades}
              {buyTrades > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-accent-success-foreground text-xs cursor-help">({buyTrades})</span>
                  </TooltipTrigger>
                  <TooltipContent>Buy Trades</TooltipContent>
                </Tooltip>
              )}
              {buyTrades > 0 && sellTrades > 0 && <span className="text-xs text-muted-foreground">/</span>}
              {sellTrades > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-accent-danger-foreground text-xs cursor-help">({sellTrades})</span>
                  </TooltipTrigger>
                  <TooltipContent>Sell Trades</TooltipContent>
                </Tooltip>
              )}
            </span>
          </div>

          <div className="flex flex-col min-w-[120px]">
            <span className="text-muted-foreground">Win Rate</span>
            <span className="font-bold text-success">
              {stats.winRate.toFixed(1)}%
            </span>
          </div>
          <div className="flex flex-col min-w-[120px]">
            <span className="text-muted-foreground">Avg RR</span>
            <span className="font-bold text-success">
              {stats.averageRR.toFixed(2)}
            </span>
          </div>
           {/* reserved for current trading streak! */ }
           <div className="flex flex-col min-w-[120px]">
            <span className="text-muted-foreground">Current Streak</span>
            <span className={`font-bold ${currentStreak > 0 ? "text-success" : currentStreak < 0 ? "text-danger" : "text-muted-foreground"}`}>
              {currentStreak}
            </span>
          </div>
          <div className="flex flex-col min-w-[120px]">
          <Tooltip>
                <span className="text-muted-foreground cursor-help" style={{display: 'inline-flex', alignItems: 'center'}}>
                <TooltipTrigger asChild>
                  <span className="border-b border-dashed border-muted-foreground/50" style={{display: 'inline-block'}}>
                    Sharpe Ratio
                  </span>
                  </TooltipTrigger>
                </span>
              <TooltipContent side="top" sideOffset={0} align="center">
                Sharpe Ratio measures risk-adjusted return. Higher is better.
              </TooltipContent>
            </Tooltip>
            <span className="font-bold">
              {stats.sharpeRatio.toFixed(2)}
            </span>
          </div>

          <div className="flex flex-col min-w-[120px]">
          <Tooltip>
                <span className="text-muted-foreground cursor-help" style={{display: 'inline-flex', alignItems: 'center'}}>
                <TooltipTrigger asChild>
                  <span className="border-b border-dashed border-muted-foreground/50" style={{display: 'inline-block'}}>
                  Profit Factor
                  </span>
                  </TooltipTrigger>
                </span>
              <TooltipContent side="top" sideOffset={0} align="center">
              Profit Factor is the ratio of gross profit to gross loss. Above 1 is profitable.
              </TooltipContent>
            </Tooltip>
            <span className="font-bold">
            {stats.profitFactor.toFixed(2)}
            </span>
          </div>
        </div>
        <div className="w-full">
          <div className="flex flex-col gap-6 items-stretch w-full">
            {/* Wins Section */}
            <div className=" min-w-0 bg-background/50 dark:bg-gray-800/40 rounded-lg p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-3 w-3 rounded-full bg-green-500 inline-block"></span>
                <span className="font-semibold text-success">Wins</span>
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
                  <span>Max Consecutive Wins</span>
                  <span className="text-success">{stats.maxConsecutiveWins}</span>
                </div>
              </div>
            </div>

            {/* Losses Section */}
            <div className=" min-w-0 bg-background/50 dark:bg-gray-800/40 rounded-lg p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-3 w-3 rounded-full bg-red-500 inline-block"></span>
                <span className="font-semibold text-danger">Losses</span>
              </div>
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex justify-between">
                  <span>Total Losses</span>
                  <span>{stats.losingTrades}</span>
                </div>
                <div className="flex justify-between">
                  <span>Worst Loss</span>
                  <span className="text-danger">
                    {formatCurrency(stats.worstLoss)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Average Loss</span>
                  <span className="text-danger">
                    {formatCurrency(stats.averageLoss)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Max Consecutive Losses</span>
                  <span className="text-danger">{stats.maxConsecutiveLosses}</span>
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
