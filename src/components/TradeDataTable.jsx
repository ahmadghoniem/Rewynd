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

const TradeDataTable = ({ tradesData = [], accountSize = 0 }) => {
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
    return side?.toLowerCase() === "buy" ? "default" : "secondary"
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
      return date.toLocaleString()
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

  // Calculate risk percentage based on position size and account size
  const calculateRiskPercentage = (trade) => {
    if (!accountSize || !trade.size || !trade.entry || !trade.initialSL)
      return null

    const sizeNum = parseFloat(trade.size)
    const entryNum = parseFloat(trade.entry)
    const slNum = parseFloat(trade.initialSL)

    if (isNaN(sizeNum) || isNaN(entryNum) || isNaN(slNum)) return null

    // Calculate the risk per pip/point
    const riskPerPoint = Math.abs(entryNum - slNum)

    // Calculate total risk amount
    // For forex: 1 lot = 100,000 units, 1 pip = 0.0001 for most pairs
    // Risk amount = lot size * pips risk * pip value
    const pipsRisk = riskPerPoint * 10000 // Convert to pips (multiply by 10000 for 4-decimal pairs)
    const pipValue = 10 // Standard pip value for 1 lot (varies by pair but using standard)
    const totalRiskAmount = sizeNum * pipsRisk * pipValue

    // Calculate risk as percentage of account size
    const riskPercentage = (totalRiskAmount / accountSize) * 100

    return riskPercentage.toFixed(2)
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

  const handleDateClick = (trade, dateType) => {
    console.log(
      `Navigating to trade: ${trade.asset} - ${dateType} date: ${trade[dateType]}`
    )

    // Send message to content script to navigate to the trade
    if (chrome && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs[0] && tabs[0].url && tabs[0].url.includes("fxreplay.com")) {
          chrome.tabs.sendMessage(
            tabs[0].id,
            {
              type: "NAVIGATE_TO_TRADE",
              data: {
                trade,
                dateType,
                rowIndex: trade.rowIndex || 0
              }
            },
            function (response) {
              if (response && response.success) {
                console.log("Successfully navigated to trade")
              } else {
                console.log(
                  "Failed to navigate to trade, trying alternative method"
                )
                // Fallback: try to find and click the "Show on chart" button for this trade
                chrome.tabs.sendMessage(tabs[0].id, {
                  type: "CLICK_SHOW_ON_CHART",
                  data: { rowIndex: trade.rowIndex || 0 }
                })
              }
            }
          )
        } else {
          console.log("Not on FxReplay page, cannot navigate to trade")
        }
      })
    }
  }

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
    { key: "size", label: "Risk %" },
    { key: "close", label: "Close" },
    { key: "realized", label: "Realized" },
    { key: "duration", label: "Avg Hold Time" }
  ]

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
                {tradesData.map((trade, index) => (
                  <tr
                    key={index}
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
                          {trade.side?.toUpperCase()}
                        </Badge>
                      </td>
                    )}
                    {visibleColumns.dateStart && (
                      <td className="p-3 text-sm">
                        <button
                          onClick={() => handleDateClick(trade, "dateStart")}
                          className="text-info hover:text-info-dark underline cursor-pointer transition-colors"
                          title="Click to view trade on chart"
                        >
                          {formatDate(trade.dateStart)}
                        </button>
                      </td>
                    )}
                    {visibleColumns.dateEnd && (
                      <td className="p-3 text-sm">
                        <button
                          onClick={() => handleDateClick(trade, "dateEnd")}
                          className="text-info hover:text-info-dark underline cursor-pointer transition-colors"
                          title="Click to view trade on chart"
                        >
                          {formatDate(trade.dateEnd)}
                        </button>
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
                          <div
                            className={`font-medium ${getRiskLevelColor(
                              calculateRiskPercentage(trade)
                            )}`}
                          >
                            {calculateRiskPercentage(trade)
                              ? `${calculateRiskPercentage(trade)}%`
                              : trade.size}
                          </div>
                          {calculateRiskPercentage(trade) && (
                            <div className="text-xs text-muted-foreground">
                              {trade.size} lot
                            </div>
                          )}
                        </div>
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
                          <Badge
                            variant={getPnLBadge(trade.realized)}
                            className="text-xs"
                          >
                            {parseFloat(
                              trade.realized?.replace(/[$,]/g, "") || "0"
                            ) > 0 ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                          </Badge>
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
