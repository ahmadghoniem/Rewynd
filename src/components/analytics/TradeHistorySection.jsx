import React from "react"
import TradeHistoryCard from "../cards/TradeHistoryCard"
import useAppStore from "@/store/useAppStore"

const TradeHistorySection = () => {
  const extractedTrades = useAppStore((state) => state.extractedTrades) || []
  const accountData = useAppStore((state) => state.accountData) || {
    capital: 0,
    realizedPnL: 0,
    balance: 0
  }
  return (
    <div className="w-full flex-1">
      <TradeHistoryCard
        tradesData={extractedTrades}
        accountSize={accountData?.capital || 0}
        accountBalance={accountData?.balance || 0}
      />
    </div>
  )
}

export default TradeHistorySection
