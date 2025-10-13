import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import {
  bdeMachines,
  users,
  partNumbers,
  orderNumbers,
  performanceIds,
  workSessions,
  machineSessions,
  type InsertBDEMachine,
  type BDEMachine,
  type InsertUser,
  type User,
  type InsertPartNumber,
  type PartNumber,
  type InsertOrderNumber,
  type OrderNumber,
  type InsertPerformanceId,
  type PerformanceId,
  type InsertWorkSession,
  type WorkSession,
  type MachineSession,
} from "@shared/schema";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

export interface IStorage {
  // BDE Machines
  createBDEMachine(data: InsertBDEMachine): Promise<BDEMachine>;
  getBDEMachineByMachineId(machineId: string): Promise<BDEMachine | undefined>;
  getAllBDEMachines(): Promise<BDEMachine[]>;
  updateBDEMachinePassword(machineId: string, newPassword: string): Promise<void>;
  deleteBDEMachine(id: string): Promise<void>;
  updateLastLogin(machineId: string): Promise<void>;
  
  // Machine Sessions
  createMachineSession(machineId: string): Promise<MachineSession>;
  getMachineSession(sessionToken: string): Promise<MachineSession | undefined>;
  deactivateAllMachineSessions(machineId: string): Promise<void>;
  
  // Users
  createUser(data: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | undefined>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  
  // Part Numbers
  createPartNumber(data: InsertPartNumber): Promise<PartNumber>;
  getAllPartNumbers(): Promise<PartNumber[]>;
  deletePartNumber(id: string): Promise<void>;
  
  // Order Numbers
  createOrderNumber(data: InsertOrderNumber): Promise<OrderNumber>;
  getAllOrderNumbers(): Promise<OrderNumber[]>;
  deleteOrderNumber(id: string): Promise<void>;
  
  // Performance IDs
  createPerformanceId(data: InsertPerformanceId): Promise<PerformanceId>;
  getAllPerformanceIds(): Promise<PerformanceId[]>;
  deletePerformanceId(id: string): Promise<void>;
  
  // Work Sessions
  createWorkSession(data: InsertWorkSession): Promise<WorkSession>;
  getAllWorkSessions(): Promise<WorkSession[]>;
  getWorkSessionsByUser(userId: string): Promise<WorkSession[]>;
  getWorkSessionsByMachine(machineId: string): Promise<WorkSession[]>;
}

export class DatabaseStorage implements IStorage {
  // BDE Machines
  async createBDEMachine(data: InsertBDEMachine): Promise<BDEMachine> {
    const passwordHash = await bcrypt.hash(data.password, 10);
    const [machine] = await db
      .insert(bdeMachines)
      .values({
        machineId: data.machineId,
        passwordHash,
      })
      .returning();
    return machine;
  }

  async getBDEMachineByMachineId(machineId: string): Promise<BDEMachine | undefined> {
    const [machine] = await db
      .select()
      .from(bdeMachines)
      .where(eq(bdeMachines.machineId, machineId))
      .limit(1);
    return machine;
  }

  async getAllBDEMachines(): Promise<BDEMachine[]> {
    return await db.select().from(bdeMachines).orderBy(desc(bdeMachines.createdAt));
  }

  async updateBDEMachinePassword(machineId: string, newPassword: string): Promise<void> {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db
      .update(bdeMachines)
      .set({ passwordHash })
      .where(eq(bdeMachines.machineId, machineId));
  }

  async deleteBDEMachine(id: string): Promise<void> {
    await db.delete(bdeMachines).where(eq(bdeMachines.id, id));
  }

  async updateLastLogin(machineId: string): Promise<void> {
    await db
      .update(bdeMachines)
      .set({ lastLogin: new Date() })
      .where(eq(bdeMachines.machineId, machineId));
  }

  // Machine Sessions
  async createMachineSession(machineId: string): Promise<MachineSession> {
    const sessionToken = randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const [session] = await db
      .insert(machineSessions)
      .values({
        machineId,
        sessionToken,
        expiresAt,
      })
      .returning();
    return session;
  }

  async getMachineSession(sessionToken: string): Promise<MachineSession | undefined> {
    const [session] = await db
      .select()
      .from(machineSessions)
      .where(eq(machineSessions.sessionToken, sessionToken))
      .limit(1);
    return session;
  }

  async deactivateAllMachineSessions(machineId: string): Promise<void> {
    await db
      .update(machineSessions)
      .set({ isActive: false })
      .where(eq(machineSessions.machineId, machineId));
  }

  // Users
  async createUser(data: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.name);
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Part Numbers
  async createPartNumber(data: InsertPartNumber): Promise<PartNumber> {
    const [partNumber] = await db.insert(partNumbers).values(data).returning();
    return partNumber;
  }

  async getAllPartNumbers(): Promise<PartNumber[]> {
    return await db.select().from(partNumbers).orderBy(partNumbers.partNumber);
  }

  async deletePartNumber(id: string): Promise<void> {
    await db.delete(partNumbers).where(eq(partNumbers.id, id));
  }

  // Order Numbers
  async createOrderNumber(data: InsertOrderNumber): Promise<OrderNumber> {
    const [orderNumber] = await db.insert(orderNumbers).values(data).returning();
    return orderNumber;
  }

  async getAllOrderNumbers(): Promise<OrderNumber[]> {
    return await db.select().from(orderNumbers).orderBy(orderNumbers.orderNumber);
  }

  async deleteOrderNumber(id: string): Promise<void> {
    await db.delete(orderNumbers).where(eq(orderNumbers.id, id));
  }

  // Performance IDs
  async createPerformanceId(data: InsertPerformanceId): Promise<PerformanceId> {
    const [performanceId] = await db.insert(performanceIds).values(data).returning();
    return performanceId;
  }

  async getAllPerformanceIds(): Promise<PerformanceId[]> {
    return await db.select().from(performanceIds).orderBy(performanceIds.performanceId);
  }

  async deletePerformanceId(id: string): Promise<void> {
    await db.delete(performanceIds).where(eq(performanceIds.id, id));
  }

  // Work Sessions
  async createWorkSession(data: InsertWorkSession): Promise<WorkSession> {
    const [session] = await db.insert(workSessions).values(data).returning();
    return session;
  }

  async getAllWorkSessions(): Promise<WorkSession[]> {
    return await db.select().from(workSessions).orderBy(desc(workSessions.completedAt));
  }

  async getWorkSessionsByUser(userId: string): Promise<WorkSession[]> {
    return await db
      .select()
      .from(workSessions)
      .where(eq(workSessions.userId, userId))
      .orderBy(desc(workSessions.completedAt));
  }

  async getWorkSessionsByMachine(machineId: string): Promise<WorkSession[]> {
    return await db
      .select()
      .from(workSessions)
      .where(eq(workSessions.machineId, machineId))
      .orderBy(desc(workSessions.completedAt));
  }
}

export const storage = new DatabaseStorage();
