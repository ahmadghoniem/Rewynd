import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency, getPnLColor } from "@/lib/utils"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { cn, parseTradeDate, getLocalDateKey } from "@/lib/utils"
import useAppStore from "@/store/useAppStore"
import DailyRecapPlaceholder from "./DailyRecapPlaceholder"
import { Separator } from "@/components/ui/separator"

// Helper function to calculate daily metrics
const calculateDailyMetrics = (day) => {
  // Calculate win rate
  const wins = day.trades.filter((t) => {
    const realized = parseFloat(t.realized?.replace(/[$,]/g, "") || "0")
    return realized > 0
  }).length

  const winRate =
    day.trades.length > 0 ? ((wins / day.trades.length) * 100).toFixed(0) : "0"

  // Calculate average R/R
  const validRRs = day.trades
    .map((t) => parseFloat(t.maxRR))
    .filter((rr) => !isNaN(rr))

  const avgRR =
    validRRs.length > 0
      ? (validRRs.reduce((a, b) => a + b, 0) / validRRs.length).toFixed(2)
      : "0.00"

  // Calculate return percentage
  const returnPercent =
    day.percentageChange !== undefined
      ? day.percentageChange.toFixed(2)
      : "0.00"

  return {
    wins,
    winRate,
    avgRR,
    returnPercent
  }
}

const DailyRecap = ({ extractedTrades = [], className }) => {
  const [dailyData, setDailyData] = useState([])
  const sessionData = useAppStore((state) => state.sessionData)
  const [currentPage, setCurrentPage] = useState(1)

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
        const dateKey = getLocalDateKey(date)
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
    } else {
      // Clear daily data when extractedTrades is empty (e.g., when switching sessions)
      setDailyData([])
    }
  }, [extractedTrades, calculateDailyAnalysis])

  // Reset to page 1 when data changes
  useEffect(() => {
    setCurrentPage(1)
  }, [dailyData.length])

  // Calculate pagination
  const DAYS_PER_PAGE = 3
  const totalPages = Math.ceil(dailyData.length / DAYS_PER_PAGE)
  const startIndex = (currentPage - 1) * DAYS_PER_PAGE
  const currentDays = dailyData.slice(startIndex, startIndex + DAYS_PER_PAGE)

  // Pagination handlers
  const goToPrevious = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }, [])

  const goToNext = useCallback(() => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
  }, [totalPages])

  return (
    <Card className={cn("w-full col-span-2", className)}>
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-foreground">
            Daily Recap
          </CardTitle>
          {/* Only show pagination if there are more than 3 days */}
          {dailyData.length > 3 && (
            <div className="flex items-center ">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrevious}
                disabled={currentPage === 1}
                className="h-7 px-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground min-w-[60px] text-center">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNext}
                disabled={currentPage === totalPages}
                className="h-7 px-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {dailyData.length > 0 ? (
          <div className="space-y-2">
            {currentDays.map((day) => {
              const { winRate, avgRR, returnPercent } =
                calculateDailyMetrics(day)

              return (
                <div
                  key={day.dateKey}
                  className="group bg-muted/30 relative border border-border rounded-lg p-2 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2.5">
                        <Calendar className="h-4 w-4 text-muted-foreground/60" />
                        <span className="text-sm font-medium text-foreground/90">
                          {day.date.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric"
                          })}
                        </span>
                      </div>
                      <div
                        className={`text-lg font-semibold ${getPnLColor(day.totalPnL)}`}
                      >
                        {formatCurrency(day.totalPnL)}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-muted-foreground/70">
                        Return
                      </span>
                      <div
                        className={`text-base font-bold ${
                          day.percentageChange !== undefined &&
                          day.percentageChange > 0.5
                            ? "text-profitable"
                            : getPnLColor(day.totalPnL > 0 ? 1 : -1)
                        }`}
                      >
                        {day.percentageChange >= 0 ? "+" : ""}
                        {returnPercent}%
                      </div>
                    </div>
                  </div>
                  {/* Separator */}
                  <Separator orientation="horizontal" className="mb-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5">
                        <span className="text-foreground text-sm font-medium">
                          {day.trades.length}
                        </span>
                        <span className="text-muted-foreground/80">
                          {day.trades.length === 1 ? "trade" : "trades"}
                        </span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="text-foreground text-sm font-medium">
                          {winRate}%
                        </span>
                        <span className="text-muted-foreground/80">W/R</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-foreground text-sm font-medium">
                        {avgRR}
                      </span>
                      <span className="text-muted-foreground/80">R/R</span>
                    </div>
                  </div>
                </div>
              )
            })}
            {/* Placeholder cards to always show 3 cards */}
            <DailyRecapPlaceholder
              count={DAYS_PER_PAGE - currentDays.length}
              keyPrefix="placeholder"
              includeWrapper={false}
            />
          </div>
        ) : (
          <DailyRecapPlaceholder
            count={DAYS_PER_PAGE}
            keyPrefix="placeholder-empty"
          />
        )}
      </CardContent>
    </Card>
  )
}

export default DailyRecap
