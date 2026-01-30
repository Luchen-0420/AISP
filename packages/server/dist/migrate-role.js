import { pool } from './db/client';
async function migrate() {
    try {
        console.log('Checking if role column exists...');
        const res = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='role';
        `);
        if (res.rows.length === 0) {
            console.log('Column role does not exist. Adding it...');
            await pool.query(`ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'student';`);
            console.log('Column role added successfully.');
        }
        else {
            console.log('Column role already exists.');
        }
        // Optional: Update the specific teacher user if it exists to have 'teacher' role
        // The user said they registered "teacher/123456"
        console.log("Updating role for user 'teacher'...");
        await pool.query(`UPDATE users SET role = 'teacher' WHERE username = 'teacher';`);
        console.log("User 'teacher' role updated.");
        process.exit(0);
    }
    catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}
migrate();
