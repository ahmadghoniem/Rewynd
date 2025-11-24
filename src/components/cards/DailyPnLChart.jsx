import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell
} from "recharts"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Info } from "lucide-react"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from "@/components/ui/tooltip"
import {
  parseTradeDate,
  formatCurrency,
  cn,
  getLocalDateKey
} from "@/lib/utils"
import useAppStore from "@/store/useAppStore"

export default function DailyPnLChart({ className }) {
  const extractedTrades = useAppStore((state) => state.extractedTrades) || []

  // Process trades into daily PnL data
  function processDailyPnL(trades) {
    if (!trades || trades.length === 0) return []

    const dailyGroups = {}

    trades.forEach((trade) => {
      // Use dateEnd because that's when P&L is realized
      const dateStr = trade.dateEnd || trade.dateStart || trade.date || ""
      const dateObj = parseTradeDate(dateStr)
      const dayKey = getLocalDateKey(dateObj)

      let realized = 0
      if (typeof trade.realized === "string") {
        const realizedStr = trade.realized.replace("$", "").replace(/,/g, "")
        realized = Number.parseFloat(realizedStr) || 0
      } else if (typeof trade.realized === "number") {
        realized = trade.realized
      }

      if (!dailyGroups[dayKey]) {
        dailyGroups[dayKey] = {
          date: dayKey,
          dateObj: dateObj,
          pnl: 0,
          trades: 0
        }
      }

      dailyGroups[dayKey].pnl += realized
      dailyGroups[dayKey].trades += 1
    })

    // Convert to array and sort by date
    const dailyArray = Object.values(dailyGroups)
      .sort((a, b) => a.dateObj - b.dateObj)
      .map((day, index) => ({
        ...day,
        formattedDate: day.dateObj.toLocaleDateString("en-US", {
          month: "numeric",
          day: "numeric"
        }),
        index
      }))

    return dailyArray
  }

  const chartData = processDailyPnL(extractedTrades)

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">
            {data.dateObj.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric"
            })}
          </p>
          <p
            className={`text-sm font-semibold ${
              data.pnl >= 0 ? "text-success" : "text-danger"
            }`}
          >
            PnL: {formatCurrency(data.pnl)}
          </p>
          <p className="text-xs text-muted-foreground">
            {data.trades} trade{data.trades !== 1 ? "s" : ""}
          </p>
        </div>
      )
    }
    return null
  }

  // Chart configuration
  const chartConfig = {
    pnl: {
      label: "Daily PnL",
      color: "hsl(var(--chart-1))"
    }
  }

  if (chartData.length === 0) {
    return (
      <Card className={cn("gap-2 text-xs font-medium py-2", className)}>
        <CardHeader className="flex justify-between items-center px-2 pb-0">
          <span className="capitalize tracking-wide text-xs font-semibold">
            Daily PnL
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-pointer align-middle">
                <Info size={14} aria-label="Info about Daily PnL" />
              </span>
            </TooltipTrigger>
            <TooltipContent sideOffset={6}>
              Daily profit and loss breakdown showing trading performance over
              time.
            </TooltipContent>
          </Tooltip>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center text-muted-foreground py-8">
            <p>No trading data available</p>
            <p className="text-xs mt-2">
              Found {extractedTrades?.length || 0} trades
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("gap-2 text-xs font-medium py-2", className)}>
      <CardHeader className="flex justify-between items-center px-2 pb-0">
        <span className="capitalize tracking-wide text-xs font-semibold">
          Daily PnL
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-pointer align-middle">
              <Info size={14} aria-label="Info about Daily PnL" />
            </span>
          </TooltipTrigger>
          <TooltipContent sideOffset={6}>
            Daily profit and loss breakdown showing trading performance over
            time.
          </TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 5,
                left: 5,
                bottom: 5
              }}
            >
              <XAxis
                dataKey="formattedDate"
                axisLine={false}
                tickLine={false}
                tick={false}
                height={0}
              />
              <YAxis hide />
              <ChartTooltip content={<CustomTooltip />} />
              <Bar dataKey="pnl" radius={[1, 1, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.pnl >= 0 ? "#10b981" : "#ef4444"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
