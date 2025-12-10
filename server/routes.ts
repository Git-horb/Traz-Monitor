import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, verifyPassword } from "./storage";
import { createMonitorSchema, updateMonitorSchema, deleteMonitorSchema } from "@shared/schema";
import { startPingService, checkMonitor, testUrl } from "./ping-service";
import { fromZodError } from "zod-validation-error";

const MASTER_PASSWORD = process.env.MASTER_PASSWORD;

function isMasterPassword(password: string): boolean {
  return MASTER_PASSWORD ? password === MASTER_PASSWORD : false;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  startPingService();

  app.get("/api/monitors", async (req, res) => {
    try {
      const monitors = await storage.getAllMonitors();
      const sanitizedMonitors = monitors.map(({ passwordHash, ...rest }) => rest);
      res.json(sanitizedMonitors);
    } catch (error) {
      console.error("Error fetching monitors:", error);
      res.status(500).json({ error: "Failed to fetch monitors" });
    }
  });

  app.get("/api/monitors/:id", async (req, res) => {
    try {
      const monitor = await storage.getMonitor(req.params.id);
      if (!monitor) {
        return res.status(404).json({ error: "Monitor not found" });
      }
      const { passwordHash, ...sanitizedMonitor } = monitor;
      res.json(sanitizedMonitor);
    } catch (error) {
      console.error("Error fetching monitor:", error);
      res.status(500).json({ error: "Failed to fetch monitor" });
    }
  });

  app.post("/api/monitors", async (req, res) => {
    try {
      const result = createMonitorSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ error: validationError.message });
      }

      const isDuplicate = await storage.checkDuplicateUrl(result.data.url);
      if (isDuplicate) {
        return res.status(400).json({ error: "This URL is already being monitored" });
      }

      const monitor = await storage.createMonitor(result.data);
      
      checkMonitor(monitor.id).catch((err) => {
        console.error("Error during initial monitor check:", err);
      });

      const { passwordHash, ...sanitizedMonitor } = monitor;
      res.status(201).json(sanitizedMonitor);
    } catch (error) {
      console.error("Error creating monitor:", error);
      res.status(500).json({ error: "Failed to create monitor" });
    }
  });

  app.patch("/api/monitors/:id", async (req, res) => {
    try {
      const existing = await storage.getMonitor(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Monitor not found" });
      }

      const result = updateMonitorSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ error: validationError.message });
      }

      const { password, ...updates } = result.data;
      
      const isValidPassword = await verifyPassword(password, existing.passwordHash);
      const isMaster = isMasterPassword(password);
      
      if (!isValidPassword && !isMaster) {
        return res.status(401).json({ error: "Incorrect password" });
      }

      if (updates.url && updates.url !== existing.url) {
        const isDuplicate = await storage.checkDuplicateUrl(updates.url, req.params.id);
        if (isDuplicate) {
          return res.status(400).json({ error: "This URL is already being monitored" });
        }
      }

      const updated = await storage.updateMonitor(req.params.id, updates);
      
      if (updates.url && updates.url !== existing.url) {
        checkMonitor(req.params.id).catch((err) => {
          console.error("Error during re-check after URL update:", err);
        });
      }

      if (updated) {
        const { passwordHash, ...sanitizedMonitor } = updated;
        res.json(sanitizedMonitor);
      } else {
        res.json(updated);
      }
    } catch (error) {
      console.error("Error updating monitor:", error);
      res.status(500).json({ error: "Failed to update monitor" });
    }
  });

  app.delete("/api/monitors/:id", async (req, res) => {
    try {
      const existing = await storage.getMonitor(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Monitor not found" });
      }

      const result = deleteMonitorSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ error: validationError.message });
      }

      const isValidPassword = await verifyPassword(result.data.password, existing.passwordHash);
      const isMaster = isMasterPassword(result.data.password);
      
      if (!isValidPassword && !isMaster) {
        return res.status(401).json({ error: "Incorrect password" });
      }

      await storage.deletePingResultsByMonitorId(req.params.id);
      await storage.deleteMonitor(req.params.id);
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting monitor:", error);
      res.status(500).json({ error: "Failed to delete monitor" });
    }
  });

  app.get("/api/ping-results", async (req, res) => {
    try {
      const results = await storage.getAllPingResults();
      res.json(results);
    } catch (error) {
      console.error("Error fetching ping results:", error);
      res.status(500).json({ error: "Failed to fetch ping results" });
    }
  });

  app.get("/api/ping-results/:monitorId", async (req, res) => {
    try {
      const results = await storage.getPingResultsByMonitorId(req.params.monitorId);
      res.json(results);
    } catch (error) {
      console.error("Error fetching ping results:", error);
      res.status(500).json({ error: "Failed to fetch ping results" });
    }
  });

  app.post("/api/test-site", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url || typeof url !== "string") {
        return res.status(400).json({ error: "URL is required" });
      }

      try {
        new URL(url);
      } catch {
        return res.status(400).json({ error: "Invalid URL format" });
      }

      const result = await testUrl(url);
      res.json(result);
    } catch (error) {
      console.error("Error testing site:", error);
      res.status(500).json({ error: "Failed to test site" });
    }
  });

  return httpServer;
}
