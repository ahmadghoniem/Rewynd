import React from "react"
import DailyRecap from "../cards/DailyRecapCard"
import { cn } from "@/lib/utils"
import useAppStore from "@/store/useAppStore"

const DailyRecapSection = ({ className }) => {
  const extractedTrades = useAppStore((state) => state.extractedTrades) || []
  return (
    <div className={cn("w-full", className)}>
      <DailyRecap extractedTrades={extractedTrades} className="w-full" />
    </div>
  )
}

export default DailyRecapSection
