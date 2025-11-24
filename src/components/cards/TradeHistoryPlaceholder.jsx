import { FileText } from "lucide-react"

const TradeHistoryPlaceholder = () => {
  return (
    <div className="relative">
      {/* Table Header */}
      <div className="grid grid-cols-8 gap-4 px-4 py-3 text-sm font-medium leading-none text-muted-foreground border-b border-border">
        <div>Asset</div>
        <div>Side</div>
        <div>Date Start</div>
        <div>Date End</div>
        <div>R/R</div>
        <div>Risk %</div>
        <div>Realized</div>
        <div>Held Time</div>
      </div>

      {/* Empty State */}
      <div className="relative py-8">
        {/* Faded Row Outlines */}
        <div className="space-y-2">
          {[0.2, 0.15, 0.12, 0.09, 0.06].map((opacity, rowIndex) => (
            <div
              key={rowIndex}
              className="grid grid-cols-8 gap-4 px-4 py-3 border border-border rounded-lg"
              style={{ opacity }}
            >
              {Array.from({ length: 8 }).map((_, cellIndex) => (
                <div
                  key={cellIndex}
                  className="h-4 bg-neutral-800 rounded"
                ></div>
              ))}
            </div>
          ))}
        </div>

        {/* Message Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Icon */}
          <div className="mb-4 opacity-30">
            <FileText className="w-12 h-12 text-primary" strokeWidth={1.5} />
          </div>

          {/* Primary Text */}
          <h3 className="text-foreground font-medium text-base mb-2">
            No trades recorded
          </h3>

          {/* Secondary Text */}
          <p className="text-muted-foreground text-sm">
            Sync Rewynd with FxReplay to see trade details.
          </p>
        </div>
      </div>
    </div>
  )
}

export default TradeHistoryPlaceholder
