
import { Request, Response } from 'express';
import { pool } from '../db/client';
import { successResponse, errorResponse } from '../utils/response';

export class TrainingController {
    static async submitSession(req: Request, res: Response) {
        try {
            const studentId = (req as any).user?.id;
            if (!studentId) return errorResponse(res, 'Unauthorized', 401);

            const {
                variantId,
                sessionId,
                scores,
                history,
                soapData,
                taskId // Optional, might be null for free practice
            } = req.body;

            // Simple MVP Validation
            if (!variantId || !sessionId) {
                return errorResponse(res, 'Missing required session data', 400);
            }

            // Calculate mock feedback (Phase 9 MVP) or use what AI provided if implemented in future
            // For now, construct a simple JSON for final_score
            const finalScore = {
                ...scores,
                total: Object.values(scores).reduce((a: any, b: any) => a + b, 0) as number
            };

            // Save to DB
            // Note: scores, feedback, etc. are stored in JSONB columns
            const query = `
                INSERT INTO student_task_completions 
                (student_id, variant_id, session_id, task_id, final_score, created_at, started_at, completed_at)
                VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), NOW())
                RETURNING id
            `;

            const values = [
                studentId,
                variantId,
                sessionId,
                taskId || null,
                JSON.stringify(finalScore)
            ];

            const result = await pool.query(query, values);

            return successResponse(res, {
                completionId: result.rows[0].id,
                redirect: '/student'
            }, 'Session submitted successfully');

        } catch (error: any) {
            console.error('Submit Session Error:', error);
            return errorResponse(res, error.message || 'Failed to submit session');
        }
    }

    static async getStudentHistory(req: Request, res: Response) {
        try {
            // @ts-ignore - user added by auth middleware
            const studentId = req.user?.id;
            if (!studentId) return errorResponse(res, 'User not found', 404);

            const result = await pool.query(`
                SELECT 
                    stc.id,
                    stc.session_id,
                    stc.created_at,
                    stc.completed_at,
                    stc.final_score,
                    cv.variant_name,
                    ct.disease_name
                FROM student_task_completions stc
                LEFT JOIN case_variants cv ON stc.variant_id = cv.id
                LEFT JOIN case_templates ct ON cv.template_id = ct.id
                WHERE stc.student_id = $1
                ORDER BY stc.created_at DESC
            `, [studentId]);

            return successResponse(res, result.rows);
        } catch (error: any) {
            console.error('getStudentHistory error:', error);
            return errorResponse(res, error.message);
        }
    }
}
