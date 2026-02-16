import { get, post, put, request } from '@/lib/api';
import type { Category, CategoryCreateInput, CategoryUpdateInput } from '@/types/admin';

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

/** List all categories (public). */
export async function getCategories(): Promise<Category[]> {
  const data = await get<Category[]>('/api/categories');
  return Array.isArray(data) ? data : [];
}

/** Get one category by ID (public). */
export async function getCategoryById(id: string): Promise<Category> {
  return get<Category>(`/api/categories/${encodeURIComponent(id)}`);
}

/** Create category (admin). */
export async function createCategory(
  token: string,
  input: CategoryCreateInput
): Promise<Category> {
  return post<Category>('/api/categories', input, { headers: authHeaders(token) });
}

/** Update category (admin). */
export async function updateCategory(
  token: string,
  id: string,
  input: CategoryUpdateInput
): Promise<Category> {
  return put<Category>(`/api/categories/${encodeURIComponent(id)}`, input, {
    headers: authHeaders(token),
  });
}

/** Delete category (admin). */
export async function deleteCategory(token: string, id: string): Promise<void> {
  await request<{ success: true; message: string }>(
    `/api/categories/${encodeURIComponent(id)}`,
    { method: 'DELETE', headers: authHeaders(token) }
  );
}
