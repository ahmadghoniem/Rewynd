import { Card, CardContent, CardHeader } from "@/components/ui/card"

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
    <Card className="gap-2 text-xs font-medium">
      <CardHeader>Profit Factor</CardHeader>
      <CardContent>
        <div className="text-xl font-normal">{profitFactor.toFixed(2)}</div>
      </CardContent>
    </Card>
  )
}

export default ProfitFactorCard
