import { storage } from "./storage";
import dns from "dns";
import { promisify } from "util";

const dnsLookup = promisify(dns.lookup);

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

async function pingUrl(url: string): Promise<{ status: "up" | "down"; responseTime: number | null }> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: {
        "User-Agent": "DxMonitor/1.0 (Uptime Monitoring)",
      },
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    if (response.ok || response.status < 400) {
      return { status: "up", responseTime };
    }

    const getResponse = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(30000),
      headers: {
        "User-Agent": "DxMonitor/1.0 (Uptime Monitoring)",
      },
    });

    const getResponseTime = Date.now() - startTime;

    if (getResponse.ok || getResponse.status < 400) {
      return { status: "up", responseTime: getResponseTime };
    }

    return { status: "down", responseTime: getResponseTime };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return { status: "down", responseTime: responseTime < 30000 ? responseTime : null };
  }
}

function analyzeSecurityHeaders(headers: Record<string, string>): SecurityHeaders {
  const hasHSTS = !!headers["strict-transport-security"];
  const hasCSP = !!headers["content-security-policy"];
  const hasXFrameOptions = !!headers["x-frame-options"];
  const hasXContentTypeOptions = !!headers["x-content-type-options"];
  const hasXXSSProtection = !!headers["x-xss-protection"];
  const hasReferrerPolicy = !!headers["referrer-policy"];
  
  const checks = [hasHSTS, hasCSP, hasXFrameOptions, hasXContentTypeOptions, hasXXSSProtection, hasReferrerPolicy];
  const score = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  
  return {
    hasHSTS,
    hasCSP,
    hasXFrameOptions,
    hasXContentTypeOptions,
    hasXXSSProtection,
    hasReferrerPolicy,
    score,
  };
}

function calculatePerformanceScore(responseTime: number | null, isSecure: boolean, hasCompression: boolean, securityScore: number): number {
  let score = 100;
  
  if (responseTime) {
    if (responseTime > 3000) score -= 40;
    else if (responseTime > 1000) score -= 25;
    else if (responseTime > 500) score -= 10;
    else if (responseTime > 200) score -= 5;
  } else {
    score -= 50;
  }
  
  if (!isSecure) score -= 20;
  if (!hasCompression) score -= 10;
  
  score += Math.round(securityScore * 0.2);
  
  return Math.max(0, Math.min(100, score));
}

export async function testUrl(url: string): Promise<TestResult> {
  const startTime = Date.now();
  const parsedUrl = new URL(url);
  const isSecure = parsedUrl.protocol === "https:";
  
  let ipAddress: string | null = null;
  let dnsTime: number | null = null;
  
  try {
    const dnsStart = Date.now();
    const { address } = await dnsLookup(parsedUrl.hostname);
    dnsTime = Date.now() - dnsStart;
    ipAddress = address;
  } catch {
    ipAddress = null;
    dnsTime = null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const fetchStart = Date.now();
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "DxMonitor/1.0 (Site Testing)",
        "Accept-Encoding": "gzip, deflate, br",
      },
    });

    clearTimeout(timeoutId);
    const ttfb = Date.now() - fetchStart;
    const responseTime = Date.now() - startTime;

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value.toLowerCase();
    });

    const serverInfo = headers["server"] || headers["x-powered-by"] || null;
    const contentType = headers["content-type"] || null;
    const compression = headers["content-encoding"] || null;
    const cacheControl = headers["cache-control"] || null;
    
    const securityHeaders = analyzeSecurityHeaders(headers);
    const hasCompression = !!compression;
    const performanceScore = calculatePerformanceScore(responseTime, isSecure, hasCompression, securityHeaders.score);

    return {
      status: response.ok || response.status < 400 ? "up" : "down",
      responseTime,
      statusCode: response.status,
      statusText: response.statusText,
      headers,
      serverInfo,
      contentType,
      ipAddress,
      hostname: parsedUrl.hostname,
      protocol: parsedUrl.protocol.replace(":", ""),
      testedAt: new Date().toISOString(),
      dnsTime,
      ttfb,
      isSecure,
      securityHeaders,
      performanceScore,
      redirectCount: response.redirected ? 1 : 0,
      compression,
      cacheControl,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const defaultSecurityHeaders: SecurityHeaders = {
      hasHSTS: false,
      hasCSP: false,
      hasXFrameOptions: false,
      hasXContentTypeOptions: false,
      hasXXSSProtection: false,
      hasReferrerPolicy: false,
      score: 0,
    };
    
    return {
      status: "down",
      responseTime: responseTime < 30000 ? responseTime : null,
      statusCode: null,
      statusText: error instanceof Error ? error.message : "Connection failed",
      headers: {},
      serverInfo: null,
      contentType: null,
      ipAddress,
      hostname: parsedUrl.hostname,
      protocol: parsedUrl.protocol.replace(":", ""),
      testedAt: new Date().toISOString(),
      dnsTime,
      ttfb: null,
      isSecure,
      securityHeaders: defaultSecurityHeaders,
      performanceScore: 0,
      redirectCount: 0,
      compression: null,
      cacheControl: null,
    };
  }
}

export async function checkMonitor(monitorId: string): Promise<void> {
  const monitor = await storage.getMonitor(monitorId);
  if (!monitor) return;

  const { status, responseTime } = await pingUrl(monitor.url);
  const timestamp = new Date().toISOString();

  await storage.updateMonitorStatus(monitorId, status, responseTime, timestamp);

  await storage.createPingResult({
    monitorId,
    status,
    responseTime,
    timestamp,
  });
}

export async function checkAllMonitors(): Promise<void> {
  const monitors = await storage.getAllMonitors();
  const now = Date.now();

  const checkPromises: Promise<void>[] = [];

  for (const monitor of monitors) {
    const lastChecked = monitor.lastChecked ? new Date(monitor.lastChecked).getTime() : 0;
    const intervalMs = monitor.interval * 60 * 1000;

    if (now - lastChecked >= intervalMs) {
      checkPromises.push(
        checkMonitor(monitor.id).catch((err) => {
          console.error(`[PingService] Error checking monitor ${monitor.id}:`, err);
        })
      );
    }
  }

  await Promise.all(checkPromises);
}

let intervalId: NodeJS.Timeout | null = null;

export function startPingService(): void {
  if (intervalId) return;

  console.log("[PingService] Starting ping service...");

  checkAllMonitors().catch((err) => {
    console.error("[PingService] Initial check failed:", err);
  });

  intervalId = setInterval(() => {
    checkAllMonitors().catch((err) => {
      console.error("[PingService] Scheduled check failed:", err);
    });
  }, 30000);
}

export function stopPingService(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log("[PingService] Stopped ping service");
  }
}
