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

/** Per-color storage options and quantity. Key = color name. */
export interface VariationByColorItem {
  storage: string;
  quantity: number;
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
  /** Storage options per color. Prefer this for storage selector when present. */
  variationsByColor?: Record<string, VariationByColorItem[]>;
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
  addItem: (product: Product, quantity?: number, size?: string, color?: string) => void;
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
      
      addItem: (product, quantity = 1, size, color) => {
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
          
          return {
            items: [...state.items, { ...product, quantity, selectedSize: size, selectedColor: color }],
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
