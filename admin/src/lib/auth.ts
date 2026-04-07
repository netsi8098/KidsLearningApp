import { api, ApiError } from './api';

export interface AuthUser {
  userId: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'reviewer' | 'viewer';
}

interface LoginResponse {
  token: string;
  user: AuthUser;
}

const TOKEN_KEY = 'admin_token';
const USER_KEY = 'admin_user';

export function getStoredUser(): AuthUser | null {
  const stored = localStorage.getItem(USER_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as AuthUser;
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const data = await api.post<LoginResponse>('/auth/login', { email, password });
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return !!getStoredToken();
}

export { ApiError };
