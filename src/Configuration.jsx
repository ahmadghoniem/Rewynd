import {
  TradingDaysConfigCard,
  ProfitTargetConfigCard,
  ConsistencyRuleConfigCard,
  DrawdownConfigCard
} from "@/components/configuration"

const Configuration = () => {
  return (
    <div className="w-full">
      <div className="flex flex-col gap-2">
        <ProfitTargetConfigCard />
        <DrawdownConfigCard />
        <TradingDaysConfigCard />
        <ConsistencyRuleConfigCard />
      </div>
    </div>
  )
}

export default Configuration
