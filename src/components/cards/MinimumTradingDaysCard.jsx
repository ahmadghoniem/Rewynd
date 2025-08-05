import React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Info } from "lucide-react"
import { ProgressBar } from "../ui/progressbar"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import useAppStore from "@/store/useAppStore"
import { calculateDailyDrawdownMetrics } from "@/lib/utils"

const MinimumTradingDaysCard = (props) => {
  const config = useAppStore((state) => state.config) || {}
  const extractedTrades = useAppStore((state) => state.extractedTrades) || []
  const accountData = useAppStore((state) => state.accountData) || {
    capital: 0,
    realizedPnL: 0,
    balance: 0
  }
  const minTradingDays = config.minTradingDays || 0
  const { dailyPnLMap } = calculateDailyDrawdownMetrics(
    extractedTrades,
    accountData.capital || 0,
    config.dailyDrawdown || 2
  )
  const tradingDays = Object.keys(dailyPnLMap).length

  // Don't render if no minimum trading days requirement
  if (minTradingDays <= 0) {
    return null
  }

  return (
    <Card className={cn("gap-2 text-xs font-medium py-2", props.className)}>
      <CardHeader className="flex justify-between items-center px-2 pb-0">
        <span className="uppercase tracking-wide text-xs font-semibold">
          Minimum Trading Days
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-pointer align-middle">
              <Info size={14} aria-label="Info about Minimum Trading Days" />
            </span>
          </TooltipTrigger>
          <TooltipContent sideOffset={6}>
            The minimum number of trading days required to complete the
            challenge.
          </TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-end gap-2">
          <span className="text-2xl font-semibold">
            {typeof tradingDays === "number" && !isNaN(tradingDays)
              ? tradingDays
              : "--"}
          </span>
          <span className="text-base text-muted-foreground">
            /{" "}
            {typeof minTradingDays === "number" && !isNaN(minTradingDays)
              ? minTradingDays
              : "--"}
          </span>
        </div>
        <div className="text-xs text-muted-foreground mb-2">
          Trading days completed
        </div>
        <ProgressBar
          progress={
            typeof tradingDays === "number" &&
            !isNaN(tradingDays) &&
            minTradingDays > 0
              ? Math.max(0, Math.min(1, tradingDays / minTradingDays))
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

export default MinimumTradingDaysCard
