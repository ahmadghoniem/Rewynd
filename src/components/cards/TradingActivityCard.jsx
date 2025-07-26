import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, TrendingUp, Info } from "lucide-react"
import { ProgressBar } from "../ui/progressbar"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import useAppStore from "@/store/useAppStore"
import { calculateDrawdownMetrics } from "@/lib/utils"

const TradingActivityCard = (props) => {
  const config = useAppStore((state) => state.config) || {}
  const extractedTrades = useAppStore((state) => state.extractedTrades) || []
  const accountData = useAppStore((state) => state.accountData) || {
    capital: 0,
    realizedPnL: 0,
    balance: 0
  }
  const minTradingDays = config.minTradingDays || 0
  const minProfitableDays = config.requireProfitableDays || 0
  const { tradingDays, profitableDays } = calculateDrawdownMetrics(
    extractedTrades,
    accountData.capital || 0,
    config.maxDrawdown || 5,
    config.dailyDrawdown || 3
  )
  return (
    <Card className={cn(props.className)}>
      <CardContent className="space-y-6">
        {/* Minimum Trading Days Objective */}
        {minTradingDays > 0 && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-info" />
                <span className="text-sm font-medium text-muted-foreground">
                  Minimum Trading Days
                </span>
              </div>
              <div className="text-right">
                <Badge
                  variant={
                    tradingDays >= minTradingDays ? "default" : "secondary"
                  }
                  className="mb-1"
                >
                  {tradingDays}/{minTradingDays}
                </Badge>
              </div>
            </div>
            <ProgressBar
              progress={minTradingDays > 0 ? tradingDays / minTradingDays : 0}
              height={12}
              filledColor="bg-primary"
              emptyColor="bg-accent"
            />
          </div>
        )}
        {/* Minimum Profitable Days Objective */}
        {minProfitableDays > 0 && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Tooltip>
                    <span
                      className="text-muted-foreground cursor-help"
                      style={{ display: "inline-flex", alignItems: "center" }}
                    >
                      <TooltipTrigger asChild>
                        <span
                          className="border-b border-dashed border-muted-foreground/50"
                          style={{ display: "inline-block" }}
                        >
                          Minimum Profitable Days
                        </span>
                      </TooltipTrigger>
                    </span>
                    <TooltipContent side="top" sideOffset={0} align="center">
                      Days with 0.5% profit
                    </TooltipContent>
                  </Tooltip>
                </span>
              </div>
              <div className="text-right">
                <Badge
                  variant={
                    profitableDays >= minProfitableDays
                      ? "default"
                      : "secondary"
                  }
                  className="mb-1"
                >
                  {profitableDays}/{minProfitableDays}
                </Badge>
              </div>
            </div>
            <ProgressBar
              progress={
                minProfitableDays > 0 ? profitableDays / minProfitableDays : 0
              }
              height={12}
              filledColor="bg-primary"
              emptyColor="bg-accent"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default TradingActivityCard
