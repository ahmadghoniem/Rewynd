import React, { memo } from "react"
import { Badge } from "@/components/ui/badge"
import { formatNumber, calculatePercentage } from "@/lib/tradeUtils"

const TradeRow = memo(({ trade, visibleColumns }) => {
  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
      {visibleColumns.asset && (
        <td className="p-3 text-sm font-medium">{trade.asset}</td>
      )}
      {visibleColumns.side && (
        <td className="p-3">
          <Badge variant={trade.sideBadge} className="text-xs">
            {trade.side}
          </Badge>
        </td>
      )}
      {visibleColumns.dateStart && (
        <td className="p-3 text-sm text-muted-foreground">
          {trade.formattedDates.start}
        </td>
      )}
      {visibleColumns.dateEnd && (
        <td className="p-3 text-sm text-muted-foreground">
          {trade.formattedDates.end}
        </td>
      )}
      {visibleColumns.sl && (
        <td className="p-3 text-sm">
          <div>
            {trade.initialSL && trade.entry ? (
              <span className="text-danger">
                {calculatePercentage(trade.entry, trade.initialSL, trade.side)}%
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
                {calculatePercentage(trade.entry, trade.maxTP, trade.side)}%
              </span>
            ) : (
              "-"
            )}
          </div>
        </td>
      )}
      {visibleColumns.rr && (
        <td className="p-3 text-sm text-foreground">
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
          {trade.riskPercentage ? (
            <div>
              <span className="font-medium">
                {trade.riskPercentage.percent}%
              </span>
              <div className="text-xs text-muted-foreground">
                (${formatNumber(trade.riskPercentage.amount)})
              </div>
            </div>
          ) : (
            "-"
          )}
        </td>
      )}
      {visibleColumns.realized && (
        <td className="p-3">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${trade.pnlColor}`}>
              {trade.formattedRealized}
            </span>
          </div>
        </td>
      )}
      {visibleColumns.duration && (
        <td className="p-3 text-sm">
          <div>
            <div className="text-foreground">
              {trade.holdTime || trade.duration || "-"}
            </div>
          </div>
        </td>
      )}
    </tr>
  )
})

TradeRow.displayName = "TradeRow"

export default TradeRow
