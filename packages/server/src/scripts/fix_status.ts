import { pool } from '../db/client';

async function fixStatus() {
    try {
        console.log('Connecting to database...');
        const result = await pool.query("UPDATE case_templates SET status = 'published'");
        console.log(`Updated ${result.rowCount} case templates to 'published'.`);
    } catch (error) {
        console.error('Error updating status:', error);
    } finally {
        await pool.end();
    }
}

fixStatus();
