import React, { useState, useMemo } from "react"
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

const ProfitTargetsCard = (props) => {
  const [showAmounts, setShowAmounts] = useState(false)
  const config = useAppStore((state) => state.config) || {}
  const accountData = useAppStore((state) => state.accountData) || {
    capital: 0,
    realizedPnL: 0,
    balance: 0
  }
  const profitTargets = props.profitTargets || config.profitTargets || {}
  const formatCurrency = props.formatCurrency || defaultFormatCurrency

  // Memoize calculations to avoid recalculation on every render
  const { targetAmounts, targetProgress } = useMemo(() => {
    const calculatedTargetAmounts =
      props.targetAmounts ||
      getTargetAmounts(profitTargets, accountData.capital || 0)
    const calculatedTargetProgress =
      props.targetProgress ||
      calculateIndividualTargetProgress(
        profitTargets,
        accountData.capital || 0,
        accountData.realizedPnL || 0
      )

    return {
      targetAmounts: calculatedTargetAmounts,
      targetProgress: calculatedTargetProgress
    }
  }, [
    props.targetAmounts,
    props.targetProgress,
    profitTargets,
    accountData.capital,
    accountData.realizedPnL
  ])

  // Memoize current phase calculations
  const currentPhaseData = useMemo(() => {
    const phases = Object.keys(profitTargets).sort()

    // Handle empty profit targets
    if (phases.length === 0) {
      return {
        phases: [],
        currentPhase: 0,
        currentPhaseProgress: 0,
        currentPhaseTarget: 0,
        currentPhaseKey: "",
        actualProfitAchieved: 0,
        actualProfitAmount: 0,
        targetAmount: 0,
        requiredProfitPercentage: 0
      }
    }

    let currentPhase = 1
    let currentPhaseProgress = 0
    let currentPhaseTarget = 0
    let currentPhaseKey = "phase1"
    let foundIncompletePhase = false

    // Find the current phase (first incomplete phase)
    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i]
      const progress = targetProgress[phase] || 0
      const target = profitTargets[phase] || 0

      if (progress < 100) {
        currentPhase = i + 1
        currentPhaseProgress = progress
        currentPhaseTarget = target
        currentPhaseKey = phase
        foundIncompletePhase = true
        break
      }
    }

    // If all phases are complete, show the last phase
    if (!foundIncompletePhase) {
      currentPhase = phases.length
      const lastPhase = phases[phases.length - 1]
      currentPhaseProgress = targetProgress[lastPhase] || 0
      currentPhaseTarget = profitTargets[lastPhase] || 0
      currentPhaseKey = lastPhase
    }

    // Calculate derived values correctly
    const targetAmount = targetAmounts[currentPhaseKey] || 0
    const requiredProfitPercentage = currentPhaseTarget

    // Calculate actual profit achieved in current phase
    let actualProfitAchieved = 0
    let actualProfitAmount = 0

    if (currentPhase === 1) {
      // For phase 1, show the actual profit achieved up to the phase 1 target
      const totalProfitPercentage =
        accountData.capital > 0
          ? (accountData.realizedPnL / accountData.capital) * 100
          : 0
      actualProfitAchieved = Math.min(
        totalProfitPercentage,
        requiredProfitPercentage
      )
      actualProfitAmount = (actualProfitAchieved / 100) * accountData.capital
    } else {
      // For phase 2+, show the profit achieved in this specific phase
      const previousPhaseKey = `phase${currentPhase - 1}`
      const previousPhaseTarget = profitTargets[previousPhaseKey] || 0
      const totalProfitPercentage =
        accountData.capital > 0
          ? (accountData.realizedPnL / accountData.capital) * 100
          : 0

      if (totalProfitPercentage <= previousPhaseTarget) {
        // Haven't reached this phase yet
        actualProfitAchieved = 0
        actualProfitAmount = 0
      } else {
        // Calculate profit achieved in this phase
        const profitInThisPhase = totalProfitPercentage - previousPhaseTarget
        actualProfitAchieved = Math.min(
          profitInThisPhase,
          requiredProfitPercentage
        )
        actualProfitAmount = (actualProfitAchieved / 100) * accountData.capital
      }
    }

    return {
      phases,
      currentPhase,
      currentPhaseProgress,
      currentPhaseTarget,
      currentPhaseKey,
      actualProfitAchieved,
      actualProfitAmount,
      targetAmount,
      requiredProfitPercentage
    }
  }, [profitTargets, targetProgress, targetAmounts, accountData.capital])

  const handleToggleDisplay = () => {
    setShowAmounts(!showAmounts)
  }

  // Don't render if no profit targets are configured or if capital is zero
  if (Object.keys(profitTargets).length === 0 || !accountData.capital) {
    return null
  }

  return (
    <Card className={cn("gap-2 text-xs font-medium py-2", props.className)}>
      <CardHeader className="flex justify-between items-center px-2 pb-0">
        <span className="uppercase tracking-wide text-xs font-semibold">
          Profit Targets
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-pointer align-middle">
              <Info size={14} aria-label="Info about Profit Targets" />
            </span>
          </TooltipTrigger>
          <TooltipContent sideOffset={6}>
            The profit targets for each phase of the challenge.
          </TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent className="pt-0">
        <div
          className="flex items-end gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleToggleDisplay}
        >
          <span className="text-2xl font-semibold">
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
          {currentPhaseData.currentPhase}/{currentPhaseData.phases.length}{" "}
          {currentPhaseData.phases.length > 1 ? "phases" : "phase"}
        </div>
        <ProgressBar
          progress={Math.max(
            0,
            Math.min(1, currentPhaseData.currentPhaseProgress / 100)
          )}
          height={12}
          filledColor="bg-primary"
          emptyColor="bg-accent"
        />
      </CardContent>
    </Card>
  )
}

export default ProfitTargetsCard
