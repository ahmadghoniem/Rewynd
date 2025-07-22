import React from "react"
import DailyAnalysis from "../DailyAnalysis"

const DailyAnalysisSection = ({ extractedTrades }) => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-6 gap-4 w-full">
        <div className="col-span-6">
          <DailyAnalysis tradesData={extractedTrades} />
        </div>
      </div>
    </div>
  )
}

export default DailyAnalysisSection 