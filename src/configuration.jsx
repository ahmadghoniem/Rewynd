import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Minus,
  Sun,
  Moon,
  Settings,
  Target,
  Calendar
} from "lucide-react"
import { useTheme } from "./ThemeContext"
import "./hideNumberArrows.css"

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

const ConfigurationView = ({ config, onSave, onConfigChange, accountData }) => {
  const { isDark, toggleTheme } = useTheme()
  const getDefaultProfitTargets = (phases) => {
    switch (phases) {
      case 1:
        return { phase1: 10 }
      case 2:
        return { phase1: 4, phase2: 8 }
      case 3:
        return { phase1: 2, phase2: 2, phase3: 2 }
      default:
        return { phase1: 10 }
    }
  }

  const handlePhasesChange = (newPhases) => {
    const newProfitTargets = getDefaultProfitTargets(newPhases)
    onConfigChange({
      ...config,
      phases: newPhases,
      profitTargets: newProfitTargets
    })
  }

  const handleProfitTargetChange = (phase, value) => {
    onConfigChange({
      ...config,
      profitTargets: {
        ...config.profitTargets,
        [phase]: value
      }
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2
    }).format(amount)
  }

  const renderProfitTargets = () => {
    const targets = []
    for (let i = 1; i <= config.phases; i++) {
      const phaseKey = `phase${i}`
      const targetValue = config.profitTargets[phaseKey] || 2
      const requiredAmount = accountData.capital * (targetValue / 100)
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
          <div className="text-xs text-muted-foreground">
            Target: {targetValue}% ({formatCurrency(requiredAmount)})
          </div>
        </div>
      )
    }
    return targets
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground dark:text-white">
          Challenge Configuration
        </h2>
        <p className="text-muted-foreground dark:text-gray-400">
          Configure your funded trading challenge parameters
        </p>
      </div>

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Left Column - Basic Settings */}
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
              {/* Daily Drawdown Input */}
              <div className="space-y-2 mt-4">
                <Label className="text-sm font-medium text-muted-foreground">
                  Daily Drawdown
                </Label>
                <NumberInput
                  value={config.dailyDrawdown || 2}
                  onChange={(value) =>
                    onConfigChange({ ...config, dailyDrawdown: value })
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
                  value={config.maxDrawdown || 5}
                  onChange={(value) =>
                    onConfigChange({ ...config, maxDrawdown: value })
                  }
                  min={1}
                  max={50}
                  step={1}
                  suffix="%"
                />
              </div>
              {/* Minimum Profitable Days Input */}
              <div className="space-y-2 mt-4">
                <Label className="text-sm font-medium text-muted-foreground">
                  Minimum Profitable Days
                </Label>
                <NumberInput
                  value={config.requireProfitableDays || 0}
                  onChange={(value) =>
                    onConfigChange({
                      ...config,
                      requireProfitableDays: Math.max(0, value)
                    })
                  }
                  min={0}
                  max={30}
                  step={1}
                />
                <div className="text-xs text-muted-foreground">
                  Set to 0 to disable this requirement
                </div>
              </div>
              {/* Minimum Trading Days Input */}
              <div className="space-y-2 mt-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Minimum Trading Days
                </Label>
                <NumberInput
                  value={config.minTradingDays || 0}
                  onChange={(value) =>
                    onConfigChange({
                      ...config,
                      minTradingDays: Math.max(0, value)
                    })
                  }
                  min={0}
                  max={30}
                  step={1}
                />
                <div className="text-xs text-muted-foreground">
                  Set to 0 to disable this requirement
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <span className="text-sm text-muted-foreground">
                  Account Size:
                </span>
                <span className="text-sm font-bold text-info">
                  {formatCurrency(accountData.capital)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground text-center">
                Last updated:{" "}
                {accountData.lastUpdated
                  ? new Date(accountData.lastUpdated).toLocaleString()
                  : "Never"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Summary */}
        {/* Challenge Summary card removed here */}
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
