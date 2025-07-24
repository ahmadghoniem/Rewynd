import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from "@/components/ui/tooltip"
import { Info } from "lucide-react"

const ProfitFactorCard = ({ extractedTrades }) => {
  let profitFactor = 0
  if (extractedTrades && extractedTrades.length > 0) {
    const wins = extractedTrades.filter(
      (t) => parseFloat(t.realized?.replace(/[$,]/g, "") || "0") > 0
    )
    const losses = extractedTrades.filter(
      (t) => parseFloat(t.realized?.replace(/[$,]/g, "") || "0") < 0
    )
    const totalProfit = wins.reduce(
      (sum, t) => sum + parseFloat(t.realized?.replace(/[$,]/g, "") || 0),
      0
    )
    const totalLoss = Math.abs(
      losses.reduce(
        (sum, t) => sum + parseFloat(t.realized?.replace(/[$,]/g, "") || 0),
        0
      )
    )
    if (totalLoss > 0) profitFactor = totalProfit / totalLoss
  }
  return (
    <Card className="gap-2 text-xs font-medium py-2">
      <CardHeader className="flex justify-between items-center tracking-tight px-2">
        <span>Profit Factor</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-pointer align-middle">
              <Info size={14} aria-label="Info about Profit Factor" />
            </span>
          </TooltipTrigger>
          <TooltipContent sideOffset={6}>
            Ratio of gross profits to gross losses. A value above 1 means
            profits exceed losses.
          </TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent>
        <div className="text-xl font-normal">{profitFactor.toFixed(2)}</div>
      </CardContent>
    </Card>
  )
}

export default ProfitFactorCard
