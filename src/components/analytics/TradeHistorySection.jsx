import React from "react"
import TradeHistoryCard from "../cards/TradeHistoryCard"

const TradeHistorySection = ({ extractedTrades, displayData }) => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-6 gap-4 w-full">
        {/* Trade Data Table - spans all 6 columns */}
        <div className="col-span-6">
          <TradeHistoryCard
            tradesData={extractedTrades}
            accountSize={displayData?.capital || 0}
            accountBalance={displayData?.balance || 0}
          />
        </div>
      </div>
    </div>
  )
}

export default TradeHistorySection
