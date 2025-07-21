import React from "react"
import AccountInfoCard from "../cards/AccountInfoCard"
import EquityCurve from "../EquityCurve"
import { formatCurrency, getStatusColor } from "@/lib/utils"

const EquityCurveSection = ({ displayData, extractedTrades }) => {
  return (
    <div className="w-full">
        <EquityCurve tradesData={extractedTrades} />
    </div>
  )
}

export default EquityCurveSection
