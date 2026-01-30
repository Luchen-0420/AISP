
import request from '../api/request';

export interface TrainingSessionData {
    variantId: string;
    sessionId: string;
    scores: any;
    history: any[];
    soapData: any;
    taskId?: string; // Optional for free practice
}

export const trainingService = {
    submitSession: async (data: TrainingSessionData) => {
        return request.post('/training/submit', data);
    },

    async getHistory() {
        return request.get('/training/history');
    }
};
