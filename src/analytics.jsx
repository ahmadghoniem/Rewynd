import React from "react"

// Import the new analytics section components
import {
  EquityCurveSection,
  TradeHistorySection,
  AnalyticsHeader,
  DailyRecapSection
} from "@/components/analytics"

import PerformanceSection from "@/components/analytics/PerformanceSection.jsx"
import ObjectivesSection from "@/components/analytics/ObjectivesSection"
import FooterCard from "@/components/cards/FooterCard"

const AnalyticsView = () => {
  return (
    <div className="w-full mx-auto px-2 sm:px-4 py-8">
      <AnalyticsHeader />
      <div className="grid grid-cols-1 gap-2 lg:[grid-template-columns:75%_25%]">
        <div className="flex flex-col gap-2">
          <PerformanceSection />
          <EquityCurveSection />
          <TradeHistorySection />
        </div>
        <div className="flex flex-col gap-2">
          <ObjectivesSection />
          <DailyRecapSection />
          <FooterCard />
        </div>
      </div>
    </div>
  )
}

export default AnalyticsView
