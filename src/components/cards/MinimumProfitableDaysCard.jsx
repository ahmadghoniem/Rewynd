import React, { useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Info } from "lucide-react"
import { ProgressBar } from "../ui/progressbar"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import useAppStore from "@/store/useAppStore"
import { calculateProfitableDaysMetrics } from "@/lib/utils"

const MinimumProfitableDaysCard = (props) => {
  const config = useAppStore((state) => state.config) || {}
  const extractedTrades = useAppStore((state) => state.extractedTrades) || []
  const accountData = useAppStore((state) => state.accountData) || {
    capital: 0,
    realizedPnL: 0,
    balance: 0
  }
  const updateObjective = useAppStore((state) => state.updateObjective)

  const minProfitableDays = config.requireProfitableDays || 0
  const { profitableDays } = calculateProfitableDaysMetrics(
    extractedTrades,
    accountData.capital || 0
  )

  // Update store when profitable days status changes
  useEffect(() => {
    if (minProfitableDays > 0 && extractedTrades.length > 0) {
      const isMet = profitableDays >= minProfitableDays
      updateObjective("minimumProfitableDays", isMet)
    }
  }, [profitableDays, minProfitableDays])

  // Don't render if no minimum profitable days requirement
  if (minProfitableDays <= 0) {
    return null
  }

  return (
    <Card className={cn("gap-2 text-xs font-medium py-2", props.className)}>
      <CardHeader className="flex justify-between items-center px-2 pb-0">
        <span className="capitalize tracking-wide text-xs font-semibold">
          Minimum Profitable Days
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-pointer align-middle">
              <Info size={14} aria-label="Info about Minimum Profitable Days" />
            </span>
          </TooltipTrigger>
          <TooltipContent sideOffset={6}>
            The minimum number of profitable days required to complete the
            challenge.
          </TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-end gap-2">
          <span className="text-xl font-semibold">
            {typeof profitableDays === "number" && !isNaN(profitableDays)
              ? profitableDays
              : "--"}
          </span>
          <span className="text-base text-muted-foreground">
            /{" "}
            {typeof minProfitableDays === "number" && !isNaN(minProfitableDays)
              ? minProfitableDays
              : "--"}
          </span>
        </div>
        <div className="text-xs text-muted-foreground mb-2">
          Profitable days completed
        </div>
        <ProgressBar
          progress={
            typeof profitableDays === "number" &&
            !isNaN(profitableDays) &&
            minProfitableDays > 0
              ? Math.max(0, Math.min(1, profitableDays / minProfitableDays))
              : 0
          }
          height={12}
          filledColor="bg-primary"
          emptyColor="bg-accent"
        />
      </CardContent>
    </Card>
  )
}

export default MinimumProfitableDaysCard
