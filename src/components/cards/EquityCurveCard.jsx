import { CartesianGrid, XAxis, YAxis, Area, AreaChart } from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import {
  parseTradeDate,
  formatCurrency,
  simpleFormatCurrency,
  getLocalDateKey
} from "@/lib/utils"

export const description = "A line chart with dots"

export default function EquityCurveCard({
  tradesData = [],
  initialCapital = 0
}) {
  // Helper to process trades into cumulative PnL chart data
  function processTradeData(trades) {
    if (!trades || trades.length === 0) return []
    // Parse and sort trades by date
    const parsedTrades = trades
      .map((trade) => {
        const dateStr = trade.dateEnd || trade.date || ""
        const dateObj = parseTradeDate(dateStr)
        const dayKey = getLocalDateKey(dateObj)
        let realized = 0
        if (typeof trade.realized === "string") {
          const realizedStr = trade.realized.replace("$", "").replace(/,/g, "")
          realized = Number.parseFloat(realizedStr)
        } else if (typeof trade.realized === "number") {
          realized = trade.realized
        }
        return {
          date: dayKey,
          dateTime: dateObj,
          cumulativePnL: 0,
          tradePnL: realized,
          tradeNumber: 0
        }
      })
      .sort((a, b) => a.dateTime - b.dateTime)

    // Add initial data point representing starting capital
    // We use the date of the first trade so it starts at the beginning of that day/sequence
    const initialPoint = {
      date: parsedTrades[0].date,
      dateTime: parsedTrades[0].dateTime,
      cumulativePnL: initialCapital,
      tradePnL: 0,
      tradeNumber: 0
    }

    // Calculate cumulative PnL and trade number (including initial capital)
    let cumulativePnL = initialCapital
    const chartPoints = parsedTrades.map((trade, index) => {
      cumulativePnL += trade.tradePnL
      return {
        ...trade,
        cumulativePnL: Math.round(cumulativePnL * 100) / 100,
        tradeNumber: index + 1
      }
    })
    return [initialPoint, ...chartPoints]
  }

  // Fixed placeholder data - generates a realistic upward trending equity curve
  function generatePlaceholderData() {
    const baseValue = initialCapital || 10000
    const today = new Date()

    // Fixed sample data that creates a nice upward trending curve
    const fixedTradePnLs = [45.5, -28.75, 67.25, 92.0, -15.3, 78.5, 134.25]

    const placeholderData = []
    let cumulativePnL = baseValue

    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - (6 - i))
      const dateKey = getLocalDateKey(date)

      const tradePnL = fixedTradePnLs[i]
      cumulativePnL += tradePnL

      placeholderData.push({
        date: dateKey,
        dateTime: date,
        cumulativePnL: Math.round(cumulativePnL * 100) / 100,
        tradePnL: Math.round(tradePnL * 100) / 100,
        tradeNumber: i + 1
      })
    }

    return placeholderData
  }

  // Use actual trades if provided, else fallback to placeholder data
  const chartData =
    tradesData && tradesData.length > 0
      ? processTradeData(tradesData)
      : generatePlaceholderData()
  const hasActualData = tradesData && tradesData.length > 0

  // Chart config for actual data
  const chartConfig = tradesData &&
    tradesData.length > 0 && {
      cumulativePnL: {
        label: "Total Equity",
        color: "hsl(var(--chart-1))"
      }
    }

  const maxPnL = Math.max(...chartData.map((d) => d.cumulativePnL))
  const minPnL = Math.min(...chartData.map((d) => d.cumulativePnL))

  // Calculate smart y-axis domain for better visibility
  const calculateYAxisDomain = () => {
    if (chartData.length === 0) return [0, "auto"]

    const range = maxPnL - minPnL
    const center = (maxPnL + minPnL) / 2

    // If the range is very small (less than 5% of the center value), zoom in
    if (range < Math.abs(center) * 0.05) {
      // Add padding of 20% of the range, minimum $50 padding
      const padding = Math.max(range * 0.2, 50)
      return [minPnL - padding, maxPnL + padding]
    }

    // For normal ranges, add 10% padding
    const padding = range * 0.1
    return [minPnL - padding, maxPnL + padding]
  }

  const yAxisDomain = calculateYAxisDomain()

  const CustomActiveDot = ({ cx, cy }) => {
    return (
      <>
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill={"var(--primary)"}
          stroke={"var(--primary)"}
          strokeWidth={2}
        />
      </>
    )
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Equity Curve</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {!hasActualData && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="bg-background/80 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Preview - Sync Rewynd with FxReplay to see your equity curve.
                </p>
              </div>
            </div>
          )}
          <div
            className={!hasActualData ? "opacity-40 pointer-events-none" : ""}
          >
            <ChartContainer config={chartConfig}>
              <AreaChart
                accessibilityLayer
                data={chartData}
                margin={{ left: 12, right: 12 }}
              >
                <CartesianGrid vertical={false} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={simpleFormatCurrency}
                  domain={yAxisDomain}
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  interval={0}
                  ticks={Array.from(new Set(chartData.map((d) => d.date)))}
                  tickFormatter={(value) => {
                    if (!value) return ""
                    const [, month, day] = value.split("-")
                    return `${parseInt(month)}/${parseInt(day)}`
                  }}
                />
                <ChartTooltip
                  cursor={false}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload

                      // const isHwm = data.cumulativePnL === maxPnL
                      return (
                        <div className="bg-muted rounded-lg p-3 shadow-lg space-y-1 min-w-48">
                          {/* Header row: Label + badges */}
                          <div className="flex items-center justify-between border-b border-neutral-700/50 pb-1">
                            <p className="text-sm font-medium">
                              {new Date(label).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric"
                              })}
                            </p>
                            <div className="flex">
                              {/* {isHwm && (
                                <span className="text-xs font-semibold bg-marker-hwm text-primary-foreground px-2 py-0.5 rounded-full">
                                  HWM
                                </span>
                              )} */}
                              <span className="text-xs font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                                #{data.tradeNumber}
                              </span>
                            </div>
                          </div>
                          <div>
                            {/* Total Equity */}
                            <p
                              className={`text-sm font-bold  ${
                                data.cumulativePnL >= 0
                                  ? "text-success"
                                  : "text-danger"
                              }`}
                            >
                              {`Total Equity: ${formatCurrency(
                                data.cumulativePnL
                              )}`}
                            </p>
                            {/* Trade PnL */}
                            <p
                              className={`text-sm font-medium  ${
                                data.tradePnL >= 0
                                  ? "text-success"
                                  : "text-danger"
                              }`}
                            >
                              {`Realized PnL: ${
                                data.tradePnL > 0
                                  ? "+"
                                  : data.tradePnL < 0
                                    ? "-"
                                    : ""
                              }${formatCurrency(Math.abs(data.tradePnL))}`}
                            </p>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <defs>
                  <linearGradient
                    id="fillEquityCurve"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--primary)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--primary)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="cumulativePnL"
                  type="monotone"
                  fill="url(#fillEquityCurve)"
                  fillOpacity={0.4}
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={({ cx, cy }) => (
                    <circle cx={cx} cy={cy} r={4} fill="var(--primary)" />
                  )}
                  activeDot={CustomActiveDot}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
