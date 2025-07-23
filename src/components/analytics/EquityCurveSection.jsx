import React from "react"
import EquityCurveCard from "../cards/EquityCurveCard"

const EquityCurveSection = ({ extractedTrades }) => {
  return (
    <div className="w-full">
      <EquityCurveCard tradesData={extractedTrades} />
    </div>
  )
}

export default EquityCurveSection
