import React from "react"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Minus, Target, TrendingDown, Calendar } from "lucide-react"
import useAppStore from "@/store/useAppStore"
import { cn } from "@/lib/utils"

// Common button styles
const buttonStyles =
  "h-8 w-8 p-0 bg-transparent border-none shadow-none hover:bg-muted-foreground"

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
        onClick={handleDecrement}
        disabled={value <= min}
        className={buttonStyles}
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
          className="text-center pr-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
        onClick={handleIncrement}
        disabled={value >= max}
        className={buttonStyles}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}

const DrawdownTypeSelector = ({ value, onChange }) => {
  return (
    <div className="flex gap-2 justify-center items-center">
      <Button
        variant={value === "static" ? "default" : "outline"}
        onClick={() => onChange("static")}
        className="flex-1 min-w-20 font-semibold px-0 capitalize p-1"
      >
        Static
      </Button>
      <div
        className={cn(
          "bg-input/30 flex flex-row items-center gap-2 rounded-lg border border-border",
          (value === "trailing" || value === "trailing_scaling") && ""
        )}
      >
        <span className="text-sm font-semibold pl-2 select-none">Trailing</span>
        <div className="flex bg-input  rounded-lg relative">
          {/* Animated background slider */}
          <div
            className={cn(
              "flex flex-row justify-center items-center absolute inset-0 bg-primary rounded-md",
              value === "trailing"
                ? "translate-x-0 transition-all duration-250 ease-in-out"
                : value === "trailing_scaling"
                ? "translate-x-full transition-all duration-250 ease-in-out"
                : "translate-x-0 opacity-0"
            )}
            style={{ width: "50%" }}
          />
          <button
            onClick={() => onChange("trailing")}
            className="relative flex-1 py-2 px-3 rounded-md text-sm font-semibold transition-all duration-250 z-10 flex items-center justify-center"
          >
            <span
              className={cn(
                "transition-all duration-250",
                value === "trailing"
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Fixed
            </span>
          </button>
          <button
            onClick={() => onChange("trailing_scaling")}
            className="relative flex-1 py-2 px-3 rounded-md text-sm font-semibold transition-all duration-250 z-10 flex items-center justify-center"
          >
            <span
              className={cn(
                "transition-all duration-250",
                value === "trailing_scaling"
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Scaling
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
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
        {/* Trading Days Card */}
        <Card>
          <CardContent className="flex flex-col gap-2 py-0">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Minimum Profitable Days
              </Label>
              <NumberInput
                value={config.requireProfitableDays || 0}
                onChange={(value) =>
                  updateConfigField("requireProfitableDays", Math.max(0, value))
                }
                min={0}
                max={30}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Minimum Trading Days
              </Label>
              <NumberInput
                value={config.minTradingDays || 0}
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
        {/* Profit Target Card */}
        <Card>
          <CardContent className="flex flex-col gap-2 py-0">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Profit Target
              </Label>
              <NumberInput
                value={config.profitTargets?.phase1 || 0}
                onChange={updateProfitTarget}
                min={1}
                max={50}
                step={1}
                suffix="%"
              />
            </div>
          </CardContent>
        </Card>

        {/* Consistency Rule Card */}
        <Card>
          <CardContent className="flex flex-col gap-2 py-0">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Consistency Rule
              </Label>
              <NumberInput
                value={config.consistencyRule || 15}
                onChange={(value) =>
                  updateConfigField("consistencyRule", value)
                }
                min={5}
                max={50}
                step={1}
                suffix="%"
              />
            </div>
          </CardContent>
        </Card>

        {/* Drawdown Settings Card */}
        <Card>
          <CardContent className="flex flex-col gap-2 py-0">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Daily Drawdown
              </Label>
              <NumberInput
                value={config.dailyDrawdown || 0}
                onChange={(value) => updateConfigField("dailyDrawdown", value)}
                min={1}
                max={50}
                step={1}
                suffix="%"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Max Drawdown
              </Label>
              <NumberInput
                value={config.maxDrawdown || 0}
                onChange={(value) => updateConfigField("maxDrawdown", value)}
                min={1}
                max={50}
                step={1}
                suffix="%"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Max Drawdown Type
              </Label>
              <DrawdownTypeSelector
                value={config.maxDrawdownType || "static"}
                onChange={(type) => updateConfigField("maxDrawdownType", type)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Configuration
