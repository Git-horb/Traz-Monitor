import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Activity, Plus, Zap, Signal, Globe, Cpu, ChevronRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { MonitorGrid } from "@/components/monitor-grid";
import { AddMonitorModal } from "@/components/add-monitor-modal";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { SiteTestModal } from "@/components/site-test-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Monitor, PingResult, CreateMonitor } from "@shared/schema";

function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0d1117] to-[#0a0a0f]" />
      <div className="absolute inset-0 bg-grid-glow opacity-30" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
    </div>
  );
}

function CommandHeader({ 
  onAddMonitor, 
  onTestSite 
}: { 
  onAddMonitor: () => void; 
  onTestSite: () => void;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-cyan-500/10 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/20 rounded-xl blur-lg" />
              <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 shadow-lg shadow-cyan-500/25">
                <Signal className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span 
                className="text-xl font-black tracking-[0.2em] uppercase bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
                data-testid="text-brand-name"
              >
                DxMonitor
              </span>
              <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.3em] text-cyan-500/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                System Active
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            <div className="hidden sm:flex items-center gap-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={onTestSite}
                className="gap-2 border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:border-purple-500/50"
                data-testid="button-test-site-header"
              >
                <Zap className="h-4 w-4" />
                Quick Test
              </Button>
              <Button 
                onClick={onAddMonitor}
                size="sm"
                className="gap-2 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-black font-bold shadow-lg shadow-cyan-500/25"
                data-testid="button-add-monitor-header"
              >
                <Plus className="h-4 w-4" />
                New Monitor
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild className="sm:hidden">
                <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#0d1117]/95 backdrop-blur-xl border-cyan-500/20">
                <DropdownMenuItem onClick={onAddMonitor} data-testid="menu-item-add-monitor">
                  <Plus className="h-4 w-4 mr-2 text-cyan-400" />
                  New Monitor
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onTestSite} data-testid="menu-item-quick-test">
                  <Zap className="h-4 w-4 mr-2 text-purple-400" />
                  Quick Test
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

