import { memo } from "react"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, getRRDisplayValue } from "@/lib/utils"

const TradeRow = memo(({ trade, visibleColumns }) => {
  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
      {visibleColumns.asset && (
        <td className="p-2.5 text-sm font-medium">{trade.asset}</td>
      )}
      {visibleColumns.side && (
        <td className="p-2.5">
          <Badge variant={trade.sideBadge} className="text-xs">
            {trade.side}
          </Badge>
        </td>
      )}
      {visibleColumns.dateStart && (
        <td className="p-2.5 text-sm text-muted-foreground">
          {trade.formattedDates.start}
        </td>
      )}
      {visibleColumns.dateEnd && (
        <td className="p-2.5 text-sm text-muted-foreground">
          {trade.formattedDates.end}
        </td>
      )}
      {visibleColumns.rr && (
        <td className="p-2.5 text-sm text-foreground ">
          <span>{getRRDisplayValue(trade)}</span>
        </td>
      )}
      {visibleColumns.risk && (
        <td className="p-2.5 text-sm ">
          {trade.riskPercentage ? (
            <div>
              <span className="font-medium">
                {trade.riskPercentage.percent}%
              </span>
              <div className="text-xs text-muted-foreground">
                ({formatCurrency(trade.riskPercentage.amount)})
              </div>
            </div>
          ) : (
            "N/A"
          )}
        </td>
      )}
      {visibleColumns.realized && (
        <td className="p-2.5 ">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${trade.pnlColor}`}>
              {trade.formattedRealized}
            </span>
          </div>
        </td>
      )}
      {visibleColumns.duration && (
        <td className="p-2.5 text-sm">
          <div>
            <div className="text-foreground">
              {trade.heldTime || trade.duration || "-"}
            </div>
          </div>
        </td>
      )}
    </tr>
  )
})

TradeRow.displayName = "TradeRow"

export default TradeRow
