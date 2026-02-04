
import { Request, Response } from 'express';
import { pool } from '../db/client';
import { successResponse, errorResponse } from '../utils/response';
import { aiService } from '../services/ai.service';

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
                taskId, // Optional, might be null for free practice
                opqrstCoverage // OPQRST coverage data
            } = req.body;

            // Extract API config for AI feedback generation
            const apiKey = (req.headers['x-custom-api-key'] || req.headers['x-api-key']) as string;
            const baseUrl = (req.headers['x-custom-base-url'] || req.headers['x-base-url']) as string;
            const modelName = req.headers['x-model-name'] as string;

            // Simple MVP Validation
            if (!variantId || !sessionId) {
                return errorResponse(res, 'Missing required session data', 400);
            }

            // Calculate final score
            const finalScore = {
                ...scores,
                total: Object.values(scores || {}).reduce((a: any, b: any) => a + b, 0) as number
            };

            // Prepare session data for replay
            const sessionData = {
                messages: history || [],
                soapData: soapData || {}
            };

            // Generate AI feedback with resource recommendations
            // Only generate if there is actual student interaction
            const hasStudentInteraction = history && history.some((m: any) => m.role === 'doctor' || m.role === 'student'); // compatible with both roles
            let aiFeedback = null;

            if (hasStudentInteraction && apiKey) {
                try {
                    // Get variant context for AI
                    const { CaseService } = await import('../services/case.service');
                    const variant = await CaseService.getVariantById(variantId);

                    const patientContext = variant
                        ? `诊断：${variant.disease_name || variant.medical_info?.diagnosis}。主诉：${variant.medical_info?.chief_complaint}。`
                        : '标准病例上下文';

                    aiFeedback = await aiService.generateSessionFeedback(history, patientContext, {
                        apiKey,
                        baseUrl,
                        modelName
                    });
                    console.log('AI Feedback generated successfully');
                } catch (aiError) {
                    console.error('Failed to generate AI feedback:', aiError);
                    // Continue without feedback - don't block submission
                }
            }

            // Save to DB (with opqrst_coverage and ai_feedback)
            const query = `
                INSERT INTO student_task_completions 
                (student_id, variant_id, session_id, task_id, final_score, session_data, opqrst_coverage, ai_feedback, created_at, started_at, completed_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), NOW())
                RETURNING id
            `;

            const values = [
                studentId,
                variantId,
                sessionId,
                taskId || null,
                JSON.stringify(finalScore),
                JSON.stringify(sessionData),
                JSON.stringify(opqrstCoverage || {}),
                aiFeedback ? JSON.stringify(aiFeedback) : null
            ];

            const result = await pool.query(query, values);

            return successResponse(res, {
                completionId: result.rows[0].id,
                aiFeedback, // Return feedback to frontend for immediate display
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

    static async getSessionById(req: Request, res: Response) {
        try {
            // @ts-ignore - user added by auth middleware
            const studentId = req.user?.id;
            const { id } = req.params;

            if (!studentId) return errorResponse(res, 'User not found', 404);
            if (!id) return errorResponse(res, 'Session ID required', 400);

            const result = await pool.query(`
                SELECT 
                    stc.id,
                    stc.session_id,
                    stc.variant_id,
                    stc.created_at,
                    stc.completed_at,
                    stc.final_score,
                    stc.session_data,
                    stc.ai_feedback,
                    stc.opqrst_coverage,
                    cv.variant_name,
                    ct.disease_name
                FROM student_task_completions stc
                LEFT JOIN case_variants cv ON stc.variant_id = cv.id
                LEFT JOIN case_templates ct ON cv.template_id = ct.id
                WHERE stc.id = $1 AND stc.student_id = $2
            `, [id, studentId]);

            if (result.rows.length === 0) {
                return errorResponse(res, 'Session not found', 404);
            }

            return successResponse(res, result.rows[0]);
        } catch (error: any) {
            console.error('getSessionById error:', error);
            return errorResponse(res, error.message);
        }
    }


    static async getRecommendations(req: Request, res: Response) {
        try {
            // @ts-ignore
            const studentId = req.user?.id;
            if (!studentId) return errorResponse(res, 'User not found', 404);

            // 1. Analyze recent performance (last 5 sessions)
            const historyRes = await pool.query(`
                SELECT final_score 
                FROM student_task_completions 
                WHERE student_id = $1 
                ORDER BY created_at DESC 
                LIMIT 5
            `, [studentId]);

            let weakness = 'general';
            let reason = '开始您的问诊训练之旅';

            if (historyRes.rows.length > 0) {
                const totalEmpathy = historyRes.rows.reduce((sum, r) => sum + (r.final_score.empathy || 0), 0);
                const totalLogic = historyRes.rows.reduce((sum, r) => sum + (r.final_score.logic || 0), 0);
                const count = historyRes.rows.length;

                const avgEmpathy = totalEmpathy / count;
                const avgLogic = totalLogic / count;

                if (avgEmpathy < 60) {
                    weakness = 'empathy';
                    reason = '这是个锻炼共情能力的好机会';
                } else if (avgLogic < 60) {
                    weakness = 'logic';
                    reason = '挑战复杂病例，提升临床逻辑';
                } else {
                    weakness = 'advanced';
                    reason = '尝试更高难度的病例';
                }
            }

            // 2. Find recommended variants (not completed yet)
            // Logic: 
            // - If weakness is empathy, prefer 'Hard' or 'Medium' difficulty? Actually, let's just pick unplayed cases.
            // - If weakness is logic, prefer 'Hard'.
            // - General: just pick random unplayed.

            let difficultyFilter = '';
            if (weakness === 'logic' || weakness === 'advanced') {
                difficultyFilter = "AND cv.difficulty_level = 'Hard'";
            } else if (weakness === 'empathy') {
                difficultyFilter = "AND (cv.difficulty_level = 'Medium' OR cv.difficulty_level = 'Hard')";
            }

            // Fallback: if no hard/medium cases, just get simple ones.
            // So we construct a query that tries to match criteria, but we can also just get unplayed ones and filter in code or sort.
            // Let's doing simple SQL for now.

            const query = `
                SELECT cv.id, cv.variant_name, cv.difficulty_level, ct.disease_name
                FROM case_variants cv
                JOIN case_templates ct ON cv.template_id = ct.id
                JOIN classes c ON ct.created_by = c.teacher_id
                JOIN class_students cs ON c.id = cs.class_id
                WHERE cs.student_id = $1
                AND cv.id NOT IN (SELECT variant_id FROM student_task_completions WHERE student_id = $1)
                ${difficultyFilter ? difficultyFilter : ''}
                ORDER BY RANDOM()
                LIMIT 3
            `;

            let recRes = await pool.query(query, [studentId]);

            // If strict filter yielded no results, try without filter
            if (recRes.rows.length === 0 && difficultyFilter) {
                const fallbackQuery = `
                    SELECT cv.id, cv.variant_name, cv.difficulty_level, ct.disease_name
                    FROM case_variants cv
                    JOIN case_templates ct ON cv.template_id = ct.id
                    JOIN classes c ON ct.created_by = c.teacher_id
                    JOIN class_students cs ON c.id = cs.class_id
                    WHERE cs.student_id = $1
                    AND cv.id NOT IN (SELECT variant_id FROM student_task_completions WHERE student_id = $1)
                    ORDER BY RANDOM()
                    LIMIT 3
                `;
                recRes = await pool.query(fallbackQuery, [studentId]);
                reason = '探索更多新病例';
            }

            const recommendations = recRes.rows.map(r => ({
                ...r,
                reason: reason
            }));

            return successResponse(res, recommendations);
        } catch (error: any) {
            console.error('getRecommendations error:', error);
            return errorResponse(res, error.message);
        }
    }

    static async exportOSCE(req: Request, res: Response) {
        try {
            // @ts-ignore
            const studentId = req.user?.id;
            const { id } = req.params;

            if (!studentId) return errorResponse(res, 'User not found', 404);

            const result = await pool.query(`
                SELECT 
                    stc.*,
                    u.full_name, u.student_number,
                    cv.variant_name,
                    ct.disease_name
                FROM student_task_completions stc
                JOIN users u ON stc.student_id = u.id
                LEFT JOIN case_variants cv ON stc.variant_id = cv.id
                LEFT JOIN case_templates ct ON cv.template_id = ct.id
                WHERE stc.id = $1 AND stc.student_id = $2
            `, [id, studentId]);

            if (result.rows.length === 0) return errorResponse(res, 'Session not found', 404);

            const session = result.rows[0];
            const scores: any = session.final_score || {};
            const coverage: any = session.opqrst_coverage || {};

            // Generate CSV
            let csvContent = '\uFEFF'; // BOM for Excel
            csvContent += `Student Name,${session.full_name || 'N/A'}\n`;
            csvContent += `Student ID,${session.student_number || 'N/A'}\n`;
            csvContent += `Case,${session.disease_name} - ${session.variant_name}\n`;
            csvContent += `Date,${new Date(session.created_at).toLocaleString()}\n\n`;

            csvContent += `=== OSCE Score Report ===\n\n`;
            csvContent += `Dimension,Score,Max Score\n`;
            csvContent += `History Taking (Coverage),${coverage.percentage || 0},100\n`;
            csvContent += `Empathy & Communication,${scores.empathy || 0},100\n`;
            csvContent += `Clinical Logic,${scores.logic || 0},100\n`;
            csvContent += `Detail & Accuracy,${scores.detail || 0},100\n`;
            csvContent += `Relevance,${scores.relevance || 0},100\n`;
            const totalBase = (Object.values(scores) as number[]).reduce((a, b) => a + b, 0);
            const total = totalBase + ((coverage.percentage || 0) * 0.2);
            csvContent += `TOTAL SCORE,${total},N/A\n\n`;

            csvContent += `=== Missed Points ===\n`;
            if (coverage.missed && Array.isArray(coverage.missed)) {
                coverage.missed.forEach((m: string) => csvContent += `- ${m}\n`);
            } else {
                csvContent += `None\n`;
            }

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=OSCE_Report_${id}.csv`);
            res.send(csvContent);

        } catch (error: any) {
            console.error('Export Error:', error);
            return errorResponse(res, error.message);
        }
    }
}