function LiveStats({ monitors }: { monitors: Monitor[] }) {
  const upCount = monitors.filter(m => m.status === "up").length;
  const downCount = monitors.filter(m => m.status === "down").length;
  const avgResponse = monitors.length > 0
    ? Math.round(
        monitors
          .filter(m => m.responseTime)
          .reduce((acc, m) => acc + (m.responseTime || 0), 0) /
        Math.max(monitors.filter(m => m.responseTime).length, 1)
      )
    : 0;

  const stats = [
    { 
      label: "Total", 
      value: monitors.length, 
      icon: Globe,
      color: "text-cyan-400",
      glow: "shadow-cyan-500/20",
      bg: "from-cyan-500/10 to-cyan-500/5",
      border: "border-cyan-500/20"
    },
    { 
      label: "Online", 
      value: upCount, 
      icon: Signal,
      color: "text-emerald-400",
      glow: "shadow-emerald-500/20",
      bg: "from-emerald-500/10 to-emerald-500/5",
      border: "border-emerald-500/20"
    },
    { 
      label: "Offline", 
      value: downCount, 
      icon: Activity,
      color: downCount > 0 ? "text-red-400" : "text-red-400/50",
      glow: downCount > 0 ? "shadow-red-500/30" : "",
      bg: downCount > 0 ? "from-red-500/15 to-red-500/5" : "from-red-500/5 to-red-500/2",
      border: downCount > 0 ? "border-red-500/40" : "border-red-500/10",
      pulse: downCount > 0
    },
    { 
      label: "Avg Speed", 
      value: `${avgResponse}ms`, 
      icon: Cpu,
      color: "text-purple-400",
      glow: "shadow-purple-500/20",
      bg: "from-purple-500/10 to-purple-500/5",
      border: "border-purple-500/20"
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={cn(
            "relative group rounded-xl border p-4 md:p-5 transition-all duration-300",
            "bg-gradient-to-br backdrop-blur-sm",
            stat.bg,
            stat.border,
            stat.glow && `shadow-lg ${stat.glow}`,
            stat.pulse && "animate-pulse"
          )}
          style={{ animationDelay: `${i * 100}ms` }}
          data-testid={`stat-card-${stat.label.toLowerCase().replace(' ', '-')}`}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {stat.label}
              </p>
              <p 
                className={cn(
                  "text-2xl md:text-3xl lg:text-4xl font-black tabular-nums tracking-tight",
                  stat.color
                )}
                data-testid={`stat-value-${stat.label.toLowerCase().replace(' ', '-')}`}
              >
                {stat.value}
              </p>
            </div>
            <div className={cn(
              "flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg",
              "bg-background/50 border border-border/50",
              "group-hover:scale-110 transition-transform duration-300"
            )}>
              <stat.icon className={cn("h-5 w-5 md:h-6 md:w-6", stat.color)} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FloatingActionButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 md:hidden z-40">
      <div className="relative">
        <div className="absolute inset-0 bg-cyan-500 rounded-full blur-xl opacity-40" />
        <Button
          size="lg"
          onClick={onClick}
          className="relative h-14 w-14 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-2xl shadow-cyan-500/30"
          data-testid="button-floating-add"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [editingMonitor, setEditingMonitor] = useState<Monitor | null>(null);
  const [deleteMonitorId, setDeleteMonitorId] = useState<string | null>(null);
  const [deleteMonitorName, setDeleteMonitorName] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data: monitors = [], isLoading: isLoadingMonitors } = useQuery<Monitor[]>({
    queryKey: ["/api/monitors"],
    refetchInterval: 30000,
  });

  const { data: allPingResults = {} } = useQuery<Record<string, PingResult[]>>({
    queryKey: ["/api/ping-results"],
    refetchInterval: 30000,
  });

  const createMonitorMutation = useMutation({
    mutationFn: async (data: CreateMonitor) => {
      const response = await apiRequest("POST", "/api/monitors", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create monitor");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/monitors"] });
      setIsAddModalOpen(false);
      toast({
        title: "Monitor Activated",
        description: "Your website is now being monitored.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create monitor",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMonitorMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CreateMonitor }) => {
      const response = await apiRequest("PATCH", `/api/monitors/${id}`, data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update monitor");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/monitors"] });
      setEditingMonitor(null);
      setIsAddModalOpen(false);
      toast({
        title: "Configuration Updated",
        description: "Monitor settings saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMonitorMutation = useMutation({
    mutationFn: async ({ id, password }: { id: string; password: string }) => {
      const response = await apiRequest("DELETE", `/api/monitors/${id}`, { password });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete monitor");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/monitors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ping-results"] });
      setDeleteMonitorId(null);
      setDeleteError(null);
      toast({
        title: "Monitor Removed",
        description: "The monitor and its history have been deleted.",
      });
    },
    onError: (error: Error) => {
      setDeleteError(error.message);
    },
  });

  const handleAddMonitor = () => {
    setEditingMonitor(null);
    setIsAddModalOpen(true);
  };

  const handleTestSite = () => {
    setIsTestModalOpen(true);
  };

  const handleEditMonitor = (monitor: Monitor) => {
    setEditingMonitor(monitor);
    setIsAddModalOpen(true);
  };

  const handleDeleteMonitor = (monitorId: string) => {
    const monitor = monitors.find(m => m.id === monitorId);
    if (monitor) {
      setDeleteMonitorName(monitor.name);
      setDeleteMonitorId(monitorId);
      setDeleteError(null);
    }
  };

  const handleSubmitMonitor = (data: CreateMonitor) => {
    if (editingMonitor) {
      updateMonitorMutation.mutate({ id: editingMonitor.id, data });
    } else {
      createMonitorMutation.mutate(data);
    }
  };

  const handleConfirmDelete = (password: string) => {
    if (deleteMonitorId) {
      setDeleteError(null);
      deleteMonitorMutation.mutate({ id: deleteMonitorId, password });
    }
  };

  const handleDeleteDialogChange = (open: boolean) => {
    if (!open) {
      setDeleteMonitorId(null);
      setDeleteError(null);
    }
  };

  useEffect(() => {
    if (!isAddModalOpen) {
      setEditingMonitor(null);
    }
  }, [isAddModalOpen]);

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      
      <div className="relative z-10">
        <CommandHeader onAddMonitor={handleAddMonitor} onTestSite={handleTestSite} />
        
        <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 
                className="text-2xl md:text-3xl font-black tracking-tight"
                data-testid="text-page-title"
              >
                Control Center
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                Real-time monitoring dashboard
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2 border border-border/50">
              <Activity className="h-3.5 w-3.5 text-cyan-500" />
              Auto-refresh: 30s
            </div>
          </div>

          <LiveStats monitors={monitors} />

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-cyan-500" />
                Active Monitors
              </h2>
              {monitors.length > 0 && (
                <span className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-md" data-testid="text-monitor-count">
                  {monitors.length} total
                </span>
              )}
            </div>
            <MonitorGrid
              monitors={monitors}
              pingResults={allPingResults}
              isLoading={isLoadingMonitors}
              onAddMonitor={handleAddMonitor}
              onEditMonitor={handleEditMonitor}
              onDeleteMonitor={handleDeleteMonitor}
            />
          </section>
        </main>
      </div>

      <FloatingActionButton onClick={handleAddMonitor} />

      <AddMonitorModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleSubmitMonitor}
        isPending={createMonitorMutation.isPending || updateMonitorMutation.isPending}
        editingMonitor={editingMonitor}
      />

      <DeleteConfirmDialog
        open={!!deleteMonitorId}
        onOpenChange={handleDeleteDialogChange}
        onConfirm={handleConfirmDelete}
        isPending={deleteMonitorMutation.isPending}
        monitorName={deleteMonitorName}
        error={deleteError}
      />

      <SiteTestModal
        open={isTestModalOpen}
        onOpenChange={setIsTestModalOpen}
      />
    </div>
  );
}
