import { Card } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { RadialBarChart, RadialBar, PolarRadiusAxis, Label } from "recharts"

const WinRateCard = ({ extractedTrades }) => {
  let winRate = 0,
    won = 0,
    loss = 0
  if (extractedTrades && extractedTrades.length > 0) {
    won = extractedTrades.filter(
      (t) => parseFloat(t.realized?.replace(/[$,]/g, "") || "0") > 0
    ).length
    loss = extractedTrades.filter(
      (t) => parseFloat(t.realized?.replace(/[$,]/g, "") || "0") < 0
    ).length
    winRate = (won / extractedTrades.length) * 100
  }
  const total = extractedTrades?.length || 0
  const chartData = [{ won, loss }]
  const chartConfig = {
    won: { label: "Won", color: "var(--color-success)" },
    loss: { label: "Loss", color: "var(--color-danger)" }
    // breakeven: { label: "Breakeven", color: "var(--color-breakeven)" }
  }

  return (
    <Card className="flex flex-row max-h-20 gap-4 text-xs font-medium p-2 justify-between items-start min-h-full">
      <div className="flex flex-col justify-between">
        <div className="font-semibold mb-2">Win Rate</div>
        <div className="text-xl font-normal">{winRate.toFixed(1)}%</div>
      </div>
      <div className="flex items-center justify-center flex-col">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-20 max-h-20"
        >
          <RadialBarChart
            data={chartData}
            endAngle={180}
            innerRadius={30}
            outerRadius={45}
            startAngle={0}
          >
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 4}
                          className="fill-foreground text-lg font-bold"
                        >
                          {total}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
            <RadialBar
              dataKey="won"
              stackId="a"
              cornerRadius={4}
              fill="var(--color-success)"
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="loss"
              stackId="a"
              cornerRadius={4}
              fill="var(--color-danger)"
              className="stroke-transparent stroke-2"
            />
          </RadialBarChart>
        </ChartContainer>
      </div>
    </Card>
  )
}

export default WinRateCard

{
  /* <ChartContainer
config={chartConfig}
className="mx-auto aspect-square w-full max-w-[250px]"
>
<RadialBarChart
  data={chartData}
  endAngle={180}
  innerRadius={80}
  outerRadius={130}
>
  <ChartTooltip
    cursor={false}
    content={<ChartTooltipContent hideLabel />}
  />
  <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
  </PolarRadiusAxis>
  <RadialBar
    dataKey="desktop"
    stackId="a"
    cornerRadius={5}
    fill="var(--color-desktop)"
    className="stroke-transparent stroke-2"
  />
  <RadialBar
    dataKey="mobile"
    fill="var(--color-mobile)"
    stackId="a"
    cornerRadius={5}
    className="stroke-transparent stroke-2"
  />
</RadialBarChart>
</ChartContainer> */
}
