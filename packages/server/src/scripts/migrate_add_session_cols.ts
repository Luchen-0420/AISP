import { pool } from '../db/client';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function migrate() {
    try {
        console.log('Starting migration: Adding session columns to student_task_completions...');

        await pool.query(`
            ALTER TABLE student_task_completions
            ADD COLUMN IF NOT EXISTS session_data JSONB,
            ADD COLUMN IF NOT EXISTS opqrst_coverage JSONB,
            ADD COLUMN IF NOT EXISTS ai_feedback JSONB;
        `);

        console.log('Migration successful: Columns added.');
        await pool.end();
    } catch (error) {
        console.error('Migration failed:', error);
        await pool.end();
        process.exit(1);
    }
}

migrate();
