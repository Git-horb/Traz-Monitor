import { storage } from "./storage";

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
