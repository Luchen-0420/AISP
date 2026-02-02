import dotenv from 'dotenv';
import path from 'path';
// Load env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import { pool } from '../db/client';
async function migrate() {
    try {
        console.log('Starting migration 03: Add difficulty_level...');
        // Add difficulty_level column
        await pool.query(`
            ALTER TABLE case_variants 
            ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(20) DEFAULT 'medium',
            ADD COLUMN IF NOT EXISTS estimated_duration INT DEFAULT 20;
        `);
        console.log('Added difficulty_level and estimated_duration columns.');
        console.log('Migration 03 completed successfully.');
        process.exit(0);
    }
    catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}
migrate();
