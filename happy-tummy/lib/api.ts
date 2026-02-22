import { getAccessToken } from '@/lib/session';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';
const API_ROOT = `${API_BASE_URL}/api`;

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_ROOT}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = 'Request failed';
    try {
      const data = (await response.json()) as { detail?: unknown };
      if (typeof data?.detail === 'string') {
        message = data.detail;
      } else if (Array.isArray(data?.detail)) {
        message = data.detail.map((e: any) => e.msg ?? JSON.stringify(e)).join(', ');
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export type TokenResponse = { access_token: string; token_type: string };
export type UserResponse = { id: number; username: string; first_name: string };
export type ChildResponse = {
  user_key: number;
  use_id: number | null;
  name: string | null;
  age: number | null;
  gender: string | null;
  weight: number | null;
  allergies: number | null;
  early_born: number | null;
  delivery_method: number | null;
  envi_change: number | null;
};

export async function registerUser(payload: {
  first_name: string;
  username: string;
  password: string;
}) {
  return request<UserResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload: { username: string; password: string }) {
  return request<TokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getMe() {
  return request<UserResponse>('/auth/me');
}

export async function listChildren() {
  return request<ChildResponse[]>('/children');
}

export async function createChild(payload: {
  use_id?: number | null;
  name: string;
  age?: number | null;
  gender?: string | null;
  weight?: number | null;
  allergies?: number | null;
  early_born?: number | null;
  delivery_method?: number | null;
  envi_change?: number | null;
}) {
  return request<ChildResponse>('/children', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
