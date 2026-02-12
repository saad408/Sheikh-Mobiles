import { get } from '@/lib/api';
import type { Product } from '@/store/cartStore';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  recordsOnPage: number;
  hasNext: boolean;
  hasPrev: boolean;
  summary: string;
}

export interface ProductsResponse {
  data: Product[];
  pagination: PaginationMeta;
}

export interface ProductsParams {
  id?: string;
  category?: string;
  search?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export function fetchProducts(params: ProductsParams = {}): Promise<ProductsResponse> {
  return get<ProductsResponse>('/api/products', {
    id: params.id,
    category: params.category,
    search: params.search,
    q: params.q,
    page: params.page,
    limit: params.limit,
  });
}

function isProductLike(obj: unknown): obj is Product {
  return (
    obj != null &&
    typeof obj === 'object' &&
    'id' in obj &&
    'name' in obj &&
    'price' in obj
  );
}

/** Get a single product by id (uses GET /api/products?id=...) */
export async function fetchProductById(id: string): Promise<Product | null> {
  const res = await get<ProductsResponse | Product | { data: Product }>('/api/products', {
    id,
    limit: 1,
  });

  if (!res || typeof res !== 'object') return null;

  // List shape: { data: Product[], pagination }
  if ('data' in res && Array.isArray((res as ProductsResponse).data)) {
    const { data } = res as ProductsResponse;
    if (data?.length && isProductLike(data[0])) return data[0];
    return null;
  }

  // Wrapped single: { data: Product }
  if ('data' in res && isProductLike((res as { data: Product }).data)) {
    return (res as { data: Product }).data;
  }

  // Single product at root
  if (isProductLike(res)) return res as Product;

  return null;
}
