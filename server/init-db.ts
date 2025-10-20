import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { Pool } from '@neondatabase/serverless';
import * as schema from "@shared/schema";

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
