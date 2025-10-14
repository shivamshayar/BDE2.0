import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// BDE Machines (for login)
export const bdeMachines = pgTable("bde_machines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  machineId: text("machine_id").notNull().unique(),
  password: text("password").notNull(),
  department: text("department").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBdeMachineSchema = createInsertSchema(bdeMachines).omit({
  id: true,
  lastLoginAt: true,
  createdAt: true,
});

export type InsertBdeMachine = z.infer<typeof insertBdeMachineSchema>;
export type BdeMachine = typeof bdeMachines.$inferSelect;

// Factory Users (workers)
export const factoryUsers = pgTable("factory_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  role: text("role").notNull(),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFactoryUserSchema = createInsertSchema(factoryUsers).omit({
  id: true,
  createdAt: true,
});

export type InsertFactoryUser = z.infer<typeof insertFactoryUserSchema>;
export type FactoryUser = typeof factoryUsers.$inferSelect;

// Work Sessions (active tracking)
export const workSessions = pgTable("work_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  machineId: varchar("machine_id").notNull().references(() => bdeMachines.id),
  userId: varchar("user_id").notNull().references(() => factoryUsers.id),
  isRunning: boolean("is_running").notNull().default(false),
  duration: integer("duration").notNull().default(0),
  partNumber: text("part_number"),
  orderNumber: text("order_number"),
  performanceId: text("performance_id"),
  startedAt: timestamp("started_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWorkSessionSchema = createInsertSchema(workSessions).omit({
  id: true,
  createdAt: true,
});

export type InsertWorkSession = z.infer<typeof insertWorkSessionSchema>;
export type WorkSession = typeof workSessions.$inferSelect;

// Work Logs (completed work history)
export const workLogs = pgTable("work_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  machineId: varchar("machine_id").notNull().references(() => bdeMachines.id),
  userId: varchar("user_id").notNull().references(() => factoryUsers.id),
  userName: text("user_name").notNull(),
  partNumber: text("part_number").notNull(),
  orderNumber: text("order_number").notNull(),
  performanceId: text("performance_id").notNull(),
  duration: integer("duration").notNull(),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
});

export const insertWorkLogSchema = createInsertSchema(workLogs).omit({
  id: true,
  completedAt: true,
});

export type InsertWorkLog = z.infer<typeof insertWorkLogSchema>;
export type WorkLog = typeof workLogs.$inferSelect;

// Part Numbers (master data)
export const partNumbers = pgTable("part_numbers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partNumber: text("part_number").notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPartNumberSchema = createInsertSchema(partNumbers).omit({
  id: true,
  createdAt: true,
});

export type InsertPartNumber = z.infer<typeof insertPartNumberSchema>;
export type PartNumber = typeof partNumbers.$inferSelect;

// Order Numbers (master data)
export const orderNumbers = pgTable("order_numbers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: text("order_number").notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertOrderNumberSchema = createInsertSchema(orderNumbers).omit({
  id: true,
  createdAt: true,
});

export type InsertOrderNumber = z.infer<typeof insertOrderNumberSchema>;
export type OrderNumber = typeof orderNumbers.$inferSelect;

// Performance IDs (master data)
export const performanceIds = pgTable("performance_ids", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  performanceId: text("performance_id").notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPerformanceIdSchema = createInsertSchema(performanceIds).omit({
  id: true,
  createdAt: true,
});

export type InsertPerformanceId = z.infer<typeof insertPerformanceIdSchema>;
export type PerformanceId = typeof performanceIds.$inferSelect;
