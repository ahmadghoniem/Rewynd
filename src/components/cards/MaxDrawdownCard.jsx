import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { TrendingDown } from "lucide-react"

const MaxDrawdownCard = ({ maxDrawdown }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <TrendingDown className="h-5 w-5 text-danger" />
        Max Drawdown
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex flex-col items-center justify-center h-full">
        <span className="text-3xl font-bold text-danger dark:text-red-400">{maxDrawdown}%</span>
        <span className="text-sm text-muted-foreground dark:text-gray-400 mt-2">Max loss allowed overall</span>
      </div>
    </CardContent>
  </Card>
)

export default MaxDrawdownCard 