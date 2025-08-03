import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Plus, Minus, Target } from "lucide-react"
import "./hideNumberArrows.css"
import useAppStore from "./store/useAppStore"

const NumberInput = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  suffix = ""
}) => {
  const handleIncrement = () => {
    const newValue = Math.min(max, value + step)
    onChange(newValue)
  }

  const handleDecrement = () => {
    const newValue = Math.max(min, value - step)
    onChange(newValue)
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDecrement}
        disabled={value <= min}
        className="h-8 w-8 p-0 bg-transparent border-none shadow-none hover:bg-muted-foreground"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <div className="flex-1 relative">
        <Input
          type="number"
          value={value}
          onChange={(e) => {
            const newValue = Math.max(
              min,
              Math.min(max, parseFloat(e.target.value) || 0)
            )
            onChange(newValue)
          }}
          className="text-center pr-8"
          min={min}
          max={max}
          step={step}
        />
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
          {suffix}
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleIncrement}
        disabled={value >= max}
        className="h-8 w-8 p-0 bg-transparent border-none shadow-none hover:bg-muted-foreground"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}

const PhaseSelector = ({ phases, onChange }) => {
  return (
    <div className="flex space-x-2 justify-center">
      {[1, 2, 3].map((phase) => (
        <Button
          key={phase}
          variant={phases === phase ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(phase)}
          className="flex-1 min-w-[80px] font-semibold px-0"
        >
          {phase} Phase{phase > 1 ? "s" : ""}
        </Button>
      ))}
    </div>
  )
}

const DrawdownTypeSelector = ({ value, onChange }) => (
  <div className="flex space-x-2 justify-center">
    {["static", "trailing"].map((type) => (
      <Button
        key={type}
        variant={value === type ? "default" : "outline"}
        size="sm"
        onClick={() => onChange(type)}
        className="flex-1 min-w-[80px] font-semibold px-0 capitalize"
      >
        {type}
      </Button>
    ))}
  </div>
)

const ConfigurationView = ({ onSave }) => {
  const config = useAppStore((state) => state.config)
  const setConfig = useAppStore((state) => state.setConfig)

  // Helper function to update a single config field
  const updateConfigField = (field, value) => {
    setConfig({
      ...config,
      [field]: value
    })
  }

  // Helper function to update profit target for a specific phase
  const updateProfitTarget = (phase, value) => {
    setConfig({
      ...config,
      profitTargets: {
        ...config.profitTargets,
        [phase]: value
      }
    })
  }

  const handlePhasesChange = (newPhases) => {
    const defaultProfitTargets =
      config.defaults.profitTargets[newPhases] ||
      config.defaults.profitTargets[1]
    setConfig({
      ...config,
      phases: newPhases,
      profitTargets: defaultProfitTargets
    })
  }

  const handleProfitTargetChange = (phase, value) => {
    updateProfitTarget(phase, value)
  }

  const renderProfitTargets = () => {
    const targets = []
    for (let i = 1; i <= config.phases; i++) {
      const phaseKey = `phase${i}`
      const targetValue = config.profitTargets[phaseKey]
      targets.push(
        <div key={i} className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            Phase {i} Profit Target
          </Label>
          <NumberInput
            value={targetValue}
            onChange={(value) => handleProfitTargetChange(phaseKey, value)}
            min={1}
            max={50}
            step={1}
            suffix="%"
          />
        </div>
      )
    }
    return targets
  }

  return (
    <div className="space-y-6 flex flex-col ">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground ">
          Challenge Configuration
        </h2>
        <p className="text-muted-foreground dark:text-primary">
          Configure your funded trading challenge parameters
        </p>
      </div>

      {/* Configuration Grid */}
      <div className="flex gap-6 max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Challenge Structure */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Challenge Structure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Number of Phases
                </Label>
                <PhaseSelector
                  phases={config.phases}
                  onChange={handlePhasesChange}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-muted-foreground">
                  Profit Targets
                </Label>
                {renderProfitTargets()}
              </div>
              {/* Divider after profit phases targets */}
              <div className="my-4 border-t border-divider" />
              {/* Daily Drawdown Input */}
              <div className="space-y-2 mt-4">
                <Label className="text-sm font-medium text-muted-foreground">
                  Daily Drawdown
                </Label>
                <NumberInput
                  value={config.dailyDrawdown}
                  onChange={(value) =>
                    updateConfigField("dailyDrawdown", value)
                  }
                  min={1}
                  max={50}
                  step={1}
                  suffix="%"
                />
              </div>
              {/* Max Drawdown Input */}
              <div className="space-y-2 mt-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Max Drawdown
                </Label>
                <NumberInput
                  value={config.maxDrawdown}
                  onChange={(value) => updateConfigField("maxDrawdown", value)}
                  min={1}
                  max={50}
                  step={1}
                  suffix="%"
                />
              </div>
              {/* Max Drawdown Type Select */}
              <div className="space-y-2 mt-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Max Drawdown Type
                </Label>
                <DrawdownTypeSelector
                  value={config.maxDrawdownType}
                  onChange={(type) =>
                    updateConfigField("maxDrawdownType", type)
                  }
                />
              </div>
              {/* Divider after max drawdown type select */}
              <div className="my-4 border-t border-divider" />
              {/* Minimum Profitable Days Input */}
              <div className="space-y-2 mt-4">
                <Label className="text-sm font-medium text-muted-foreground">
                  Minimum Profitable Days
                </Label>
                <NumberInput
                  value={config.requireProfitableDays}
                  onChange={(value) =>
                    updateConfigField(
                      "requireProfitableDays",
                      Math.max(0, value)
                    )
                  }
                  min={0}
                  max={30}
                  step={1}
                />
              </div>
              {/* Minimum Trading Days Input */}
              <div className="space-y-2 mt-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Minimum Trading Days
                </Label>
                <NumberInput
                  value={config.minTradingDays}
                  onChange={(value) =>
                    updateConfigField("minTradingDays", Math.max(0, value))
                  }
                  min={0}
                  max={30}
                  step={1}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center pt-6">
        <Button
          onClick={onSave}
          className="px-8 py-3 text-lg font-semibold hover:bg-muted-foreground"
        >
          Save & View Analytics Dashboard
        </Button>
      </div>
    </div>
  )
}

export default ConfigurationView
