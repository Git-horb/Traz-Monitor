import { z } from "zod";

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

export const insertMonitorSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  url: z.string().url("Please enter a valid URL"),
  interval: z.number().min(1).max(60),
});

export const createMonitorSchema = insertMonitorSchema.extend({
  password: z.string().min(4, "Password must be at least 4 characters"),
});

export const updateMonitorSchema = insertMonitorSchema.partial().extend({
  password: z.string().min(1, "Password is required"),
});

export const deleteMonitorSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export const updateMonitorWithPasswordSchema = z.object({
  password: z.string().min(1, "Password is required"),
  updates: insertMonitorSchema.partial(),
});

export const insertPingResultSchema = z.object({
  monitorId: z.string(),
  status: z.string(),
  responseTime: z.number().nullable().optional(),
  timestamp: z.string(),
});

export type InsertMonitor = z.infer<typeof insertMonitorSchema>;
export type CreateMonitor = z.infer<typeof createMonitorSchema>;
export type UpdateMonitor = z.infer<typeof updateMonitorSchema>;
export type InsertPingResult = z.infer<typeof insertPingResultSchema>;

export const INTERVAL_OPTIONS = [
  { value: 1, label: "Every 1 min" },
  { value: 5, label: "Every 5 min" },
  { value: 15, label: "Every 15 min" },
  { value: 30, label: "Every 30 min" },
  { value: 60, label: "Every 1 hour" },
] as const;
