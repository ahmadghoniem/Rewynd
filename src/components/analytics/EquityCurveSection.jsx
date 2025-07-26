import React from "react"
import EquityCurveCard from "../cards/EquityCurveCard"
import useAppStore from "@/store/useAppStore"

const EquityCurveSection = () => {
  const extractedTrades = useAppStore((state) => state.extractedTrades) || []
  const accountData = useAppStore((state) => state.accountData) || {
    capital: 0,
    realizedPnL: 0,
    balance: 0
  }
  return (
    <div className="w-full">
      <EquityCurveCard tradesData={extractedTrades} />
    </div>
  )
}

export default EquityCurveSection
