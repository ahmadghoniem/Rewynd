import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, Activity, TrendingUp } from "lucide-react"

const AccountInfoCard = ({ capital, balance, realizedPnL, formatCurrency, getStatusColor }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Current Capital */}
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-info">Account Size</p>
            <p className="text-2xl font-bold text-info">
              {formatCurrency(capital)}
            </p>
          </div>
          <div className="h-12 w-12 bg-info rounded-lg flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-info" />
          </div>
        </div>
      </CardContent>
    </Card>
    {/* Current Balance */}
    <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-success">Current Balance</p>
            <p className="text-2xl font-bold text-success">
              {formatCurrency(balance)}
            </p>
          </div>
          <div className="h-12 w-12 bg-success rounded-lg flex items-center justify-center">
            <Activity className="h-6 w-6 text-success" />
          </div>
        </div>
      </CardContent>
    </Card>
    {/* Realized P&L */}
    <Card className={`bg-gradient-to-br ${realizedPnL >= 0 ? 'from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-800' : 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-800'}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Realized P&L</p>
            <p className={`text-2xl font-bold ${getStatusColor(realizedPnL)}`}>
              {formatCurrency(realizedPnL)}
            </p>
          </div>
          <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${realizedPnL >= 0 ? 'bg-success' : 'bg-danger'}`}>
            <TrendingUp className={`h-6 w-6 ${realizedPnL >= 0 ? 'text-success' : 'text-danger'}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
)

export default AccountInfoCard 