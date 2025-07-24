import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Filter,
  Eye,
  EyeOff
} from "lucide-react"

const TradeHistoryCard = ({
  tradesData = [],
  accountSize = 0,
  accountBalance = 0
}) => {
  const [visibleColumns, setVisibleColumns] = useState({
    asset: true,
    side: true,
    dateStart: true,
    dateEnd: true,
    sl: false,
    tp: false,
    rr: true,
    risk: true, // Risk % column visible by default
    realized: true,
    duration: false
  })
  const [showFilter, setShowFilter] = useState(false)
  // Preset filter button handler
  const applyPresetFilter = () => {
    setVisibleColumns({
      asset: true,
      side: true,
      dateStart: true,
      dateEnd: true,
      sl: false,
      tp: false,
      rr: true,
      risk: true,
      realized: true,
      duration: true // Show Hold Time in the simple preset
    })
  }

  const formatCurrency = (amount) => {
    if (!amount) return "$0.00"
    const cleanAmount = amount.toString().replace(/[$,]/g, "")
    const numAmount = parseFloat(cleanAmount)
    if (isNaN(numAmount)) return amount

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numAmount)
  }

  // Format numbers to 2 decimal places
  const formatNumber = (number) => {
    if (number === null || number === undefined || number === "") return "-"
    const num = parseFloat(number)
    if (isNaN(num)) return number
    return num.toFixed(2)
  }

  const getPnLColor = (realized) => {
    if (!realized) return "text-muted-foreground"
    const amount = parseFloat(realized.replace(/[$,]/g, ""))
    return amount > 0 ? "text-success" : "text-danger"
  }

  const getSideBadge = (side) => {
    if (!side) return "secondary"
    return side.toLowerCase() === "buy" ? "buy" : "sell"
  }

  const getPnLBadge = (realized) => {
    if (!realized) return "secondary"
    const amount = parseFloat(realized.replace(/[$,]/g, ""))
    return amount > 0 ? "default" : "destructive"
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ""
    try {
      const date = new Date(dateStr)
      // Format: DD/MM/YY - HH:mm am/pm (12h, 2-digit year)
      return date
        .toLocaleString("en-GB", {
          year: "2-digit",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        })
        .replace(",", "")
    } catch {
      return dateStr
    }
  }

  // Format combined date range as 'YY/MM/DD HH:mm → HH:mm' or 'YY/MM/DD HH:mm → YY/MM/DD HH:mm'
  const formatDateRange = (dateStart, dateEnd) => {
    if (!dateStart || !dateEnd) return "-"
    try {
      const start = new Date(dateStart)
      const end = new Date(dateEnd)
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return "-"
      const pad = (n) => n.toString().padStart(2, "0")
      const startDate = `${pad(start.getFullYear() % 100)}/${pad(
        start.getMonth() + 1
      )}/${pad(start.getDate())}`
      const startTime = `${pad(start.getHours())}:${pad(start.getMinutes())}`
      const endDate = `${pad(end.getFullYear() % 100)}/${pad(
        end.getMonth() + 1
      )}/${pad(end.getDate())}`
      const endTime = `${pad(end.getHours())}:${pad(end.getMinutes())}`
      if (startDate === endDate) {
        return `${startDate} ${startTime} → ${endTime}`
      } else {
        return `${startDate} ${startTime} → ${endDate} ${endTime}`
      }
    } catch {
      return "-"
    }
  }

  // Calculate percentage for TP and SL
  const calculatePercentage = (entry, target, side = "buy") => {
    if (!entry || !target) return null

    const entryNum = parseFloat(entry)
    const targetNum = parseFloat(target)

    if (isNaN(entryNum) || isNaN(targetNum)) return null

    // For sell trades, the calculation is inverted
    const percentage =
      side?.toLowerCase() === "sell"
        ? ((entryNum - targetNum) / entryNum) * 100
        : ((targetNum - entryNum) / entryNum) * 100

    return percentage.toFixed(2)
  }

  // Helper to clean and parse numbers from strings
  const cleanNumber = (val) => {
    if (typeof val === "number") return val
    if (!val) return 0
    return parseFloat(val.toString().replace(/[^\d.-]/g, ""))
  }

  const CONTRACT_SIZE = 100000 // Standard forex contract size

  // Calculate risk percentage based on entry, sl, lot size, and current account balance
  const calculateRiskPercentage = (trade) => {
    if (!trade.size || !trade.entry || !trade.initialSL || !accountBalance)
      return null

    const sizeNum = cleanNumber(trade.size)
    const entryNum = cleanNumber(trade.entry)
    const slNum = cleanNumber(trade.initialSL)
    if (isNaN(sizeNum) || isNaN(entryNum) || isNaN(slNum)) return null

    // Risk per trade = (Entry − Stop Loss) × Lot Size
    let riskPerTrade = 0
    if (trade.side?.toLowerCase() === "sell") {
      riskPerTrade = (slNum - entryNum) * sizeNum
    } else {
      riskPerTrade = (entryNum - slNum) * sizeNum
    }
    if (riskPerTrade < 0) riskPerTrade = Math.abs(riskPerTrade)
    // Risk % = (Risk per trade ÷ Current Balance) × 100
    const riskPercentage = (riskPerTrade / accountBalance) * 100
    return {
      percent: riskPercentage.toFixed(2),
      amount: riskPerTrade
    }
  }

  // Get risk level color based on percentage
  const getRiskLevelColor = (riskPercentage) => {
    const risk = parseFloat(riskPercentage)
    if (isNaN(risk)) return "text-muted-foreground"
    if (risk <= 1) return "text-success" // Low risk
    if (risk <= 2) return "text-warning" // Medium risk
    if (risk <= 5) return "text-warning" // High risk
    return "text-danger" // Very high risk
  }

  // Calculate hold time from trade start and end dates
  const calculateHoldTime = (trade) => {
    if (!trade.dateStart || !trade.dateEnd) return null

    try {
      const startDate = new Date(trade.dateStart)
      const endDate = new Date(trade.dateEnd)

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null

      const timeDiff = endDate.getTime() - startDate.getTime()

      if (timeDiff <= 0) return null

      // Convert to different time units
      const minutes = Math.floor(timeDiff / (1000 * 60))
      const hours = Math.floor(timeDiff / (1000 * 60 * 60))
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))

      // Format the time appropriately
      if (days > 0) {
        return `${days}d ${hours % 24}h`
      } else if (hours > 0) {
        return `${hours}h ${minutes % 60}m`
      } else if (minutes > 0) {
        return `${minutes}m`
      } else {
        return `${Math.floor(timeDiff / 1000)}s`
      }
    } catch (error) {
      console.error("Error calculating hold time:", error)
      return null
    }
  }

  // Calculate average hold time across all trades
  // const calculateAverageHoldTime = () => {
  //   if (!tradesData || tradesData.length === 0) return null

  //   const validHoldTimes = tradesData
  //     .map((trade) => {
  //       if (!trade.dateStart || !trade.dateEnd) return null

  //       try {
  //         const startDate = new Date(trade.dateStart)
  //         const endDate = new Date(trade.dateEnd)

  //         if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()))
  //           return null

  //         return endDate.getTime() - startDate.getTime()
  //       } catch {
  //         return null
  //       }
  //     })
  //     .filter((time) => time !== null && time > 0)

  //   if (validHoldTimes.length === 0) return null

  //   const averageTimeMs =
  //     validHoldTimes.reduce((sum, time) => sum + time, 0) /
  //     validHoldTimes.length

  //   // Format average time
  //   const minutes = Math.floor(averageTimeMs / (1000 * 60))
  //   const hours = Math.floor(averageTimeMs / (1000 * 60 * 60))
  //   const days = Math.floor(averageTimeMs / (1000 * 60 * 60 * 24))

  //   if (days > 0) {
  //     return `${days}d ${hours % 24}h`
  //   } else if (hours > 0) {
  //     return `${hours}h ${minutes % 60}m`
  //   } else if (minutes > 0) {
  //     return `${minutes}m`
  //   } else {
  //     return `${Math.floor(averageTimeMs / 1000)}s`
  //   }
  // }

  // Memoize the average hold time calculation
  // const averageHoldTime = React.useMemo(
  //   () => calculateAverageHoldTime(),
  //   [tradesData]
  // )

  const toggleColumn = (column) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column]
    }))
  }

  const toggleAllColumns = () => {
    const allVisible = Object.values(visibleColumns).every((v) => v)
    setVisibleColumns({
      asset: !allVisible,
      side: !allVisible,
      dateStart: !allVisible,
      dateEnd: !allVisible,
      sl: !allVisible,
      tp: !allVisible,
      rr: !allVisible,
      risk: !allVisible,
      realized: !allVisible,
      duration: !allVisible
    })
  }

  const columnDefinitions = [
    { key: "asset", label: "Asset" },
    { key: "side", label: "Side" },
    { key: "dateStart", label: "Date Start" },
    { key: "dateEnd", label: "Date End" },
    { key: "sl", label: "SL" },
    { key: "tp", label: "TP" },
    { key: "rr", label: "RR" },
    { key: "risk", label: "Risk %" },
    { key: "realized", label: "Realized" },
    { key: "duration", label: "Hold Time" }
  ]

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5
  const totalPages = Math.ceil(tradesData.length / pageSize)
  const paginatedTrades = tradesData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Table className="h-5 w-5" />
            Trade History ({tradesData.length} trades)
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-2"
            >
              {showFilter ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              {showFilter ? "Hide" : "Show"} Filters
            </Button>
            <Button
              variant={
                Object.values(visibleColumns).every((v) => v)
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() => {
                const isAdvanced = Object.values(visibleColumns).every((v) => v)
                if (isAdvanced) {
                  // Switch to simple preset: all but sl, tp, duration
                  setVisibleColumns({
                    asset: true,
                    side: true,
                    dateStart: true,
                    dateEnd: true,
                    sl: false,
                    tp: false,
                    rr: true,
                    risk: true,
                    realized: true,
                    duration: false
                  })
                } else {
                  // Show all columns (advanced)
                  setVisibleColumns({
                    asset: true,
                    side: true,
                    dateStart: true,
                    dateEnd: true,
                    sl: true,
                    tp: true,
                    rr: true,
                    risk: true,
                    realized: true,
                    duration: true
                  })
                }
              }}
              className="flex items-center gap-2"
            >
              Advanced
            </Button>
          </div>
        </div>

        {/* Column Filter */}
        {showFilter && (
          <div className="mt-4 p-4 bg-background dark:bg-gray-800 rounded-lg border border-border">
            <div className="flex items-center gap-4 mb-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                Visible Columns:
              </h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
              {columnDefinitions.map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={visibleColumns[key]}
                    disabled={Object.values(visibleColumns).every((v) => v)}
                    onCheckedChange={() => {
                      if (!Object.values(visibleColumns).every((v) => v)) {
                        toggleColumn(key)
                      }
                    }}
                  />
                  <label
                    htmlFor={key}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {tradesData.length > 0 ? (
          <div
            className="overflow-x-auto"
            style={{ minHeight: `${pageSize * 48 + 56}px` }} // 48px per row, 56px for header
          >
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  {visibleColumns.asset && (
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                      Asset
                    </th>
                  )}
                  {visibleColumns.side && (
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                      Side
                    </th>
                  )}
                  {visibleColumns.dateStart && (
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                      Date Start
                    </th>
                  )}
                  {visibleColumns.dateEnd && (
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                      Date End
                    </th>
                  )}
                  {visibleColumns.sl && (
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                      SL
                    </th>
                  )}
                  {visibleColumns.tp && (
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                      TP
                    </th>
                  )}
                  {visibleColumns.rr && (
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                      RR
                    </th>
                  )}
                  {visibleColumns.risk && (
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                      Risk %
                    </th>
                  )}
                  {visibleColumns.realized && (
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                      Realized
                    </th>
                  )}
                  {visibleColumns.duration && (
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                      Hold Time
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedTrades.map((trade, index) => (
                  <tr
                    key={index + (currentPage - 1) * pageSize}
                    className="hover:bg-card/50  hover:text-muted-foreground"
                  >
                    {visibleColumns.asset && (
                      <td className="p-3 text-sm text-foreground  font-medium">
                        {trade.asset}
                      </td>
                    )}
                    {visibleColumns.side && (
                      <td className="p-3">
                        <Badge
                          variant={getSideBadge(trade.side)}
                          className="text-xs"
                        >
                          {trade.side?.charAt(0).toUpperCase() +
                            trade.side?.slice(1).toLowerCase()}
                        </Badge>
                      </td>
                    )}
                    {visibleColumns.dateStart && (
                      <td className="p-3 text-sm">
                        {formatDate(trade.dateStart)}
                      </td>
                    )}
                    {visibleColumns.dateEnd && (
                      <td className="p-3 text-sm">
                        {formatDate(trade.dateEnd)}
                      </td>
                    )}
                    {visibleColumns.sl && (
                      <td className="p-3 text-sm">
                        <div>
                          {trade.initialSL && trade.entry ? (
                            <span className="text-danger">
                              {calculatePercentage(
                                trade.entry,
                                trade.initialSL,
                                trade.side
                              )}
                              %
                            </span>
                          ) : (
                            "-"
                          )}
                        </div>
                      </td>
                    )}
                    {visibleColumns.tp && (
                      <td className="p-3 text-sm">
                        <div>
                          {trade.maxTP && trade.entry ? (
                            <span className="text-success">
                              {calculatePercentage(
                                trade.entry,
                                trade.maxTP,
                                trade.side
                              )}
                              %
                            </span>
                          ) : (
                            "-"
                          )}
                        </div>
                      </td>
                    )}
                    {visibleColumns.rr && (
                      <td className="p-3 text-sm text-foreground ">
                        {(() => {
                          if (trade.maxRR === "Loss") return <span>-1</span>
                          const rrNum = parseFloat(trade.maxRR)
                          if (!isNaN(rrNum) && rrNum >= -0.1 && rrNum <= 0.1)
                            return <span>0</span>
                          return trade.maxRR
                        })()}
                      </td>
                    )}
                    {visibleColumns.risk && (
                      <td className="p-3 text-sm">
                        {(() => {
                          const risk = calculateRiskPercentage(trade)
                          if (!risk) return "-"
                          return (
                            <div>
                              <span className="font-medium">
                                {risk.percent}%
                              </span>
                              <div className="text-xs text-muted-foreground">
                                (${formatNumber(risk.amount)})
                              </div>
                            </div>
                          )
                        })()}
                      </td>
                    )}
                    {visibleColumns.realized && (
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-medium ${getPnLColor(
                              trade.realized
                            )}`}
                          >
                            {formatCurrency(trade.realized)}
                          </span>
                        </div>
                      </td>
                    )}
                    {visibleColumns.duration && (
                      <td className="p-3 text-sm">
                        <div>
                          <div className="text-foreground ">
                            {calculateHoldTime(trade) || trade.duration || "-"}
                          </div>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-2 mt-4">
              {currentPage > 1 ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              {currentPage < totalPages ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
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
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground dark:text-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No trade data available</p>
            <p className="text-sm">
              Extract trades from FxReplay to see trade details
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default TradeHistoryCard
