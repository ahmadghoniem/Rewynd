import React from "react"
import TradeDataTable from "../TradeDataTable"

const TradeDataSection = ({ extractedTrades, displayData }) => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-6 gap-4 w-full">
        {/* Trade Data Table - spans all 6 columns */}
        <div className="col-span-6">
          <TradeDataTable tradesData={extractedTrades} accountSize={displayData?.capital || 0} accountBalance={displayData?.balance || 0} />
        </div>
      </div>
    </div>
  )
}

export default TradeDataSection 