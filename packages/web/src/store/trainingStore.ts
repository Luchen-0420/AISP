import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { SoapState, ExamItem, DiagnosisData, TreatmentPlanData } from '../types/soap';

// 患者情绪/信任度模型
export type EmotionType = 'calm' | 'anxious' | 'frustrated' | 'relieved' | 'angry';

export interface PatientMood {
    emotion: EmotionType;
    trust: number;       // 0-100 信任度
    comfort: number;     // 0-100 舒适度
    lastChange: {
        dimension: 'trust' | 'comfort';
        delta: number;
        reason: string;
    } | null;
}

export interface TrainingState {
    // Session Info
    sessionId: string | null;
    caseId: string | null;
    startTime: number | null;

    // Status
    status: 'idle' | 'running' | 'paused' | 'completed';
    currentStage: 'S' | 'O' | 'A' | 'P';

    // Clinical Data
    soapData: SoapState;
    currentVariant: any | null; // Added to store fetched variant details

    // Patient Mood (Emotion/Trust)
    patientMood: PatientMood;

    // Metrics
    turnCount: number;
    scores: {
        history: number;
        relevance: number;
        logic: number;
        empathy: number;
        safety: number;
        plan: number;
    };

    // Actions
    startSession: (caseId: string) => void;
    endSession: () => void;
    setVariant: (variant: any) => void; // New action
    incrementTurn: () => void;
    updateScore: (dimension: string, value: number) => void;
    setStage: (stage: 'S' | 'O' | 'A' | 'P') => void;
    updateMood: (mood: Partial<PatientMood>) => void; // New action

    // SOAP Actions
    addExam: (exam: ExamItem) => void;
    updateDiagnosis: (data: Partial<DiagnosisData>) => void;
    updatePlan: (data: Partial<TreatmentPlanData>) => void;
    addMedication: (med: { name: string; dosage: string; frequency: string }) => void;
    removeMedication: (index: number) => void;

    // Chat
    messages: import('../types/soap').Message[]; // or just Message[] if imported
    addMessage: (msg: import('../types/soap').Message) => void;
}

const initialSoapData: SoapState = {
    exams: [],
    diagnosis: { primary: '', differentials: [], rationale: '' },
    plan: { medications: [], lifestyle: [], followUp: '', education: '' }
};

const initialMood: PatientMood = {
    emotion: 'calm',
    trust: 60,
    comfort: 60,
    lastChange: null
};

export const useTrainingStore = create<TrainingState>()(
    devtools(
        (set) => ({
            sessionId: null,
            caseId: null,
            startTime: null,
            status: 'idle',
            currentStage: 'S',
            turnCount: 0,
            soapData: initialSoapData,
            currentVariant: null, // Initial state
            patientMood: initialMood, // Initial mood
            scores: {
                history: 0,
                relevance: 0,
                logic: 0,
                empathy: 0,
                safety: 0,
                plan: 0,
            },

            startSession: (caseId) => set({
                sessionId: crypto.randomUUID(),
                caseId,
                startTime: Date.now(),
                status: 'running',
                currentStage: 'S',
                turnCount: 0,
                soapData: initialSoapData,
                currentVariant: null, // Reset on new session, page will fetch again
                patientMood: initialMood, // Reset mood on new session
                scores: { history: 0, relevance: 0, logic: 0, empathy: 0, safety: 0, plan: 0 }
            }),

            endSession: () => set({ status: 'completed' }),

            setVariant: (variant) => set({ currentVariant: variant }),

            incrementTurn: () => set((state) => ({ turnCount: state.turnCount + 1 })),

            updateScore: (dimension, value) => set((state) => ({
                scores: { ...state.scores, [dimension]: value }
            })),

            setStage: (stage) => set({ currentStage: stage }),

            updateMood: (moodUpdate) => set((state) => ({
                patientMood: { ...state.patientMood, ...moodUpdate }
            })),

            addExam: (exam) => set((state) => ({
                soapData: { ...state.soapData, exams: [...state.soapData.exams, exam] }
            })),

            updateDiagnosis: (data) => set((state) => ({
                soapData: { ...state.soapData, diagnosis: { ...state.soapData.diagnosis, ...data } }
            })),

            updatePlan: (data) => set((state) => ({
                soapData: { ...state.soapData, plan: { ...state.soapData.plan, ...data } }
            })),

            addMedication: (med) => set((state) => ({
                soapData: {
                    ...state.soapData,
                    plan: {
                        ...state.soapData.plan,
                        medications: [...state.soapData.plan.medications, med]
                    }
                }
            })),

            removeMedication: (index) => set((state) => ({
                soapData: {
                    ...state.soapData,
                    plan: {
                        ...state.soapData.plan,
                        medications: state.soapData.plan.medications.filter((_, i) => i !== index)
                    }
                }
            })),

            // Chat Actions
            messages: [
                { id: '1', role: 'system', content: '训练开始，患者已进入诊室', timestamp: Date.now() },
                { id: '2', role: 'patient', content: '医生您好...', timestamp: Date.now() }
            ],
            addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
        }),
        { name: 'training-store' }
    )
);
