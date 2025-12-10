import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { PingResult } from "@shared/schema";

interface StatusHistoryProps {
  pingResults: PingResult[];
  className?: string;
}

export function StatusHistory({ pingResults, className }: StatusHistoryProps) {
  const last24Results = pingResults.slice(-24);
  
  const filledResults = [...Array(24 - last24Results.length).fill(null), ...last24Results];

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {filledResults.map((result, index) => {
        const getBarColor = () => {
          if (!result) return "bg-muted";
          if (result.status === "up") return "bg-emerald-500";
          if (result.status === "down") return "bg-red-500";
          return "bg-amber-500";
        };

        const formatTime = (timestamp: string) => {
          return new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
        };

        if (!result) {
          return (
            <div
              key={`empty-${index}`}
              className={cn("w-2 h-8 rounded-sm", getBarColor())}
              data-testid={`history-bar-empty-${index}`}
            />
          );
        }

        return (
          <Tooltip key={result.id || index}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "w-2 h-8 rounded-sm cursor-pointer transition-transform hover:scale-110",
                  getBarColor()
                )}
                data-testid={`history-bar-${index}`}
              />
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm">
                <p className="font-medium capitalize">{result.status}</p>
                <p className="text-muted-foreground">{formatTime(result.timestamp)}</p>
                {result.responseTime && (
                  <p className="text-muted-foreground">{result.responseTime}ms</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
