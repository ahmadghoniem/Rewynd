import React, { useEffect } from "react"
import { Activity } from "lucide-react"
import { useTheme } from "./ThemeContext"

// Import the new analytics section components
import { EquityCurveSection, TradeHistorySection } from "@/components/analytics"

import PerformanceSection from "@/components/analytics/PerformanceSection.jsx"
import ObjectivesSection from "@/components/analytics/ObjectivesSection"
import useAppStore from "./store/useAppStore"

const AnalyticsView = React.forwardRef((props, ref) => {
  const accountData = useAppStore((state) => state.accountData)
  const loadAccountData = useAppStore((state) => state.loadAccountData)
  const loadTradeData = useAppStore((state) => state.loadTradeData)
  const setExtractedTrades = useAppStore((state) => state.setExtractedTrades)
  const displayData = accountData || { capital: 0, realizedPnL: 0, balance: 0 }

  // Load storage data on component mount
  useEffect(() => {
    // Store auto-initializes data on creation, no need to load manually
    // No additional setup needed for this component
  }, [])

  // Show loading state if data is not ready
  if (!displayData || !displayData.capital) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="dark:text-primary mb-4">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">
              No Trading Data Available
            </h3>
            <p className="text-sm">
              Please ensure you're on the FxReplay website and have trading data
              loaded.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-8">
      <div className="grid grid-cols-1 gap-2 lg:[grid-template-columns:75%_25%]">
        <div className="flex flex-col gap-2">
          <PerformanceSection />
          <EquityCurveSection />
          <TradeHistorySection />
        </div>
        <ObjectivesSection />
      </div>
    </div>
  )
})

export default AnalyticsView
