import React from "react"

import MaxDrawdownCard from "@/components/cards/MaxDrawdownCard"
import ProfitTargetsCard from "@/components/cards/ProfitTargetsCard"
import DailyDrawdownCard from "@/components/cards/DailyDrawdownCard"
import TradingActivityCard from "@/components/cards/TradingActivityCard"
import DailyRecapSection from "@/components/analytics/DailyRecapSection"

const ObjectivesSection = () => {
  // All cards/sections below should use Zustand or local logic for their own data
  return (
    <div className="flex flex-col gap-2">
      <TradingActivityCard />
      <ProfitTargetsCard />
      <MaxDrawdownCard />
      <DailyDrawdownCard />
      <DailyRecapSection />
    </div>
  )
}

export default ObjectivesSection
