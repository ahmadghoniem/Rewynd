import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from "@/components/ui/tooltip"
import { Info } from "lucide-react"
import { cn, parseTradeDate, isBreakevenTrade } from "@/lib/utils"
const CurrentStreakCard = ({ extractedTrades, className }) => {
  let streak = 0
  let type = null
  if (extractedTrades && extractedTrades.length > 0) {
    // Sort by dateStart ascending
    const sorted = [...extractedTrades].sort(
      (a, b) => parseTradeDate(a.dateStart) - parseTradeDate(b.dateStart)
    )

    // Filter out breakeven trades using utility function
    const nonBreakevenTrades = sorted.filter(
      (trade) => !isBreakevenTrade(trade)
    )

    if (nonBreakevenTrades.length > 0) {
      // Start from the most recent non-breakeven trade
      for (let i = nonBreakevenTrades.length - 1; i >= 0; i--) {
        const realized = parseFloat(
          nonBreakevenTrades[i].realized?.replace(/[$,]/g, "") || "0"
        )
        if (i === nonBreakevenTrades.length - 1) {
          // Initialize the streak type based on the most recent non-breakeven trade
          type = realized > 0 ? "Win" : "Loss"
          streak = 1
        } else {
          const prevRealized = parseFloat(
            nonBreakevenTrades[i + 1].realized?.replace(/[$,]/g, "") || "0"
          )
          if (
            (realized > 0 && prevRealized > 0) ||
            (realized < 0 && prevRealized < 0)
          ) {
            streak++
          } else {
            break
          }
        }
      }
    }
  }
  return (
    <Card className={cn("gap-2 text-xs font-medium py-2", className)}>
      <CardHeader className="flex justify-between items-center  px-2">
        <span>Streak</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-pointer align-middle">
              <Info size={14} aria-label="Info about Streak" />
            </span>
          </TooltipTrigger>
          <TooltipContent sideOffset={6}>
            The number of consecutive wins or losses. Breakeven trades are
            ignored and don't reset your streak.
          </TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "text-xl font-normal",
            streak === 0 || !type
              ? "text-foreground"
              : type === "Win"
                ? "text-success"
                : "text-danger"
          )}
        >
          {streak} {type ? type + (streak > 1 ? "s" : "") : ""}
        </div>
      </CardContent>
    </Card>
  )
}

export default CurrentStreakCard
