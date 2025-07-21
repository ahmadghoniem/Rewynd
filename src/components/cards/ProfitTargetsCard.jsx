import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target } from "lucide-react"

const ProfitTargetsCard = ({
  profitTargets,
  targetAmounts,
  targetProgress,
  formatCurrency
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Target className="h-5 w-5" />
        Profit Targets
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      {Object.entries(profitTargets).map(([phase, target]) => (
        <div key={phase} className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {phase.charAt(0).toUpperCase() + phase.slice(1).replace(/(\d)/, " $1")}
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Target: {target}% ({formatCurrency(targetAmounts[phase])})
              </p>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="mb-1">{target}%</Badge>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {targetProgress[phase].toFixed(1)}% complete
              </p>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-green-500 h-4 rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${Math.min(100, targetProgress[phase])}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
)

export default ProfitTargetsCard 