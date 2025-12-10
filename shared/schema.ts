import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const monitors = pgTable("monitors", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  interval: integer("interval").notNull().default(5),
  status: text("status").notNull().default("checking"),
  lastChecked: text("last_checked"),
  responseTime: integer("response_time"),
  uptimePercentage: integer("uptime_percentage").default(100),
  totalChecks: integer("total_checks").default(0),
  successfulChecks: integer("successful_checks").default(0),
  passwordHash: text("password_hash").notNull(),
});

export const pingResults = pgTable("ping_results", {
  id: varchar("id").primaryKey(),
  monitorId: varchar("monitor_id").notNull(),
  status: text("status").notNull(),
  responseTime: integer("response_time"),
  timestamp: text("timestamp").notNull(),
});

export const insertMonitorSchema = createInsertSchema(monitors).pick({
  name: true,
  url: true,
  interval: true,
}).extend({
  name: z.string().min(1, "Name is required").max(100),
  url: z.string().url("Please enter a valid URL"),
  interval: z.number().min(1).max(60),
});

export const createMonitorSchema = insertMonitorSchema.extend({
  password: z.string().min(4, "Password must be at least 4 characters"),
});

export const updateMonitorSchema = insertMonitorSchema.partial();

export const deleteMonitorSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export const insertPingResultSchema = createInsertSchema(pingResults).pick({
  monitorId: true,
  status: true,
  responseTime: true,
  timestamp: true,
});

export type InsertMonitor = z.infer<typeof insertMonitorSchema>;
export type CreateMonitor = z.infer<typeof createMonitorSchema>;
export type UpdateMonitor = z.infer<typeof updateMonitorSchema>;
export type Monitor = typeof monitors.$inferSelect;
export type InsertPingResult = z.infer<typeof insertPingResultSchema>;
export type PingResult = typeof pingResults.$inferSelect;

export const INTERVAL_OPTIONS = [
  { value: 1, label: "Every 1 min" },
  { value: 5, label: "Every 5 min" },
  { value: 15, label: "Every 15 min" },
  { value: 30, label: "Every 30 min" },
  { value: 60, label: "Every 1 hour" },
] as const;
