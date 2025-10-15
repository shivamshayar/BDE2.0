import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertBdeMachineSchema,
  insertFactoryUserSchema,
  insertWorkSessionSchema,
  insertWorkLogSchema,
  insertPartNumberSchema,
  insertOrderNumberSchema,
  insertPerformanceIdSchema
} from "@shared/schema";
import multer from "multer";
import { writeFile } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Image Upload Endpoint
  app.post("/api/upload/user-image", upload.single("image"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const ext = req.file.originalname.split(".").pop();
      const fileName = `user-${randomUUID()}.${ext}`;
      const publicDir = process.env.PUBLIC_OBJECT_SEARCH_PATHS?.split(",")[0] || "";
      
      if (!publicDir) {
        return res.status(500).json({ error: "Object storage not configured" });
      }

      const filePath = join(publicDir, fileName);
      await writeFile(filePath, req.file.buffer);

      const imageUrl = `/public/${fileName}`;
      res.json({ imageUrl });
    } catch (error) {
      console.error("Image upload error:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  });
  // BDE Machine Authentication
  app.post("/api/bde/login", async (req: Request, res: Response) => {
    try {
      const { machineId, password } = req.body;
      
      if (!machineId || !password) {
        return res.status(400).json({ error: "Machine ID and password are required" });
      }

      const machine = await storage.getBdeMachineByMachineId(machineId);
      
      if (!machine || machine.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (!machine.isActive) {
        return res.status(403).json({ error: "Machine is inactive" });
      }

      // Update last login
      await storage.updateBdeMachine(machine.id, { lastLoginAt: new Date() });

      res.json({ machine: { ...machine, password: undefined } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // BDE Machine Management (Admin)
  app.get("/api/admin/machines", async (req: Request, res: Response) => {
    try {
      const machines = await storage.getAllBdeMachines();
      const safeMachines = machines.map(m => ({ ...m, password: undefined }));
      res.json(safeMachines);
    } catch (error) {
      console.error("Get machines error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/machines", async (req: Request, res: Response) => {
    try {
      const result = insertBdeMachineSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues });
      }

      const machine = await storage.createBdeMachine(result.data);
      res.json({ ...machine, password: undefined });
    } catch (error: any) {
      console.error("Create machine error:", error);
      if (error.code === "23505") {
        return res.status(409).json({ error: "Machine ID already exists" });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/admin/machines/:id/password", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ error: "Password is required" });
      }

      const machine = await storage.updateBdeMachine(id, { password });
      
      if (!machine) {
        return res.status(404).json({ error: "Machine not found" });
      }

      res.json({ ...machine, password: undefined });
    } catch (error) {
      console.error("Update password error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Factory Users
  app.get("/api/users", async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllFactoryUsers();
      res.json(users);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const result = insertFactoryUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues });
      }

      const user = await storage.createFactoryUser(result.data);
      res.json(user);
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Work Sessions
  app.get("/api/sessions/:machineId", async (req: Request, res: Response) => {
    try {
      const { machineId } = req.params;
      const sessions = await storage.getWorkSessionsByMachine(machineId);
      res.json(sessions);
    } catch (error) {
      console.error("Get sessions error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/sessions", async (req: Request, res: Response) => {
    try {
      const result = insertWorkSessionSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues });
      }

      const session = await storage.createWorkSession(result.data);
      res.json(session);
    } catch (error) {
      console.error("Create session error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/sessions/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const session = await storage.updateWorkSession(id, req.body);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      res.json(session);
    } catch (error) {
      console.error("Update session error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/sessions/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await storage.deleteWorkSession(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete session error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Work Logs
  app.post("/api/work-logs", async (req: Request, res: Response) => {
    try {
      const result = insertWorkLogSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues });
      }

      const log = await storage.createWorkLog(result.data);
      res.json(log);
    } catch (error) {
      console.error("Create work log error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/work-logs/:machineId", async (req: Request, res: Response) => {
    try {
      const { machineId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const logs = await storage.getWorkLogsByMachine(machineId, limit);
      res.json(logs);
    } catch (error) {
      console.error("Get work logs error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/work-logs/user/:userId", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const logs = await storage.getWorkLogsByUser(userId, limit);
      res.json(logs);
    } catch (error) {
      console.error("Get user work logs error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/work-logs/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { partNumber, orderNumber, performanceId, duration } = req.body;

      if (!partNumber || !orderNumber || !performanceId) {
        return res.status(400).json({ error: "Part number, order number, and performance ID are required" });
      }

      const updates: any = {
        partNumber,
        orderNumber,
        performanceId,
        isModified: true
      };

      if (duration !== undefined) {
        updates.duration = duration;
      }

      const log = await storage.updateWorkLog(id, updates);

      if (!log) {
        return res.status(404).json({ error: "Work log not found" });
      }

      res.json(log);
    } catch (error) {
      console.error("Update work log error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Recent Items
  app.get("/api/recent/:machineId/parts", async (req: Request, res: Response) => {
    try {
      const { machineId } = req.params;
      const parts = await storage.getRecentPartNumbers(machineId);
      res.json(parts);
    } catch (error) {
      console.error("Get recent parts error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/recent/:machineId/orders", async (req: Request, res: Response) => {
    try {
      const { machineId } = req.params;
      const orders = await storage.getRecentOrderNumbers(machineId);
      res.json(orders);
    } catch (error) {
      console.error("Get recent orders error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/recent/:machineId/performance", async (req: Request, res: Response) => {
    try {
      const { machineId } = req.params;
      const performance = await storage.getRecentPerformanceIds(machineId);
      res.json(performance);
    } catch (error) {
      console.error("Get recent performance error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Master Data - Part Numbers
  app.get("/api/master/parts", async (req: Request, res: Response) => {
    try {
      const parts = await storage.getAllPartNumbers();
      res.json(parts);
    } catch (error) {
      console.error("Get parts error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/master/parts", async (req: Request, res: Response) => {
    try {
      const result = insertPartNumberSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues });
      }

      const part = await storage.createPartNumber(result.data);
      res.json(part);
    } catch (error: any) {
      console.error("Create part error:", error);
      if (error.code === "23505") {
        return res.status(409).json({ error: "Part number already exists" });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Master Data - Order Numbers
  app.get("/api/master/orders", async (req: Request, res: Response) => {
    try {
      const orders = await storage.getAllOrderNumbers();
      res.json(orders);
    } catch (error) {
      console.error("Get orders error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/master/orders", async (req: Request, res: Response) => {
    try {
      const result = insertOrderNumberSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues });
      }

      const order = await storage.createOrderNumber(result.data);
      res.json(order);
    } catch (error: any) {
      console.error("Create order error:", error);
      if (error.code === "23505") {
        return res.status(409).json({ error: "Order number already exists" });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Master Data - Performance IDs
  app.get("/api/master/performance", async (req: Request, res: Response) => {
    try {
      const performance = await storage.getAllPerformanceIds();
      res.json(performance);
    } catch (error) {
      console.error("Get performance error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/master/performance", async (req: Request, res: Response) => {
    try {
      const result = insertPerformanceIdSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.issues });
      }

      const performance = await storage.createPerformanceId(result.data);
      res.json(performance);
    } catch (error: any) {
      console.error("Create performance error:", error);
      if (error.code === "23505") {
        return res.status(409).json({ error: "Performance ID already exists" });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
