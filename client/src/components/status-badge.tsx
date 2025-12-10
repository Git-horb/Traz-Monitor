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
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 glow-green";
      case "down":
        return "bg-red-500/20 text-red-400 border-red-500/40 glow-red animate-pulse";
      case "checking":
        return "bg-purple-500/20 text-purple-400 border-purple-500/40 glow-purple animate-pulse";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case "up":
        return "ONLINE";
      case "down":
        return "OFFLINE";
      case "checking":
        return "CHECKING";
      default:
        return "UNKNOWN";
    }
  };

  const getDot = () => {
    switch (status) {
      case "up":
        return "bg-emerald-400";
      case "down":
        return "bg-red-400";
      case "checking":
        return "bg-purple-400";
      default:
        return "bg-muted-foreground";
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border gap-1.5 no-default-hover-elevate no-default-active-elevate",
        getStatusStyles(),
        className
      )}
      data-testid={`badge-status-${status}`}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", getDot())} />
      {getStatusLabel()}
    </Badge>
  );
}
