import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { getProductImageUrl } from '@/lib/api';
import { CartItem as CartItemType, useCartStore } from '@/store/cartStore';

interface CartItemProps {
  item: CartItemType;
}

export const CartItem = ({ item }: CartItemProps) => {
  const { updateQuantity, removeItem } = useCartStore();

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
          {item.selectedColor && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {item.selectedColor}
            </p>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-secondary rounded-full px-1 py-1">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            >
              <Minus className="w-3 h-3" />
            </motion.button>
            <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            >
              <Plus className="w-3 h-3" />
            </motion.button>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold">
              ${(item.price * item.quantity).toLocaleString()}
            </span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => removeItem(item.id)}
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
