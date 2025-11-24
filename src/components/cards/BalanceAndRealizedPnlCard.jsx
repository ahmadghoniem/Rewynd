import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency, cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

const BalanceAndRealizedPnlCard = ({ displayData, className }) => {
  // Calculate PnL percentage
  const balance = displayData?.balance ?? 0
  const realizedPnL = displayData?.realizedPnL ?? 0
  const pnlBase = balance - realizedPnL
  const pnlPercent = pnlBase !== 0 ? (realizedPnL / pnlBase) * 100 : 0

  return (
    <Card className={cn("gap-2 text-xs font-medium py-2", className)}>
      <CardContent className="flex flex-row items-center justify-between px-2">
        {/* Balance Section */}
        <div className="flex flex-col items-start flex-1">
          <span className="text-xs text-card-foreground mb-1">Balance</span>
          <span className="text-2xl font-normal">
            {formatCurrency(balance)}
          </span>
        </div>
        {/* Separator */}
        <Separator className="h-12 mx-6" orientation="vertical" />
        {/* Realized PnL Section */}
        <div className="flex flex-col items-end flex-1">
          <span className="text-xs text-card-foreground mb-1">
            Realized PnL
          </span>
          <span className="text-2xl font-normal flex items-center gap-2">
            <span
              className={
                realizedPnL > 0
                  ? "text-success"
                  : realizedPnL < 0
                    ? "text-danger"
                    : ""
              }
            >
              {realizedPnL > 0 ? "+" : realizedPnL < 0 ? "-" : ""}
              {formatCurrency(Math.abs(realizedPnL))}
            </span>
            <span className="text-base text-muted-foreground">
              ({pnlPercent.toFixed(2)}%)
            </span>
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export default BalanceAndRealizedPnlCard
