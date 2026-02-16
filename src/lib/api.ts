/**
 * Central API client for all backend requests.
 * Uses VITE_API_URL; falls back to http://localhost:3001.
 */

const DEFAULT_API_BASE = 'http://localhost:3001';

export const getApiBaseUrl = (): string => {
  const url = import.meta.env.VITE_API_URL;
  const resolved =
    typeof url === 'string' && url.trim() ? url.trim() : DEFAULT_API_BASE;
  return resolved.replace(/\/$/, '');
};

/** Resolve product image URL: use as-is if absolute, else prepend API base (for paths like /uploads/products/...). In dev we use relative path so Vite proxy serves images same-origin and avoids CORP block. */
export function getProductImageUrl(image: string | undefined): string {
  if (!image) return '';
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  if (image.startsWith('/') && import.meta.env.DEV) {
    return image;
  }
  const base = getApiBaseUrl();
  const origin = base || DEFAULT_API_BASE;
  return image.startsWith('/') ? origin + image : origin + '/' + image;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestConfig {
  method?: RequestMethod;
  body?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Call the backend API. Path should start with / (e.g. /api/products).
 * Query params can be passed as params; body is JSON-serialized for non-GET.
 */
export async function request<T>(path: string, config: RequestConfig = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, params } = config;
  const base = getApiBaseUrl();
  const url = new URL(path.startsWith('/') ? path : `/${path}`, base);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const init: RequestInit = {
    method,
    headers: {
      accept: 'application/json',
      ...(body != null && method !== 'GET' ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
  };

  if (body != null && method !== 'GET') {
    init.body = JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(url.toString(), init);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error';
    throw new ApiError(message, 0);
  }

  let data: unknown;
  const contentType = res.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      data = undefined;
    }
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const obj = data && typeof data === 'object' ? (data as Record<string, unknown>) : null;
    const message =
      (obj && typeof obj.error === 'string' && obj.error) ||
      (obj && typeof obj.message === 'string' && obj.message) ||
      (res.status === 500 ? `Server error (${res.status}). Check backend logs.` : `Request failed (${res.status})`);
    throw new ApiError(message, res.status, data);
  }

  return data as T;
}

/** GET request with optional query params */
export function get<T>(path: string, params?: RequestConfig['params']): Promise<T> {
  return request<T>(path, { method: 'GET', params });
}

/** POST request with JSON body */
export function post<T>(path: string, body: unknown, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
  return request<T>(path, { ...config, method: 'POST', body });
}

/** PUT request with JSON body */
export function put<T>(path: string, body: unknown, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
  return request<T>(path, { ...config, method: 'PUT', body });
}

/** PATCH request with JSON body */
export function patch<T>(path: string, body: unknown, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
  return request<T>(path, { ...config, method: 'PATCH', body });
}

/** DELETE request */
export function del<T>(path: string, params?: RequestConfig['params']): Promise<T> {
  return request<T>(path, { method: 'DELETE', params });
}
