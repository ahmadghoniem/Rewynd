import React from "react"
import DailyRecap from "../cards/DailyRecapCard"

const DailyRecapSection = ({ extractedTrades }) => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-6 gap-4 w-full">
        <div className="col-span-6">
          <DailyRecap extractedTrades={extractedTrades} />
        </div>
      </div>
    </div>
  )
}

export default DailyRecapSection
