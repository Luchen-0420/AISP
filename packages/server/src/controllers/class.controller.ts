import { Request, Response } from 'express';
import { ClassService } from '../services/class.service';
import { successResponse, errorResponse } from '../utils/response';

export class ClassController {
    static async getClasses(req: Request, res: Response) {
        try {
            // Assuming the authenticated user is the teacher
            // In a real middleware, req.user would be populated
            const teacherId = (req as any).user?.id;
            if (!teacherId) return errorResponse(res, 'Unauthorized', 401);

            const classes = await ClassService.getClassesByTeacherId(teacherId);
            return successResponse(res, classes);
        } catch (error: any) {
            return errorResponse(res, error.message);
        }
    }

    static async getClassDetail(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const classData = await ClassService.getClassById(id);
            if (!classData) return errorResponse(res, 'Class not found', 404);

            const students = await ClassService.getClassStudents(id);

            return successResponse(res, {
                ...classData,
                students
            });
        } catch (error: any) {
            return errorResponse(res, error.message);
        }
    }

    static async createClass(req: Request, res: Response) {
        try {
            const teacherId = (req as any).user?.id;
            if (!teacherId) return errorResponse(res, 'Unauthorized', 401);

            const { name, description } = req.body;
            const newClass = await ClassService.createClass(teacherId, name, description);

            return successResponse(res, newClass, 'Class created successfully');
        } catch (error: any) {
            return errorResponse(res, error.message);
        }
    }

    static async deleteClass(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await ClassService.deleteClass(id);
            return successResponse(res, null, 'Class deleted successfully');
        } catch (error: any) {
            return errorResponse(res, error.message);
        }
    }
}
