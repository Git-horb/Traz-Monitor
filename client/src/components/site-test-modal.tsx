import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Globe, Server, Clock, Shield, Check, X, Zap, Info } from "lucide-react";
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
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";

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
    if (time < 200) return "text-green-500";
    if (time < 500) return "text-yellow-500";
    return "text-red-500";
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Quick Site Test
          </DialogTitle>
          <DialogDescription>
            Test any website instantly without adding it to monitoring. See response time, hosting info, and more.
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
                data-testid="input-test-url"
              />
            </div>
            <Button 
              onClick={handleTest} 
              disabled={testMutation.isPending || !url.trim()}
              data-testid="button-run-test"
            >
              {testMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Test"
              )}
            </Button>
          </div>

          {testMutation.error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm" data-testid="text-test-error">
              {testMutation.error.message}
            </div>
          )}

          {result && (
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      {result.status === "up" ? (
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/10">
                          <Check className="h-5 w-5 text-green-500" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/10">
                          <X className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                      <div>
                        <div className="font-semibold" data-testid="text-test-hostname">{result.hostname}</div>
                        <div className="text-sm text-muted-foreground">{result.protocol.toUpperCase()}</div>
                      </div>
                    </div>
                    <Badge 
                      variant={result.status === "up" ? "default" : "destructive"}
                      className={result.status === "up" ? "bg-green-500" : ""}
                      data-testid="badge-test-status"
                    >
                      {result.status === "up" ? "Online" : "Offline"}
                    </Badge>
                  </div>
                </Card>

                <div className="grid grid-cols-2 gap-3">
                  <Card className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs uppercase tracking-wide">Response Time</span>
                    </div>
                    <div className={`text-2xl font-bold tabular-nums ${getResponseTimeColor(result.responseTime)}`} data-testid="text-response-time">
                      {result.responseTime !== null ? `${result.responseTime}ms` : "N/A"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {getResponseTimeLabel(result.responseTime)}
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Shield className="h-4 w-4" />
                      <span className="text-xs uppercase tracking-wide">Status Code</span>
                    </div>
                    <div className="text-2xl font-bold tabular-nums" data-testid="text-status-code">
                      {result.statusCode ?? "N/A"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {result.statusText || "Unknown"}
                    </div>
                  </Card>
                </div>

                <Card className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Server className="h-4 w-4" />
                    <span className="text-sm font-medium">Server Information</span>
                  </div>
                  <Separator />
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">IP Address</span>
                      <span className="font-mono" data-testid="text-ip-address">{result.ipAddress || "Unknown"}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Server</span>
                      <span className="font-mono truncate max-w-[200px]" data-testid="text-server-info">{result.serverInfo || "Not disclosed"}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Content Type</span>
                      <span className="font-mono truncate max-w-[200px]" data-testid="text-content-type">{result.contentType || "Unknown"}</span>
                    </div>
                  </div>
                </Card>

                {Object.keys(result.headers).length > 0 && (
                  <Card className="p-4 space-y-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Info className="h-4 w-4" />
                      <span className="text-sm font-medium">Response Headers</span>
                    </div>
                    <Separator />
                    <div className="grid gap-1 text-xs max-h-[150px] overflow-auto">
                      {Object.entries(result.headers).slice(0, 10).map(([key, value]) => (
                        <div key={key} className="flex gap-2">
                          <span className="text-muted-foreground font-mono whitespace-nowrap">{key}:</span>
                          <span className="font-mono truncate">{value}</span>
                        </div>
                      ))}
                      {Object.keys(result.headers).length > 10 && (
                        <div className="text-muted-foreground">
                          +{Object.keys(result.headers).length - 10} more headers
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                <div className="text-xs text-muted-foreground text-center">
                  Tested at {new Date(result.testedAt).toLocaleString()}
                </div>
              </div>
            </ScrollArea>
          )}

          {!result && !testMutation.isPending && (
            <div className="py-8 text-center text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Enter a URL above to test the site</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
