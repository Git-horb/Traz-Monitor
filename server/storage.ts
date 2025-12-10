import { type Monitor, type InsertMonitor, type PingResult, type InsertPingResult, monitors, pingResults } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface IStorage {
  getAllMonitors(): Promise<Monitor[]>;
  getMonitor(id: string): Promise<Monitor | undefined>;
  createMonitor(monitor: InsertMonitor & { password: string }): Promise<Monitor>;
  updateMonitor(id: string, monitor: Partial<Omit<InsertMonitor, 'password'>>): Promise<Monitor | undefined>;
  deleteMonitor(id: string): Promise<boolean>;
  updateMonitorStatus(id: string, status: string, responseTime: number | null, lastChecked: string): Promise<void>;
  
  getPingResultsByMonitorId(monitorId: string): Promise<PingResult[]>;
  getAllPingResults(): Promise<Record<string, PingResult[]>>;
  createPingResult(result: InsertPingResult): Promise<PingResult>;
  deletePingResultsByMonitorId(monitorId: string): Promise<void>;
  
  checkDuplicateUrl(url: string, excludeId?: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getAllMonitors(): Promise<Monitor[]> {
    return await db.select().from(monitors);
  }

  async getMonitor(id: string): Promise<Monitor | undefined> {
    const [monitor] = await db.select().from(monitors).where(eq(monitors.id, id));
    return monitor || undefined;
  }

  async createMonitor(insertMonitor: InsertMonitor & { password: string }): Promise<Monitor> {
    const id = randomUUID();
    const passwordHash = await hashPassword(insertMonitor.password);
    
    const [monitor] = await db.insert(monitors).values({
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
      passwordHash,
    }).returning();
    
    return monitor;
  }

  async updateMonitor(id: string, updates: Partial<Omit<InsertMonitor, 'password'>>): Promise<Monitor | undefined> {
    const existing = await this.getMonitor(id);
    if (!existing) return undefined;

    const updateData: Partial<Monitor> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.url !== undefined) updateData.url = updates.url;
    if (updates.interval !== undefined) updateData.interval = updates.interval;

    const [updated] = await db.update(monitors)
      .set(updateData)
      .where(eq(monitors.id, id))
      .returning();
    
    return updated;
  }

  async deleteMonitor(id: string): Promise<boolean> {
    await this.deletePingResultsByMonitorId(id);
    const result = await db.delete(monitors).where(eq(monitors.id, id)).returning();
    return result.length > 0;
  }

  async updateMonitorStatus(
    id: string,
    status: string,
    responseTime: number | null,
    lastChecked: string
  ): Promise<void> {
    const monitor = await this.getMonitor(id);
    if (!monitor) return;

    const totalChecks = (monitor.totalChecks || 0) + 1;
    const successfulChecks = status === "up" 
      ? (monitor.successfulChecks || 0) + 1 
      : (monitor.successfulChecks || 0);
    const uptimePercentage = Math.round((successfulChecks / totalChecks) * 100);

    await db.update(monitors).set({
      status,
      responseTime,
      lastChecked,
      totalChecks,
      successfulChecks,
      uptimePercentage,
    }).where(eq(monitors.id, id));
  }

  async getPingResultsByMonitorId(monitorId: string): Promise<PingResult[]> {
    const results = await db.select()
      .from(pingResults)
      .where(eq(pingResults.monitorId, monitorId))
      .orderBy(desc(pingResults.timestamp))
      .limit(24);
    return results.reverse();
  }

  async getAllPingResults(): Promise<Record<string, PingResult[]>> {
    const allResults = await db.select().from(pingResults).orderBy(desc(pingResults.timestamp));
    
    const resultsByMonitor: Record<string, PingResult[]> = {};
    
    for (const result of allResults) {
      if (!resultsByMonitor[result.monitorId]) {
        resultsByMonitor[result.monitorId] = [];
      }
      if (resultsByMonitor[result.monitorId].length < 24) {
        resultsByMonitor[result.monitorId].push(result);
      }
    }
    
    for (const monitorId in resultsByMonitor) {
      resultsByMonitor[monitorId].reverse();
    }
    
    return resultsByMonitor;
  }

  async createPingResult(insertResult: InsertPingResult): Promise<PingResult> {
    const id = randomUUID();
    
    const [result] = await db.insert(pingResults).values({
      id,
      monitorId: insertResult.monitorId,
      status: insertResult.status,
      responseTime: insertResult.responseTime ?? null,
      timestamp: insertResult.timestamp,
    }).returning();

    return result;
  }

  async deletePingResultsByMonitorId(monitorId: string): Promise<void> {
    await db.delete(pingResults).where(eq(pingResults.monitorId, monitorId));
  }

  async checkDuplicateUrl(url: string, excludeId?: string): Promise<boolean> {
    const existing = await db.select().from(monitors).where(eq(monitors.url, url));
    if (excludeId) {
      return existing.some(m => m.id !== excludeId);
    }
    return existing.length > 0;
  }
}

export const storage = new DatabaseStorage();
