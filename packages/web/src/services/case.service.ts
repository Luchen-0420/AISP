import request from '../api/request';

export interface CaseData {
    id: string;
    disease_name: string;
    department: string;
    status: 'draft' | 'published';
    difficulty_level?: string;
    created_at: string;
}

export const caseService = {
    getCases: async () => {
        const response = await request.get('/cases') as { data: CaseData[] };
        return response.data || [];
    },

    createCase: async (data: { disease_name: string; department: string; description?: string }) => {
        const response = await request.post('/cases', data) as { data: CaseData };
        return response.data;
    },

    deleteCase: async (id: string) => {
        return request.delete(`/cases/${id}`);
    },

    deleteVariant: async (id: string) => {
        return request.delete(`/variants/${id}`);
    },

    getVariantById: async (id: string) => {
        const response = await request.get(`/variants/${id}`) as { data: any };
        return response.data || null;
    },

    getVariants: async (templateId: string) => {
        const response = await request.get(`/cases/${templateId}/variants`) as { data: any[] };
        return response.data || [];
    },

    getAllVariants: async () => {
        const response = await request.get('/daily-variants') as { data: any[] };
        return response.data || [];
    }
};
