import { Activity, CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Monitor } from "@shared/schema";

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

  const overallUptime = monitors.length > 0
    ? Math.round(
        monitors.reduce((acc, m) => acc + (m.uptimePercentage || 0), 0) / monitors.length
      )
    : 100;

  const stats = [
    {
      label: "Total Monitors",
      value: totalMonitors,
      icon: Activity,
      color: "text-primary",
      bgColor: "bg-primary/10",
      gradient: "from-primary/20 via-transparent to-transparent",
    },
    {
      label: "Online",
      value: upMonitors,
      icon: CheckCircle,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10",
      gradient: "from-emerald-500/20 via-transparent to-transparent",
    },
    {
      label: "Offline",
      value: downMonitors,
      icon: XCircle,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-500/10",
      gradient: "from-red-500/20 via-transparent to-transparent",
    },
    {
      label: "Avg Response",
      value: `${avgResponseTime}ms`,
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-500/10",
      gradient: "from-amber-500/20 via-transparent to-transparent",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="relative overflow-visible group">
          <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${stat.gradient} opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none`} />
          <CardContent className="p-4 md:p-6 relative">
            <div className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg ${stat.bgColor} transition-transform group-hover:scale-105`}>
                <stat.icon className={`h-5 w-5 md:h-6 md:w-6 ${stat.color}`} />
              </div>
              <div className="flex flex-col min-w-0">
                <span 
                  className="text-2xl md:text-3xl font-bold tabular-nums tracking-tight truncate"
                  data-testid={`stat-value-${stat.label.toLowerCase().replace(/\s/g, '-')}`}
                >
                  {stat.value}
                </span>
                <span className="text-xs uppercase tracking-wide text-muted-foreground truncate">
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
