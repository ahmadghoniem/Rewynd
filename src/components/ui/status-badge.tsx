import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "funded" | "in-progress" | "failed" | "syncing";
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "sync":
        return {
          label: "Sync",
          variant: "secondary" as const,
          dotColor: "bg-violet-500",
          className:
            "bg-violet-100 text-violet-800 dark:bg-violet-900/20 dark:text-violet-400",
        };
      case "funded":
        return {
          label: "Funded",
          variant: "buy" as const,
          dotColor: "bg-success",
          className: "bg-accent-success text-accent-success-foreground",
        };
      case "in-progress":
        return {
          label: "In Progress",
          variant: "secondary" as const,
          dotColor: "bg-yellow-500",
          className:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
        };
      case "failed":
        return {
          label: "Failed",
          variant: "sell" as const,
          dotColor: "bg-danger",
          className: "bg-accent-danger text-accent-danger-foreground",
        };

      default:
        return {
          label: "Unknown",
          variant: "secondary" as const,
          dotColor: "bg-gray-500",
          className:
            "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 text-xs font-medium",
        config.className,
        className
      )}
    >
      <div className={cn("w-2 h-2 rounded-full", config.dotColor)} />
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
