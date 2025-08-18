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
import { calculateConsistencyRule, formatCurrency } from "@/lib/tradeUtils"

const ConsistencyRuleCard = (props) => {
  const [showAmounts, setShowAmounts] = useState(false)
  const config = useAppStore((state) => state.config) || {}
  const extractedTrades = useAppStore((state) => state.extractedTrades) || []
  const updateObjective = useAppStore((state) => state.updateObjective)
  const updateBreakingRule = useAppStore((state) => state.updateBreakingRule)

  const consistencyRule = props.consistencyRule || config.consistencyRule || 15
  const formatCurrencyFn = props.formatCurrency || formatCurrency

  // Memoize consistency calculations
  const consistencyData = useMemo(() => {
    try {
      const minTradingDays = config.minTradingDays || 0
      return calculateConsistencyRule(
        extractedTrades,
        consistencyRule,
        minTradingDays
      )
    } catch (error) {
      console.error("Error calculating consistency rule:", error)
      return {
        isConsistent: true,
        highestDailyPercentage: 0,
        totalProfits: 0,
        dailyProfits: {},
        violationDay: null,
        violationPercentage: 0,
        threshold: consistencyRule,
        minTradingDays: 0,
        tradingDays: 0,
        scenario: "error",
        message: "Error calculating consistency"
      }
    }
  }, [extractedTrades, consistencyRule, config.minTradingDays])

  const handleToggleDisplay = () => {
    setShowAmounts(!showAmounts)
  }

  // Calculate progress for the progress bar
  const threshold = consistencyData.threshold || consistencyRule || 15

  // For scenario 1 (min days not met), show 0 progress
  const progressPercentage =
    consistencyData.scenario === "min_days_not_met"
      ? 0
      : threshold > 0
      ? Math.min(1, (consistencyData.highestDailyPercentage || 0) / threshold)
      : 0

  // Update store when consistency rule status changes
  useEffect(() => {
    if (
      consistencyData &&
      consistencyData.scenario !== "error" &&
      extractedTrades.length > 0
    ) {
      const isMet =
        consistencyData.isConsistent &&
        consistencyData.scenario !== "min_days_not_met"
      const isBroken =
        !consistencyData.isConsistent &&
        consistencyData.scenario !== "min_days_not_met"

      updateObjective("consistencyRule", isMet)
      updateBreakingRule("consistencyRuleBroken", isBroken)
    }
  }, [consistencyData])

  // Safety check to ensure data is properly initialized
  if (
    !consistencyData ||
    typeof consistencyData.highestDailyPercentage === "undefined" ||
    typeof consistencyData.threshold === "undefined"
  ) {
    return (
      <Card className={cn("gap-2 text-xs font-medium py-2", props.className)}>
        <CardHeader className="flex justify-between items-center px-2 pb-0">
          <span className="capitalize tracking-wide text-xs font-semibold">
            Consistency Rule
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-pointer align-middle">
                <Info size={14} aria-label="Info about Consistency Rule" />
              </span>
            </TooltipTrigger>
            <TooltipContent sideOffset={6}>
              Ensures steady profits by limiting any single day to{" "}
              {consistencyRule}% or less of total profits.
            </TooltipContent>
          </Tooltip>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-xs text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("gap-2 text-xs font-medium py-2", props.className)}>
      <CardHeader className="flex justify-between items-center px-2 pb-0">
        <span className="capitalize tracking-wide text-xs font-semibold">
          Consistency Rule
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-pointer align-middle">
              <Info size={14} aria-label="Info about Consistency Rule" />
            </span>
          </TooltipTrigger>
          <TooltipContent sideOffset={6}>
            Ensures steady profits by limiting any single day to{" "}
            {consistencyRule}% or less of total profits.
          </TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent className="pt-0">
        <div
          className="flex items-end gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleToggleDisplay}
        >
          <span className="text-xl font-semibold text-foreground">
            {showAmounts
              ? formatCurrencyFn(consistencyData.totalProfits)
              : `${(consistencyData.scenario === "min_days_not_met"
                  ? 0
                  : consistencyData.highestDailyPercentage || 0
                ).toFixed(1)}%`}
          </span>
          <span className="text-base text-muted-foreground">
            /{" "}
            {showAmounts
              ? formatCurrencyFn(consistencyData.totalProfits)
              : `${(consistencyData.threshold || consistencyRule || 15).toFixed(
                  1
                )}%`}
          </span>
        </div>
        <div className="text-xs text-muted-foreground mb-2">
          {consistencyData.message || "Loading..."}
        </div>
        <ProgressBar
          progress={progressPercentage}
          height={12}
          filledColor={
            consistencyData.scenario === "min_days_not_met"
              ? "bg-muted-foreground"
              : consistencyData.isConsistent
              ? "bg-success"
              : "bg-destructive"
          }
          emptyColor="bg-accent"
        />
      </CardContent>
    </Card>
  )
}

export default ConsistencyRuleCard
