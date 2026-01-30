export interface ExamItem {
    id: string;
    name: string;
    category: 'physical' | 'lab' | 'imaging';
    cost?: number; // Virtual cost
    result?: string; // The Result to show after "performance"
    status: 'pending' | 'completed';
}

export interface DiagnosisData {
    primary: string;
    differentials: string[]; // List of strings
    rationale: string;
}

export interface TreatmentPlanData {
    medications: { name: string; dosage: string; frequency: string }[];
    lifestyle: string[]; // e.g. ["Low Sodium Diet", "Exercise"]
    followUp: string;
    education: string;
}

export interface SoapState {
    exams: ExamItem[];
    diagnosis: DiagnosisData;
    plan: TreatmentPlanData;
}

export interface Message {
    id: string;
    role: 'doctor' | 'patient' | 'system';
    content: string;
    timestamp: number;
}
