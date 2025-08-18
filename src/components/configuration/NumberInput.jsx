import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Minus } from "lucide-react"

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

export default NumberInput
