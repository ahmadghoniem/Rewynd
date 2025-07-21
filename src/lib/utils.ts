import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Trading Analytics Utility Functions

export const getTotalProfitTarget = (profitTargets: Record<string, number>) => {
  return Object.values(profitTargets).reduce(
    (sum, target) => sum + target,
    0
  )
}

export const getTargetAmounts = (profitTargets: Record<string, number>, capital: number) => {
  const amounts: Record<string, number> = {}
  Object.entries(profitTargets).forEach(([phase, percentage]) => {
    amounts[phase] = (capital * percentage) / 100
  })
  return amounts
}

export const calculatePerformance = (displayData: { capital: number; realizedPnL: number; balance?: number }) => {
  console.log('Calculating performance with displayData:', displayData)
  
  if (!displayData.capital || displayData.realizedPnL === undefined || displayData.realizedPnL === null) {
    console.log('Missing capital or P&L data')
    return { percentage: 0, initialCapital: displayData.capital || 5000 }
  }
  
  const initialCapital = displayData.capital
  const performancePercentage = initialCapital > 0 ? (displayData.realizedPnL / initialCapital) * 100 : 0
  
  console.log('Performance calculation:', {
    currentBalance: displayData.balance,
    capital: displayData.capital,
    realizedPnL: displayData.realizedPnL,
    initialCapital,
    performancePercentage
  })
  
  return { percentage: performancePercentage, initialCapital }
}

export const calculateTargetProgress = (profitTargets: Record<string, number>, capital: number, realizedPnL: number) => {
  const progress: Record<string, number> = {}
  Object.entries(profitTargets).forEach(([phase, target]) => {
    const targetAmount = (capital * target) / 100
    const pnl = realizedPnL || 0
    const progressPercentage = targetAmount > 0 ? (pnl / targetAmount) * 100 : 0
    progress[phase] = Math.min(100, Math.max(0, progressPercentage))
  })
  
  console.log('Target progress calculation:', progress)
  return progress
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount)
}

export const formatLastUpdated = (timestamp: number | null) => {
  if (!timestamp) return 'Never'
  const date = new Date(timestamp)
  return date.toLocaleString()
}

export const getStatusColor = (value: number) => {
  if (value > 0) return 'text-success'
  if (value < 0) return 'text-danger'
  return 'text-muted-foreground'
}

export const calculateDrawdownMetrics = (extractedTrades: any[], initialCapital: number, maxDrawdown: number, dailyDrawdown: number) => {
  let maxDrawdownUsed = 0
  let dailyDrawdownUsed = 0
  let dailyPnLMap: Record<string, number> = {}
  let runningPnL = 0
  let maxLossInADay = 0
  let minEquity = initialCapital
  let equity = initialCapital

  // Calculate daily/max drawdown from trades
  extractedTrades.forEach(trade => {
    const realized = parseFloat(trade.realized?.replace(/[$,]/g, '') || '0')
    const date = new Date(trade.dateStart).toISOString().split('T')[0]
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
  Object.values(dailyPnLMap).forEach(dayPnL => {
    if (dayPnL < maxLossInADay) maxLossInADay = dayPnL
  })
  dailyDrawdownUsed = Math.abs(maxLossInADay) / initialCapital * 100
  
  // Progress for bars
  const maxDrawdownProgress = Math.min(100, (maxDrawdownUsed / maxDrawdown) * 100)
  const dailyDrawdownProgress = Math.min(100, (dailyDrawdownUsed / dailyDrawdown) * 100)

  // Profitable days logic
  let profitableDays = 0
  const requiredProfitableDays = 3
  const minDayProfit = 0.005 * initialCapital
  Object.values(dailyPnLMap).forEach(dayPnL => {
    if (dayPnL >= minDayProfit) profitableDays++
  })
  const profitableDaysProgress = Math.min(100, (profitableDays / requiredProfitableDays) * 100)

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
