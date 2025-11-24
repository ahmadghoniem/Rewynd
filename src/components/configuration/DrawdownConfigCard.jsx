import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import NumberInput from "./NumberInput"
import DrawdownTypeSelector from "./DrawdownTypeSelector"

import useAppStore from "@/store/useAppStore"

const DrawdownConfigCard = () => {
  const config = useAppStore((state) => state.config)
  const updateChallengeConfig = useAppStore(
    (state) => state.updateChallengeConfig
  )

  const updateConfigField = (field, value) => {
    updateChallengeConfig({ [field]: value })
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-2.5 py-0">
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

        <Separator />

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

        <Separator />

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
