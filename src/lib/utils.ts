import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// ============================================================================
// CORE UTILITY FUNCTIONS
// ============================================================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================================================
// DATE UTILITIES
// ============================================================================

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

/**
 * Formats a date string with consistent formatting
 */
export const formatDate = (dateStr: string): string => {
  if (!dateStr) return ""
  try {
    const date = parseTradeDate(dateStr)
    return date.toLocaleString("en-GB", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    })
  } catch {
    return dateStr
  }
}

/**
 * Formats a date range between start and end dates
 */
export const formatDateRange = (dateStart: string, dateEnd: string): string => {
  if (!dateStart || !dateEnd) return "-"
  try {
    const start = parseTradeDate(dateStart)
    const end = parseTradeDate(dateEnd)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return "-"

    const pad = (n: number) => n.toString().padStart(2, "0")

    const startDate = `${pad(start.getFullYear() % 100)}/${pad(
      start.getMonth() + 1
    )}/${pad(start.getDate())}`
    const startTime = `${pad(start.getHours())}:${pad(start.getMinutes())}`
    const endDate = `${pad(end.getFullYear() % 100)}/${pad(
      end.getMonth() + 1
    )}/${pad(end.getDate())}`
    const endTime = `${pad(end.getHours())}:${pad(end.getMinutes())}`

    if (startDate === endDate) {
      return `${startDate} ${startTime} → ${endTime}`
    } else {
      return `${startDate} ${startTime} → ${endDate} ${endTime}`
    }
  } catch {
    return "-"
  }
}

/**
 * Formats a timestamp for display
 */
export const formatLastUpdated = (timestamp: number | null): string => {
  if (!timestamp) return "Never"
  const date = new Date(timestamp)
  return date.toLocaleString()
}

/**
 * Calculates hold time from trade start and end dates
 */
export const calculateHoldTime = (trade: any): string | null => {
  if (!trade.dateStart || !trade.dateEnd) return null

  try {
    const startDate = parseTradeDate(trade.dateStart)
    const endDate = parseTradeDate(trade.dateEnd)

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null

    const timeDiff = endDate.getTime() - startDate.getTime()
    const minutes = Math.floor(timeDiff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    } else {
      return `${minutes}m`
    }
  } catch {
    return null
  }
}

// ============================================================================
// NUMBER AND CURRENCY UTILITIES
// ============================================================================

/**
 * Cleans and parses numbers from strings
 */
export const cleanNumber = (val: any): number => {
  if (typeof val === "number") return val
  if (!val) return 0
  return parseFloat(val.toString().replace(/[^\d.-]/g, ""))
}

/**
 * Parses PnL values consistently
 */
export const parsePnL = (realized: any): number => {
  if (!realized) return 0
  return cleanNumber(realized)
}

/**
 * Formats currency with consistent formatting
 */
export const formatCurrency = (amount: number | string): string => {
  if (!amount) return "$0.00"
  const numAmount = cleanNumber(amount)
  if (isNaN(numAmount)) return amount.toString()

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numAmount)
}

/**
 * Formats numbers to 2 decimal places
 */
export const formatNumber = (number: any): string => {
  if (number === null || number === undefined || number === "") return "-"
  const num = cleanNumber(number)
  if (isNaN(num)) return number.toString()
  return num.toFixed(2)
}

/**
 * Calculates percentage for TP and SL
 */
export const calculatePercentage = (
  entry: any,
  target: any,
  side: string = "buy"
): string | null => {
  if (!entry || !target) return null

  const entryNum = cleanNumber(entry)
  const targetNum = cleanNumber(target)

  if (isNaN(entryNum) || isNaN(targetNum)) return null

  // For sell trades, the calculation is inverted
  const percentage =
    side?.toLowerCase() === "sell"
      ? ((entryNum - targetNum) / entryNum) * 100
      : ((targetNum - entryNum) / entryNum) * 100

  return percentage.toFixed(2)
}

// ============================================================================
// STYLING AND UI UTILITIES
// ============================================================================

/**
 * Gets PnL color based on realized amount
 */
export const getPnLColor = (realized: any): string => {
  const amount = parsePnL(realized)
  if (amount === 0) return "text-muted-foreground"
  return amount > 0 ? "text-success" : "text-danger"
}

/**
 * Gets status color based on value
 */
export const getStatusColor = (value: number): string => {
  if (value > 0) return "text-success"
  if (value < 0) return "text-danger"
  return "text-muted-foreground"
}

/**
 * Gets side badge variant
 */
export const getSideBadge = (side: string): string => {
  if (!side) return "secondary"
  return side.toLowerCase() === "buy" ? "buy" : "sell"
}

/**
 * Gets PnL badge variant
 */
export const getPnLBadge = (realized: any): string => {
  const amount = parsePnL(realized)
  if (amount === 0) return "secondary"
  return amount > 0 ? "default" : "destructive"
}

// ============================================================================
// TRADING ANALYTICS UTILITIES
// ============================================================================

/**
 * Gets total profit target from profit targets object
 */
export const getTotalProfitTarget = (
  profitTargets: Record<string, number>
): number => {
  return profitTargets.phase1 || 0
}

