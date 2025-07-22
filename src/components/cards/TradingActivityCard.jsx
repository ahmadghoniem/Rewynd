import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, TrendingUp, Info } from "lucide-react"
import DashedProgressBar from "../ui/DashedProgressBar"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

const TradingActivityCard = ({ minTradingDays, tradingDays, minProfitableDays, profitableDays }) => (
  <Card>
    <CardContent className="space-y-6">
      {/* Minimum Trading Days Objective */}
      {minTradingDays > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-info" />
              <span className="text-sm font-medium text-muted-foreground">Minimum Trading Days</span>
            </div>
            <div className="text-right">
              <Badge variant={tradingDays >= minTradingDays ? 'default' : 'secondary'} className="mb-1">
                {tradingDays}/{minTradingDays}
              </Badge>
            </div>
          </div>
          <DashedProgressBar
            progress={tradingDays / minTradingDays}
            numDashes={minTradingDays}
            filledColor="var(--tw-bg-primary, #2563eb)"
            emptyColor="var(--tw-bg-accent, #f1f5f9)"
            height={12}
            radius={4}
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
                <span className="text-muted-foreground cursor-help" style={{display: 'inline-flex', alignItems: 'center'}}>
                <TooltipTrigger asChild>
                  <span className="border-b border-dashed border-muted-foreground/50" style={{display: 'inline-block'}}>
                    Minimum Profitable Days
                  </span>
              </TooltipTrigger>
              </span>
                  <TooltipContent side="top" sideOffset={0} align="center">
                    Days with ≥ 0.5% profit
                  </TooltipContent>
                </Tooltip>
              </span>
            </div>
            <div className="text-right">
              <Badge variant={profitableDays >= minProfitableDays ? 'default' : 'secondary'} className="mb-1">
                {profitableDays}/{minProfitableDays}
              </Badge>
            </div>
          </div>
          <DashedProgressBar
            progress={profitableDays / minProfitableDays}
            numDashes={minProfitableDays}
            filledColor="var(--tw-bg-primary, #2563eb)"
            emptyColor="var(--tw-bg-accent, #f1f5f9)"
            height={12}
            radius={4}
          />
        </div>
      )}
    </CardContent>
  </Card>
)

export default TradingActivityCard 