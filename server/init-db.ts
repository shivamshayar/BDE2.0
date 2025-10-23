import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { Pool } from '@neondatabase/serverless';
import * as schema from "@shared/schema";
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

export async function initializeDatabase() {
  try {
    console.log('🔍 Checking and initializing database tables...');
    
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL not found');
      return false;
    }

    // Create a new pool for migration
    const migrationPool = new Pool({ connectionString: process.env.DATABASE_URL });
    const migrationDb = drizzle({ client: migrationPool, schema });

    // Run migrations
    await migrate(migrationDb, { migrationsFolder: './migrations' });
    
    // Seed default admin user if no admin machines exist
    const existingAdmins = await migrationDb.select().from(schema.bdeMachines).where(eq(schema.bdeMachines.isAdmin, true));
    
    if (existingAdmins.length === 0) {
      console.log('🌱 Seeding default admin machine...');
      const hashedPassword = await bcrypt.hash('1234', 10);
      
      await migrationDb.insert(schema.bdeMachines).values({
        machineId: 'BDE-1',
        password: hashedPassword,
        department: 'Administration',
        isAdmin: true,
        isActive: true
      });
      
      console.log('✅ Default admin machine created (Machine ID: BDE-1)');
    }
    
    // Close the migration pool
    await migrationPool.end();
    
    console.log('✅ Database tables initialized successfully');
    return true;
  } catch (error: any) {
    // Check if error is about tables already existing
    if (error.message && (
      error.message.includes('already exists') || 
      error.message.includes('relation') && error.message.includes('already exists')
    )) {
      console.log('✅ Database tables already exist');
      return true;
    }
    
    console.error('❌ Database initialization error:', error.message);
    console.error('Full error:', error);
    // Don't throw - allow server to start
    // Errors will surface when database operations are attempted
    return false;
  }
}
