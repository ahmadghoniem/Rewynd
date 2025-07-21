import React from "react"
import TradingStatsTable from "../TradingStatsTable"

const TradingPerformanceSection = ({ extractedTrades, displayData, config }) => {
  return (
    <div className="w-full">
      {/* <h2 className="text-2xl font-bold mb-4 text-foreground dark:text-white">Trading Performance Metrics</h2> */}
      <div className="grid grid-cols-6 gap-4 w-full">
        {/* Trading Stats Table - spans all 6 columns */}
        <div className="col-span-6">
          <TradingStatsTable tradesData={extractedTrades} displayData={displayData} config={config} />
        </div>
      </div>
    </div>
  )
}

export default TradingPerformanceSection
