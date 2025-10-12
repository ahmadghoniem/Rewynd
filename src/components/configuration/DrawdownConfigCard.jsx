import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import NumberInput from "./NumberInput"
import DrawdownTypeSelector from "./DrawdownTypeSelector"

const DrawdownConfigCard = ({ config, updateConfigField }) => {
  return (
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
  )
}

export default DrawdownConfigCard
