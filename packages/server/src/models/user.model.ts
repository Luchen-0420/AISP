export interface User {
    id: number;
    username: string;
    email?: string;
    password?: string;
    role?: 'student' | 'teacher' | 'admin';
    created_at?: Date;
}
