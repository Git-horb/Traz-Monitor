import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMonitorSchema } from "@shared/schema";
import { startPingService, checkMonitor } from "./ping-service";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  startPingService();

  app.get("/api/monitors", async (req, res) => {
    try {
      const monitors = await storage.getAllMonitors();
      res.json(monitors);
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
      res.json(monitor);
    } catch (error) {
      console.error("Error fetching monitor:", error);
      res.status(500).json({ error: "Failed to fetch monitor" });
    }
  });

  app.post("/api/monitors", async (req, res) => {
    try {
      const result = insertMonitorSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ error: validationError.message });
      }

      const monitor = await storage.createMonitor(result.data);
      
      checkMonitor(monitor.id).catch((err) => {
        console.error("Error during initial monitor check:", err);
      });

      res.status(201).json(monitor);
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

      const result = insertMonitorSchema.partial().safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ error: validationError.message });
      }

      const updated = await storage.updateMonitor(req.params.id, result.data);
      
      if (result.data.url && result.data.url !== existing.url) {
        checkMonitor(req.params.id).catch((err) => {
          console.error("Error during re-check after URL update:", err);
        });
      }

      res.json(updated);
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

  return httpServer;
}
