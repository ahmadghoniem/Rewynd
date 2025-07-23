import { Card, CardContent, CardHeader } from "@/components/ui/card"

const BalanceAndRealizedPnlCard = ({ displayData }) => {
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2
    }).format(amount)

  return (
    <Card className="gap-2 text-xs font-medium">
      <CardHeader>Balance & Realized PnL</CardHeader>
      <CardContent>
        <div className="flex flex-row gap-2">
          <div>
            <div className="text-2xl font-normal">
              {formatCurrency(displayData?.balance ?? 0)}
            </div>
          </div>
          <span className="text-2xl text-muted-foreground">
            PnL: {formatCurrency(displayData?.realizedPnL ?? 0)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export default BalanceAndRealizedPnlCard
