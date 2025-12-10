import { Activity, CheckCircle, XCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Monitor } from "@shared/schema";
import { cn } from "@/lib/utils";

interface StatsOverviewProps {
  monitors: Monitor[];
}

export function StatsOverview({ monitors }: StatsOverviewProps) {
  const totalMonitors = monitors.length;
  const upMonitors = monitors.filter(m => m.status === "up").length;
  const downMonitors = monitors.filter(m => m.status === "down").length;
  
  const avgResponseTime = monitors.length > 0
    ? Math.round(
        monitors
          .filter(m => m.responseTime !== null && m.responseTime !== undefined)
          .reduce((acc, m) => acc + (m.responseTime || 0), 0) /
        Math.max(monitors.filter(m => m.responseTime !== null).length, 1)
      )
    : 0;

  const stats = [
    {
      label: "Total Monitors",
      value: totalMonitors,
      icon: Activity,
      glowClass: "glow-cyan",
      textGlow: "text-glow-cyan",
      iconBg: "bg-cyan-500/20",
      iconColor: "text-cyan-400",
      borderColor: "border-cyan-500/30",
      valueColor: "text-cyan-400",
    },
    {
      label: "Online",
      value: upMonitors,
      icon: CheckCircle,
      glowClass: "glow-green",
      textGlow: "text-glow-green",
      iconBg: "bg-emerald-500/20",
      iconColor: "text-emerald-400",
      borderColor: "border-emerald-500/30",
      valueColor: "text-emerald-400",
    },
    {
      label: "Offline",
      value: downMonitors,
      icon: XCircle,
      glowClass: downMonitors > 0 ? "glow-red" : "",
      textGlow: downMonitors > 0 ? "text-glow-red" : "",
      iconBg: "bg-red-500/20",
      iconColor: "text-red-400",
      borderColor: downMonitors > 0 ? "border-red-500/50" : "border-red-500/20",
      valueColor: downMonitors > 0 ? "text-red-400" : "text-red-400/60",
    },
    {
      label: "Avg Response",
      value: `${avgResponseTime}ms`,
      icon: Clock,
      glowClass: "glow-amber",
      textGlow: "",
      iconBg: "bg-amber-500/20",
      iconColor: "text-amber-400",
      borderColor: "border-amber-500/30",
      valueColor: "text-amber-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card 
          key={stat.label} 
          className={cn(
            "relative overflow-visible glass border transition-all duration-300 group",
            stat.borderColor,
            stat.glowClass && "hover:scale-[1.02]"
          )}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-4 md:p-6 relative">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl transition-all duration-300",
                stat.iconBg,
                "group-hover:scale-110"
              )}>
                <stat.icon className={cn("h-6 w-6 md:h-7 md:w-7", stat.iconColor)} />
              </div>
              <div className="flex flex-col min-w-0">
                <span 
                  className={cn(
                    "text-3xl md:text-4xl font-bold tabular-nums tracking-tight truncate",
                    stat.valueColor,
                    stat.textGlow
                  )}
                  data-testid={`stat-value-${stat.label.toLowerCase().replace(/\s/g, '-')}`}
                >
                  {stat.value}
                </span>
                <span className="text-[10px] md:text-xs uppercase tracking-widest text-muted-foreground truncate">
                  {stat.label}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
