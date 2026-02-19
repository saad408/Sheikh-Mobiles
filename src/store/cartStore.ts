import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

/** Per-color storage options: storage, quantity, and price (PKR). Key = color name. */
export interface VariationByColorItem {
  storage: string;
  quantity: number;
  price?: number;
}

export interface PriceByVariationItem {
  color: string;
  storage: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  sizes?: string[];
  colors?: ProductColor[];
  specs?: ProductSpecs;
  stockByColor?: StockByColorItem[];
  stockByVariation?: StockByVariationItem[];
  /** Storage options per color (includes price when present). Prefer for selector + price. */
  variationsByColor?: Record<string, VariationByColorItem[]>;
  /** Per (color, storage) price in PKR. Backend uses this for validation; frontend can use for fallback. */
  pricesByVariation?: PriceByVariationItem[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

/** Unique key per cart line (same product + color + size = same line). */
export function getCartLineId(item: CartItem): string {
  return `${item.id}|${item.selectedColor ?? ''}|${item.selectedSize ?? ''}`;
}

interface CartStore {
  items: CartItem[];
  /** variationPrice (PKR): when provided, used as item price instead of product.price (required for variation-based pricing). */
  addItem: (product: Product, quantity?: number, size?: string, color?: string, variationPrice?: number) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, quantity = 1, size, color, variationPrice) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.id === product.id && item.selectedSize === size && item.selectedColor === color
          );
          
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === product.id && item.selectedSize === size && item.selectedColor === color
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          
          const price = variationPrice != null ? variationPrice : product.price;
          return {
            items: [...state.items, { ...product, price, quantity, selectedSize: size, selectedColor: color }],
          };
        });
      },
      
      removeItem: (lineId) => {
        set((state) => ({
          items: state.items.filter((item) => getCartLineId(item) !== lineId),
        }));
      },
      
      updateQuantity: (lineId, quantity) => {
        set((state) => ({
          items: state.items
            .map((item) =>
              getCartLineId(item) === lineId ? { ...item, quantity: Math.max(0, quantity) } : item
            )
            .filter((item) => item.quantity > 0),
        }));
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
