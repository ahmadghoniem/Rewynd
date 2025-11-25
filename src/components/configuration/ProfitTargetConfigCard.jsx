import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import NumberInput from "./NumberInput"

import useAppStore from "@/store/useAppStore"

const ProfitTargetConfigCard = () => {
  const config = useAppStore((state) => state.config)
  const updateChallengeConfig = useAppStore(
    (state) => state.updateChallengeConfig
  )

  const updateConfigField = (field, value) => {
    updateChallengeConfig({ [field]: value })
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-2 py-0">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground mb-2">
            Profit Target
          </Label>
          <NumberInput
            value={config.profitTarget || 0}
            onChange={(val) => updateConfigField("profitTarget", val)}
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

export default ProfitTargetConfigCard
