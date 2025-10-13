import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import {
  insertBDEMachineSchema,
  insertUserSchema,
  insertPartNumberSchema,
  insertOrderNumberSchema,
  insertPerformanceIdSchema,
  insertWorkSessionSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // ============= Authentication Routes =============
  
  // Machine login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { machineId, password } = req.body;
      
      const machine = await storage.getBDEMachineByMachineId(machineId);
      if (!machine) {
        return res.status(401).json({ error: "Invalid machine ID or password" });
      }

      const isValid = await bcrypt.compare(password, machine.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid machine ID or password" });
      }

      // Deactivate all previous sessions for this machine
      await storage.deactivateAllMachineSessions(machine.id);

      // Create new session
      const session = await storage.createMachineSession(machine.id);
      
      // Update last login
      await storage.updateLastLogin(machineId);

      res.json({
        sessionToken: session.sessionToken,
        machine: {
          id: machine.id,
          machineId: machine.machineId,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Logout
  app.post("/api/auth/logout", async (req, res) => {
    try {
      const { sessionToken } = req.body;
      const session = await storage.getMachineSession(sessionToken);
      
      if (session) {
        await storage.deactivateAllMachineSessions(session.machineId);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  });

  // ============= BDE Machines Routes =============
  
  app.get("/api/machines", async (req, res) => {
    try {
      const machines = await storage.getAllBDEMachines();
      res.json(machines);
    } catch (error) {
      console.error("Error fetching machines:", error);
      res.status(500).json({ error: "Failed to fetch machines" });
    }
  });

  app.post("/api/machines", async (req, res) => {
    try {
      const data = insertBDEMachineSchema.parse(req.body);
      const machine = await storage.createBDEMachine(data);
      res.json(machine);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating machine:", error);
      res.status(500).json({ error: "Failed to create machine" });
    }
  });

  app.post("/api/machines/:machineId/reset-password", async (req, res) => {
    try {
      const { machineId } = req.params;
      const { newPassword } = req.body;
      
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

      await storage.updateBDEMachinePassword(machineId, newPassword);
      res.json({ success: true });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  app.delete("/api/machines/:id", async (req, res) => {
    try {
      await storage.deleteBDEMachine(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting machine:", error);
      res.status(500).json({ error: "Failed to delete machine" });
    }
  });

  // ============= Users Routes =============
  
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const user = await storage.createUser(data);
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const data = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(req.params.id, data);
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      await storage.deleteUser(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // ============= Part Numbers Routes =============
  
  app.get("/api/part-numbers", async (req, res) => {
    try {
      const partNumbers = await storage.getAllPartNumbers();
      res.json(partNumbers);
    } catch (error) {
      console.error("Error fetching part numbers:", error);
      res.status(500).json({ error: "Failed to fetch part numbers" });
    }
  });

  app.post("/api/part-numbers", async (req, res) => {
    try {
      const data = insertPartNumberSchema.parse(req.body);
      const partNumber = await storage.createPartNumber(data);
      res.json(partNumber);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating part number:", error);
      res.status(500).json({ error: "Failed to create part number" });
    }
  });

  app.delete("/api/part-numbers/:id", async (req, res) => {
    try {
      await storage.deletePartNumber(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting part number:", error);
      res.status(500).json({ error: "Failed to delete part number" });
    }
  });

  // ============= Order Numbers Routes =============
  
  app.get("/api/order-numbers", async (req, res) => {
    try {
      const orderNumbers = await storage.getAllOrderNumbers();
      res.json(orderNumbers);
    } catch (error) {
      console.error("Error fetching order numbers:", error);
      res.status(500).json({ error: "Failed to fetch order numbers" });
    }
  });

  app.post("/api/order-numbers", async (req, res) => {
    try {
      const data = insertOrderNumberSchema.parse(req.body);
      const orderNumber = await storage.createOrderNumber(data);
      res.json(orderNumber);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating order number:", error);
      res.status(500).json({ error: "Failed to create order number" });
    }
  });

  app.delete("/api/order-numbers/:id", async (req, res) => {
    try {
      await storage.deleteOrderNumber(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting order number:", error);
      res.status(500).json({ error: "Failed to delete order number" });
    }
  });

  // ============= Performance IDs Routes =============
  
  app.get("/api/performance-ids", async (req, res) => {
    try {
      const performanceIds = await storage.getAllPerformanceIds();
      res.json(performanceIds);
    } catch (error) {
      console.error("Error fetching performance IDs:", error);
      res.status(500).json({ error: "Failed to fetch performance IDs" });
    }
  });

  app.post("/api/performance-ids", async (req, res) => {
    try {
      const data = insertPerformanceIdSchema.parse(req.body);
      const performanceId = await storage.createPerformanceId(data);
      res.json(performanceId);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating performance ID:", error);
      res.status(500).json({ error: "Failed to create performance ID" });
    }
  });

  app.delete("/api/performance-ids/:id", async (req, res) => {
    try {
      await storage.deletePerformanceId(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting performance ID:", error);
      res.status(500).json({ error: "Failed to delete performance ID" });
    }
  });

  // ============= Work Sessions Routes =============
  
  app.post("/api/work-sessions", async (req, res) => {
    try {
      const data = insertWorkSessionSchema.parse(req.body);
      const session = await storage.createWorkSession(data);
      res.json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating work session:", error);
      res.status(500).json({ error: "Failed to create work session" });
    }
  });

  app.get("/api/work-sessions", async (req, res) => {
    try {
      const sessions = await storage.getAllWorkSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching work sessions:", error);
      res.status(500).json({ error: "Failed to fetch work sessions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
