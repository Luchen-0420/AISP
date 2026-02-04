
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'neurawork_db',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
});

async function checkTeacherView() {
    try {
        console.log("--- Checking Teacher View Logic ---");

        // 1. Get Teacher ID (from template 0ad8...)
        const teacherRes = await pool.query("SELECT created_by FROM case_templates LIMIT 1");
        const teacherId = teacherRes.rows[0].created_by;

        // 2. Simulate "Get Variants" call. 
        // If the teacher view lists variants by TEMPLATE, then they probably looked at the wrong template?
        // Or if there is an "All Variants" view that doesn't show the linked template?

        // Let's see all variants for this teacher
        const variants = await pool.query(`
            SELECT v.id, v.variant_name, t.disease_name as linked_template_disease
            FROM case_variants v
            JOIN case_templates t ON v.template_id = t.id
            WHERE t.created_by = $1
            ORDER BY v.created_at DESC
        `, [teacherId]);

        console.table(variants.rows.map(r => ({
            variant: r.variant_name.substring(0, 15) + '...',
            LINKED_TO: r.linked_template_disease
        })));

    } catch (error) {
        console.error('Check failed:', error);
    } finally {
        await pool.end();
    }
}

checkTeacherView();
