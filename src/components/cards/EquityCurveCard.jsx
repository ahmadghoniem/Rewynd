"use client"

import { TrendingUp } from "lucide-react"
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Area,
  AreaChart
} from "recharts"
import React, { useState } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { parseTradeDate } from "@/lib/utils"

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
        const dayKey = dateObj.toISOString().split("T")[0]
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
    // Add a starting point with initial capital
    if (chartPoints.length > 0) {
      const firstDate = new Date(chartPoints[0].dateTime)
      firstDate.setDate(firstDate.getDate() - 1)
      chartPoints.unshift({
        date: firstDate.toISOString().split("T")[0],
        dateTime: firstDate,
        cumulativePnL: initialCapital,
        tradePnL: 0,
        tradeNumber: 0
      })
    }
    return chartPoints
  }

  // Use actual trades if provided, else fallback to sample data
  const chartData =
    tradesData && tradesData.length > 0 ? processTradeData(tradesData) : []

  // Chart config for actual data
  const chartConfig = tradesData &&
    tradesData.length > 0 && {
      cumulativePnL: {
        label: "Total Equity",
        color: "hsl(var(--chart-1))"
      }
    }

  const maxPnL = Math.max(...chartData.map((d) => d.cumulativePnL))
  const hwmIndex = chartData.findIndex((d) => d.cumulativePnL === maxPnL)
  // Custom dot renderer to help highlight HWM
  const renderDot = ({ cx, cy, index }) => {
    if (index === hwmIndex) {
      return (
        <>
          <circle
            cx={cx}
            cy={cy}
            r={4}
            fill="var(--marker-hwm)"
            stroke="var(--marker-hwm)"
          />
        </>
      )
    }
    return <circle cx={cx} cy={cy} r={4} fill="var(--primary)" />
  }

  const CustomActiveDot = ({ cx, cy, index }) => {
    const isHwm = index === hwmIndex
    return (
      <>
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill={isHwm ? "var(--marker-hwm)" : "var(--primary)"}
          stroke={isHwm ? "var(--marker-hwm)" : "var(--primary)"}
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
        {chartData.length > 0 ? (
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
                tickFormatter={(value) => `$${value}`}
                domain={[0, "auto"]}
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
                  const [year, month, day] = value.split("-")
                  return `${month}/${day}`
                }}
              />
              <ChartTooltip
                cursor={false}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-muted rounded-lg p-3 shadow-lg space-y-1 min-w-[180px]">
                        {/* Header row: Label + badge */}
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{label}</p>
                          <span className="text-xs font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                            #{data.tradeNumber}
                          </span>
                        </div>
                        {/* Total Equity */}
                        <p
                          className={`text-sm font-bold ${
                            data.cumulativePnL >= 0
                              ? "text-success"
                              : "text-danger"
                          }`}
                        >
                          Total Equity: ${data.cumulativePnL}
                        </p>
                        {/* Trade PnL */}
                        <p
                          className={`text-sm font-medium ${
                            data.tradePnL >= 0 ? "text-success" : "text-danger"
                          }`}
                        >
                          Trade PnL: ${data.tradePnL}
                        </p>
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
                dot={renderDot}
                activeDot={CustomActiveDot}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="text-center text-muted-foreground py-12">
            No data to display.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
