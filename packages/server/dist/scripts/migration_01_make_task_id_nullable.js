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
async function migrate() {
    try {
        console.log('Starting migration: Make task_id nullable in student_task_completions...');
        await pool.query(`
            ALTER TABLE student_task_completions 
            ALTER COLUMN task_id DROP NOT NULL;
        `);
        console.log('✅ Migration successful: task_id is now nullable.');
    }
    catch (error) {
        console.error('❌ Migration failed:', error);
    }
    finally {
        await pool.end();
    }
}
migrate();
