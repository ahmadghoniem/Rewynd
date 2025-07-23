import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from "@/components/ui/tooltip"

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

const TradingPerformanceSummaryCard = ({
  displayData,
  stats,
  config,
  tradesData
}) => {
  // Buy/Sell breakdown
  const totalTrades = tradesData.length
  const buyTrades = tradesData.filter(
    (t) => t.side?.toLowerCase() === "buy"
  ).length
  const sellTrades = tradesData.filter(
    (t) => t.side?.toLowerCase() === "sell"
  ).length

  // Current Trading Streak Calculation
  let currentStreak = 0
  if (tradesData && tradesData.length > 0) {
    const sortedTrades = [...tradesData].sort((a, b) => {
      const dateA = new Date(a.dateEnd || a.dateStart)
      const dateB = new Date(b.dateEnd || b.dateStart)
      return dateB - dateA
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Trading Performance Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="rounded-lg p-4 flex flex-wrap gap-4 items-center text-sm">
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
            <span
              className="text-muted-foreground cursor-help"
              style={{ display: "inline-flex", alignItems: "center" }}
            >
              <TooltipTrigger asChild>
                <span
                  className="border-b border-dashed border-muted-foreground/50"
                  style={{ display: "inline-block" }}
                >
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
                  <span className="text-accent-success-foreground text-xs cursor-help">
                    ({buyTrades})
                  </span>
                </TooltipTrigger>
                <TooltipContent>Buy Trades</TooltipContent>
              </Tooltip>
            )}
            {buyTrades > 0 && sellTrades > 0 && (
              <span className="text-xs text-muted-foreground">/</span>
            )}
            {sellTrades > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-accent-danger-foreground text-xs cursor-help">
                    ({sellTrades})
                  </span>
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
        <div className="flex flex-col min-w-[120px]">
          <span className="text-muted-foreground">Current Streak</span>
          <span
            className={`font-bold ${
              currentStreak > 0
                ? "text-success"
                : currentStreak < 0
                ? "text-danger"
                : "text-muted-foreground"
            }`}
          >
            {currentStreak}
          </span>
        </div>
        <div className="flex flex-col min-w-[120px]">
          <Tooltip>
            <span
              className="text-muted-foreground cursor-help"
              style={{ display: "inline-flex", alignItems: "center" }}
            >
              <TooltipTrigger asChild>
                <span
                  className="border-b border-dashed border-muted-foreground/50"
                  style={{ display: "inline-block" }}
                >
                  Sharpe Ratio
                </span>
              </TooltipTrigger>
            </span>
            <TooltipContent side="top" sideOffset={0} align="center">
              Sharpe Ratio measures risk-adjusted return. Higher is better.
            </TooltipContent>
          </Tooltip>
          <span className="font-bold">{stats.sharpeRatio.toFixed(2)}</span>
        </div>
        <div className="flex flex-col min-w-[120px]">
          <Tooltip>
            <span
              className="text-muted-foreground cursor-help"
              style={{ display: "inline-flex", alignItems: "center" }}
            >
              <TooltipTrigger asChild>
                <span
                  className="border-b border-dashed border-muted-foreground/50"
                  style={{ display: "inline-block" }}
                >
                  Profit Factor
                </span>
              </TooltipTrigger>
            </span>
            <TooltipContent side="top" sideOffset={0} align="center">
              Profit Factor is the ratio of gross profit to gross loss. Above 1
              is profitable.
            </TooltipContent>
          </Tooltip>
          <span className="font-bold">{stats.profitFactor.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default TradingPerformanceSummaryCard
