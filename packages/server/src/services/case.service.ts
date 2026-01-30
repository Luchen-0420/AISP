import { pool } from '../db/client';

export interface CaseTemplate {
    id: string;
    disease_name: string;
    department: string;
    status: 'draft' | 'published';
    difficulty_level?: string; // This might be computed or joined
    created_at: Date;
}

export class CaseService {
    // Get all case templates (optionally filtered by teacher)
    static async getCaseTemplates(teacherId?: number): Promise<CaseTemplate[]> {
        const result = await pool.query(
            'SELECT * FROM case_templates WHERE created_by = $1 ORDER BY created_at DESC',
            [teacherId]
        );
        return result.rows;
    }

    // Get a specific case template
    static async getCaseTemplateById(id: string): Promise<CaseTemplate | null> {
        const result = await pool.query('SELECT * FROM case_templates WHERE id = $1', [id]);
        return result.rows[0] || null;
    }

    // Get variants for a specific case template
    static async getVariantsByTemplateId(templateId: string): Promise<any[]> {
        const result = await pool.query(
            'SELECT * FROM case_variants WHERE template_id = $1 ORDER BY created_at DESC',
            [templateId]
        );
        return result.rows;
    }

    // Get a specific case variant
    static async getVariantById(id: string): Promise<any | null> {
        const result = await pool.query('SELECT * FROM case_variants WHERE id = $1', [id]);
        return result.rows[0] || null;
    }

    // Get variants available for a specific student (based on their teacher)
    static async getVariantsForStudent(studentId: number): Promise<any[]> {
        const result = await pool.query(`
            SELECT DISTINCT v.id, v.variant_name, v.difficulty_level, v.created_at, t.disease_name 
            FROM case_variants v
            JOIN case_templates t ON v.template_id = t.id
            JOIN classes c ON c.teacher_id = t.created_by
            JOIN class_students cs ON cs.class_id = c.id
            WHERE cs.student_id = $1
            ORDER BY v.created_at DESC
        `, [studentId]);
        return result.rows;
    }

    static async createCaseTemplate(data: {
        disease_name: string;
        department: string;
        created_by: number;
        description?: string;
    }): Promise<CaseTemplate> {
        // Prepare default JSONs for required fields
        const patientInfo = { description: data.description || '' };
        const medicalInfo = {};
        const historyElements = {};

        const result = await pool.query(
            `INSERT INTO case_templates 
            (disease_name, department, created_by, scenario_type, patient_info, medical_info, history_elements, status, created_at) 
            VALUES ($1, $2, $3, 'standard', $4, $5, $6, 'published', NOW()) 
            RETURNING *`,
            [
                data.disease_name,
                data.department,
                data.created_by,
                JSON.stringify(patientInfo),
                JSON.stringify(medicalInfo),
                JSON.stringify(historyElements)
            ]
        );
        return result.rows[0];
    }

    static async deleteCaseTemplate(id: string): Promise<boolean> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            // Delete variants first
            await client.query('DELETE FROM case_variants WHERE template_id = $1', [id]);
            // Delete template
            await client.query('DELETE FROM case_templates WHERE id = $1', [id]);
            await client.query('COMMIT');
            return true;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    static async deleteVariant(id: string): Promise<boolean> {
        const result = await pool.query('DELETE FROM case_variants WHERE id = $1', [id]);
        return (result.rowCount || 0) > 0;
    }
}
