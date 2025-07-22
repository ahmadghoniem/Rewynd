import React from "react"
import ProfitTargetsCard from "../cards/ProfitTargetsCard"
import DrawdownRulesCard from "../cards/DrawdownRulesCard"
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
      {/* New layout: Profit Targets and Drawdown Rules take more space, Trading Activity is separate */}
      <div className="grid grid-cols-8 gap-4 w-full mb-4">
        {/* Profit Targets Card - spans 4 columns */}
        <div className="col-span-4">
          <ProfitTargetsCard
            profitTargets={config.profitTargets}
            targetAmounts={targetAmounts}
            targetProgress={targetProgress}
            formatCurrency={formatCurrency}
          />
        </div>
        {/* Drawdown Rules Card - spans 4 columns */}
        <div className="col-span-4">
          <DrawdownRulesCard
            dailyDrawdown={dailyDrawdown}
            dailyDrawdownProgress={dailyDrawdownProgress}
            maxDrawdown={maxDrawdown}
            maxDrawdownProgress={maxDrawdownProgress}
          />
        </div>
      </div>
    </div>
  )
}

export default ObjectivesSection
