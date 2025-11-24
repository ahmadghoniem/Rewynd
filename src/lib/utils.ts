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
 * Gets a date key (YYYY-MM-DD) using local time components.
 * This ensures dates are grouped by calendar day in the user's timezone,
 * not UTC (which would cause same-day trades to split across dates).
 */
export function getLocalDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
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
 * Calculates trade duration from trade start and end dates
 */
export const calculateHeldTime = (trade: any): string | null => {
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
 * Formats currency with consistent formatting in K format (thousands)
 */
export const formatCurrency = (amount: number | string): string => {
  if (!amount) return "$0.00"

  const numAmount = cleanNumber(amount)
  if (isNaN(numAmount)) return amount.toString()

  const absAmount = Math.abs(numAmount)
  const sign = numAmount < 0 ? "-" : ""

  // Use "K" abbreviation starting from 10,000
  if (absAmount >= 10000) {
    const kValue = absAmount / 1000
    const formatted = (kValue.toFixed(2))
    return `${sign}$${formatted}K`
  }

  // Below 10,000 → show normally with commas via toLocaleString
  const formatted = absAmount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })

  return `${sign}$${formatted}`
}


/**
 * Simple currency formatting with thousands separator (commas) but no K abbreviation
 * Used for charts and places where full numeric values are preferred over abbreviated format
 */
