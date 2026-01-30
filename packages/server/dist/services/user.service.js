import { pool } from '../db/client';
export class UserService {
    static async findByUsername(username) {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        return result.rows[0] || null;
    }
    static async createUser(username, passwordHash, role = 'student', details) {
        const { fullName, studentNumber, jobNumber } = details || {};
        const result = await pool.query(`INSERT INTO users (username, password, role, full_name, student_number, job_number) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING id, username, role, full_name, created_at`, [username, passwordHash, role, fullName, studentNumber, jobNumber]);
        return result.rows[0];
    }
    static async findById(id) {
        const result = await pool.query('SELECT id, username, email, role, created_at FROM users WHERE id = $1', [id]);
        return result.rows[0] || null;
    }
    static async updatePassword(id, passwordHash) {
        await pool.query('UPDATE users SET password = $1 WHERE id = $2', [passwordHash, id]);
    }
}
