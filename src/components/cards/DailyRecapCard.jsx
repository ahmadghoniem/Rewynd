import React, { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, getPnLColor } from "@/lib/utils"

// Function to get color for profitable days (percentageChange > +0.5%)
const getProfitableDayColor = (percentageChange) => {
  if (percentageChange > 0.5) {
    return "text-yellow-600 dark:text-yellow-400"
  }
  return getPnLColor(percentageChange > 0 ? 1 : -1) // Use default PnL colors for other cases
}

import { Clock, Calendar } from "lucide-react"
import { cn, parseTradeDate } from "@/lib/utils"
import useAppStore from "@/store/useAppStore"

const DailyRecap = ({ extractedTrades = [], className }) => {
  const [dailyData, setDailyData] = useState([])
  const sessionData = useAppStore((state) => state.sessionData)

  const scrollRef = useRef(null)

  const calculateDailyAnalysis = useCallback(
    (trades) => {
      const dailyGroups = {}
      const startingBalance = parseFloat(
        typeof sessionData?.balance === "string"
          ? sessionData.balance.replace(/[$,]/g, "")
          : sessionData?.balance || "0"
      )

      trades.forEach((trade) => {
        const date = parseTradeDate(trade.dateStart)
        const dateKey = date.toISOString().split("T")[0]
        if (!dailyGroups[dateKey]) {
          dailyGroups[dateKey] = {
            date: date,
            dateKey: dateKey,
            trades: [],
            totalPnL: 0,
            startingBalance: startingBalance
          }
        }
        const pnl = parseFloat(trade.realized?.replace(/[$,]/g, "") || "0")
        dailyGroups[dateKey].trades.push(trade)
        dailyGroups[dateKey].totalPnL += pnl
      })

      // Calculate cumulative balance and percentage for each day
      const dailyArray = Object.values(dailyGroups).sort(
        (a, b) => b.date - a.date
      )

      // Calculate running balance and percentage for each day
      let runningBalance = startingBalance
      dailyArray.forEach((day) => {
        day.percentageChange =
          runningBalance > 0 ? (day.totalPnL / runningBalance) * 100 : 0
        runningBalance += day.totalPnL
      })

      setDailyData(dailyArray)
    },
    [sessionData]
  )

  useEffect(() => {
    if (extractedTrades && extractedTrades.length > 0) {
      calculateDailyAnalysis(extractedTrades)
    }
  }, [extractedTrades, calculateDailyAnalysis])

  // Drag-to-scroll logic
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  const handlePointerDown = (e) => {
    isDragging.current = true
    startX.current = e.pageY || e.touches?.[0]?.pageY
    scrollLeft.current = scrollRef.current.scrollTop
    scrollRef.current.style.cursor = "grabbing"
  }
  const handlePointerMove = (e) => {
    if (!isDragging.current) return
    const y = e.pageY || e.touches?.[0]?.pageY
    const walk = (y - startX.current) * -1
    scrollRef.current.scrollTop = scrollLeft.current + walk
  }
  const handlePointerUp = () => {
    isDragging.current = false
    scrollRef.current.style.cursor = ""
  }

  // Use a ref callback to always get the latest scrollRef
  const setScrollRef = useCallback((node) => {
    scrollRef.current = node
  }, [])

  return (
    <Card className={cn("w-full col-span-2", className)}>
      <CardHeader className="pb-1">
        <CardTitle className="text-lg font-medium text-foreground">
          Daily Recap
        </CardTitle>
      </CardHeader>
      <CardContent>
        {dailyData.length > 0 ? (
          <div
            ref={setScrollRef}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              overflowX: "hidden",
              overflowY: "auto",
              width: "100%",
              maxHeight: "300px",
              scrollSnapType: "y mandatory",
              WebkitOverflowScrolling: "touch"
            }}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
            className="hide-scrollbar select-none"
          >
            {dailyData.map((day) => (
              <div
                key={day.dateKey}
                className="group bg-muted/30 relative border border-border/40 rounded-lg p-3 hover:border-border/60 transition-all duration-200 "
                style={{
                  scrollSnapAlign: "start"
                }}
              >
                {/* Date and PnL Row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
                    <span className="text-sm font-medium text-foreground/90">
                      {day.date.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric"
                      })}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <div
                      className={`text-base font-semibold tabular-nums ${
                        day.percentageChange !== undefined &&
                        day.percentageChange > 0.5
                          ? getProfitableDayColor(day.percentageChange)
                          : getPnLColor(day.totalPnL)
                      }`}
                    >
                      {formatCurrency(day.totalPnL)}
                    </div>
                    {day.percentageChange !== undefined && (
                      <div
                        className={`text-xs font-medium tabular-nums ${
                          day.percentageChange > 0.5
                            ? getProfitableDayColor(day.percentageChange)
                            : getPnLColor(day.totalPnL)
                        }`}
                      >
                        ({day.percentageChange >= 0 ? "+" : ""}
                        {day.percentageChange.toFixed(2)}%)
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats Row */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <span className="text-foreground/70 font-medium tabular-nums">
                        {day.trades.length}
                      </span>
                      <span className="text-muted-foreground/80">trades</span>
                    </span>

                    <span className="flex items-center gap-1">
                      <span className="text-foreground/70 font-medium tabular-nums">
                        {(() => {
                          const wins = day.trades.filter((t) => {
                            const realized = parseFloat(
                              t.realized?.replace(/[$,]/g, "") || "0"
                            )
                            return realized > 0
                          }).length
                          return day.trades.length > 0
                            ? ((wins / day.trades.length) * 100).toFixed(0)
                            : "-"
                        })()}
                        %
                      </span>
                      <span className="text-muted-foreground/80">win rate</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-foreground/70 font-medium tabular-nums">
                      {(() => {
                        const validRRs = day.trades
                          .map((t) => parseFloat(t.maxRR))
                          .filter((rr) => !isNaN(rr))
                        return validRRs.length > 0
                          ? (
                              validRRs.reduce((a, b) => a + b, 0) /
                              validRRs.length
                            ).toFixed(2)
                          : "-"
                      })()}
                    </span>
                    <span className="text-muted-foreground/80">avg RR</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium mb-1">
              No trading data available
            </p>
            <p className="text-xs text-muted-foreground/80">
              Extract trades from FxReplay to see daily summaries
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default DailyRecap
