import React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info } from "lucide-react"
import { ProgressBar } from "../ui/progressbar"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import useAppStore from "@/store/useAppStore"
import { calculateDrawdownMetrics } from "@/lib/utils"

const MaxDrawdownCard = (props) => {
  const config = useAppStore((state) => state.config) || {}
  const accountData = useAppStore((state) => state.accountData) || {
    capital: 0,
    realizedPnL: 0,
    balance: 0
  }
  const extractedTrades = useAppStore((state) => state.extractedTrades) || []
  const maxDrawdown = props.maxDrawdown ?? config.maxDrawdown
  const initialCapital = accountData.capital || 0
  const { maxDrawdownUsed, maxDrawdownProgress } = calculateDrawdownMetrics(
    extractedTrades,
    initialCapital,
    maxDrawdown,
    config.dailyDrawdown
  )
  return (
    <Card className={cn("gap-2 text-xs font-medium py-2", props.className)}>
      <CardHeader className="flex justify-between items-center px-2 pb-0">
        <span className="uppercase tracking-wide text-xs font-semibold">
          Max Trailing Loss
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-pointer align-middle">
              <Info size={14} aria-label="Info about Max Trailing Loss" />
            </span>
          </TooltipTrigger>
          <TooltipContent sideOffset={6}>
            The maximum trailing loss allowed before breaching the account rule.
          </TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-end gap-2">
          <span className="text-2xl font-semibold">
            {typeof maxDrawdownUsed === "number" && !isNaN(maxDrawdownUsed)
              ? maxDrawdownUsed.toFixed(2) + "%"
              : "--"}
          </span>
          <span className="text-base text-muted-foreground">
            /{" "}
            {typeof maxDrawdown === "number" && !isNaN(maxDrawdown)
              ? maxDrawdown + "%"
              : "--"}
          </span>
        </div>
        <div className="text-xs text-muted-foreground mb-2">
          Equity limit: --
        </div>
        <ProgressBar
          progress={
            typeof maxDrawdownProgress === "number" &&
            !isNaN(maxDrawdownProgress)
              ? Math.max(0, Math.min(1, maxDrawdownProgress / 100))
              : 0
          }
          height={12}
          filledColor="bg-destructive"
          emptyColor="bg-accent"
        />
      </CardContent>
    </Card>
  )
}

export default MaxDrawdownCard
