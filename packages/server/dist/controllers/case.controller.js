import { CaseService } from '../services/case.service';
import { CaseGenerationService } from '../services/case-generation.service';
import { successResponse, errorResponse } from '../utils/response';
export class CaseController {
    static async getCases(req, res) {
        try {
            const teacherId = req.user?.id;
            if (!teacherId)
                return errorResponse(res, 'Unauthorized', 401);
            const cases = await CaseService.getCaseTemplates(teacherId);
            return successResponse(res, cases);
        }
        catch (error) {
            return errorResponse(res, error.message);
        }
    }
    static async generateVariant(req, res) {
        try {
            const teacherId = req.user?.id;
            if (!teacherId)
                return errorResponse(res, 'Unauthorized', 401);
            const { id } = req.params; // template id
            const { difficulty, compliance, personality, aim } = req.body;
            // Extract BYOK headers
            const apiKey = req.headers['x-api-key'];
            const baseUrl = req.headers['x-base-url'];
            const modelName = req.headers['x-model-name'];
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
        }
        catch (error) {
            console.error("Controller Generate Error:", error);
            return errorResponse(res, error.message || "Generation Internal Error");
        }
    }
    static async saveVariant(req, res) {
        try {
            const { id } = req.params; // template id
            const { variantData } = req.body;
            const saved = await CaseGenerationService.saveVariant(id, variantData);
            return successResponse(res, saved, 'Variant saved successfully');
        }
        catch (error) {
            return errorResponse(res, error.message);
        }
    }
    static async getVariants(req, res) {
        try {
            const { id } = req.params; // template id
            const variants = await CaseService.getVariantsByTemplateId(id);
            return successResponse(res, variants);
        }
        catch (error) {
            return errorResponse(res, error.message);
        }
    }
    // Student API: Get all available variants
    static async getAllVariants(req, res) {
        try {
            const studentId = req.user?.id;
            if (!studentId)
                return errorResponse(res, 'Unauthorized', 401);
            const variants = await CaseService.getVariantsForStudent(studentId);
            return successResponse(res, variants);
        }
        catch (error) {
            return errorResponse(res, error.message);
        }
    }
    static async createCase(req, res) {
        try {
            const teacherId = req.user?.id;
            if (!teacherId)
                return errorResponse(res, 'Unauthorized', 401);
            const { disease_name, department, description } = req.body;
            if (!disease_name || !department)
                return errorResponse(res, 'Missing required fields', 400);
            const newCase = await CaseService.createCaseTemplate({
                disease_name,
                department,
                created_by: teacherId,
                description
            });
            return successResponse(res, newCase, 'Case template created successfully');
        }
        catch (error) {
            return errorResponse(res, error.message);
        }
    }
    static async deleteCase(req, res) {
        try {
            const teacherId = req.user?.id;
            if (!teacherId)
                return errorResponse(res, 'Unauthorized', 401);
            const { id } = req.params;
            await CaseService.deleteCaseTemplate(id);
            return successResponse(res, null, 'Case deleted successfully');
        }
        catch (error) {
            return errorResponse(res, error.message);
        }
    }
    static async deleteVariant(req, res) {
        try {
            const teacherId = req.user?.id;
            if (!teacherId)
                return errorResponse(res, 'Unauthorized', 401);
            const { id } = req.params;
            await CaseService.deleteVariant(id);
            return successResponse(res, null, 'Variant deleted successfully');
        }
        catch (error) {
            return errorResponse(res, error.message);
        }
    }
}
