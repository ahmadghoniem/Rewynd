import React from "react"
import DailyAnalysis from "../DailyAnalysis"

const DailyAnalysisSection = ({ extractedTrades }) => {
  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Daily Trading Analysis
      </h2>
      <div className="grid grid-cols-6 gap-4 w-full">
        {/* Daily Analysis - spans all 6 columns */}
        <div className="col-span-6">
          <DailyAnalysis tradesData={extractedTrades} />
        </div>
      </div>
    </div>
  )
}

export default DailyAnalysisSection 