import { type Monitor, type InsertMonitor, type PingResult, type InsertPingResult } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getAllMonitors(): Promise<Monitor[]>;
  getMonitor(id: string): Promise<Monitor | undefined>;
  createMonitor(monitor: InsertMonitor): Promise<Monitor>;
  updateMonitor(id: string, monitor: Partial<InsertMonitor>): Promise<Monitor | undefined>;
  deleteMonitor(id: string): Promise<boolean>;
  updateMonitorStatus(id: string, status: string, responseTime: number | null, lastChecked: string): Promise<void>;
  
  getPingResultsByMonitorId(monitorId: string): Promise<PingResult[]>;
  getAllPingResults(): Promise<Record<string, PingResult[]>>;
  createPingResult(result: InsertPingResult): Promise<PingResult>;
  deletePingResultsByMonitorId(monitorId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private monitors: Map<string, Monitor>;
  private pingResultsByMonitor: Map<string, PingResult[]>;

  constructor() {
    this.monitors = new Map();
    this.pingResultsByMonitor = new Map();
  }

  async getAllMonitors(): Promise<Monitor[]> {
    return Array.from(this.monitors.values());
  }

  async getMonitor(id: string): Promise<Monitor | undefined> {
    return this.monitors.get(id);
  }

  async createMonitor(insertMonitor: InsertMonitor): Promise<Monitor> {
    const id = randomUUID();
    const monitor: Monitor = {
      id,
      name: insertMonitor.name,
      url: insertMonitor.url,
      interval: insertMonitor.interval,
      status: "checking",
      lastChecked: null,
      responseTime: null,
      uptimePercentage: 100,
      totalChecks: 0,
      successfulChecks: 0,
    };
    this.monitors.set(id, monitor);
    this.pingResultsByMonitor.set(id, []);
    return monitor;
  }

  async updateMonitor(id: string, updates: Partial<InsertMonitor>): Promise<Monitor | undefined> {
    const existing = this.monitors.get(id);
    if (!existing) return undefined;

    const updated: Monitor = {
      ...existing,
      ...updates,
    };
    this.monitors.set(id, updated);
    return updated;
  }

  async deleteMonitor(id: string): Promise<boolean> {
    this.pingResultsByMonitor.delete(id);
    return this.monitors.delete(id);
  }

  async updateMonitorStatus(
    id: string,
    status: string,
    responseTime: number | null,
    lastChecked: string
  ): Promise<void> {
    const monitor = this.monitors.get(id);
    if (!monitor) return;

    const totalChecks = (monitor.totalChecks || 0) + 1;
    const successfulChecks = status === "up" 
      ? (monitor.successfulChecks || 0) + 1 
      : (monitor.successfulChecks || 0);
    const uptimePercentage = Math.round((successfulChecks / totalChecks) * 100);

    this.monitors.set(id, {
      ...monitor,
      status,
      responseTime,
      lastChecked,
      totalChecks,
      successfulChecks,
      uptimePercentage,
    });
  }

  async getPingResultsByMonitorId(monitorId: string): Promise<PingResult[]> {
    const results = this.pingResultsByMonitor.get(monitorId) || [];
    return results.slice(-24);
  }

  async getAllPingResults(): Promise<Record<string, PingResult[]>> {
    const results: Record<string, PingResult[]> = {};
    
    const entries = Array.from(this.pingResultsByMonitor.entries());
    for (let i = 0; i < entries.length; i++) {
      const [monitorId, pingResults] = entries[i];
      results[monitorId] = pingResults.slice(-24);
    }

    return results;
  }

  async createPingResult(insertResult: InsertPingResult): Promise<PingResult> {
    const id = randomUUID();
    const result: PingResult = {
      id,
      monitorId: insertResult.monitorId,
      status: insertResult.status,
      responseTime: insertResult.responseTime ?? null,
      timestamp: insertResult.timestamp,
    };

    const monitorResults = this.pingResultsByMonitor.get(insertResult.monitorId) || [];
    monitorResults.push(result);
    
    if (monitorResults.length > 100) {
      monitorResults.splice(0, monitorResults.length - 100);
    }
    
    this.pingResultsByMonitor.set(insertResult.monitorId, monitorResults);

    return result;
  }

  async deletePingResultsByMonitorId(monitorId: string): Promise<void> {
    this.pingResultsByMonitor.delete(monitorId);
  }
}

export const storage = new MemStorage();
