import { ExternalLink, Clock, TrendingUp, Settings, Trash2, Wifi, WifiOff, Radio } from "lucide-react";
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
    if (time < 200) return "text-emerald-400 text-glow-green";
    if (time < 500) return "text-amber-400";
    return "text-red-400 text-glow-red";
  };

  const getStatusBorder = () => {
    switch (monitor.status) {
      case "up":
        return "border-l-emerald-500 border-l-2";
      case "down":
        return "border-l-red-500 border-l-2";
      default:
        return "border-l-purple-500 border-l-2";
    }
  };

  const getCardGlow = () => {
    switch (monitor.status) {
      case "up":
        return "hover:shadow-[0_0_30px_hsl(142_76%_50%/0.15)]";
      case "down":
        return "shadow-[0_0_30px_hsl(350_90%_55%/0.2)] hover:shadow-[0_0_40px_hsl(350_90%_55%/0.25)]";
      default:
        return "hover:shadow-[0_0_30px_hsl(275_80%_60%/0.15)]";
    }
  };

  const getStatusIcon = () => {
    switch (monitor.status) {
      case "up":
        return <Wifi className="h-4 w-4 text-emerald-400" />;
      case "down":
        return <WifiOff className="h-4 w-4 text-red-400 animate-pulse" />;
      default:
        return <Radio className="h-4 w-4 text-purple-400 animate-pulse" />;
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
        "relative overflow-visible transition-all duration-300 group glass",
        "border-border/50",
        getStatusBorder(),
        getCardGlow(),
        "hover:translate-y-[-4px]"
      )}
      data-testid={`card-monitor-${monitor.id}`}
    >
      <CardHeader className="pb-3 relative">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <h3 
                  className="text-lg font-bold tracking-tight truncate"
                  data-testid={`text-monitor-name-${monitor.id}`}
                >
                  {monitor.name}
                </h3>
              </div>
              <StatusBadge status={monitor.status} />
            </div>
            <a
              href={monitor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-cyan-500/70 hover:text-cyan-400 transition-colors mt-1 truncate font-mono"
              data-testid={`link-monitor-url-${monitor.id}`}
            >
              <span className="truncate">{monitor.url}</span>
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </a>
          </div>
          <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(monitor)}
              className="text-cyan-400/70 hover:text-cyan-400"
              data-testid={`button-edit-monitor-${monitor.id}`}
            >
              <Settings className="h-4 w-4" />
              <span className="sr-only">Edit monitor</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(monitor.id)}
              className="text-muted-foreground hover:text-red-400"
              data-testid={`button-delete-monitor-${monitor.id}`}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete monitor</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 relative">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-[10px] uppercase tracking-widest">Response</span>
            </div>
            <p 
              className={cn("text-xl font-bold tabular-nums font-mono", getResponseTimeColor(monitor.responseTime))}
              data-testid={`text-response-time-${monitor.id}`}
            >
              {monitor.responseTime ? `${monitor.responseTime}ms` : "---"}
            </p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="text-[10px] uppercase tracking-widest">Uptime</span>
            </div>
            <p 
              className={cn(
                "text-xl font-bold tabular-nums font-mono",
                (monitor.uptimePercentage ?? 100) >= 99 ? "text-emerald-400" :
                (monitor.uptimePercentage ?? 100) >= 95 ? "text-amber-400" : "text-red-400"
              )}
              data-testid={`text-uptime-${monitor.id}`}
            >
              {monitor.uptimePercentage ?? 100}%
            </p>
          </div>
          
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Last Check</span>
            <p 
              className="text-sm font-medium text-cyan-400/80 font-mono"
              data-testid={`text-last-checked-${monitor.id}`}
            >
              {formatLastChecked()}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
            <span>Uptime (24h)</span>
            <span className="font-bold text-foreground">{monitor.uptimePercentage ?? 100}%</span>
          </div>
          <div className="relative h-2 rounded-full bg-muted/30 overflow-hidden">
            <div 
              className={cn(
                "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                (monitor.uptimePercentage ?? 100) >= 99 ? "bg-gradient-to-r from-emerald-600 to-emerald-400" :
                (monitor.uptimePercentage ?? 100) >= 95 ? "bg-gradient-to-r from-amber-600 to-amber-400" : 
                "bg-gradient-to-r from-red-600 to-red-400"
              )}
              style={{ width: `${monitor.uptimePercentage ?? 100}%` }}
              data-testid={`progress-uptime-${monitor.id}`}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
            <span>Status History (24h)</span>
            <span className="text-purple-400">{intervalLabel}</span>
          </div>
          <StatusHistory pingResults={pingResults} />
        </div>
      </CardContent>
    </Card>
  );
}
