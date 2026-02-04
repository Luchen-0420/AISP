import { pool } from '../db/client';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function debugCases() {
    try {
        console.log('--- Users ---');
        const users = await pool.query('SELECT id, username, role FROM users');
        console.table(users.rows);

        console.log('\n--- Student History (student_task_completions) ---');
        const history = await pool.query('SELECT id, student_id, variant_id, session_id FROM student_task_completions');
        console.table(history.rows);

        console.log('\n--- Case Variants ---');
        const variants = await pool.query('SELECT id, variant_name, difficulty_level FROM case_variants');
        console.table(variants.rows);

        await pool.end();
    } catch (e: any) {
        console.error('DB Connection Error:', e.message);
        await pool.end();
    }
}

debugCases();