/**
 * Gets target amounts for profit targets
 */
export const getTargetAmounts = (
  profitTargets: Record<string, number>,
  capital: number
): Record<string, number> => {
  return {
    phase1: (capital * (profitTargets.phase1 || 0)) / 100
  }
}

/**
 * Calculates performance metrics
 */
export const calculatePerformance = (displayData: {
  capital: number
  realizedPnL: number
  balance?: number
}) => {
  if (!displayData.capital || displayData.realizedPnL === undefined) {
    return {
      profitPercentage: 0,
      profitRatio: 0,
      status: "neutral" as const
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

/**
 * Calculates target progress
 */
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

/**
 * Calculates individual target progress
 */
export const calculateIndividualTargetProgress = (
  profitTargets: Record<string, number>,
  capital: number,
  realizedPnL: number
): Record<string, number> => {
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

/**
 * Calculates historical account balance for a specific trade
 */
export const calculateHistoricalBalance = (
  trade: any,
  currentBalance: number
): number => {
  if (!trade.realized || !currentBalance) {
    return currentBalance
  }

  try {
    const realizedAmount = parsePnL(trade.realized)
    if (isNaN(realizedAmount)) {
      return currentBalance
    }

    // Historical balance = Current balance - this trade's realized PnL
    const historicalBalance = currentBalance - realizedAmount
    return Math.max(historicalBalance, 0) // Ensure balance doesn't go negative
  } catch (error) {
    console.error("Error calculating historical balance:", error)
    return currentBalance
  }
}

/**
 * Calculates risk percentage based on entry, sl, lot size, and historical account balance
 */
export const calculateRiskPercentage = (trade: any, accountBalance: number) => {
  if (!trade.size || !trade.entry || !trade.initialSL || !accountBalance)
    return null

  const sizeNum = cleanNumber(trade.size)
  const entryNum = cleanNumber(trade.entry)
  const slNum = cleanNumber(trade.initialSL)
  if (isNaN(sizeNum) || isNaN(entryNum) || isNaN(slNum)) return null

  // Calculate historical balance for this trade
  const historicalBalance = calculateHistoricalBalance(trade, accountBalance)

  // Risk per trade = (Entry − Stop Loss) × Lot Size
  let riskPerTrade = 0
  if (trade.side?.toLowerCase() === "sell") {
    riskPerTrade = (slNum - entryNum) * sizeNum
  } else {
    riskPerTrade = (entryNum - slNum) * sizeNum
  }
  if (riskPerTrade < 0) riskPerTrade = Math.abs(riskPerTrade)

  // Risk % = (Risk per trade ÷ Historical Balance) × 100
  const riskPercentage = (riskPerTrade / historicalBalance) * 100
  return {
    percent: riskPercentage.toFixed(2),
    amount: riskPerTrade,
    historicalBalance: historicalBalance
  }
}

/**
 * Calculates risk percentage based on actual trade history (RR ratio)
 */
export const calculateRiskPercentageFromHistory = (
  trade: any,
  accountBalance: number
) => {
  if (!trade.realized || !trade.maxRR || !accountBalance) return null

  const realizedAmount = parsePnL(trade.realized)
  const maxRR = cleanNumber(trade.maxRR)

  if (
    isNaN(realizedAmount) ||
    isNaN(maxRR) ||
    realizedAmount <= 0 ||
    maxRR <= 0
  )
    return null

  // Calculate historical balance for this trade
  const historicalBalance = calculateHistoricalBalance(trade, accountBalance)

  // For winning trades, calculate actual risk from RR ratio
  if (realizedAmount > 0) {
    // RR = Risk:Reward ratio (e.g., 1:2 means risk $1 to make $2)
    // So if we made $100 with 1:2 RR, our risk was $50
    const actualRiskAmount = realizedAmount / maxRR

    // Calculate risk percentage based on historical account balance
    const riskPercentage = (actualRiskAmount / historicalBalance) * 100

    return {
      percent: riskPercentage.toFixed(2),
      amount: actualRiskAmount,
      method: "historical",
      historicalBalance: historicalBalance
    }
  }

  // For losing trades, use the loss amount as risk
  const riskAmount = Math.abs(realizedAmount)
  const riskPercentage = (riskAmount / historicalBalance) * 100

  return {
    percent: riskPercentage.toFixed(2),
    amount: riskAmount,
    method: "loss",
    historicalBalance: historicalBalance
  }
}

// ============================================================================
// DRAWDOWN CALCULATIONS
// ============================================================================

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

// ============================================================================
// CONSISTENCY RULE CALCULATIONS
// ============================================================================

/**
 * Calculate consistency rule compliance with minimum trading days logic
 */
export const calculateConsistencyRule = (
  tradesData: any[],
  threshold: number = 15,
  minTradingDays: number = 0
) => {
  if (!tradesData || tradesData.length === 0) {
    return {
      isConsistent: true,
      highestDailyPercentage: 0,
      totalProfits: 0,
      dailyProfits: {},
      dailyPnLMap: {},
      violationDay: null,
      violationPercentage: 0,
      threshold,
      minTradingDays,
      tradingDays: 0,
      scenario: "no_trades",
      message: "No trades available"
    }
  }

  // Group trades by date and calculate daily profits
  const dailyProfits: Record<string, number> = {}
  const dailyPnLMap: Record<string, number> = {}
  let totalProfits = 0

  tradesData.forEach((trade) => {
    const realized = parsePnL(trade.realized)
    // Use the same date format as calculateDailyDrawdownMetrics
    const date = parseTradeDate(trade.dateStart).toISOString().split("T")[0]

    // Track all trading days (for consistency with MinimumTradingDaysCard)
    if (!dailyPnLMap[date]) {
      dailyPnLMap[date] = 0
    }
    dailyPnLMap[date] += realized

    // Only count winning trades for consistency rule calculation
    if (realized > 0) {
      dailyProfits[date] = (dailyProfits[date] || 0) + realized
      totalProfits += realized
    }
  })

  const tradingDays = Object.keys(dailyPnLMap).length

  // Scenario 1: Minimum trading days are not met
  if (minTradingDays > 0 && tradingDays < minTradingDays) {
    return {
      isConsistent: true,
      highestDailyPercentage: 0,
      totalProfits,
      dailyProfits,
      dailyPnLMap,
      violationDay: null,
      violationPercentage: 0,
      threshold,
      minTradingDays,
      tradingDays,
      scenario: "min_days_not_met",
      message: `Minimum ${minTradingDays} trading days not met (${tradingDays}/${minTradingDays})`
    }
  }

  // Scenario 2: Minimum trading days have been met OR Scenario 3: No minimum trading days requirement
  // Calculate daily profit percentages
  let highestDailyPercentage = 0
  let violationDay: string | null = null
  let violationPercentage = 0

  Object.entries(dailyProfits).forEach(([date, dailyProfit]) => {
    const dailyPercentage =
      totalProfits > 0 ? (dailyProfit / totalProfits) * 100 : 0

    if (dailyPercentage > highestDailyPercentage) {
      highestDailyPercentage = dailyPercentage
    }

    if (dailyPercentage > threshold) {
      violationDay = date
      violationPercentage = dailyPercentage
    }
  })

  const isConsistent = highestDailyPercentage <= threshold

  // Determine scenario and message
  let scenario = "calculating"
  let message = ""

  if (minTradingDays === 0) {
    // Scenario 3: No minimum trading days requirement
    scenario = "no_min_requirement"
    if (totalProfits === 0) {
      message = "No profits yet"
    } else if (isConsistent) {
      message = "Consistent trading!"
    } else {
      message = "Spread profits evenly"
    }
  } else {
    // Scenario 2: Minimum trading days have been met
    scenario = "min_days_met"
    if (totalProfits === 0) {
      message = "No profits yet"
    } else if (isConsistent) {
      message = "Consistent trading!"
    } else {
      message = "Spread profits across more days"
    }
  }

  return {
    isConsistent,
    highestDailyPercentage,
    totalProfits,
    dailyProfits,
    dailyPnLMap,
    violationDay,
    violationPercentage,
    threshold,
    minTradingDays,
    tradingDays,
    scenario,
    message
  }
}

// ============================================================================
// TRADE DATA PROCESSING
// ============================================================================

/**
 * Pre-process trade data with all calculated values
 */
export const preprocessTradeData = (
  tradesData: any[],
  accountBalance: number
) => {
  return tradesData.map((trade) => {
    // Parse dates once
    const startDate = parseTradeDate(trade.dateStart)
    const endDate = parseTradeDate(trade.dateEnd)

    // Pre-calculate all derived values
    const riskPercentage =
      calculateRiskPercentageFromHistory(trade, accountBalance) ||
      calculateRiskPercentage(trade, accountBalance)
    const holdTime = calculateHoldTime(trade)
    const formattedDates = {
      start: formatDate(trade.dateStart),
      end: formatDate(trade.dateEnd),
      range: formatDateRange(trade.dateStart, trade.dateEnd)
    }

    return {
      ...trade,
      // Cached parsed values
      startDate,
      endDate,
      // Pre-calculated values
      riskPercentage,
      holdTime,
      formattedDates,
      // Cached formatted strings
      formattedRealized: formatCurrency(trade.realized),
      pnlColor: getPnLColor(trade.realized),
      sideBadge: getSideBadge(trade.side),
      pnlBadge: getPnLBadge(trade.realized)
    }
  })
}

// ============================================================================
// CLIPBOARD AND ADDRESS UTILITIES
// ============================================================================

/**
 * Copies text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error("Failed to copy: ", err)
    return false
  }
}

/**
 * Shortens an address for display (e.g., "TQn9Y2khDD95J42FQtQTdwVVRjqQZ6Zg9g" -> "TQn9Y2...Z6Zg9g")
 */
export const shortenAddress = (address: string): string => {
  if (!address || address.length < 12) return address
  return `${address.slice(0, 6)}...${address.slice(-6)}`
}

// ============================================================================
// URL AND SESSION UTILITIES
// ============================================================================

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
