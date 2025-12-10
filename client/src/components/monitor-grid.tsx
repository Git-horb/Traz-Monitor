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

function MonitorCardSkeleton() {
  return (
    <Card className="relative overflow-visible border-l-4 border-l-muted">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-7 w-20" />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-2 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <div className="flex gap-0.5">
            {[...Array(24)].map((_, i) => (
              <Skeleton key={i} className="w-2 h-8" />
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
        {[1, 2, 3].map((i) => (
          <MonitorCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (monitors.length === 0) {
    return <EmptyState onAddMonitor={onAddMonitor} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {monitors.map((monitor) => (
        <MonitorCard
          key={monitor.id}
          monitor={monitor}
          pingResults={pingResults[monitor.id] || []}
          onEdit={onEditMonitor}
          onDelete={onDeleteMonitor}
        />
      ))}
    </div>
  );
}
