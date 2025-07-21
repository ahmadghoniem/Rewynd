import React from "react"
import PhasesCard from "../cards/ProfitTargetsCard"
import DrawdownRulesCard from "../cards/DrawdownRulesCard"
import TradingActivityCard from "../cards/TradingActivityCard"
import { formatCurrency } from "@/lib/utils"

const ObjectivesSection = ({
  config,
  targetAmounts,
  targetProgress,
  dailyDrawdown,
  dailyDrawdownProgress,
  maxDrawdown,
  maxDrawdownProgress,
  tradingDays,
  profitableDays
}) => {
  return (
    <div className="w-full">
      {/* <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Objectives</h2> */}
      <div className="grid grid-cols-6 gap-4 w-full">
        {/* Profit Targets Card - spans 2 columns */}
        <div className="col-span-2">
          <PhasesCard
            profitTargets={config.profitTargets}
            targetAmounts={targetAmounts}
            targetProgress={targetProgress}
            formatCurrency={formatCurrency}
          />
        </div>
        
        {/* Drawdown Rules Card - spans 2 columns */}
        <div className="col-span-2">
          <DrawdownRulesCard
            dailyDrawdown={dailyDrawdown}
            dailyDrawdownProgress={dailyDrawdownProgress}
            maxDrawdown={maxDrawdown}
            maxDrawdownProgress={maxDrawdownProgress}
          />
        </div>
        
        {/* Trading Activity Card - spans 2 columns */}
        <div className="col-span-2">
          <TradingActivityCard
            minTradingDays={config.minTradingDays || 0}
            tradingDays={tradingDays}
            minProfitableDays={config.requireProfitableDays || 0}
            profitableDays={profitableDays}
          />
        </div>
      </div>
    </div>
  )
}

export default ObjectivesSection 