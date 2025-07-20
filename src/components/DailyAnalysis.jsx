import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, TrendingDown, DollarSign, Target, Clock } from "lucide-react"

const DailyAnalysis = ({ tradesData = [] }) => {
  const [dailyData, setDailyData] = useState({})
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)

  useEffect(() => {
    if (tradesData && tradesData.length > 0) {
      calculateDailyAnalysis(tradesData)
    }
  }, [tradesData])

  const calculateDailyAnalysis = (trades) => {
    const dailyGroups = {}
    
    trades.forEach(trade => {
      const date = new Date(trade.dateStart)
      const dateKey = date.toISOString().split('T')[0] // YYYY-MM-DD format
      
      if (!dailyGroups[dateKey]) {
        dailyGroups[dateKey] = {
          date: date,
          dateKey: dateKey,
          trades: [],
          totalPnL: 0,
          winningTrades: 0,
          losingTrades: 0,
          totalVolume: 0,
          averageRR: 0,
          bestTrade: null,
          worstTrade: null,
          totalDuration: 0
        }
      }
      
      const pnl = parseFloat(trade.realized?.replace(/[$,]/g, '') || '0')
      const volume = parseFloat(trade.size?.replace(/[^\d.]/g, '') || '0')
      const rr = parseFloat(trade.maxRR) || 0
      const duration = parseDuration(trade.duration)
      
      dailyGroups[dateKey].trades.push(trade)
      dailyGroups[dateKey].totalPnL += pnl
      dailyGroups[dateKey].totalVolume += volume
      dailyGroups[dateKey].totalDuration += duration
      
      if (pnl > 0) {
        dailyGroups[dateKey].winningTrades++
      } else if (pnl < 0) {
        dailyGroups[dateKey].losingTrades++
      }
      
      // Track best and worst trades
      if (!dailyGroups[dateKey].bestTrade || pnl > dailyGroups[dateKey].bestTrade.pnl) {
        dailyGroups[dateKey].bestTrade = { ...trade, pnl }
      }
      if (!dailyGroups[dateKey].worstTrade || pnl < dailyGroups[dateKey].worstTrade.pnl) {
        dailyGroups[dateKey].worstTrade = { ...trade, pnl }
      }
    })
    
    // Calculate averages
    Object.values(dailyGroups).forEach(day => {
      day.averageRR = day.trades.reduce((sum, t) => sum + (parseFloat(t.maxRR) || 0), 0) / day.trades.length
      day.averageDuration = day.totalDuration / day.trades.length
      day.winRate = day.trades.length > 0 ? (day.winningTrades / day.trades.length) * 100 : 0
      day.tradeCount = day.trades.length
    })
    
    setDailyData(dailyGroups)
  }

  const parseDuration = (durationStr) => {
    if (!durationStr) return 0
    
    const hours = durationStr.match(/(\d+)h/)
    const minutes = durationStr.match(/(\d+)m/)
    
    const h = hours ? parseInt(hours[1]) : 0
    const m = minutes ? parseInt(minutes[1]) : 0
    
    return h * 60 + m // Return total minutes
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const getPnLColor = (pnl) => {
    if (pnl > 0) return 'text-green-600 dark:text-green-400'
    if (pnl < 0) return 'text-red-600 dark:text-red-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const getDayBackgroundColor = (dayData) => {
    if (!dayData) return 'bg-gray-50 dark:bg-gray-800'
    if (dayData.totalPnL > 0) return 'bg-green-50 dark:bg-green-900/20'
    if (dayData.totalPnL < 0) return 'bg-red-50 dark:bg-red-900/20'
    return 'bg-gray-50 dark:bg-gray-800'
  }

  const getDayBorderColor = (dayData) => {
    if (!dayData) return 'border-gray-200 dark:border-gray-700'
    if (dayData.totalPnL > 0) return 'border-green-200 dark:border-green-800'
    if (dayData.totalPnL < 0) return 'border-red-200 dark:border-red-800'
    return 'border-gray-200 dark:border-gray-700'
  }

  // Calendar functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getMonthName = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2" />)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dateKey = date.toISOString().split('T')[0]
      const dayData = dailyData[dateKey]
      const isSelected = selectedDay === dateKey

      days.push(
        <div
          key={day}
          className={`p-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
            isSelected ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => setSelectedDay(dayData ? dateKey : null)}
        >
          <div className={`h-24 border rounded-lg p-2 ${getDayBackgroundColor(dayData)} ${getDayBorderColor(dayData)}`}>
            <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              {day}
            </div>
            
            {dayData ? (
              <div className="space-y-1">
                <div className={`text-xs font-bold ${getPnLColor(dayData.totalPnL)}`}>
                  {formatCurrency(dayData.totalPnL)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {dayData.tradeCount} trades
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {dayData.winRate.toFixed(0)}% win
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-400">No trades</div>
            )}
          </div>
        </div>
      )
    }

    return days
  }

  const renderDayDetails = () => {
    if (!selectedDay || !dailyData[selectedDay]) return null

    const dayData = dailyData[selectedDay]

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {formatDate(dayData.date)} - Trading Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {dayData.tradeCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Trades</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className={`text-2xl font-bold ${getPnLColor(dayData.totalPnL)}`}>
                {formatCurrency(dayData.totalPnL)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Daily P&L</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {dayData.averageRR.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg RR</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {Math.round(dayData.averageDuration)}m
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Duration</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dayData.bestTrade && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Best Trade
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Asset:</span>
                    <span className="font-medium">{dayData.bestTrade.asset}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Side:</span>
                    <Badge variant="default" className="text-xs">
                      {dayData.bestTrade.side?.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">P&L:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(dayData.bestTrade.pnl)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">RR:</span>
                    <span className="font-medium">{dayData.bestTrade.maxRR}</span>
                  </div>
                </div>
              </div>
            )}
            
            {dayData.worstTrade && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-3 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Worst Trade
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Asset:</span>
                    <span className="font-medium">{dayData.worstTrade.asset}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Side:</span>
                    <Badge variant="destructive" className="text-xs">
                      {dayData.worstTrade.side?.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">P&L:</span>
                    <span className="font-medium text-red-600 dark:text-red-400">
                      {formatCurrency(dayData.worstTrade.pnl)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">RR:</span>
                    <span className="font-medium">{dayData.worstTrade.maxRR}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Trading Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {getMonthName(currentDate)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth(1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {Object.keys(dailyData).length > 0 ? (
          <>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                  {day}
                </div>
              ))}
              {renderCalendar()}
            </div>
            
            {/* Day Details */}
            {renderDayDetails()}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No trading data available</p>
            <p className="text-sm">Extract trades from FxReplay to see daily analysis</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default DailyAnalysis 