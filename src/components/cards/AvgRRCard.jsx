import { Card, CardContent, CardHeader } from "@/components/ui/card"

const AvgRRCard = ({ extractedTrades }) => {
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
    <Card className="gap-2 text-xs font-medium">
      <CardHeader>Avg R/R</CardHeader>
      <CardContent>
        <div className="text-xl font-normal">{avgRR.toFixed(2)}</div>
      </CardContent>
    </Card>
  )
}

export default AvgRRCard
