import { db } from "./db";
import { 
  bdeMachines, 
  factoryUsers, 
  workSessions, 
  workLogs,
  partNumbers,
  orderNumbers,
  performanceIds,
  type BdeMachine,
  type InsertBdeMachine,
  type FactoryUser,
  type InsertFactoryUser,
  type WorkSession,
  type InsertWorkSession,
  type WorkLog,
  type InsertWorkLog,
  type PartNumber,
  type InsertPartNumber,
  type OrderNumber,
  type InsertOrderNumber,
  type PerformanceId,
  type InsertPerformanceId
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // BDE Machines
  getBdeMachine(id: string): Promise<BdeMachine | undefined>;
  getBdeMachineByMachineId(machineId: string): Promise<BdeMachine | undefined>;
  createBdeMachine(machine: InsertBdeMachine): Promise<BdeMachine>;
  updateBdeMachine(id: string, updates: Partial<BdeMachine>): Promise<BdeMachine | undefined>;
  getAllBdeMachines(): Promise<BdeMachine[]>;
  deleteBdeMachine(id: string): Promise<void>;

  // Factory Users
  getFactoryUser(id: string): Promise<FactoryUser | undefined>;
  getAllFactoryUsers(): Promise<FactoryUser[]>;
  createFactoryUser(user: InsertFactoryUser): Promise<FactoryUser>;
  updateFactoryUser(id: string, updates: Partial<FactoryUser>): Promise<FactoryUser | undefined>;
  deleteFactoryUser(id: string): Promise<void>;

  // Work Sessions
  getWorkSession(id: string): Promise<WorkSession | undefined>;
  getWorkSessionsByMachine(machineId: string): Promise<WorkSession[]>;
  createWorkSession(session: InsertWorkSession): Promise<WorkSession>;
  updateWorkSession(id: string, updates: Partial<WorkSession>): Promise<WorkSession | undefined>;
  deleteWorkSession(id: string): Promise<void>;

  // Work Logs
  createWorkLog(log: InsertWorkLog): Promise<WorkLog>;
  getWorkLogsByMachine(machineId: string, limit?: number): Promise<WorkLog[]>;
  getWorkLogsByUser(userId: string, limit?: number): Promise<WorkLog[]>;
  updateWorkLog(id: string, updates: Partial<WorkLog>): Promise<WorkLog | undefined>;
  getRecentPartNumbers(machineId: string, limit?: number): Promise<string[]>;
  getRecentOrderNumbers(machineId: string, limit?: number): Promise<string[]>;
  getRecentPerformanceIds(machineId: string, limit?: number): Promise<string[]>;

  // Master Data
  getAllPartNumbers(): Promise<PartNumber[]>;
  createPartNumber(partNumber: InsertPartNumber): Promise<PartNumber>;
  deletePartNumber(id: string): Promise<void>;
  getAllOrderNumbers(): Promise<OrderNumber[]>;
  createOrderNumber(orderNumber: InsertOrderNumber): Promise<OrderNumber>;
  deleteOrderNumber(id: string): Promise<void>;
  getAllPerformanceIds(): Promise<PerformanceId[]>;
  createPerformanceId(performanceId: InsertPerformanceId): Promise<PerformanceId>;
  deletePerformanceId(id: string): Promise<void>;
}

export class DbStorage implements IStorage {
  // BDE Machines
  async getBdeMachine(id: string): Promise<BdeMachine | undefined> {
    const result = await db.select().from(bdeMachines).where(eq(bdeMachines.id, id));
    return result[0];
  }

  async getBdeMachineByMachineId(machineId: string): Promise<BdeMachine | undefined> {
    const result = await db.select().from(bdeMachines).where(eq(bdeMachines.machineId, machineId));
    return result[0];
  }

  async createBdeMachine(machine: InsertBdeMachine): Promise<BdeMachine> {
    const result = await db.insert(bdeMachines).values(machine).returning();
    return result[0];
  }

  async updateBdeMachine(id: string, updates: Partial<BdeMachine>): Promise<BdeMachine | undefined> {
    const result = await db.update(bdeMachines).set(updates).where(eq(bdeMachines.id, id)).returning();
    return result[0];
  }

  async getAllBdeMachines(): Promise<BdeMachine[]> {
    return await db.select().from(bdeMachines).orderBy(desc(bdeMachines.createdAt));
  }

  // Factory Users
  async getFactoryUser(id: string): Promise<FactoryUser | undefined> {
    const result = await db.select().from(factoryUsers).where(eq(factoryUsers.id, id));
    return result[0];
  }

  async getAllFactoryUsers(): Promise<FactoryUser[]> {
    return await db.select().from(factoryUsers).where(eq(factoryUsers.isActive, true)).orderBy(factoryUsers.name);
  }

  async createFactoryUser(user: InsertFactoryUser): Promise<FactoryUser> {
    const result = await db.insert(factoryUsers).values(user).returning();
    return result[0];
  }

  async updateFactoryUser(id: string, updates: Partial<FactoryUser>): Promise<FactoryUser | undefined> {
    const result = await db.update(factoryUsers).set(updates).where(eq(factoryUsers.id, id)).returning();
    return result[0];
  }

