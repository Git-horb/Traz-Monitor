import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { 
  Loader2, Globe, Server, Clock, Shield, Check, X, Zap, Wifi, Activity, 
  Lock, Unlock, Gauge, Timer, Award, Network, Cpu, Database, Code2,
  ShieldCheck, Radio, Fingerprint, Calendar, TrendingUp, Box, Layers
} from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

interface SecurityHeaders {
  hasHSTS: boolean;
  hasCSP: boolean;
  hasXFrameOptions: boolean;
  hasXContentTypeOptions: boolean;
  hasXXSSProtection: boolean;
  hasReferrerPolicy: boolean;
  hasPermissionsPolicy: boolean;
  hasCORS: boolean;
  score: number;
}

interface SSLInfo {
  valid: boolean;
  issuer: string | null;
  subject: string | null;
  validFrom: string | null;
  validTo: string | null;
  daysUntilExpiry: number | null;
  protocol: string | null;
  cipher: string | null;
}

interface TechnologyStack {
  server: string | null;
  framework: string | null;
  cdn: string | null;
  cms: string | null;
  languages: string[];
}

interface TimingBreakdown {
  dns: number | null;
  connection: number | null;
  tls: number | null;
  ttfb: number | null;
  download: number | null;
  total: number | null;
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
  sslInfo: SSLInfo | null;
  techStack: TechnologyStack;
  timing: TimingBreakdown;
  contentLength: number | null;
  loadGrade: string;
  http2: boolean;
  geoLocation: string | null;
}

interface SiteTestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function GradeDisplay({ grade }: { grade: string }) {
  const getGradeStyle = () => {
    switch (grade) {
      case "A+": return "from-emerald-400 to-cyan-400 text-emerald-400 shadow-emerald-500/50";
      case "A": return "from-emerald-500 to-emerald-400 text-emerald-400 shadow-emerald-500/40";
      case "B": return "from-cyan-400 to-blue-400 text-cyan-400 shadow-cyan-500/40";
      case "C": return "from-amber-400 to-orange-400 text-amber-400 shadow-amber-500/40";
      case "D": return "from-orange-400 to-red-400 text-orange-400 shadow-orange-500/40";
      default: return "from-red-500 to-red-400 text-red-400 shadow-red-500/50";
    }
  };
  
  return (
    <div className={cn(
      "relative flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-2xl",
      "bg-gradient-to-br shadow-2xl",
      getGradeStyle()
    )}>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
      <span className="relative text-3xl md:text-4xl font-black text-white drop-shadow-lg">
        {grade}
      </span>
    </div>
  );
}

