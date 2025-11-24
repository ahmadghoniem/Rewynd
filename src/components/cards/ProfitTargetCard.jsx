import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { ProgressBar } from "../ui/progressbar"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from "@/components/ui/tooltip"
import useAppStore from "@/store/useAppStore"
import {
  getTargetAmount,
  calculateTargetProgress,
  formatCurrency as defaultFormatCurrency
} from "@/lib/utils"

const ProfitTargetCard = ({ className }) => {
  const [showAmounts, setShowAmounts] = useState(false)
  const config = useAppStore((state) => state.config) || {}
  const sessionData = useAppStore((state) => state.sessionData) || {
    id: null,
    capital: 0,
    realizedPnL: 0,
    balance: 0
  }
  const updateObjective = useAppStore((state) => state.updateObjective)

  const profitTarget = config.profitTarget || 0
  const formatCurrency = defaultFormatCurrency

  // Memoize calculations to avoid recalculation on every render
  const profitTargetData = useMemo(() => {
    // Handle empty profit targets
    if (!profitTarget) {
      return {
        progress: 0,
        targetPercentage: 0,
        targetAmount: 0,
        actualProfitAchieved: 0,
        actualProfitAmount: 0,
        isMet: false
      }
    }

    // Ensure we have a number, handling the case where it might still be an object from old config
    const targetPercentage =
      typeof profitTarget === "object"
        ? profitTarget.phase1 || 0
        : Number(profitTarget) || 0

    const targetAmount = getTargetAmount(
      targetPercentage,
      sessionData.capital || 0
    )

    const progress = calculateTargetProgress(
      targetPercentage,
      sessionData.capital || 0,
      sessionData.realizedPnL || 0
    )

    // Calculate actual profit achieved
    const totalProfitPercentage =
      sessionData.capital > 0
        ? (sessionData.realizedPnL / sessionData.capital) * 100
        : 0

    // Ensure we don't show negative progress - if in drawdown, show 0
    const actualProfitAchieved = Math.max(
      0,
      Math.min(totalProfitPercentage, targetPercentage)
    )

    const actualProfitAmount = Math.max(
      0,
      (actualProfitAchieved / 100) * sessionData.capital
    )

    const isMet = actualProfitAchieved >= targetPercentage

    return {
      progress,
      targetPercentage,
      targetAmount,
      actualProfitAchieved,
      actualProfitAmount,
      isMet
    }
  }, [profitTarget, sessionData.capital, sessionData.realizedPnL])

  const handleToggleDisplay = () => {
    setShowAmounts(!showAmounts)
  }

  // Update store when profit targets status changes
  useEffect(() => {
    if (profitTargetData.targetPercentage > 0 && sessionData.capital > 0) {
      updateObjective("profitTarget", profitTargetData.isMet)
    }
  }, [
    profitTargetData.isMet,
    profitTargetData.targetPercentage,
    sessionData.capital,
    updateObjective
  ])

  return (
    <Card className={cn("gap-2 text-xs font-medium py-2", className)}>
      <CardHeader className="flex justify-between items-center px-2 pb-0">
        <span className="capitalize tracking-wide text-xs font-semibold">
          Profit Target
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-pointer align-middle">
              <Info size={14} aria-label="Info about Profit Targets" />
            </span>
          </TooltipTrigger>
          <TooltipContent sideOffset={6}>
            The profit target for the challenge.
          </TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent className="pt-0">
        <div
          className="flex items-end gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleToggleDisplay}
        >
          <span className="text-xl font-semibold">
            {showAmounts
              ? formatCurrency(profitTargetData.actualProfitAmount)
              : `${profitTargetData.actualProfitAchieved.toFixed(1)}%`}
          </span>
          <span className="text-xl text-muted-foreground">
            /{" "}
            {showAmounts
              ? formatCurrency(profitTargetData.targetAmount)
              : `${profitTargetData.targetPercentage.toFixed(1)}%`}
          </span>
        </div>
        <div className="text-xs text-muted-foreground mb-2">
          {(() => {
            if (!profitTargetData.targetPercentage) return "Set profit target"
            if (profitTargetData.isMet) return "Target achieved!"
            const remaining =
              profitTargetData.targetAmount -
              profitTargetData.actualProfitAmount
            return `${formatCurrency(remaining)} to target`
          })()}
        </div>
        <ProgressBar
          progress={Math.max(
            0,
            Math.min(
              1,
              profitTargetData.targetPercentage > 0
                ? profitTargetData.actualProfitAchieved /
                    profitTargetData.targetPercentage
                : 0
            )
          )}
          height={12}
          filledColor="bg-primary"
          emptyColor="bg-accent"
        />
      </CardContent>
    </Card>
  )
}

export default ProfitTargetCard
