import * as React from "react"
import { cn } from "@/lib/utils"

function ProgressBar({
  progress,
  height = 8,
  filledColor = "bg-primary",
  emptyColor = "bg-accent",
  className = ""
}) {
  return (
    <div
      className={cn("w-full rounded-full", emptyColor, className)}
      style={{ height }}
    >
      <div
        className={cn("rounded-full transition-all duration-300", filledColor)}
        style={{
          width: `${Math.max(0, Math.min(1, progress)) * 100}%`,
          height: "100%"
        }}
      />
    </div>
  )
}

export { ProgressBar }
