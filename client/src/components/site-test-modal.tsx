import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Globe, Server, Clock, Shield, Check, X, Zap, Info, Wifi, Activity, Lock, Unlock, Gauge, Timer, FileArchive, RotateCcw, ShieldCheck, ShieldAlert } from "lucide-react";
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

interface SecurityHeaders {
  hasHSTS: boolean;
  hasCSP: boolean;
  hasXFrameOptions: boolean;
  hasXContentTypeOptions: boolean;
  hasXXSSProtection: boolean;
  hasReferrerPolicy: boolean;
  score: number;
}

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
  dnsTime: number | null;
  ttfb: number | null;
  isSecure: boolean;
  securityHeaders: SecurityHeaders;
  performanceScore: number;
  redirectCount: number;
  compression: string | null;
  cacheControl: string | null;
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
            <ScrollArea className="max-h-[500px]">
              <div className="space-y-4 pr-2">
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
                        <div className="font-bold text-lg flex items-center gap-2" data-testid="text-test-hostname">
                          {result.hostname}
                          {result.isSecure ? (
                            <Lock className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <Unlock className="h-4 w-4 text-amber-400" />
                          )}
                        </div>
                        <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                          {result.protocol.toUpperCase()}
                          {result.isSecure && <span className="text-emerald-400">Secure</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
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
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/30">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-background/50 border border-border/50">
                        <Gauge className="h-7 w-7 text-purple-400" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Performance Score</div>
                        <div className={cn(
                          "text-3xl font-black tabular-nums",
                          result.performanceScore >= 80 ? "text-emerald-400" :
                          result.performanceScore >= 50 ? "text-amber-400" : "text-red-400"
                        )} data-testid="text-performance-score">
                          {result.performanceScore}/100
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge className={cn(
                        "text-[9px]",
                        result.isSecure ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                      )}>
                        {result.isSecure ? "HTTPS" : "HTTP"}
                      </Badge>
                      {result.compression && (
                        <Badge className="bg-cyan-500/20 text-cyan-400 text-[9px]">
                          {result.compression.toUpperCase()}
                        </Badge>
                      )}
                      {result.redirectCount > 0 && (
                        <Badge className="bg-purple-500/20 text-purple-400 text-[9px]">
                          {result.redirectCount} Redirect{result.redirectCount > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-3 rounded-xl bg-background/30 border border-border/50 space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3 w-3 text-cyan-400" />
                      <span className="text-[9px] uppercase tracking-wider">Response</span>
                    </div>
                    <div className={cn("text-lg font-black tabular-nums", getResponseTimeColor(result.responseTime))} data-testid="text-response-time">
                      {result.responseTime !== null ? `${result.responseTime}ms` : "N/A"}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-background/30 border border-border/50 space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Timer className="h-3 w-3 text-emerald-400" />
                      <span className="text-[9px] uppercase tracking-wider">TTFB</span>
                    </div>
                    <div className="text-lg font-black tabular-nums text-emerald-400" data-testid="text-ttfb">
                      {result.ttfb !== null ? `${result.ttfb}ms` : "N/A"}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-background/30 border border-border/50 space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Globe className="h-3 w-3 text-purple-400" />
                      <span className="text-[9px] uppercase tracking-wider">DNS</span>
                    </div>
                    <div className="text-lg font-black tabular-nums text-purple-400" data-testid="text-dns-time">
                      {result.dnsTime !== null ? `${result.dnsTime}ms` : "N/A"}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-background/30 border border-border/50 space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Shield className="h-3 w-3 text-amber-400" />
                      <span className="text-[9px] uppercase tracking-wider">Status</span>
                    </div>
                    <div className="text-lg font-black tabular-nums text-amber-400" data-testid="text-status-code">
                      {result.statusCode ?? "N/A"}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-background/30 border border-border/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-cyan-400" />
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">Security Headers</span>
                    </div>
                    <Badge className={cn(
                      "font-bold",
                      result.securityHeaders.score >= 80 ? "bg-emerald-500/20 text-emerald-400" :
                      result.securityHeaders.score >= 50 ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"
                    )} data-testid="badge-security-score">
                      {result.securityHeaders.score}%
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-lg",
                      result.securityHeaders.hasHSTS ? "bg-emerald-500/10" : "bg-red-500/10"
                    )}>
                      {result.securityHeaders.hasHSTS ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <X className="h-3 w-3 text-red-400" />
                      )}
                      <span className="text-muted-foreground">HSTS</span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-lg",
                      result.securityHeaders.hasCSP ? "bg-emerald-500/10" : "bg-red-500/10"
                    )}>
                      {result.securityHeaders.hasCSP ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <X className="h-3 w-3 text-red-400" />
                      )}
                      <span className="text-muted-foreground">CSP</span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-lg",
                      result.securityHeaders.hasXFrameOptions ? "bg-emerald-500/10" : "bg-red-500/10"
                    )}>
                      {result.securityHeaders.hasXFrameOptions ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <X className="h-3 w-3 text-red-400" />
                      )}
                      <span className="text-muted-foreground">X-Frame</span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-lg",
                      result.securityHeaders.hasXContentTypeOptions ? "bg-emerald-500/10" : "bg-red-500/10"
                    )}>
                      {result.securityHeaders.hasXContentTypeOptions ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <X className="h-3 w-3 text-red-400" />
                      )}
                      <span className="text-muted-foreground">X-Content</span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-lg",
                      result.securityHeaders.hasXXSSProtection ? "bg-emerald-500/10" : "bg-red-500/10"
                    )}>
                      {result.securityHeaders.hasXXSSProtection ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <X className="h-3 w-3 text-red-400" />
                      )}
                      <span className="text-muted-foreground">XSS</span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-lg",
                      result.securityHeaders.hasReferrerPolicy ? "bg-emerald-500/10" : "bg-red-500/10"
                    )}>
                      {result.securityHeaders.hasReferrerPolicy ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <X className="h-3 w-3 text-red-400" />
                      )}
                      <span className="text-muted-foreground">Referrer</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-background/30 border border-border/50 space-y-3">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">Server Details</span>
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
                    <div className="flex justify-between gap-2 py-1.5 border-b border-border/30">
                      <span className="text-muted-foreground">Content Type</span>
                      <span className="font-mono truncate max-w-[200px]" data-testid="text-content-type">{result.contentType || "Unknown"}</span>
                    </div>
                    <div className="flex justify-between gap-2 py-1.5 border-b border-border/30">
                      <span className="text-muted-foreground">Compression</span>
                      <span className="font-mono text-purple-400" data-testid="text-compression">
                        {result.compression || "None"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2 py-1.5">
                      <span className="text-muted-foreground">Cache Control</span>
                      <span className="font-mono truncate max-w-[200px] text-amber-400" data-testid="text-cache">
                        {result.cacheControl || "Not set"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] uppercase tracking-wider text-muted-foreground text-center flex items-center justify-center gap-2">
                  <Activity className="h-3 w-3" />
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
