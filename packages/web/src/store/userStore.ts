import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
    token: string | null;
    userInfo: {
        id: number;
        username: string;
        role?: 'student' | 'teacher' | 'admin';
        [key: string]: any;
    } | null;
    setAuth: (token: string, userInfo: any) => void;
    logout: () => void;
    apiKey: string,
    apiBaseUrl: string,
    modelName: string,
    setSettings: (key: string, url: string, model: string) => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            token: null,
            userInfo: null,
            apiKey: '',
            apiBaseUrl: '',
            modelName: '',
            setAuth: (token, userInfo) => set({ token, userInfo }),
            logout: () => set({ token: null, userInfo: null }),
            setSettings: (apiKey, apiBaseUrl, modelName) => set({ apiKey, apiBaseUrl, modelName }),
        }),
        { name: 'user-storage' }
    )
);
