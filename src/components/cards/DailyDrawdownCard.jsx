import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

const DailyDrawdownCard = ({ dailyDrawdown }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-orange-500" />
        Daily Drawdown
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex flex-col items-center justify-center h-full">
        <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">{dailyDrawdown}%</span>
        <span className="text-sm text-gray-600 dark:text-gray-400 mt-2">Max loss allowed per day</span>
      </div>
    </CardContent>
  </Card>
)

export default DailyDrawdownCard 