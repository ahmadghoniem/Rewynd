import React, { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, AlertTriangle, Eye, EyeOff, Download } from "lucide-react"
import { preprocessTradeData, formatNumber } from "@/lib/utils"
import TradeRow from "./TradeRow"
import Pagination from "@/components/ui/pagination"

const TradeHistoryCard = ({ tradesData = [], accountBalance = 0 }) => {
  // Consolidated state management
  const [tableState, setTableState] = useState({
    visibleColumns: {
      asset: true,
      side: true,
      dateStart: true,
      dateEnd: true,
      rr: true,
      risk: true, // Risk % column visible by default
      realized: true,
      duration: true
    },
    showFilter: false,
    currentPage: 1
  })

  const { visibleColumns, showFilter, currentPage } = tableState
  // Memoized column definitions
  const columnDefinitions = useMemo(
    () => [
      { key: "asset", label: "Asset" },
      { key: "side", label: "Side" },
      { key: "dateStart", label: "Date Start" },
      { key: "dateEnd", label: "Date End" },
      { key: "rr", label: "R/R" },
      { key: "risk", label: "Risk %" },
      { key: "realized", label: "Realized" },
      { key: "duration", label: "Hold Time" }
    ],
    []
  )

  // Pre-process trade data with memoization
  const processedTrades = useMemo(
    () => preprocessTradeData(tradesData, accountBalance),
    [tradesData, accountBalance]
  )

  // Toggle column visibility
  const toggleColumn = useCallback((column) => {
    setTableState((prev) => ({
      ...prev,
      visibleColumns: {
        ...prev.visibleColumns,
        [column]: !prev.visibleColumns[column]
      }
    }))
  }, [])

  // Toggle filter visibility
  const toggleFilter = useCallback(() => {
    setTableState((prev) => ({
      ...prev,
      showFilter: !prev.showFilter
    }))
  }, [])

  // Handle page change
  const handlePageChange = useCallback((page) => {
    setTableState((prev) => ({
      ...prev,
      currentPage: page
    }))
  }, [])

  // CSV download function - downloads all data, not just visible columns
  const downloadCSV = useCallback(() => {
    if (processedTrades.length === 0) return

    // Use all available columns for CSV export
    const allColumnKeys = columnDefinitions.map((col) => col.key)

    // Create CSV headers
    const headers = allColumnKeys.map((key) => {
      const col = columnDefinitions.find((c) => c.key === key)
      return col ? col.label : key
    })

    // Create CSV rows
    const csvRows = processedTrades.map((trade) => {
      return allColumnKeys.map((key) => {
        let value = ""

        switch (key) {
          case "asset":
            value = trade.asset || ""
            break
          case "side":
            value = trade.side || ""
            break
          case "dateStart":
            value = trade.formattedDates?.start || ""
            break
          case "dateEnd":
            value = trade.formattedDates?.end || ""
            break
          case "rr":
            if (trade.maxRR === "Loss") {
              value = "-1"
            } else {
              const rrNum = parseFloat(trade.maxRR)
              if (!isNaN(rrNum) && rrNum >= -0.1 && rrNum <= 0.1) {
                value = "0"
              } else {
                value = trade.maxRR || ""
              }
            }
            break
          case "risk":
            if (trade.riskPercentage) {
              value = `${trade.riskPercentage.percent}% ($${formatNumber(
                trade.riskPercentage.amount
              )})`
            } else {
              value = "-"
            }
            break
          case "realized":
            value = trade.formattedRealized || ""
            break
          case "duration":
            value = trade.holdTime || trade.duration || "-"
            break
          default:
            value = trade[key] || ""
        }

        // Escape CSV values (handle commas, quotes, newlines)
        if (
          typeof value === "string" &&
          (value.includes(",") || value.includes('"') || value.includes("\n"))
        ) {
          value = `"${value.replace(/"/g, '""')}"`
        }

        return value
      })
    })

    // Combine headers and rows
    const csvContent = [headers, ...csvRows]
      .map((row) => row.join(","))
      .join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `trade-history-${new Date().toISOString().split("T")[0]}.csv`
    )
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [processedTrades, columnDefinitions])

  // Pagination calculations
  const pageSize = 5
  const totalPages = Math.ceil(processedTrades.length / pageSize)
  const paginatedTrades = processedTrades.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  return (
    <Card className="justify-start h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Table className="h-5 w-5" />
            Trade History ({processedTrades.length} trades)
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFilter}
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
              variant="outline"
              size="sm"
              onClick={downloadCSV}
              disabled={processedTrades.length === 0}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download CSV
            </Button>
          </div>
        </div>

        {/* Column Filter */}
        {showFilter && (
          <div className="mt-4 p-2 bg-muted/30 text-muted-foreground rounded-lg border border-border">
            <div className="flex items-center gap-4 mb-3"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
              {columnDefinitions.map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={visibleColumns[key]}
                    onCheckedChange={() => toggleColumn(key)}
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
      <CardContent className="flex-1">
        {processedTrades.length > 0 ? (
          <div className="overflow-x-auto flex flex-col h-full justify-between">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  {columnDefinitions.map(
                    (column) =>
                      visibleColumns[column.key] && (
                        <th
                          key={column.key}
                          className="text-left p-2.5 text-sm font-medium text-muted-foreground"
                        >
                          {column.label}
                        </th>
                      )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedTrades.map((trade, index) => (
                  <TradeRow
                    key={index + (currentPage - 1) * pageSize}
                    trade={trade}
                    visibleColumns={visibleColumns}
                  />
                ))}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
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
