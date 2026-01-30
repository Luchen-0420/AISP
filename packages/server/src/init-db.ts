import { pool } from './db/client';
import fs from 'fs';
import path from 'path';

async function initDb() {
    try {
        console.log('Reading schema.sql...');
        const schemaPath = path.join(__dirname, 'db', 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema...');
        await pool.query(schemaSql);

        console.log('Database initialization completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Database initialization failed:', err);
        process.exit(1);
    }
}

initDb();
