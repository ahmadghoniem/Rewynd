import React, { useState } from "react"

// Import the new analytics section components
import {
  EquityCurveSection,
  TradeHistorySection,
  DailyRecapSection
} from "@/components/analytics"
import HeaderCard from "@/components/cards/HeaderCard"

import PerformanceSection from "@/components/analytics/PerformanceSection.jsx"
import ObjectivesSection from "@/components/analytics/ObjectivesSection"
import Configuration from "@/Configuration"
import FooterCard from "@/components/cards/FooterCard"

const AnalyticsView = () => {
  const [showConfiguration, setShowConfiguration] = useState(false)

  const handleToggleConfiguration = () => {
    setShowConfiguration(!showConfiguration)
  }

  return (
    <div className="w-full mx-auto px-2 py-4">
      <HeaderCard
        showConfiguration={showConfiguration}
        onToggleConfiguration={handleToggleConfiguration}
      />
      <div className="grid grid-cols-1 lg:[grid-template-columns:75%_25%]">
        <div className="flex flex-col gap-2">
          <PerformanceSection />
          <EquityCurveSection />
          <TradeHistorySection />
        </div>
        <div className="flex flex-col gap-2 pl-2">
          {showConfiguration ? <Configuration /> : <ObjectivesSection />}
          <DailyRecapSection />
          <FooterCard />
        </div>
      </div>
    </div>
  )
}

export default AnalyticsView
