import React from "react"
import AccountInfoCard from "../cards/AccountInfoCard"
import EquityCurve from "../EquityCurve"
import { formatCurrency, getStatusColor } from "@/lib/utils"

const EquityCurveSection = ({ displayData, extractedTrades }) => {
  return (
    <div className="w-full">
      {/* <h2 className="text-2xl font-bold mb-4 text-foreground dark:text-white">
        Equity Curve & Performance Tracking
      </h2> */}
      <div>
        {/* Account Info Card - spans 2 columns */}
        {/* <div className="col-span-2">
          <AccountInfoCard
            capital={displayData.capital}
            balance={displayData.balance}
            realizedPnL={displayData.realizedPnL}
            formatCurrency={formatCurrency}
            getStatusColor={getStatusColor}
          />
        </div> */}

        {/* Equity Curve - spans 4 columns */}
        <EquityCurve tradesData={extractedTrades} />
      </div>
    </div>
  )
}

export default EquityCurveSection
