import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'zyj_test_demo',
    password: process.env.DB_PASSWORD || '123456',
    port: parseInt(process.env.DB_PORT || '5432'),
});
/**
 * Migration: Add opqrst_coverage column to student_task_completions
 *
 * This column stores the OPQRST coverage data:
 * {
 *   covered: ['O', 'P', 'Q'], // Which dimensions were covered
 *   percentage: 50,           // Coverage percentage
 *   details: {                // Per-dimension details
 *     O: { asked: true, matchedKeywords: ['什么时候', '开始'] },
 *     P: { asked: false, matchedKeywords: [] },
 *     ...
 *   }
 * }
 */
async function migrate() {
    try {
        console.log('Starting migration: Add opqrst_coverage column...');
        await pool.query(`
            ALTER TABLE student_task_completions 
            ADD COLUMN IF NOT EXISTS opqrst_coverage JSONB DEFAULT '{}'::jsonb;
        `);
        console.log('✅ Migration successful: opqrst_coverage column added.');
    }
    catch (error) {
        console.error('❌ Migration failed:', error);
    }
    finally {
        await pool.end();
    }
}
migrate();
