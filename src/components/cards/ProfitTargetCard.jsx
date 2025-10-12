import React, { useState, useMemo, useEffect } from "react"
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
  getTargetAmounts,
  calculateIndividualTargetProgress,
  formatCurrency as defaultFormatCurrency
} from "@/lib/utils"

const ProfitTargetCard = (props) => {
  const [showAmounts, setShowAmounts] = useState(false)
  const config = useAppStore((state) => state.config) || {}
  const sessionData = useAppStore((state) => state.sessionData) || {
    id: null,
    capital: 0,
    realizedPnL: 0,
    balance: 0
  }
  const updateObjective = useAppStore((state) => state.updateObjective)

  const profitTargets = props.profitTargets || config.profitTargets || {}
  const formatCurrency = props.formatCurrency || defaultFormatCurrency

  // Memoize calculations to avoid recalculation on every render
  const { targetAmounts, targetProgress } = useMemo(() => {
    const calculatedTargetAmounts =
      props.targetAmounts ||
      getTargetAmounts(profitTargets, sessionData.capital || 0)
    const calculatedTargetProgress =
      props.targetProgress ||
      calculateIndividualTargetProgress(
        profitTargets,
        sessionData.capital || 0,
        sessionData.realizedPnL || 0
      )

    return {
      targetAmounts: calculatedTargetAmounts,
      targetProgress: calculatedTargetProgress
    }
  }, [
    props.targetAmounts,
    props.targetProgress,
    profitTargets,
    sessionData.capital,
    sessionData.realizedPnL
  ])

  // Memoize current phase calculations
  const currentPhaseData = useMemo(() => {
    // Handle empty profit targets
    if (!profitTargets.phase1) {
      return {
        phases: ["phase1"],
        currentPhase: 1,
        currentPhaseProgress: 0,
        currentPhaseTarget: 0,
        currentPhaseKey: "phase1",
        actualProfitAchieved: 0,
        actualProfitAmount: 0,
        targetAmount: 0,
        requiredProfitPercentage: 0
      }
    }

    const currentPhase = 1
    const currentPhaseProgress = targetProgress.phase1 || 0
    const currentPhaseTarget = profitTargets.phase1 || 0
    const currentPhaseKey = "phase1"

    // Calculate derived values correctly
    const targetAmount = targetAmounts.phase1 || 0
    const requiredProfitPercentage = currentPhaseTarget

    // Calculate actual profit achieved
    const totalProfitPercentage =
      sessionData.capital > 0
        ? (sessionData.realizedPnL / sessionData.capital) * 100
        : 0
    // Ensure we don't show negative progress - if in drawdown, show 0
    const actualProfitAchieved = Math.max(
      0,
      Math.min(totalProfitPercentage, requiredProfitPercentage)
    )
    const actualProfitAmount = Math.max(
      0,
      (actualProfitAchieved / 100) * sessionData.capital
    )

    return {
      phases: ["phase1"],
      currentPhase,
      currentPhaseProgress,
      currentPhaseTarget,
      currentPhaseKey,
      actualProfitAchieved,
      actualProfitAmount,
      targetAmount,
      requiredProfitPercentage
    }
  }, [
    profitTargets,
    targetProgress,
    targetAmounts,
    sessionData.capital,
    sessionData.realizedPnL
  ])

  const handleToggleDisplay = () => {
    setShowAmounts(!showAmounts)
  }

  // Update store when profit targets status changes
  useEffect(() => {
    if (
      currentPhaseData.requiredProfitPercentage > 0 &&
      sessionData.capital > 0
    ) {
      const isMet =
        currentPhaseData.actualProfitAchieved >=
        currentPhaseData.requiredProfitPercentage
      updateObjective("profitTargets", isMet)
    }
  }, [
    currentPhaseData.actualProfitAchieved,
    currentPhaseData.requiredProfitPercentage
  ])

  return (
    <Card className={cn("gap-2 text-xs font-medium py-2", props.className)}>
      <CardHeader className="flex justify-between items-center px-2 pb-0">
        <span className="capitalize tracking-wide text-xs font-semibold">
          Profit Targets
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
              ? formatCurrency(currentPhaseData.actualProfitAmount)
              : `${currentPhaseData.actualProfitAchieved.toFixed(1)}%`}
          </span>
          <span className="text-base text-muted-foreground">
            /{" "}
            {showAmounts
              ? formatCurrency(currentPhaseData.targetAmount)
              : `${currentPhaseData.requiredProfitPercentage.toFixed(1)}%`}
          </span>
        </div>
        <div className="text-xs text-muted-foreground mb-2">
          {(() => {
            if (!currentPhaseData.requiredProfitPercentage)
              return "Set profit target"
            if (
              currentPhaseData.actualProfitAchieved >=
              currentPhaseData.requiredProfitPercentage
            )
              return "Target achieved!"
            const remaining =
              currentPhaseData.targetAmount -
              currentPhaseData.actualProfitAmount
            return `${formatCurrency(remaining)} to target`
          })()}
        </div>
        <ProgressBar
          progress={Math.max(
            0,
            Math.min(
              1,
              currentPhaseData.requiredProfitPercentage > 0
                ? currentPhaseData.actualProfitAchieved /
                    currentPhaseData.requiredProfitPercentage
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
