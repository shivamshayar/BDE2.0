import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// BDE Machines table
export const bdeMachines = pgTable("bde_machines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  machineId: text("machine_id").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastLogin: timestamp("last_login"),
});

export const insertBDEMachineSchema = createInsertSchema(bdeMachines).omit({
  id: true,
  passwordHash: true,
  createdAt: true,
  lastLogin: true,
}).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type InsertBDEMachine = z.infer<typeof insertBDEMachineSchema>;
export type BDEMachine = typeof bdeMachines.$inferSelect;

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  role: text("role").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Part Numbers table
export const partNumbers = pgTable("part_numbers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partNumber: text("part_number").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPartNumberSchema = createInsertSchema(partNumbers).omit({
  id: true,
  createdAt: true,
});

export type InsertPartNumber = z.infer<typeof insertPartNumberSchema>;
export type PartNumber = typeof partNumbers.$inferSelect;

// Order Numbers table
export const orderNumbers = pgTable("order_numbers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: text("order_number").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertOrderNumberSchema = createInsertSchema(orderNumbers).omit({
  id: true,
  createdAt: true,
});

export type InsertOrderNumber = z.infer<typeof insertOrderNumberSchema>;
export type OrderNumber = typeof orderNumbers.$inferSelect;

// Performance IDs table
export const performanceIds = pgTable("performance_ids", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  performanceId: text("performance_id").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPerformanceIdSchema = createInsertSchema(performanceIds).omit({
  id: true,
  createdAt: true,
});

export type InsertPerformanceId = z.infer<typeof insertPerformanceIdSchema>;
export type PerformanceId = typeof performanceIds.$inferSelect;

// Work Sessions table
export const workSessions = pgTable("work_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  machineId: varchar("machine_id").notNull().references(() => bdeMachines.id, { onDelete: "cascade" }),
  partNumber: text("part_number").notNull(),
  orderNumber: text("order_number").notNull(),
  performanceId: text("performance_id").notNull(),
  duration: integer("duration").notNull(), // in seconds
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
});

export const insertWorkSessionSchema = createInsertSchema(workSessions).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});

export type InsertWorkSession = z.infer<typeof insertWorkSessionSchema>;
export type WorkSession = typeof workSessions.$inferSelect;

// Machine Sessions (for tracking active logins)
export const machineSessions = pgTable("machine_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  machineId: varchar("machine_id").notNull().references(() => bdeMachines.id, { onDelete: "cascade" }),
  sessionToken: text("session_token").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

export type MachineSession = typeof machineSessions.$inferSelect;
