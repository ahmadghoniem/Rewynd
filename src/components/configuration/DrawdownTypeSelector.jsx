import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const DrawdownTypeSelector = ({ value, onChange }) => {
  return (
    <div className="flex gap-2 justify-center items-center">
      <Button
        variant={value === "static" ? "default" : "outline"}
        onClick={() => onChange("static")}
        className="flex-1 min-w-20 font-semibold px-0 capitalize p-1"
      >
        Static
      </Button>
      <div
        className={cn(
          "bg-input/30 flex flex-row items-center gap-1.5 rounded-lg border border-border h-9",
          (value === "trailing" || value === "trailing_scaling") && ""
        )}
      >
        <span className="text-sm font-semibold pl-2 select-none">Trailing</span>
        <div className="flex bg-input rounded-md m-0.5 relative">
          {/* Animated background slider */}
          <div
            className={cn(
              "absolute inset-0 bg-primary rounded-md transition-all duration-250 ease-in-out z-0",
              value === "trailing"
                ? "translate-x-0"
                : value === "trailing_scaling"
                  ? "translate-x-[calc(100%-1px)]"
                  : "translate-x-0 opacity-0"
            )}
            style={{ width: "calc(50% - 0.5px)" }}
          />
          <button
            onClick={() => onChange("trailing")}
            className="relative flex-1 py-1.5 px-3 rounded-md text-sm font-semibold transition-all duration-250 z-10 flex items-center justify-center"
          >
            <span
              className={cn(
                "transition-all duration-250",
                value === "trailing"
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Fixed
            </span>
          </button>
          <button
            onClick={() => onChange("trailing_scaling")}
            className="relative flex-1 py-1.5 px-3 rounded-md text-sm font-semibold transition-all duration-250 z-10 flex items-center justify-center"
          >
            <span
              className={cn(
                "transition-all duration-250",
                value === "trailing_scaling"
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Scaling
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default DrawdownTypeSelector
