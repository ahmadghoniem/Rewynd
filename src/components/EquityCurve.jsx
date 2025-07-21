import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

const EquityCurve = ({ tradesData = [] }) => {
  const [equityData, setEquityData] = useState([])
  const [totalPnL, setTotalPnL] = useState(0)

  const [peakValue, setPeakValue] = useState(0)

  useEffect(() => {
    if (tradesData && tradesData.length > 0) {
      calculateEquityCurve(tradesData)
    }
  }, [tradesData])

  const calculateEquityCurve = (trades) => {
    // Sort trades by date
    const sortedTrades = trades
      .map(trade => ({
        ...trade,
        date: new Date(trade.dateStart),
        pnl: parseFloat(trade.realized?.replace(/[$,]/g, '') || '0')
      }))
      .sort((a, b) => a.date - b.date)

    // Calculate cumulative equity curve
    let cumulativePnL = 0
    const equityPoints = []

    sortedTrades.forEach((trade, index) => {
      cumulativePnL += trade.pnl

      equityPoints.push({
        date: trade.date,
        cumulativePnL,
        trade: trade,
        dayNumber: index + 1
      })
    })

    setEquityData(equityPoints)
    setTotalPnL(cumulativePnL)
    setPeakValue(cumulativePnL > 0 ? cumulativePnL : 0)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getPnLColor = (pnl) => {
    return pnl >= 0 ? 'text-success' : 'text-danger'
  }

  // Calculate statistics
  const winningDays = equityData.filter(point => point.cumulativePnL > (point.dayNumber > 1 ? equityData[point.dayNumber - 2]?.cumulativePnL || 0 : 0)).length
  const losingDays = equityData.filter(point => point.cumulativePnL < (point.dayNumber > 1 ? equityData[point.dayNumber - 2]?.cumulativePnL || 0 : 0)).length
  const winRate = equityData.length > 0 ? (winningDays / equityData.length) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Equity Curve & Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        {equityData.length > 0 ? (
          <div className="space-y-6">
            {/* Equity Curve Chart Only */}
            <div className="h-64 bg-background rounded-lg p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="dayNumber" 
                    label={{ value: 'Trade Day', position: 'insideBottom', offset: -10 }}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tickFormatter={(value) => formatCurrency(value)}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value), 'Cumulative P&L']}
                    labelFormatter={(label) => `Day ${label}`}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cumulativePnL" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    fill="url(#colorPnL)"
                    dot={{
                      fill: (entry) => entry.cumulativePnL >= 0 ? "#10b981" : "#ef4444",
                      strokeWidth: 2,
                      r: 4
                    }}
                    activeDot={{ r: 6, stroke: "#8b5cf6", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No trade data available</p>
            <p className="text-sm">Extract trades from FxReplay to see equity curve analysis</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default EquityCurve 