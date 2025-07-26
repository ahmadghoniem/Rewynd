import React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info } from "lucide-react"
import { ProgressBar } from "../ui/progressbar"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const DailyDrawdownCard = ({
  drawdownProgressPercent,
  maxDailyDrawdownPercent,
  equityLimit,
  className
}) => (
  <Card className={cn("gap-2 text-xs font-medium py-2", className)}>
    <CardHeader className="flex justify-between items-center px-2 pb-0">
      <span className="uppercase tracking-wide text-xs font-semibold">
        Max Daily Loss
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-pointer align-middle">
            <Info size={14} aria-label="Info about Max Daily Loss" />
          </span>
        </TooltipTrigger>
        <TooltipContent sideOffset={6}>
          The maximum daily loss allowed before breaching the account rule.
        </TooltipContent>
      </Tooltip>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="flex items-end gap-2">
        <span className="text-2xl font-semibold">
          {typeof drawdownProgressPercent === "number" &&
          !isNaN(drawdownProgressPercent)
            ? drawdownProgressPercent.toFixed(2) + "%"
            : "--"}
        </span>
        <span className="text-base text-muted-foreground">
          /{" "}
          {typeof maxDailyDrawdownPercent === "number" &&
          !isNaN(maxDailyDrawdownPercent)
            ? maxDailyDrawdownPercent + "%"
            : "--"}
        </span>
      </div>
      <div className="text-xs text-muted-foreground mb-2">
        Equity limit: $
        {typeof equityLimit === "number" && !isNaN(equityLimit)
          ? equityLimit.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })
          : "--"}
      </div>
      <ProgressBar
        progress={
          typeof drawdownProgressPercent === "number" &&
          !isNaN(drawdownProgressPercent)
            ? Math.max(0, Math.min(1, drawdownProgressPercent / 100))
            : 0
        }
        height={12}
        filledColor="bg-destructive"
        emptyColor="bg-accent"
      />
    </CardContent>
  </Card>
)

export default DailyDrawdownCard