  // Work Sessions
  async getWorkSession(id: string): Promise<WorkSession | undefined> {
    const result = await db.select().from(workSessions).where(eq(workSessions.id, id));
    return result[0];
  }

  async getWorkSessionsByMachine(machineId: string): Promise<WorkSession[]> {
    return await db.select().from(workSessions).where(eq(workSessions.machineId, machineId)).orderBy(desc(workSessions.createdAt));
  }

  async createWorkSession(session: InsertWorkSession): Promise<WorkSession> {
    const result = await db.insert(workSessions).values(session).returning();
    return result[0];
  }

  async updateWorkSession(id: string, updates: Partial<WorkSession>): Promise<WorkSession | undefined> {
    const result = await db.update(workSessions).set(updates).where(eq(workSessions.id, id)).returning();
    return result[0];
  }

  async deleteWorkSession(id: string): Promise<void> {
    await db.delete(workSessions).where(eq(workSessions.id, id));
  }

  // Work Logs
  async createWorkLog(log: InsertWorkLog): Promise<WorkLog> {
    const result = await db.insert(workLogs).values(log).returning();
    return result[0];
  }

  async getWorkLogsByMachine(machineId: string, limit: number = 50): Promise<WorkLog[]> {
    return await db.select()
      .from(workLogs)
      .where(eq(workLogs.machineId, machineId))
      .orderBy(desc(workLogs.completedAt))
      .limit(limit);
  }

  async getWorkLogsByUser(userId: string, limit: number = 10): Promise<WorkLog[]> {
    return await db.select()
      .from(workLogs)
      .where(eq(workLogs.userId, userId))
      .orderBy(desc(workLogs.completedAt))
      .limit(limit);
  }

  async updateWorkLog(id: string, updates: Partial<WorkLog>): Promise<WorkLog | undefined> {
    const result = await db.update(workLogs).set(updates).where(eq(workLogs.id, id)).returning();
    return result[0];
  }

  async getRecentPartNumbers(machineId: string, limit: number = 4): Promise<string[]> {
    const logs = await db.select({ partNumber: workLogs.partNumber })
      .from(workLogs)
      .where(eq(workLogs.machineId, machineId))
      .orderBy(desc(workLogs.completedAt))
      .limit(20);
    
    const uniqueParts = Array.from(new Set(logs.map((l: { partNumber: string }) => l.partNumber)));
    return uniqueParts.slice(0, limit);
  }

  async getRecentOrderNumbers(machineId: string, limit: number = 3): Promise<string[]> {
    const logs = await db.select({ orderNumber: workLogs.orderNumber })
      .from(workLogs)
      .where(eq(workLogs.machineId, machineId))
      .orderBy(desc(workLogs.completedAt))
      .limit(20);
    
    const uniqueOrders = Array.from(new Set(logs.map((l: { orderNumber: string }) => l.orderNumber)));
    return uniqueOrders.slice(0, limit);
  }

  async getRecentPerformanceIds(machineId: string, limit: number = 3): Promise<string[]> {
    const logs = await db.select({ performanceId: workLogs.performanceId })
      .from(workLogs)
      .where(eq(workLogs.machineId, machineId))
      .orderBy(desc(workLogs.completedAt))
      .limit(20);
    
    const uniquePerformance = Array.from(new Set(logs.map((l: { performanceId: string }) => l.performanceId)));
    return uniquePerformance.slice(0, limit);
  }

  // Master Data
  async getAllPartNumbers(): Promise<PartNumber[]> {
    return await db.select().from(partNumbers).where(eq(partNumbers.isActive, true)).orderBy(partNumbers.partNumber);
  }

  async createPartNumber(partNumber: InsertPartNumber): Promise<PartNumber> {
    const result = await db.insert(partNumbers).values(partNumber).returning();
    return result[0];
  }

  async getAllOrderNumbers(): Promise<OrderNumber[]> {
    return await db.select().from(orderNumbers).where(eq(orderNumbers.isActive, true)).orderBy(orderNumbers.orderNumber);
  }

  async createOrderNumber(orderNumber: InsertOrderNumber): Promise<OrderNumber> {
    const result = await db.insert(orderNumbers).values(orderNumber).returning();
    return result[0];
  }

  async getAllPerformanceIds(): Promise<PerformanceId[]> {
    return await db.select().from(performanceIds).where(eq(performanceIds.isActive, true)).orderBy(performanceIds.performanceId);
  }

  async createPerformanceId(performanceId: InsertPerformanceId): Promise<PerformanceId> {
    const result = await db.insert(performanceIds).values(performanceId).returning();
    return result[0];
  }

  async deleteBdeMachine(id: string): Promise<void> {
    await db.delete(bdeMachines).where(eq(bdeMachines.id, id));
  }

  async deleteFactoryUser(id: string): Promise<void> {
    await db.delete(factoryUsers).where(eq(factoryUsers.id, id));
  }

  async deletePartNumber(id: string): Promise<void> {
    await db.delete(partNumbers).where(eq(partNumbers.id, id));
  }

  async deleteOrderNumber(id: string): Promise<void> {
    await db.delete(orderNumbers).where(eq(orderNumbers.id, id));
  }

  async deletePerformanceId(id: string): Promise<void> {
    await db.delete(performanceIds).where(eq(performanceIds.id, id));
  }
}

export const storage = new DbStorage();
