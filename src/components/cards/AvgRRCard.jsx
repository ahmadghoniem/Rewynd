import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from "@/components/ui/tooltip"
import { Info } from "lucide-react"

const AvgRRCard = ({ extractedTrades, className }) => {
  let avgRR = 0
  if (extractedTrades && extractedTrades.length > 0) {
    const validRRs = extractedTrades
      .map((t) => parseFloat(t.maxRR))
      .filter((rr) => !isNaN(rr))
    if (validRRs.length > 0) {
      avgRR = validRRs.reduce((a, b) => a + b, 0) / validRRs.length
    }
  }
  return (
    <Card className={cn("gap-2 text-xs font-medium py-2", className)}>
      <CardHeader className="flex justify-between items-center  px-2">
        <span>Avg R/R</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-pointer align-middle">
              <Info size={14} aria-label="Info about Avg R/R" />
            </span>
          </TooltipTrigger>
          <TooltipContent sideOffset={6}>
            Average Reward-to-Risk ratio. Shows the average potential reward
            compared to risk taken per trade.
          </TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent>
        <div className="text-xl font-normal">{avgRR.toFixed(2)}</div>
      </CardContent>
    </Card>
  )
}

export default AvgRRCard