function TimingBar({ label, value, maxValue, color }: { label: string; value: number | null; maxValue: number; color: string }) {
  const percentage = value !== null ? Math.min((value / maxValue) * 100, 100) : 0;
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className={cn("font-mono font-bold tabular-nums", color)}>
          {value !== null ? `${value}ms` : "-"}
        </span>
      </div>
      <div className="h-2 bg-background/50 rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-1000", color.replace("text-", "bg-"))}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function SecurityCheck({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div className={cn(
      "flex items-center gap-2 p-2 rounded-lg text-xs transition-all",
      passed 
        ? "bg-emerald-500/10 border border-emerald-500/20" 
        : "bg-red-500/10 border border-red-500/20"
    )}>
      {passed ? (
        <Check className="h-3 w-3 text-emerald-400 flex-shrink-0" />
      ) : (
        <X className="h-3 w-3 text-red-400 flex-shrink-0" />
      )}
      <span className={cn(passed ? "text-emerald-400" : "text-red-400")}>{label}</span>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color, subValue }: { 
  icon: typeof Clock; 
  label: string; 
  value: string | number; 
  color: string;
  subValue?: string;
}) {
  return (
    <div className="p-3 md:p-4 rounded-xl bg-gradient-to-br from-background/60 to-background/30 border border-border/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("h-3.5 w-3.5", color)} />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
      <div className={cn("text-xl md:text-2xl font-black tabular-nums", color)}>
        {value}
      </div>
      {subValue && (
        <div className="text-[10px] text-muted-foreground mt-0.5">{subValue}</div>
      )}
    </div>
  );
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

  const formatBytes = (bytes: number | null) => {
    if (bytes === null) return "N/A";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const maxTiming = result?.timing?.total || 1000;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[95vw] max-w-[700px] max-h-[95vh] bg-[#0a0a0f]/98 backdrop-blur-2xl border-purple-500/20 shadow-2xl shadow-purple-500/10 p-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        
        <div className="relative p-4 md:p-6">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/30 rounded-xl blur-lg" />
                <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 shadow-lg">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Deep Site Analysis
                </span>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-normal">
                  Performance & Security Scanner
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Label htmlFor="test-url" className="sr-only">Website URL</Label>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Globe className="h-4 w-4" />
                </div>
                <Input
                  id="test-url"
                  placeholder="Enter domain or URL..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleTest();
                  }}
                  className="pl-10 bg-background/50 border-border/50 focus:border-purple-500/50 focus:ring-purple-500/20 font-mono text-sm h-11"
                  data-testid="input-test-url"
                />
              </div>
              <Button 
                onClick={handleTest} 
                disabled={testMutation.isPending || !url.trim()}
                className="h-11 px-6 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white font-bold shadow-lg shadow-purple-500/25"
                data-testid="button-run-test"
              >
                {testMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="hidden sm:inline">Scanning</span>
                  </>
                ) : (
                  <>
                    <Radio className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Analyze</span>
                    <span className="sm:hidden">Scan</span>
                  </>
                )}
              </Button>
            </div>

            {testMutation.error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm" data-testid="text-test-error">
                {testMutation.error.message}
              </div>
            )}

            {testMutation.isPending && (
              <div className="py-16 text-center space-y-4">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-2xl animate-pulse" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30 flex items-center justify-center">
                    <Radio className="h-10 w-10 text-purple-400 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-purple-400 uppercase tracking-widest">Initializing Deep Scan</p>
                  <p className="text-xs text-muted-foreground">Analyzing performance, security, and infrastructure...</p>
                </div>
                <Progress value={33} className="w-48 mx-auto h-1" />
              </div>
            )}

            {result && !testMutation.isPending && (
              <ScrollArea className="max-h-[60vh] md:max-h-[65vh]">
                <div className="space-y-4 pr-2">
                  <div className={cn(
                    "p-4 md:p-5 rounded-2xl border-2",
                    result.status === "up" 
                      ? "bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/30" 
                      : "bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/30"
                  )}>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-4">
                        <GradeDisplay grade={result.loadGrade} />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-lg md:text-xl" data-testid="text-test-hostname">
                              {result.hostname}
                            </span>
                            {result.isSecure ? (
                              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1">
                                <Lock className="h-3 w-3" />
                                Secure
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 gap-1">
                                <Unlock className="h-3 w-3" />
                                HTTP
                              </Badge>
                            )}
                            {result.http2 && (
                              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                                HTTP/2
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Network className="h-3 w-3" />
                              {result.ipAddress || "Unknown IP"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Activity className="h-3 w-3" />
                              {result.statusCode || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge 
                          className={cn(
                            "px-4 py-2 font-black text-sm uppercase tracking-wider",
                            result.status === "up" 
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" 
                              : "bg-red-500/20 text-red-400 border-red-500/40"
                          )}
                          data-testid="badge-test-status"
                        >
                          {result.status === "up" ? (
                            <><Wifi className="h-4 w-4 mr-1" /> Online</>
                          ) : (
                            <><X className="h-4 w-4 mr-1" /> Offline</>
                          )}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-cyan-500/5 border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Gauge className="h-4 w-4 text-purple-400" />
                      <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Performance Score</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "text-4xl md:text-5xl font-black tabular-nums",
                        result.performanceScore >= 80 ? "text-emerald-400" :
                        result.performanceScore >= 50 ? "text-amber-400" : "text-red-400"
                      )} data-testid="text-performance-score">
                        {result.performanceScore}
                      </div>
                      <div className="flex-1">
                        <Progress 
                          value={result.performanceScore} 
                          className="h-3"
                        />
                      </div>
                      <span className="text-lg text-muted-foreground">/100</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                    <MetricCard 
                      icon={Clock} 
                      label="Response" 
                      value={result.responseTime !== null ? `${result.responseTime}ms` : "N/A"} 
                      color={result.responseTime && result.responseTime < 500 ? "text-emerald-400" : "text-amber-400"}
                    />
                    <MetricCard 
                      icon={Timer} 
                      label="TTFB" 
                      value={result.ttfb !== null ? `${result.ttfb}ms` : "N/A"} 
                      color="text-cyan-400"
                      subValue="Time to First Byte"
                    />
                    <MetricCard 
                      icon={Globe} 
                      label="DNS" 
                      value={result.dnsTime !== null ? `${result.dnsTime}ms` : "N/A"} 
                      color="text-purple-400"
                      subValue="Resolution Time"
                    />
                    <MetricCard 
                      icon={Box} 
                      label="Size" 
                      value={formatBytes(result.contentLength)} 
                      color="text-amber-400"
                      subValue="Transfer Size"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-background/60 to-background/30 border border-border/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-cyan-400" />
                        <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Request Waterfall</span>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
                        Total: {result.timing.total || 0}ms
                      </span>
                    </div>
                    <div className="space-y-2">
                      <TimingBar label="DNS Lookup" value={result.timing.dns} maxValue={maxTiming} color="text-purple-400" />
                      <TimingBar label="TLS Handshake" value={result.timing.tls} maxValue={maxTiming} color="text-cyan-400" />
                      <TimingBar label="Time to First Byte" value={result.timing.ttfb} maxValue={maxTiming} color="text-emerald-400" />
                      <TimingBar label="Content Download" value={result.timing.download} maxValue={maxTiming} color="text-amber-400" />
                    </div>
                  </div>

                  {result.sslInfo && (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/5 to-transparent border border-emerald-500/20 space-y-3">
                      <div className="flex items-center gap-2">
                        <Fingerprint className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">SSL Certificate</span>
                        {result.sslInfo.valid && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                            Valid
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-xs text-muted-foreground block">Issuer</span>
                          <span className="font-mono text-emerald-400">{result.sslInfo.issuer || "Unknown"}</span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block">Protocol</span>
                          <span className="font-mono text-cyan-400">{result.sslInfo.protocol || "Unknown"}</span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block">Cipher</span>
                          <span className="font-mono text-purple-400 text-xs">{result.sslInfo.cipher || "Unknown"}</span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Expires In
                          </span>
                          <span className={cn(
                            "font-mono font-bold",
                            result.sslInfo.daysUntilExpiry && result.sslInfo.daysUntilExpiry > 30 
                              ? "text-emerald-400" 
                              : "text-amber-400"
                          )}>
                            {result.sslInfo.daysUntilExpiry !== null ? `${result.sslInfo.daysUntilExpiry} days` : "Unknown"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-gradient-to-br from-background/60 to-background/30 border border-border/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-cyan-400" />
                        <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Security Headers</span>
                      </div>
                      <Badge className={cn(
                        "font-bold",
                        result.securityHeaders.score >= 80 ? "bg-emerald-500/20 text-emerald-400" :
                        result.securityHeaders.score >= 50 ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"
                      )} data-testid="badge-security-score">
                        {result.securityHeaders.score}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <SecurityCheck label="HSTS" passed={result.securityHeaders.hasHSTS} />
                      <SecurityCheck label="CSP" passed={result.securityHeaders.hasCSP} />
                      <SecurityCheck label="X-Frame" passed={result.securityHeaders.hasXFrameOptions} />
                      <SecurityCheck label="XSS" passed={result.securityHeaders.hasXXSSProtection} />
                      <SecurityCheck label="Content-Type" passed={result.securityHeaders.hasXContentTypeOptions} />
                      <SecurityCheck label="Referrer" passed={result.securityHeaders.hasReferrerPolicy} />
                      <SecurityCheck label="Permissions" passed={result.securityHeaders.hasPermissionsPolicy} />
                      <SecurityCheck label="CORS" passed={result.securityHeaders.hasCORS} />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-background/60 to-background/30 border border-border/50 space-y-3">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-purple-400" />
                      <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Technology Stack</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.techStack.server && (
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 gap-1">
                          <Server className="h-3 w-3" />
                          {result.techStack.server}
                        </Badge>
                      )}
                      {result.techStack.framework && (
                        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 gap-1">
                          <Code2 className="h-3 w-3" />
                          {result.techStack.framework}
                        </Badge>
                      )}
                      {result.techStack.cdn && (
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 gap-1">
                          <Globe className="h-3 w-3" />
                          {result.techStack.cdn}
                        </Badge>
                      )}
                      {result.techStack.cms && (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1">
                          <Database className="h-3 w-3" />
                          {result.techStack.cms}
                        </Badge>
                      )}
                      {result.techStack.languages.map((lang, i) => (
                        <Badge key={i} className="bg-background/50 text-muted-foreground border-border/50 gap-1">
                          <Cpu className="h-3 w-3" />
                          {lang}
                        </Badge>
                      ))}
                      {result.compression && (
                        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                          {result.compression.toUpperCase()}
                        </Badge>
                      )}
                      {!result.techStack.server && !result.techStack.framework && !result.techStack.cdn && !result.techStack.cms && result.techStack.languages.length === 0 && (
                        <span className="text-xs text-muted-foreground">No technology signatures detected</span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-background/60 to-background/30 border border-border/50 space-y-3">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-cyan-400" />
                      <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Server Details</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Content-Type</span>
                        <p className="font-mono text-xs truncate" data-testid="text-content-type">
                          {result.contentType || "Unknown"}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Cache Control</span>
                        <p className="font-mono text-xs truncate text-amber-400" data-testid="text-cache">
                          {result.cacheControl || "Not set"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground text-center flex items-center justify-center gap-2 py-2">
                    <Activity className="h-3 w-3" />
                    Scanned at {new Date(result.testedAt).toLocaleString()}
                  </div>
                </div>
              </ScrollArea>
            )}

            {!result && !testMutation.isPending && (
              <div className="py-16 text-center">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-2xl" />
                  <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20 mx-auto mb-4">
                    <Radio className="h-10 w-10 text-purple-400/40" />
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">Enter a URL above to run a deep analysis</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Checks performance, security, SSL, and technology stack</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
