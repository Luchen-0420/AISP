
import request from '../api/request';
import { OPQRSTCoverage } from '../utils/opqrst';
import { useUserStore } from '../store/userStore';

export interface TrainingSessionData {
    variantId: string;
    sessionId: string;
    scores: any;
    history: any[];
    soapData: any;
    taskId?: string; // Optional for free practice
    opqrstCoverage?: OPQRSTCoverage; // OPQRST coverage data
}

export const trainingService = {
    submitSession: async (data: TrainingSessionData) => {
        // Get API keys for AI feedback generation
        const { apiKey, apiBaseUrl, modelName } = useUserStore.getState();

        return request.post('/training/submit', data, {
            headers: {
                'x-custom-api-key': apiKey || '',
                'x-custom-base-url': apiBaseUrl || '',
                'x-model-name': modelName || ''
            }
        });
    },

    async getHistory() {
        return request.get('/training/history');
    },

    async getSessionById(id: string) {
        return request.get(`/training/session/${id}`);
    }
};
