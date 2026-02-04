import { pool } from '../db/client';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function resetHistory() {
    try {
        const studentId = 4; // Hardcoded for 'student01' based on previous checks
        console.log(`Resetting history for student ${studentId}...`);

        await pool.query('DELETE FROM student_task_completions WHERE student_id = $1', [studentId]);

        console.log('History cleared successfully.');
        await pool.end();
    } catch (error) {
        console.error('Reset failed:', error);
        await pool.end();
        process.exit(1);
    }
}

resetHistory();
