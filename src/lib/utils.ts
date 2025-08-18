import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parses the date format used in sample trades (e.g., "6/06/25, 2:03 AM")
 * and returns a valid Date object
 */
export function parseTradeDate(dateString: string): Date {
  if (!dateString) return new Date()

  // Handle the format "6/06/25, 2:03 AM"
  const match = dateString.match(/(\d+)\/(\d+)\/(\d+),\s*(\d+):(\d+)\s*(AM|PM)/)
  if (match) {
    const [, month, day, year, hour, minute, ampm] = match
    const fullYear = parseInt(year) + 2000 // Convert 25 to 2025
    const monthIndex = parseInt(month) - 1 // Month is 0-indexed
    const dayNum = parseInt(day)
    let hourNum = parseInt(hour)

    // Convert to 24-hour format
    if (ampm === "PM" && hourNum !== 12) {
      hourNum += 12
    } else if (ampm === "AM" && hourNum === 12) {
      hourNum = 0
    }

    return new Date(fullYear, monthIndex, dayNum, hourNum, parseInt(minute))
  }

  // Fallback to regular Date parsing
  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    console.warn(`Invalid date format: ${dateString}, using current date`)
    return new Date()
  }
  return date
}

// Trading Analytics Utility Functions

export const getTotalProfitTarget = (profitTargets: Record<string, number>) => {
  return profitTargets.phase1 || 0
}

export const getTargetAmounts = (
  profitTargets: Record<string, number>,
  capital: number
) => {
  return {
    phase1: (capital * (profitTargets.phase1 || 0)) / 100
  }
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
  const targetPercentage = profitTargets.phase1 || 0
  const phaseTargetAmount = (targetPercentage / 100) * capital

  // Handle edge case where there's no target or no capital
  if (phaseTargetAmount <= 0) {
    return { phase1: 0 }
  }

  if (realizedPnL >= phaseTargetAmount) {
    return { phase1: 100 }
  } else {
    return { phase1: Math.max(0, (realizedPnL / phaseTargetAmount) * 100) }
  }
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

export const calculateMaxDrawdownMetrics = (
  extractedTrades: any[],
  initialCapital: number,
  accountBalance: number,
  maxDrawdown: number,
  maxDrawdownType: string = "static"
) => {
  if (!initialCapital || !maxDrawdown || !extractedTrades.length) {
    return {
      maxDrawdownProgress: 0,
      maxDrawdownUsed: 0,
      trailingLossEquityLimit: initialCapital,
      maxDrawdownAmount: 0,
      maxDrawdownTargetAmount: 0
    }
  }

  // Calculate max equity from sorted trades
  const sortedTrades = extractedTrades.sort((a, b) => a.rowIndex - b.rowIndex)
  let runningPnL = 0
  let maxEquity = initialCapital

  sortedTrades.forEach((trade) => {
    const realized = parseFloat(trade.realized?.replace(/[$,]/g, "") || "0")
    runningPnL += realized
    const currentEquity = initialCapital + runningPnL
    if (currentEquity > maxEquity) maxEquity = currentEquity
  })

  // Determine base value for calculations based on drawdown type
  const baseValue =
    maxDrawdownType === "trailing_scaling" ? maxEquity : initialCapital
  const currentDrawdownAmount = Math.max(0, maxEquity - accountBalance)
  const maxDrawdownUsed = (currentDrawdownAmount / baseValue) * 100
  const maxDrawdownAmount = (maxDrawdownUsed / 100) * baseValue
  const maxDrawdownTargetAmount = (maxDrawdown / 100) * baseValue

  // Calculate equity limit
  const trailingLossEquityLimit = maxEquity - (maxDrawdown / 100) * baseValue
  const maxDrawdownProgress = Math.min(
    100,
    (maxDrawdownUsed / maxDrawdown) * 100
  )

  return {
    maxDrawdownProgress,
    maxDrawdownUsed,
    trailingLossEquityLimit,
    maxDrawdownAmount,
    maxDrawdownTargetAmount
  }
}

export const calculateDailyDrawdownMetrics = (
  extractedTrades: any[],
  initialCapital: number,
  dailyDrawdown: number
) => {
  // Handle edge cases
  if (!initialCapital || !dailyDrawdown || !extractedTrades.length) {
    return {
      dailyDrawdownUsed: 0,
      dailyDrawdownProgress: 0,
      dailyDrawdownAmount: 0,
      dailyDrawdownTargetAmount: 0,
      eodBalance: initialCapital,
      dailyLossEquityLimit: initialCapital,
      dailyPnLMap: {}
    }
  }

  let dailyPnLMap: Record<string, number> = {}

  // Sort trades by date to process chronologically
  const sortedTrades = extractedTrades.sort((a, b) => {
    const dateA = parseTradeDate(a.dateStart)
    const dateB = parseTradeDate(b.dateStart)
    return dateA.getTime() - dateB.getTime()
  })

  // Group trades by date and calculate daily P&L
  sortedTrades.forEach((trade) => {
    try {
      const realized = parseFloat(trade.realized?.replace(/[$,]/g, "") || "0")
      const date = parseTradeDate(trade.dateStart).toISOString().split("T")[0]

      if (!dailyPnLMap[date]) {
        dailyPnLMap[date] = 0
      }
      dailyPnLMap[date] += realized
    } catch (error) {
      console.warn("Error processing trade:", trade, error)
    }
  })

  // Find the latest/current trading date
  const sortedDates = Object.keys(dailyPnLMap).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  )

  if (sortedDates.length === 0) {
    return {
      dailyDrawdownUsed: 0,
      dailyDrawdownProgress: 0,
      dailyDrawdownAmount: 0,
      dailyDrawdownTargetAmount: 0,
      eodBalance: initialCapital,
      dailyLossEquityLimit: initialCapital,
      dailyPnLMap: {}
    }
  }

  const currentDate = sortedDates[sortedDates.length - 1] // Latest trading date

  // Calculate balance at START of current day (previous day's EOD balance)
  let currentDayStartBalance = initialCapital

  // Add up all P&L from days BEFORE current day
  sortedDates.forEach((date) => {
    if (date < currentDate) {
      currentDayStartBalance += dailyPnLMap[date]
    }
  })

  // Get current day's P&L
  const currentDayPnL = dailyPnLMap[currentDate] || 0
  const currentDayLoss = currentDayPnL < 0 ? Math.abs(currentDayPnL) : 0

  // Calculate current day's drawdown metrics
  const dailyDrawdownTargetAmount =
    (dailyDrawdown / 100) * currentDayStartBalance
  const dailyDrawdownAmount = currentDayLoss
  const dailyDrawdownUsed =
    currentDayLoss > 0 ? (currentDayLoss / currentDayStartBalance) * 100 : 0
  const dailyDrawdownProgress = Math.min(
    100,
    Math.max(0, (dailyDrawdownUsed / dailyDrawdown) * 100)
  )

  // Calculate equity limits and balances
  const dailyLossEquityLimit =
    currentDayStartBalance - dailyDrawdownTargetAmount

  return {
    dailyDrawdownUsed,
    dailyDrawdownProgress,
    dailyDrawdownAmount,
    dailyDrawdownTargetAmount,
    currentDayStartBalance,
    dailyLossEquityLimit,
    dailyPnLMap
  }
}

