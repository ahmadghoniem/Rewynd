import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, TrendingUp } from "lucide-react"
import DashedProgressBar from "../ui/DashedProgressBar"

const TradingActivityCard = ({ minTradingDays, tradingDays, minProfitableDays, profitableDays }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-info" />
        Trading Activity
      </CardTitle>
    </CardHeader>
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
              <span className="text-sm font-medium text-muted-foreground">Minimum Profitable Days</span>
            </div>
            <div className="text-right">
              <Badge variant={profitableDays >= minProfitableDays ? 'default' : 'secondary'} className="mb-1">
                {profitableDays}/{minProfitableDays}
              </Badge>
              <p className="text-xs text-muted-foreground">
                Days with ≥ 0.5% profit
              </p>
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