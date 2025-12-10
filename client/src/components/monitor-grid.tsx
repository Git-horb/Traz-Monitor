import { MonitorCard } from "@/components/monitor-card";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Monitor, PingResult } from "@shared/schema";

interface MonitorGridProps {
  monitors: Monitor[];
  pingResults: Record<string, PingResult[]>;
  isLoading: boolean;
  onAddMonitor: () => void;
  onEditMonitor: (monitor: Monitor) => void;
  onDeleteMonitor: (monitorId: string) => void;
}

function MonitorCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <Card 
      className="relative overflow-visible glass border-border/50 border-l-2 border-l-muted animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-32 bg-muted/50" />
              <Skeleton className="h-6 w-20 rounded-full bg-muted/50" />
            </div>
            <Skeleton className="h-4 w-48 bg-muted/30" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-4 w-16 bg-muted/30" />
              <Skeleton className="h-7 w-20 bg-muted/40" />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-full bg-muted/30" />
          <Skeleton className="h-2 w-full bg-muted/20" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-full bg-muted/30" />
          <div className="flex gap-1">
            {[...Array(24)].map((_, i) => (
              <Skeleton key={i} className="w-2 h-8 bg-muted/20" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MonitorGrid({
  monitors,
  pingResults,
  isLoading,
  onAddMonitor,
  onEditMonitor,
  onDeleteMonitor,
}: MonitorGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[0, 1, 2].map((i) => (
          <MonitorCardSkeleton key={i} delay={i * 100} />
        ))}
      </div>
    );
  }

  if (monitors.length === 0) {
    return <EmptyState onAddMonitor={onAddMonitor} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {monitors.map((monitor, index) => (
        <div 
          key={monitor.id}
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
        >
          <MonitorCard
            monitor={monitor}
            pingResults={pingResults[monitor.id] || []}
            onEdit={onEditMonitor}
            onDelete={onDeleteMonitor}
          />
        </div>
      ))}
    </div>
  );
}
