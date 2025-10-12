import React from "react"

import MaxDrawdownCard from "@/components/cards/MaxDrawdownCard"
import ProfitTargetCard from "@/components/cards/ProfitTargetCard"
import DailyDrawdownCard from "@/components/cards/DailyDrawdownCard"
import MinimumTradingDaysCard from "@/components/cards/MinimumTradingDaysCard"
import MinimumProfitableDaysCard from "@/components/cards/MinimumProfitableDaysCard"
import ConsistencyRuleCard from "@/components/cards/ConsistencyRuleCard"

const ObjectivesSection = () => {
  // All cards/sections below should use Zustand or local logic for their own data
  return (
    <div className="flex flex-col gap-2">
      <MinimumTradingDaysCard />
      <MinimumProfitableDaysCard />
      <ProfitTargetCard />
      <ConsistencyRuleCard />
      <DailyDrawdownCard />
      <MaxDrawdownCard />
    </div>
  )
}

export default ObjectivesSection
