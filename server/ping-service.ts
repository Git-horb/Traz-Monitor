import { storage } from "./storage";
import dns from "dns";
import { promisify } from "util";
import https from "https";
import tls from "tls";

const dnsLookup = promisify(dns.lookup);

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
  } catch {
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
  const hasPermissionsPolicy = !!headers["permissions-policy"] || !!headers["feature-policy"];
  const hasCORS = !!headers["access-control-allow-origin"];
  
  const checks = [hasHSTS, hasCSP, hasXFrameOptions, hasXContentTypeOptions, hasXXSSProtection, hasReferrerPolicy, hasPermissionsPolicy];
  const score = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  
  return {
    hasHSTS,
    hasCSP,
    hasXFrameOptions,
    hasXContentTypeOptions,
    hasXXSSProtection,
    hasReferrerPolicy,
    hasPermissionsPolicy,
    hasCORS,
    score,
  };
}

function detectTechnology(headers: Record<string, string>): TechnologyStack {
  const server = headers["server"] || null;
  const poweredBy = headers["x-powered-by"] || "";
  
  let framework: string | null = null;
  let languages: string[] = [];
  
  if (poweredBy.toLowerCase().includes("express")) {
    framework = "Express.js";
    languages.push("Node.js");
  } else if (poweredBy.toLowerCase().includes("php")) {
    languages.push("PHP");
  } else if (poweredBy.toLowerCase().includes("asp.net")) {
    framework = "ASP.NET";
    languages.push("C#");
  } else if (poweredBy.toLowerCase().includes("next.js")) {
    framework = "Next.js";
    languages.push("React", "Node.js");
  }
  
  if (headers["x-vercel-id"]) {
    framework = framework || "Vercel";
  }
  if (headers["x-netlify-request-id"]) {
    framework = framework || "Netlify";
  }
  
  let cdn: string | null = null;
  if (headers["cf-ray"]) cdn = "Cloudflare";
  else if (headers["x-amz-cf-id"]) cdn = "CloudFront";
  else if (headers["x-akamai-request-id"]) cdn = "Akamai";
  else if (headers["fastly-debug-path"]) cdn = "Fastly";
  else if (headers["x-cache"] && headers["x-cache"].includes("cloudflare")) cdn = "Cloudflare";
  
  let cms: string | null = null;
  if (headers["x-generator"]?.toLowerCase().includes("wordpress")) cms = "WordPress";
  else if (headers["x-drupal-cache"]) cms = "Drupal";
  else if (headers["x-shopify-stage"]) cms = "Shopify";
  
  return { server, framework, cdn, cms, languages };
}

function getLoadGrade(responseTime: number | null, isSecure: boolean, hasCompression: boolean): string {
  if (responseTime === null) return "F";
  
  let score = 100;
  if (responseTime > 3000) score -= 50;
  else if (responseTime > 1500) score -= 35;
  else if (responseTime > 800) score -= 20;
  else if (responseTime > 400) score -= 10;
  else if (responseTime > 200) score -= 5;
  
  if (!isSecure) score -= 15;
  if (!hasCompression) score -= 10;
  
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
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

async function getSSLInfo(hostname: string): Promise<SSLInfo | null> {
  return new Promise((resolve) => {
    try {
      const socket = tls.connect(443, hostname, { servername: hostname }, () => {
        const cert = socket.getPeerCertificate();
        
        if (!cert || !cert.valid_from) {
          socket.destroy();
          resolve(null);
          return;
        }
        
        const validFrom = new Date(cert.valid_from);
        const validTo = new Date(cert.valid_to);
        const now = new Date();
        const daysUntilExpiry = Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        const sslInfo: SSLInfo = {
          valid: socket.authorized,
          issuer: cert.issuer?.O || cert.issuer?.CN || null,
          subject: cert.subject?.CN || null,
          validFrom: validFrom.toISOString(),
          validTo: validTo.toISOString(),
          daysUntilExpiry,
          protocol: socket.getProtocol() || null,
          cipher: socket.getCipher()?.name || null,
        };
        
        socket.destroy();
        resolve(sslInfo);
      });
      
      socket.on("error", () => {
        socket.destroy();
        resolve(null);
      });
      
      setTimeout(() => {
        socket.destroy();
        resolve(null);
      }, 5000);
    } catch {
      resolve(null);
    }
  });
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

  let sslInfo: SSLInfo | null = null;
  let tlsTime: number | null = null;
  
  if (isSecure) {
    const tlsStart = Date.now();
    sslInfo = await getSSLInfo(parsedUrl.hostname);
    tlsTime = Date.now() - tlsStart;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const connectionStart = Date.now();
    const fetchStart = Date.now();
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "DxMonitor/1.0 (Site Testing)",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    clearTimeout(timeoutId);
    const ttfb = Date.now() - fetchStart;
    
    const downloadStart = Date.now();
    const body = await response.text();
    const downloadTime = Date.now() - downloadStart;
    const contentLength = body.length;
    
    const responseTime = Date.now() - startTime;

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value.toLowerCase();
    });

    const serverInfo = headers["server"] || headers["x-powered-by"] || null;
    const contentType = headers["content-type"] || null;
    const compression = headers["content-encoding"] || null;
    const cacheControl = headers["cache-control"] || null;
    
    const securityHeaders = analyzeSecurityHeaders(headers);
    const hasCompression = !!compression;
    const performanceScore = calculatePerformanceScore(responseTime, isSecure, hasCompression, securityHeaders.score);
    const techStack = detectTechnology(headers);
    const loadGrade = getLoadGrade(responseTime, isSecure, hasCompression);
    
    const http2 = headers["alt-svc"]?.includes("h2") || headers["x-http-version"]?.includes("2") || false;

    const timing: TimingBreakdown = {
      dns: dnsTime,
      connection: connectionStart - startTime,
      tls: tlsTime,
      ttfb,
      download: downloadTime,
      total: responseTime,
    };

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
      sslInfo,
      techStack,
      timing,
      contentLength,
      loadGrade,
      http2,
      geoLocation: null,
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
      hasPermissionsPolicy: false,
      hasCORS: false,
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
      sslInfo,
      techStack: { server: null, framework: null, cdn: null, cms: null, languages: [] },
      timing: { dns: dnsTime, connection: null, tls: tlsTime, ttfb: null, download: null, total: responseTime },
      contentLength: null,
      loadGrade: "F",
      http2: false,
      geoLocation: null,
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
