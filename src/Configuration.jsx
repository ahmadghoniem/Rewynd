import React from "react"
import useAppStore from "@/store/useAppStore"
import {
  TradingDaysConfigCard,
  ProfitTargetConfigCard,
  ConsistencyRuleConfigCard,
  DrawdownConfigCard
} from "@/components/configuration"

const Configuration = () => {
  const config = useAppStore((state) => state.config)
  const setConfig = useAppStore((state) => state.setConfig)

  // Helper function to update a single config field
  const updateConfigField = (field, value) => {
    setConfig({
      ...config,
      [field]: value
    })
  }

  // Helper function to update profit target
  const updateProfitTarget = (value) => {
    setConfig({
      ...config,
      profitTargets: {
        phase1: value
      }
    })
  }

  return (
    <div className="w-full">
      <div className="flex flex-col gap-2">
        <TradingDaysConfigCard
          config={config}
          updateConfigField={updateConfigField}
        />
        <ProfitTargetConfigCard
          config={config}
          updateProfitTarget={updateProfitTarget}
        />
        <ConsistencyRuleConfigCard
          config={config}
          updateConfigField={updateConfigField}
        />
        <DrawdownConfigCard
          config={config}
          updateConfigField={updateConfigField}
        />
      </div>
    </div>
  )
}

export default Configuration
