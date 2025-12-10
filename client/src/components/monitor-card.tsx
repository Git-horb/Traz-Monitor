import { ExternalLink, Clock, TrendingUp, Settings, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/status-badge";
import { StatusHistory } from "@/components/status-history";
import { cn } from "@/lib/utils";
import type { Monitor, PingResult } from "@shared/schema";
import { INTERVAL_OPTIONS } from "@shared/schema";

interface MonitorCardProps {
  monitor: Monitor;
  pingResults: PingResult[];
  onEdit: (monitor: Monitor) => void;
  onDelete: (monitorId: string) => void;
}

export function MonitorCard({ monitor, pingResults, onEdit, onDelete }: MonitorCardProps) {
  const getResponseTimeColor = (time: number | null | undefined) => {
    if (!time) return "text-muted-foreground";
    if (time < 200) return "text-emerald-600 dark:text-emerald-400";
    if (time < 500) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const getStatusBorderColor = () => {
    switch (monitor.status) {
      case "up":
        return "border-l-emerald-500";
      case "down":
        return "border-l-red-500";
      default:
        return "border-l-amber-500";
    }
  };

  const formatLastChecked = () => {
    if (!monitor.lastChecked) return "Never";
    const date = new Date(monitor.lastChecked);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const intervalLabel = INTERVAL_OPTIONS.find(opt => opt.value === monitor.interval)?.label || `Every ${monitor.interval} min`;

  return (
    <Card 
      className={cn(
        "relative overflow-visible border-l-4 transition-all duration-300",
        getStatusBorderColor()
      )}
      data-testid={`card-monitor-${monitor.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 
                className="text-lg font-semibold truncate"
                data-testid={`text-monitor-name-${monitor.id}`}
              >
                {monitor.name}
              </h3>
              <StatusBadge status={monitor.status} />
            </div>
            <a
              href={monitor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mt-1 truncate"
              data-testid={`link-monitor-url-${monitor.id}`}
            >
              <span className="truncate">{monitor.url}</span>
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </a>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(monitor)}
              data-testid={`button-edit-monitor-${monitor.id}`}
            >
              <Settings className="h-4 w-4" />
              <span className="sr-only">Edit monitor</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(monitor.id)}
              className="text-muted-foreground hover:text-destructive"
              data-testid={`button-delete-monitor-${monitor.id}`}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete monitor</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-xs uppercase tracking-wide">Response</span>
            </div>
            <p 
              className={cn("text-xl font-bold tabular-nums", getResponseTimeColor(monitor.responseTime))}
              data-testid={`text-response-time-${monitor.id}`}
            >
              {monitor.responseTime ? `${monitor.responseTime}ms` : "—"}
            </p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="text-xs uppercase tracking-wide">Uptime</span>
            </div>
            <p 
              className="text-xl font-bold tabular-nums"
              data-testid={`text-uptime-${monitor.id}`}
            >
              {monitor.uptimePercentage ?? 100}%
            </p>
          </div>
          
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Last Check</span>
            <p 
              className="text-sm font-medium"
              data-testid={`text-last-checked-${monitor.id}`}
            >
              {formatLastChecked()}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Uptime (24h)</span>
            <span className="font-medium">{monitor.uptimePercentage ?? 100}%</span>
          </div>
          <Progress 
            value={monitor.uptimePercentage ?? 100} 
            className="h-2"
            data-testid={`progress-uptime-${monitor.id}`}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Status History (24h)</span>
            <span>{intervalLabel}</span>
          </div>
          <StatusHistory pingResults={pingResults} />
        </div>
      </CardContent>
    </Card>
  );
}
