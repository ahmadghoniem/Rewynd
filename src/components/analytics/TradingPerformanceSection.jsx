import React from "react"
import TradingStatsTable from "../TradingStatsTable"

const TradingPerformanceSection = ({ extractedTrades }) => {
  return (
    <div className="w-full">
      {/* <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Trading Performance Metrics</h2> */}
      <div className="grid grid-cols-6 gap-4 w-full">
        {/* Trading Stats Table - spans all 6 columns */}
        <div className="col-span-6">
          <TradingStatsTable tradesData={extractedTrades} />
        </div>
      </div>
    </div>
  )
}

export default TradingPerformanceSection 