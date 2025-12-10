import { Activity, Plus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

interface HeaderProps {
  onAddMonitor: () => void;
  onTestSite?: () => void;
}

export function Header({ onAddMonitor, onTestSite }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground">
              <Activity className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold tracking-tight" data-testid="text-brand-name">
                Dx Monitor
              </span>
              <span className="text-xs text-muted-foreground hidden sm:block">
                Uptime Monitoring
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {onTestSite && (
              <Button 
                variant="outline"
                onClick={onTestSite}
                className="gap-2"
                data-testid="button-test-site-header"
              >
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">Quick Test</span>
              </Button>
            )}
            <Button 
              onClick={onAddMonitor}
              className="gap-2"
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
