import { Request, Response } from 'express';
import { CaseService } from '../services/case.service';
import { CaseGenerationService } from '../services/case-generation.service';
import { successResponse, errorResponse } from '../utils/response';

export class CaseController {
    static async getCases(req: Request, res: Response) {
        try {
            const teacherId = (req as any).user?.id;
            if (!teacherId) return errorResponse(res, 'Unauthorized', 401);

            const cases = await CaseService.getCaseTemplates(teacherId);
            return successResponse(res, cases);
        } catch (error: any) {
            return errorResponse(res, error.message);
        }
    }

    static async generateVariant(req: Request, res: Response) {
        try {
            const teacherId = (req as any).user?.id;
            if (!teacherId) return errorResponse(res, 'Unauthorized', 401);

            const { id } = req.params; // template id
            const { difficulty, compliance, personality, aim } = req.body;

            // Extract BYOK headers
            const apiKey = req.headers['x-api-key'] as string;
            const baseUrl = req.headers['x-base-url'] as string;
            const modelName = req.headers['x-model-name'] as string;

            console.log("Input Headers:", {
                apiKey: apiKey ? `${apiKey.substring(0, 5)}...` : 'undefined',
                baseUrl,
                modelName
            });

            // Generate
            const variantData = await CaseGenerationService.generateVariant(id, {
                difficulty, compliance, personality, aim
            }, { apiKey, baseUrl, modelName });

            // Return preview (not saved yet, or can be saved based on Requirement. 
            // Plan says: "preview first". But for simplicity in Phase 8 MVP, let's just return data for frontend to preview)

            return successResponse(res, variantData, 'Variant generated successfully');
        } catch (error: any) {
            console.error("Controller Generate Error:", error);
            return errorResponse(res, error.message || "Generation Internal Error");
        }
    }

    static async saveVariant(req: Request, res: Response) {
        try {
            const { id } = req.params; // template id
            const { variantData } = req.body;

            const saved = await CaseGenerationService.saveVariant(id, variantData);
            return successResponse(res, saved, 'Variant saved successfully');
        } catch (error: any) {
            return errorResponse(res, error.message);
        }
    }

    static async getVariants(req: Request, res: Response) {
        try {
            const { id } = req.params; // template id
            const variants = await CaseService.getVariantsByTemplateId(id);
            return successResponse(res, variants);
        } catch (error: any) {
            return errorResponse(res, error.message);
        }
    }

    // Student API: Get all available variants
    static async getAllVariants(req: Request, res: Response) {
        try {
            const studentId = (req as any).user?.id;
            if (!studentId) return errorResponse(res, 'Unauthorized', 401);

            const variants = await CaseService.getVariantsForStudent(studentId);
            return successResponse(res, variants);
        } catch (error: any) {
            return errorResponse(res, error.message);
        }
    }

    static async createCase(req: Request, res: Response) {
        try {
            const teacherId = (req as any).user?.id;
            if (!teacherId) return errorResponse(res, 'Unauthorized', 401);

            const { disease_name, department, description } = req.body;
            if (!disease_name || !department) return errorResponse(res, 'Missing required fields', 400);

            const newCase = await CaseService.createCaseTemplate({
                disease_name,
                department,
                created_by: teacherId,
                description
            });

            return successResponse(res, newCase, 'Case template created successfully');
        } catch (error: any) {
            return errorResponse(res, error.message);
        }
    }

    static async deleteCase(req: Request, res: Response) {
        try {
            const teacherId = (req as any).user?.id;
            if (!teacherId) return errorResponse(res, 'Unauthorized', 401);

            const { id } = req.params;
            await CaseService.deleteCaseTemplate(id);
            return successResponse(res, null, 'Case deleted successfully');
        } catch (error: any) {
            return errorResponse(res, error.message);
        }
    }

    static async deleteVariant(req: Request, res: Response) {
        try {
            const teacherId = (req as any).user?.id;
            if (!teacherId) return errorResponse(res, 'Unauthorized', 401);

            const { id } = req.params;
            await CaseService.deleteVariant(id);
            return successResponse(res, null, 'Variant deleted successfully');
        } catch (error: any) {
            return errorResponse(res, error.message);
        }
    }

    static async getVariant(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(id)) {
                return errorResponse(res, `Invalid UUID format: ${id}`, 400);
            }

            const variant = await CaseService.getVariantById(id);
            if (!variant) return errorResponse(res, 'Variant not found', 404);
            return successResponse(res, variant);
        } catch (error: any) {
            console.error('getVariant Error:', error);
            return errorResponse(res, error.message);
        }
    }
}
