import React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const LossesSummaryCard = ({ stats, formatCurrency, className }) => {
  return (
    <Card className={cn("bg-card py-2", className)}>
      <CardContent className="flex flex-row items-center justify-between px-2">
        {/* Average Loss Section */}
        <div className="flex flex-col items-start flex-1">
          <span className="text-xs text-card-foreground mb-1">
            Average Loss
          </span>
          <div className="flex items-center gap-2">
            {/* Down-trend icon */}
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path
                d="M3 7L9 13L13 9L21 17"
                stroke="var(--danger)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="21" cy="17" r="1.5" fill="var(--danger)" />
            </svg>
            <span className="text-2xl font-normal text-danger">
              {formatCurrency(stats.averageLoss)}
            </span>
          </div>
        </div>
        {/* Divider */}
        <div className="h-12 w-px bg-divider mx-6" />
        {/* Max Consecutive Losses Section */}
        <div className="flex flex-col items-end flex-1">
          <span className="text-xs text-card-foreground mb-1">
            Max Consecutive Losses
          </span>
          <span className="text-2xl font-normal text-danger">
            {stats.maxConsecutiveLosses}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export default LossesSummaryCard
