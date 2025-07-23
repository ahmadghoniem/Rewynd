import { Card, CardContent, CardHeader } from "@/components/ui/card"

const TraderExpectancyCard = ({ extractedTrades }) => {
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
    <Card className="gap-2 text-xs font-medium">
      <CardHeader>Expectancy</CardHeader>
      <CardContent>
        <div className="text-xl font-normal">{expectancy.toFixed(2)}</div>
      </CardContent>
    </Card>
  )
}

export default TraderExpectancyCard
