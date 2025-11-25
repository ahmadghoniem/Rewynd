import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from "@/components/ui/tooltip"
import { Info } from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
const TraderExpectancyCard = ({ extractedTrades, className }) => {
  let expectancy = 0
  if (extractedTrades && extractedTrades.length > 0) {
    const wins = extractedTrades.filter(
      (t) => parseFloat(t.realized?.replace(/[$,]/g, "") || "0") > 0
    )
    const losses = extractedTrades.filter(
      (t) => parseFloat(t.realized?.replace(/[$,]/g, "") || "0") < 0
    )
    const winRate = wins.length / extractedTrades.length
    const lossRate = losses.length / extractedTrades.length
    const avgWin =
      wins.length > 0
        ? wins.reduce(
            (sum, t) => sum + parseFloat(t.realized?.replace(/[$,]/g, "") || 0),
            0
          ) / wins.length
        : 0
    const avgLoss =
      losses.length > 0
        ? Math.abs(
            losses.reduce(
              (sum, t) =>
                sum + parseFloat(t.realized?.replace(/[$,]/g, "") || 0),
              0
            ) / losses.length
          )
        : 0
    expectancy = avgWin * winRate - avgLoss * lossRate
  }
  return (
    <Card className={cn("gap-2 text-xs font-medium py-2", className)}>
      <CardHeader className="flex justify-between items-center  px-2">
        <span>Expectancy</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-pointer align-middle">
              <Info size={14} aria-label="Info about Expectancy" />
            </span>
          </TooltipTrigger>
          <TooltipContent sideOffset={6}>
            The average amount you can expect to win (or lose) per trade. <br />
            Calculated using win rate, loss rate, average win, and average loss.
          </TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent>
        <div className="text-xl font-normal">{formatCurrency(expectancy)}</div>
      </CardContent>
    </Card>
  )
}

export default TraderExpectancyCard
