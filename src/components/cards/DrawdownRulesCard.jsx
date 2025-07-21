import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

const DrawdownRulesCard = ({ dailyDrawdown, dailyDrawdownProgress, maxDrawdown, maxDrawdownProgress }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <TrendingDown className="h-5 w-5 text-danger" />
        Drawdown Rules
      </CardTitle>
    </CardHeader>
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
          <div className="w-full bg-background rounded-full h-4">
            <div 
              className="bg-warning-gradient h-4 rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${Math.min(100, dailyDrawdownProgress)}%` }}
            />
          </div>
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
          <div className="w-full bg-background rounded-full h-4">
            <div 
              className="bg-danger-gradient h-4 rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${Math.min(100, maxDrawdownProgress)}%` }}
            />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
)

export default DrawdownRulesCard 