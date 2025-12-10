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
    <div className={cn("flex items-center gap-1", className)}>
      {filledResults.map((result, index) => {
        const getBarStyles = () => {
          if (!result) return "bg-muted/50";
          if (result.status === "up") return "bg-emerald-500 shadow-[0_0_8px_hsl(142_76%_50%/0.4)]";
          if (result.status === "down") return "bg-red-500 shadow-[0_0_8px_hsl(350_90%_55%/0.5)]";
          return "bg-purple-500 shadow-[0_0_8px_hsl(275_80%_60%/0.4)]";
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
              className={cn("w-2 h-8 rounded-sm transition-all", getBarStyles())}
              data-testid={`history-bar-empty-${index}`}
            />
          );
        }

        return (
          <Tooltip key={result.id || index}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "w-2 h-8 rounded-sm cursor-pointer transition-all duration-200 hover:scale-125 hover:z-10",
                  getBarStyles()
                )}
                data-testid={`history-bar-${index}`}
              />
            </TooltipTrigger>
            <TooltipContent className="glass border-cyan-500/30">
              <div className="text-sm space-y-1">
                <p className={cn(
                  "font-bold uppercase tracking-wide",
                  result.status === "up" ? "text-emerald-400" : 
                  result.status === "down" ? "text-red-400" : "text-purple-400"
                )}>
                  {result.status}
                </p>
                <p className="text-muted-foreground font-mono text-xs">{formatTime(result.timestamp)}</p>
                {result.responseTime && (
                  <p className="text-cyan-400 font-mono text-xs">{result.responseTime}ms</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
