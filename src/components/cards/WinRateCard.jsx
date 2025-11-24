import { useState } from "react"
import { Card } from "@/components/ui/card"
import { cn, isBreakevenTrade } from "@/lib/utils"
import { ChartContainer } from "@/components/ui/chart"
import { RadialBarChart, RadialBar, PolarRadiusAxis, Label } from "recharts"

const WinRateCard = ({ extractedTrades, className }) => {
  const [hoveredSegment, setHoveredSegment] = useState(null)

  let winRate = 0,
    won = 0,
    loss = 0,
    breakeven = 0
  if (extractedTrades && extractedTrades.length > 0) {
    won = extractedTrades.filter(
      (t) => parseFloat(t.realized?.replace(/[$,]/g, "") || "0") > 0
    ).length
    loss = extractedTrades.filter(
      (t) => parseFloat(t.realized?.replace(/[$,]/g, "") || "0") < 0
    ).length
    // Count breakeven trades using utility function
    breakeven = extractedTrades.filter((trade) =>
      isBreakevenTrade(trade)
    ).length
    winRate = (won / extractedTrades.length) * 100
  }

  const hasNoTrades = !extractedTrades || extractedTrades.length === 0
  const total = extractedTrades?.length || 0

  // For empty state, show 50-50 split
  const displayWon = hasNoTrades ? 1 : won
  const displayLoss = hasNoTrades ? 1 : loss
  const displayBreakeven = hasNoTrades ? 0 : breakeven
  const displayWinRate = hasNoTrades ? 0 : winRate

  // Determine what number to display based on hover state
  const getDisplayNumber = () => {
    if (hasNoTrades) return 0
    if (hoveredSegment === "won") return won
    if (hoveredSegment === "loss") return loss
    if (hoveredSegment === "breakeven") return breakeven
    return total
  }

  const chartData = [
    { won: displayWon, loss: displayLoss, breakeven: displayBreakeven }
  ]
  const chartConfig = {
    won: { label: "Won", color: "var(--color-success)" },
    loss: { label: "Loss", color: "var(--color-danger)" },
    breakeven: { label: "B/E", color: "var(--color-muted)" }
  }

  // Get the label text to display behind the number
  const getLabelText = () => {
    if (hasNoTrades || !hoveredSegment) return ""
    if (hoveredSegment === "won") return chartConfig.won.label
    if (hoveredSegment === "loss") return chartConfig.loss.label
    if (hoveredSegment === "breakeven") return chartConfig.breakeven.label
    return ""
  }

  return (
    <Card
      className={cn(
        "flex flex-row max-h-full gap-4 text-xs font-medium p-2 justify-between items-start min-h-full",
        className
      )}
    >
      <div className="flex flex-col justify-between">
        <div className="mb-2 text-card-foreground">Win Rate</div>
        <div className="text-xl font-normal text-foreground">
          {displayWinRate.toFixed(1)}%
        </div>
      </div>
      <div
        className="flex items-center justify-center flex-col text-foreground"
        onMouseLeave={() => setHoveredSegment(null)}
      >
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-20 max-h-20"
        >
          <RadialBarChart
            data={chartData}
            endAngle={180}
            innerRadius={33}
            outerRadius={53}
            startAngle={0}
            onMouseLeave={() => setHoveredSegment(null)}
          >
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    const labelText = getLabelText()
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        {labelText && (
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) - 10}
                            className="fill-foreground/60 text-sm font-normal  pointer-events-none"
                          >
                            {labelText}
                          </tspan>
                        )}
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 4}
                          className="fill-foreground text-lg font-bold z-10"
                        >
                          {getDisplayNumber()}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
            <RadialBar
              dataKey="loss"
              stackId="a"
              cornerRadius={4}
              fill="var(--color-danger)"
              className="stroke-transparent stroke-8"
              opacity={
                hoveredSegment === null
                  ? 1
                  : hoveredSegment === "loss"
                    ? 1
                    : 0.3
              }
              onMouseEnter={() => setHoveredSegment("loss")}
              onMouseLeave={() => setHoveredSegment(null)}
            />
            <RadialBar
              dataKey="breakeven"
              stackId="a"
              cornerRadius={4}
              fill="var(--color-slate-400)"
              className="stroke-transparent stroke-8"
              opacity={
                hoveredSegment === null
                  ? 1
                  : hoveredSegment === "breakeven"
                    ? 1
                    : 0.3
              }
              onMouseEnter={() => setHoveredSegment("breakeven")}
              onMouseLeave={() => setHoveredSegment(null)}
            />
            <RadialBar
              dataKey="won"
              stackId="a"
              cornerRadius={4}
              fill="var(--color-success)"
              className="stroke-transparent stroke-8"
              opacity={
                hoveredSegment === null ? 1 : hoveredSegment === "won" ? 1 : 0.3
              }
              onMouseEnter={() => setHoveredSegment("won")}
              onMouseLeave={() => setHoveredSegment(null)}
            />
          </RadialBarChart>
        </ChartContainer>
      </div>
    </Card>
  )
}

export default WinRateCard
