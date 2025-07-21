import React from "react"
import TradeDataTable from "../TradeDataTable"

const TradeDataSection = ({ extractedTrades, displayData }) => {
  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Trading Performance
      </h2>
      <div className="grid grid-cols-6 gap-4 w-full">
        {/* Trade Data Table - spans all 6 columns */}
        <div className="col-span-6">
          <TradeDataTable tradesData={extractedTrades} accountSize={displayData?.capital || 0} />
        </div>
      </div>
    </div>
  )
}

export default TradeDataSection 