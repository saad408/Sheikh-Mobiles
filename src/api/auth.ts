import { getApiBaseUrl } from '@/lib/api';
import type { LoginRequest, LoginResponse, MeResponse } from '@/types/admin';
import type { ApiErrorResponse } from '@/types/admin';

const base = () => getApiBaseUrl();

function getAuthHeaders(token: string | null): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    accept: 'application/json',
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/** Admin login. Throws with backend error message on 400/401. */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${base()}/api/auth/login`, {
    method: 'POST',
    headers: getAuthHeaders(null),
    body: JSON.stringify({ email, password } as LoginRequest),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as ApiErrorResponse)?.error ?? 'Login failed';
    throw new Error(msg);
  }
  return data as LoginResponse;
}

/** Validate token and get current admin. Throws on 401 or other error. */
export async function getMe(token: string): Promise<MeResponse> {
  const res = await fetch(`${base()}/api/auth/me`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) throw new Error('Unauthorized');
  if (!res.ok) throw new Error((data as ApiErrorResponse)?.error ?? 'Request failed');
  return data as MeResponse;
}
