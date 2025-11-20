import { db } from './db';
import * as schema from "@shared/schema";
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export async function initializeDatabase() {
  try {
    console.log('🔍 Checking and initializing database tables...');
    
    // Create tables if they don't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS bde_machines (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        machine_id TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        department TEXT NOT NULL,
        is_admin BOOLEAN NOT NULL DEFAULT false,
        is_active BOOLEAN NOT NULL DEFAULT true,
        last_login_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS factory_users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        image_url TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
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
      );
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
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS part_numbers (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        part_number TEXT NOT NULL UNIQUE,
        description TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS order_numbers (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        order_number TEXT NOT NULL UNIQUE,
        description TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Drop and recreate performance_ids table with new schema
    // await db.execute(sql`DROP TABLE IF EXISTS performance_ids CASCADE;`);
    
    await db.execute(sql`
      CREATE TABLE performance_ids (
        performance_id TEXT PRIMARY KEY,
        performance_name TEXT NOT NULL,
        description TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    console.log('✅ Database tables initialized successfully');

    // Seed default admin user if no admin machines exist
    const existingAdmins = await db.select().from(schema.bdeMachines).where(eq(schema.bdeMachines.isAdmin, true));
    
    if (existingAdmins.length === 0) {
      console.log('🌱 Seeding default admin machine...');
      const hashedPassword = await bcrypt.hash('1234', 10);
      
      await db.insert(schema.bdeMachines).values({
        machineId: 'BDE-1',
        password: hashedPassword,
        department: 'Administration',
        isAdmin: true,
        isActive: true
      });
      
      console.log('✅ Default admin machine created (Machine ID: BDE-1)');
    }
    
    return true;
  } catch (error: any) {
    // Check if error is about tables already existing
    if (error.message && (
      error.message.includes('already exists') || 
      error.message.includes('relation') && error.message.includes('already exists')
    )) {
      console.log('✅ Database tables already exist');
      
      // Still try to seed admin user even if tables exist
      try {
        const existingAdmins = await db.select().from(schema.bdeMachines).where(eq(schema.bdeMachines.isAdmin, true));
        
        if (existingAdmins.length === 0) {
          console.log('🌱 Seeding default admin machine...');
          const hashedPassword = await bcrypt.hash('1234', 10);
          
          await db.insert(schema.bdeMachines).values({
            machineId: 'BDE-1',
            password: hashedPassword,
            department: 'Administration',
            isAdmin: true,
            isActive: true
          });
          
          console.log('✅ Default admin machine created (Machine ID: BDE-1)');
        }
      } catch (seedError) {
        console.log('ℹ️ Admin seeding skipped (may already exist)');
      }
      
      return true;
    }
    
    console.error('❌ Database initialization error:', error.message);
    console.error('Full error:', error);
    // Don't throw - allow server to start
    // Errors will surface when database operations are attempted
    return false;
  }
}