export const simpleFormatCurrency = (amount: number | string): string => {
  if (!amount) return "$0"

  const numValue = Number(amount)
  if (isNaN(numValue)) return amount.toString()

  const sign = numValue < 0 ? "-" : ""
  const absValue = Math.abs(numValue)

  const formatted = absValue.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  return `${sign}$${formatted}`
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
 * Gets target amount for profit target
 */
export const getTargetAmount = (
  profitTarget: number,
  capital: number
): number => {
  return (capital * (profitTarget || 0)) / 100
}

/**
 * Calculates target progress
 */
export const calculateTargetProgress = (
  profitTarget: number,
  capital: number,
  realizedPnL: number
): number => {
  const targetAmount = ((profitTarget || 0) / 100) * capital

  // Handle edge case where there's no target or no capital
  if (targetAmount <= 0) {
    return 0
  }

  if (realizedPnL >= targetAmount) {
    return 100
  } else {
    return Math.max(0, (realizedPnL / targetAmount) * 100)
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
 * Calculate actual risk amount for a losing trade
 * Handles both completed stop loss hits and premature closes
 */
const calculateLossRiskAmount = (trade: any): number => {
  const realized = parsePnL(trade.realized)
  const entry = cleanNumber(trade.entry)
  const sl = cleanNumber(trade.initialSL)
  const close = cleanNumber(trade.closeAvg)

  // Hit stop loss: actual risk = realized loss
  if (close === sl) return Math.abs(realized)

  // Calculate price moves
  const slMove = Math.abs(entry - sl)
  const closeMove = Math.abs(entry - close)

  // Premature close: scale risk by ratio of moves
  if (slMove > 0 && closeMove > 0) {
    return (Math.abs(realized) * slMove) / closeMove
  }

  return Math.abs(realized)
}

/**
 * Calculates risk percentage based on actual trade history (RR ratio)
 * Returns null for break-even trades (realizedAmount = 0 or very close to 0)
 */
export const calculateRiskPercentage = (trade: any, accountBalance: number) => {
  const realizedAmount = parsePnL(trade.realized)
  const maxRR = cleanNumber(trade.maxRR)

  // Check if trade is break-even (realizedAmount is exactly 0)
  // For exactly 0, we cannot determine the risk amount
  if (realizedAmount === 0) {
    return null
  }

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
      historicalBalance: historicalBalance
    }
  }

  // For losing trades, calculate actual risk amount
  const riskAmount = calculateLossRiskAmount(trade)

  const riskPercentage = (riskAmount / historicalBalance) * 100

  return {
    percent: riskPercentage.toFixed(2),
    amount: riskAmount,
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

  // Sort trades by close date to process chronologically
  const sortedTrades = extractedTrades.sort((a, b) => {
    const dateA = parseTradeDate(a.dateEnd || a.dateStart)
    const dateB = parseTradeDate(b.dateEnd || b.dateStart)
    return dateA.getTime() - dateB.getTime()
  })

  // Group trades by close date (dateEnd) because that's when P&L is realized
  sortedTrades.forEach((trade) => {
    try {
      const realized = parseFloat(trade.realized?.replace(/[$,]/g, "") || "0")
      const date = getLocalDateKey(parseTradeDate(trade.dateEnd || trade.dateStart))

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

  // Calculate daily PnL from trades (grouped by close date when P&L is realized)
  extractedTrades.forEach((trade) => {
    try {
      const realized = parseFloat(trade.realized?.replace(/[$,]/g, "") || "0")
      const date = getLocalDateKey(parseTradeDate(trade.dateEnd || trade.dateStart))

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

// ============================================================================
// CONSISTENCY RULE CALCULATIONS
// ============================================================================

/**
 * Calculate consistency rule compliance based on daily profit distribution
 * Ensures no single day contributes more than the threshold percentage of total profits
 */
export const calculateConsistencyRule = (
  tradesData: any[],
  threshold: number = 15
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
      tradingDays: 0,
      message: "No trades available"
    }
  }

  // Group trades by date and calculate daily profits
  const dailyProfits: Record<string, number> = {}
  const dailyPnLMap: Record<string, number> = {}
  let totalProfits = 0

  tradesData.forEach((trade) => {
    const realized = parsePnL(trade.realized)
    // Group by close date (dateEnd) because that's when P&L is realized
    const date = getLocalDateKey(parseTradeDate(trade.dateEnd || trade.dateStart))

    // Track all trading days
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

  // Calculate daily profit percentages and find violations
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

  // Determine message based on current state
  let message = ""
  if (totalProfits === 0) {
    message = "No profits yet"
  } else if (isConsistent) {
    message = "Consistent trading!"
  } else {
    message = "Spread profits evenly"
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
    tradingDays,
    message
  }
}

// ============================================================================
// TRADE DATA PROCESSING
// ============================================================================

/**
 * Check if a trade is breakeven based on maxRR value and risk-based analysis
 * A trade is considered breakeven if:
 * - maxRR is "N/A", or
 * - The R/R ratio is between 0 and 0.1 (inclusive), or
 * - For "Loss" trades: realized P&L is within ±10% of the actual risk amount
 *   (accounts for premature closes by calculating intended vs actual price movement)
 *
 * @param trade - The trade object with maxRR, entry, initialSL, closeAvg, and realized properties
 * @returns true if the trade is breakeven, false otherwise
 */
export const isBreakevenTrade = (trade: any): boolean => {
  // Check for "N/A" string
  if (trade.maxRR === "N/A") {
    return true
  }

  // Parse the numeric R/R value
  const rrNum = parseFloat(trade.maxRR)

  // Check if it's within breakeven range (0 to 0.1)
  if (!isNaN(rrNum) && rrNum >= 0 && rrNum <= 0.1) {
    return true
  }

  // For "Loss" string: Check realized P&L vs risk taken
  if (trade.maxRR === "Loss") {
    const riskAmount = calculateLossRiskAmount(trade)
    const realized = parsePnL(trade.realized)

    if (riskAmount > 0) {
      const realizedRR = realized / riskAmount
      if (Math.abs(realizedRR) <= 0.1) return true
    }
  }

  // Otherwise, it's not breakeven
  return false
}

/**
 * Get the display value for R/R based on maxRR
 * Returns "B/E" for breakeven trades, "-1" for "Loss" string, or the actual value
 *
 * @param trade - The trade object with maxRR, entry, initialSL, closeAvg, and realized properties
 * @returns The formatted R/R display value
 */
export const getRRDisplayValue = (trade: any): string => {
  const maxRR = trade?.maxRR

  // First check for "N/A"
  if (maxRR === "N/A") {
    return "B/E"
  }

  // Parse the numeric value
  const rrNum = parseFloat(maxRR)

  // Check if it's within breakeven range (0 to 0.1)
  if (!isNaN(rrNum) && rrNum >= 0 && rrNum <= 0.1) {
    return "B/E"
  }

  // If it's the string "Loss", check if trade is breakeven using risk-based logic
  if (maxRR === "Loss") {
    const riskAmount = calculateLossRiskAmount(trade)
    const realized = parsePnL(trade.realized)

    if (riskAmount > 0) {
      const realizedRR = realized / riskAmount
      if (Math.abs(realizedRR) <= 0.1) return "B/E"
    }

    return "-1"
  }

  // Otherwise, return the actual maxRR value
  return maxRR || ""
}

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
    // Prioritize initial SL calculation (most accurate for actual risk taken)
    // Only use history-based calculation when initial SL data is unavailable
    const riskPercentage = calculateRiskPercentage(trade, accountBalance)
    const heldTime = calculateHeldTime(trade)
    const formattedDates = {
      start: formatDate(trade.dateStart),
      end: formatDate(trade.dateEnd),
    }

    return {
      ...trade,
      // Cached parsed values
      startDate,
      endDate,
      // Pre-calculated values
      riskPercentage,
      heldTime,
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

// ============================================================================
// URL AND SESSION UTILITIES
// ============================================================================
