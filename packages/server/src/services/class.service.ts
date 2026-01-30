import { pool } from '../db/client';

export interface Class {
    id: string;
    teacher_id: number;
    name: string;
    description?: string;
    student_count: number;
    created_at: Date;
}

export class ClassService {
    // Get all classes for a specific teacher
    static async getClassesByTeacherId(teacherId: number): Promise<Class[]> {
        const result = await pool.query(
            'SELECT * FROM classes WHERE teacher_id = $1 ORDER BY created_at DESC',
            [teacherId]
        );
        return result.rows;
    }

    // Get a single class by ID
    static async getClassById(id: string): Promise<Class | null> {
        const result = await pool.query('SELECT * FROM classes WHERE id = $1', [id]);
        return result.rows[0] || null;
    }

    // Create a new class with invite code
    static async createClass(teacherId: number, name: string, description?: string): Promise<Class> {
        // Generate random 6-digit invite code
        const inviteCode = Math.floor(100000 + Math.random() * 900000).toString();

        const result = await pool.query(
            'INSERT INTO classes (teacher_id, name, description, invite_code) VALUES ($1, $2, $3, $4) RETURNING *',
            [teacherId, name, description, inviteCode]
        );
        return result.rows[0];
    }

    // Get students in a class
    static async getClassStudents(classId: string) {
        const result = await pool.query(`
            SELECT u.id, u.username, u.email, u.full_name, u.student_number, u.created_at
            FROM class_students cs
            JOIN users u ON cs.student_id = u.id
            WHERE cs.class_id = $1
        `, [classId]);
        return result.rows;
    }

    // Join class by invite code
    static async joinClassByInviteCode(studentId: number, inviteCode: string): Promise<Class | null> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Find class by code
            const classRes = await client.query('SELECT * FROM classes WHERE invite_code = $1', [inviteCode]);
            if (classRes.rows.length === 0) throw new Error('Invalid invite code');

            const classObj = classRes.rows[0];

            // Add student to class
            await client.query(
                'INSERT INTO class_students (class_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                [classObj.id, studentId]
            );

            // Update student count
            await client.query(
                `UPDATE classes SET student_count = (
                    SELECT COUNT(*) FROM class_students WHERE class_id = $1
                ) WHERE id = $1`,
                [classObj.id]
            );

            await client.query('COMMIT');
            return classObj;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Delete class (and associated student links)
    static async deleteClass(id: string): Promise<boolean> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Delete class_students relations
            await client.query('DELETE FROM class_students WHERE class_id = $1', [id]);

            // 2. Delete task_assignments (if we had them implemented, ensuring cleanup)
            // await client.query('DELETE FROM task_assignments WHERE class_id = $1', [id]);

            // 3. Delete the class itself
            const result = await client.query('DELETE FROM classes WHERE id = $1', [id]);

            await client.query('COMMIT');
            return (result.rowCount || 0) > 0;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}
