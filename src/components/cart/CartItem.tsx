import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { getProductImageUrl } from '@/lib/api';
import { CartItem as CartItemType, useCartStore, getCartLineId } from '@/store/cartStore';

interface CartItemProps {
  item: CartItemType;
}

function getMaxQuantity(item: CartItemType): number | undefined {
  const byColor = item.variationsByColor ?? {};
  const colorKey = item.selectedColor ?? '';
  const perColorList = byColor[colorKey] ?? byColor[''];
  if (perColorList?.length && item.selectedSize != null) {
    const v = perColorList.find((s) => s.storage === item.selectedSize);
    if (v != null) return Math.max(1, v.quantity);
  }
  const byVariation = item.stockByVariation ?? [];
  if (byVariation.length > 0 && item.selectedSize != null) {
    const v = byVariation.find(
      (s) => s.color === (item.selectedColor ?? '') && s.storage === item.selectedSize
    );
    const q = v?.quantity;
    return q != null ? Math.max(1, q) : undefined;
  }
  const stock = item.stockByColor ?? [];
  if (!stock.length) return undefined;
  const forColor = item.selectedColor
    ? stock.find((s) => s.color === item.selectedColor)?.quantity
    : item.colors?.length
      ? undefined
      : stock.find((s) => s.color === '')?.quantity ?? stock[0]?.quantity;
  return forColor != null ? Math.max(1, forColor) : undefined;
}

export const CartItem = ({ item }: CartItemProps) => {
  const { updateQuantity, removeItem } = useCartStore();
  const lineId = getCartLineId(item);
  const maxQty = getMaxQuantity(item);
  const atMax = maxQty != null && item.quantity >= maxQty;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, height: 0 }}
      className="flex gap-4 py-4 border-b border-border"
    >
      <div className="w-20 h-20 bg-gradient-to-br from-muted to-secondary rounded-xl overflow-hidden flex-shrink-0 p-2">
        <img
          src={getProductImageUrl(item.image)}
          alt={item.name}
          className="w-full h-full object-contain"
        />
      </div>
      
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <p className="text-[10px] text-primary font-bold uppercase tracking-wider">
            {item.category}
          </p>
          <h3 className="font-display text-sm font-semibold mt-0.5 line-clamp-1">{item.name}</h3>
          {(item.selectedColor || item.selectedSize) && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {[item.selectedColor, item.selectedSize].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 bg-secondary rounded-full px-1 py-1">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => updateQuantity(lineId, item.quantity - 1)}
                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
              >
                <Minus className="w-3 h-3" />
              </motion.button>
              <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() =>
                  updateQuantity(lineId, maxQty != null ? Math.min(item.quantity + 1, maxQty) : item.quantity + 1)
                }
                disabled={atMax}
                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-3 h-3" />
              </motion.button>
            </div>
            {maxQty != null && (
              <span className="text-[10px] text-muted-foreground">Max {maxQty} in stock</span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold">
              Rs. {(item.price * item.quantity).toLocaleString()}
            </span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => removeItem(lineId)}
              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
