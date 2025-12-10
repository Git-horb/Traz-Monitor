import { Signal, Plus, Zap, Shield, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onAddMonitor: () => void;
}

export function EmptyState({ onAddMonitor }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 md:py-24 px-4 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl blur-2xl" />
        <div className="relative flex items-center justify-center w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-600/10 border border-cyan-500/30 shadow-2xl shadow-cyan-500/20">
          <Signal className="h-12 w-12 md:h-14 md:w-14 text-cyan-400" />
        </div>
      </div>
      
      <h2 
        className="text-2xl md:text-3xl font-black tracking-tight uppercase mb-3 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
        data-testid="text-empty-title"
      >
        No Active Monitors
      </h2>
      
      <p 
        className="text-muted-foreground max-w-md mb-10 text-sm md:text-base leading-relaxed"
        data-testid="text-empty-description"
      >
        Start tracking your websites and APIs in real-time. Get instant visibility into uptime, response times, and availability.
      </p>
      
      <Button 
        size="lg" 
        onClick={onAddMonitor}
        className="gap-2 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-black font-bold text-base px-8 shadow-xl shadow-cyan-500/25 transition-all duration-300 hover:scale-105"
        data-testid="button-add-first-monitor"
      >
        <Plus className="h-5 w-5" />
        Add Your First Monitor
      </Button>
      
      <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-10 max-w-2xl">
        <div className="flex flex-col items-center space-y-3 p-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <Zap className="h-6 w-6 text-emerald-400" />
          </div>
          <div className="space-y-1 text-center">
            <p className="text-sm font-semibold">Instant Checks</p>
            <p className="text-xs text-muted-foreground">1-60 minute intervals</p>
          </div>
        </div>
        <div className="flex flex-col items-center space-y-3 p-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <Activity className="h-6 w-6 text-purple-400" />
          </div>
          <div className="space-y-1 text-center">
            <p className="text-sm font-semibold">24/7 Monitoring</p>
            <p className="text-xs text-muted-foreground">Always watching</p>
          </div>
        </div>
        <div className="flex flex-col items-center space-y-3 p-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <Shield className="h-6 w-6 text-cyan-400" />
          </div>
          <div className="space-y-1 text-center">
            <p className="text-sm font-semibold">Status History</p>
            <p className="text-xs text-muted-foreground">Track performance</p>
          </div>
        </div>
      </div>
    </div>
  );
}
