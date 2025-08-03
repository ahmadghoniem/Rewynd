import React, { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, History } from "lucide-react"
import { cn, parseTradeDate } from "@/lib/utils"

const DailyRecap = ({ extractedTrades = [], className }) => {
  const [dailyData, setDailyData] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (extractedTrades && extractedTrades.length > 0) {
      calculateDailyAnalysis(extractedTrades)
      setCurrentPage(0) // Reset carousel on new data
    }
  }, [extractedTrades])

  useEffect(() => {
    if (scrollRef.current) {
      const scrollTo = currentPage * scrollRef.current.offsetWidth
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" })
    }
  }, [currentPage, dailyData.length])

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const getPnLColor = (pnl) => {
    if (pnl > 0) return "text-success"
    if (pnl < 0) return "text-danger"
    return "text-muted-foreground"
  }

  // Drag-to-scroll logic
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  const handlePointerDown = (e) => {
    isDragging.current = true
    startX.current = e.pageX || e.touches?.[0]?.pageX
    scrollLeft.current = scrollRef.current.scrollLeft
    scrollRef.current.style.cursor = "grabbing"
  }
  const handlePointerMove = (e) => {
    if (!isDragging.current) return
    const x = e.pageX || e.touches?.[0]?.pageX
    const walk = (x - startX.current) * -1
    scrollRef.current.scrollLeft = scrollLeft.current + walk
  }
  const handlePointerUp = () => {
    isDragging.current = false
    scrollRef.current.style.cursor = ""
  }

  const totalPages = Math.ceil(dailyData.length / 2)

  // Use a ref callback to always get the latest scrollRef
  const setScrollRef = useCallback((node) => {
    scrollRef.current = node
  }, [])

  // Debounced onScroll handler
  const scrollTimeout = useRef()
  const handleScroll = () => {
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
    scrollTimeout.current = setTimeout(() => {
      if (scrollRef.current) {
        const page = Math.round(
          scrollRef.current.scrollLeft / scrollRef.current.offsetWidth
        )
        if (page !== currentPage) setCurrentPage(page)
      }
    }, 50)
  }

  // Scroll to a page
  const scrollToPage = (page) => {
    setCurrentPage(page)
    if (scrollRef.current) {
      const scrollTo = page * scrollRef.current.offsetWidth
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" })
    }
  }

  return (
    <Card className={cn("w-full col-span-2", className)}>
      <CardHeader>
        <CardTitle>Daily Recap</CardTitle>
      </CardHeader>
      <CardContent className="col-span-2">
        <div className="grid grid-cols-6 gap-4 w-full">
          <div className="col-span-6">
            {dailyData.length > 0 ? (
              <>
                <div
                  ref={setScrollRef}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "16px",
                    overflowX: "auto",
                    overflowY: "hidden",
                    width: "100%",
                    minHeight: 120,
                    scrollSnapType: "x mandatory",
                    WebkitOverflowScrolling: "touch"
                  }}
                  onScroll={handleScroll}
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
                      className={
                        "flex flex-col justify-between flex-1 min-w-0 rounded-lg p-4 bg-muted text-muted-foreground shadow-sm transition-all duration-200"
                      }
                      style={{
                        minWidth: "calc(50% - 8px)",
                        maxWidth: "calc(50% - 8px)",
                        minHeight: 120,
                        scrollSnapAlign: "start"
                      }}
                    >
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                        <span className="mr-2">
                          <History className="h-4 w-4" />
                        </span>
                        <span className="font-semibold">
                          {day.date.toLocaleDateString("en-US")}
                        </span>
                      </div>
                      <div
                        className={`text-2xl font-extrabold ${getPnLColor(
                          day.totalPnL
                        )}`}
                      >
                        {formatCurrency(day.totalPnL)}
                      </div>
                      <div className="flex justify-between text-xs mt-2">
                        <span>
                          <span className="font-semibold">
                            {day.trades.length}
                          </span>{" "}
                          Trades
                        </span>
                        {/* Winrate */}
                        <span>
                          <span className="font-semibold">
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
                          </span>
                          %
                        </span>
                        {/* Avg RR */}
                        <span>
                          <span className="font-semibold">
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
                          </span>{" "}
                          RR
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Pagination controls (Trade History style) */}
                <div className="flex justify-center items-center gap-2 mt-4">
                  {currentPage > 0 ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    >
                      Prev
                    </Button>
                  ) : (
                    <span
                      style={{ width: 64, display: "inline-block" }}
                      aria-hidden="true"
                    ></span>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Button
                      key={i}
                      size="sm"
                      variant={currentPage === i ? "default" : "outline"}
                      onClick={() => scrollToPage(i)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  {currentPage < totalPages - 1 && totalPages > 0 ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
                      }
                    >
                      Next
                    </Button>
                  ) : (
                    <span
                      style={{ width: 64, display: "inline-block" }}
                      aria-hidden="true"
                    ></span>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No trading data available</p>
                <p className="text-sm">
                  Extract trades from FxReplay to see daily summaries
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default DailyRecap
