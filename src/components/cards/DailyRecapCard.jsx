import React, { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, getPnLColor } from "@/lib/utils"

import { Clock, History } from "lucide-react"
import { cn, parseTradeDate } from "@/lib/utils"

const DailyRecap = ({ extractedTrades = [], className }) => {
  const [dailyData, setDailyData] = useState([])

  const scrollRef = useRef(null)

  useEffect(() => {
    if (extractedTrades && extractedTrades.length > 0) {
      calculateDailyAnalysis(extractedTrades)
    }
  }, [extractedTrades])

  const calculateDailyAnalysis = (trades) => {
    const dailyGroups = {}
    trades.forEach((trade) => {
      const date = parseTradeDate(trade.dateStart)
      const dateKey = date.toISOString().split("T")[0]
      if (!dailyGroups[dateKey]) {
        dailyGroups[dateKey] = {
          date: date,
          dateKey: dateKey,
          trades: [],
          totalPnL: 0
        }
      }
      const pnl = parseFloat(trade.realized?.replace(/[$,]/g, "") || "0")
      dailyGroups[dateKey].trades.push(trade)
      dailyGroups[dateKey].totalPnL += pnl
    })
    // Convert to sorted array (descending by date)
    const dailyArray = Object.values(dailyGroups).sort(
      (a, b) => b.date - a.date
    )
    setDailyData(dailyArray)
  }

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
                className="group bg-muted/30 relative border border-border/40 rounded-lg p-4 hover:border-border/60 transition-all duration-200 "
                style={{
                  scrollSnapAlign: "start"
                }}
              >
                {/* Date and PnL Row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <History className="h-3.5 w-3.5 text-muted-foreground/60" />
                    <span className="text-sm font-medium text-foreground/90">
                      {day.date.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric"
                      })}
                    </span>
                  </div>
                  <div
                    className={`text-lg font-semibold tabular-nums ${getPnLColor(
                      day.totalPnL
                    )}`}
                  >
                    {formatCurrency(day.totalPnL)}
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
