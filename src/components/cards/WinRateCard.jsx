import { Card, CardContent, CardHeader } from "@/components/ui/card"

const WinRateCard = ({ extractedTrades }) => {
  let winRate = 0
  if (extractedTrades && extractedTrades.length > 0) {
    const wins = extractedTrades.filter(
      (t) => parseFloat(t.realized?.replace(/[$,]/g, "") || "0") > 0
    ).length
    winRate = (wins / extractedTrades.length) * 100
  }
  return (
    <Card className="gap-2 text-xs font-medium">
      <CardHeader>Win Rate</CardHeader>
      <CardContent>
        <div className="text-xl font-normal">{winRate.toFixed(1)}%</div>
      </CardContent>
    </Card>
  )
}

export default WinRateCard
