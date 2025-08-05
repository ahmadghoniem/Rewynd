import React, { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info } from "lucide-react"
import { ProgressBar } from "../ui/progressbar"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from "@/components/ui/tooltip"
import { cn, calculateDailyDrawdownMetrics, formatCurrency } from "@/lib/utils"
import useAppStore from "@/store/useAppStore"

const DailyDrawdownCard = ({ className }) => {
  const [showAmounts, setShowAmounts] = useState(false)
  const config = useAppStore((state) => state.config) || {}
  const accountData = useAppStore((state) => state.accountData) || {
    capital: 0,
    realizedPnL: 0,
    balance: 0
  }
  const extractedTrades = useAppStore((state) => state.extractedTrades) || []

  const dailyDrawdown = config.dailyDrawdown ?? 2
  const initialCapital = accountData.capital || 0

  // Calculate metrics directly (matching MaxDrawdownCard pattern)
  const {
    dailyDrawdownUsed = 0,
    dailyDrawdownProgress = 0,
    dailyDrawdownAmount = 0,
    dailyDrawdownTargetAmount = 0,
    currentDayStartBalance,
    dailyLossEquityLimit
  } = initialCapital && dailyDrawdown && extractedTrades.length
    ? calculateDailyDrawdownMetrics(
        extractedTrades,
        initialCapital,
        dailyDrawdown
      )
    : {}

  // Don't render if no capital or invalid configuration
  if (!initialCapital || !dailyDrawdown) {
    return null
  }

  const handleToggleDisplay = () => {
    setShowAmounts(!showAmounts)
  }

  return (
    <Card className={cn("gap-2 text-xs font-medium py-2", className)}>
      <CardHeader className="flex justify-between items-center px-2 pb-0">
        <span className="capitalize tracking-wide text-xs font-semibold">
          Max Daily Loss
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-pointer align-middle">
              <Info size={14} aria-label="Info about Max Daily Loss" />
            </span>
          </TooltipTrigger>
          <TooltipContent sideOffset={6}>
            The maximum daily loss allowed before breaching the account rule.
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
              ? formatCurrency(dailyDrawdownAmount)
              : `${dailyDrawdownUsed.toFixed(2)}%`}
          </span>
          <span className="text-base text-muted-foreground">
            /{" "}
            {showAmounts
              ? formatCurrency(dailyDrawdownTargetAmount)
              : `${dailyDrawdown}%`}
          </span>
        </div>
        <div className="text-xs text-muted-foreground mb-2">
          Equity limit: {formatCurrency(dailyLossEquityLimit)} / SOD:{" "}
          {formatCurrency(currentDayStartBalance)}
        </div>
        <ProgressBar
          progress={Math.max(0, Math.min(1, dailyDrawdownProgress / 100))}
          height={12}
          filledColor="bg-destructive"
          emptyColor="bg-accent"
        />
      </CardContent>
    </Card>
  )
}

export default DailyDrawdownCard
