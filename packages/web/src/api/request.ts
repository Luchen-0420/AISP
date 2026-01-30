import axios from 'axios';
import { useUserStore } from '../store/userStore';

const request = axios.create({
    baseURL: '/api',
    timeout: 60000, // Increased to 60s for AI generation
});

request.interceptors.request.use((config) => {
    const { token, apiKey, apiBaseUrl } = useUserStore.getState();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    if (apiKey) {
        config.headers['x-api-key'] = apiKey;
    }
    if (apiBaseUrl) {
        config.headers['x-base-url'] = apiBaseUrl;
    }
    const { modelName } = useUserStore.getState();
    if (modelName) {
        config.headers['x-model-name'] = modelName;
    }
    return config;
});

request.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            useUserStore.getState().logout();
            window.location.href = '/login';
        }
        return Promise.reject(error.response?.data || error.message);
    }
);

export default request;
