import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target } from "lucide-react"
import { Button } from "@/components/ui/button"

const ProfitTargetsCard = ({
  profitTargets,
  targetAmounts,
  targetProgress,
  formatCurrency
}) => {
  const [selectedPhase, setSelectedPhase] = useState(null)
  const phaseEntries = Object.entries(profitTargets)
  let currentPhaseIndex = phaseEntries.findIndex(
    ([phase]) => targetProgress[phase] < 100
  )
  if (currentPhaseIndex === -1) currentPhaseIndex = phaseEntries.length - 1

  // Full view for a single phase
  if (selectedPhase) {
    const target = profitTargets[selectedPhase]
    const progress = targetProgress[selectedPhase]
    const isCompleted = progress >= 100
    return (
      <Card>
        <CardContent>
          <Button variant="outline" size="sm" className="mb-4" onClick={() => setSelectedPhase(null)}>
            ← Back
          </Button>
          <div className="flex flex-col items-center justify-center min-h-[180px]">
            <div className="flex items-center gap-2 text-lg mb-2">
              <Target className="h-6 w-6" />
              <span className="font-bold">
                {selectedPhase.charAt(0).toUpperCase() + selectedPhase.slice(1).replace(/(\d)/, " $1")}
              </span>
            </div>
            <div className="text-3xl font-extrabold mb-2 text-foreground">{target}%</div>
            <div className="text-md text-muted-foreground mb-2">
              Target: {target}% ({formatCurrency(targetAmounts[selectedPhase])})
            </div>
            {isCompleted ? (
              <Badge variant="success" className="mt-2">Completed</Badge>
            ) : (
              <>
                <div className="flex justify-between text-sm mt-2 mb-1">
                  <span className="font-semibold">
                    {progress.toFixed(1)}% complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-5 mb-2">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-green-500 h-5 rounded-full transition-all duration-300 shadow-sm"
                    style={{ width: `${Math.min(100, progress)}%` }}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Selection pane
  return (
    <Card>
      <CardContent>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '16px',
            width: '100%',
            minHeight: 120,
            justifyContent: 'space-between',
            alignItems: 'stretch',
          }}
        >
          {phaseEntries.map(([phase, target], idx) => {
            const isCompleted = targetProgress[phase] >= 100
            const isCurrent = idx === currentPhaseIndex && !isCompleted
            return (
              <button
                key={phase}
                type="button"
                onClick={() => setSelectedPhase(phase)}
                className={
                  "flex flex-col justify-between flex-1 min-w-0 rounded-lg p-4 bg-muted text-muted-foreground shadow-sm focus:outline-none hover:bg-accent cursor-pointer"
                }
                style={{
                  minWidth: `calc(${100 / phaseEntries.length}% - 8px)`,
                  maxWidth: `calc(${100 / phaseEntries.length}% - 8px)`,
                  minHeight: 120,
                  scrollSnapAlign: 'start',
                  // Remove border and transition
                  // border: isCurrent ? '2px solid #10b981' : 'none',
                  opacity: isCompleted ? 0.7 : 1,
                }}
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <span className="mr-2">
                    <Target className="h-4 w-4" />
                  </span>
                  <span className="font-semibold">
                    {phase.charAt(0).toUpperCase() + phase.slice(1).replace(/(\d)/, " $1")}
                  </span>
                </div>
                <div className="text-2xl font-extrabold text-foreground">
                  {target}%
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  Target: {target}% ({formatCurrency(targetAmounts[phase])})
                </div>
                {isCompleted ? (
                  <Badge variant="success" className="mt-2">Completed</Badge>
                ) : isCurrent ? (
                  <>
                    <div className="flex justify-between text-xs mt-2 mb-1">
                      <span className="font-semibold">
                        {targetProgress[phase].toFixed(1)}% complete
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-green-500 h-4 rounded-full transition-all duration-300 shadow-sm"
                        style={{ width: `${Math.min(100, targetProgress[phase])}%` }}
                      />
                    </div>
                  </>
                ) : null}
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default ProfitTargetsCard 