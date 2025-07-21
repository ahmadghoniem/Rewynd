import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"

const ProfitableDaysCard = ({ profitableDays, requiredDays, progress }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-green-500" />
        Profitable Days
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl font-bold text-green-600 dark:text-green-400">{profitableDays}/{requiredDays}</span>
        <Badge variant={profitableDays >= requiredDays ? 'default' : 'secondary'}>
          {profitableDays >= requiredDays ? 'Met' : 'Not Met'}
        </Badge>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        Days with ≥ 0.5% profit
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4">
        <div
          className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-300 shadow-sm"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
    </CardContent>
  </Card>
)

export default ProfitableDaysCard 