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
    <div className="w-full">
      <div className="grid grid-cols-6 gap-4 w-full">
        {/* Trade Data Table - spans all 6 columns */}
        <div className="col-span-6">
          <TradeHistoryCard
            tradesData={extractedTrades}
            accountSize={accountData?.capital || 0}
            accountBalance={accountData?.balance || 0}
          />
        </div>
      </div>
    </div>
  )
}

export default TradeHistorySection