export const calculateProfitableDaysMetrics = (
  extractedTrades: any[],
  initialCapital: number
) => {
  // Handle edge cases
  if (!initialCapital) {
    return {
      profitableDays: 0,
      profitableDaysProgress: 0,
      tradingDays: 0
    }
  }

  let dailyPnLMap: Record<string, number> = {}

  // Calculate daily PnL from trades
  extractedTrades.forEach((trade) => {
    try {
      const realized = parseFloat(trade.realized?.replace(/[$,]/g, "") || "0")
      const date = parseTradeDate(trade.dateStart).toISOString().split("T")[0]

      if (!dailyPnLMap[date]) dailyPnLMap[date] = 0
      dailyPnLMap[date] += realized
    } catch (error) {
      console.warn("Error processing trade:", trade, error)
    }
  })

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
  if (!trades || trades.length === 0 || !initialCapital) return initialCapital

  // Group trades by day
  const dayMap: Record<string, number> = {}

  try {
    trades.forEach((trade) => {
      if (!trade || !trade.dateStart || !trade.realized) return

      const realized = parseFloat(trade.realized?.replace(/[$,]/g, "") || "0")
      const date = parseTradeDate(trade.dateStart).toISOString().split("T")[0]
      if (!dayMap[date]) dayMap[date] = 0
      dayMap[date] += realized
    })
  } catch (error) {
    console.warn("Error processing trades in getPreviousEOD:", error)
    return initialCapital
  }

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

/**
 * Extracts the session ID from the current URL
 * In production: extracts from fxreplay.com URL path
 * In development: uses a mock session ID for testing
 */
export function getSessionIdFromUrl(): string {
  // Check if we're in development mode (localhost)
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    // In development, use the mock session ID from the example URL
    return "56f3904d44d8"
  }

  // In production, extract from the URL path
  const pathSegments = window.location.pathname.split("/")
  const lastSegment = pathSegments[pathSegments.length - 1]

  // The session ID is the last part after the last dash
  const sessionId = lastSegment.split("-").pop()

  return sessionId || "56f3904d44d8" // fallback to the example session ID
}
