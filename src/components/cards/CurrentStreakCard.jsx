import { Card, CardContent, CardHeader } from "@/components/ui/card"

const CurrentStreakCard = ({ extractedTrades }) => {
  let streak = 0
  let type = null
  if (extractedTrades && extractedTrades.length > 0) {
    // Sort by dateStart ascending
    const sorted = [...extractedTrades].sort(
      (a, b) => new Date(a.dateStart) - new Date(b.dateStart)
    )
    for (let i = sorted.length - 1; i >= 0; i--) {
      const realized = parseFloat(
        sorted[i].realized?.replace(/[$,]/g, "") || "0"
      )
      if (i === sorted.length - 1) {
        type = realized > 0 ? "Win" : realized < 0 ? "Loss" : null
        streak = 1
      } else {
        const prevRealized = parseFloat(
          sorted[i + 1].realized?.replace(/[$,]/g, "") || "0"
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
  return (
    <Card className="gap-2 text-xs font-medium">
      <CardHeader>Streak</CardHeader>
      <CardContent>
        <div className="text-xl font-normal">
          {streak} {type ? type + (streak > 1 ? "s" : "") : ""}
        </div>
      </CardContent>
    </Card>
  )
}

export default CurrentStreakCard
