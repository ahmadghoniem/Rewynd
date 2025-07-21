import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, TrendingDown, DollarSign, Target, Clock } from "lucide-react"

const DailyAnalysis = ({ tradesData = [] }) => {
  const [dailyData, setDailyData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 3

  useEffect(() => {
    if (tradesData && tradesData.length > 0) {
      calculateDailyAnalysis(tradesData)
    }
  }, [tradesData])

  const calculateDailyAnalysis = (trades) => {
    const dailyGroups = {}
    trades.forEach(trade => {
      const date = new Date(trade.dateStart)
      const dateKey = date.toISOString().split('T')[0]
      if (!dailyGroups[dateKey]) {
        dailyGroups[dateKey] = {
          date: date,
          dateKey: dateKey,
          trades: [],
          totalPnL: 0,
          totalVolume: 0,
        }
      }
      const pnl = parseFloat(trade.realized?.replace(/[$,]/g, '') || '0')
      const volume = parseFloat(trade.size?.replace(/[^\d.]/g, '') || '0')
      dailyGroups[dateKey].trades.push(trade)
      dailyGroups[dateKey].totalPnL += pnl
      dailyGroups[dateKey].totalVolume += volume
    })
    // Convert to sorted array (descending by date)
    const dailyArray = Object.values(dailyGroups).sort((a, b) => b.date - a.date)
    setDailyData(dailyArray)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const getPnLColor = (pnl) => {
    if (pnl > 0) return 'text-green-600 dark:text-green-400'
    if (pnl < 0) return 'text-red-600 dark:text-red-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  // Pagination logic
  const totalPages = Math.ceil(dailyData.length / pageSize)
  const paginatedData = dailyData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trading Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {dailyData.length > 0 ? (
          <>
            <div className="flex gap-4 mb-4">
              {paginatedData.map((day, idx) => (
                <div key={day.dateKey} className="flex-1 min-w-0 bg-gray-900/40 dark:bg-gray-800/60 rounded-lg p-4 shadow border border-gray-700 flex flex-col justify-between">
                  <div className="text-sm text-gray-300 mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4 opacity-60" />
                    {day.date.toLocaleDateString('en-US')}
                  </div>
                  <div className={`text-lg font-bold mb-2 ${getPnLColor(day.totalPnL)}`}>{formatCurrency(day.totalPnL)}</div>
                  <div className="text-xs text-gray-400 mb-1">Trade: <span className="text-white font-semibold">{day.trades.length}</span></div>
                  <div className="text-xs text-gray-400">Lots: <span className="text-white font-semibold">{day.totalVolume.toFixed(2)}</span></div>
                </div>
              ))}
            </div>
            {/* Pagination Controls */}
            <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
              <div>
                {`0${(currentPage - 1) * pageSize + 1} - 0${Math.min(currentPage * pageSize, dailyData.length)} items of ${dailyData.length}`}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>
                  1
                </Button>
                {currentPage > 2 && <span>...</span>}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => Math.abs(page - currentPage) <= 1)
                  .map(page => (
                    <Button
                      key={page}
                      variant={page === currentPage ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                {currentPage < totalPages - 1 && <span>...</span>}
                <Button variant="ghost" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>
                  Last
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No trading data available</p>
            <p className="text-sm">Extract trades from FxReplay to see daily summaries</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default DailyAnalysis 