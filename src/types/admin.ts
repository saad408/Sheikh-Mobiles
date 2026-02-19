/** Admin panel types — align with backend API */

export interface Admin {
  id: string;
  email: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: true;
  token: string;
  expiresIn: string;
  admin: Admin;
}

export interface AuthErrorResponse {
  success: false;
  error: string;
}

export interface MeResponse {
  success: true;
  admin: Admin;
}

export interface ProductSpecs {
  processor: string;
  camera: string;
  battery: string;
  display: string;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface StockByColorItem {
  color: string;
  quantity: number;
}

export interface StockByVariationItem {
  color: string;
  storage: string;
  quantity: number;
}

export interface PriceByVariationItem {
  color: string;
  storage: string;
  price: number;
}

/** Admin form row: color, storage, quantity, and price (PKR) per variation */
export interface VariationRowItem extends StockByVariationItem {
  price: number;
}

/** Single variation table row: color name, hex, storage, quantity, price */
export interface VariationRowWithColor extends VariationRowItem {
  hex: string;
}

export interface ProductCreateInput {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  colors?: ProductColor[];
  sizes?: string[];
  specs?: Partial<ProductSpecs>;
  stockByColor?: StockByColorItem[];
  stockByVariation?: StockByVariationItem[];
  pricesByVariation?: PriceByVariationItem[];
}

export interface ProductUpdateInput {
  name?: string;
  price?: number;
  image?: string;
  category?: string;
  description?: string;
  colors?: ProductColor[];
  sizes?: string[];
  specs?: Partial<ProductSpecs>;
  stockByColor?: StockByColorItem[];
  stockByVariation?: StockByVariationItem[];
  pricesByVariation?: PriceByVariationItem[];
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: string[];
}

/** Categories (filter chips, product category) */
export interface Category {
  id: string;
  name: string;
  slug: string;
  order: number;
}

export interface CategoryCreateInput {
  name: string;
  slug?: string;
  order?: number;
}

export interface CategoryUpdateInput {
  name?: string;
  slug?: string;
  order?: number;
}
