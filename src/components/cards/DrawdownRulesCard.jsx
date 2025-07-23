import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"
import DashedProgressBar from "../ui/DashedProgressBar"

const DrawdownRulesCard = ({ dailyDrawdown, dailyDrawdownProgress, maxDrawdown, maxDrawdownProgress }) => (
  <Card>
    <CardContent className="space-y-6">
      {/* Daily Drawdown Objective */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-warning" />
            <span className="text-sm font-medium text-muted-foreground">Daily Drawdown</span>
          </div>
          <div className="text-right">
            <Badge variant="outline" className="mb-1">{dailyDrawdown}%</Badge>
            <p className="text-xs text-muted-foreground">
              {dailyDrawdownProgress.toFixed(1)}% used
            </p>
          </div>
        </div>
        <div className="space-y-1">
          <DashedProgressBar
            progress={dailyDrawdownProgress / 100}
            numDashes={20}
            filledColor="var(--tw-bg-primary, #2563eb)"
            emptyColor="var(--tw-bg-accent, #f1f5f9)"
            height={12}
            radius={4}
          />
        </div>
      </div>
      {/* Max Drawdown Objective */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-danger" />
            <span className="text-sm font-medium text-muted-foreground">Max Drawdown</span>
          </div>
          <div className="text-right">
            <Badge variant="outline" className="mb-1">{maxDrawdown}%</Badge>
            <p className="text-xs text-muted-foreground">
              {maxDrawdownProgress.toFixed(1)}% used
            </p>
          </div>
        </div>
        <div className="space-y-1">
          <DashedProgressBar
            progress={maxDrawdownProgress / 100}
            numDashes={50}
            filledColor="var(--tw-bg-primary, #2563eb)"
            emptyColor="var(--tw-bg-accent, #f1f5f9)"
            height={15}
            radius={2}
          />
        </div>
      </div>
    </CardContent>
  </Card>
)

export default DrawdownRulesCard 