"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Area, AreaChart } from "recharts"
import React, { useState } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A line chart with dots"

export default function EquityCurve({ tradesData = [] }) {
  // Helper to get week number from a date
  function getWeekNumber(dateObj) {
    const d = new Date(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + yearStart.getUTCDay()+1)/7);
    return `${d.getUTCFullYear()}-W${weekNo}`;
  }

  // Helper to process trades into cumulative P&L chart data
  function processTradeData(trades) {
    if (!trades || trades.length === 0) return [];
    // Parse and sort trades by date
    const parsedTrades = trades
      .map((trade) => {
        const dateStr = trade.dateEnd || trade.date || '';
        let dateObj;
        if (dateStr) {
          const [datePart, timePart] = dateStr.split(", ");
          if (datePart && timePart) {
            const [month, day, year] = datePart.split("/");
            const fullYear = year && year.length === 2 ? `20${year}` : year;
            dateObj = new Date(`${month}/${day}/${fullYear} ${timePart}`);
          } else {
            dateObj = new Date(dateStr);
          }
        } else {
          dateObj = new Date();
        }
        const dayKey = dateObj.toISOString().split('T')[0];
        let realized = 0;
        if (typeof trade.realized === 'string') {
          const realizedStr = trade.realized.replace("$", "").replace(/,/g, "");
          realized = Number.parseFloat(realizedStr);
        } else if (typeof trade.realized === 'number') {
          realized = trade.realized;
        }
        return {
          date: dayKey,
          dateTime: dateObj,
          cumulativePnL: 0,
          tradePnL: realized,
          tradeNumber: 0,
          // week: getWeekNumber(dateObj),
        };
      })
      .sort((a, b) => a.dateTime - b.dateTime);
    // Calculate cumulative P&L and trade number
    let cumulativePnL = 0;
    const chartPoints = parsedTrades.map((trade, index) => {
      cumulativePnL += trade.tradePnL;
      return {
        ...trade,
        cumulativePnL: Math.round(cumulativePnL * 100) / 100,
        tradeNumber: index + 1,
      };
    });
    // Add a zero point at the start
    if (chartPoints.length > 0) {
      const firstDate = new Date(chartPoints[0].dateTime);
      firstDate.setDate(firstDate.getDate() - 1);
      chartPoints.unshift({
        date: firstDate.toISOString().split('T')[0],
        dateTime: firstDate,
        cumulativePnL: 0,
        tradePnL: 0,
        tradeNumber: 0,
      });
    }
    return chartPoints;
  }

  // Use actual trades if provided, else fallback to sample data
  const chartData = (tradesData && tradesData.length > 0)
    ? processTradeData(tradesData)
    : [];

  // Chart config for actual data
  const chartConfig = (tradesData && tradesData.length > 0)
    ? {
        cumulativePnL: {
          label: "Cumulative P&L",
          color: "hsl(var(--chart-1))",
        },
      }
    : {
        desktop: {
          label: "Desktop",
          color: "var(--chart-1)",
        },
        mobile: {
          label: "Mobile",
          color: "var(--chart-2)",
        },
      };

  // For actual data, calculate total P&L and trend
  const totalPnL = (tradesData && tradesData.length > 0)
    ? chartData[chartData.length - 1]?.cumulativePnL || 0
    : null;
  const isPositive = totalPnL !== null ? totalPnL >= 0 : true;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Equity Curve</CardTitle>
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
                domain={[0, 'auto']}
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={0}
                ticks={Array.from(new Set(chartData.map(d => d.date)))}
                tickFormatter={(value) => {
                  if (!value) return "";
                  const [year, month, day] = value.split("-");
                  return `${month}/${day}`;
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  ({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-muted  rounded-lg p-3 shadow-lg">
                          <p className="font-medium">{label}</p>
                          <p className="text-sm text-muted-foreground">#{data.tradeNumber}</p>
                          <p className={`font-medium ${data.tradePnL >= 0 ? "text-success" : "text-danger"}`}>
                            Trade P&L: ${data.tradePnL}
                          </p>
                          <p className={`font-bold ${data.cumulativePnL >= 0 ? "text-success" : "text-danger"}`}>
                            Cumulative: ${data.cumulativePnL}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }
                }
              />
              <defs>
                <linearGradient id="fillEquityCurve" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area
                dataKey="cumulativePnL"
                type="monotone"
                fill="url(#fillEquityCurve)"
                fillOpacity={0.4}
                stroke="var(--primary)"
                strokeWidth={2}
                dot={{ fill: "var(--primary)" }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="text-center text-muted-foreground py-12">No data to display.</div>
        )}
      </CardContent>
    </Card>
  );
}
