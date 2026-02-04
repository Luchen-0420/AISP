
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

async function fixVariant() {
    try {
        console.log("--- Fixing Variant Link (JS) ---");

        // 1. Find the target template (Coronary Heart Disease)
        const targetTemplateRes = await pool.query("SELECT id, disease_name FROM case_templates WHERE disease_name LIKE '%冠状动脉%' LIMIT 1");
        if (targetTemplateRes.rows.length === 0) {
            console.error("Target template not found!");
            return;
        }
        const targetTemplateId = targetTemplateRes.rows[0].id;
        console.log(`Target Template: ${targetTemplateRes.rows[0].disease_name} (${targetTemplateId})`);

        // 2. Find the misclassified variant (Wang Xiulan)
        const variantRes = await pool.query("SELECT id, variant_name, template_id FROM case_variants WHERE variant_name LIKE '%王秀兰%' LIMIT 1");
        if (variantRes.rows.length === 0) {
            console.error("Variant 'Wang Xiulan' not found!");
            return;
        }
        const variant = variantRes.rows[0];
        console.log(`Found Variant: ${variant.variant_name} (Current Template: ${variant.template_id})`);

        // 3. Update
        if (variant.template_id === targetTemplateId) {
            console.log("Variant is already properly linked. No action needed.");
        } else {
            await pool.query("UPDATE case_variants SET template_id = $1 WHERE id = $2", [targetTemplateId, variant.id]);
            console.log("✅ Successfully moved variant to correct template.");
        }

    } catch (error) {
        console.error('Fix failed:', error);
    } finally {
        await pool.end();
    }
}

fixVariant();
