import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import NumberInput from "./NumberInput"

const ConsistencyRuleConfigCard = ({ config, updateConfigField }) => {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 py-0">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            Consistency Rule
          </Label>
          <NumberInput
            value={
              config.consistencyRule !== undefined ? config.consistencyRule : 15
            }
            onChange={(value) => updateConfigField("consistencyRule", value)}
            min={0}
            max={60}
            step={5}
            suffix="%"
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default ConsistencyRuleConfigCard
