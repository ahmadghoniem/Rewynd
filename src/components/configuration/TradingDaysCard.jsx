import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import NumberInput from "./NumberInput"

const TradingDaysCard = ({ config, updateConfigField }) => {
  return (
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
  )
}

export default TradingDaysCard
