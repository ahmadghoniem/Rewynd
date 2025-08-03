import { parseTradeDate } from "./utils"

// Format currency with consistent formatting
export const formatCurrency = (amount) => {
  if (!amount) return "$0.00"
  const cleanAmount = amount.toString().replace(/[$,]/g, "")
  const numAmount = parseFloat(cleanAmount)
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
  const num = parseFloat(number)
  if (isNaN(num)) return number
  return num.toFixed(2)
}

// Get PnL color based on realized amount
export const getPnLColor = (realized) => {
  if (!realized) return "text-muted-foreground"
  const cleanAmount = realized.replace(/[$,]/g, "")
  const amount = parseFloat(cleanAmount)
  return amount > 0 ? "text-success" : "text-danger"
}

// Get side badge variant
export const getSideBadge = (side) => {
  if (!side) return "secondary"
  return side.toLowerCase() === "buy" ? "buy" : "sell"
}

// Get PnL badge variant
export const getPnLBadge = (realized) => {
  if (!realized) return "secondary"
  const cleanAmount = realized.replace(/[$,]/g, "")
  const amount = parseFloat(cleanAmount)
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

// Format date range
export const formatDateRange = (dateStart, dateEnd) => {
  if (!dateStart || !dateEnd) return "-"
  try {
    const start = parseTradeDate(dateStart)
    const end = parseTradeDate(dateEnd)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return "-"

    const pad = (n) => n.toString().padStart(2, "0")
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

  const entryNum = parseFloat(entry)
  const targetNum = parseFloat(target)

  if (isNaN(entryNum) || isNaN(targetNum)) return null

  // For sell trades, the calculation is inverted
  const percentage =
    side?.toLowerCase() === "sell"
      ? ((entryNum - targetNum) / entryNum) * 100
      : ((targetNum - entryNum) / entryNum) * 100

  return percentage.toFixed(2)
}

// Helper to clean and parse numbers from strings
export const cleanNumber = (val) => {
  if (typeof val === "number") return val
  if (!val) return 0
  return parseFloat(val.toString().replace(/[^\d.-]/g, ""))
}

// Calculate risk percentage based on entry, sl, lot size, and current account balance
export const calculateRiskPercentage = (trade, accountBalance) => {
  if (!trade.size || !trade.entry || !trade.initialSL || !accountBalance)
    return null

  const sizeNum = cleanNumber(trade.size)
  const entryNum = cleanNumber(trade.entry)
  const slNum = cleanNumber(trade.initialSL)
  if (isNaN(sizeNum) || isNaN(entryNum) || isNaN(slNum)) return null

  // Risk per trade = (Entry − Stop Loss) × Lot Size
  let riskPerTrade = 0
  if (trade.side?.toLowerCase() === "sell") {
    riskPerTrade = (slNum - entryNum) * sizeNum
  } else {
    riskPerTrade = (entryNum - slNum) * sizeNum
  }
  if (riskPerTrade < 0) riskPerTrade = Math.abs(riskPerTrade)
  // Risk % = (Risk per trade ÷ Current Balance) × 100
  const riskPercentage = (riskPerTrade / accountBalance) * 100
  return {
    percent: riskPercentage.toFixed(2),
    amount: riskPerTrade
  }
}

// Get risk level color based on percentage
export const getRiskLevelColor = (riskPercentage) => {
  const risk = parseFloat(riskPercentage)
  if (isNaN(risk)) return "text-muted-foreground"
  if (risk <= 1) return "text-success" // Low risk
  if (risk <= 2) return "text-warning" // Medium risk
  if (risk <= 5) return "text-warning" // High risk
  return "text-danger" // Very high risk
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
    // Parse and clean realized amount once
    const cleanRealized = trade.realized?.replace(/[$,]/g, "") || "0"
    const realizedAmount = parseFloat(cleanRealized)

    // Parse dates once
    const startDate = parseTradeDate(trade.dateStart)
    const endDate = parseTradeDate(trade.dateEnd)

    // Pre-calculate all derived values
    const riskPercentage = calculateRiskPercentage(trade, accountBalance)
    const holdTime = calculateHoldTime(trade)
    const formattedDates = {
      start: formatDate(trade.dateStart),
      end: formatDate(trade.dateEnd),
      range: formatDateRange(trade.dateStart, trade.dateEnd)
    }

    return {
      ...trade,
      // Cached parsed values
      realizedAmount,
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
