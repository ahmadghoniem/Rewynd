import React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

const WinsSummaryCard = ({ stats, formatCurrency }) => {
  return (
    <Card className="bg-card text-card-foreground">
      <CardContent className="flex flex-row items-center justify-between">
        {/* Average Win Section */}
        <div className="flex flex-col items-start flex-1">
          <span className="text-xs text-gray-400 mb-1">Average Win</span>
          <div className="flex items-center gap-2">
            {/* Up-trend icon */}
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path
                d="M3 17L9 11L13 15L21 7"
                stroke="#4ade80"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="21" cy="7" r="1.5" fill="#4ade80" />
            </svg>
            <span className="text-2xl font-normal text-success">
              {formatCurrency(stats.averageProfit)}
            </span>
          </div>
        </div>
        {/* Divider */}
        <div className="h-12 w-px bg-border mx-6" />
        {/* Max Consecutive Wins Section */}
        <div className="flex flex-col items-end flex-1">
          <span className="text-xs text-card-foreground mb-1">
            Max Consecutive Wins
          </span>
          <span className="text-2xl font-normal text-success">
            {stats.maxConsecutiveWins}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export default WinsSummaryCard
