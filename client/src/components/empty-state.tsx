import { Activity, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onAddMonitor: () => void;
}

export function EmptyState({ onAddMonitor }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
        <Activity className="h-10 w-10 text-primary" />
      </div>
      
      <h2 
        className="text-2xl font-semibold tracking-tight mb-2"
        data-testid="text-empty-title"
      >
        No monitors yet
      </h2>
      
      <p 
        className="text-muted-foreground max-w-sm mb-8"
        data-testid="text-empty-description"
      >
        Add your first website to start monitoring uptime and receive instant status updates.
      </p>
      
      <Button 
        size="lg" 
        onClick={onAddMonitor}
        className="gap-2"
        data-testid="button-add-first-monitor"
      >
        <Plus className="h-5 w-5" />
        Add Your First Monitor
      </Button>
    </div>
  );
}
