
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { CaseService } from '../services/case.service';

// Load env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function debug() {
    console.log("--- Starting Debug Script ---");

    // 1. Direct DB Connection Test
    const pool = new Pool({
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'zyj_test_demo',
        password: process.env.DB_PASSWORD || '123456',
        port: parseInt(process.env.DB_PORT || '5432'),
    });

    try {
        console.log("1. Testing DB Connection & Fetching Variant ID...");
        const res = await pool.query('SELECT id FROM case_variants LIMIT 1');
        if (res.rows.length === 0) {
            console.error("❌ No variants found in DB.");
            return;
        }
        const variantId = res.rows[0].id;
        console.log(`✅ Found Variant ID: ${variantId}`);

        // 2. Test CaseService
        console.log(`2. Testing CaseService.getVariantById('${variantId}')...`);
        const variant = await CaseService.getVariantById(variantId);

        if (variant) {
            console.log("✅ CaseService Returned Data:");
            console.log(JSON.stringify(variant, null, 2));
        } else {
            console.error("❌ CaseService returned null (or undefined).");
        }

    } catch (error: any) {
        console.error("❌ FATAL ERROR:", error);
        console.error("Stack:", error.stack);
    } finally {
        await pool.end();
        // Force exit if pool hangs
        process.exit(0);
    }
}

debug();
