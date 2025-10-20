import { db } from "./db";
import { sql } from "drizzle-orm";

export async function initializeDatabase() {
  try {
    console.log('🔍 Checking and initializing database tables...');
    
    // Create tables if they don't exist
    // Using CREATE TABLE IF NOT EXISTS for safe initialization
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS bde_machines (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        machine_id TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        department TEXT NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        last_login_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS factory_users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        image_url TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS part_numbers (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        part_number TEXT NOT NULL UNIQUE,
        description TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS order_numbers (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        order_number TEXT NOT NULL UNIQUE,
        description TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS performance_ids (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        performance_id TEXT NOT NULL UNIQUE,
        description TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS work_sessions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        machine_id VARCHAR NOT NULL REFERENCES bde_machines(id),
        user_id VARCHAR NOT NULL REFERENCES factory_users(id),
        is_running BOOLEAN NOT NULL DEFAULT false,
        duration INTEGER NOT NULL DEFAULT 0,
        part_number TEXT,
        order_number TEXT,
        performance_id TEXT,
        started_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS work_logs (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        machine_id VARCHAR NOT NULL REFERENCES bde_machines(id),
        user_id VARCHAR NOT NULL REFERENCES factory_users(id),
        user_name TEXT NOT NULL,
        part_number TEXT NOT NULL,
        order_number TEXT NOT NULL,
        performance_id TEXT NOT NULL,
        duration INTEGER NOT NULL,
        is_modified BOOLEAN NOT NULL DEFAULT false,
        completed_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    console.log('✅ Database tables initialized successfully');
    return true;
  } catch (error: any) {
    console.error('❌ Database initialization error:', error.message);
    console.error('Full error:', error);
    // Don't throw - allow server to start
    // Errors will surface when database operations are attempted
    return false;
  }
}
