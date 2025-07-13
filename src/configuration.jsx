import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus } from "lucide-react"

const NumberInput = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  suffix = "%"
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
        variant="outline"
        size="sm"
        onClick={handleDecrement}
        disabled={value <= min}
        className="h-8 w-8 p-0"
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
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
          {suffix}
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleIncrement}
        disabled={value >= max}
        className="h-8 w-8 p-0"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}

const PhaseSelector = ({ phases, onChange }) => {
  return (
    <div className="flex space-x-2">
      {[1, 2, 3].map((phase) => (
        <Button
          key={phase}
          variant={phases === phase ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(phase)}
          className="flex-1"
        >
          {phase} Phase{phase > 1 ? "s" : ""}
        </Button>
      ))}
    </div>
  )
}

const ConfigurationView = ({ config, onSave, onConfigChange, accountData }) => {
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const renderProfitTargets = () => {
    const targets = []
    for (let i = 1; i <= config.phases; i++) {
      const targetAmount = (accountData.balance * (config.profitTargets[`phase${i}`] || 2)) / 100
      
      targets.push(
        <div key={i} className="space-y-2">
          <Label className="text-sm font-medium">Phase {i} Profit Target</Label>
          <NumberInput
            value={config.profitTargets[`phase${i}`] || 2}
            onChange={(value) => handleProfitTargetChange(`phase${i}`, value)}
            min={1}
            max={50}
            step={1}
          />
          <div className="text-xs text-gray-500 pl-2">
            Target: {formatCurrency(targetAmount)}
          </div>
        </div>
      )
    }
    return targets
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-lg">Configure Challenge</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Challenge Configuration */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Number of Phases</Label>
            <PhaseSelector phases={config.phases} onChange={handlePhasesChange} />
          </div>

          {renderProfitTargets()}

          <div className="space-y-2">
            <Label className="text-sm font-medium">Max Drawdown</Label>
            <NumberInput
              value={config.maxDrawdown}
              onChange={(value) =>
                onConfigChange({ ...config, maxDrawdown: value })
              }
              min={1}
              max={30}
              step={1}
            />
            <div className="text-xs text-gray-500 pl-2">
              Loss limit: {formatCurrency((accountData.balance * config.maxDrawdown) / 100)}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Daily Drawdown</Label>
            <NumberInput
              value={config.dailyDrawdown}
              onChange={(value) =>
                onConfigChange({ ...config, dailyDrawdown: value })
              }
              min={1}
              max={20}
              step={1}
            />
            <div className="text-xs text-gray-500 pl-2">
              Daily limit: {formatCurrency((accountData.balance * config.dailyDrawdown) / 100)}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Drawdown Type</Label>
            <Select
              value={config.isTrailing ? "trailing" : "static"}
              onValueChange={(value) =>
                onConfigChange({ ...config, isTrailing: value === "trailing" })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select drawdown type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="static">Static Drawdown</SelectItem>
                <SelectItem value="trailing">Trailing Drawdown</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={onSave} className="w-full mt-6">
          Save & View Analytics
        </Button>
      </CardContent>
    </Card>
  )
}

export default ConfigurationView