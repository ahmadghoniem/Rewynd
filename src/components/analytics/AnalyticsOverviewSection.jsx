import React from "react"
import EquityCurveSection from "./EquityCurveSection"
import TradingPerformanceSection from "./TradingPerformanceSection"

const AnalyticsOverviewSection = ({ displayData, extractedTrades }) => {
  return (
    <div className="w-full grid grid-cols-3 gap-6">
      {/* Equity Curve Section - spans 2/3 */}
      <div className="col-span-2">
        <EquityCurveSection displayData={displayData} extractedTrades={extractedTrades} />
      </div>
      {/* Trading Performance Section - spans 1/3 */}
      <div className="col-span-1">
        <TradingPerformanceSection extractedTrades={extractedTrades} />
      </div>
    </div>
  )
}

export default AnalyticsOverviewSection 