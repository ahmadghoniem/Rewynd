import { Calendar } from "lucide-react"
import { Separator } from "@/components/ui/separator"
const DailyRecapPlaceholderItem = () => {
  return (
    <div className="border border-muted-foreground/10 bg-muted/10 rounded-lg p-2.5 opacity-50">
      <div className="flex items-start justify-between mb-1 h-13">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <Calendar className="h-4 w-4 text-muted-foreground/30" />
            <div className="h-2.5 w-10 rounded-full bg-muted" />
            <div className="flex items-center gap-1">
              <div className=" rounded-full bg-muted" />
              <div className=" rounded-full bg-muted" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-lg text-muted-foreground/30">
            $ <div className="h-2.75 w-2.75 rounded-full bg-muted" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs text-muted-foreground/30">Return</span>
          <div className="flex items-center gap-1 text-base text-muted-foreground/30">
            <div className="h-2.5 w-2.5 rounded-full bg-muted" /> %
          </div>
        </div>
      </div>
      <Separator orientation="horizontal" className="mb-2" />
      <div className="flex items-center justify-between text-xs text-muted-foreground/30">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-muted" />
            <span className="text-muted-foreground/30">trades</span>
          </span>
          <span className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-muted" />
            <span className="text-muted-foreground/30">% W/R</span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-muted" />
          <span className="text-muted-foreground/30">R/R</span>
        </div>
      </div>
    </div>
  )
}

const DailyRecapPlaceholder = ({
  count = 3,
  keyPrefix = "placeholder",
  includeWrapper = true
}) => {
  const placeholderItems = Array.from({ length: count }).map((_, index) => (
    <DailyRecapPlaceholderItem key={`${keyPrefix}-${index}`} />
  ))

  if (includeWrapper) {
    return <div className="space-y-2">{placeholderItems}</div>
  }

  return <>{placeholderItems}</>
}

export default DailyRecapPlaceholder
