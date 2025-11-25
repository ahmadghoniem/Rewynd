import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import NumberInput from "./NumberInput"

import useAppStore from "@/store/useAppStore"

const TradingDaysConfigCard = () => {
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

        <Separator />

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
      </CardContent>
    </Card>
  )
}

export default TradingDaysConfigCard
