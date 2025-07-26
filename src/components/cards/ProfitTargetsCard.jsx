import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target } from "lucide-react"
import { cn } from "@/lib/utils"
import { ProgressBar } from "../ui/progressbar"
import useAppStore from "@/store/useAppStore"
import {
  getTargetAmounts,
  calculateIndividualTargetProgress,
  formatCurrency as defaultFormatCurrency
} from "@/lib/utils"

const ProfitTargetsCard = (props) => {
  const config = useAppStore((state) => state.config) || {}
  const accountData = useAppStore((state) => state.accountData) || {
    capital: 0,
    realizedPnL: 0,
    balance: 0
  }
  const profitTargets = props.profitTargets ||
    config.profitTargets || { phase1: 10 }
  const targetAmounts =
    props.targetAmounts ||
    getTargetAmounts(profitTargets, accountData.capital || 0)
  const targetProgress =
    props.targetProgress ||
    calculateIndividualTargetProgress(
      profitTargets,
      accountData.capital || 0,
      accountData.realizedPnL || 0
    )
  const formatCurrency = props.formatCurrency || defaultFormatCurrency
  return (
    <Card className={cn("w-full", props.className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Profit Targets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(profitTargets || {}).map(([phase, target]) => (
          <div key={phase} className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {phase.charAt(0).toUpperCase() +
                    phase.slice(1).replace(/(\d)/, " $1")}
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Target: {target}% ({formatCurrency(targetAmounts[phase])})
                </p>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="mb-1">
                  {target}%
                </Badge>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {targetProgress[phase]?.toFixed(1) ?? 0}% complete
                </p>
              </div>
            </div>
            {/* Progress Bar */}
            <ProgressBar
              progress={Math.max(
                0,
                Math.min(1, (targetProgress[phase] || 0) / 100)
              )}
              height={12}
              filledColor="bg-primary"
              emptyColor="bg-accent"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default ProfitTargetsCard
