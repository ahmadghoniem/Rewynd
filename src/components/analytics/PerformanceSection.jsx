import BalanceAndRealizedPnlCard from "@/components/cards/BalanceAndRealizedPnlCard.jsx"
import WinRateCard from "@/components/cards/winRateCard.jsx"
import AvgRRCard from "@/components/cards/AvgRRCard.jsx"
import ProfitFactorCard from "@/components/cards/ProfitFactorCard.jsx"
import LossesSummaryCard from "@/components/cards/LossesSummaryCard.jsx"
import WinsSummaryCard from "@/components/cards/WinsSummaryCard.jsx"
import TraderExpectancyCard from "@/components/cards/TraderExpectancyCard.jsx"
import CurrentStreakCard from "@/components/cards/CurrentStreakCard.jsx"

const PerformanceSection = ({
  displayData,
  extractedTrades,
  stats,
  formatCurrency
}) => {
  return (
    <div className="grid grid-cols-8 gap-4 [&>*]:max-h-[4.375rem] [&>*]:overflow-hidden">
      <div className="col-span-8 lg:col-span-4">
        <BalanceAndRealizedPnlCard displayData={displayData} />
      </div>
      <div className="col-span-8 lg:col-span-2">
        <WinRateCard extractedTrades={extractedTrades} />
      </div>
      <div className="col-span-8 lg:col-span-1">
        <AvgRRCard extractedTrades={extractedTrades} />
      </div>
      <div className="col-span-8 lg:col-span-1">
        <ProfitFactorCard extractedTrades={extractedTrades} />
      </div>
      <div className="col-span-12 lg:col-span-3">
        <LossesSummaryCard stats={stats} formatCurrency={formatCurrency} />
      </div>
      <div className="col-span-12 lg:col-span-3">
        <WinsSummaryCard stats={stats} formatCurrency={formatCurrency} />
      </div>
      <div className="col-span-12 lg:col-span-1">
        <TraderExpectancyCard extractedTrades={extractedTrades} />
      </div>
      <div className="col-span-12 lg:col-span-1">
        <CurrentStreakCard extractedTrades={extractedTrades} />
      </div>
    </div>
  )
}

export default PerformanceSection
