import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { bdeMachines } from '@shared/schema';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

async function migratePasswords() {
  try {
    console.log('🔄 Starting password migration...');
    
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL not found');
      process.exit(1);
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle({ client: pool });

    const machines = await db.select().from(bdeMachines);
    
    console.log(`Found ${machines.length} machines to migrate`);

    for (const machine of machines) {
      console.log(`Processing machine: ${machine.machineId}`);
      
      const isAlreadyHashed = machine.password.startsWith('$2b$') || machine.password.startsWith('$2a$');
      
      if (isAlreadyHashed) {
        console.log(`  - Password already hashed, skipping hash update`);
      } else {
        console.log(`  - Hashing plain text password`);
        const hashedPassword = await bcrypt.hash(machine.password, 10);
        
        await db.update(bdeMachines)
          .set({ password: hashedPassword })
          .where(eq(bdeMachines.id, machine.id));
      }
      
      if (machine.machineId === 'BDE-1' && !machine.isAdmin) {
        console.log(`  - Setting BDE-1 as admin`);
        await db.update(bdeMachines)
          .set({ isAdmin: true })
          .where(eq(bdeMachines.id, machine.id));
      }
    }

    console.log('✅ Password migration completed successfully');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Password migration error:', error);
    process.exit(1);
  }
}

migratePasswords();
