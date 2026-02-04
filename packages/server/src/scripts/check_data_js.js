
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

async function checkData() {
    try {
        console.log("--- Checking Case Templates ---");
        const templates = await pool.query("SELECT id, disease_name, created_by FROM case_templates");
        console.table(templates.rows);

        console.log("\n--- Checking Case Variants ---");
        const variants = await pool.query(`
            SELECT v.id, v.template_id, v.variant_name, t.disease_name 
            FROM case_variants v 
            LEFT JOIN case_templates t ON v.template_id = t.id
        `);
        console.table(variants.rows.map(r => ({
            id: r.id.substring(0, 8) + '...',
            template_id: r.template_id.substring(0, 8) + '...',
            variant_trunc: r.variant_name.substring(0, 20) + '...',
            LINKED_DISEASE_NAME: r.disease_name
        })));
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

checkData();
