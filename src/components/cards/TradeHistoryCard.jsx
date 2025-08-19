import React, { useState, useMemo, useCallback } from "react"
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
import { preprocessTradeData } from "@/lib/utils"
import TradeRow from "./TradeRow"
import Pagination from "@/components/ui/pagination"

const TradeHistoryCard = ({
  tradesData = [],
  accountSize = 0,
  accountBalance = 0
}) => {
  // Consolidated state management
  const [tableState, setTableState] = useState({
    visibleColumns: {
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
      { key: "sl", label: "SL" },
      { key: "tp", label: "TP" },
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

  // Preset filter button handler
  const applyPresetFilter = useCallback(() => {
    setTableState((prev) => ({
      ...prev,
      visibleColumns: {
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
      }
    }))
  }, [])

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

  // Toggle all columns
  const toggleAllColumns = useCallback(() => {
    setTableState((prev) => {
      const allVisible = Object.values(prev.visibleColumns).every((v) => v)

      if (allVisible) {
        // Switch to simple preset: show only essential columns
        return {
          ...prev,
          visibleColumns: {
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
          }
        }
      } else {
        // Show all columns (advanced)
        return {
          ...prev,
          visibleColumns: {
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
          }
        }
      }
    })
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

  // Pagination calculations
  const pageSize = 5
  const totalPages = Math.ceil(processedTrades.length / pageSize)
  const paginatedTrades = processedTrades.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  return (
    <Card className="justify-between h-full">
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
              variant={
                Object.values(visibleColumns).every((v) => v)
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={toggleAllColumns}
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
        {processedTrades.length > 0 ? (
          <div className="overflow-x-auto flex flex-col">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  {columnDefinitions.map(
                    (column) =>
                      visibleColumns[column.key] && (
                        <th
                          key={column.key}
                          className="text-left p-3 text-sm font-medium text-muted-foreground"
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
