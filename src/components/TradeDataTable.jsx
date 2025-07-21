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

const TradeDataTable = ({ tradesData = [], accountSize = 0, accountBalance = 0 }) => {
  const [visibleColumns, setVisibleColumns] = useState({
    asset: true,
    side: true,
    dateStart: true,
    dateEnd: true,
    entry: true,
    sl: true,
    tp: true,
    rr: true,
    size: true,
    risk: true, // Add risk column
    close: true,
    realized: true,
    duration: true
  })
  const [showFilter, setShowFilter] = useState(false)
  // Preset state
  const [presets, setPresets] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("columnVisibilityPresets") || "[]")
    } catch {
      return []
    }
  })
  const [presetName, setPresetName] = useState("")
  // Save preset
  const savePreset = () => {
    if (!presetName.trim()) return
    const newPresets = presets.filter((p) => p.name !== presetName.trim())
    newPresets.push({ name: presetName.trim(), columns: visibleColumns })
    setPresets(newPresets)
    localStorage.setItem("columnVisibilityPresets", JSON.stringify(newPresets))
    setPresetName("")
  }
  // Load preset
  const loadPreset = (columns) => {
    setVisibleColumns(columns)
  }
  // Delete preset
  const deletePreset = (name) => {
    const newPresets = presets.filter((p) => p.name !== name)
    setPresets(newPresets)
    localStorage.setItem("columnVisibilityPresets", JSON.stringify(newPresets))
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
    return amount > 0
      ? "text-success"
      : "text-danger"
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
      // Format: DD/MM/YY - HH:mm:ss (24h, 2-digit year)
      return date.toLocaleString("en-GB", {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      }).replace(",", "")
    } catch {
      return dateStr
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
    if (typeof val === 'number') return val;
    if (!val) return 0;
    return parseFloat(val.toString().replace(/[^\d.-]/g, ''));
  };

  const CONTRACT_SIZE = 100000; // Standard forex contract size

  // Calculate risk percentage based on entry, sl, lot size, and current account balance
  const calculateRiskPercentage = (trade) => {
    if (!trade.size || !trade.entry || !trade.initialSL || !accountBalance) return null;

    const sizeNum = cleanNumber(trade.size);
    const entryNum = cleanNumber(trade.entry);
    const slNum = cleanNumber(trade.initialSL);
    if (isNaN(sizeNum) || isNaN(entryNum) || isNaN(slNum)) return null;

    // Risk per trade = (Entry − Stop Loss) × Lot Size
    let riskPerTrade = 0;
    if (trade.side?.toLowerCase() === "sell") {
      riskPerTrade = (slNum - entryNum) * sizeNum;
    } else {
      riskPerTrade = (entryNum - slNum) * sizeNum;
    }
    if (riskPerTrade < 0) riskPerTrade = Math.abs(riskPerTrade);
    // Risk % = (Risk per trade ÷ Current Balance) × 100
    const riskPercentage = (riskPerTrade / accountBalance) * 100;
    return {
      percent: riskPercentage.toFixed(2),
      amount: riskPerTrade
    };
  };

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
  const calculateAverageHoldTime = () => {
    if (!tradesData || tradesData.length === 0) return null

    const validHoldTimes = tradesData
      .map((trade) => {
        if (!trade.dateStart || !trade.dateEnd) return null

        try {
          const startDate = new Date(trade.dateStart)
          const endDate = new Date(trade.dateEnd)

          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()))
            return null

          return endDate.getTime() - startDate.getTime()
        } catch {
          return null
        }
      })
      .filter((time) => time !== null && time > 0)

    if (validHoldTimes.length === 0) return null

    const averageTimeMs =
      validHoldTimes.reduce((sum, time) => sum + time, 0) /
      validHoldTimes.length

    // Format average time
    const minutes = Math.floor(averageTimeMs / (1000 * 60))
    const hours = Math.floor(averageTimeMs / (1000 * 60 * 60))
    const days = Math.floor(averageTimeMs / (1000 * 60 * 60 * 24))

    if (days > 0) {
      return `${days}d ${hours % 24}h`
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    } else if (minutes > 0) {
      return `${minutes}m`
    } else {
      return `${Math.floor(averageTimeMs / 1000)}s`
    }
  }

  // Memoize the average hold time calculation
  const averageHoldTime = React.useMemo(
    () => calculateAverageHoldTime(),
    [tradesData]
  )

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
      entry: !allVisible,
      sl: !allVisible,
      tp: !allVisible,
      rr: !allVisible,
      size: !allVisible,
      risk: !allVisible, // Add risk column
      close: !allVisible,
      realized: !allVisible,
      duration: !allVisible
    })
  }

  const columnDefinitions = [
    { key: "asset", label: "Asset" },
    { key: "side", label: "Side" },
    { key: "dateStart", label: "Date Start" },
    { key: "dateEnd", label: "Date End" },
    { key: "entry", label: "Entry" },
    { key: "sl", label: "SL" },
    { key: "tp", label: "TP" },
    { key: "rr", label: "RR" },
    { key: "size", label: "Size (Lots)" },
    { key: "risk", label: "Risk %" },
    { key: "close", label: "Close" },
    { key: "realized", label: "Realized" },
    { key: "duration", label: "Avg Hold Time" }
  ]

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5
  const totalPages = Math.ceil(tradesData.length / pageSize)
  const paginatedTrades = tradesData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Table className="h-5 w-5" />
            Trade History ({tradesData.length} trades)
          </CardTitle>
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
        </div>

        {/* Column Filter */}
        {showFilter && (
          <div className="mt-4 p-4 bg-background dark:bg-gray-800 rounded-lg border border-border">
            <div className="flex items-center gap-4 mb-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                Visible Columns:
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAllColumns}
                className="text-xs"
              >
                {Object.values(visibleColumns).every((v) => v)
                  ? "Hide All"
                  : "Show All"}
              </Button>
            </div>
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
            {/* Preset Management UI */}
            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
              <input
                type="text"
                placeholder="Preset name"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={savePreset}
                disabled={!presetName.trim()}
              >
                Save Preset
              </Button>
              {presets.length > 0 && (
                <select
                  className="border rounded px-2 py-1 text-sm"
                  onChange={(e) => {
                    const preset = presets.find(
                      (p) => p.name === e.target.value
                    )
                    if (preset) loadPreset(preset.columns)
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Load Preset...
                  </option>
                  {presets.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            {presets.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {presets.map((p) => (
                  <span
                    key={p.name}
                    className="flex items-center bg-muted-foreground rounded px-2 py-1 text-xs"
                  >
                    {p.name}
                    <button
                      className="ml-1 text-red-500 hover:text-red-700"
                      title="Delete preset"
                      onClick={() => deletePreset(p.name)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {tradesData.length > 0 ? (
          <div className="overflow-x-auto">
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
                  {visibleColumns.entry && (
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                      Entry
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
                  {visibleColumns.size && (
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                      Size (Lots)
                    </th>
                  )}
                  {visibleColumns.risk && (
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                      Risk %
                    </th>
                  )}
                  {visibleColumns.close && (
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                      Close
                    </th>
                  )}
                  {visibleColumns.realized && (
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                      Realized
                    </th>
                  )}
                  {visibleColumns.duration && (
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                      Avg Hold Time
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedTrades.map((trade, index) => (
                  <tr
                    key={index + (currentPage - 1) * pageSize}
                    className="hover:bg-muted-foreground dark:hover:bg-gray-800"
                  >
                    {visibleColumns.asset && (
                      <td className="p-3 text-sm text-foreground dark:text-white font-medium">
                        {trade.asset}
                      </td>
                    )}
                    {visibleColumns.side && (
                      <td className="p-3">
                        <Badge
                          variant={getSideBadge(trade.side)}
                          className="text-xs"
                        >
                          {trade.side?.charAt(0).toUpperCase() + trade.side?.slice(1).toLowerCase()}
                        </Badge>
                      </td>
                    )}
                    {visibleColumns.dateStart && (
                      <td className="p-3 text-sm">
                        {/* Remove clickable link, just show text */}
                        {formatDate(trade.dateStart)}
                      </td>
                    )}
                    {visibleColumns.dateEnd && (
                      <td className="p-3 text-sm">
                        {/* Remove clickable link, just show text */}
                        {formatDate(trade.dateEnd)}
                      </td>
                    )}
                    {visibleColumns.entry && (
                      <td className="p-3 text-sm text-foreground dark:text-white">
                        {formatNumber(trade.entry)}
                      </td>
                    )}
                    {visibleColumns.sl && (
                      <td className="p-3 text-sm">
                        <div>
                          <div className="text-foreground dark:text-white">
                            {formatNumber(trade.initialSL)}
                          </div>
                          {trade.initialSL && trade.entry && (
                            <div className="text-xs text-danger">
                              {calculatePercentage(
                                trade.entry,
                                trade.initialSL,
                                trade.side
                              )}
                              %
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                    {visibleColumns.tp && (
                      <td className="p-3 text-sm">
                        <div>
                          <div className="text-foreground dark:text-white">
                            {trade.maxTP ? formatNumber(trade.maxTP) : "-"}
                          </div>
                          {trade.maxTP && trade.entry && (
                            <div className="text-xs text-success">
                              {calculatePercentage(
                                trade.entry,
                                trade.maxTP,
                                trade.side
                              )}
                              %
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                    {visibleColumns.rr && (
                      <td className="p-3 text-sm text-foreground dark:text-white">
                        {trade.maxRR === "Loss" ? (
                          <Badge variant="destructive" className="text-xs">
                            Loss
                          </Badge>
                        ) : (
                          trade.maxRR
                        )}
                      </td>
                    )}
                    {visibleColumns.size && (
                      <td className="p-3 text-sm">
                        <div>
                          <div className="font-medium text-foreground dark:text-white">
                            {trade.size}
                          </div>
                        </div>
                      </td>
                    )}
                    {visibleColumns.risk && (
                      <td className="p-3 text-sm">
                        {(() => {
                          const risk = calculateRiskPercentage(trade);
                          if (!risk) return "-";
                          return (
                            <div>
                              <span className={`font-medium ${getRiskLevelColor(risk.percent)}`}>
                                {risk.percent}%
                              </span>
                              <div className="text-xs text-muted-foreground">
                                (${formatNumber(risk.amount)})
                              </div>
                            </div>
                          );
                        })()}
                      </td>
                    )}
                    {visibleColumns.close && (
                      <td className="p-3 text-sm text-foreground dark:text-white">
                        {formatNumber(trade.closeAvg)}
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
                          <div className="text-foreground dark:text-white">
                            {calculateHoldTime(trade) || trade.duration || "-"}
                          </div>
                          {calculateHoldTime(trade) && averageHoldTime && (
                            <div className="text-xs text-muted-foreground">
                              Avg: {averageHoldTime}
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-2 mt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Prev
              </Button>
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
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground dark:text-gray-400">
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

export default TradeDataTable
