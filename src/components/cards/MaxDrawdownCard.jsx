import React, { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Info } from "lucide-react"
import { ProgressBar } from "../ui/progressbar"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import useAppStore from "@/store/useAppStore"
import { calculateMaxDrawdownMetrics, formatCurrency } from "@/lib/utils"

const MaxDrawdownCard = ({ className }) => {
  const [showAmounts, setShowAmounts] = useState(false)
  const config = useAppStore((state) => state.config) || {}
  const accountData = useAppStore((state) => state.accountData) || {
    capital: 0,
    realizedPnL: 0,
    balance: 0
  }
  const extractedTrades = useAppStore((state) => state.extractedTrades)

  const maxDrawdown = config.maxDrawdown ?? 5
  const maxDrawdownType = config.maxDrawdownType
  const initialCapital = accountData.capital || 0

  // Calculate metrics directly
  const {
    maxDrawdownUsed = 0,
    maxDrawdownProgress = 0,
    maxDrawdownAmount = 0,
    maxDrawdownTargetAmount = 0,
    trailingLossEquityLimit = initialCapital
  } = initialCapital && maxDrawdown
    ? calculateMaxDrawdownMetrics(
        extractedTrades,
        initialCapital,
        accountData.balance,
        maxDrawdown,
        maxDrawdownType
      )
    : {}

  // Don't render if no capital or invalid configuration
  if (!initialCapital || !maxDrawdown) {
    return null
  }

  return (
    <Card className={cn("gap-2 text-xs font-medium py-2", className)}>
      <CardHeader className="flex justify-between items-center px-2 pb-0">
        <span className="capitalize tracking-wide text-xs font-semibold">
          Max {getDrawdownTypeLabel(maxDrawdownType)} Loss
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-pointer align-middle">
              <Info size={14} aria-label="Info about Max Drawdown" />
            </span>
          </TooltipTrigger>
          <TooltipContent sideOffset={6}>
            {getDrawdownTypeDescription(maxDrawdownType)}
          </TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent className="pt-0">
        <div
          className="flex items-end gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setShowAmounts(!showAmounts)}
        >
          <span className="text-xl font-semibold">
            {showAmounts
              ? formatCurrency(maxDrawdownAmount)
              : `${maxDrawdownUsed.toFixed(2)}%`}
          </span>
          <span className="text-base text-muted-foreground">
            /{" "}
            {showAmounts
              ? formatCurrency(maxDrawdownTargetAmount)
              : `${maxDrawdown}%`}
          </span>
        </div>
        <div className="text-xs text-muted-foreground mb-2">
          Equity limit: {formatCurrency(trailingLossEquityLimit)}
        </div>
        <ProgressBar
          progress={Math.max(0, Math.min(1, maxDrawdownProgress / 100))}
          height={12}
          filledColor="bg-destructive"
          emptyColor="bg-accent"
        />
      </CardContent>
    </Card>
  )
}

// Helper functions for drawdown type labels and descriptions
const getDrawdownTypeLabel = (maxDrawdownType) => {
  const labels = {
    static: "Static",
    trailing: "Trailing (Fixed)",
    trailing_scaling: "Trailing (Scaling)"
  }
  return labels[maxDrawdownType] || "Static"
}

const getDrawdownTypeDescription = (maxDrawdownType) => {
  const descriptions = {
    static:
      "The maximum static loss allowed before breaching the account rule. Fixed limit based on starting capital.",
    trailing:
      "The maximum trailing loss allowed before breaching the account rule. Trails up as equity increases with a fixed buffer based on initial capital.",
    trailing_scaling:
      "The maximum trailing loss allowed before breaching the account rule. Trails up as equity increases with a scaling buffer that grows with performance."
  }
  return descriptions[maxDrawdownType] || descriptions.static
}

export default MaxDrawdownCard
