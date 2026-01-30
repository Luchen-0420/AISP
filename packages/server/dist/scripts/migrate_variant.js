import dotenv from 'dotenv';
import path from 'path';
// Load env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import { pool } from '../db/client';
async function migrate() {
    try {
        console.log('Starting migration...');
        // Add variant_name column
        await pool.query(`
            ALTER TABLE case_variants 
            ADD COLUMN IF NOT EXISTS variant_name VARCHAR(200);
        `);
        console.log('Added variant_name column.');
        console.log('Migration completed successfully.');
        process.exit(0);
    }
    catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}
migrate();
