
import path from 'path';
import dotenv from 'dotenv';

// Load env from server package
dotenv.config({ path: path.resolve(__dirname, '../packages/server/.env') });

import { pool } from '../packages/server/src/db/client';

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
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
