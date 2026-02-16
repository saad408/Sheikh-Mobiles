import { get } from '@/lib/api';
import type { Product, ProductColor, ProductSpecs } from '@/store/cartStore';

const DEFAULT_SPECS: ProductSpecs = {
  processor: '',
  camera: '',
  battery: '',
  display: '',
};

function normalizeColors(colors: unknown): ProductColor[] {
  if (!Array.isArray(colors)) return [];
  return colors.map((c) => {
    if (c && typeof c === 'object' && 'name' in c && typeof (c as ProductColor).name === 'string') {
      return { name: (c as ProductColor).name, hex: typeof (c as ProductColor).hex === 'string' ? (c as ProductColor).hex : '' };
    }
    if (typeof c === 'string') return { name: c, hex: '' };
    return { name: '', hex: '' };
  }).filter((c) => c.name);
}

function normalizeSpecs(specs: unknown): ProductSpecs {
  if (!specs || typeof specs !== 'object') return DEFAULT_SPECS;
  const s = specs as Record<string, unknown>;
  return {
    processor: typeof s.processor === 'string' ? s.processor : '',
    camera: typeof s.camera === 'string' ? s.camera : '',
    battery: typeof s.battery === 'string' ? s.battery : '',
    display: typeof s.display === 'string' ? s.display : '',
  };
}

function normalizeProduct(raw: Product): Product {
  return {
    ...raw,
    colors: normalizeColors(raw.colors),
    specs: normalizeSpecs(raw.specs),
  };
}

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

export async function fetchProducts(params: ProductsParams = {}): Promise<ProductsResponse> {
  const res = await get<ProductsResponse>('/api/products', {
    id: params.id,
    category: params.category,
    search: params.search,
    q: params.q,
    page: params.page,
    limit: params.limit,
  });
  if (res.data?.length) {
    res.data = res.data.map((p) => normalizeProduct(p));
  }
  return res;
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
    if (data?.length && isProductLike(data[0])) return normalizeProduct(data[0]);
    return null;
  }

  // Wrapped single: { data: Product }
  if ('data' in res && isProductLike((res as { data: Product }).data)) {
    return normalizeProduct((res as { data: Product }).data);
  }

  // Single product at root
  if (isProductLike(res)) return normalizeProduct(res as Product);

  return null;
}
