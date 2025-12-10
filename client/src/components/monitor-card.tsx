import { useState } from "react";
import { ExternalLink, Clock, TrendingUp, Settings, Trash2, Wifi, WifiOff, Radio, ChevronDown, ChevronUp, BarChart3, History, Gauge, Zap } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { StatusHistory } from "@/components/status-history";
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { Monitor, PingResult } from "@shared/schema";
import { INTERVAL_OPTIONS } from "@shared/schema";

interface MonitorCardProps {
  monitor: Monitor;
  pingResults: PingResult[];
  onEdit: (monitor: Monitor) => void;
  onDelete: (monitorId: string) => void;
}

export function MonitorCard({ monitor, pingResults, onEdit, onDelete }: MonitorCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
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

  const chartData = pingResults.slice(-30).map((result) => ({
    time: new Date(result.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    responseTime: result.responseTime ?? 0,
    status: result.status,
  }));

  const getMetrics = () => {
    if (pingResults.length === 0) {
      return { avg: 0, min: 0, max: 0, fastest: null, slowest: null };
    }
    const validResults = pingResults.filter(r => r.responseTime !== null);
    if (validResults.length === 0) {
      return { avg: 0, min: 0, max: 0, fastest: null, slowest: null };
    }
    const times = validResults.map(r => r.responseTime!);
    const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    const min = Math.min(...times);
    const max = Math.max(...times);
    const fastest = validResults.find(r => r.responseTime === min);
    const slowest = validResults.find(r => r.responseTime === max);
    return { avg, min, max, fastest, slowest };
  };

  const metrics = getMetrics();

  const recentHistory = pingResults.slice(-10).reverse();

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

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-xs text-muted-foreground gap-2"
          data-testid={`button-expand-monitor-${monitor.id}`}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              Show Details
            </>
          )}
        </Button>

        {isExpanded && (
          <div className="space-y-4 pt-2 border-t border-border/30">
            {chartData.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                  <BarChart3 className="h-3 w-3 text-cyan-400" />
                  <span>Response Time Graph</span>
                </div>
                <div className="h-32 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                      <defs>
                        <linearGradient id={`gradient-${monitor.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="time" 
                        tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                        tickLine={false}
                        axisLine={false}
                        width={35}
                        tickFormatter={(v) => `${v}ms`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '11px'
                        }}
                        formatter={(value: number) => [`${value}ms`, 'Response']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="responseTime" 
                        stroke="hsl(var(--chart-1))" 
                        strokeWidth={2}
                        fill={`url(#gradient-${monitor.id})`}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30 space-y-1">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Gauge className="h-3 w-3 text-cyan-400" />
                  <span className="text-[9px] uppercase tracking-wider">Avg</span>
                </div>
                <p className="text-lg font-bold tabular-nums font-mono text-cyan-400" data-testid={`text-avg-time-${monitor.id}`}>
                  {metrics.avg}ms
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30 space-y-1">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Zap className="h-3 w-3 text-emerald-400" />
                  <span className="text-[9px] uppercase tracking-wider">Fastest</span>
                </div>
                <p className="text-lg font-bold tabular-nums font-mono text-emerald-400" data-testid={`text-min-time-${monitor.id}`}>
                  {metrics.min}ms
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30 space-y-1">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3 text-amber-400" />
                  <span className="text-[9px] uppercase tracking-wider">Slowest</span>
                </div>
                <p className="text-lg font-bold tabular-nums font-mono text-amber-400" data-testid={`text-max-time-${monitor.id}`}>
                  {metrics.max}ms
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30 space-y-1">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <History className="h-3 w-3 text-purple-400" />
                  <span className="text-[9px] uppercase tracking-wider">Checks</span>
                </div>
                <p className="text-lg font-bold tabular-nums font-mono text-purple-400" data-testid={`text-total-checks-${monitor.id}`}>
                  {monitor.totalChecks || 0}
                </p>
              </div>
            </div>

            {recentHistory.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                  <History className="h-3 w-3 text-purple-400" />
                  <span>Recent Responses</span>
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {recentHistory.map((result, index) => (
                    <div 
                      key={result.id || index}
                      className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/10 border border-border/20"
                      data-testid={`history-row-${result.id || index}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "w-2 h-2 rounded-full",
                          result.status === "up" ? "bg-emerald-500" : "bg-red-500"
                        )} />
                        <span className="text-muted-foreground font-mono">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "font-mono font-bold",
                          result.responseTime && result.responseTime < 200 ? "text-emerald-400" :
                          result.responseTime && result.responseTime < 500 ? "text-amber-400" : "text-red-400"
                        )}>
                          {result.responseTime ? `${result.responseTime}ms` : "---"}
                        </span>
                        <span className={cn(
                          "uppercase text-[9px] font-bold tracking-wider",
                          result.status === "up" ? "text-emerald-400" : "text-red-400"
                        )}>
                          {result.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
