import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Globe, Server, Clock, Shield, Check, X, Zap, Info, Wifi, Activity } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

interface TestResult {
  status: "up" | "down";
  responseTime: number | null;
  statusCode: number | null;
  statusText: string | null;
  headers: Record<string, string>;
  serverInfo: string | null;
  contentType: string | null;
  ipAddress: string | null;
  hostname: string | null;
  protocol: string;
  testedAt: string;
}

interface SiteTestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SiteTestModal({ open, onOpenChange }: SiteTestModalProps) {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<TestResult | null>(null);

  const testMutation = useMutation({
    mutationFn: async (testUrl: string) => {
      const response = await apiRequest("POST", "/api/test-site", { url: testUrl });
      return response.json() as Promise<TestResult>;
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const handleTest = () => {
    if (url.trim()) {
      let testUrl = url.trim();
      if (!testUrl.startsWith("http://") && !testUrl.startsWith("https://")) {
        testUrl = "https://" + testUrl;
      }
      setUrl(testUrl);
      testMutation.mutate(testUrl);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setUrl("");
      setResult(null);
      testMutation.reset();
    }
    onOpenChange(newOpen);
  };

  const getResponseTimeColor = (time: number | null) => {
    if (time === null) return "text-muted-foreground";
    if (time < 200) return "text-emerald-400";
    if (time < 500) return "text-amber-400";
    return "text-red-400";
  };

  const getResponseTimeLabel = (time: number | null) => {
    if (time === null) return "N/A";
    if (time < 200) return "Excellent";
    if (time < 500) return "Good";
    if (time < 1000) return "Fair";
    return "Slow";
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] bg-[#0d1117]/95 backdrop-blur-xl border-purple-500/20 shadow-2xl shadow-purple-500/10">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30">
              <Zap className="h-5 w-5 text-purple-400" />
            </div>
            Quick Site Test
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Instantly analyze any endpoint without adding it to monitoring.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="test-url" className="sr-only">Website URL</Label>
              <Input
                id="test-url"
                placeholder="Enter URL (e.g., example.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleTest();
                }}
                className="bg-background/50 border-border/50 focus:border-purple-500/50 focus:ring-purple-500/20 font-mono text-sm"
                data-testid="input-test-url"
              />
            </div>
            <Button 
              onClick={handleTest} 
              disabled={testMutation.isPending || !url.trim()}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white font-bold px-6"
              data-testid="button-run-test"
            >
              {testMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Scan"
              )}
            </Button>
          </div>

          {testMutation.error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm" data-testid="text-test-error">
              {testMutation.error.message}
            </div>
          )}

          {result && (
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-4">
                <div className={cn(
                  "p-4 rounded-xl border",
                  result.status === "up" 
                    ? "bg-emerald-500/5 border-emerald-500/30" 
                    : "bg-red-500/5 border-red-500/30"
                )}>
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      {result.status === "up" ? (
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                          <Wifi className="h-6 w-6 text-emerald-400" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30">
                          <X className="h-6 w-6 text-red-400" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-lg" data-testid="text-test-hostname">{result.hostname}</div>
                        <div className="text-xs uppercase tracking-wider text-muted-foreground">{result.protocol.toUpperCase()}</div>
                      </div>
                    </div>
                    <Badge 
                      className={cn(
                        "px-4 py-1.5 font-bold text-xs uppercase tracking-wider",
                        result.status === "up" 
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" 
                          : "bg-red-500/20 text-red-400 border-red-500/40"
                      )}
                      data-testid="badge-test-status"
                    >
                      {result.status === "up" ? "Online" : "Offline"}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-background/30 border border-border/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Clock className="h-4 w-4 text-cyan-400" />
                      <span className="text-[10px] uppercase tracking-wider">Response Time</span>
                    </div>
                    <div className={cn("text-2xl font-black tabular-nums", getResponseTimeColor(result.responseTime))} data-testid="text-response-time">
                      {result.responseTime !== null ? `${result.responseTime}ms` : "N/A"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {getResponseTimeLabel(result.responseTime)}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-background/30 border border-border/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Shield className="h-4 w-4 text-purple-400" />
                      <span className="text-[10px] uppercase tracking-wider">Status Code</span>
                    </div>
                    <div className="text-2xl font-black tabular-nums" data-testid="text-status-code">
                      {result.statusCode ?? "N/A"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {result.statusText || "Unknown"}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-background/30 border border-border/50 space-y-3">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">Server Information</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between gap-2 py-1.5 border-b border-border/30">
                      <span className="text-muted-foreground">IP Address</span>
                      <span className="font-mono text-cyan-400/80" data-testid="text-ip-address">{result.ipAddress || "Unknown"}</span>
                    </div>
                    <div className="flex justify-between gap-2 py-1.5 border-b border-border/30">
                      <span className="text-muted-foreground">Server</span>
                      <span className="font-mono truncate max-w-[200px]" data-testid="text-server-info">{result.serverInfo || "Not disclosed"}</span>
                    </div>
                    <div className="flex justify-between gap-2 py-1.5">
                      <span className="text-muted-foreground">Content Type</span>
                      <span className="font-mono truncate max-w-[200px]" data-testid="text-content-type">{result.contentType || "Unknown"}</span>
                    </div>
                  </div>
                </div>

                {Object.keys(result.headers).length > 0 && (
                  <div className="p-4 rounded-xl bg-background/30 border border-border/50 space-y-3">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-purple-400" />
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">Response Headers</span>
                    </div>
                    <div className="space-y-1 text-xs max-h-[150px] overflow-auto font-mono">
                      {Object.entries(result.headers).slice(0, 10).map(([key, value]) => (
                        <div key={key} className="flex gap-2 py-1 border-b border-border/20">
                          <span className="text-purple-400/70 whitespace-nowrap">{key}:</span>
                          <span className="text-muted-foreground truncate">{value}</span>
                        </div>
                      ))}
                      {Object.keys(result.headers).length > 10 && (
                        <div className="text-muted-foreground pt-2">
                          +{Object.keys(result.headers).length - 10} more headers
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="text-[10px] uppercase tracking-wider text-muted-foreground text-center">
                  Scanned at {new Date(result.testedAt).toLocaleString()}
                </div>
              </div>
            </ScrollArea>
          )}

          {!result && !testMutation.isPending && (
            <div className="py-12 text-center">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-xl" />
                <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-background/50 border border-border/50 mx-auto mb-4">
                  <Activity className="h-8 w-8 text-purple-400/50" />
                </div>
              </div>
              <p className="text-muted-foreground text-sm">Enter a URL above to analyze the endpoint</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
