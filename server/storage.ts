import { MonitorModel, PingResultModel } from "./db";
import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface Monitor {
  id: string;
  name: string;
  url: string;
  interval: number;
  status: string;
  lastChecked: string | null;
  responseTime: number | null;
  uptimePercentage: number;
  totalChecks: number;
  successfulChecks: number;
  passwordHash: string;
}

export interface PingResult {
  id: string;
  monitorId: string;
  status: string;
  responseTime: number | null;
  timestamp: string;
}

export interface InsertMonitor {
  name: string;
  url: string;
  interval: number;
}

export interface InsertPingResult {
  monitorId: string;
  status: string;
  responseTime?: number | null;
  timestamp: string;
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

export class MongoStorage implements IStorage {
  async getAllMonitors(): Promise<Monitor[]> {
    const docs = await MonitorModel.find().lean();
    return docs.map(doc => ({
      id: doc._id.toString(),
      name: doc.name,
      url: doc.url,
      interval: doc.interval,
      status: doc.status,
      lastChecked: doc.lastChecked || null,
      responseTime: doc.responseTime ?? null,
      uptimePercentage: doc.uptimePercentage ?? 100,
      totalChecks: doc.totalChecks ?? 0,
      successfulChecks: doc.successfulChecks ?? 0,
      passwordHash: doc.passwordHash,
    }));
  }

  async getMonitor(id: string): Promise<Monitor | undefined> {
    try {
      const doc = await MonitorModel.findById(id).lean();
      if (!doc) return undefined;
      return {
        id: doc._id.toString(),
        name: doc.name,
        url: doc.url,
        interval: doc.interval,
        status: doc.status,
        lastChecked: doc.lastChecked || null,
        responseTime: doc.responseTime ?? null,
        uptimePercentage: doc.uptimePercentage ?? 100,
        totalChecks: doc.totalChecks ?? 0,
        successfulChecks: doc.successfulChecks ?? 0,
        passwordHash: doc.passwordHash,
      };
    } catch {
      return undefined;
    }
  }

  async createMonitor(insertMonitor: InsertMonitor & { password: string }): Promise<Monitor> {
    const passwordHash = await hashPassword(insertMonitor.password);
    
    const doc = await MonitorModel.create({
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
    });
    
    return {
      id: doc._id.toString(),
      name: doc.name,
      url: doc.url,
      interval: doc.interval,
      status: doc.status,
      lastChecked: doc.lastChecked || null,
      responseTime: doc.responseTime ?? null,
      uptimePercentage: doc.uptimePercentage ?? 100,
      totalChecks: doc.totalChecks ?? 0,
      successfulChecks: doc.successfulChecks ?? 0,
      passwordHash: doc.passwordHash,
    };
  }

  async updateMonitor(id: string, updates: Partial<Omit<InsertMonitor, 'password'>>): Promise<Monitor | undefined> {
    try {
      const updateData: Record<string, unknown> = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.url !== undefined) updateData.url = updates.url;
      if (updates.interval !== undefined) updateData.interval = updates.interval;

      const doc = await MonitorModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
      if (!doc) return undefined;
      
      return {
        id: doc._id.toString(),
        name: doc.name,
        url: doc.url,
        interval: doc.interval,
        status: doc.status,
        lastChecked: doc.lastChecked || null,
        responseTime: doc.responseTime ?? null,
        uptimePercentage: doc.uptimePercentage ?? 100,
        totalChecks: doc.totalChecks ?? 0,
        successfulChecks: doc.successfulChecks ?? 0,
        passwordHash: doc.passwordHash,
      };
    } catch {
      return undefined;
    }
  }

  async deleteMonitor(id: string): Promise<boolean> {
    try {
      await this.deletePingResultsByMonitorId(id);
      const result = await MonitorModel.findByIdAndDelete(id);
      return !!result;
    } catch {
      return false;
    }
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

    await MonitorModel.findByIdAndUpdate(id, {
      status,
      responseTime,
      lastChecked,
      totalChecks,
      successfulChecks,
      uptimePercentage,
    });
  }

  async getPingResultsByMonitorId(monitorId: string): Promise<PingResult[]> {
    const docs = await PingResultModel.find({ monitorId })
      .sort({ timestamp: -1 })
      .limit(24)
      .lean();
    
    return docs.reverse().map(doc => ({
      id: doc._id.toString(),
      monitorId: doc.monitorId,
      status: doc.status,
      responseTime: doc.responseTime ?? null,
      timestamp: doc.timestamp,
    }));
  }

  async getAllPingResults(): Promise<Record<string, PingResult[]>> {
    const allDocs = await PingResultModel.find()
      .sort({ timestamp: -1 })
      .lean();
    
    const resultsByMonitor: Record<string, PingResult[]> = {};
    
    for (const doc of allDocs) {
      if (!resultsByMonitor[doc.monitorId]) {
        resultsByMonitor[doc.monitorId] = [];
      }
      if (resultsByMonitor[doc.monitorId].length < 24) {
        resultsByMonitor[doc.monitorId].push({
          id: doc._id.toString(),
          monitorId: doc.monitorId,
          status: doc.status,
          responseTime: doc.responseTime ?? null,
          timestamp: doc.timestamp,
        });
      }
    }
    
    for (const monitorId in resultsByMonitor) {
      resultsByMonitor[monitorId].reverse();
    }
    
    return resultsByMonitor;
  }

  async createPingResult(insertResult: InsertPingResult): Promise<PingResult> {
    const doc = await PingResultModel.create({
      monitorId: insertResult.monitorId,
      status: insertResult.status,
      responseTime: insertResult.responseTime ?? null,
      timestamp: insertResult.timestamp,
    });

    return {
      id: doc._id.toString(),
      monitorId: doc.monitorId,
      status: doc.status,
      responseTime: doc.responseTime ?? null,
      timestamp: doc.timestamp,
    };
  }

  async deletePingResultsByMonitorId(monitorId: string): Promise<void> {
    await PingResultModel.deleteMany({ monitorId });
  }

  async checkDuplicateUrl(url: string, excludeId?: string): Promise<boolean> {
    const query: Record<string, unknown> = { url };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const existing = await MonitorModel.findOne(query);
    return !!existing;
  }
}

export const storage = new MongoStorage();
