import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, TrendingUp } from "lucide-react"

const TradingActivityCard = ({ minTradingDays, tradingDays, minProfitableDays, profitableDays }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-blue-500" />
        Trading Activity
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      {/* Minimum Trading Days Objective */}
      {minTradingDays > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Minimum Trading Days</span>
            </div>
            <div className="text-right">
              <Badge variant={tradingDays >= minTradingDays ? 'default' : 'secondary'} className="mb-1">
                {tradingDays}/{minTradingDays}
              </Badge>
            </div>
          </div>
          <div className="space-y-1">
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-blue-400 to-blue-600 h-4 rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${Math.min(100, (tradingDays / minTradingDays) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}
      {/* Minimum Profitable Days Objective */}
      {minProfitableDays > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Minimum Profitable Days</span>
            </div>
            <div className="text-right">
              <Badge variant={profitableDays >= minProfitableDays ? 'default' : 'secondary'} className="mb-1">
                {profitableDays}/{minProfitableDays}
              </Badge>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Days with ≥ 0.5% profit
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${Math.min(100, (profitableDays / minProfitableDays) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </CardContent>
  </Card>
)

export default TradingActivityCard 