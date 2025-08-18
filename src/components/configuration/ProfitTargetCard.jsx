import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import NumberInput from "./NumberInput"

const ProfitTargetCard = ({ config, updateProfitTarget }) => {
  return (
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
  )
}

export default ProfitTargetCard
