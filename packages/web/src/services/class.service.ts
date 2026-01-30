import request from '../api/request';

export interface ClassData {
    id: string;
    teacher_id: number;
    name: string;
    description: string;
    student_count: number;
    created_at: string;
    students?: any[]; // Populated in detail view
}

export const classService = {
    getClasses: async () => {
        const response = await request.get('/classes') as { data: ClassData[] };
        return response.data || [];
    },

    getClassDetail: async (id: string) => {
        const response = await request.get(`/classes/${id}`) as { data: ClassData };
        return response.data;
    },

    createClass: async (data: { name: string; description?: string }) => {
        const response = await request.post('/classes', data) as { data: ClassData };
        return response.data;
    },

    deleteClass: async (id: string) => {
        await request.delete(`/classes/${id}`);
    }
};
