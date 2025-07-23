import React, { useMemo } from "react"
import TradingPerformanceSummaryCard from "../cards/TradingPerformanceSummaryCard"
import WinsSummaryCard from "../cards/WinsSummaryCard"
import TradingPerformanceLossesCard from "../cards/LossesSummaryCard"
import LossesSummaryCard from "../cards/LossesSummaryCard"

const TradingPerformanceSection = ({
  extractedTrades,
  displayData,
  config
}) => {
  // Helper for formatting currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2
    }).format(amount)
  }

  // Calculate stats using useMemo for efficiency
  const stats = useMemo(() => {
    if (!extractedTrades || extractedTrades.length === 0)
      return {
        averageRR: 0,
        averageProfit: 0,
        averageLoss: 0,
        worstLoss: 0,
        bestWin: 0,
        tradesPerDay: 0,
        averageDuration: 0,
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        profitFactor: 0,
        sharpeRatio: 0,
        maxConsecutiveWins: 0,
        maxConsecutiveLosses: 0
      }
    const trades = extractedTrades.map((trade) => {
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
    const winningTrades = trades.filter((t) => t.isWin)
    const losingTrades = trades.filter((t) => t.isLoss)
    const averageRR =
      trades.reduce((sum, t) => sum + t.maxRR, 0) / trades.length
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
    const worstLoss =
      losingTrades.length > 0
        ? Math.min(...losingTrades.map((t) => t.realized))
        : 0
    const uniqueDays = new Set(trades.map((t) => t.date.toDateString())).size
    const tradesPerDay = uniqueDays > 0 ? trades.length / uniqueDays : 0
    const averageDuration =
      trades.reduce((sum, t) => sum + t.duration, 0) / trades.length
    const totalProfit = winningTrades.reduce((sum, t) => sum + t.realized, 0)
    const totalLoss = Math.abs(
      losingTrades.reduce((sum, t) => sum + t.realized, 0)
    )
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : 0
    const returns = trades.map((t) => t.realized)
    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
    const variance =
      returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) /
      returns.length
    const standardDeviation = Math.sqrt(variance)
    const sharpeRatio =
      standardDeviation > 0 ? meanReturn / standardDeviation : 0
    let maxConsecutiveWins = 0
    let maxConsecutiveLosses = 0
    let currentWins = 0
    let currentLosses = 0
    const sortedByDate = [...trades].sort((a, b) => a.date - b.date)
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
      if (currentLosses > maxConsecutiveLosses)
        maxConsecutiveLosses = currentLosses
    }
    return {
      averageRR: averageRR || 0,
      averageProfit: averageProfit || 0,
      averageLoss: averageLoss || 0,
      worstLoss: worstLoss || 0,
      bestWin: bestWin || 0,
      tradesPerDay: tradesPerDay || 0,
      averageDuration: averageDuration || 0,
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate:
        trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0,
      profitFactor: profitFactor || 0,
      sharpeRatio: sharpeRatio || 0,
      maxConsecutiveWins,
      maxConsecutiveLosses
    }
  }, [extractedTrades])

  function parseDuration(durationStr) {
    if (!durationStr) return 0
    const match = durationStr.match(/(?:(\d+)h\s*)?(?:(\d+)m)?/)
    if (match) {
      const hours = parseInt(match[1] || "0")
      const minutes = parseInt(match[2] || "0")
      return hours * 60 + minutes
    }
    return 0
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-4 w-full">
        <TradingPerformanceSummaryCard
          displayData={displayData}
          stats={stats}
          config={config}
          tradesData={extractedTrades}
        />
      </div>
    </div>
  )
}

export default TradingPerformanceSection
