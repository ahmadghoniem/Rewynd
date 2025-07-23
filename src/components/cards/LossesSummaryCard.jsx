import React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

const LossesSummaryCard = ({ stats, formatCurrency }) => {
  return (
    <Card className="bg-card text-card-foreground">
      <CardContent className="flex flex-row items-center justify-between">
        {/* Average Loss Section */}
        <div className="flex flex-col items-start flex-1">
          <span className="text-xs text-gray-400 mb-1">Average Loss</span>
          <div className="flex items-center gap-2">
            {/* Down-trend icon */}
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path
                d="M3 7L9 13L13 9L21 17"
                stroke="#f87171"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="21" cy="17" r="1.5" fill="#f87171" />
            </svg>
            <span className="text-2xl font-normal text-danger">
              {formatCurrency(stats.averageLoss)}
            </span>
          </div>
        </div>
        {/* Divider */}
        <div className="h-12 w-px bg-border mx-6" />
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
