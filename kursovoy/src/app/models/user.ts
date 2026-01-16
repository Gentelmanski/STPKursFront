export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  is_blocked: boolean;
  last_online: string;
}
export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    role: 'user' | 'admin';
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}
export interface AdminUser extends User {
  events_created: number;
  events_participated: number;
  comments_count: number;
}