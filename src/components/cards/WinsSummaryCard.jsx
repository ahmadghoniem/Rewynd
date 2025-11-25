import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

const WinsSummaryCard = ({ stats, formatCurrency, className }) => {
  return (
    <Card className={cn("bg-card py-2", className)}>
      <CardContent className="flex flex-row items-center justify-between px-2">
        {/* Average Win Section */}
        <div className="flex flex-col items-start flex-1">
          <span className="text-xs text-card-foreground mb-1">Average Win</span>
          <div className="flex items-center gap-2">
            {/* Up-trend icon */}
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path
                d="M3 17L9 11L13 15L21 7"
                stroke="var(--success)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="21" cy="7" r="1.5" fill="var(--success)" />
            </svg>
            <span className="text-2xl font-normal text-success">
              {formatCurrency(stats.averageProfit)}
            </span>
          </div>
        </div>
        {/* Separator */}
        <Separator className="h-12 mx-6" orientation="vertical" />
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
