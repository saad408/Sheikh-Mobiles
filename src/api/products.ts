import { get } from '@/lib/api';
import type { Product, ProductColor, ProductSpecs, StockByColorItem, StockByVariationItem, VariationByColorItem } from '@/store/cartStore';

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

function normalizeStockByColor(stock: unknown): StockByColorItem[] {
  if (!Array.isArray(stock)) return [];
  return stock
    .filter((s) => s && typeof s === 'object' && 'color' in s && 'quantity' in s)
    .map((s) => ({
      color: typeof (s as StockByColorItem).color === 'string' ? (s as StockByColorItem).color : '',
      quantity: typeof (s as StockByColorItem).quantity === 'number' ? (s as StockByColorItem).quantity : 0,
    }));
}

function normalizeStockByVariation(stock: unknown): StockByVariationItem[] {
  if (!Array.isArray(stock)) return [];
  return stock
    .filter((s) => s && typeof s === 'object' && 'color' in s && 'storage' in s && 'quantity' in s)
    .map((s) => ({
      color: typeof (s as StockByVariationItem).color === 'string' ? (s as StockByVariationItem).color : '',
      storage: typeof (s as StockByVariationItem).storage === 'string' ? (s as StockByVariationItem).storage : '',
      quantity: typeof (s as StockByVariationItem).quantity === 'number' ? (s as StockByVariationItem).quantity : 0,
    }));
}

function normalizeSizes(sizes: unknown): string[] {
  if (!Array.isArray(sizes)) return [];
  return sizes.map((s) => (typeof s === 'string' ? s : String(s))).filter(Boolean);
}

function normalizeVariationByColorItem(v: unknown): VariationByColorItem | null {
  if (!v || typeof v !== 'object' || !('storage' in v) || !('quantity' in v)) return null;
  const s = v as { storage: unknown; quantity: unknown };
  return {
    storage: typeof s.storage === 'string' ? s.storage : '',
    quantity: typeof s.quantity === 'number' ? s.quantity : 0,
  };
}

function normalizeVariationsByColor(
  variations: unknown,
  stockByVariation: StockByVariationItem[]
): Record<string, VariationByColorItem[]> {
  if (variations && typeof variations === 'object' && !Array.isArray(variations)) {
    const record = variations as Record<string, unknown>;
    const out: Record<string, VariationByColorItem[]> = {};
    for (const key of Object.keys(record)) {
      const arr = record[key];
      if (!Array.isArray(arr)) continue;
      const list = arr.map(normalizeVariationByColorItem).filter((x): x is VariationByColorItem => x != null);
      if (list.length) out[key] = list;
    }
    if (Object.keys(out).length > 0) return out;
  }
  if (stockByVariation.length > 0) {
    const byColor: Record<string, VariationByColorItem[]> = {};
    for (const v of stockByVariation) {
      const color = v.color ?? '';
      if (!byColor[color]) byColor[color] = [];
      byColor[color].push({ storage: v.storage, quantity: v.quantity });
    }
    return byColor;
  }
  return {};
}

function normalizeProduct(raw: Product): Product {
  const stockByVariation = normalizeStockByVariation(raw.stockByVariation);
  const variationsByColor = normalizeVariationsByColor(raw.variationsByColor, stockByVariation);
  return {
    ...raw,
    colors: normalizeColors(raw.colors),
    specs: normalizeSpecs(raw.specs),
    sizes: normalizeSizes(raw.sizes),
    stockByColor: normalizeStockByColor(raw.stockByColor),
    stockByVariation,
    variationsByColor: Object.keys(variationsByColor).length > 0 ? variationsByColor : undefined,
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
