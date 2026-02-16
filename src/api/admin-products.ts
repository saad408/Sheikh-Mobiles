import { post, put, request } from '@/lib/api';
import type { Product } from '@/store/cartStore';
import type { ProductCreateInput, ProductUpdateInput } from '@/types/admin';

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function createProduct(
  token: string,
  input: ProductCreateInput
): Promise<Product> {
  return post<Product>('/api/products', input, { headers: authHeaders(token) });
}

export async function updateProduct(
  token: string,
  id: string,
  input: ProductUpdateInput
): Promise<Product> {
  return put<Product>(`/api/products/${encodeURIComponent(id)}`, input, {
    headers: authHeaders(token),
  });
}

export async function deleteProduct(token: string, id: string): Promise<void> {
  await request<{ success: true; message: string }>(
    `/api/products/${encodeURIComponent(id)}`,
    { method: 'DELETE', headers: authHeaders(token) }
  );
}
