import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
});
const migrate = async () => {
    try {
        console.log('Starting Phase 10 Auth Migration...');
        // 1. Add fields to users table
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS full_name VARCHAR(100),
            ADD COLUMN IF NOT EXISTS student_number VARCHAR(50),
            ADD COLUMN IF NOT EXISTS job_number VARCHAR(50);
        `);
        console.log('Updated users table.');
        // 2. Add invite_code to classes table
        await pool.query(`
            ALTER TABLE classes 
            ADD COLUMN IF NOT EXISTS invite_code VARCHAR(10) UNIQUE;
        `);
        console.log('Updated classes table.');
        console.log('Migration completed successfully.');
    }
    catch (error) {
        console.error('Migration failed:', error);
    }
    finally {
        await pool.end();
    }
};
migrate();
