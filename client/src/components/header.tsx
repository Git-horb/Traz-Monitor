import { Activity, Plus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

interface HeaderProps {
  onAddMonitor: () => void;
  onTestSite?: () => void;
}

export function Header({ onAddMonitor, onTestSite }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-cyan-500/20 glass-strong">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 glow-cyan">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span 
                className="text-lg font-bold tracking-widest uppercase text-glow-cyan text-cyan-400" 
                data-testid="text-brand-name"
              >
                Dx Monitor
              </span>
              <span className="text-[10px] uppercase tracking-wider text-cyan-500/60 hidden sm:block">
                Real-time Uptime Tracking
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {onTestSite && (
              <Button 
                variant="outline"
                onClick={onTestSite}
                className="gap-2 border-purple-500/30 text-purple-400 hover:border-purple-500/50"
                data-testid="button-test-site-header"
              >
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">Quick Test</span>
              </Button>
            )}
            <Button 
              onClick={onAddMonitor}
              className="gap-2 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-black font-semibold glow-cyan animate-float"
              data-testid="button-add-monitor-header"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Monitor</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
