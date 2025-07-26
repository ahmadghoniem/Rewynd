import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Trading Analytics Utility Functions

export const getTotalProfitTarget = (profitTargets: Record<string, number>) => {
  return Object.values(profitTargets).reduce((sum, target) => sum + target, 0)
}

export const getTargetAmounts = (
  profitTargets: Record<string, number>,
  capital: number
) => {
  const amounts: Record<string, number> = {}
  Object.entries(profitTargets).forEach(([phase, percentage]) => {
    amounts[phase] = (capital * percentage) / 100
  })
  return amounts
}

export const calculatePerformance = (displayData: {
  capital: number
  realizedPnL: number
  balance?: number
}) => {
  if (!displayData.capital || displayData.realizedPnL === undefined) {
    return {
      profitPercentage: 0,
      profitRatio: 0,
      status: "neutral"
    }
  }

  const profitPercentage = (displayData.realizedPnL / displayData.capital) * 100
  const profitRatio = displayData.realizedPnL / displayData.capital

  let status: "positive" | "negative" | "neutral" = "neutral"
  if (profitPercentage > 0) {
    status = "positive"
  } else if (profitPercentage < 0) {
    status = "negative"
  }

  return {
    profitPercentage,
    profitRatio,
    status
  }
}

export const calculateTargetProgress = (
  profitTargets: Record<string, number>,
  capital: number,
  realizedPnL: number
) => {
  const totalTarget = getTotalProfitTarget(profitTargets)
  const targetAmount = (totalTarget / 100) * capital
  const progress = Math.min(100, (realizedPnL / targetAmount) * 100)

  return {
    totalTarget,
    targetAmount,
    progress,
    status: progress >= 100 ? "completed" : "in-progress"
  }
}

export const calculateIndividualTargetProgress = (
  profitTargets: Record<string, number>,
  capital: number,
  realizedPnL: number
) => {
  const progress: Record<string, number> = {}

  // Calculate cumulative progress for each phase
  let cumulativeTarget = 0
  let cumulativeProgress = 0

  Object.entries(profitTargets).forEach(([phase, targetPercentage]) => {
    cumulativeTarget += targetPercentage
    const phaseTargetAmount = (cumulativeTarget / 100) * capital
    const phaseProgress = Math.min(100, (realizedPnL / phaseTargetAmount) * 100)

    // Calculate individual phase progress (difference from previous cumulative)
    const previousCumulativeProgress = cumulativeProgress
    cumulativeProgress = phaseProgress

    // Individual phase progress is the difference
    const individualProgress = Math.max(
      0,
      cumulativeProgress - previousCumulativeProgress
    )
    progress[phase] = Math.min(100, individualProgress)
  })

  return progress
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2
  }).format(amount)
}

export const formatLastUpdated = (timestamp: number | null) => {
  if (!timestamp) return "Never"
  const date = new Date(timestamp)
  return date.toLocaleString()
}

export const getStatusColor = (value: number) => {
  if (value > 0) return "text-success"
  if (value < 0) return "text-danger"
  return "text-muted-foreground"
}

export const calculateDrawdownMetrics = (
  extractedTrades: any[],
  initialCapital: number,
  maxDrawdown: number,
  dailyDrawdown: number
) => {
  let maxDrawdownUsed = 0
  let dailyDrawdownUsed = 0
  let dailyPnLMap: Record<string, number> = {}
  let runningPnL = 0
  let maxLossInADay = 0
  let minEquity = initialCapital
  let equity = initialCapital

  // Calculate daily/max drawdown from trades
  extractedTrades.forEach((trade) => {
    const realized = parseFloat(trade.realized?.replace(/[$,]/g, "") || "0")
    const date = new Date(trade.dateStart).toISOString().split("T")[0]
    runningPnL += realized
    equity = initialCapital + runningPnL
    if (equity < minEquity) minEquity = equity
    // Daily drawdown
    if (!dailyPnLMap[date]) dailyPnLMap[date] = 0
    dailyPnLMap[date] += realized
  })

  // Max drawdown used (as %)
  maxDrawdownUsed = ((initialCapital - minEquity) / initialCapital) * 100

  // Daily drawdown used (as % of the worst day)
  Object.values(dailyPnLMap).forEach((dayPnL) => {
    if (dayPnL < maxLossInADay) maxLossInADay = dayPnL
  })
  dailyDrawdownUsed = (Math.abs(maxLossInADay) / initialCapital) * 100

  // Progress for bars
  const maxDrawdownProgress = Math.min(
    100,
    (maxDrawdownUsed / maxDrawdown) * 100
  )
  const dailyDrawdownProgress = Math.min(
    100,
    (dailyDrawdownUsed / dailyDrawdown) * 100
  )

  // Profitable days logic
  let profitableDays = 0
  const requiredProfitableDays = 3
  const minDayProfit = 0.005 * initialCapital
  Object.values(dailyPnLMap).forEach((dayPnL) => {
    if (dayPnL >= minDayProfit) profitableDays++
  })
  const profitableDaysProgress = Math.min(
    100,
    (profitableDays / requiredProfitableDays) * 100
  )

  // Calculate trading days (unique days with trades)
  const tradingDays = Object.keys(dailyPnLMap).length

  return {
    maxDrawdownUsed,
    dailyDrawdownUsed,
    dailyPnLMap,
    maxDrawdownProgress,
    dailyDrawdownProgress,
    profitableDays,
    profitableDaysProgress,
    tradingDays
  }
}

/**
 * Returns the equity at the end of the previous day.
 * @param trades Array of trade objects (must have dateStart and realized fields)
 * @param initialCapital Starting account size
 * @returns previousEOD (number)
 */
export function getPreviousEOD(trades: any[], initialCapital: number): number {
  if (!trades || trades.length === 0) return initialCapital
  // Group trades by day
  const dayMap: Record<string, number> = {}
  trades.forEach((trade) => {
    const realized = parseFloat(trade.realized?.replace(/[$,]/g, "") || "0")
    const date = new Date(trade.dateStart).toISOString().split("T")[0]
    if (!dayMap[date]) dayMap[date] = 0
    dayMap[date] += realized
  })
  // Get all days sorted
  const allDays = Object.keys(dayMap).sort()
  if (allDays.length === 0) return initialCapital
  // Get yesterday (previous day to today, or last day if no today trades)
  const today = new Date().toISOString().split("T")[0]
  let prevDay = allDays[allDays.length - 1]
  if (allDays.includes(today)) {
    const todayIdx = allDays.indexOf(today)
    prevDay = todayIdx > 0 ? allDays[todayIdx - 1] : allDays[0]
  }
  // Sum realized PnL up to and including prevDay
  let runningPnL = 0
  for (const day of allDays) {
    if (day > prevDay) break
    runningPnL += dayMap[day]
  }
  return initialCapital + runningPnL
}
