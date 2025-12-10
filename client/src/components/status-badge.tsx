import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case "up":
        return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
      case "down":
        return "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20";
      case "checking":
        return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20 animate-pulse";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case "up":
        return "UP";
      case "down":
        return "DOWN";
      case "checking":
        return "CHECKING";
      default:
        return "UNKNOWN";
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-semibold text-xs uppercase tracking-wide px-3 py-1 rounded-full border no-default-hover-elevate no-default-active-elevate",
        getStatusStyles(),
        className
      )}
      data-testid={`badge-status-${status}`}
    >
      {getStatusLabel()}
    </Badge>
  );
}
