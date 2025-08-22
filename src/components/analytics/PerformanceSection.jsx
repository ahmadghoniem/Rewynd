import React, { useMemo } from "react"
import { formatCurrency } from "@/lib/utils"
import useAppStore from "@/store/useAppStore"
import WinsSummaryCard from "@/components/cards/WinsSummaryCard"
import LossesSummaryCard from "@/components/cards/LossesSummaryCard"
import AvgRRCard from "@/components/cards/AvgRRCard"
import CurrentStreakCard from "@/components/cards/CurrentStreakCard"
import ProfitFactorCard from "@/components/cards/ProfitFactorCard"
import TraderExpectancyCard from "@/components/cards/TraderExpectancyCard"
import BalanceAndRealizedPnlCard from "@/components/cards/BalanceAndRealizedPnlCard"
import WinRateCard from "@/components/cards/winRateCard.jsx"
import { parseTradeDate } from "@/lib/utils"

const PerformanceSection = () => {
  const extractedTrades = useAppStore((state) => state.extractedTrades) || []
  const sessionData = useAppStore((state) => state.sessionData) || {
    id: null,
    capital: 0,
    realizedPnL: 0,
    balance: 0
  }

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
      const duration = 0 // You can add duration parsing if needed
      const date = parseTradeDate(trade.dateStart)
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

  return (
    <div className="grid grid-cols-8 gap-2 [&>*]:max-h-[4.375rem] ">
      <BalanceAndRealizedPnlCard
        displayData={sessionData}
        className="col-span-full lg:col-span-4"
      />
      <WinRateCard
        extractedTrades={extractedTrades}
        className="col-span-full lg:col-span-2"
      />
      <AvgRRCard
        extractedTrades={extractedTrades}
        className="col-span-full lg:col-span-1"
      />
      <ProfitFactorCard
        extractedTrades={extractedTrades}
        className="col-span-full lg:col-span-1"
      />
      <LossesSummaryCard
        stats={stats}
        formatCurrency={formatCurrency}
        className="col-span-full lg:col-span-3"
      />
      <WinsSummaryCard
        stats={stats}
        formatCurrency={formatCurrency}
        className="col-span-full lg:col-span-3"
      />
      <TraderExpectancyCard
        extractedTrades={extractedTrades}
        className="col-span-full lg:col-span-1"
      />
      <CurrentStreakCard
        extractedTrades={extractedTrades}
        className="col-span-full lg:col-span-1"
      />
    </div>
  )
}

export default PerformanceSection
