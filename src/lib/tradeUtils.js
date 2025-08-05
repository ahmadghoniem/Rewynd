import { parseTradeDate } from "./utils"

// Helper to clean and parse numbers from strings
export const cleanNumber = (val) => {
  if (typeof val === "number") return val
  if (!val) return 0
  return parseFloat(val.toString().replace(/[^\d.-]/g, ""))
}

// Helper to parse PnL values consistently
const parsePnL = (realized) => {
  if (!realized) return 0
  return cleanNumber(realized)
}

// Format currency with consistent formatting
export const formatCurrency = (amount) => {
  if (!amount) return "$0.00"
  const numAmount = cleanNumber(amount)
  if (isNaN(numAmount)) return amount

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numAmount)
}

// Format numbers to 2 decimal places
export const formatNumber = (number) => {
  if (number === null || number === undefined || number === "") return "-"
  const num = cleanNumber(number)
  if (isNaN(num)) return number
  return num.toFixed(2)
}

// Get PnL color based on realized amount
export const getPnLColor = (realized) => {
  const amount = parsePnL(realized)
  if (amount === 0) return "text-muted-foreground"
  return amount > 0 ? "text-success" : "text-danger"
}

// Get side badge variant
export const getSideBadge = (side) => {
  if (!side) return "secondary"
  return side.toLowerCase() === "buy" ? "buy" : "sell"
}

// Get PnL badge variant
export const getPnLBadge = (realized) => {
  const amount = parsePnL(realized)
  if (amount === 0) return "secondary"
  return amount > 0 ? "default" : "destructive"
}

// Format date with consistent formatting
export const formatDate = (dateStr) => {
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

// Helper to pad numbers for date formatting
const pad = (n) => n.toString().padStart(2, "0")

// Format date range
export const formatDateRange = (dateStart, dateEnd) => {
  if (!dateStart || !dateEnd) return "-"
  try {
    const start = parseTradeDate(dateStart)
    const end = parseTradeDate(dateEnd)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return "-"

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

// Calculate percentage for TP and SL
export const calculatePercentage = (entry, target, side = "buy") => {
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

// Calculate historical account balance for a specific trade
export const calculateHistoricalBalance = (trade, currentBalance) => {
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

// Calculate risk percentage based on entry, sl, lot size, and historical account balance
export const calculateRiskPercentage = (trade, accountBalance) => {
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

// Calculate risk percentage based on actual trade history (RR ratio)
export const calculateRiskPercentageFromHistory = (trade, accountBalance) => {
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

// Calculate hold time from trade start and end dates
export const calculateHoldTime = (trade) => {
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

// Pre-process trade data with all calculated values
export const preprocessTradeData = (tradesData, accountBalance) => {
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
