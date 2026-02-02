import { pool } from '../db/client';
export class ClassService {
    // Get all classes for a specific teacher
    static async getClassesByTeacherId(teacherId) {
        const result = await pool.query('SELECT * FROM classes WHERE teacher_id = $1 ORDER BY created_at DESC', [teacherId]);
        return result.rows;
    }
    // Get a single class by ID
    static async getClassById(id) {
        const result = await pool.query('SELECT * FROM classes WHERE id = $1', [id]);
        return result.rows[0] || null;
    }
    // Create a new class with invite code
    static async createClass(teacherId, name, description) {
        // Generate random 6-digit invite code
        const inviteCode = Math.floor(100000 + Math.random() * 900000).toString();
        const result = await pool.query('INSERT INTO classes (teacher_id, name, description, invite_code) VALUES ($1, $2, $3, $4) RETURNING *', [teacherId, name, description, inviteCode]);
        return result.rows[0];
    }
    // Get students in a class
    static async getClassStudents(classId) {
        const result = await pool.query(`
            SELECT u.id, u.username, u.email, u.full_name, u.student_number, u.created_at
            FROM class_students cs
            JOIN users u ON cs.student_id = u.id
            WHERE cs.class_id = $1
        `, [classId]);
        return result.rows;
    }
    // Join class by invite code
    static async joinClassByInviteCode(studentId, inviteCode) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            // Find class by code
            const classRes = await client.query('SELECT * FROM classes WHERE invite_code = $1', [inviteCode]);
            if (classRes.rows.length === 0)
                throw new Error('Invalid invite code');
            const classObj = classRes.rows[0];
            // Add student to class
            await client.query('INSERT INTO class_students (class_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [classObj.id, studentId]);
            // Update student count
            await client.query(`UPDATE classes SET student_count = (
                    SELECT COUNT(*) FROM class_students WHERE class_id = $1
                ) WHERE id = $1`, [classObj.id]);
            await client.query('COMMIT');
            return classObj;
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    // Delete class (and associated student links)
    static async deleteClass(id) {
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
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    // Get class analytics
    static async getClassAnalytics(classId) {
        const result = await pool.query(`
            SELECT 
                AVG((opqrst_coverage->>'percentage')::int) as avg_coverage,
                AVG((final_score->>'empathy')::int) as avg_empathy,
                AVG((final_score->>'logic')::int) as avg_logic,
                AVG((final_score->>'detail')::int) as avg_detail,
                AVG((final_score->>'relevance')::int) as avg_relevance,
                COUNT(stc.id) as total_sessions
            FROM student_task_completions stc
            JOIN class_students cs ON stc.student_id = cs.student_id
            WHERE cs.class_id = $1
        `, [classId]);
        const row = result.rows[0];
        // Also get individual missed points
        const missedItemsRes = await pool.query(`
            SELECT item
            FROM student_task_completions stc
            JOIN class_students cs ON stc.student_id = cs.student_id
            CROSS JOIN LATERAL jsonb_array_elements_text(COALESCE(stc.opqrst_coverage->'missed', '[]')) as item
            WHERE cs.class_id = $1
            GROUP BY item
            ORDER BY count(*) DESC
            LIMIT 5
        `, [classId]);
        return {
            averages: {
                coverage: Math.round(row.avg_coverage || 0),
                empathy: Math.round(row.avg_empathy || 0),
                logic: Math.round(row.avg_logic || 0),
                detail: Math.round(row.avg_detail || 0),
                relevance: Math.round(row.avg_relevance || 0),
            },
            totalSessions: Number(row.total_sessions || 0),
            commonMissedItems: missedItemsRes.rows.map(r => r.item)
        };
    }
}
