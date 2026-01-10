export interface User {
    id: number;
    username: string;
    email: string;
    role: 'user' | 'admin';
    avatar_url?: string;
    created_at: string;
    updated_at: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    role: 'user' | 'admin'; // ← Добавьте это поле
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}