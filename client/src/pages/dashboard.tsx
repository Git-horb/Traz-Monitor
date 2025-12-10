import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { StatsOverview } from "@/components/stats-overview";
import { MonitorGrid } from "@/components/monitor-grid";
import { AddMonitorModal } from "@/components/add-monitor-modal";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { SiteTestModal } from "@/components/site-test-modal";
import { FloatingAddButton } from "@/components/floating-add-button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Monitor, PingResult, CreateMonitor, UpdateMonitor } from "@shared/schema";

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
        title: "Monitor created",
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
    mutationFn: async ({ id, data }: { id: string; data: UpdateMonitor }) => {
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
        title: "Monitor updated",
        description: "Your monitor settings have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update monitor",
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
        title: "Monitor deleted",
        description: "The monitor and its history have been removed.",
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

  const handleSubmitMonitor = (data: CreateMonitor | UpdateMonitor) => {
    if (editingMonitor) {
      updateMonitorMutation.mutate({ id: editingMonitor.id, data: data as UpdateMonitor });
    } else {
      createMonitorMutation.mutate(data as CreateMonitor);
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
    <div className="min-h-screen bg-background">
      <Header onAddMonitor={handleAddMonitor} onTestSite={handleTestSite} />
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8">
        <div className="space-y-2">
          <h1 
            className="text-2xl md:text-3xl font-bold tracking-tight"
            data-testid="text-page-title"
          >
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor your websites and services in real-time
          </p>
        </div>

        <StatsOverview monitors={monitors} />

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Your Monitors</h2>
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

      <FloatingAddButton onClick={handleAddMonitor} />

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
